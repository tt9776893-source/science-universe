/* Environment bridge for the Explore (Frontier) modules.
   router -> bind(sandbox.ctx) BEFORE importing src/main.js. Every module imports the bindings
   it uses from here, so `document`, `window`, timers ... resolve to the Explore sandbox. */
export const ASSET_BASE = "SCIENCE_UNIVERSE_PROJECT_BACKUP/public/assets";
export let document = globalThis.document;
export let window = globalThis.window;
export let requestAnimationFrame = globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame.bind(globalThis) : ((cb) => setTimeout(cb, 16));
export let cancelAnimationFrame = globalThis.cancelAnimationFrame ? globalThis.cancelAnimationFrame.bind(globalThis) : ((id) => clearTimeout(id));
export let setTimeout = globalThis.setTimeout ? globalThis.setTimeout.bind(globalThis) : undefined;
export let clearTimeout = globalThis.clearTimeout ? globalThis.clearTimeout.bind(globalThis) : undefined;
export let setInterval = globalThis.setInterval ? globalThis.setInterval.bind(globalThis) : undefined;
export let clearInterval = globalThis.clearInterval ? globalThis.clearInterval.bind(globalThis) : undefined;
export let AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;

export function bind(c) {
  if (!c) return;
  if (c.document) document = c.document;
  if (c.window) window = c.window;
  if (c.requestAnimationFrame) requestAnimationFrame = c.requestAnimationFrame;
  if (c.cancelAnimationFrame) cancelAnimationFrame = c.cancelAnimationFrame;
  if (c.setTimeout) setTimeout = c.setTimeout;
  if (c.clearTimeout) clearTimeout = c.clearTimeout;
  if (c.setInterval) setInterval = c.setInterval;
  if (c.clearInterval) clearInterval = c.clearInterval;
  if (c.AudioContext) AudioContext = c.AudioContext;
}
