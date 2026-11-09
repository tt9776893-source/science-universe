/* Space Lab (REALITY FORGE) — solar_system.html, converted into an embeddable section module.
   Original logic is unchanged; only environment bindings (document/window/location/timers)
   and asset base paths were adapted. */
import * as THREE from 'three180';
import {OrbitControls} from 'three180/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three180/examples/jsm/loaders/GLTFLoader.js';

const RF_BASE = './REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED/REALITY-FORGE-ROCKET-SOLAR-ONLY/';
const GLB_CACHE = new Map();
function resolveRfAssetPath(p) {
  if (!p) return RF_BASE + 'assets/rockets/vulcan_centaur_rocket.glb';
  const s = String(p).trim();
  if (s.startsWith('./') || s.startsWith('../') || s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('REALITY_FORGE_')) return './' + s;
  if (s.startsWith('assets/')) return RF_BASE + s;
  return RF_BASE + 'assets/rockets/' + s.replace(/^\/+/, '');
}
function loadCachedGLB(loader, url) {
  const key = resolveRfAssetPath(url);
  if (!GLB_CACHE.has(key)) {
    const p = new Promise((resolve, reject) => {
      loader.load(key, resolve, undefined, (err) => {
        GLB_CACHE.delete(key);
        reject(err);
      });
    });
    GLB_CACHE.set(key, p);
  }
  return GLB_CACHE.get(key);
}

const SVG_ICO = {
  rocket: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  planet: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><circle cx="12" cy="12" r="6.5"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(-24 12 12)"/></svg>',
  land: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 20h16"/></svg>',
  sun: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  ban: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/></svg>',
  fast: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>'
};

export const css = "\n*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#010208;color:#eef8ff;font-family:Inter,Arial,sans-serif}canvas{display:block}.ui{position:fixed;inset:0;pointer-events:none}.top{position:absolute;left:12px;right:12px;top:56px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.glass{background:linear-gradient(180deg,rgba(7,17,33,.9),rgba(2,6,15,.82));border:1px solid rgba(86,190,255,.28);box-shadow:0 12px 38px rgba(0,0,0,.35);backdrop-filter:blur(12px);border-radius:14px}.nav-back-btn,.mobile-planet-toggle{pointer-events:auto;min-height:44px;padding:9px 14px;font:800 12px Inter,Arial,sans-serif;color:#e6f7ff;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:border-color .18s,background .18s}.nav-back-btn:hover,.mobile-planet-toggle:hover{border-color:#58d5ff;background:rgba(12,38,68,.92)}.mobile-planet-toggle{display:none}.brand{padding:10px 13px;font-weight:900;letter-spacing:1.2px;color:#dff7ff;display:inline-flex;align-items:center;gap:7px}.hint{margin-left:auto;padding:9px 12px;font-size:11px;color:#a8d8eb}.bottom{position:absolute;left:12px;bottom:12px;display:flex;gap:8px;pointer-events:auto}.bottom button,.close{border:1px solid rgba(83,194,255,.35);background:#071427;color:white;border-radius:10px;padding:10px 12px;min-height:44px;font-weight:800;cursor:pointer}.info{position:absolute;right:12px;top:108px;width:min(330px,calc(100vw - 24px));padding:16px;pointer-events:auto;transform:translateX(calc(100% + 24px));transition:transform .28s ease;z-index:28}.info.open{transform:none}.info h2{margin:0 0 3px;font-size:23px}.sub{font-size:11px;color:#7edcff;letter-spacing:1.2px}.desc{font-size:12px;line-height:1.55;color:#d3e3ed;margin:12px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.metric{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);padding:9px;border-radius:10px}.metric span{display:block;font-size:9px;color:#77b9d4}.metric b{font-size:12px}.metric.simple{grid-column:1/-1}.metric.simple b{font-size:12px;line-height:1.55}.close{width:100%;margin-top:10px}.legend{position:absolute;left:12px;top:112px;padding:9px 11px;font-size:10px;color:#a8c4d3}.legend b{color:#fff}.loading{position:absolute;inset:0;display:grid;place-items:center;background:#010208;z-index:5;transition:opacity .4s}.loading.hide{opacity:0;pointer-events:none}.loading div{font-weight:900;letter-spacing:2px;color:#9be8ff}@media(max-width:650px){.brand{font-size:11px}.hint{display:none}.legend{display:none}.grid{grid-template-columns:1fr 1fr}}\n.fly{width:100%;margin-top:12px;min-height:44px;background:linear-gradient(135deg,#087ea4,#2563eb);border:1px solid #67e8f9;color:#fff;font-weight:900;letter-spacing:.5px;padding:13px;border-radius:12px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}.close{margin-top:8px}\n/* V7 cinematic information UI */\n.planet-nav{position:absolute;left:14px;top:112px;width:178px;padding:10px;pointer-events:auto;max-height:calc(100vh - 280px);overflow:auto;z-index:25}.planet-nav .nav-title{font-size:11px;color:#78d8f6;font-weight:900;letter-spacing:1.1px;padding:7px 8px 10px}.planet-btn{width:100%;min-height:42px;display:flex;align-items:center;gap:9px;border:1px solid transparent;background:transparent;color:#e8f4ff;padding:8px;border-radius:10px;cursor:pointer;text-align:left;font-weight:800}.planet-btn:hover,.planet-btn.active{border-color:#2dd4ff;background:rgba(13,95,130,.25)}.dot{width:25px;height:25px;border-radius:50%;display:inline-block;box-shadow:inset -6px -4px 8px rgba(0,0,0,.35)}.info{width:min(400px,calc(100vw - 24px));top:58px;max-height:calc(100vh - 76px);overflow:auto}.info h2{font-size:28px}.info-head{display:flex;gap:12px;align-items:center}.planet-preview{margin-left:auto;width:86px;height:86px;border-radius:50%;background:radial-gradient(circle,#0b1725,#030711 72%);box-shadow:0 0 30px rgba(100,190,255,.12);flex:0 0 auto;overflow:hidden}.planet-preview canvas{width:100%!important;height:100%!important;display:block}.metric{min-height:62px}.metric b{font-size:14px;line-height:1.35}.section{margin-top:10px;padding:11px;border-radius:11px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}.section-title{font-size:10px;color:#78d8f6;font-weight:900;letter-spacing:.8px;margin-bottom:6px}.section p{margin:0;font-size:12px;line-height:1.55;color:#d8e8f2}.highlights{margin:0;padding-left:17px;font-size:11px;line-height:1.55;color:#d8e8f2}.simple-row{display:flex;gap:10px;align-items:flex-start}.simple-icon{width:30px;height:30px;border-radius:8px;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.28);color:#7dd3fc;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}.legend{left:205px}.bottom{left:205px}@media(max-width:800px){.top{top:52px;left:10px;right:10px;gap:6px}.mobile-planet-toggle{display:inline-flex}.brand{display:none}.planet-nav{display:none;left:10px;top:104px;width:min(220px,calc(100vw - 20px));max-height:52vh}.planet-nav.mobile-open{display:block}.legend{display:none}.bottom{left:10px}.info{top:54px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 130px)}}\n.no-landing-box{margin-top:10px;padding:12px;border-radius:12px;background:linear-gradient(180deg,rgba(95,22,28,.45),rgba(42,10,15,.55));border:1px solid rgba(255,105,105,.55);color:#ffe4e4}\n.no-landing-box .nl-title{font-size:11px;font-weight:900;color:#ff8080;letter-spacing:.6px;margin-bottom:6px;display:flex;align-items:center;gap:6px}\n.no-landing-box p{margin:4px 0;font-size:11.5px;line-height:1.5;color:#ffdede}\n.no-landing-box b{color:#fff}\n\n.telemetry-card{position:fixed;left:18px;bottom:18px;z-index:35;padding:14px 18px;min-width:240px;background:linear-gradient(180deg,rgba(6,18,34,.96),rgba(2,8,18,.92));border:1px solid rgba(56,189,248,.45);box-shadow:0 14px 45px rgba(0,0,0,.7),inset 0 0 25px rgba(56,189,248,.08);border-radius:18px;font-family:Inter,Arial,sans-serif;pointer-events:auto}\n.tele-row{display:flex;justify-content:space-between;align-items:center;margin:6px 0;font-size:12.5px;gap:14px}\n.tele-lbl{color:#8ec5dc;font-weight:800;letter-spacing:.3px}\n.tele-val{color:#fff;font-weight:900;font-size:13.5px;text-shadow:0 0 10px rgba(56,189,248,.5);font-variant-numeric:tabular-nums}\n.orbit-toast{position:fixed;left:50%;top:112px;transform:translateX(-50%);z-index:36;padding:10px 18px;border-radius:999px;background:linear-gradient(135deg,rgba(6,34,58,.95),rgba(8,52,82,.92));border:1px solid rgba(103,232,249,.55);color:#e0f7ff;font:800 12px Inter,Arial,sans-serif;letter-spacing:.3px;box-shadow:0 12px 32px rgba(0,0,0,.45);pointer-events:none;opacity:0;transition:opacity .35s ease}\n.orbit-toast.show{opacity:1}\n\n.bottom-console{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:10px;pointer-events:auto}\n\n.flight-hud{display:none !important}\n.flight-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:1000;letter-spacing:1px;color:#ffffff}\n#flightPhase{color:#72e4ff;text-shadow:0 0 12px rgba(56,189,248,.6)}\n#flightPct{font-size:14.5px;color:#a5f3fc;font-variant-numeric:tabular-nums}\n.flight-sub{margin:5px 0 9px;font-size:11px;font-weight:600;color:#92d4f0;line-height:1.45}\n.flight-tele{display:none !important}\n.flight-bar{height:6px;background:rgba(14,38,59,.85);border:1px solid rgba(56,189,248,.25);border-radius:20px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.6)}\n.flight-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0284c7,#38bdf8,#67e8f9);box-shadow:0 0 12px #38bdf8;border-radius:20px;transition:width .15s linear}\n\n.console-actions{display:flex;align-items:center;gap:8px;pointer-events:auto;flex-wrap:wrap;justify-content:center}\n.flight-cam{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}\n.flight-cam.show{display:flex}\n.flight-cam button{border:1px solid rgba(56,189,248,.35);background:rgba(7,23,41,.92);color:#e2f5ff;border-radius:12px;padding:11px 13px;min-height:44px;font:900 11px Inter,Arial,sans-serif;letter-spacing:.5px;cursor:pointer;transition:all .2s ease;box-shadow:0 4px 15px rgba(0,0,0,.35);backdrop-filter:blur(8px);display:inline-flex;align-items:center;gap:6px}\n.flight-cam button:hover{border-color:#38bdf8;background:rgba(12,45,75,.95);color:#fff;box-shadow:0 0 18px rgba(56,189,248,.35)}\n.flight-cam button.active{border-color:#38bdf8;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;box-shadow:0 0 20px rgba(56,189,248,.5)}\n\n.landing-btn{display:none;border:1px solid #34d399;background:linear-gradient(135deg,#059669,#047857);color:white;border-radius:12px;padding:12px 18px;min-height:44px;font:1000 12px Inter,Arial,sans-serif;letter-spacing:.8px;cursor:pointer;box-shadow:0 0 25px rgba(52,211,153,.4);transition:all .2s ease;pointer-events:auto;white-space:nowrap;align-items:center;gap:7px}\n.landing-btn:hover{transform:translateY(-2px);box-shadow:0 0 35px rgba(52,211,153,.65)}\n.landing-btn.show{display:inline-flex}\n@media(max-width:960px){.telemetry-card{left:10px;right:10px;bottom:76px;min-width:0;padding:10px 14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px}.tele-row{margin:2px 0;font-size:11px}.tele-val{font-size:12px}.bottom-console{left:8px;right:8px;bottom:10px;transform:none;justify-content:center}.flight-cam button{padding:8px 10px;font-size:10px;min-height:42px}#pointsHud{top:54px!important;right:10px!important;padding:8px 11px!important;font-size:11px!important}}\n.rocket-tracker{position:fixed;z-index:30;display:none;transform:translate(-50%,-50%);width:42px;height:42px;border:1px solid #55dfff;background:rgba(3,18,31,.94);color:#eaffff;border-radius:50%;padding:0;font:800 10px Inter,Arial,sans-serif;box-shadow:0 0 20px rgba(53,200,255,.28);cursor:pointer;white-space:nowrap;align-items:center;justify-content:center}.rocket-tracker.show{display:flex}.rocket-tracker b{color:#61ddff;display:inline-flex;align-items:center;justify-content:center}.rocket-tracker span{display:none;position:absolute;left:46px;background:rgba(3,18,31,.96);border:1px solid #55dfff;border-radius:999px;padding:7px 10px}.rocket-tracker:hover span{display:block}.collision-warning{position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:35;display:none;padding:11px 16px;border:1px solid #ffd34f;border-radius:12px;background:rgba(76,55,0,.88);color:#ffe88a;font:900 12px Inter,Arial,sans-serif;box-shadow:0 0 28px rgba(255,195,40,.25);letter-spacing:.4px;text-align:center}.collision-warning.show{display:block;animation:warnPulse .7s infinite alternate}@keyframes warnPulse{to{box-shadow:0 0 38px rgba(255,195,40,.55);transform:translateX(-50%) scale(1.03)}}.mission-failed{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);color:#fff;text-align:center}.mission-failed.show{display:flex}.fail-card{width:min(480px,90vw);padding:28px;border:1px solid rgba(255,90,90,.65);border-radius:22px;background:linear-gradient(180deg,rgba(40,7,12,.94),rgba(6,12,20,.96));box-shadow:0 0 70px rgba(255,42,42,.25)}.fail-title{font:1000 30px Inter,Arial,sans-serif;letter-spacing:1.5px;color:#ff6666;text-shadow:0 0 24px rgba(255,45,45,.7)}.fail-sub{margin:9px 0 16px;color:#ffc0c0;font:800 13px Inter,Arial,sans-serif}.fail-hit{margin-bottom:22px;color:#d9e8f5;font:700 12.5px/1.6 Inter,Arial,sans-serif}.fail-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.fail-actions button{border:1px solid #55dfff;border-radius:12px;padding:12px 18px;min-height:44px;background:rgba(5,28,43,.95);color:white;font:900 12px Inter,Arial,sans-serif;cursor:pointer}.fail-actions .hangar{border-color:#ff7777;background:rgba(120,20,28,.9)}\n.flight-tele{display:none;margin-top:7px;gap:8px;flex-wrap:wrap;font:800 10px Inter,Arial,sans-serif;color:#cfefff}.flight-tele.show{display:flex}.flight-tele span{padding:4px 8px;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid rgba(120,200,255,.18)}.flight-tele b{color:#6fe3ff}.flight-tele .eng-on{color:#ffb24a}.flight-tele .eng-off{color:#8aa3b5}.flight-tele .eng-rcs{color:#e8f4ff}\n.speed-vignette{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 52%,rgba(0,8,22,.88) 100%)}\n.burn-flash{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(ellipse at center,rgba(255,190,110,.0) 40%,rgba(255,150,60,.22) 100%);transition:opacity .25s}\n.route-modal{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.74);backdrop-filter:blur(8px);color:#fff;text-align:center}.route-modal.show{display:flex}.route-card{width:min(510px,92vw);padding:26px;border:1px solid rgba(255,196,65,.75);border-radius:22px;background:linear-gradient(180deg,rgba(48,32,6,.95),rgba(7,13,22,.97));box-shadow:0 0 70px rgba(255,180,35,.28)}.route-title{font:1000 22px Inter,Arial,sans-serif;letter-spacing:.8px;color:#ffd257;text-shadow:0 0 20px rgba(255,190,40,.5);display:flex;align-items:center;justify-content:center;gap:8px}.route-sub{margin:8px 0 14px;color:#ffe59e;font:800 12px Inter,Arial,sans-serif;letter-spacing:.6px}.route-desc{margin-bottom:20px;color:#eaf4ff;font:600 13px/1.65 Inter,Arial,sans-serif;text-align:left;background:rgba(0,0,0,.28);padding:14px;border-radius:12px;border:1px solid rgba(255,210,90,.22)}.route-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.route-actions button{border:1px solid #ffd257;border-radius:12px;padding:12px 16px;min-height:44px;background:rgba(68,45,6,.92);color:#fff;font:900 12px Inter,Arial,sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.route-actions button.secondary{border-color:#55dfff;background:rgba(6,28,44,.95)}\n@media (orientation: landscape) and (max-height: 600px), (orientation: landscape) and (max-width: 1280px) and (max-height: 720px){\n  .top{top:max(6px,env(safe-area-inset-top,0px))!important;left:max(8px,env(safe-area-inset-left,0px))!important;right:auto!important;max-width:calc(100vw - 210px);gap:6px;flex-wrap:nowrap;z-index:32}\n  .nav-back-btn,.mobile-planet-toggle{min-height:36px!important;padding:6px 10px!important;font-size:11px!important;border-radius:10px!important}\n  .mobile-planet-toggle{display:inline-flex!important}\n  .brand,.hint,.legend{display:none!important}\n  #pointsHud{top:max(6px,env(safe-area-inset-top,0px))!important;right:calc(52px + env(safe-area-inset-right,0px))!important;padding:6px 10px!important;min-height:36px;display:inline-flex;align-items:center;font-size:10.5px!important;border-radius:10px!important;z-index:26!important}\n  .planet-nav{display:none!important;left:max(8px,env(safe-area-inset-left,0px))!important;top:calc(46px + env(safe-area-inset-top,0px))!important;bottom:auto!important;width:clamp(148px,21vw,188px)!important;max-height:calc(100dvh - 114px)!important;padding:6px!important;border-radius:12px!important;z-index:34!important}\n  .planet-nav.mobile-open{display:block!important}\n  .planet-nav .nav-title{font-size:9.5px!important;padding:4px 6px 6px!important}\n  .planet-btn{min-height:34px!important;padding:5px 7px!important;font-size:11px!important;gap:7px!important;border-radius:8px!important}\n  .dot{width:18px!important;height:18px!important}\n  .telemetry-card{left:max(8px,env(safe-area-inset-left,0px))!important;right:auto!important;bottom:max(8px,env(safe-area-inset-bottom,0px))!important;width:clamp(160px,22vw,215px)!important;min-width:0!important;padding:6px 10px!important;border-radius:11px!important;display:flex!important;flex-direction:column!important;gap:2px!important;z-index:24!important}\n  .tele-row{margin:0!important;font-size:10px!important;gap:6px!important;line-height:1.25!important}\n  .tele-lbl{font-size:9.5px!important;white-space:nowrap}\n  .tele-val{font-size:10.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}\n  .info{top:calc(46px + env(safe-area-inset-top,0px))!important;right:max(8px,env(safe-area-inset-right,0px))!important;left:auto!important;bottom:auto!important;width:clamp(245px,36vw,330px)!important;max-height:calc(100dvh - 94px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))!important;padding:10px 12px!important;border-radius:12px!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;z-index:33!important}\n  .info h2{font-size:clamp(16px,3.8vh,20px)!important;margin:0!important}\n  .sub{font-size:9.5px!important}\n  .planet-preview{width:48px!important;height:48px!important}\n  .desc{font-size:11px!important;line-height:1.4!important;margin:6px 0!important}\n  .grid{grid-template-columns:1fr 1fr!important;gap:5px!important}\n  .metric{min-height:44px!important;padding:6px 7px!important;border-radius:8px!important}\n  .metric span{font-size:8px!important}\n  .metric b{font-size:10.5px!important;line-height:1.25!important}\n  .section{margin-top:7px!important;padding:8px!important;border-radius:9px!important}\n  .section-title{font-size:9px!important;margin-bottom:4px!important}\n  .section p,.highlights{font-size:10.5px!important;line-height:1.4!important}\n  .no-landing-box{margin-top:7px!important;padding:8px 10px!important}\n  .no-landing-box p{font-size:10.5px!important}\n  .fly,.close{min-height:36px!important;padding:7px 10px!important;font-size:11px!important;border-radius:9px!important;margin-top:6px!important}\n  .bottom-console{left:calc(clamp(160px,22vw,215px) + 16px + env(safe-area-inset-left,0px))!important;right:max(8px,env(safe-area-inset-right,0px))!important;bottom:max(8px,env(safe-area-inset-bottom,0px))!important;transform:none!important;justify-content:center!important;gap:5px!important;z-index:30!important}\n  .console-actions,.flight-cam{gap:5px!important;flex-wrap:nowrap!important}\n  .flight-cam button{min-height:34px!important;padding:6px 9px!important;font-size:9.5px!important;border-radius:9px!important;white-space:nowrap!important;gap:4px!important}\n  .flight-cam button svg{width:12px!important;height:12px!important}\n  .landing-btn{min-height:34px!important;padding:6px 11px!important;font-size:10px!important;border-radius:9px!important}\n  .route-card,.fail-card{max-height:calc(100dvh - 20px)!important;overflow-y:auto!important;padding:14px 18px!important}\n  .route-title,.fail-title{font-size:16px!important}\n  .route-desc{padding:8px 10px!important;font-size:11px!important;margin-bottom:10px!important}\n  .route-actions button,.fail-actions button{min-height:36px!important;padding:8px 12px!important;font-size:11px!important}\n  .orbit-toast,.collision-warning{top:48px!important;font-size:10.5px!important;padding:6px 12px!important}\n}\n";
export const html = `\n<div id="speedVignette" class="speed-vignette"></div><div id="burnFlash" class="burn-flash"></div>\n<div class="loading" id="loading"><div>REALITY FORGE • SOLAR SYSTEM</div></div>\n<div id="orbitToast" class="orbit-toast"></div>\n<div id="collisionWarning" class="collision-warning">${SVG_ICO.warn} COLLISION WARNING • A/D/W/S TO EVADE</div>\n<div id="missionFailed" class="mission-failed"><div class="fail-card"><div class="fail-title">MISSION FAILED</div><div class="fail-sub">COLLISION DETECTED</div><div id="failHit" class="fail-hit">Impact detected</div><div class="fail-actions"><button id="retryMission" type="button">↻ RETRY MISSION</button><button id="exitMission" class="hangar" type="button">‹ EXIT MISSION</button></div></div></div>\n<div id="routeWarningModal" class="route-modal"><div class="route-card"><div class="route-title">${SVG_ICO.warn}<span>НИСЛЭГИЙН ЗАМЫН АНХААРУУЛГА</span></div><div id="routeWarnSub" class="route-sub">ГАРАГУУД ЭСРЭГ ТАЛД ЭСВЭЛ ЗАМ ХАЛХЛАГДСАН БАЙНА</div><div id="routeWarnDesc" class="route-desc"></div><div class="route-actions"><button id="autoAlignBtn" type="button">${SVG_ICO.fast}<span>ТОХИРОМЖТОЙ БАЙРЛАЛ ХҮРТЭЛ ХУРДЛУУЛАХ</span></button><button id="closeRouteWarnBtn" class="secondary" type="button">ТҮР ХҮЛЭЭХ / ХААХ</button></div></div></div>\n<button id="rocketTracker" class="rocket-tracker" type="button" title="FOLLOW ROCKET"><b>${SVG_ICO.rocket}</b><span id="rocketTrackerText">ROCKET</span></button>\n\n<div id="missionTelemetry" class="telemetry-card">\n  <div class="tele-row" id="teleRocketRow" style="display:none"><span class="tele-lbl">Пуужин:</span><b id="teleRocketName" class="tele-val" style="color:#67e8f9">—</b></div>\n  <div class="tele-row"><span class="tele-lbl">Хурд :</span><b id="teleSpeed" class="tele-val">120 km/h</b></div>\n  <div class="tele-row"><span class="tele-lbl">Очих газар:</span><b id="teleDest" class="tele-val">Дэлхий (Тойрог зам)</b></div>\n  <div class="tele-row"><span class="tele-lbl">G-Force:</span><b id="teleGforce" class="tele-val">0.0 G</b></div>\n</div>\n\n<div id="bottomConsole" class="bottom-console">\n  <div class="console-actions">\n    <div id="flightCam" class="flight-cam show">\n      <button data-cam="overview" type="button">${SVG_ICO.planet}<span>SEE SOLAR SYSTEM</span></button>\n      <button data-cam="side" type="button">ROCKET SIDE VIEW</button>\n      <button data-cam="follow" class="active" type="button">${SVG_ICO.rocket}<span>FOLLOW ROCKET</span></button>\n      <button data-cam="free" type="button">FREE CAMERA</button>\n    </div>\n    <button id="landingBtn" class="landing-btn" type="button">${SVG_ICO.land}<span>LANDING</span></button>\n  </div>\n</div>\n\n<div id="flightHud" style="display:none !important">\n  <span id="flightPhase"></span><span id="flightPct"></span><span id="flightText"></span>\n  <div id="flightTele"></div><i id="flightBar"></i>\n</div>\n\n<div id="pointsHud" class="glass" style="position:fixed;right:14px;top:58px;z-index:22;padding:10px 14px;font-weight:900;color:#75e5ff">MISSION POINTS: <span id="pointsValue">0</span></div>\n<div class="ui"><div class="top"><button id="backToMainLab" class="glass nav-back-btn" type="button" title="Үндсэн лаб руу буцах">‹ Үндсэн лаб</button><button id="mobilePlanetToggle" class="glass mobile-planet-toggle" type="button">Гарагууд ▾</button><div class="glass brand">${SVG_ICO.sun}<span>REALISTIC SOLAR SYSTEM</span></div><div class="glass hint">Гараг дээр дар • Drag: эргүүлэх • Scroll/Pinch: zoom</div></div><div class="glass legend"><b>TIME SCALE</b><br>90 сек = Дэлхийн 1 тойрог<br>Өргөтгөсөн том хэмжээст Нарны аймаг</div><nav class="glass planet-nav" id="planetNav"><div class="nav-title">НАРНЫ СИСТЕМ</div></nav><aside class="glass info" id="info"><div class="info-head"><div><div class="sub" id="type">PLANET</div><h2 id="name">Earth</h2></div><div class="planet-preview" id="planetPreview"></div></div><div class="desc" id="desc"></div><div class="grid"><div class="metric"><span>НАРНААС ЗАЙ</span><b id="distance"></b></div><div class="metric"><span>ДИАМЕТР</span><b id="diameter"></b></div><div class="metric"><span id="yearLabel">1 ЖИЛ</span><b id="year"></b></div><div class="metric"><span>ТЕМПЕРАТУР</span><b id="temp"></b></div><div class="metric"><span id="moonLabel">ДАГУУЛ</span><b id="moonCount"></b></div><div class="metric"><span>ГОЛ НАЙРЛАГА / МАТЕРИАЛ</span><b id="materialInfo"></b></div></div><div id="noLandingBox" class="no-landing-box" style="display:none"><div class="nl-title">${SVG_ICO.ban}<span>ГАЗАРДАХ БОЛОМЖГҮЙ ГАРАГ (ХИЙН БА МӨСӨН АВАРГА)</span></div><p><b>Боломж:</b> Газардах боломжгүй.</p><p><b>Шалтгаан:</b> Эдгээр гарагуудад зогсох, хөл тавих хатуу гадаргуу байхгүй.</p><p><b>Юу болох вэ?</b> Пуужин эдгээр гарагууд руу ороход гүнзгийрэх тусам асар их хийн даралт болон халуун температураас болж сүйрэн сорогдож, төв хэсэгтээ хүрэхээсээ өмнө бүрэн сүйрнэ.</p></div><div class="section"><div class="section-title">ОНЦЛОХ ЗҮЙЛС</div><ul class="highlights" id="highlights"></ul></div><div class="section"><div class="section-title">ХҮҮХДЭД ЭНГИЙНЭЭР</div><div class="simple-row"><div class="simple-icon">${SVG_ICO.planet}</div><p id="simpleInfo"></p></div></div><button class="fly" id="fly" type="button">${SVG_ICO.rocket}<span>ЭНЭ ГАРАГ РУУ НИСЭХ</span></button><button class="close" id="close" type="button">ХААХ</button></aside></div>\n`;
export default async function boot(ctx) {
  const { document, window, location, requestAnimationFrame, cancelAnimationFrame, setTimeout, clearTimeout,
          setInterval, clearInterval, addEventListener, removeEventListener } = ctx;



// Gas and Ice Giants have NO solid surface — landing is strictly impossible.
const NO_LANDING_PLANETS=new Set(['Jupiter','Saturn','Uranus','Neptune']);

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x010208); scene.fog=new THREE.FogExp2(0x010208,.00011);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,14000); camera.position.set(0,520,920);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0; document.body.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.045; controls.minDistance=7; controls.maxDistance=4600; controls.enablePan=true; controls.screenSpacePanning=true; controls.target.set(0,0,0);

