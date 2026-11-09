/* Science Universe — section sandbox.
 *
 * Every integrated system (Build / Space Lab / Explore) runs inside its own
 * Shadow DOM root, so its element IDs and CSS can never collide with the main
 * website or with each other. Original source code keeps using `document`,
 * `window`, `requestAnimationFrame`, `setTimeout`, `location` ... — inside a
 * section those names are bound to the objects created here, which
 *   - resolve getElementById / querySelector against the section's shadow root,
 *   - keep `window.X = ...` assignments private (e.g. Explore's `window.THREE`
 *     can no longer overwrite the main site's global THREE r128),
 *   - track every listener / timer / animation frame / AudioContext / WebGL
 *     context so a section can be suspended (loops stop), resumed or fully
 *     disposed (all resources released) when the user leaves it.
 */

const realWin = window;
const realDoc = document;

/* Convert page-level selectors to shadow-root selectors. */
export function scopeCss(css) {
  return css
    .replace(/:root\b/g, ':host')
    .replace(/(^|[\s,{}>+~(])html(?=[\s,{.:#\[>+~]|$)/g, '$1:host')
    .replace(/(^|[\s,{}>+~(])body(?=[\s,{.:#\[>+~]|$)/g, '$1.su-root');
}

export function createSandbox(host, label = 'section') {
  const root = host.attachShadow ? (host.shadowRoot || host.attachShadow({ mode: 'open' })) : host;
  const state = { paused: false, disposed: false };
  const listeners = [];           // {target, type, fn, opts}
  const timeouts = new Map();     // id -> handle
  const intervals = new Map();
  const rafs = new Map();         // id -> real handle
  const pendingRaf = new Map();   // parked while paused
  const pendingTimeouts = new Map();
  const audioContexts = new Set();
  const own = Object.create(null); // private window.* globals
  let seq = 1;
  let lockedEl = null;

  /* -------- the element that stands in for <body>/<html>/<head> ---------- */
  const rootEl = document.createElement('div');
  rootEl.className = 'su-root';
  rootEl.dataset.suSection = label;
  root.appendChild(rootEl);

  /* ------------------------------ timers -------------------------------- */
  const sbRaf = (cb) => {
    const id = seq++;
    const run = (t) => {
      rafs.delete(id);
      if (state.disposed) return;
      if (state.paused) { pendingRaf.set(id, cb); return; }
      cb(t);
    };
    rafs.set(id, realWin.requestAnimationFrame(run));
    return id;
  };
  const sbCancelRaf = (id) => {
    if (rafs.has(id)) { realWin.cancelAnimationFrame(rafs.get(id)); rafs.delete(id); }
    pendingRaf.delete(id);
  };
  const sbTimeout = (cb, ms, ...args) => {
    const id = seq++;
    const h = realWin.setTimeout(() => {
      timeouts.delete(id);
      if (state.disposed) return;
      if (state.paused) { pendingTimeouts.set(id, [cb, args]); return; }
      typeof cb === 'function' ? cb(...args) : (0, eval)(cb);
    }, ms);
    timeouts.set(id, h);
    return id;
  };
  const sbClearTimeout = (id) => {
    if (timeouts.has(id)) { realWin.clearTimeout(timeouts.get(id)); timeouts.delete(id); }
    pendingTimeouts.delete(id);
  };
  const sbInterval = (cb, ms, ...args) => {
    const id = seq++;
    const h = realWin.setInterval(() => {
      if (state.disposed || state.paused) return;
      cb(...args);
    }, ms);
    intervals.set(id, h);
    return id;
  };
  const sbClearInterval = (id) => {
    if (intervals.has(id)) { realWin.clearInterval(intervals.get(id)); intervals.delete(id); }
  };

  /* ----------------------------- listeners ------------------------------ */
  const GUARD_ALWAYS = new Set(['pointerlockchange', 'pointerlockerror', 'fullscreenchange', 'visibilitychange']);
  function addL(target, type, fn, opts) {
    if (!fn) return;
    const wrapped = (typeof fn === 'function')
      ? function (e) { if (state.disposed || (state.paused && !GUARD_ALWAYS.has(type))) return; return fn.call(this, e); }
      : { handleEvent(e) { if (state.disposed || state.paused) return; fn.handleEvent(e); } };
    target.addEventListener(type, wrapped, opts);
    listeners.push({ target, type, fn, wrapped, opts });
  }
  function removeL(target, type, fn, opts) {
    const i = listeners.findIndex((l) => l.target === target && l.type === type && l.fn === fn);
    if (i >= 0) { target.removeEventListener(type, listeners[i].wrapped, opts); listeners.splice(i, 1); }
  }

  /* ------------------------------ location ------------------------------ */
  let navHandler = () => {};
  const locationShim = new Proxy(realWin.location, {
    get(t, k) {
      if (k === 'href') return t.href;
      if (k === 'replace' || k === 'assign') return (u) => navHandler(String(u));
      if (k === 'reload') return () => navHandler('reload');
      const v = Reflect.get(t, k);
      return typeof v === 'function' ? v.bind(t) : v;
    },
    set(t, k, v) { if (k === 'href') { navHandler(String(v)); return true; } return true; },
  });

  /* ------------------------------ document ------------------------------ */
  const qsa = (sel) => root.querySelectorAll(sel);
  const docOverrides = {
    getElementById: (id) => root.getElementById(id),
    querySelector: (s) => root.querySelector(s),
    querySelectorAll: (s) => qsa(s),
    getElementsByClassName: (c) => root.querySelectorAll('.' + c.split(/\s+/).join('.')),
    getElementsByTagName: (n) => root.querySelectorAll(n),
    elementFromPoint: (x, y) => root.elementFromPoint(x, y),
    elementsFromPoint: (x, y) => root.elementsFromPoint(x, y),
    addEventListener: (t, f, o) => addL(realDoc, t, f, o),
    removeEventListener: (t, f, o) => removeL(realDoc, t, f, o),
  };
  const documentShim = new Proxy(realDoc, {
    get(t, k) {
      if (k in docOverrides) return docOverrides[k];
      switch (k) {
        case 'body': case 'documentElement': case 'head': return rootEl;
        case 'activeElement': return root.activeElement || null;
        case 'pointerLockElement': return root.pointerLockElement ?? (t.pointerLockElement ? lockedEl : null);
        case 'fullscreenElement': return root.fullscreenElement ?? null;
        case 'webkitFullscreenElement': return root.fullscreenElement ?? null;
        case 'defaultView': return windowShim;
        default: break;
      }
      const v = Reflect.get(t, k);
      return typeof v === 'function' ? v.bind(t) : v;
    },
    set(t, k, v) { if (k === 'title') return true; t[k] = v; return true; },
  });

  /* ------------------------------ window -------------------------------- */
  function TrackedAudio(Base) {
    return class extends Base {
      constructor(...a) { super(...a); audioContexts.add(this); }
    };
  }
  const winOverrides = {
    requestAnimationFrame: sbRaf, cancelAnimationFrame: sbCancelRaf,
    setTimeout: sbTimeout, clearTimeout: sbClearTimeout,
    setInterval: sbInterval, clearInterval: sbClearInterval,
    addEventListener: (t, f, o) => addL(realWin, t, f, o),
    removeEventListener: (t, f, o) => removeL(realWin, t, f, o),
    location: locationShim,
    document: documentShim,
    AudioContext: realWin.AudioContext && TrackedAudio(realWin.AudioContext),
    webkitAudioContext: realWin.webkitAudioContext && TrackedAudio(realWin.webkitAudioContext),
  };
  const windowShim = new Proxy(realWin, {
    get(t, k) {
      if (k in own) return own[k];
      if (k in winOverrides) return winOverrides[k];
      if (k === 'window' || k === 'self' || k === 'globalThis' || k === 'top' || k === 'parent') return windowShim;
      const v = Reflect.get(t, k);
      return (typeof v === 'function' && !/^[A-Z]/.test(String(k))) ? v.bind(t) : v;
    },
    set(t, k, v) {
      if (k === 'onresize' || k === 'onkeydown' || k === 'onkeyup' || k === 'onblur' || k === 'onfocus' || k === 'onpointerdown' || k === 'onload') {
        winOverrides.addEventListener(k.slice(2), v); return true;
      }
      own[k] = v; return true;
    },
    has(t, k) { return k in own || k in t; },
  });

  /* ---------------------------- ctx exports ----------------------------- */
  const ctx = {
    document: documentShim,
    window: windowShim,
    location: locationShim,
    requestAnimationFrame: sbRaf, cancelAnimationFrame: sbCancelRaf,
    setTimeout: sbTimeout, clearTimeout: sbClearTimeout,
    setInterval: sbInterval, clearInterval: sbClearInterval,
    addEventListener: winOverrides.addEventListener,
    removeEventListener: winOverrides.removeEventListener,
    AudioContext: winOverrides.AudioContext,
    webkitAudioContext: winOverrides.webkitAudioContext,
  };

  /* Pointer-lock bookkeeping so `document.pointerLockElement === canvas` works
     for elements living inside the shadow tree. */
  const origPL = Element.prototype.requestPointerLock;
  const plTracker = function (...a) { lockedEl = this; return origPL.apply(this, a); };

  function setContent({ html = '', css = '' } = {}) {
    rootEl.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = scopeCss(css) +
      '\n:host{display:block}.su-root{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;margin:0;box-sizing:border-box}';
    root.insertBefore(style, rootEl);
    rootEl.innerHTML = html;
    rootEl.querySelectorAll('script').forEach((s) => s.remove());
    Element.prototype.requestPointerLock = plTracker;
  }

  function loseGL() {
    root.querySelectorAll('canvas').forEach((c) => {
      try {
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        gl && gl.getExtension('WEBGL_lose_context') && gl.getExtension('WEBGL_lose_context').loseContext();
      } catch (e) { /* context belongs to a 2d canvas */ }
    });
  }

  const api = {
    root, rootEl, ctx, setContent, state,
    onNavigate(fn) { navHandler = fn; },
    suspend() {
      if (state.paused) return;
      state.paused = true;
      audioContexts.forEach((a) => { try { a.suspend(); } catch (e) {} });
      if (realDoc.pointerLockElement) realDoc.exitPointerLock();
    },
    resume() {
      if (!state.paused) return;
      state.paused = false;
      audioContexts.forEach((a) => { try { a.resume(); } catch (e) {} });
      const rs = [...pendingRaf.values()]; pendingRaf.clear(); rs.forEach((cb) => sbRaf(cb));
      const ts = [...pendingTimeouts.values()]; pendingTimeouts.clear(); ts.forEach(([cb, a]) => sbTimeout(cb, 0, ...a));
      realWin.dispatchEvent(new Event('resize'));
    },
    dispose() {
      if (state.disposed) return;
      state.disposed = true;
      listeners.forEach((l) => l.target.removeEventListener(l.type, l.wrapped, l.opts));
      listeners.length = 0;
      timeouts.forEach((h) => realWin.clearTimeout(h)); timeouts.clear();
      intervals.forEach((h) => realWin.clearInterval(h)); intervals.clear();
      rafs.forEach((h) => realWin.cancelAnimationFrame(h)); rafs.clear();
      pendingRaf.clear(); pendingTimeouts.clear();
      audioContexts.forEach((a) => { try { a.close(); } catch (e) {} }); audioContexts.clear();
      if (realDoc.pointerLockElement) realDoc.exitPointerLock();
      if (realDoc.fullscreenElement && realDoc.exitFullscreen) realDoc.exitFullscreen().catch(() => {});
      loseGL();
      if (root.replaceChildren) root.replaceChildren(); else root.innerHTML = '';
    },
  };
  return api;
}

