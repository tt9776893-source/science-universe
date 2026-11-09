// Run: node tests/terrain-excavation.mjs
// Isolated Chromium profile: never reads or changes the user's saves.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.css':'text/css' };
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  fs.readFile(file,(err,data) => { res.writeHead(err ? 404 : 200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream'}); res.end(err ? '' : data); });
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const profile = fs.mkdtempSync(path.join(os.tmpdir(),'su-terrain-test-'));
const exe = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert.ok(exe, 'Set CHROME_PATH to a Chromium executable');
const browser = spawn(exe,['--headless=new','--enable-unsafe-swiftshader','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws, seq = 0; const pending = new Map(), errors = [];
try {
  const endpoint = await new Promise((resolve,reject) => {
    let text=''; const timer=setTimeout(()=>reject(new Error('Browser startup timeout')),15000);
    browser.stderr.on('data',d=>{text+=d; const m=text.match(/DevTools listening on (ws:\/\/[^\r\n]+)/); if(m){clearTimeout(timer);resolve(m[1]);}});
    browser.on('error',reject);
  });
  const pages = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws = new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage = ev => { const m=JSON.parse(ev.data); if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);} else if(m.method==='Runtime.exceptionThrown')errors.push(m.params); };
  const send = (method,params={}) => new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate = async expression => {const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const check = (condition,label) => {assert.ok(condition,label);console.log('PASS',label);};
  await send('Runtime.enable');
  const base=`http://127.0.0.1:${server.address().port}`;
  await send('Page.navigate',{url:base+'/index.html'});await sleep(2500);
  // Bypass only the section's account unlock in this disposable profile; use the actual router/bootstrap.
  await evaluate("localStorage.setItem('rf_explore_unlocked','1');window.SU.open('explore');true");
  for(let n=0;n<80;n++){await sleep(500);if(await evaluate("import('./sections/explore/ctx.js').then(c=>{globalThis.g=c.window.game;return !!g?.isLoaded && !!g.terrain.marsDem})"))break;}
  check(await evaluate('!!g?.isLoaded && !!g.terrain.marsDem'),'actual Explore game and measured terrain loaded');
  await evaluate("import('./sections/explore/src/core/InputManager.js').then(m=>{globalThis.testInput=m.input;return true})");
  // Same view and renderer before/after. gl.finish includes software GPU work;
  // unlike a bare rAF counter this measures real scene rendering, but not human play.
  const fps = () => evaluate('(async()=>{g.camera.position.set(11,9,12);g.camera.lookAt(8,1,8);const gl=g.renderer.getContext();for(let i=0;i<5;i++){g.renderer.render(g.scene,g.camera);gl.finish();}const start=performance.now();let count=0;while(performance.now()-start<2000){await new Promise(requestAnimationFrame);g.renderer.render(g.scene,g.camera);gl.finish();count++;}return count*1000/(performance.now()-start)})()');
  const fpsBefore = await fps();
  const result = await evaluate(`(()=>{
    const t=g.terrain,p=g.player;
    const samples=[];
    for(const [x,z] of [[8,8],[-8,8],[23.8,8],[8,-8]]){
      const h=t.getBaseHeight(x,z),before=t.getWalkableFloor(x,h+3,z);
      // Real mining-laser interaction: same raycast and primary input path as gameplay.
      g.camera.position.set(x,h+4,z);g.camera.lookAt(x,h,z);g.camera.updateMatrixWorld(true);
      testInput.mouseButtons[0]=true;p.terrainExcavateCooldown=0;
      const start=performance.now(),rebuilds=t.rebuildCount;
      p._handleToolActions(.016,performance.now());testInput.mouseButtons[0]=false;
      const after=t.getWalkableFloor(x,h+3,z);
      t._floorRayOrigin.set(x,h+3,z);t._floorRaycaster.set(t._floorRayOrigin,t._floorRayDir);
      const mesh=t._floorRaycaster.intersectObjects(t.getRaycastMeshes(),false)[0]?.point.y;
      samples.push({x,z,before,after,mesh,ms:performance.now()-start,rebuilds:t.rebuildCount-rebuilds});
    }
    const h=t.getBaseHeight(8,8),floor=t.getWalkableFloor(8,h+3,8);
    p.position.set(8,h+p.currentEyeHeight,8);p.velocity.set(0,0,0);
    for(let i=0;i<240;i++)p._handleMovement(1/60);
    const feet=p.position.y-p.currentEyeHeight,grounded=p.isGrounded;
    p.position.set(5,h+p.currentEyeHeight,8);p.velocity.set(0,0,0);p.yaw=0;
    testInput.keys.KeyD=true;let lowestFeet=h;
    for(let i=0;i<120;i++){p._handleMovement(1/60);lowestFeet=Math.min(lowestFeet,p.position.y-p.currentEyeHeight);}
    testInput.keys.KeyD=false;
    return {samples,feet,floor,grounded,lowestFeet,surface:h,walkEndX:p.position.x,edits:t.allEdits.length};
  })()`);
  console.log(JSON.stringify(result,null,2));
  check(result.samples.every(s=>s.after<s.before-.5),'four primary-action digs lower real triangle geometry at distinct positions, including chunk border');
  check(result.samples.every(s=>Math.abs(s.after-s.mesh)<.001),'floor collision matches rendered triangle hits');
  check(result.grounded && Math.abs(result.feet-result.floor)<.02,'actual player movement/gravity enters hole and rests on excavated floor');
  check(result.walkEndX>6 && result.lowestFeet<result.surface-.5,'actual horizontal movement can walk from the surface into excavated space');
  check(result.samples.every(s=>s.rebuilds<=8),'dig rebuilds only local chunks');
  const history = await evaluate(`(()=>{
    const t=g.terrain,h=t.getBaseHeight(8,8);
    const before=t.getWalkableFloor(8,h+3,8),density=t.sampleDensity(8,h-1,8);
    for(let i=0;i<605;i++)t.carveSphere({x:16,y:t.getBaseHeight(16,16),z:16},.8);
    const live=t.sampleDensity(8,h-1,8),saved=g.saveSystem.save();
    const count=t.allEdits.length;g.saveSystem.load();
    const loaded=t.sampleDensity(8,h-1,8),floor=t.getWalkableFloor(8,h+3,8);
    const restart=g.restartCurrentGame();
    return {before,density,live,loaded,floor,count,afterCount:t.allEdits.length,restartFloor:t.getWalkableFloor(8,h+3,8),stored:JSON.parse(localStorage.getItem(t.getStorageKeyForSlot(t.activeSlotId))).length};
  })()`);
  console.log('history',JSON.stringify(history));
  check(history.count>600 && history.stored===history.count && history.afterCount===history.count,'existing save system preserves more than 600 edits');
  check(Math.abs(history.density-history.live)<1e-6 && Math.abs(history.live-history.loaded)<1e-6,'more than 80 local edits do not resurrect original collision; save/load identical');
  check(Math.abs(history.before-history.floor)<.001 && Math.abs(history.before-history.restartFloor)<.001,'save/load and session restart preserve hole geometry');
  const fpsAfter=await fps();
  console.log('Headless scene-render FPS (software GPU; not hardware gameplay FPS)',{fpsBefore,fpsAfter});
  // Render the actual scene from above the test hole; save evidence outside the project.
  const png=await evaluate("(()=>{g.camera.position.set(11,9,12);g.camera.lookAt(8,1,8);g.renderer.render(g.scene,g.camera);return g.renderer.domElement.toDataURL('image/png').split(',')[1]})()");
  const screenshot=path.join(os.tmpdir(),'su-terrain-after.png');fs.writeFileSync(screenshot,Buffer.from(png,'base64'));console.log('Rendered scene:',screenshot);
  await evaluate("window.SU.open('home');true");await sleep(300);
  check(await evaluate("!document.getElementById('suHostHome')?.hidden"),'home route remains available');
  await evaluate("window.SU.open('build');true");await sleep(2000);
  check(await evaluate("document.getElementById('suHostBuild')?.hidden===false"),'existing build gameplay route mounts');
  await evaluate("window.SU.open('explore');true");await sleep(500);
  check(await evaluate("document.getElementById('suHostExplore')?.hidden===false"),'Explore resumes through existing navigation');
  await send('Page.reload');await sleep(2500);
  await evaluate("window.SU.open('explore');true");
  for(let n=0;n<80;n++){await sleep(500);if(await evaluate("import('./sections/explore/ctx.js').then(c=>{globalThis.g=c.window.game;return !!g?.isLoaded && !!g.terrain.marsDem})"))break;}
  const reloaded=await evaluate("({count:g.terrain.allEdits.length,floor:g.terrain.getWalkableFloor(8,g.terrain.getBaseHeight(8,8)+3,8)})");
  check(reloaded.count===history.count && Math.abs(reloaded.floor-history.before)<.001,'full browser reload preserves saved geometry and edit history');
  check(errors.length===0,'no uncaught browser exceptions');
} finally {
  ws?.close();browser.kill();server.close();
  // Chromium may briefly retain profile locks. Profile path is printed for cleanup.
  console.log('Disposable browser profile:',profile);
}