scene.add(new THREE.AmbientLight(0x1a2234,.08)); const hemi=new THREE.HemisphereLight(0x8fa8c8,0x050508,.06);scene.add(hemi); const sunLight=new THREE.PointLight(0xfff4e0,82000,6500,1.42); scene.add(sunLight); const fill1=new THREE.DirectionalLight(0x9fb8d8,.06);fill1.position.set(-380,260,340);scene.add(fill1);const fill2=new THREE.DirectionalLight(0xffe2cc,.03);fill2.position.set(340,-160,-280);scene.add(fill2);

function stars(n,r1,r2,size,opacity,band=0){const p=[],c=[],tint=[[.66,.78,1],[.85,.9,1],[1,1,1],[1,.96,.86],[1,.84,.62],[1,.7,.5]];for(let i=0;i<n;i++){const v=new THREE.Vector3().randomDirection();if(band){v.y*=Math.pow(Math.random(),1.6)*band;v.normalize()}v.multiplyScalar(r1+Math.random()*(r2-r1));p.push(v.x,v.y,v.z);const t=tint[Math.floor(Math.pow(Math.random(),1.3)*tint.length)],b=Math.pow(Math.random(),3.2)*.9+.1;c.push(t[0]*b,t[1]*b,t[2]*b)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({vertexColors:true,size,transparent:true,opacity,sizeAttenuation:true,depthWrite:false,fog:false}));if(band)pts.rotation.set(.9,.4,.3);scene.add(pts)}
stars(10000,1600,6200,.75,.9);stars(1100,1200,5200,1.5,.82);stars(240,1200,4800,2.5,.92);stars(15000,2600,6200,.55,.45,.16);

