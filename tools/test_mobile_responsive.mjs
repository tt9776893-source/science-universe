// Real live-entry browser tests. Disposable profile; never opens the user's browser data.
// Run: node tools/test_mobile_responsive.mjs (no dependencies required, Node 22+).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'su-auth-mobile-'));
const exe = process.env.CHROME_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const browser = spawn(exe, ['--headless=new', '--enable-unsafe-swiftshader', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let ws, seq = 0;
const pending = new Map(), errors = [], consoleErrors = [];
try {
  const endpoint = await new Promise((resolve, reject) => {
    let text = ''; const timer = setTimeout(() => reject(Error('Browser startup timeout: ' + text)), 15000);
    browser.stderr.on('data', d => { text += d; const m = text.match(/DevTools listening on (ws:\/\/[^\r\n]+)/); if (m) { clearTimeout(timer); resolve(m[1]); } });
    browser.on('error', reject);
  });
  const pages = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.reject(Error(JSON.stringify(m.error))); else p.resolve(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') consoleErrors.push(m.params.entry.text);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const wait = async expression => { for (let i = 0; i < 180; i++) { if (await evaluate(expression)) return; await sleep(500); } throw Error('Timed out: ' + expression); };
  const check = (v, label) => { assert.ok(v, label); console.log('PASS', label); };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'});true`);
    await sleep(150);
    const r = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(500);
  };
  const state = () => evaluate(`(()=>{const css=id=>getComputedStyle(document.getElementById(id)).display;return {url:location.href,title:document.title,phone:document.getElementById('phone')?.className,auth:!!window.suAuth,splash:css('splash'),lab:css('lab'),sheet:css('sheet'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth}})()`);
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.navigate', { url: process.env.SU_TEST_URL || 'http://127.0.0.1:5501/www/index.html' });
  await wait('!!window.suAuth && !!window.SU_NAV && document.readyState === "complete"');
  console.log('INITIAL', await state());
  if (process.env.SU_AUDIT) {
    await click('#start'); console.log('AFTER START', await state());
    console.log('ERRORS', JSON.stringify(errors), 'CONSOLE', JSON.stringify(consoleErrors));
  } else {
    check((await state()).sheet !== 'none' && (await state()).lab === 'none', 'Fresh profile sees existing login/registration, not MAIN LAB');
    for (const [width, height] of [[360,640],[390,844],[430,932],[768,1024],[1366,768],[844,390],[360,340]]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 900 });
      await sleep(250);
      for (const tab of ['#tab-up', '#tab-in']) {
        await click(tab);
        const bounds = await evaluate(`(()=>{const s=document.querySelector('#sheet'),r=s.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,w:innerWidth,h:innerHeight,scroll:document.documentElement.scrollWidth,sw:s.scrollWidth,cw:s.clientWidth}})()`);
        check(bounds.x >= -1 && bounds.right <= bounds.w + 1 && bounds.y >= -1 && bounds.bottom <= bounds.h + 1 && bounds.scroll <= bounds.w && bounds.sw <= bounds.cw + 1, `${tab} fits ${width}x${height}, including keyboard-height viewport`);
      }
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    // Register through the real existing form and demo verification flow.
    await click('#tab-up');
    await evaluate(`document.querySelector('#f-mail').value='mobile-a@example.test';document.querySelector('#f-pass').value='MobileTest2026!';document.querySelector('#f-pass2').value='MobileTest2026!';document.querySelector('#remember').checked=true;document.querySelector('#form').requestSubmit();true`);
    await wait("document.querySelector('#sheet').classList.contains('verifying')");
    await evaluate(`document.querySelector('#f-code').value=document.querySelector('#demo span').textContent;document.querySelector('#form').requestSubmit();true`);
    await wait("!!window.suAuth.getCurrentUser()");
    check((await state()).splash !== 'none' && (await state()).lab === 'none', 'Registration returns to original Start screen');
    await click('#start'); check((await state()).lab !== 'none', 'Start opens MAIN LAB');
    await evaluate(`window.suAuth.updateCurrentUser({credits:137,lifetimeCredits:240,unlockedSections:{spacelab:true},achievements:['test-sentinel'],progress:{test:7}});true`);
    const record = await evaluate("JSON.stringify(window.suAuth.getCurrentUser())");
    for (const width of [360,390,430,768,1366]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width > 900 ? 768 : 844, deviceScaleFactor: 1, mobile: width < 900 }); await sleep(200);
      check(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `MAIN LAB no horizontal scrolling at ${width}`);
      check(await evaluate("(()=>{const r=document.querySelector('#enterW').getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight})()"), `Орох visible at ${width}`);
    }
    await send('Page.reload'); await wait('!!window.suAuth && document.readyState === "complete"');
    check(await evaluate("window.suAuth.getCurrentMail()==='mobile-a@example.test'"), 'Valid persistent session automatically restored');
    check((await state()).lab !== 'none', 'Returning valid session enters MAIN LAB');
    check(await evaluate('JSON.stringify(window.suAuth.getCurrentUser())') === record, 'Reload preserves complete user record');
    await send('Emulation.setDeviceMetricsOverride', { width:390,height:844,deviceScaleFactor:1,mobile:true });
    await click('#nextW'); await click('#prevW'); await click('#enterW');
    check(await evaluate("!!window.SU_NAV.getActiveLab()"), 'MAIN LAB selection and Орох open actual lab');
    await evaluate('window.suCloseAllOverlays();true');
    await click('#logout'); await click('#prLogoutBtn');
    check(await evaluate("!!window.suAuth.getCurrentUser() && document.querySelector('#suLogoutConfirmModal').classList.contains('open')"), 'Logout waits for confirmation, does not run duplicate immediate handler');
    await click('#suLogoutCancel');
    check(await evaluate('!!window.suAuth.getCurrentUser()'), 'Cancel logout keeps current session');
    await click('#prLogoutBtn'); await click('#suLogoutConfirm');
    check((await state()).sheet !== 'none' && (await state()).lab === 'none', 'Confirmed logout returns to login');
    check(await evaluate("JSON.stringify(window.suAuth.getUsers()['mobile-a@example.test'])") === record, 'Logout preserves account, credits, progress, achievements, unlocks');
    await evaluate(`document.querySelector('#f-mail').value='mobile-a@example.test';document.querySelector('#f-pass').value='WrongPassword!';document.querySelector('#form').requestSubmit();true`);
    await sleep(750); check(await evaluate('!window.suAuth.getCurrentUser()'), 'Wrong password rejected');
    await evaluate(`document.querySelector('#f-pass').value='MobileTest2026!';document.querySelector('#remember').checked=false;document.querySelector('#form').requestSubmit();true`);
    await wait('!!window.suAuth.getCurrentUser()');
    check(await evaluate("sessionStorage.getItem('rf_session') && !localStorage.getItem('rf_session')"), 'Non-remembered login uses sessionStorage only');
    check((await state()).splash !== 'none' && (await state()).lab === 'none', 'Interactive login restores Start, not automatic MAIN LAB');
    await click('#start');
    await send('Page.reload'); await wait('!!window.suAuth && document.readyState === "complete"');
    check(await evaluate("window.suAuth.getCurrentMail()==='mobile-a@example.test' && !localStorage.getItem('rf_session')"), 'Session-only login survives reload without becoming persistent');
    await click('#logout'); await click('[data-propen="switch"]'); await click('#suSwitchConfirm');
    check(await evaluate('!window.suAuth.getCurrentUser() && !localStorage.getItem("rf_session") && !sessionStorage.getItem("rf_session")'), 'Account switching ends old session');
    await click('#back'); check((await state()).lab === 'none', 'Cancel account switching cannot expose previous MAIN LAB');
    await click('#start'); await click('#tab-up');
    await evaluate(`document.querySelector('#f-mail').value='mobile-b@example.test';document.querySelector('#f-pass').value='OtherTest2026!';document.querySelector('#f-pass2').value='OtherTest2026!';document.querySelector('#remember').checked=true;document.querySelector('#form').requestSubmit();true`);
    await wait("document.querySelector('#sheet').classList.contains('verifying')");
    await evaluate(`document.querySelector('#f-code').value=document.querySelector('#demo span').textContent;document.querySelector('#form').requestSubmit();true`);
    await wait("window.suAuth.getCurrentMail()==='mobile-b@example.test'");
    check(await evaluate('JSON.stringify(window.suAuth.getUsers()["mobile-a@example.test"])') === record, 'Second account registration leaves first account unchanged');
    await click('#start'); await click('#logout'); await click('[data-propen="switch"]'); await click('#suSwitchConfirm');
    await evaluate(`document.querySelector('#f-mail').value='mobile-a@example.test';document.querySelector('#f-pass').value='MobileTest2026!';document.querySelector('#form').requestSubmit();true`);
    await wait("window.suAuth.getCurrentMail()==='mobile-a@example.test'");
    check(await evaluate('JSON.stringify(window.suAuth.getCurrentUser())') === record, 'Switching back restores first account and its full progress');
    await evaluate("window.logout();localStorage.setItem('rf_session',JSON.stringify('missing@example.test'));true");
    await send('Page.reload'); await wait('!!window.suAuth && document.readyState === "complete"');
    check((await state()).lab === 'none' && (await state()).sheet !== 'none', 'Stale session does not bypass login');
    check(await evaluate("JSON.stringify(window.suAuth.getUsers()['mobile-a@example.test'])") === record, 'All authentication transitions leave original account record intact');
    await evaluate(`const users=window.suAuth.getUsers();users['unverified@example.test']={...users['mobile-a@example.test'],emailVerified:false};window.suAuth.saveUsers(users);localStorage.setItem('rf_session',JSON.stringify('unverified@example.test'));true`);
    await send('Page.reload'); await wait('!!window.suAuth && document.readyState === "complete"');
    check((await state()).lab === 'none' && (await state()).sheet !== 'none', 'Explicitly unverified account cannot restore a session');
    check(errors.length === 0, 'No uncaught JavaScript errors');
    check(consoleErrors.length === 0, 'No browser Console error entries');
  }
} finally {
  ws?.close(); browser.kill();
  await sleep(1000);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
