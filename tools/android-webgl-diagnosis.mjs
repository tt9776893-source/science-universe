// Real-device CDP diagnostics; no dependencies, source/asset edits, or storage resets.
// ADB must forward 9223 to the current app's webview_devtools_remote_<pid>.
// Usage: node tools/android-webgl-diagnosis.mjs [inspect|start|build|home|reload|assembly|lifecycle|space|explore]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const action = process.argv[2] || 'inspect';
const prefix = `android-webgl-${process.env.SU_DIAG_LABEL || action}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = pages.find(p => p.url.startsWith('https://localhost/'));
if (!target) throw Error('No SCIENCE UNIVERSE https://localhost/ target');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let seq = 0;
const pending = new Map(), events = [], responses = [];
let assemblySnapshot = null, newDocumentScript = null;
const captureStartMs=Date.now();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p?.reject(Error(JSON.stringify(m.error))); else p?.resolve(m.result); }
  else if (['Log.entryAdded','Runtime.exceptionThrown','Runtime.consoleAPICalled','Network.loadingFailed'].includes(m.method)) events.push(m);
  else if (m.method === 'Network.responseReceived') responses.push({ url:m.params.response.url,status:m.params.response.status,mime:m.params.response.mimeType });
};
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); });
const evaluate = async expression => { const r = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
// Observers only: never preventDefault, drain GL errors, or alter rendering state.
const observer = `(()=>{
 if(window.__suGLDiag)return;
 const d=window.__suGLDiag={contexts:[],missing:[],contextEvents:[],rejections:[],lifecycle:[],restores:[]};
 for(const type of ['visibilitychange','resize','orientationchange']){const handler=()=>d.lifecycle.push({type,time:performance.now(),visibility:document.visibilityState,width:innerWidth,height:innerHeight});addEventListener(type,handler);d.restores.push(()=>removeEventListener(type,handler));}
 for(const name of ['WebGLRenderingContext','WebGL2RenderingContext']){
  const P=window[name]?.prototype;if(!P)continue;
  for(const method of ['drawElements','drawArrays']){
   const original=P[method];
   P[method]=function(...args){
    let c=d.contexts.find(c=>c.gl===this);
    if(!c){c={gl:this,kind:name,canvas:this.canvas,draws:0,missing:0};d.contexts.push(c);for(const type of ['webglcontextlost','webglcontextrestored']){const handler=e=>d.contextEvents.push({type,time:performance.now(),message:e.statusMessage});this.canvas.addEventListener(type,handler);d.restores.push(()=>this.canvas.removeEventListener(type,handler));}}
    c.draws++;
    if(c.draws<=12000 && d.missing.length<5 && this.getParameter(this.ACTIVE_TEXTURE)===this.TEXTURE0){
     const program=this.getParameter(this.CURRENT_PROGRAM);
     if(program && !this.getParameter(this.TEXTURE_BINDING_2D)){
      const count=this.getProgramParameter(program,this.ACTIVE_UNIFORMS),samplers=[];
      for(let i=0;i<count;i++){const u=this.getActiveUniform(program,i);if(u.type===this.SAMPLER_2D && this.getUniform(program,this.getUniformLocation(program,u.name))===0)samplers.push(u.name);}
      if(samplers.length){c.missing++;d.missing.push({canvas:this.canvas.id,method,samplers,stack:new Error('Sampler with no unit-0 texture at draw').stack,shaders:this.getAttachedShaders(program).map(s=>this.getShaderSource(s))});}
     }
    }
    return original.apply(this,args);
   };
   d.restores.push(()=>P[method]=original);
  }
 }
 const rejection=e=>d.rejections.push({name:e.reason?.name,message:e.reason?.message,stack:e.reason?.stack,time:performance.now()});
 addEventListener('unhandledrejection',rejection);d.restores.push(()=>removeEventListener('unhandledrejection',rejection));
 d.snapshot=()=>({missing:d.missing,contextEvents:d.contextEvents,rejections:d.rejections,lifecycle:d.lifecycle,contexts:d.contexts.map(c=>{
  const gl=c.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {canvas:c.canvas.id,kind:c.kind,draws:c.draws,width:c.canvas.width,height:c.canvas.height,lost:gl.isContextLost(),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):null};
 })});
 d.restore=()=>{d.restores.forEach(f=>f());delete window.__suGLDiag;};
})()`;
try {
  await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable'); await send('Page.enable');
  await send('Debugger.enable'); await send('Debugger.setAsyncCallStackDepth',{maxDepth:32});
  await evaluate(observer);
  const baseline = await evaluate(`(async()=>({url:location.href,section:window.SU?.state?.current,activeLab:window.SU_NAV?.getActiveLab(),hasUser:!!window.suAuth?.getCurrentUser(),credits:window.getSpendableCredits?.(),lifetimeCredits:window.getLifetimeCredits?.(),userRecordHash:window.suAuth?.getCurrentUser()?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(window.suAuth.getCurrentUser()))))).map(n=>n.toString(16).padStart(2,'0')).join(''):null,ua:navigator.userAgent}))()`);
  console.log('BASELINE',JSON.stringify(baseline));
  if(action==='reload'){
   newDocumentScript=(await send('Page.addScriptToEvaluateOnNewDocument',{source:observer})).identifier;await send('Page.reload');
   for(let i=0;i<90;i++){await sleep(500);if(await evaluate('document.readyState==="complete" && !!window.SU_NAV'))break;}
  } else if(action==='start'){
   if(!baseline.hasUser)throw Error('Login required; do not fabricate a session');
   const p=await evaluate(`(()=>{const r=document.querySelector('#start').getBoundingClientRect();if(!r.width||!r.height)throw Error('Start is not visible; do not tap a hidden control');return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
   await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  } else if(action==='build'){
   if(!baseline.hasUser)throw Error('Login required for signed-in UI validation');
   await evaluate(`document.querySelector('[data-su-nav="build"]').click();true`);
  } else if(action==='home'){
   await evaluate(`window.SU.open('home');true`);
  } else if(action==='assembly'){
   // Snapshot only this assembly slot. After testing, dispose the scene and
   // restore that exact slot; account/progress keys are never reset or replaced.
   assemblySnapshot=await evaluate(`(()=>{const key='rocket_lab_v67_player_'+(localStorage.getItem('rocket_lab_v67_active_player')||'default');return {key,value:localStorage.getItem(key)}})()`);
   console.log('ASSEMBLY BEFORE',await evaluate(`(()=>{const r=document.querySelector('#suHostBuild').shadowRoot;return {done:r.querySelectorAll('#partlist button.done').length,total:r.querySelectorAll('#partlist button').length}})()`));
   await evaluate(`(()=>{const r=document.querySelector('#suHostBuild')?.shadowRoot,buttons=r?.querySelectorAll('#partlist button');if(!buttons?.length)throw Error('Build parts unavailable');const index=[10,6,7,8,1,4,5,3,0,2,9].find(i=>!buttons[i].classList.contains('done'));if(index===undefined)throw Error('Assembly already complete; do not reset it');buttons[index].click();r.querySelector('#assemble').click();return true})()`);
  } else if(action==='lifecycle'){
   if(!baseline.hasUser || baseline.section!=='build')throw Error('Signed-in Build required');
   const adb='C:/Users/Administrator/AppData/Local/Android/Sdk/platform-tools/adb.exe';
   const run=(...args)=>execFileSync(adb,args,{encoding:'utf8'}).trim();
   const rotation=run('shell','wm','user-rotation').split(/\s+/);
   try{
    run('shell','input','keyevent','KEYCODE_HOME');await sleep(2000);
    run('shell','am','start','-n','com.scienceuniverse.app/.MainActivity');await sleep(2000);
    run('shell','wm','user-rotation','lock','1');await sleep(2000);
   } finally {
    if(rotation[0]==='free')run('shell','wm','user-rotation','free');
    else if(rotation[0]==='lock')run('shell','wm','user-rotation','lock',rotation[1]);
    else throw Error('Unrecognized original rotation state: '+rotation.join(' '));
   }
   console.log('ROTATION RESTORED',run('shell','wm','user-rotation'));
  } else if(action==='space'||action==='explore'){
   const key=action==='space'?'spacelab':'explore';
   if(!await evaluate(`window.SU.isSectionUnlocked('${key}')`))throw Error(`${key} is locked: no diagnostic unlock or credit alteration permitted`);
   await evaluate(`window.SU.open('${key}');true`);
  }
  await sleep(Number(process.env.SU_DIAG_WAIT || 8000));
  const info=await evaluate(`({url:location.href,section:window.SU?.state?.current,activeLab:window.SU_NAV?.getActiveLab(),diag:window.__suGLDiag?.snapshot(),heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,buildStatus:document.querySelector('#suHostBuild')?.shadowRoot?.querySelector('#status')?.textContent})`);
  if(action==='assembly')console.log('ASSEMBLY AFTER',await evaluate(`(()=>{const r=document.querySelector('#suHostBuild').shadowRoot;return {done:r.querySelectorAll('#partlist button.done').length,robot:r.querySelector('#robotStatus')?.textContent}})()`));
  const frameSample=await evaluate(`new Promise(resolve=>{const samples=[];let last=performance.now();const start=last;function frame(now){samples.push(now-last);last=now;if(now-start<2000)requestAnimationFrame(frame);else{samples.sort((a,b)=>a-b);resolve({rafHz:samples.length*1000/(now-start),p95FrameMs:samples[Math.floor(samples.length*.95)]});}}requestAnimationFrame(frame);})`);
  const relevant=events.filter(m=>m.method!=='Runtime.consoleAPICalled'||['error','warning'].includes(m.params.type));
  const newRelevant=relevant.filter(m=>(m.params.entry?.timestamp??m.params.timestamp??0)>=captureStartMs);
  const report={action,captureStartMs,baseline,info,frameSample,events,relevant,newRelevant,responses};
  fs.writeFileSync(root+prefix+'.json',JSON.stringify(report,null,2));
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(root+prefix+'.png',Buffer.from(shot.data,'base64'));
  console.log('RESULT',JSON.stringify(info));console.log('RAF SAMPLE (not GPU benchmark)',JSON.stringify(frameSample));
  console.log('NEW RELEVANT EVENTS (excluding CDP buffered history)',JSON.stringify(newRelevant.slice(0,12)));console.log('FAILED HTTP',JSON.stringify(responses.filter(r=>r.status>=400)));console.log('REPORT',prefix+'.json');
} finally {
  if(assemblySnapshot){
   try {
    await evaluate(`window.SU.open('home');true`);await sleep(200);
    const s=JSON.stringify(assemblySnapshot);
    console.log('RESTORED original assembly slot',await evaluate(`(()=>{const s=${s};if(s.value===null)localStorage.removeItem(s.key);else localStorage.setItem(s.key,s.value);return localStorage.getItem(s.key)===s.value})()`));
   } catch(e){console.error('Assembly restoration needs attention:',e.message);}
  }
  if(newDocumentScript)await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:newDocumentScript}).catch(()=>{});
  try {await evaluate('window.__suGLDiag?.restore();true');} catch {}
  ws.close();
}