// Expanded Solar System Dimensions & Orbits (~1.66x larger map & scaled planet sizes)
const planetData=[
{name:'Mercury',mn:'Буд',r:4.2,orbit:78,spin:.11,tilt:.01,distance:'57.9 сая км',diameter:'4,879 км',year:'88 өдөр',temp:'−180–430°C',moonCount:'0 — дагуулгүй',materialInfo:'Төмөр-никелийн том цөм, силикат чулуулгийн гадарга',desc:'Нартай хамгийн ойр, чулуурхаг, тогоо ихтэй жижиг гараг. Хатуу гадаргуутай тул газардах боломжтой.'},
{name:'Venus',mn:'Сугар',r:7.0,orbit:126,spin:-.025,tilt:.05,distance:'108.2 сая км',diameter:'12,104 км',year:'225 өдөр',temp:'≈465°C',moonCount:'0 — дагуулгүй',materialInfo:'Силикат чулуулаг; нүүрсхүчлийн хий (CO₂) давамгай өтгөн агаар мандал',desc:'Өтгөн нүүрсхүчлийн хийн агаар мандалтай, маш халуун чулуурхаг гараг.'},
{name:'Earth',mn:'Дэлхий',r:7.6,orbit:182,spin:.34,tilt:.41,distance:'149.6 сая км',diameter:'12,742 км',year:'365.25 өдөр',temp:'≈15°C дундаж',moonCount:'1 — Сар',materialInfo:'Силикат чулуулаг, төмөр-никелийн цөм; гадаргын шингэн ус',desc:'Шингэн устай, амьдрал оршдог бидний эх гараг.'},
{name:'Mars',mn:'Ангараг',r:5.8,orbit:246,spin:.32,tilt:.44,distance:'227.9 сая км',diameter:'6,779 км',year:'687 өдөр',temp:'≈−63°C',moonCount:'2 — Фобос, Деймос',materialInfo:'Силикат чулуулаг, төмрийн исэл; нимгэн CO₂ агаар мандал',desc:'Төмрийн исэл ихтэй учраас улаан харагддаг чулуурхаг гараг.'},
{name:'Jupiter',mn:'Бархасбадь',r:19.8,orbit:368,spin:.55,tilt:.055,distance:'778.5 сая км',diameter:'139,820 км',year:'11.86 жил',temp:'≈−110°C',moonCount:'Олон дагуултай • 4 гол дагуулыг 3D дээр үзүүлэв',materialInfo:'Устөрөгч, гелий; хатуу гадаргуу байхгүй (хийн аварга)',desc:'Нарны аймгийн хамгийн том хийн аварга. Хөл тавих хатуу гадаргуу байхгүй тул газардах боломжгүй — пуужин ороход асар их даралт, халуунд сүйрнэ.'},
{name:'Saturn',mn:'Санчир',r:16.6,orbit:508,spin:.49,tilt:.47,ring:true,distance:'1.43 тэрбум км',diameter:'116,460 км',year:'29.5 жил',temp:'≈−140°C',moonCount:'Олон байгалийн дагуултай',materialInfo:'Устөрөгч, гелий; хатуу гадаргуу байхгүй (хийн аварга)',desc:'Өргөн мөсөн цагирагаараа алдартай хийн аварга. Хатуу гадаргуу байхгүй тул газардах боломжгүй — гүн рүү ороход өндөр даралт, температурт сүйрнэ.'},
{name:'Uranus',mn:'Тэнгэрийн ван',r:11.4,orbit:658,spin:-.26,tilt:1.71,distance:'2.87 тэрбум км',diameter:'50,724 км',year:'84 жил',temp:'≈−195°C',moonCount:'Олон байгалийн дагуултай',materialInfo:'Устөрөгч, гелий, метан; хатуу гадаргуугүй мөсөн аварга',desc:'Тэнхлэг нь бараг хажуугаараа хэвтсэн мөсөн аварга. Зогсох хатуу гадаргуу байхгүй тул газардах боломжгүй.'},
{name:'Neptune',mn:'Далайн ван',r:11.0,orbit:815,spin:.29,tilt:.49,distance:'4.50 тэрбум км',diameter:'49,244 км',year:'164.8 жил',temp:'≈−200°C',moonCount:'Олон байгалийн дагуултай',materialInfo:'Устөрөгч, гелий, метан; хатуу гадаргуугүй мөсөн аварга',desc:'Алслагдсан, хөх өнгөтэй мөсөн аварга; маш хүчтэй салхитай. Хатуу гадаргуу байхгүй тул газардах боломжгүй.'}
];
const clickable=[];const bodies=[];const moons=[];const SIM_ORBIT_SECONDS=90;
const loader=new GLTFLoader();
// Progressive GLB loading: load core Solar System + Sun + initial moon template (~14.6 MB, <5ms when cached)
// so Space Simulation opens immediately, then stream heavy high-res secondary GLBs in background.
const [gltf,sunGltf,moonRockAGltf]=await Promise.all([
 loadCachedGLB(loader, RF_BASE+'assets/models/solar_system.glb'),
 loadCachedGLB(loader, RF_BASE+'assets/models/sun.glb'),
 loadCachedGLB(loader, RF_BASE+'assets/models/moon_rock_a.glb')
]);
const source=gltf.scene;
const externalModels={Sun:sunGltf.scene};
const sourceNames={Mercury:'mercury_BezierCircle_4_3',Venus:'venus_BezierCircle_7_6',Earth:'erath_BezierCircle_11_9',Mars:'mars_BezierCircle_14_12',Jupiter:'jupiter_BezierCircle_17_15',Saturn:'saturn_BezierCircle_21_18',Uranus:'uranus_BezierCircle_24_23',Neptune:'neptune_BezierCircle_27_26',Sun:'sun_53_55'};
function modelFor(name,r){
 const src=externalModels[name]||source.getObjectByName(sourceNames[name]); if(!src) throw new Error('GLB object not found: '+name);
 const inner=src.clone(true); inner.position.set(0,0,0); inner.rotation.set(0,0,0);
 inner.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.material=o.material.clone(); if(o.material.map)o.material.map.colorSpace=THREE.SRGBColorSpace; if(o.material.metalness!==undefined){o.material.metalness=Math.min(o.material.metalness,.05);o.material.roughness=Math.max(o.material.roughness??1,.78)} if(o.material.emissive&&!o.material.emissiveMap)o.material.emissive.setHex(0x000000); o.material.needsUpdate=true;}});
 const box=new THREE.Box3().setFromObject(inner), size=new THREE.Vector3(), center=new THREE.Vector3(); box.getSize(size);box.getCenter(center);
 inner.position.sub(center); const wrap=new THREE.Group();wrap.add(inner);wrap.scale.setScalar((r*2)/Math.max(size.x,size.y,size.z,0.001));return wrap;
}
const sunData={name:'Sun',mn:'Нар',r:25,moonCount:'8 гараг',materialInfo:'≈73% устөрөгч, ≈25% гелий; үлдсэн хэсэг нь хүнд элементүүд',distance:'0 км — Нарны системийн төв',diameter:'1,392,700 км',year:'≈25–35 өдөр эргэлт',temp:'≈5,500°C фотосфер',desc:'Нар бол Нарны системийн төвд орших од. Түүний таталцал 8 гараг болон бусад биетийг тойрог замд барьж, гэрэл ба дулаан нь Дэлхийн амьдралын үндсэн энергийн эх үүсвэр болдог.'};
const sun=modelFor('Sun',sunData.r);sun.userData=sunData;
sun.traverse(o=>{if(o.isMesh){const old=o.material;o.material=new THREE.MeshBasicMaterial({map:old.map||null,color:old.map?new THREE.Color(1.55,1.38,1.08):new THREE.Color(1,.88,.55),toneMapped:true});o.userData=sunData;clickable.push(o)}});scene.add(sun);
function glowTexture(stops){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),g=x.createRadialGradient(128,128,0,128,128,128);stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const sunGlowTex=glowTexture([[0,'rgba(255,248,225,1)'],[.18,'rgba(255,225,150,.55)'],[.4,'rgba(255,170,70,.16)'],[.7,'rgba(255,120,40,.04)'],[1,'rgba(255,100,30,0)']]);
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:sunGlowTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sunSprite.scale.setScalar(210);sunSprite.renderOrder=-1;scene.add(sunSprite);
const glow=new THREE.Mesh(new THREE.SphereGeometry(27.2,64,48),new THREE.MeshBasicMaterial({color:0xffb450,transparent:true,opacity:.06,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(glow);
const halo=new THREE.Mesh(new THREE.SphereGeometry(30.5,64,48),new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:.018,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(halo);
const coronaCount=600,coronaPos=new Float32Array(coronaCount*3);for(let i=0;i<coronaCount;i++){const v=new THREE.Vector3().randomDirection();const rr=25.8+Math.pow(Math.random(),3)*6.2;v.multiplyScalar(rr);coronaPos[i*3]=v.x;coronaPos[i*3+1]=v.y;coronaPos[i*3+2]=v.z;}const coronaGeo=new THREE.BufferGeometry();coronaGeo.setAttribute('position',new THREE.BufferAttribute(coronaPos,3));const corona=new THREE.Points(coronaGeo,new THREE.PointsMaterial({color:0xffc37a,size:.3,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(corona);

const unknownData={name:'UNKNOWN',mn:'UNKNOWN',r:50,distance:'???',diameter:'???',year:'UNKNOWN',temp:'???',moonCount:'UNKNOWN',materialInfo:'UNKNOWN',desc:'UNKNOWN'};
const blackHoleMaterials=[];
const blackHole=new THREE.Group();
blackHole.position.set(2950,720,-3850);
blackHole.rotation.set(.28,-.42,.32);
blackHole.userData=unknownData;
scene.add(blackHole);
const blackHoleBase=blackHole.position.clone();

const planetOrbitMaterials=[];
const orbitColors={Mercury:0xa0bccc,Venus:0xe2c18d,Earth:0x5fb5f8,Mars:0xeb7c5a,Jupiter:0xdeb580,Saturn:0xe2cfa2,Uranus:0x7ee4ee,Neptune:0x588cff};
const atmosphereSpec={Venus:{c:0xffd9a0,k:.9,s:1.045},Earth:{c:0x5aa8ff,k:1.35,s:1.04},Mars:{c:0xe0a078,k:.45,s:1.03},Jupiter:{c:0xe9d2b0,k:.35,s:1.025},Saturn:{c:0xf0dfb4,k:.35,s:1.025},Uranus:{c:0x9ee6ea,k:.7,s:1.035},Neptune:{c:0x4d78ff,k:.85,s:1.035}};
function makeAtmosphere(r,spec){return new THREE.Mesh(new THREE.SphereGeometry(r*spec.s,96,64),new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(spec.c)},uK:{value:spec.k}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vL;void main(){vec4 wp=modelMatrix*vec4(position,1.);vec3 ctr=modelMatrix[3].xyz;vN=normalize(wp.xyz-ctr);vL=normalize(-ctr);vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}',fragmentShader:'uniform vec3 uColor;uniform float uK;varying vec3 vN;varying vec3 vV;varying vec3 vL;void main(){float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),3.2);float lit=smoothstep(-.18,.45,dot(normalize(vN),normalize(vL)));gl_FragColor=vec4(uColor*f*lit*uK,f*lit);}'}))}
planetData.forEach((d,i)=>{
  const orbitMat=new THREE.MeshBasicMaterial({color:orbitColors[d.name]||0x6bb8f0,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
  planetOrbitMaterials.push(orbitMat);
  const halfWidth=Math.max(0.55,d.orbit*0.0022);
  const orbit=new THREE.Mesh(new THREE.RingGeometry(d.orbit-halfWidth,d.orbit+halfWidth,256),orbitMat);
  orbit.rotation.x=Math.PI/2;
  scene.add(orbit);
  const pivot=new THREE.Group();scene.add(pivot);pivot.rotation.y=i*.78+.35;const body=modelFor(d.name,d.r);body.position.x=d.orbit;body.rotation.z=d.tilt;body.userData=d;pivot.add(body);if(atmosphereSpec[d.name]){const atm=makeAtmosphere(d.r,atmosphereSpec[d.name]);atm.position.x=d.orbit;pivot.add(atm)}body.traverse(o=>{if(o.isMesh){o.userData=d;clickable.push(o)}});bodies.push({d,pivot,body});});

const moonSystems=[];
let moonModelSource=moonRockAGltf.scene;
let alternateMoonSources=[moonRockAGltf.scene];
function moonSourceFor(name){
 if(name==='Moon') return moonModelSource;
 let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;
 return alternateMoonSources[h%alternateMoonSources.length];
}
function removeClickableSubtree(rootObj){
 const dead=new Set();
 rootObj.traverse(o=>{if(o.isMesh)dead.add(o);});
 for(let i=clickable.length-1;i>=0;i--){if(dead.has(clickable[i]))clickable.splice(i,1);}
}
function refreshMoonVisual(m){
 const ud=m.mesh.userData;
 if(!ud)return;
 removeClickableSubtree(m.mesh);
 while(m.mesh.children.length)m.mesh.remove(m.mesh.children[0]);
 const rebuilt=makeNaturalMoonModel(ud.r,ud.name);
 m.mesh.scale.copy(rebuilt.scale);
 while(rebuilt.children.length)m.mesh.add(rebuilt.children[0]);
 m.mesh.traverse(o=>{if(o.isMesh){o.userData=ud;clickable.push(o);}});
}
// Stream high-detail secondary GLBs in background without blocking startup
loadCachedGLB(loader, RF_BASE+'assets/models/ton_618_black_hole.glb').then((bhGltf)=>{
 if(!renderer.domElement.isConnected)return;
 const bhInner=bhGltf.scene.clone(true);
 bhInner.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];o.material=mats.map(m=>m.clone());if(o.material.length===1)o.material=o.material[0];const cloned=Array.isArray(o.material)?o.material:[o.material];cloned.forEach(m=>{if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;const originalOpacity=m.opacity??1;m.transparent=true;m.opacity=originalOpacity*.42;m.needsUpdate=true;blackHoleMaterials.push({m,originalOpacity});});o.userData=unknownData;clickable.push(o);}});
 const box=new THREE.Box3().setFromObject(bhInner),sz=new THREE.Vector3();box.getSize(sz);
 bhInner.scale.setScalar(720/Math.max(sz.x,sz.y,sz.z,.001));
 blackHole.add(bhInner);
}).catch(()=>{});
loadCachedGLB(loader, RF_BASE+'assets/models/neptune.glb').then((nepGltf)=>{
 if(!renderer.domElement.isConnected)return;
 externalModels.Neptune=nepGltf.scene;
 const nepEntry=bodies.find(b=>b.d.name==='Neptune');
 if(nepEntry){
   removeClickableSubtree(nepEntry.body);
   while(nepEntry.body.children.length)nepEntry.body.remove(nepEntry.body.children[0]);
   const hi=modelFor('Neptune',nepEntry.d.r);
   nepEntry.body.scale.copy(hi.scale);
   while(hi.children.length)nepEntry.body.add(hi.children[0]);
   nepEntry.body.traverse(o=>{if(o.isMesh){o.userData=nepEntry.d;clickable.push(o);}});
 }
}).catch(()=>{});
loadCachedGLB(loader, RF_BASE+'assets/models/moon.glb').then((mGltf)=>{
 if(!renderer.domElement.isConnected)return;
 moonModelSource=mGltf.scene;
 const earthMoon=moons.find(m=>m.mesh.userData?.name==='Moon');
 if(earthMoon)refreshMoonVisual(earthMoon);
}).catch(()=>{});
Promise.all([
 loadCachedGLB(loader, RF_BASE+'assets/models/moon_rock_b.glb'),
 loadCachedGLB(loader, RF_BASE+'assets/models/moon_rock_c.glb')
]).then(([bGltf,cGltf])=>{
 if(!renderer.domElement.isConnected)return;
 alternateMoonSources=[moonRockAGltf.scene,bGltf.scene,cGltf.scene];
 moons.forEach(m=>{if(m.mesh.userData?.name!=='Moon')refreshMoonVisual(m);});
}).catch(()=>{});
function makeMoonSystem(body,d){const anchor=new THREE.Group();scene.add(anchor);moonSystems.push({body,anchor});return anchor;}
function makeNaturalMoonModel(targetRadius,name){
 const src=moonSourceFor(name).clone(true);
 src.position.set(0,0,0);src.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
 src.traverse(o=>{if(o.isMesh){if(Array.isArray(o.material))o.material=o.material.map(m=>m.clone());else if(o.material)o.material=o.material.clone();const mats=Array.isArray(o.material)?o.material:[o.material];mats.filter(Boolean).forEach(m=>{if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;m.needsUpdate=true;});}});
 const box=new THREE.Box3().setFromObject(src),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);src.position.sub(center);
 const wrap=new THREE.Group();wrap.add(src);const max=Math.max(size.x,size.y,size.z,.001);wrap.scale.setScalar((targetRadius*2)/max);return wrap;
}
function addMoon(anchor,d,name,r,dist,days,color=0xa7a29a,phase=0){
 const pivot=new THREE.Group();anchor.add(pivot);pivot.rotation.y=phase;pivot.rotation.z=(Math.random()-.5)*.16;
 const guideMat=new THREE.MeshBasicMaterial({color:0x7fa6bd,transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false});
 const guide=new THREE.Mesh(new THREE.RingGeometry(dist-.06,dist+.06,160),guideMat);guide.rotation.x=Math.PI/2;anchor.add(guide);
 const mesh=makeNaturalMoonModel(r,name);mesh.position.x=dist;
 const moonDescriptions={Moon:'Дэлхийн байгалийн дагуул. Хатуу гадаргуутай тул газардах боломжтой.',Phobos:'Ангарагийн дотор талын жижиг, бараан дагуул.',Deimos:'Ангарагийн гаднах жижиг дагуул.',Io:'Галт уулын идэвхжил ихтэй шаргал Галилейн дагуул.',Europa:'Мөсөн гадаргуутай, бор судлуудтай Галилейн дагуул.',Ganymede:'Нарны аймгийн хамгийн том байгалийн дагуул.',Callisto:'Бараан, тогоо ихтэй эртний гадаргуутай дагуул.',Enceladus:'Маш цайвар мөсөн гадаргуутай Санчирын дагуул.',Mimas:'Том тогоогоороо ялгардаг мөсөн дагуул.',Tethys:'Цайвар мөсөн гадаргуутай Санчирын дагуул.',Rhea:'Мөс, чулуулаг ихтэй тогоот дагуул.',Titan:'Өтгөн агаар мандалтай улбар шаргал том дагуул.',Titania:'Тэнгэрийн вангийн том мөсөн дагуул.',Oberon:'Бараан мөс-чулуулгийн гадаргуутай дагуул.',Triton:'Далайн вангийн том, хүйтэн мөсөн дагуул.'};
 mesh.userData={name,mn:(name==='Moon'?'Сар':name),r,parentName:d.name,isMoon:true,distance:'Дагуулын тойрог',diameter:'Харьцангуй хэмжээг 3D үзүүлэнд тохируулсан',year:(Number(days).toFixed(2))+' өдөр',temp:'—',moonCount:'0',materialInfo:'Чулуулаг ба/эсвэл мөс (Газардах боломжтой)',desc:moonDescriptions[name]||d.name+' гарагийн байгалийн дагуул.'};
 mesh.traverse(o=>{if(o.isMesh){o.userData=mesh.userData;clickable.push(o)}});
 pivot.add(mesh);moons.push({pivot,mesh,days,spin:.07+Math.random()*.16});return mesh;
}
bodies.forEach(({d,body})=>{
 const anchor=makeMoonSystem(body,d);
 if(d.name==='Earth') addMoon(anchor,d,'Moon',1.55,13.5,27.3,0xb8b4ac);
 if(d.name==='Mars'){addMoon(anchor,d,'Phobos',.52,9.2,.32,0x8d8277);addMoon(anchor,d,'Deimos',.38,12.0,1.26,0xa69a8e,1.7)}
 if(d.name==='Jupiter'){
   const big=[['Io',1.42,26,1.77,0xd8b36d],['Europa',1.28,31,3.55,0xc7b99f],['Ganymede',1.70,37,7.15,0x8f8174],['Callisto',1.55,43.5,16.69,0x746c63]];
   big.forEach((m,j)=>addMoon(anchor,d,...m,j*.9));
 }
 if(d.name==='Saturn'){
   const saturnMoons=[['Enceladus',.66,24.5,1.37],['Mimas',.55,28,.94],['Tethys',.76,32,1.89],['Rhea',.98,36.5,4.52],['Titan',1.58,42,15.95]];
   saturnMoons.forEach((m,j)=>addMoon(anchor,d,...m,0xbab4a7,j*1.05));
 }
 if(d.name==='Uranus'){addMoon(anchor,d,'Titania',.98,19.5,8.71,0xa8b2b1);addMoon(anchor,d,'Oberon',.92,23.5,13.46,0x858b8c,1.4)}
 if(d.name==='Neptune') addMoon(anchor,d,'Triton',1.12,19.5,5.88,0xa7b5b7);
});

const simpleFacts={
Sun:'Нар бол маш том, маш халуун од. Түүний гэрэл, дулаан Дэлхийд хүрч амьдралд хэрэгтэй энерги өгдөг. 8 гараг бүгд Нарыг тойрон эргэдэг.',
Mercury:'Нарт хамгийн ойр жижиг чулуурхаг гараг. Өдөр нь маш халуун, шөнө нь маш хүйтэн. Хатуу гадаргуутай тул газардаж болно.',
Venus:'Дэлхийтэй ойролцоо хэмжээтэй ч маш өтгөн нүүрсхүчлийн хийн агаар мандалтай, хамгийн халуун чулуурхаг гараг.',
Earth:'Бидний амьдардаг гараг. Гадаргын ихэнх хэсэг ус бөгөөд амьдрал оршдог цорын ганц мэдэгдэж буй гараг.',
Mars:'Улаан өнгө нь төмрийн исэл буюу зэвтэй холбоотой. Хүйтэн, нимгэн агаар мандалтай чулуурхаг гараг.',
Jupiter:'Нарны аймгийн хамгийн том хийн аварга гараг. Зогсох хатуу гадаргуу байхгүй тул пуужин газардах боломжгүй — гүн рүү нь орвол асар их даралт, халуунд сүйрнэ.',
Saturn:'Мөс, чулууны маш олон жижиг хэсгээс тогтсон том цагирагаараа алдартай хийн аварга. Хатуу гадаргуу байхгүй тул газардах боломжгүй.',
Uranus:'Мөсөн аварга гараг. Тэнхлэг нь маш их хазайсан тул бараг хажуугаараа эргэдэг. Хатуу гадаргуу байхгүй тул газардах боломжгүй.',
Neptune:'Нарнаас хамгийн хол том мөсөн аварга гараг. Хатуу гадаргуу байхгүй бөгөөд пуужин орвол асар их даралт ба халуунд төвд нь хүрэхээс өмнө бүрэн сүйрнэ.',
UNKNOWN:'UNKNOWN'
};

const highlights={
Sun:['Нар бол од — гараг биш.','Нарны системийн нийт массын 99.8%-аас илүүг эзэлдэг.','Гэрэл нь Дэлхийд ойролцоогоор 8 минут 20 секундэд хүрдэг.','Цөмд нь устөрөгч гелий болж нэгдэх цөмийн нэгдэл явагдана.'],
Mercury:['Нарт хамгийн ойр чулуурхаг гараг.','Жил нь ердөө 88 дэлхийн өдөр.','Хатуу гадаргуутай — газардах боломжтой.'],
Venus:['Нарны аймгийн хамгийн халуун гараг.','Өтгөн CO₂ агаар мандалтай.','Хатуу чулуурхаг гадаргуутай.'],
Earth:['Гадаргын ихэнх хэсгийг шингэн ус бүрхэнэ.','1 байгалийн дагуултай — Сар.','Амьдрал батлагдсан цорын ганц гараг.'],
Mars:['2 жижиг дагуултай — Фобос, Деймос.','Olympus Mons хэмээх аварга галт уултай.','Төмрийн исэл гадаргыг улаан харагдуулдаг.'],
Jupiter:['Газардах боломжгүй: Зогсох, хөл тавих хатуу гадаргуу байхгүй.','Пуужин ороход асар их хийн даралт, халуун температураас болж төвд нь хүрэхээс өмнө бүрэн сүйрнэ.','Галилейн 4 том дагуул (Io, Europa, Ganymede, Callisto) дээр газардаж болно.'],
Saturn:['Газардах боломжгүй: Хийн аварга тул хатуу гадаргуу байхгүй.','Гүнзгийрэх тусам асар их даралт, халуунд пуужин сорогдож сүйрнэ.','Дагуулууд (Titan, Enceladus гэх мэт) дээр нь газардах боломжтой.'],
Uranus:['Газардах боломжгүй: Мөсөн аварга тул хатуу гадаргуу байхгүй.','Асар их хийн даралт ба халуун температураас болж пуужин бүрэн сүйрнэ.','Тэнхлэг нь бараг хажуугаараа хэвтсэн.'],
Neptune:['Газардах боломжгүй: Мөсөн аварга тул хөл тавих хатуу гадаргуу байхгүй.','Гүн рүү ороход хэт их даралт, температураас болж пуужин сүйрнэ.','Triton дагуул дээр нь газардах боломжтой.'],
UNKNOWN:['UNKNOWN','???','UNKNOWN']
};
const navColors={Sun:'#ffad28',Mercury:'#88827b',Venus:'#d7a45d',Earth:'#2e80d0',Mars:'#b14c32',Jupiter:'#c59a73',Saturn:'#d9c69a',Uranus:'#76d4df',Neptune:'#315dcc'};

const previewHost=document.querySelector('#planetPreview');
const previewRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});previewRenderer.setPixelRatio(Math.min(devicePixelRatio,2));previewRenderer.setSize(86,86,false);previewRenderer.outputColorSpace=THREE.SRGBColorSpace;previewRenderer.toneMapping=THREE.ACESFilmicToneMapping;previewRenderer.toneMappingExposure=1.25;previewHost.appendChild(previewRenderer.domElement);
const previewScene=new THREE.Scene();const previewCamera=new THREE.PerspectiveCamera(34,1,.01,100);previewCamera.position.set(0,0,4.2);previewScene.add(new THREE.HemisphereLight(0xffffff,0x172033,2.1));const previewKey=new THREE.DirectionalLight(0xffffff,3.2);previewKey.position.set(3,3,4);previewScene.add(previewKey);let previewObject=null;
function setPreview(obj){
 if(previewObject)previewScene.remove(previewObject);
 previewObject=obj.clone(true); previewObject.position.set(0,0,0); previewObject.rotation.set(0,0,0); previewObject.scale.set(1,1,1);
 const remove=[];
 previewObject.traverse(x=>{if(x.isMesh){const mat=x.material;if(mat?.transparent && (mat.opacity??1)<=0.01){remove.push(x);return;}x.material=Array.isArray(mat)?mat.map(m=>m.clone()):mat.clone();const mats=Array.isArray(x.material)?x.material:[x.material];mats.forEach(m=>{if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;m.transparent=false;m.opacity=1;m.depthWrite=true;m.needsUpdate=true;});}});
 remove.forEach(x=>x.parent?.remove(x));
 const box=new THREE.Box3().setFromObject(previewObject),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);previewObject.position.sub(center);
 const max=Math.max(size.x,size.y,size.z,.001);previewObject.scale.setScalar(2.35/max);previewObject.rotation.x=.12;previewScene.add(previewObject);
}
const visualByName={Sun:sun,UNKNOWN:blackHole};bodies.forEach(x=>visualByName[x.d.name]=x.body);moons.forEach(x=>visualByName[x.mesh.userData.name]=x.mesh);

