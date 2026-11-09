// Diagnostic-only native promise boundaries. Returned rejections remain rejected.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(p=>p.url.startsWith('https://localhost/'));
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map(),events=[],responses=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(Error(JSON.stringify(m.error)));else p?.resolve(m.result);}else if(m.method==='Debugger.paused'){
 const desc=m.params.data?.description||'';
 if(desc.includes('UnknownError'))events.push(m);
 send('Debugger.resume').catch(()=>{});
}else if(['Runtime.exceptionThrown','Runtime.consoleAPICalled','Network.loadingFailed','Log.entryAdded'].includes(m.method))events.push(m);
else if(m.method==='Network.responseReceived')responses.push({url:m.params.response.url,status:m.params.response.status,mime:m.params.response.mimeType});};
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const observer=`(()=>{
 const d=window.__suPromiseTrace={calls:[],failures:[],rejections:[],restores:[]};
 function wrap(obj,key,label){if(typeof obj?.[key]!=='function')return;const original=obj[key];obj[key]=function(...args){
  const call={api:label,stack:new Error(label+' invocation').stack,time:performance.now(),input:args.map(a=>a instanceof Blob?{kind:'Blob',type:a.type,size:a.size}:typeof a==='number'?a:typeof a==='string'?a.slice(0,300):a?.constructor?.name)};
  if(this instanceof HTMLImageElement)Object.assign(call,{src:this.src,width:this.naturalWidth,height:this.naturalHeight});
  d.calls.push(call);const result=original.apply(this,args);
  if(!result?.then)return result;
  return result.then(value=>{if(value instanceof ImageBitmap)Object.assign(call,{width:value.width,height:value.height});return value;},error=>{const failure={...call,name:error?.name,message:error?.message,rejectionStack:error?.stack};d.failures.push(failure);console.error('SU native promise boundary',JSON.stringify(failure));throw error;});
 };d.restores.push(()=>obj[key]=original);}
 wrap(window,'createImageBitmap','createImageBitmap');wrap(HTMLImageElement.prototype,'decode','HTMLImageElement.decode');wrap(HTMLMediaElement.prototype,'play','HTMLMediaElement.play');
 for(const key of ['resume','suspend','close','decodeAudioData'])wrap(window.AudioContext?.prototype,key,'AudioContext.'+key);
 const reject=e=>d.rejections.push({name:e.reason?.name,message:e.reason?.message,stack:e.reason?.stack,time:performance.now()});addEventListener('unhandledrejection',reject);d.restores.push(()=>removeEventListener('unhandledrejection',reject));
 d.restore=()=>{d.restores.forEach(f=>f());delete window.__suPromiseTrace;};
})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let script;
try{
 for(const method of ['Runtime.enable','Log.enable','Network.enable','Page.enable','Debugger.enable'])await send(method);
 await send('Debugger.setAsyncCallStackDepth',{maxDepth:64});await send('Debugger.setPauseOnExceptions',{state:'all'});
 if(!await evaluate('!!window.suAuth?.getCurrentUser()'))throw Error('Authentic login required before reload');
 await evaluate(`window.SU.open('home');window.suCloseAllOverlays();true`);
 script=(await send('Page.addScriptToEvaluateOnNewDocument',{source:observer})).identifier;
 await send('Page.reload');await sleep(15000);
 console.log('POST RELOAD',JSON.stringify(await evaluate('({signedIn:!!window.suAuth?.getCurrentUser(),phone:document.querySelector("#phone")?.className,lab:window.SU_NAV?.getActiveLab()})')));
 await evaluate(`(()=>{const e=document.querySelector('#enterW');if(e&&e.getBoundingClientRect().width>0)e.click();return true})()`);
 await sleep(15000);
 const data=await evaluate('({calls:window.__suPromiseTrace?.calls,failures:window.__suPromiseTrace?.failures,rejections:window.__suPromiseTrace?.rejections,activeLab:window.SU_NAV?.getActiveLab(),signedIn:!!window.suAuth?.getCurrentUser()})');
 fs.writeFileSync(root+'android-native-promise-trace.json',JSON.stringify({data,events,responses},null,2));
 console.log('NATIVE BOUNDARIES',JSON.stringify(data));console.log('UNKNOWN EVENTS',JSON.stringify(events.filter(e=>JSON.stringify(e).includes('UnknownError'))));
}finally{
 await send('Debugger.setPauseOnExceptions',{state:'none'}).catch(()=>{});
 if(script)await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script}).catch(()=>{});
 await evaluate('window.__suPromiseTrace?.restore();true').catch(()=>{});ws.close();
}
