// Disposable Chromium profile; never connects to the owner's browser or storage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, MARKER, PREFIX, compileIndex, compileExplore, createAccessServer } from '../tools/developer-access.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (value, label) => { assert.ok(value, label); console.log('PASS', label); };
const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
check(compileIndex(source) === source, 'production index is byte-for-byte unchanged');
check(!compileIndex(source).includes('suDeveloperTools') && !compileIndex(source).includes('suDeveloperExplore'), 'production index contains no developer UI');
check(compileIndex(source, true).includes(MARKER), 'development compile flag emits private capability');
check(!compileExplore('const x = globalThis.localStorage;').includes(MARKER), 'production modules unchanged');
for (const base of ['www', 'android/app/src/main/assets/public']) {
  let contaminated = [];
  function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if(e.isDirectory()) scan(f);
      else if (/\.(html|m?js)$/.test(f) && fs.readFileSync(f, 'utf8').includes(MARKER)) contaminated.push(f);
    }
  }
  scan(path.join(ROOT, base));
  check(!contaminated.length, `${base}: no development bypass in packaged assets`);
}
const servers = [createAccessServer({development:true}), createAccessServer()];
for(const s of servers) await new Promise(r=>s.listen(0,'127.0.0.1',r));
const [dev,prod] = servers.map(s=>`http://127.0.0.1:${s.address().port}`);
check((await fetch(prod+'/__su_dev_storage__.js')).status === 404, 'no production development-storage route');
check((await fetch(prod+'/tools/developer-access.mjs')).status === 404, 'compiler is not an app route');
check(!(await (await fetch(prod+'/?development=1#explore')).text()).includes(MARKER), 'URL cannot enable production bypass');
const profile = fs.mkdtempSync(path.join(os.tmpdir(),'su-developer-access-'));
const exe = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert.ok(exe, 'Chromium required');
const browser = spawn(exe,['--headless=new','--enable-unsafe-swiftshader','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws,seq=0; const pending=new Map(),errors=[],consoleErrors=[];
try {
  const endpoint=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('Browser startup timeout')),20000);browser.stderr.on('data',d=>{text+=d;const m=text.match(/DevTools listening on (ws:\/\/[^\r\n]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});browser.on('error',reject);});
  const pages=await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);else if(m.method==='Runtime.consoleAPICalled' && m.params.type==='error')consoleErrors.push(m.params.args.map(a=>a.value||a.description).join(' '));};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=async(expression,label)=>{for(let n=0;n<120;n++){if(await ev(expression))return;await sleep(500);}throw Error('Timeout: '+label);};
  const navigate=async url=>{await send('Page.navigate',{url});await wait('!!window.SU','router');await sleep(700);};
  const seed=async credits=>{
    await ev(`localStorage.clear();localStorage.setItem('rf_users',JSON.stringify({'developer@example.test':{name:'Disposable Developer',credits:${credits},lifetimeCredits:${credits},achievements:['sentinel']}}));localStorage.setItem('rf_session',JSON.stringify('developer@example.test'));true`);
    await send('Page.reload');await sleep(1500);await wait("window.curMail === 'developer@example.test'",'restored test authentication');
  };
  const viewport = async (width, height) => { await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false}); await sleep(300); };
  const screenshot = async name => {
    const result = await send('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync(path.join(ROOT, name), Buffer.from(result.data, 'base64'));
  };
  const clickVisible = async selector => {
    const point = await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)})||document.getElementById('suHostExplore')?.shadowRoot?.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,visible:r.width>0&&r.height>0&&!el.hidden&&el.contains(el.getRootNode().elementFromPoint(x,y))};})()`);
    check(point.visible, 'unobstructed pointer target: '+selector);
    await send('Input.dispatchMouseEvent', {type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent', {type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
    await sleep(100);
  };
  const openDeveloperPanel = async () => {
    await ev("openProfile();true");
    if (!await ev("document.getElementById('suDeveloperTools').open")) await clickVisible('#suDeveloperTools summary');
  };
  const launchDeveloper = async () => { await openDeveloperPanel(); await clickVisible('#suDeveloperExplore'); };
  const mainGeometry = () => ev(`JSON.stringify(['#phone','.su-desk-dashboard-grid','.su-desk-center','#phone nav.nav','.su-desk-bottom'].map(selector=>{const el=document.querySelector(selector);if(!el)return {selector};const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {selector,x:r.x,y:r.y,width:r.width,height:r.height,font:s.font,color:s.color,background:s.backgroundColor,position:s.position};}))`);
  const devGeometry = new Map();
  await send('Runtime.enable');
  await viewport(1440,900);
  await navigate(dev);
  check(await ev("document.getElementById('suDeveloperExplore').hidden"),'test button unavailable before normal lab/auth entry');
  await seed(0);
  await ev("localStorage.setItem('SCIENCE_UNIVERSE_FRONTIER_SAVE_V3','NORMAL_SAVE_SENTINEL');localStorage.setItem('MARS_VOXEL_EDITS_V3','NORMAL_TERRAIN_SENTINEL');localStorage.setItem('SU_ACTIVE_SAVE_SLOT','slot_3');globalThis.before=JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));true");
  check(await ev("!SU.isSectionUnlocked('explore') && !document.getElementById('suDeveloperExplore').hidden"),'zero-credit account remains locked; developer button available after authentication');
  for (const [width,height] of [[1440,900],[390,844]]) {
    await viewport(width,height);
    check(await ev("document.getElementById('suDeveloperExplore').getClientRects().length===0 && !document.querySelector('body > #suDeveloperExplore')"), 'MAIN LAB has no rendered developer overlay at width '+width);
    devGeometry.set(width, await mainGeometry());
    await screenshot('developer-ui-home-'+width+'.png');
    await openDeveloperPanel();
    check(await ev("(()=>{const panel=document.getElementById('suDeveloperTools'),button=document.getElementById('suDeveloperExplore'),r=panel.getBoundingClientRect(),b=button.getBoundingClientRect(),previous=panel.previousElementSibling.getBoundingClientRect();return getComputedStyle(panel).position==='static'&&getComputedStyle(button).position==='static'&&r.top>=previous.bottom&&b.width<=r.width&&b.height<=60;})()"), 'compact developer section follows existing profile controls without overlap at width '+width);
    await screenshot('developer-ui-profile-'+width+'.png');
    await ev("document.getElementById('suDeveloperTools').open=false;closeProfile();true");
  }
  await viewport(1440,900);
  await launchDeveloper();
  check(await ev("document.getElementById('suDeveloperTools').hidden && document.getElementById('suDeveloperExplore').getClientRects().length===0 && !document.getElementById('suProfile').classList.contains('open')"), 'developer panel and Profile close immediately on gameplay entry');
  await wait("import('./sections/explore/ctx.js').then(c=>{globalThis.g=c.window.game;return !!g?.isLoaded && !!g.terrain?.marsDem})",'actual game and terrain loaded');
  check(await ev("SU.state.current==='explore' && !!g.renderer.domElement && !document.querySelector('#suHostExplore .su-error')"),'real Explore game bootstraps through existing router');
  check(await ev("g.saveSystem.activeSlotId==='slot_1' && !g.saveSystem.hasSave()"),'normal slot selection and legacy saves are not imported');
  await clickVisible('#btn-menu-surface');
  check(await ev("!g.isPaused && getComputedStyle(document.getElementById('suHostExplore').shadowRoot.querySelector('#start-prompt')).display==='none' && document.getElementById('suDeveloperExplore').getClientRects().length===0"), 'active surface gameplay starts without developer overlay');
  const saved=await ev(`(()=>{const s=g.saveSystem;s.setActiveSlot('slot_2');g.player.position.x=42;const result=s.save();g.player.position.x=99;const loaded=s.load();return {saved:result.success,loaded:loaded.success,x:g.player.position.x};})()`);
  check(saved.saved && saved.loaded && saved.x===42, 'real save/load round trip uses developer storage');
  check(await ev(`localStorage.getItem(${JSON.stringify(PREFIX+'SCIENCE_UNIVERSE_FRONTIER_SAVE_V3_slot_2')})!==null && localStorage.getItem(${JSON.stringify(PREFIX+'SU_ACTIVE_SAVE_SLOT')})==='slot_2'`),'test save and active slot are namespaced');
  await ev("g.researchJournal._save();g.academy._save(g.academy.getState());g.terrain.flushEditsToStorage();true");
  check(await ev(`['SU_RESEARCH_JOURNAL_V1_slot_2','SU_SCIENCE_ACADEMY_V1_slot_2',g.terrain.getStorageKeyForSlot('slot_2')].every(k=>localStorage.getItem(${JSON.stringify(PREFIX)}+k)!==null)`),'journal, academy and terrain persistence are isolated too');
  check(await ev("document.getElementById('suDeveloperTools').hidden && document.getElementById('suDeveloperExplore').getClientRects().length===0"), 'no developer controls rendered during active Deep Space gameplay');
  await screenshot('developer-ui-gameplay.png');
  await ev("document.exitPointerLock();true");
  check(await ev(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>!k.startsWith(${JSON.stringify(PREFIX)})).sort().map(k=>[k,localStorage.getItem(k)])))===before`),'all normal profile, credits, achievements, unlocks and saves unchanged');
  await ev("SU.open('home');true");await sleep(500);
  check(await ev("SU.state.current==='home' && document.getElementById('suSections').hidden && !document.getElementById('suDeveloperTools').hidden && !document.getElementById('suDeveloperTools').open"),'MAIN LAB return restores collapsed developer access in Profile');
  await ev("SU.open('build');true");await sleep(1000);
  check(await ev("SU.state.current==='build' && !document.querySelector('#suHostBuild .su-error') && document.getElementById('suDeveloperTools').hidden"),'existing Build section mounts without developer controls');
  await ev("SU.open('home');SU.open('spacelab');true");
  check(await ev("!document.getElementById('suUnlockModal').hidden && SU.state.current==='home'"),'Space Lab still locked in development');
  await ev("document.getElementById('suUnlockModal').hidden=true;true");
  await launchDeveloper();await sleep(400);
  check(await ev("SU.state.current==='explore' && g.isLoaded && g.saveSystem.activeSlotId==='slot_2'"),'Explore re-entry preserves isolated session');
  await navigate(dev);
  await launchDeveloper();
  await wait("import('./sections/explore/ctx.js').then(c=>{globalThis.g=c.window.game;return !!g?.isLoaded})",'reloaded game');
  check(await ev("g.saveSystem.activeSlotId==='slot_2' && g.saveSystem.hasSave() && g.saveSystem.load().success"),'isolated saves survive full page reload');
  await navigate(prod);
  await seed(0);
  for (const [width,height] of [[1440,900],[390,844]]) {
    await viewport(width,height);
    check(await mainGeometry()===devGeometry.get(width), 'MAIN LAB geometry/fonts/colors match production at width '+width);
  }
  await viewport(1440,900);
  check(await ev("!document.getElementById('suDeveloperTools') && !document.getElementById('suDeveloperExplore')"), 'production renders no developer panel or launch control');
  await seed(119);
  await ev("localStorage.setItem('developerTest','1');localStorage.setItem('rf_developer_test','1');SU.open('explore',{developerTest:true});true");
  check(await ev("!document.getElementById('suDeveloperExplore') && SU.state.current==='home' && !document.getElementById('suUnlockModal').hidden && !document.getElementById('suUnlockPayBtn')"),'production 119 credits denies Explore, including spoofed runtime switches');
  check(await ev("JSON.parse(localStorage.getItem('rf_users'))['developer@example.test'].credits===119 && !localStorage.getItem('rf_explore_unlocked')"),'denied production entry neither charges nor unlocks');
  await navigate(prod+'/?development=1#explore');
  check(await ev("SU.state.current==='home' && !SU.isSectionUnlocked('explore')"),'production hash/query cannot authorize a locked section');
  await seed(120);
  console.log('Production 120-credit startup unlock state:', await ev("Object.fromEntries(['spacelab','explore','classic'].map(s=>[s,SU.isSectionUnlocked(s)]))"));
  await ev("suAuth.updateCurrentUser({});true");
  check(await ev("['spacelab','explore','classic'].every(s=>SU.isSectionUnlocked(s)) && JSON.parse(localStorage.getItem('rf_users'))['developer@example.test'].credits===120"),'existing 120 lifetime-credit auto-unlock on account refresh is preserved with zero deduction');
  // Exercise the existing paid fallback below lifetime threshold, using synthetic DOM balance only.
  await seed(0);
  await ev("document.getElementById('credits').textContent='150';SU.open('explore');true");
  check(await ev("!!document.getElementById('suUnlockPayBtn') && !SU.isSectionUnlocked('explore')"),'existing spendable-credit confirmation flow still requires explicit payment');
  await seed(150);
  await ev("SU.open('explore');document.getElementById('suUnlockPayBtn').click();true");
  await wait("SU.state.current==='explore'",'paid production route');
  check(await ev("JSON.parse(localStorage.getItem('rf_users'))['developer@example.test'].credits===30 && JSON.parse(localStorage.getItem('rf_users'))['developer@example.test'].lifetimeCredits===150 && SU.isSectionUnlocked('explore')"),'production paid unlock deducts exactly 120 credits and preserves lifetime total');
  await wait("import('./sections/explore/ctx.js').then(c=>!!c.window.game?.isLoaded)",'production game');
  console.log('Browser uncaught exceptions:',JSON.stringify(errors));
  console.log('Browser console errors:',JSON.stringify(consoleErrors));
  check(!errors.length,'no uncaught browser errors');
  check(!consoleErrors.length,'no console.error calls during tested navigation');
} finally {
  if(ws) ws.close();browser.kill();for(const s of servers)s.close();
  await sleep(1500);try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
}