let flightRocket=null,rocketPlume=null,flightMode='idle',flightT=0,flightDestination=null,flightDestinationObj=null,flightCurve=null,flightLine=null,flightCamMode='overview',earthOrbitAngle=0,flightStartPos=null,flightControlPos=null,transferDuration=18,transferElapsed=0,arrivalOrbitAngle=0,steerX=0,steerY=0,crashed=false,launchOriginObj=null,collisionIgnoreObj=null,alignWaitTarget=null;
let missionPoints=Number(localStorage.getItem('rfMissionPoints')||0);const visited=new Set(JSON.parse(localStorage.getItem('rfVisited')||'[]'));document.querySelector('#pointsValue').textContent=missionPoints;
const flightHud=document.querySelector('#flightHud'),flightCam=document.querySelector('#flightCam'),flightPhase=document.querySelector('#flightPhase'),flightPct=document.querySelector('#flightPct'),flightText=document.querySelector('#flightText'),flightBar=document.querySelector('#flightBar');
const teleSpeed=document.querySelector('#teleSpeed'),teleDest=document.querySelector('#teleDest'),teleGforce=document.querySelector('#teleGforce');
function updateTelemetry(speedKmph,destName,gForceVal){
  if(teleSpeed)teleSpeed.textContent=(typeof speedKmph==='number'?Math.round(speedKmph).toLocaleString():speedKmph)+' km/h';
  if(teleDest)teleDest.textContent=destName||'Дэлхий';
  if(teleGforce)teleGforce.textContent=(typeof gForceVal==='number'?gForceVal.toFixed(1):gForceVal)+' G';
}
const rocketLoader=new GLTFLoader();
const flightForward=new THREE.Vector3(0,0,-1);

class SpaceRocketAudio {
  constructor(){this.ctx=null;this.noiseNode=null;this.filter=null;this.gain=null;this.subOsc=null;this.subGain=null;this.initialized=false;}
  init(){
    if(this.initialized)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();
      const bLen=this.ctx.sampleRate*2,buf=this.ctx.createBuffer(1,bLen,this.ctx.sampleRate),out=buf.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0;i<bLen;i++){const w=Math.random()*2-1;b0=0.99886*b0+w*0.0555;b1=0.99332*b1+w*0.075;b2=0.969*b2+w*0.153;b3=0.8665*b3+w*0.31;b4=0.55*b4+w*0.533;b5=-0.7616*b5-w*0.0169;out[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.536)*0.11;b6=w*0.1159;}
      this.noiseNode=this.ctx.createBufferSource();this.noiseNode.buffer=buf;this.noiseNode.loop=true;
      this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=160;this.filter.Q.value=3.2;
      this.gain=this.ctx.createGain();this.gain.gain.value=0;
      this.noiseNode.connect(this.filter);this.filter.connect(this.gain);
      this.subOsc=this.ctx.createOscillator();this.subOsc.type='sawtooth';this.subOsc.frequency.value=36;
      this.subFilter=this.ctx.createBiquadFilter();this.subFilter.type='lowpass';this.subFilter.frequency.value=75;
      this.subGain=this.ctx.createGain();this.subGain.gain.value=0;
      this.subOsc.connect(this.subFilter);this.subFilter.connect(this.subGain);
      this.master=this.ctx.createGain();this.master.gain.value=0.65;
      this.gain.connect(this.master);this.subGain.connect(this.master);this.master.connect(this.ctx.destination);
      this.noiseNode.start(0);this.subOsc.start(0);this.initialized=true;
    }catch(e){}
  }
  setThrust(thrust=0,pitchFactor=1.0){
    if(!this.initialized||!this.ctx)return;
    if(this.ctx.state==='suspended')this.ctx.resume();
    const now=this.ctx.currentTime,t=Math.max(0,Math.min(1.5,thrust));
    if(t<0.02){this.gain.gain.setTargetAtTime(0,now,0.08);this.subGain.gain.setTargetAtTime(0,now,0.08);}
    else{this.gain.gain.setTargetAtTime(Math.min(0.65,t*0.5),now,0.05);this.filter.frequency.setTargetAtTime(130+t*460*pitchFactor,now,0.05);this.subGain.gain.setTargetAtTime(Math.min(0.4,t*0.3),now,0.05);this.subOsc.frequency.setTargetAtTime(30+t*24*pitchFactor,now,0.05);}
  }
}
const spaceAudio=new SpaceRocketAudio();
['pointerdown','keydown','click'].forEach(evt=>addEventListener(evt,()=>spaceAudio.init(),{once:true}));

function setFlightForward(v){if(v&&v.lengthSq()>1e-8)flightForward.copy(v).normalize();}
function rocketBasis(){const f=flightForward.clone().normalize();let side=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0));if(side.lengthSq()<1e-5)side.set(1,0,0);side.normalize();const up=new THREE.Vector3().crossVectors(side,f).normalize();return {f,side,up};}
function setFollowFreeSee(mode){if(!flightRocket)return;const pos=worldPos(flightRocket),{f,side,up}=rocketBasis();controls.enabled=true;controls.enablePan=false;controls.minDistance=0.35;controls.maxDistance=32;controls.target.copy(pos);if(mode==='side')camera.position.copy(pos.clone().add(side.multiplyScalar(1.2)).add(up.multiplyScalar(.45)).add(f.clone().multiplyScalar(.15)));else camera.position.copy(pos.clone().add(f.clone().multiplyScalar(-3.2)).add(up.multiplyScalar(1.1)).add(side.multiplyScalar(0.65)));controls.update();}
function updateFollowFreeSee(){if(!flightRocket)return;const pos=worldPos(flightRocket);const delta=pos.clone().sub(controls.target);camera.position.add(delta);controls.target.copy(pos);controls.enabled=true;controls.enablePan=false;}
function worldPos(obj){const v=new THREE.Vector3();obj.getWorldPosition(v);return v}

// Realistic multi-layered space rocket exhaust flame (Mach shock diamonds + plasma core + high-speed particle jet)
function createSpaceRocketPlume(nozzleRadius=0.22,plumeLength=2.3){
  const group=new THREE.Group();
  const uniforms={uTime:{value:0},uThrust:{value:1}};
  const vert=`
    varying vec2 vUv;
    uniform float uTime;
    uniform float uThrust;
    void main(){
      vUv=uv;
      vec3 p=position;
      float down=1.0-uv.y;
      float wave=sin(down*10.0-uTime*45.0)*0.07+cos(down*19.0-uTime*62.0)*0.04;
      p.xz*=1.0+down*(0.65+0.35*uThrust)+wave*down;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }
  `;
  const outerFrag=`
    varying vec2 vUv;
    uniform float uTime;
    uniform float uThrust;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    void main(){
      float down=1.0-vUv.y;
      float radial=abs(vUv.x-0.5)*2.0;
      float n=noise(vec2(vUv.x*6.0,down*9.0-uTime*28.0))*0.6+noise(vec2(vUv.x*14.0,down*18.0-uTime*48.0))*0.4;
      float edge=smoothstep(1.0,0.06,radial+down*0.32*(n-0.45));
      float tipFade=smoothstep(0.0,0.05,down)*(1.0-smoothstep(0.42,1.0,down));
      float shock=pow(max(0.0,sin(down*26.0-uTime*40.0)),4.0)*(1.0-down)*smoothstep(0.55,0.0,radial);
      vec3 hotCore=vec3(1.0,0.98,0.92);
      vec3 midFlame=vec3(1.0,0.62,0.14);
      vec3 tailFlame=vec3(0.92,0.20,0.04);
      vec3 shockCol=vec3(0.62,0.88,1.0);
      vec3 col=mix(hotCore,midFlame,smoothstep(0.04,0.45,down));
      col=mix(col,tailFlame,smoothstep(0.42,0.95,down));
      col+=shockCol*shock*1.1;
      float alpha=edge*tipFade*(0.68+0.32*n)*uThrust;
      gl_FragColor=vec4(col*(1.5+shock*0.9),clamp(alpha,0.0,1.0));
    }
  `;
  const coreFrag=`
    varying vec2 vUv;
    uniform float uTime;
    uniform float uThrust;
    void main(){
      float down=1.0-vUv.y;
      float radial=abs(vUv.x-0.5)*2.0;
      float diamond=pow(max(0.0,sin(down*30.0-uTime*44.0)),3.0)*(1.0-down);
      float mask=smoothstep(0.85,0.0,radial)*(1.0-smoothstep(0.0,0.88,down));
      vec3 c=mix(vec3(0.80,0.95,1.0),vec3(1.0,0.86,0.42),down)+vec3(0.9,0.98,1.0)*diamond;
      gl_FragColor=vec4(c*1.9,clamp(mask*(0.85+0.25*diamond)*uThrust,0.0,1.0));
    }
  `;
  const outerMat=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:outerFrag,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});
  const coreMat=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:coreFrag,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});

  const outerGeo=new THREE.CylinderGeometry(nozzleRadius*0.55,nozzleRadius*2.2,plumeLength,28,20,true);
  outerGeo.translate(0,-plumeLength*0.5,0);
  const outerCone=new THREE.Mesh(outerGeo,outerMat);
  group.add(outerCone);

  for(let k=0;k<3;k++){
    const pg=new THREE.PlaneGeometry(nozzleRadius*2.8,plumeLength,6,18);
    pg.translate(0,-plumeLength*0.5,0);
    const pm=new THREE.Mesh(pg,outerMat);
    pm.rotation.y=(k*Math.PI)/3;
    group.add(pm);
  }

  const coreLen=plumeLength*0.64;
  const coreGeo=new THREE.CylinderGeometry(nozzleRadius*0.35,nozzleRadius*0.95,coreLen,20,14,true);
  coreGeo.translate(0,-coreLen*0.5,0);
  const coreCone=new THREE.Mesh(coreGeo,coreMat);
  group.add(coreCone);

  const flareTex=glowTexture([[0,'rgba(255,255,255,1)'],[.2,'rgba(255,235,175,.9)'],[.5,'rgba(255,140,35,.45)'],[1,'rgba(255,60,0,0)']]);
  const flare=new THREE.Sprite(new THREE.SpriteMaterial({map:flareTex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));
  flare.scale.setScalar(nozzleRadius*6.8);
  flare.position.y=-0.06;
  group.add(flare);

  const pCount=110,pPos=new Float32Array(pCount*3),pCol=new Float32Array(pCount*3),pPhase=new Float32Array(pCount),pRad=new Float32Array(pCount),pAng=new Float32Array(pCount);
  for(let i=0;i<pCount;i++){
    pPhase[i]=Math.random();
    pRad[i]=Math.pow(Math.random(),0.7)*nozzleRadius*1.6;
    pAng[i]=Math.random()*Math.PI*2;
  }
  const pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
  const pMat=new THREE.PointsMaterial({map:flareTex,size:0.42,vertexColors:true,transparent:true,opacity:0.95,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const pts=new THREE.Points(pGeo,pMat);
  group.add(pts);

  const tailLight=new THREE.PointLight(0xff9c38,5,16,1.5);
  tailLight.position.set(0,-0.35,0);
  group.add(tailLight);

  group.userData.update=(dt,thrust=1)=>{
    uniforms.uTime.value+=dt;
    const flick=0.88+0.12*Math.sin(uniforms.uTime.value*58)+0.06*Math.cos(uniforms.uTime.value*87);
    const eff=thrust*flick;
    uniforms.uThrust.value=eff;
    const sy=0.65+0.55*eff;
    outerCone.scale.set(0.9+0.15*eff,sy,0.9+0.15*eff);
    coreCone.scale.set(0.9+0.15*eff,sy,0.9+0.15*eff);
    flare.scale.setScalar(nozzleRadius*(5.2+2.4*eff));
    flare.material.opacity=Math.min(1,0.9*eff);
    tailLight.intensity=6*eff;
    const posAttr=pGeo.attributes.position,colAttr=pGeo.attributes.color;
    for(let i=0;i<pCount;i++){
      pPhase[i]=(pPhase[i]+dt*(2.8+1.5*(i%4)*0.3)*Math.max(0.35,thrust))%1;
      const u=pPhase[i],r=pRad[i]*(0.25+u*1.6),a=pAng[i]+uniforms.uTime.value*4*(i%2?1:-1);
      posAttr.setXYZ(i,Math.cos(a)*r,-u*plumeLength*1.15*sy,Math.sin(a)*r);
      if(u<0.28)colAttr.setXYZ(i,1,0.97,0.84);
      else if(u<0.68){const k=(u-0.28)/0.4;colAttr.setXYZ(i,1,0.86-k*0.42,0.52-k*0.44);}
      else{const k=(u-0.68)/0.32;colAttr.setXYZ(i,0.95-k*0.45,0.4*(1-k),0.08*(1-k));}
    }
    posAttr.needsUpdate=true;colAttr.needsUpdate=true;
    pMat.opacity=Math.min(1,0.95*thrust);
  };
  return group;
}

let rocketRoll=null;const rcsSprites=[];
function buildRocketHolder(rawScene){
  rawScene.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(rawScene);const size=box.getSize(new THREE.Vector3());
  rawScene.scale.setScalar(0.72/Math.max(size.x,size.y,size.z,0.001));
  rawScene.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(rawScene);
  rawScene.position.sub(box.getCenter(new THREE.Vector3()));
  rawScene.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false}});
  rawScene.updateMatrixWorld(true);
  const sBox=new THREE.Box3().setFromObject(rawScene);
  const wrap=new THREE.Group();
  rocketRoll=new THREE.Group();rocketRoll.add(rawScene);wrap.add(rocketRoll);
  rocketPlume=createSpaceRocketPlume(0.08,0.95);
  rocketPlume.position.set(0,sBox.min.y+0.02,0);
  wrap.add(rocketPlume);

  const rcsTex=glowTexture([[0,'rgba(255,255,255,1)'],[.3,'rgba(225,238,255,.65)'],[1,'rgba(200,220,255,0)']]);
  const topY=sBox.max.y*.7,rad=Math.max(.025,Math.max(sBox.max.x-sBox.min.x,sBox.max.z-sBox.min.z)*.5);
  for(let k=0;k<4;k++){const a=k*Math.PI/2,s=new THREE.Sprite(new THREE.SpriteMaterial({map:rcsTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,toneMapped:false}));s.position.set(Math.cos(a)*rad*1.6,topY,Math.sin(a)*rad*1.6);s.scale.setScalar(.07);rocketRoll.add(s);rcsSprites.push(s);}
  return wrap;
}
async function ensureFlightRocket(){
  if(flightRocket)return flightRocket;
  const bridgeCfg = window.SU_ROCKET_BRIDGE && typeof window.SU_ROCKET_BRIDGE.getState === 'function'
    ? window.SU_ROCKET_BRIDGE.getState()?.rocketConfig
    : null;
  const rawFile = sessionStorage.getItem('rfRocketFile') || bridgeCfg?.modelFile || (RF_BASE + 'assets/rockets/vulcan_centaur_rocket.glb');
  const file = resolveRfAssetPath(rawFile);
  try{
    const g = await loadCachedGLB(rocketLoader, file);
    flightRocket = buildRocketHolder(g.scene.clone(true));
    scene.add(flightRocket);
    flightRocket.visible = false;
    return flightRocket;
  }catch(e){console.error('Rocket GLB load failed',e);return null}
}

function objectRadius(o){return Math.max(1.0,o?.userData?.r||2.5)}
function lowOrbitRadius(o){
  const r=objectRadius(o);
  return o?.userData?.isMoon ? r + 3.2 : (r > 12 ? r * 1.38 + 4.2 : r * 1.35 + 3.2);
}
function parentBodyOf(o){const n=o?.userData?.parentName;return n?visualByName[n]:null}
function safeApproachPoint(targetObj,fromPos){
  const tp=worldPos(targetObj),parent=parentBodyOf(targetObj);
  let dir;
  if(fromPos){
    dir=fromPos.clone().sub(tp);
  }else if(parent){
    dir=tp.clone().sub(worldPos(parent));
  }else{
    dir=worldPos(visualByName.Earth).clone().sub(tp);
  }
  if(dir.lengthSq()<1e-5)dir.set(1,0,0);
  dir.normalize();
  return tp.clone().add(dir.multiplyScalar(lowOrbitRadius(targetObj)));
}

function sameBody(a,b){return !!a&&!!b&&(a===b||(a.userData?.name&&a.userData.name===b.userData?.name));}
function pointSegmentDistance(p,a,b){const ab=b.clone().sub(a),den=ab.lengthSq();if(den<1e-8)return p.distanceTo(a);const t=THREE.MathUtils.clamp(p.clone().sub(a).dot(ab)/den,0,1);return p.distanceTo(a.clone().addScaledVector(ab,t));}

// Pre-flight check: are the origin & destination on opposite sides of the Sun, or is the host planet / another planet blocking the route?
function checkRouteObstruction(originObj,destObj){
  if(!originObj||!destObj||sameBody(originObj,destObj))return null;
  const origRoot=parentBodyOf(originObj)||originObj;
  const destRoot=parentBodyOf(destObj)||destObj;
  const origName=originObj.userData?.mn||originObj.userData?.name||'Эх гараг';
  const destName=destObj.userData?.mn||destObj.userData?.name||'Очих гараг';

  // If transferring between a planet and its own moon, no solar conjunction applies
  if(sameBody(origRoot,destRoot))return null;

  const pA=worldPos(origRoot),pB=worldPos(destRoot);

  // 1) Host planet (e.g. Earth) blocking line-of-sight to the destination:
  // If the rocket is currently on the back/opposite side of the host planet relative to destObj:
  if(flightRocket){
    const rPos=flightRocket.position;
    const toRocket=rPos.clone().sub(pA).setY(0);
    const toDest=pB.clone().sub(pA).setY(0);
    const hostR=objectRadius(origRoot);
    const segHost=pointSegmentDistance(pA,rPos,pB);
    if(toRocket.lengthSq()>1e-4 && toDest.lengthSq()>1e-4){
      const hostFacingDot=toRocket.normalize().dot(toDest.normalize());
      if(hostFacingDot<-0.12 || segHost<hostR+1.3){
        return {
          type:'host_block',
          sub:`${origName.toUpperCase()} ГАРАГ ХАЛХАЛЖ БАЙНА (ПУУЖИН ЭСРЭГ ТАЛД)`,
          desc:`Одоогоор пуужин <b>${origName}</b> гарагийн цаад талд (<b>${destName}</b>-ийн эсрэг сүүдэр талд) тойрч байгаа тул гараг нэвтлэн шууд нисэх боломжгүй!<br><br>Гараг нэвтлэхээс сэргийлж шууд хөөрөхийг хориглолоо. Пуужин тойрог замаараа <b>${destName}</b> руу харсан талд гарч ирэхийг хүлээнэ үү эсвэл доорх товчоор тойрог замыг хурдасгана уу.`
        };
      }
    }
  }

  const vA=new THREE.Vector3(pA.x,0,pA.z),vB=new THREE.Vector3(pB.x,0,pB.z);
  const cosAngle=vA.clone().normalize().dot(vB.clone().normalize());
  const angleDeg=Math.round(THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(cosAngle,-1,1))));
  const sunDist=pointSegmentDistance(new THREE.Vector3(0,0,0),pA,pB);

  // 2) Opposite side of the Sun or path crosses dangerously close to the Sun
  if(cosAngle<-0.12 || sunDist<sunData.r*2.4){
    return {
      type:'opposite_sun',
      sub:'ГАРАГУУД НАРНЫ ЭСРЭГ ТАЛД БАЙНА',
      desc:`Одоогоор <b>${origName}</b> болон <b>${destName}</b> хоёр Нарны эсрэг талд (тойрог замын өнцөг: <b>${angleDeg}°</b>) байрлаж байна.<br><br>Энэ байрлалаас шууд нисвэл замд <b>Нар</b> болон бусад гарагийг нэвтлэх/мөргөх аюултай тул шууд хөөрөх боломжгүй! Гарагууд тойрог замаараа нэг талд орж ойртохыг хүлээх эсвэл доорх товчоор байрлалыг хурдлуулан тааруулна уу.`
    };
  }

  // 3) Another planet directly obstructing the straight corridor
  for(const {d,body} of bodies){
    if(sameBody(body,origRoot)||sameBody(body,destRoot))continue;
    const bp=worldPos(body);
    const segD=pointSegmentDistance(bp,pA,pB);
    if(segD<d.r*2.6+14){
      return {
        type:'planet_block',
        sub:`ЗАМД ${(d.mn||d.name).toUpperCase()} ГАРАГ ХАЛХАЛЖ БАЙНА`,
        desc:`Одоогоор <b>${origName}</b>-аас <b>${destName}</b> руу нисэх шууд замд <b>${d.mn||d.name} (${d.name})</b> гараг яг халхалж таарсан байна.<br><br>Гараг нэвтлэх болон мөргөлдөхөөс сэргийлж шууд нислэгийг түр хориглолоо. Гарагууд зөрж зам чөлөөлөгдөхийг хүлээнэ үү!`
      };
    }
  }
  return null;
}

// Compute a safe Bezier control point: straight direct line by default, deflecting only to avoid collision with Sun or planets
function computeSafeControlPoint(a,c){
  const mid=a.clone().lerp(c,.5);
  const ctrl=mid.clone();

  // Deflect control point only if the straight path passes dangerously near the Sun or any planet
  const allObstacles=[sun,...bodies.map(x=>x.body)];
  for(const obs of allObstacles){
    const op=worldPos(obs),safeR=objectRadius(obs)*2.4+10;
    const dSeg=pointSegmentDistance(op,a,c);
    if(dSeg<safeR){
      let away=mid.clone().sub(op);
      away.y=Math.max(away.y,safeR*.35);
      if(away.lengthSq()<1e-5)away.set(0,1,0);
      away.normalize();
      ctrl.addScaledVector(away,(safeR-dSeg)*1.5);
    }
  }
  return ctrl;
}

// Hard geometric guarantee: the rocket position can NEVER enter the interior of the Sun, any planet, or any moon
function enforceNoPlanetPenetration(pos){
  const allBodies=[sun,...bodies.map(x=>x.body),...moons.map(x=>x.mesh)];
  for(const b of allBodies){
    const center=worldPos(b),minSafe=objectRadius(b)+2.4;
    const diff=pos.clone().sub(center),d=diff.length();
    if(d<minSafe){
      if(d<1e-5)diff.set(0,1,0);else diff.divideScalar(d);
      pos.copy(center).addScaledVector(diff,minSafe);
    }
  }
  return pos;
}

function updateFlightCurve(){
  if(!flightDestination)return;
  const targetObj=flightDestinationObj||visualByName[flightDestination];
  if(!targetObj)return;
  const a=flightStartPos?.clone()||worldPos(visualByName.Earth);
  const c=safeApproachPoint(targetObj,a);
  if(!flightControlPos)flightControlPos=computeSafeControlPoint(a,c);
  flightCurve=new THREE.QuadraticBezierCurve3(a,flightControlPos,c);
  const pts=flightCurve.getPoints(160);
  if(flightLine){scene.remove(flightLine);flightLine.geometry.dispose();flightLine.material.dispose()}
  flightLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x5bdcff,transparent:true,opacity:.48,depthWrite:false}));
  scene.add(flightLine);
}

function orientRocket(dir,dt=.016){
  if(!flightRocket||dir.lengthSq()<1e-8)return;
  setFlightForward(dir);
  const target=flightRocket.quaternion.clone();
  const dummy=new THREE.Object3D();
  dummy.position.copy(flightRocket.position);
  dummy.lookAt(flightRocket.position.clone().add(dir));
  dummy.rotateX(Math.PI/2);
  target.copy(dummy.quaternion);
  flightRocket.quaternion.slerp(target,1-Math.exp(-dt*10));
}

/* ================= V41 REALISTIC SPACEFLIGHT SYSTEMS ================= */
function quatForDir(dir){const d=new THREE.Object3D();d.lookAt(dir);d.rotateX(Math.PI/2);return d.quaternion.clone();}
// Real transfer profile: departure burn (accelerate) -> coast with engine OFF -> 180° flip -> braking burn (decelerate to 0)
const FLIGHT_IGNITION=1.8,FLIGHT_BURN=.2,FLIGHT_FLIP=.08;
function flightProfile(u){const b=FLIGHT_BURN,vm=1/(1-b);if(u<b)return vm*u*u/(2*b);if(u<1-b)return vm*(b/2+(u-b));return 1-vm*(1-u)*(1-u)/(2*b);}
let flightDepOffset=new THREE.Vector3(),flightSpeed=0,prevFlightPos=null,flightPhaseKey='',camDragging=false,lastUserCam=0;
controls.addEventListener('start',()=>{camDragging=true;lastUserCam=performance.now();});
controls.addEventListener('end',()=>{camDragging=false;lastUserCam=performance.now();});
renderer.domElement.addEventListener('wheel',()=>{lastUserCam=performance.now();},{passive:true});

// --- Exhaust gas trail: particles keep flying away from the nozzle and slowly expand/fade in vacuum ---
const TRAIL_N=900,trailPos=new Float32Array(TRAIL_N*3),trailVel=new Float32Array(TRAIL_N*3),trailAge=new Float32Array(TRAIL_N).fill(99),trailLife=new Float32Array(TRAIL_N).fill(1),trailAlpha=new Float32Array(TRAIL_N),trailSize=new Float32Array(TRAIL_N),trailCol=new Float32Array(TRAIL_N*3);let trailHead=0;
const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(trailPos,3));trailGeo.setAttribute('aAlpha',new THREE.BufferAttribute(trailAlpha,1));trailGeo.setAttribute('aSize',new THREE.BufferAttribute(trailSize,1));trailGeo.setAttribute('aColor',new THREE.BufferAttribute(trailCol,3));
const trailTex=glowTexture([[0,'rgba(255,255,255,1)'],[.35,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]);
const trailMat=new THREE.ShaderMaterial({uniforms:{map:{value:trailTex},uPR:{value:renderer.getPixelRatio()}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:'attribute float aAlpha;attribute float aSize;attribute vec3 aColor;uniform float uPR;varying float vA;varying vec3 vC;void main(){vA=aAlpha;vC=aColor;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(160.,aSize*uPR*320./max(.1,-mv.z));gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform sampler2D map;varying float vA;varying vec3 vC;void main(){vec4 t=texture2D(map,gl_PointCoord);if(vA<.003)discard;gl_FragColor=vec4(vC*t.rgb,t.a*vA);}'});
const exhaustTrail=new THREE.Points(trailGeo,trailMat);exhaustTrail.frustumCulled=false;scene.add(exhaustTrail);
function emitTrail(pos,dir,count,speed,inheritVel){for(let c=0;c<count;c++){const i=trailHead;trailHead=(trailHead+1)%TRAIL_N;const j=i*3;trailPos[j]=pos.x+(Math.random()-.5)*.12;trailPos[j+1]=pos.y+(Math.random()-.5)*.12;trailPos[j+2]=pos.z+(Math.random()-.5)*.12;const sp=speed*(.75+Math.random()*.5);trailVel[j]=dir.x*sp+(Math.random()-.5)*.9+inheritVel.x*.15;trailVel[j+1]=dir.y*sp+(Math.random()-.5)*.9+inheritVel.y*.15;trailVel[j+2]=dir.z*sp+(Math.random()-.5)*.9+inheritVel.z*.15;trailAge[i]=0;trailLife[i]=1.4+Math.random()*1.6;}}
function updateTrail(dt){for(let i=0;i<TRAIL_N;i++){const j=i*3;if(trailAge[i]>=trailLife[i]){trailAlpha[i]=0;continue;}trailAge[i]+=dt;const k=Math.min(1,trailAge[i]/trailLife[i]);trailPos[j]+=trailVel[j]*dt;trailPos[j+1]+=trailVel[j+1]*dt;trailPos[j+2]+=trailVel[j+2]*dt;const drag=Math.exp(-dt*.7);trailVel[j]*=drag;trailVel[j+1]*=drag;trailVel[j+2]*=drag;trailAlpha[i]=Math.pow(1-k,1.7)*(k<.04?k/.04:1)*.5;trailSize[i]=.28+k*2.4;const h=THREE.MathUtils.smoothstep(k,0,.3);trailCol[j]=1-h*.5;trailCol[j+1]=.72-h*.1;trailCol[j+2]=.4+h*.36;}trailGeo.attributes.position.needsUpdate=true;trailGeo.attributes.aAlpha.needsUpdate=true;trailGeo.attributes.aSize.needsUpdate=true;trailGeo.attributes.aColor.needsUpdate=true;}

// --- Interplanetary dust streaks: stationary micro-particles the rocket passes -> real parallax + motion blur feel of speed ---
const STREAK_N=320,STREAK_R=34,streakP=[],streakArr=new Float32Array(STREAK_N*6),streakCol=new Float32Array(STREAK_N*6);
for(let i=0;i<STREAK_N;i++){streakP.push(new THREE.Vector3(1e6,1e6,1e6));streakCol.set([.75,.88,1,0,0,0],i*6);}
const streakGeo=new THREE.BufferGeometry();streakGeo.setAttribute('position',new THREE.BufferAttribute(streakArr,3));streakGeo.setAttribute('color',new THREE.BufferAttribute(streakCol,3));
const streakMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
const speedStreaks=new THREE.LineSegments(streakGeo,streakMat);speedStreaks.frustumCulled=false;scene.add(speedStreaks);
function respawnStreak(p,center,vdir,ahead){const perpA=new THREE.Vector3().crossVectors(vdir,Math.abs(vdir.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize(),perpB=new THREE.Vector3().crossVectors(vdir,perpA).normalize();const a=Math.random()*Math.PI*2,r=2+Math.sqrt(Math.random())*STREAK_R*.85;p.copy(center).addScaledVector(vdir,ahead?STREAK_R*(.35+Math.random()*.65):(Math.random()*2-1)*STREAK_R).addScaledVector(perpA,Math.cos(a)*r).addScaledVector(perpB,Math.sin(a)*r);}
let streaksInit=false;
function updateStreaks(center,vel,dt){const sp=vel.length(),target=THREE.MathUtils.clamp((sp-3)/26,0,1)*.75;streakMat.opacity+=(target-streakMat.opacity)*Math.min(1,dt*3);if(streakMat.opacity<.01&&sp<1){streaksInit=false;return;}const vdir=sp>1e-4?vel.clone().divideScalar(sp):new THREE.Vector3(0,0,1),len=Math.min(9,sp*.11);for(let i=0;i<STREAK_N;i++){const p=streakP[i];if(!streaksInit||p.distanceTo(center)>STREAK_R*1.05)respawnStreak(p,center,vdir,streaksInit);const j=i*6;streakArr[j]=p.x;streakArr[j+1]=p.y;streakArr[j+2]=p.z;streakArr[j+3]=p.x+vdir.x*len;streakArr[j+4]=p.y+vdir.y*len;streakArr[j+5]=p.z+vdir.z*len;}streaksInit=true;streakGeo.attributes.position.needsUpdate=true;}

// --- Cinematic chase camera: rides behind the direction of travel, user can still orbit (auto-returns after 3 s) ---
function cinematicFollow(dt,vdir){if(!flightRocket)return;updateFollowFreeSee();if(flightCamMode!=='follow'||camDragging||performance.now()-lastUserCam<3000||!vdir||vdir.lengthSq()<1e-6)return;const pos=worldPos(flightRocket),d=vdir.clone().normalize();let side=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,1,0));if(side.lengthSq()<1e-5)side.set(1,0,0);side.normalize();const up=new THREE.Vector3().crossVectors(side,d).normalize();const desired=pos.clone().addScaledVector(d,-9.5).addScaledVector(up,2.9).addScaledVector(side,2.3);camera.position.lerp(desired,1-Math.exp(-dt*.85));}
// --- Engine vibration camera shake (added just before render, removed next frame so OrbitControls is never disturbed) ---
const shakeOffset=new THREE.Vector3();let shakeAmp=0;
function setShake(a){shakeAmp=Math.max(shakeAmp,a);}
// --- RCS attitude thrusters ---
function updateRCS(active,dt){rcsSprites.forEach(s=>{const on=active&&Math.random()>.45;s.material.opacity=on?.55+Math.random()*.4:s.material.opacity*Math.exp(-dt*18);s.scale.setScalar(on?.22+Math.random()*.3:.22);});}
const flightTele=document.querySelector('#flightTele'),speedVignette=document.querySelector('#speedVignette'),burnFlash=document.querySelector('#burnFlash');
function setEngine(thrust,dt){if(!rocketPlume)return;if(thrust>.02){rocketPlume.visible=true;rocketPlume.userData.update(dt,thrust);}else rocketPlume.visible=false;}
function emitExhaust(thrust,vel){if(!flightRocket||!rocketPlume||thrust<.05)return;const nozzle=worldPos(rocketPlume),nose=new THREE.Vector3(0,1,0).applyQuaternion(flightRocket.quaternion).normalize();emitTrail(nozzle.addScaledVector(nose,-.25),nose.clone().negate(),Math.max(1,Math.round(4*thrust)),7.5*thrust,vel);}
const steerKeys={};addEventListener('keydown',e=>{steerKeys[e.key.toLowerCase()]=true});addEventListener('keyup',e=>{steerKeys[e.key.toLowerCase()]=false});
function updateSteering(dt){if(flightMode!=='transfer')return;const sx=(steerKeys.d?1:0)-(steerKeys.a?1:0),sy=(steerKeys.w?1:0)-(steerKeys.s?1:0);const precision=steerKeys.shift?.65:1,accel=34*precision,max=28;steerX=THREE.MathUtils.clamp(steerX+sx*dt*accel,-max,max);steerY=THREE.MathUtils.clamp(steerY+sy*dt*accel,-max,max);const damping=(sx||sy)?.22:1.8;steerX*=Math.exp(-dt*damping);steerY*=Math.exp(-dt*damping);}

function crashRocket(hit){if(crashed||!flightRocket)return;crashed=true;flightMode='crashed';updateTelemetry(0,'СҮЙРСЭН','0.0');document.querySelector('#collisionWarning').classList.remove('show');document.querySelector('#missionFailed').classList.add('show');document.querySelector('#failHit').textContent='Impact: '+(hit?.userData?.name||'Unknown object')+' • Mission points earned: +0';flightPhase.textContent='MISSION FAILED • COLLISION';flightText.textContent='Rocket collided with '+(hit?.userData?.name||'an object');const pos=worldPos(flightRocket);const geo=new THREE.BufferGeometry();const pts=[];for(let i=0;i<180;i++){pts.push(pos.x+(Math.random()-.5)*6,pos.y+(Math.random()-.5)*6,pos.z+(Math.random()-.5)*6)}geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffb02e,size:.85,transparent:true,opacity:1}));scene.add(particles);const shock=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0xffd15c,transparent:true,opacity:.7,wireframe:true}));shock.position.copy(pos);scene.add(shock);flightRocket.visible=false;let life=0;function fx(){life+=.025;shock.scale.setScalar(1+life*16);shock.material.opacity=Math.max(0,.7-life);particles.material.opacity=Math.max(0,1-life*.7);if(life<1.2)requestAnimationFrame(fx);else{scene.remove(shock,particles)}}fx();}
let previousRocketPos=null;
function collisionCheck(){
 if(flightMode!=='transfer'||!flightRocket)return;
 const rp=worldPos(flightRocket),prev=previousRocketPos?.clone()||rp.clone();let nearest=null,best=Infinity;
 const dest=flightDestinationObj,destParent=parentBodyOf(dest),candidates=[sun,...bodies.map(x=>x.body),...moons.map(x=>x.mesh)];
 for(const o of candidates){
   if(sameBody(o,dest))continue;
   if(dest?.userData?.isMoon&&sameBody(o,destParent))continue;
   if(sameBody(o,collisionIgnoreObj)){
     const clear=rp.distanceTo(worldPos(o))>lowOrbitRadius(o)*1.55;
     if(clear)collisionIgnoreObj=null; else continue;
   }
   const center=worldPos(o),radius=objectRadius(o),surfaceNow=rp.distanceTo(center)-radius,swept=pointSegmentDistance(center,prev,rp)-radius,d=Math.min(surfaceNow,swept);
   if(d<best){best=d;nearest=o}
 }
 previousRocketPos.copy(rp);
 const warning=document.querySelector('#collisionWarning');
 if(best<24){warning.textContent='⚠ COLLISION WARNING • '+(nearest?.userData?.name||'OBJECT')+' • WASD TO EVADE • SHIFT = PRECISION';warning.classList.add('show')}else warning.classList.remove('show');
 if(best<.35)crashRocket(nearest);
}

async function startSolarFlight(obj){
  const r=await ensureFlightRocket();if(!r)return;
  alignWaitTarget=null;
  document.querySelector('#collisionWarning').classList.remove('show');
  launchOriginObj=(flightMode==='landed'||flightMode==='arrived')&&flightDestinationObj?flightDestinationObj:visualByName.Earth;
  collisionIgnoreObj=launchOriginObj;
  flightDestinationObj=obj;
  flightDestination=obj.userData.name;

  // Launch directly from current verified orbit position without unnatural jumps
  const depPos=r.position.clone();
  flightStartPos=depPos.clone();
  flightDepOffset.copy(depPos).sub(worldPos(launchOriginObj));
  flightSpeed=0;prevFlightPos=depPos.clone();flightPhaseKey='';streaksInit=false;lastUserCam=0;
  flightTele.classList.add('show');

  flightMode='transfer';
  flightT=0;
  flightControlPos=null;
  steerX=steerY=0;
  transferElapsed=0;
  crashed=false;
  updateTelemetry(120,(obj.userData?.mn||obj.userData?.name||'Гараг'),1.2);
  previousRocketPos=depPos.clone();
  document.querySelector('#missionFailed').classList.remove('show');
  updateFlightCurve();
  document.querySelector('#landingBtn').classList.remove('show');
  r.visible=true;
  if(rocketPlume)rocketPlume.visible=false;
  document.querySelector('#info').classList.remove('open');
  selected=null;
  focusTarget=null;
  controls.enabled=false;
  flightHud.classList.add('show');
  flightCam.classList.add('show');
  flightPhase.textContent=(launchOriginObj?.userData?.name||'EARTH').toUpperCase()+' DEPARTURE • '+flightDestination.toUpperCase();
  flightText.textContent='Түлхэлт эхэлж байна • 5,000 km/h дээд хурд руу хурдалж байна';
  flightCamMode='follow';
  setFollowFreeSee('follow');
  document.querySelectorAll('#flightCam button').forEach(b=>b.classList.toggle('active',b.dataset.cam==='follow'));
}

// Attempt flight with pre-flight alignment/obstruction check
let pendingWarningTarget=null;
const routeWarningModal=document.querySelector('#routeWarningModal'),routeWarnSub=document.querySelector('#routeWarnSub'),routeWarnDesc=document.querySelector('#routeWarnDesc');
function requestSolarFlight(targetObj){
  if(!targetObj)return;
  const currentOrigin=(flightMode==='landed'||flightMode==='arrived')&&flightDestinationObj?flightDestinationObj:visualByName.Earth;
  const issue=checkRouteObstruction(currentOrigin,targetObj);
  if(issue){
    pendingWarningTarget=targetObj;
    routeWarnSub.textContent=issue.sub;
    routeWarnDesc.innerHTML=issue.desc;
    routeWarningModal.classList.add('show');
    return;
  }
  startSolarFlight(targetObj);
}
document.querySelector('#closeRouteWarnBtn').onclick=()=>{
  routeWarningModal.classList.remove('show');
  pendingWarningTarget=null;
};
document.querySelector('#autoAlignBtn').onclick=()=>{
  routeWarningModal.classList.remove('show');
  if(!pendingWarningTarget)return;
  alignWaitTarget=pendingWarningTarget;
  pendingWarningTarget=null;
  document.querySelector('#info').classList.remove('open');
  const warn=document.querySelector('#collisionWarning');
  warn.textContent='⏳ ГАРАГУУД ТОХИРОМЖТОЙ БАЙРЛАЛД ОРТОЛ ХУРДЛУУЛЖ БАЙНА...';
  warn.classList.add('show');
};

const OVERVIEW_CAM_POS=new THREE.Vector3(0,520,920);
const OVERVIEW_LOOK_TARGET=new THREE.Vector3(0,0,0);
let camTransition=null;
function transitionCameraTo(targetPos,targetLook,duration=1.0){
  controls.minDistance=7;
  controls.maxDistance=4600;
  controls.enablePan=true;
  camTransition={
    startPos:camera.position.clone(),
    startLook:controls.target.clone(),
    targetPos:targetPos.clone(),
    targetLook:targetLook.clone(),
    elapsed:0,
    duration:Math.max(0.25,duration)
  };
  controls.enabled=false;
}
renderer.domElement.addEventListener('pointerdown',()=>{
  if(camTransition){
    camTransition=null;
    controls.minDistance=7;
    controls.maxDistance=4600;
    controls.enablePan=true;
    controls.enabled=true;
  }
});

document.querySelectorAll('#flightCam button').forEach(b=>b.addEventListener('click',()=>{
  flightCamMode=b.dataset.cam;
  focusTarget=null;
  if(flightCamMode==='overview'){
    focusTarget=null;
    selected=null;
    document.querySelector('#info').classList.remove('open');
    document.querySelectorAll('.planet-btn').forEach(x=>x.classList.remove('active'));
    transitionCameraTo(OVERVIEW_CAM_POS,OVERVIEW_LOOK_TARGET,1.0);
  }else if(flightCamMode==='side'||flightCamMode==='follow'){
    setFollowFreeSee(flightCamMode);
  }else if(flightCamMode==='free'){
    controls.minDistance=7;
    controls.maxDistance=4600;
    controls.enabled=true;
    controls.enablePan=true;
    const forward=new THREE.Vector3();camera.getWorldDirection(forward);
    controls.target.copy(camera.position.clone().add(forward.multiplyScalar(32)));
  }else controls.enabled=false;
  document.querySelectorAll('#flightCam button').forEach(x=>x.classList.toggle('active',x===b));
}));
const rocketTracker=document.querySelector('#rocketTracker'),rocketTrackerText=document.querySelector('#rocketTrackerText');rocketTracker.onclick=()=>{if(!flightRocket)return;flightCamMode='follow';focusTarget=null;setFollowFreeSee('follow');document.querySelectorAll('#flightCam button').forEach(x=>x.classList.toggle('active',x.dataset.cam==='follow'));};
function updateRocketTracker(){if(!flightRocket||!flightRocket.visible||flightCamMode==='follow'||flightCamMode==='side'){rocketTracker.classList.remove('show');return;}const wp=worldPos(flightRocket),to=wp.clone().sub(camera.position),dist=to.length();const forward=new THREE.Vector3();camera.getWorldDirection(forward);const behind=forward.dot(to.normalize())<=0;const ndc=wp.clone().project(camera);const onScreen=!behind&&ndc.z>-1&&ndc.z<1&&Math.abs(ndc.x)<.88&&Math.abs(ndc.y)<.82; if(onScreen&&dist<120){rocketTracker.classList.remove('show');return;}let x=(ndc.x*.5+.5)*innerWidth,y=(-ndc.y*.5+.5)*innerHeight;if(behind){x=innerWidth-x;y=innerHeight-y;}x=Math.max(24,Math.min(innerWidth-24,x));y=Math.max(24,Math.min(innerHeight-24,y));rocketTracker.style.left=x+'px';rocketTracker.style.top=y+'px';rocketTrackerText.textContent='ROCKET • '+Math.round(dist)+' units';rocketTracker.classList.add('show');}

const nav=document.querySelector('#planetNav');
const mobilePlanetToggle=document.querySelector('#mobilePlanetToggle');
if(mobilePlanetToggle&&nav){
  mobilePlanetToggle.onclick=()=>{
    const isOpen=nav.classList.toggle('mobile-open');
    mobilePlanetToggle.textContent=isOpen?'Гарагууд ▴':'Гарагууд ▾';
  };
}
const backToMainLabBtn=document.querySelector('#backToMainLab');
if(backToMainLabBtn){
  backToMainLabBtn.onclick=()=>{
    try{spaceAudio.setThrust(0);}catch(e){}
    if(window.SU&&typeof window.SU.open==='function')window.SU.open('home');
    else location.href='index.html';
  };
}
[{name:'Sun',mn:'Нар',obj:sun},...bodies.map(x=>({name:x.d.name,mn:x.d.mn,obj:x.body}))].forEach(item=>{const b=document.createElement('button');b.className='planet-btn';b.type='button';b.innerHTML=`<span class="dot" style="background:${navColors[item.name]}"></span><span>${item.mn}</span>`;b.onclick=()=>{nav?.classList.remove('mobile-open');if(mobilePlanetToggle)mobilePlanetToggle.textContent='Гарагууд ▾';showInfo(item.obj);};b.dataset.name=item.name;nav.appendChild(b)});
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let selected=null,focusTarget=null;

function showInfo(o){
  const d=o.userData;if(!d?.name)return;
  selected=o;
  document.querySelector('#type').textContent=d.name==='Sun'?'STAR • ОД':(d.name==='UNKNOWN'?'UNKNOWN':(NO_LANDING_PLANETS.has(d.name)?'GAS / ICE GIANT • ХИЙН БА МӨСӨН АВАРГА':'PLANET'));
  document.querySelector('#name').textContent=(d.mn?d.mn+' • ':'')+d.name;
  document.querySelector('#desc').textContent=d.desc||'';
  document.querySelector('#distance').textContent=d.distance||'—';
  document.querySelector('#diameter').textContent=d.diameter||'—';
  document.querySelector('#year').textContent=d.year||'—';
  document.querySelector('#temp').textContent=d.temp||'—';
  document.querySelector('#moonCount').textContent=d.moonCount??'—';
  document.querySelector('#materialInfo').textContent=d.materialInfo??'—';
  document.querySelector('#yearLabel').textContent=d.name==='Sun'?'ЭРГЭЛТИЙН ХУГАЦАА':'1 ЖИЛ';
  document.querySelector('#moonLabel').textContent=d.name==='Sun'?'ТОЙРОН ЭРГЭХ ГАРАГ':'ДАГУУЛ';
  document.querySelector('#simpleInfo').textContent=simpleFacts[d.name]||((d.mn||d.name)+' нь байгалийн дагуул.');
  document.querySelector('#highlights').innerHTML=(highlights[d.name]||[]).map(x=>'<li>'+x+'</li>').join('');
  document.querySelector('#noLandingBox').style.display=NO_LANDING_PLANETS.has(d.name)?'block':'none';
  document.querySelectorAll('.planet-btn').forEach(b=>b.classList.toggle('active',b.dataset.name===d.name));
  const fly=document.querySelector('#fly');
  if(d.name==='Sun'||d.name==='UNKNOWN'){
    fly.innerHTML=d.name==='UNKNOWN'?'<span>UNKNOWN</span>':`${SVG_ICO.ban}<span>НАР РУУ НИСЭХ БОЛОМЖГҮЙ</span>`;
    fly.disabled=true;fly.style.opacity='.48';fly.style.cursor='not-allowed';
  }else{
    const label=NO_LANDING_PLANETS.has(d.name)?(d.mn||d.name)+' ТОЙРОГ ЗАМ РУУ НИСЭХ (ГАЗАРДАХГҮЙ)':(d.mn||d.name)+' РУУ НИСЭХ';
    fly.innerHTML=`${SVG_ICO.rocket}<span>${label}</span>`;
    fly.disabled=false;fly.style.opacity='1';fly.style.cursor='pointer';fly.dataset.destination=d.name;
  }
  const visual=visualByName[d.name]||o;
  setPreview(visual);
  document.querySelector('#info').classList.add('open');
  if(d.name==='Sun'){
    // When Sun is clicked: show full Solar System overview, NEVER zoom in against the Sun!
    focusTarget=null;
    flightCamMode='overview';
    document.querySelectorAll('#flightCam button').forEach(x=>x.classList.toggle('active',x.dataset.cam==='overview'));
    transitionCameraTo(OVERVIEW_CAM_POS,OVERVIEW_LOOK_TARGET,1.0);
  }else{
    focusTarget=visual;
  }
}
function pickAt(e){const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);return ray.intersectObjects(clickable,true);}
renderer.domElement.addEventListener('pointermove',e=>{renderer.domElement.style.cursor=pickAt(e).length?'pointer':'grab';});
renderer.domElement.addEventListener('pointerup',e=>{const hits=pickAt(e);if(hits[0]){let o=hits[0].object;while(o&&!o.userData?.name)o=o.parent;if(o)showInfo(o)}});
document.querySelector('#fly').onclick=()=>{if(!selected)return;const d=selected.userData;if(d.name==='Sun'||d.name==='UNKNOWN')return;requestSolarFlight(selected);};
document.querySelector('#close').onclick=()=>{document.querySelector('#info').classList.remove('open');focusTarget=null;selected=null};

function showOrbitToast(msg, ms=4200){
  const el=document.querySelector('#orbitToast');
  if(!el)return;
  el.textContent=msg;
  el.classList.add('show');
  setTimeout(()=>{el.classList.remove('show');},ms);
}

function syncRocketTelemetryBadge(){
  const bridgeState=window.SU_ROCKET_BRIDGE&&typeof window.SU_ROCKET_BRIDGE.getState==='function'?window.SU_ROCKET_BRIDGE.getState():null;
  const row=document.querySelector('#teleRocketRow'),val=document.querySelector('#teleRocketName');
  if(row&&val&&bridgeState?.rocketConfig?.name){
    row.style.display='flex';
    val.textContent=bridgeState.rocketConfig.name+(bridgeState.isComplete?' (11/11)':'');
  }
}
syncRocketTelemetryBadge();

async function enterRealEarthOrbit(opts={}){
  const r=await ensureFlightRocket();if(!r)return;
  flightMode='earthOrbit';
  flightDestinationObj=visualByName.Earth;
  flightDestination='Earth';
  launchOriginObj=visualByName.Earth;
  r.visible=true;
  if(rocketPlume)rocketPlume.visible=true;
  flightHud.classList.add('show');
  flightCam.classList.add('show');
  if(landingBtn)landingBtn.classList.remove('show');
  flightTele.classList.remove('show');
  flightPhase.textContent='EARTH ORBIT';
  flightText.textContent='Solar System — Дэлхийн тойрог замд байна • Очих гарагаа сонгоно уу';
  flightPct.textContent='0%';
  flightBar.style.width='0%';
  updateTelemetry(120,'Дэлхий (Тойрог зам)','0.0');
  const ep=worldPos(visualByName.Earth),rr=lowOrbitRadius(visualByName.Earth);
  earthOrbitAngle=0;
  r.position.set(ep.x+rr,ep.y,ep.z);
  enforceNoPlanetPenetration(r.position);
  const next=earthOrbitAngle+.04;
  const orbitNext=new THREE.Vector3(ep.x+Math.cos(next)*rr,ep.y+Math.sin(next)*rr*0.12,ep.z+Math.sin(next)*rr);
  setFlightForward(orbitNext.clone().sub(r.position));
  r.lookAt(orbitNext);
  r.rotateX(Math.PI/2);
  if(opts.fromLaunch){
    flightCamMode='follow';
    setFollowFreeSee('follow');
    document.querySelectorAll('#flightCam button').forEach(b=>b.classList.toggle('active',b.dataset.cam==='follow'));
    showOrbitToast('Пуужин Дэлхийн тойрог замд амжилттай орлоо • Очих гарагаа сонгож ниснэ үү');
  }else{
    flightCamMode='overview';
    controls.minDistance=7;
    controls.maxDistance=4600;
    controls.enablePan=true;
    controls.target.copy(OVERVIEW_LOOK_TARGET);
    camera.position.copy(OVERVIEW_CAM_POS);
    camera.lookAt(OVERVIEW_LOOK_TARGET);
    controls.update();
    document.querySelectorAll('#flightCam button').forEach(b=>b.classList.toggle('active',b.dataset.cam==='overview'));
  }
}
async function enterReturnedPlanetOrbit(name){
  const obj=visualByName[name];
  if(!obj||name==='Earth'){await enterRealEarthOrbit();return;}
  const r=await ensureFlightRocket();if(!r)return;
  flightDestination=name;
  flightDestinationObj=obj;
  launchOriginObj=obj;
  collisionIgnoreObj=obj;
  flightMode='arrived';
  arrivalOrbitAngle=0;
  r.visible=true;
  if(rocketPlume)rocketPlume.visible=true;
  flightHud.classList.add('show');
  flightCam.classList.add('show');
  if(landingBtn)landingBtn.classList.remove('show');
  flightTele.classList.remove('show');
  flightPhase.textContent=name.toUpperCase()+' ORBIT';
  flightText.textContent=NO_LANDING_PLANETS.has(name)?'Хийн/мөсөн аварга гарагт хатуу гадаргуу байхгүй тул газардах боломжгүй':'Surface launch complete • Дараагийн очих гарагаа сонгоно уу';
  flightPct.textContent='100%';
  flightBar.style.width='100%';
  flightCamMode='overview';
  updateTelemetry(120,(obj.userData?.mn||name)+' (Тойрог зам)','0.0');
  const p=worldPos(obj),rr=lowOrbitRadius(obj);
  r.position.set(p.x+rr,p.y,p.z);
  enforceNoPlanetPenetration(r.position);
  setFlightForward(new THREE.Vector3(0,0,1));
  controls.minDistance=7;
  controls.maxDistance=4600;
  controls.enablePan=true;
  controls.target.copy(OVERVIEW_LOOK_TARGET);
  camera.position.copy(OVERVIEW_CAM_POS);
  camera.lookAt(OVERVIEW_LOOK_TARGET);
  controls.update();
  document.querySelectorAll('#flightCam button').forEach(b=>b.classList.toggle('active',b.dataset.cam==='overview'));
}
const landingBtn=document.querySelector('#landingBtn');
if(landingBtn)landingBtn.classList.remove('show');
const returnedPlanet=sessionStorage.getItem('rfSurfaceReturn');
const fromRocketLaunch=sessionStorage.getItem('rfFromLaunch')==='1'||Boolean(window.SU_ROCKET_BRIDGE?.getState?.()?.pendingLaunchHandoff);
if(returnedPlanet && returnedPlanet!=='Earth'){
  sessionStorage.removeItem('rfSurfaceReturn');
  sessionStorage.removeItem('rfFromLaunch');
  if(window.SU_ROCKET_BRIDGE?.markInSpace)window.SU_ROCKET_BRIDGE.markInSpace({scene:'solar',orbit:returnedPlanet});
  enterReturnedPlanetOrbit(returnedPlanet);
} else {
  sessionStorage.removeItem('rfSurfaceReturn');
  sessionStorage.removeItem('rfFromLaunch');
  if(window.SU_ROCKET_BRIDGE?.markInSpace)window.SU_ROCKET_BRIDGE.markInSpace({scene:'solar',orbit:'Earth'});
  enterRealEarthOrbit({fromLaunch:fromRocketLaunch});
}
window.REALITY_FORGE={enterEarthOrbit:(opts)=>enterRealEarthOrbit(opts),enterOrbit:(name)=>enterReturnedPlanetOrbit(name),selectPlanet:(name)=>{const o=visualByName[name];if(o){showInfo(o);return true;}return false;},flyToPlanet:(name)=>{const o=visualByName[name];if(o&&name!=='Sun'&&name!=='UNKNOWN'){selected=o;requestSolarFlight(o);return true;}return false;},getState:()=>({flightMode,flightDestination,flightCamMode,hasRocket:Boolean(flightRocket&&flightRocket.visible),planetCount:bodies.length}),version:'V41'};

landingBtn.onclick=()=>{
  if(flightMode!=='arrived'||!flightDestinationObj||NO_LANDING_PLANETS.has(flightDestination))return;
  const activeModel=resolveRfAssetPath(sessionStorage.getItem('rfRocketFile')||window.SU_ROCKET_BRIDGE?.getState?.()?.rocketConfig?.modelFile);
  sessionStorage.setItem('rfSurfacePlanet',flightDestination);
  sessionStorage.setItem('rfSurfaceRocket',activeModel);
  sessionStorage.setItem('rfSurfaceEntry','landing');
  if(window.SU_ROCKET_BRIDGE?.markInSpace)window.SU_ROCKET_BRIDGE.markInSpace({scene:'surface',orbit:flightDestination});
  location.href='surface_dimension.html';
};
document.querySelector('#exitMission').onclick=()=>{
  sessionStorage.setItem('rfExitMission','1');
  if(window.SU&&typeof window.SU.open==='function')window.SU.open('home');
  else location.href='index.html';
};
document.querySelector('#retryMission').onclick=()=>{
  document.querySelector('#missionFailed').classList.remove('show');
  document.querySelector('#collisionWarning').classList.remove('show');
  crashed=false;collisionIgnoreObj=null;previousRocketPos=null;
  if(flightRocket)flightRocket.visible=true;
  const origin=launchOriginObj||visualByName.Earth;
  flightDestinationObj=origin;
  flightDestination=origin.userData?.name||'Earth';
  flightMode=origin===visualByName.Earth?'earthOrbit':'arrived';
  arrivalOrbitAngle=0;
  flightCamMode='follow';
  setFollowFreeSee('follow');
  document.querySelectorAll('#flightCam button').forEach(b=>b.classList.toggle('active',b.dataset.cam==='follow'));
  flightPhase.textContent=(flightDestination||'EARTH').toUpperCase()+' ORBIT';
  flightText.textContent='Safe orbit restored • destination сонгоод дахин оролдоно';
  updateTelemetry(120,(origin?.userData?.mn||flightDestination||'Дэлхий')+' (Тойрог зам)','0.0');
};

const clock=new THREE.Clock();let elapsed=0;
function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.04);
  const orbitMultiplier=alignWaitTarget?14:1;
  const simDt=dt*orbitMultiplier;
  elapsed+=simDt;

  bodies.forEach(({d,pivot,body})=>{
    const days=d.year.includes('өдөр')?parseFloat(d.year):({Jupiter:4332.6,Saturn:10759,Uranus:30687,Neptune:60190}[d.name]||365.25);
    const period=Math.max(18,SIM_ORBIT_SECONDS*(days/365.25));
    pivot.rotation.y+=simDt*(Math.PI*2/period);
    body.rotation.y+=dt*d.spin*.18;
  });
  sun.rotation.y+=dt*.018;
  glow.scale.setScalar(1+Math.sin(elapsed*1.3)*.018);
  halo.scale.setScalar(1+Math.sin(elapsed*.8)*.026);
  corona.rotation.y+=dt*.018;
  blackHole.rotation.y+=dt*.025;
  blackHole.rotation.z+=dt*.006;
  blackHole.position.y=blackHoleBase.y+Math.sin(elapsed*.12)*5;
  blackHole.position.x=blackHoleBase.x+Math.sin(elapsed*.055)*3;
  const blackHoleSelected=selected?.userData?.name==='UNKNOWN';
  blackHoleMaterials.forEach(({m,originalOpacity})=>{const target=originalOpacity*(blackHoleSelected?1:.42);m.opacity=THREE.MathUtils.lerp(m.opacity,target,Math.min(1,dt*2.4));});
  moonSystems.forEach(ms=>{const wp=new THREE.Vector3();ms.body.getWorldPosition(wp);ms.anchor.position.copy(wp);ms.anchor.rotation.z=ms.body.rotation.z;});
  moons.forEach(m=>{m.pivot.rotation.y+=simDt*(Math.PI*2/Math.max(5,12+m.days*1.4));m.mesh.rotation.y+=dt*m.spin;m.mesh.rotation.x+=dt*m.spin*.35});
  const farFactor=THREE.MathUtils.clamp((camera.position.length()-180)/520,0,1);
  planetOrbitMaterials.forEach(m=>m.opacity=.42+farFactor*.44);

  // If waiting for auto-alignment of planets, check if the path is now clear
  if(alignWaitTarget){
    const currentOrigin=(flightMode==='landed'||flightMode==='arrived')&&flightDestinationObj?flightDestinationObj:visualByName.Earth;
    if(!checkRouteObstruction(currentOrigin,alignWaitTarget)){
      const readyTarget=alignWaitTarget;
      alignWaitTarget=null;
      document.querySelector('#collisionWarning').classList.remove('show');
      startSolarFlight(readyTarget);
    }
  }

  if(camTransition){
    camTransition.elapsed+=dt;
    const t=Math.min(1,camTransition.elapsed/camTransition.duration);
    const ease=t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    camera.position.lerpVectors(camTransition.startPos,camTransition.targetPos,ease);
    controls.target.lerpVectors(camTransition.startLook,camTransition.targetLook,ease);
    camera.lookAt(controls.target);
    if(t>=1){
      camTransition=null;
      controls.minDistance=7;
      controls.maxDistance=4600;
      controls.enablePan=true;
      controls.enabled=true;
      controls.update();
    }
  }

  if(focusTarget&&focusTarget.userData?.name!=='Sun'&&flightCamMode!=='overview'&&!camTransition){
    const wp=new THREE.Vector3();focusTarget.getWorldPosition(wp);
    controls.target.lerp(wp,Math.min(1,dt*2.2));
    const ideal=focusTarget.geometry?.boundingSphere?.radius||focusTarget.userData.r||10;
    const targetDist=Math.max(38,(focusTarget.userData.r||10)*5);
    if(camera.position.distanceTo(wp)>Math.max(36,ideal*5.2)){
      const dir=camera.position.clone().sub(controls.target).normalize();
      camera.position.lerp(wp.clone().add(dir.multiplyScalar(targetDist)),Math.min(1,dt*1.2));
    }
  }

  if(flightMode==='earthOrbit'&&flightRocket){
    const ep=worldPos(visualByName.Earth);
    earthOrbitAngle+=simDt*0.07;
    const rr=lowOrbitRadius(visualByName.Earth);
    flightRocket.position.set(ep.x+Math.cos(earthOrbitAngle)*rr,ep.y+Math.sin(earthOrbitAngle)*rr*0.12,ep.z+Math.sin(earthOrbitAngle)*rr);
    enforceNoPlanetPenetration(flightRocket.position);
    const next=earthOrbitAngle+.04;
    const orbitNext=new THREE.Vector3(ep.x+Math.cos(next)*rr,ep.y+Math.sin(next)*rr*0.12,ep.z+Math.sin(next)*rr);
    setFlightForward(orbitNext.clone().sub(flightRocket.position));
    flightRocket.lookAt(orbitNext);
    flightRocket.rotateX(Math.PI/2);
    if(rocketPlume){rocketPlume.visible=true;rocketPlume.userData.update(dt,0.35);}
    spaceAudio.setThrust(0.25,0.85);
    updateTelemetry(120,'Дэлхий (Тойрог зам)','0.0');
    if(flightCamMode==='side'||flightCamMode==='follow'){updateFollowFreeSee()}
    else if(flightCamMode==='free'||flightCamMode==='overview'){controls.enabled=true;}
    else{controls.enabled=false;const dist=34;camera.position.lerp(ep.clone().add(new THREE.Vector3(dist*.6,dist*.35,dist)),Math.min(1,dt*1.5));camera.lookAt(ep);}
    flightPhase.textContent='EARTH ORBIT';
    flightText.textContent='Очих гараг эсвэл дагуул дээр дарж нислэгийн маршрут сонгоно уу';
  }else if(flightMode==='transfer'&&flightRocket&&flightDestination){
    updateSteering(dt);
    transferElapsed+=dt;

    // Physical speed calculation: acceleration 120 -> 5,000 km/h, cruise at 5,000 km/h, deceleration 5,000 -> 120 km/h (ихээс бага руу)
    let currentKmph=120, engineState='ХУРД АВАЛТ (ACCEL)', burnPower=1.0;
    if(flightT<0.24){
      const p=flightT/0.24, c=Math.sin(p*Math.PI*0.5);
      currentKmph=120+(5000-120)*(c*c);
      engineState='ДЭЭД ХҮЧЭЭР ХУРД АВАХ';
      burnPower=1.35;
      flightPhase.textContent='ACCELERATION • 0 → 5,000 KM/H';
      flightText.textContent='Дээд хүчээр хурд авч байна (Дээд хязгаар: 5,000 km/h)';
    }else if(flightT<0.68){
      const micro=Math.sin(flightT*36)*20;
      currentKmph=Math.min(5000,4985+micro);
      engineState='ТОГТМОЛ ДЭЭД ХУРД (5,000 km/h)';
      burnPower=0.65;
      flightPhase.textContent='CRUISE • 5,000 KM/H';
      flightText.textContent='5,000 km/h тогтмол дээд хурдаар гараг хооронд аялж байна';
    }else{
      const p=(1-flightT)/0.32, c=Math.sin(p*Math.PI*0.5);
      currentKmph=120+(5000-120)*(c*c);
      engineState='ТООРМОСЛОЛТ (ИХЭЭС БАГА РУУ)';
      burnPower=1.15;
      flightPhase.textContent='DECELERATION • 5,000 → 120 KM/H';
      flightText.textContent='Тоормослолт: Ихээс бага руу хурд буурч, аюулгүй тойрог замд орж байна';
    }

    spaceAudio.setThrust(burnPower,1.05);

    // Live Telemetry HUD values
    let gForce=0.2;
    if(flightT<0.24){
      gForce=0.5+(currentKmph/5000)*2.8;
    }else if(flightT<0.68){
      gForce=0.2;
    }else{
      gForce=0.3+((currentKmph-120)/4880)*2.2;
    }
    updateTelemetry(currentKmph,(flightDestinationObj?.userData?.mn||flightDestination),gForce);

    flightTele.innerHTML=`
      <div style="display:flex;gap:14px;align-items:center;font-weight:900;font-size:11.5px">
        <span style="color:#6be5ff">ХУРД: <b style="color:#fff;font-size:13px">${Math.round(currentKmph).toLocaleString()}</b> km/h <small style="color:#7ee8ff">(ДЭЭД: 5,000 km/h)</small></span>
        <span style="color:#ffd272">ГОРИМ: <b style="color:#fff">${engineState}</b></span>
        <span style="color:#95f2a7">ЧИГЛЭЛ: <b style="color:#fff">${(flightDestinationObj?.userData?.mn||flightDestination).toUpperCase()}</b></span>
      </div>
    `;

    // Movement progress along trajectory is physically proportional to velocity
    const targetNow=flightDestinationObj||visualByName[flightDestination],endNow=safeApproachPoint(targetNow,flightStartPos);
    const rawDist=flightStartPos.distanceTo(endNow);
    const distFactor=THREE.MathUtils.clamp(280/Math.max(90,rawDist),0.48,1.4);
    const normSpeed=Math.max(0.12,currentKmph/5000);
    flightT=Math.min(1,flightT+dt*(normSpeed*0.054*distFactor));

    const baseControl=computeSafeControlPoint(flightStartPos,endNow);
    const tangent=endNow.clone().sub(flightStartPos).normalize();
    let side=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,1,0));
    if(side.lengthSq()<1e-6)side.set(1,0,0);
    side.normalize();
    baseControl.add(side.multiplyScalar(steerX*0.3)).add(new THREE.Vector3(0,steerY*0.3,0));
    const dynamicCurve=new THREE.QuadraticBezierCurve3(flightStartPos,baseControl,endNow);
    const p=enforceNoPlanetPenetration(dynamicCurve.getPoint(flightT));
    const n=enforceNoPlanetPenetration(dynamicCurve.getPoint(Math.min(1,flightT+.004)));
    flightRocket.position.copy(p);
    orientRocket(n.clone().sub(p),dt);
    if(rocketPlume){
      rocketPlume.visible=true;
      rocketPlume.userData.update(dt,burnPower);
    }
    collisionCheck();
    const targetObj=flightDestinationObj||visualByName[flightDestination];
    const targetPos=worldPos(targetObj);
    flightPct.textContent=Math.round(flightT*100)+'%';
    flightBar.style.width=(flightT*100)+'%';
    if(flightCamMode==='free'||flightCamMode==='overview'){controls.enabled=true;controls.enablePan=true;}
    else if(flightCamMode==='side'||flightCamMode==='follow'){updateFollowFreeSee();}
    else{const dist=Math.max(32,(targetObj.userData?.r||10)*5);const dir=camera.position.clone().sub(targetPos).normalize();camera.position.lerp(targetPos.clone().add(dir.multiplyScalar(dist)),Math.min(1,dt*1.7));camera.lookAt(targetPos);}
    if(flightT>=1){
      flightMode='arrived';
      arrivalOrbitAngle=0;
      const earthPosNow=worldPos(visualByName.Earth),targetPosNow=worldPos(flightDestinationObj||visualByName[flightDestination]);
      const reward=Math.max(100,Math.round(earthPosNow.distanceTo(targetPosNow)*2));
      let earned=0;
      if(!visited.has(flightDestination)){
        earned=reward;visited.add(flightDestination);missionPoints+=earned;
        localStorage.setItem('rfVisited',JSON.stringify([...visited]));
        localStorage.setItem('rfMissionPoints',missionPoints);
        document.querySelector('#pointsValue').textContent=missionPoints;
      }
      flightPhase.textContent=flightDestination.toUpperCase()+' ORBIT';
      if(NO_LANDING_PLANETS.has(flightDestination)){
        flightText.textContent=(earned?'MISSION COMPLETE • +'+earned+' POINTS':'MISSION COMPLETE')+' • Хийн/мөсөн аварга тул хатуу гадаргуугүй — газардах боломжгүй';
        landingBtn.classList.remove('show');
      }else{
        flightText.textContent=(earned?'MISSION COMPLETE • +'+earned+' POINTS':'MISSION COMPLETE • өмнө очсон destination')+' • LANDING дарах хүртэл удаан тойрно';
        landingBtn.classList.add('show');
      }
      if(flightLine){flightLine.material.opacity=.18}
    }
  }else if(flightMode==='arrived'&&flightRocket&&flightDestination){
    const targetObj=flightDestinationObj||visualByName[flightDestination];
    const tp=worldPos(targetObj);
    const rr=lowOrbitRadius(targetObj);
    arrivalOrbitAngle+=simDt*0.065;
    flightRocket.position.set(tp.x+Math.cos(arrivalOrbitAngle)*rr,tp.y+Math.sin(arrivalOrbitAngle)*rr*0.12,tp.z+Math.sin(arrivalOrbitAngle)*rr);
    enforceNoPlanetPenetration(flightRocket.position);
    const aa=arrivalOrbitAngle+.035;
    const orbitAhead=new THREE.Vector3(tp.x+Math.cos(aa)*rr,tp.y+Math.sin(aa)*rr*0.12,tp.z+Math.sin(aa)*rr);
    orientRocket(orbitAhead.clone().sub(flightRocket.position),dt);
    if(rocketPlume){rocketPlume.visible=true;rocketPlume.userData.update(dt,0.32);}
    spaceAudio.setThrust(0.22,0.85);
    updateTelemetry(120,(flightDestinationObj?.userData?.mn||flightDestination)+' (Тойрог зам)','0.0');
    if(flightCamMode==='side'||flightCamMode==='follow'){updateFollowFreeSee();}
    else if(flightCamMode==='target'){controls.enabled=false;const dist=Math.max(28,(targetObj.userData?.r||3)*5.5);camera.position.lerp(tp.clone().add(new THREE.Vector3(dist*.55,dist*.32,dist)),Math.min(1,dt*1.2));camera.lookAt(tp);}
    else{controls.enabled=true;}
  }
  updateRocketTracker();
  controls.update();
  renderer.render(scene,camera);
  if(previewObject){previewObject.rotation.y+=dt*.38;previewRenderer.render(previewScene,previewCamera)}
}
loop();
document.querySelector('#loading').classList.add('hide');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});

}
