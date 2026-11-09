import fs from 'node:fs';
import vm from 'node:vm';

const FILE = 'd:/shine negtgel/index.html';
let html = fs.readFileSync(FILE, 'utf8');

function replaceExact(target, replacement, label) {
  if (!html.includes(target)) {
    throw new Error(`Missing target for [${label}]:\n${target.slice(0, 220)}`);
  }
  html = html.replace(target, () => replacement);
}

function replaceAllExact(target, replacement, label) {
  if (!html.includes(target)) {
    throw new Error(`Missing target for [${label}]:\n${target.slice(0, 220)}`);
  }
  html = html.split(target).join(replacement);
}

// ============================================================================
// 1. MONOCHROME VECTOR OUTLINE ICON LIBRARY (.su-ico, 24x24, 1.8px stroke)
// ============================================================================
const svg = (paths, cls = '') =>
  `<svg class="su-ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

const ICO = {
  atom: (c = '') => svg('<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/>', c),
  flask: (c = '') => svg('<path d="M9 3h6"/><path d="M10 3v6.5L5.2 18a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M7.5 15h9"/>', c),
  bot: (c = '') => svg('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M9 17h6"/>', c),
  dna: (c = '') => svg('<path d="M7 3c5 4.5 5 13.5 10 18"/><path d="M17 3c-5 4.5-5 13.5-10 18"/><path d="M8.5 7h7"/><path d="M7.5 12h9"/><path d="M8.5 17h7"/>', c),
  code: (c = '') => svg('<polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/><line x1="14" y1="5" x2="10" y2="19"/>', c),
  monitor: (c = '') => svg('<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>', c),
  phone: (c = '') => svg('<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>', c),
  compass: (c = '') => svg('<path d="m12 3-7 17 7-4 7 4-7-17z"/><path d="M8.5 13a5 5 0 0 0 7 0"/>', c),
  planet: (c = '') => svg('<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="3.8" transform="rotate(-24 12 12)"/>', c),
  rocket: (c = '') => svg('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>', c),
  gear: (c = '') => svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/>', c),
  wrench: (c = '') => svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', c),
  book: (c = '') => svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>', c),
  calc: (c = '') => svg('<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="18"/>', c),
  target: (c = '') => svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>', c),
  chart: (c = '') => svg('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', c),
  bars: (c = '') => svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', c),
  microscope: (c = '') => svg('<path d="M6 18h8"/><path d="M3 21h18"/><path d="M14 21a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>', c),
  heart: (c = '') => svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', c),
  leaf: (c = '') => svg('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', c),
  sun: (c = '') => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>', c),
  droplet: (c = '') => svg('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>', c),
  globe: (c = '') => svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', c),
  bolt: (c = '') => svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', c),
  flame: (c = '') => svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', c),
  bulb: (c = '') => svg('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', c),
  magnet: (c = '') => svg('<path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/><path d="m5 8 4 4"/><path d="m12 15 4 4"/>', c),
  scale: (c = '') => svg('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>', c),
  ruler: (c = '') => svg('<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/>', c),
  pencil: (c = '') => svg('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>', c),
  user: (c = '') => svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', c),
  camera: (c = '') => svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>', c),
  lock: (c = '') => svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', c),
  unlock: (c = '') => svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>', c),
  key: (c = '') => svg('<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>', c),
  logout: (c = '') => svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>', c),
  palette: (c = '') => svg('<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>', c),
  note: (c = '') => svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', c),
  puzzle: (c = '') => svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>', c),
  search: (c = '') => svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', c),
  home: (c = '') => svg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', c),
  network: (c = '') => svg('<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>', c),
  refresh: (c = '') => svg('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>', c),
  hash: (c = '') => svg('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>', c),
  speaker: (c = '') => svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>', c),
  mute: (c = '') => svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>', c),
  alert: (c = '') => svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', c),
  bridge: (c = '') => svg('<path d="M3 18h18"/><path d="M6 18V8"/><path d="M18 18V8"/><path d="M3 14c3-4 6-6 9-6s6 2 9 6"/>', c),
  beam: (c = '') => svg('<rect x="2" y="9" width="20" height="5" rx="1"/><path d="m5 14-2 5h4z"/><path d="m19 14-2 5h4z"/>', c),
  shield: (c = '') => svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', c),
  eye: (c = '') => svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', c),
  trophy: (c = '') => svg('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8v3h8v-3h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/>', c),
  dice: (c = '') => svg('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/>', c),
  snowflake: (c = '') => svg('<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>', c),
  layers: (c = '') => svg('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>', c),
  sliders: (c = '') => svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>', c),
};

// Add .su-ico.xl and .su-ico.xxl sizes to <head> icon CSS and remove .emoji-mono rule
replaceExact(
  `.su-ico.sm { width: 14px; height: 14px; }`,
  `.su-ico.sm { width: 14px; height: 14px; }\n.su-ico.xl { width: 26px; height: 26px; }\n.su-ico.xxl { width: 34px; height: 34px; }`,
  'su-ico xl/xxl sizes'
);

// ============================================================================
// 2. PRESERVE THE MAIN LAB 3D SECTION EXACTLY & FIX SELECTORS + SIDEBAR STATUS
// ============================================================================
replaceExact(
  `<div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> 6 / 8</div>`,
  `<div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> 7 / 8</div>`,
  'left sidebar open labs count 7 / 8'
);

replaceExact(
  `<div class="su-status-pill soon"><span class="su-s-dot soon"></span>Биологи</div>`,
  `<div class="su-status-pill online"><span class="su-s-dot"></span>Биологи</div>`,
  'right sidebar biology online pill'
);

replaceExact(
`  <!-- CENTER 3D HERO AREA (Main Lab Rotating Cylinder & Focus) -->
  <div class="su-desk-center">
    <div class="hub" id="hub">
      <div class="tilt"><div class="ringw" id="ring">
        <div class="basew"><i></i></div><div class="floor"></div>
        <div class="wall" style="--a:0deg"><div class="sign">Physics Lab</div><div class="cell physics"><button class="card" data-msg="Физикийн лаборатори нээгдэж байна…" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><ellipse cx="24" cy="24" rx="19" ry="7.5"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(60 24 24)"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(120 24 24)"></ellipse><circle cx="24" cy="24" fill="currentColor" r="3"></circle></svg><b>Физик</b></span></button></div></div>
        <div class="wall" style="--a:45deg"><div class="sign">Chemistry Lab</div><div class="cell chem"><button class="card" id="chemCard" type="button" data-msg="Химийн интерактив 3D лабораторид тавтай морил!"><span class="ci"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6h12M21 6v10l-9 16a4 4 0 0 0 3.5 6h17a4 4 0 0 0 3.5-6l-9-16V6"/><path d="M15 26h18" stroke-dasharray="2 3"/></svg><b>Хими</b></span></button></div></div>
        <div class="wall" style="--a:90deg"><div class="sign">AI Lab</div><div class="cell ai"><button class="card" id="aiCard" type="button" data-msg="AI лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><rect height="24" rx="4" width="28" x="10" y="14"></rect><circle cx="19" cy="23" fill="currentColor" r="2.5"></circle><circle cx="29" cy="23" fill="currentColor" r="2.5"></circle><path d="M18 31h12M24 8v6M7 26h3M38 26h3"></path></svg><b>AI Lab</b></span></button></div></div>
        <div class="wall" style="--a:135deg"><div class="sign">Biology Lab</div><div class="cell bio"><button class="card" id="bioCard" type="button" data-msg="Биологийн 3D лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><path d="M12 36c12-6 12-18 24-24M12 12c12 6 12 18 24 24M16 18l4 2M28 28l4 2M16 30l4-2M28 20l4-2M20 24h8"></path></svg><b>Биологи</b></span></button></div></div>
        <div class="wall" style="--a:180deg"><div class="sign">Computer Lab</div><div class="cell cs"><button class="card" id="csCard" type="button" data-msg="Компьютер ухааны лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><rect height="22" rx="3" width="34" x="7" y="10"></rect><path d="M16 38h16M24 32v6M14 18l5 4-5 4M23 26h8"></path></svg><b>Компьютер</b></span></button></div></div>
        <div class="wall" style="--a:225deg"><div class="sign">Math Lab</div><div class="cell math"><button class="card" id="mathCard" type="button" data-msg="Математикийн интерактив лабораторид тавтай морил!"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><path d="M10 38L22 10l8 20 8-12"></path><circle cx="38" cy="18" fill="currentColor" r="2"></circle><path d="M8 24h6M34 32h6M37 29v6"></path></svg><b>Математик</b></span></button></div></div>
        <div class="wall" style="--a:270deg"><div class="sign">Space Lab</div><div class="cell space" id="spaceCell"><button class="card" data-locked="true" data-msg="120 кредит цуглуулж нээнэ үү!" id="spaceBtn" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><circle cx="24" cy="24" r="11"></circle><ellipse cx="24" cy="24" rx="20" ry="6" transform="rotate(-25 24 24)"></ellipse><circle cx="16" cy="14" fill="currentColor" r="1.5"></circle></svg><b>Сансар</b><small id="spaceLockMsg">120 ★ түгжээтэй</small></span></button></div></div>
        <div class="wall" style="--a:315deg"><div class="sign">Engineering Lab</div><div class="cell engineering"><button class="card" id="engCard" type="button" data-msg="Инженерчлэлийн лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><circle cx="24" cy="24" r="6"></circle><path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8"></path></svg><b>Инженер</b></span></button></div></div>
      </div></div>
    </div>
    <div class="focus" id="focus">
      <button aria-label="Өмнөх лаборатори" class="rot" id="prevW" type="button">‹</button>
      <div class="fi"><b id="fName">Физик</b><small id="fSub">Классик механик ба харьцангуй</small></div>
      <button class="enter" id="enterLab" type="button">Нэвтрэх</button>
      <button aria-label="Дараах лаборатори" class="rot" id="nextW" type="button">›</button>
    </div>
  </div>`,
`  <!-- CENTER 3D HERO AREA (Main Lab Rotating Cylinder & Focus) -->
  <div class="su-desk-center">
<div class="hub" id="hub">
<div class="tilt"><div class="ringw" id="ring">
<div class="basew"><i></i></div><div class="floor"></div>
<div class="wall" style="--a:0deg"><div class="sign">Physics Lab</div><div class="cell physics"><button class="card" data-msg="Физикийн лаборатори нээгдэж байна…" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><ellipse cx="24" cy="24" rx="19" ry="7.5"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(60 24 24)"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(120 24 24)"></ellipse><circle cx="24" cy="24" fill="currentColor" r="3"></circle></svg><b>Физик</b></span></button></div></div>
<div class="wall" style="--a:45deg"><div class="sign">Chemistry Lab</div><div class="cell chem"><button class="card" id="chemCard" type="button" data-msg="Химийн интерактив 3D лабораторид тавтай морил!"><span class="ci"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6h12M20 6v12L8 38a3 3 0 002.6 4.5h26.8A3 3 0 0040 38L28 18V6"/></svg><b>Хими</b></span></button></div></div>
<div class="wall" style="--a:90deg"><div class="sign">AI Lab</div><div class="cell tech"><button class="card" data-msg="AI лаборатори нээгдэж байна…" id="aiLabCard" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke-dasharray="6.2 5.1" stroke-width="7"></circle><circle cx="24" cy="24" r="11.5"></circle><circle cx="24" cy="24" r="5"></circle></svg><b>Хиймэл оюун</b></span></button></div></div>
<div class="wall" style="--a:135deg"><div class="sign">Biology Lab</div><div class="cell biology"><button class="card" data-msg="Биологийн лаборатори нээгдэж байна…" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" viewbox="0 0 48 48"><path d="M14 6c14 10 6 20 20 36M34 6C20 16 28 26 14 42"></path><path d="M17 14h14M17 34h14M19 24h10"></path></svg><b>Биологи<small>Интерактив лаборатори</small></b></span></button></div></div>
<div class="wall" style="--a:180deg"><div class="sign">Computer Lab</div><div class="cell cs"><button class="card" data-msg="Компьютерийн шинжлэх ухааны лаборатори нээгдэж байна…" id="computerCard" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewbox="0 0 48 48"><polyline points="16,13 5,24 16,35"></polyline><polyline points="32,13 43,24 32,35"></polyline><line x1="28" x2="20" y1="9" y2="39"></line></svg><b>Компьютерийн<br/>шинжлэх ухаан</b></span></button></div></div>
<div class="wall" style="--a:225deg"><div class="sign">Math Lab</div><div class="cell math"><button class="card" data-msg="Математикийн лаборатори нээгдэж байна…" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.2" viewbox="0 0 48 48"><path d="M36 9H13l13 15-13 15h23"></path></svg><b>Математик<small>Интерактив лаборатори</small></b></span></button></div></div>
<div class="wall" style="--a:270deg"><div class="sign">Space Lab</div><div class="cell space"><button class="card" data-locked="1" data-msg="Сансар судлал нээгдэхэд 120 кредит хэрэгтэй" id="spaceCard" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.4" viewbox="0 0 48 48"><rect fill="currentColor" height="21" rx="4" width="28" x="10" y="21"></rect><path d="M16 21v-6a8 8 0 0116 0v6" id="shackle"></path><circle cx="24" cy="31" fill="#25104d" r="2.6" stroke="none"></circle></svg><b>Сансар судлал<small id="spaceSmall">120 кредитээр нээгдэнэ</small></b></span></button></div></div>
<div class="wall" style="--a:315deg"><div class="sign">Engineering Lab</div><div class="cell engineering"><button class="card" data-msg="Инженерчлэлийн лаборатори нээгдэж байна…" id="engineeringCard" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" viewbox="0 0 48 48"><path d="M31 7a10 10 0 00-9 14L8 35l5 5 14-14a10 10 0 0014-9l-7 6-6-2-2-6z"></path></svg><b>Инженерчлэл</b></span></button></div></div>
<div class="console"><svg aria-hidden="true" height="110" viewbox="0 0 120 110" width="120">
<defs><lineargradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b6d55"></stop><stop offset="1" stop-color="#0a2a22"></stop></lineargradient></defs>
<path d="M4 108L15 74H105L116 108Z" fill="#15323a" stroke="#6ff0cf" stroke-width="1.6"></path>
<rect fill="#07140f" height="52" rx="4" stroke="#8ff5d4" stroke-width="2.2" style="filter:drop-shadow(0 0 6px #3ee8b0)" width="68" x="26" y="10"></rect>
<rect fill="url(#cg)" height="42" opacity=".85" width="58" x="31" y="15"></rect>
<g fill="#7fffd0"><rect class="br" height="14" width="6" x="36" y="40"></rect><rect class="br b2" height="22" width="6" x="46" y="32"></rect><rect class="br b3" height="10" width="6" x="56" y="44"></rect><rect class="br b4" height="26" width="6" x="66" y="28"></rect><rect class="br b2" height="16" width="6" x="76" y="38"></rect></g>
<text fill="#c9fff0" font-family="monospace" font-size="7" text-anchor="middle" x="60" y="26">SYSTEM ONLINE</text>
<circle cx="12" cy="34" fill="#0a2a22" r="10" stroke="#7fffd0" stroke-width="2"></circle><circle cx="12" cy="34" fill="none" r="5" stroke="#7fffd0" stroke-dasharray="2 2"></circle>
<rect fill="#0a2a22" height="9" rx="2" stroke="#7fffd0" width="12" x="104" y="22"></rect><rect fill="#0a2a22" height="9" rx="2" stroke="#7fffd0" width="12" x="104" y="36"></rect>
<rect fill="#1c4a4e" height="9" rx="3" stroke="#6ff0cf" width="76" x="22" y="64"></rect>
<circle cx="60" cy="68" fill="#d9fff6" r="5" style="filter:drop-shadow(0 0 6px #aaffee)"></circle>
</svg></div>
</div></div>
</div>
<div class="focus" id="focus">
<button aria-label="Өмнөх лаборатори" class="rot" id="prevW" type="button">‹</button>
<div class="fi"><b id="fen">Physics Lab</b><small id="fmn">Физик</small></div>
<button class="enter" id="enterW" type="button">Орох</button>
<button aria-label="Дараагийн лаборатори" class="rot" id="nextW" type="button">›</button>
</div>
  </div>`,
  'restore original Main Lab 3D hub, 8 walls, central console, and focus controls'
);

// Restore circular .rot and pill gradient .enter on desktop focus bar
replaceExact(
`  #lab .focus .rot {
    width: 44px !important;
    height: 44px !important;
    font-size: 22px !important;
    border-radius: 10px !important;
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    background: rgba(15, 23, 42, 0.75) !important;
    color: #cbd5e1 !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .rot:hover {
    background: rgba(56, 189, 248, 0.12) !important;
    border-color: rgba(56, 189, 248, 0.4) !important;
    color: #f8fafc !important;
  }
  #lab .focus .enter {
    height: 44px !important;
    padding: 0 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
    background: #3b82f6 !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .enter:hover {
    background: #2563eb !important;
    transform: translateY(-1px) !important;
  }`,
`  #lab .focus .rot {
    width: 44px !important;
    height: 44px !important;
    font-size: 24px !important;
    border-radius: 50% !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    background: rgba(255, 255, 255, 0.08) !important;
    color: #eef3ff !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .rot:hover {
    background: rgba(255, 255, 255, 0.16) !important;
    border-color: rgba(255, 255, 255, 0.38) !important;
    color: #ffffff !important;
  }
  #lab .focus .enter {
    height: 44px !important;
    padding: 0 24px !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    border-radius: 999px !important;
    background: linear-gradient(90deg, var(--btn), var(--btn2)) !important;
    border: 1px solid rgba(255, 255, 255, 0.28) !important;
    color: #fff !important;
    box-shadow: 0 6px 20px rgba(88, 104, 255, 0.45) !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .enter:hover {
    filter: brightness(1.08) !important;
    transform: translateY(-1px) !important;
  }`,
  'restore original circular .rot and pill gradient .enter on desktop'
);

// ============================================================================
// 3. FIX CAROUSEL SYNC, LAB ENTRY, RE-ENTRY & SPACE LAB 120-CREDIT UNLOCK
// ============================================================================

// 3a. Carousel controller: dynamic door lookup + suRotateToLab helper
replaceExact(
`function go(d){rot+=45*d;apply()}
var prevW = document.getElementById('prevW'); if(prevW) prevW.addEventListener('click',function(){go(-1)});
var nextW = document.getElementById('nextW'); if(nextW) nextW.addEventListener('click',function(){go(1)});
var enterW = document.getElementById('enterW'); if(enterW) enterW.addEventListener('click',function(){if(doors[idx])doors[idx].click()});`,
`function go(d){rot+=45*d;apply()}
window.suRotateToLab=function(i){var n=((i%8)+8)%8;rot=-45*n;apply()};
window.suGetActiveLabIdx=function(){return idx};
var prevW = document.getElementById('prevW'); if(prevW) prevW.addEventListener('click',function(){go(-1)});
var nextW = document.getElementById('nextW'); if(nextW) nextW.addEventListener('click',function(){go(1)});
var enterW = document.getElementById('enterW'); if(enterW) enterW.addEventListener('click',function(){var curDoors=ring.querySelectorAll('.wall .card');var target=curDoors[idx]||doors[idx];if(target)target.click()});`,
  'carousel suRotateToLab and dynamic enterW click'
);

// 3b. Space Lab 120-credit lock: strict storage/user unlock check (do not bypass modal when c >= 120)
replaceExact(
`  function updateSpace(c) {
    const open = c >= SPACE_COST || (typeof isSectionUnlocked === 'function' && isSectionUnlocked('spacelab'));
    const b = $('spaceCard');
    if (!b) return;
    if (open) {
      delete b.dataset.locked;
      b.dataset.msg = 'Сансар судлалын лаборатори нээгдэж байна…';
      b.setAttribute('aria-label', 'Сансар судлал');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = 'Нээгдсэн';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0115.4-3');
    } else {
      b.dataset.locked = '1';
      b.dataset.msg = 'Сансар судлал нээгдэхэд ' + SPACE_COST + ' кредит хэрэгтэй (одоо ' + c + ')';
      b.setAttribute('aria-label', 'Сансар судлал, түгжээтэй');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = SPACE_COST + ' кредитээр нээгдэнэ';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0116 0v6');
    }
  }`,
`  function updateSpace(c) {
    let open = false;
    try {
      if (window.SU && typeof window.SU.isSectionUnlocked === 'function') {
        open = window.SU.isSectionUnlocked('spacelab');
      } else if (localStorage.getItem('rf_spacelab_unlocked') === '1') {
        open = true;
      } else if (curMail) {
        const users = loadUsers();
        if (users[curMail] && (users[curMail].spaceUnlocked || (users[curMail].unlockedSections && users[curMail].unlockedSections.spacelab))) {
          open = true;
        }
      }
    } catch (_) {}
    const b = $('spaceCard');
    if (!b) return;
    if (open) {
      delete b.dataset.locked;
      b.dataset.msg = 'Сансар судлалын лаборатори нээгдэж байна…';
      b.setAttribute('aria-label', 'Сансар судлал');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = 'Нээгдсэн';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0115.4-3');
    } else {
      b.dataset.locked = '1';
      b.dataset.msg = c >= SPACE_COST
        ? 'Сансар судлал 120 кредитээр нээхэд бэлэн байна'
        : ('Сансар судлал нээгдэхэд ' + SPACE_COST + ' кредит хэрэгтэй (одоо ' + c + ')');
      b.setAttribute('aria-label', 'Сансар судлал, түгжээтэй');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = SPACE_COST + ' кредитээр нээгдэнэ';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0116 0v6');
    }
  }`,
  'updateSpace strict unlock check'
);

replaceExact(
`  // 3. Backward compatibility for Space Lab card
  if (secKey === 'spacelab') {
    const card = document.getElementById('spaceCard');
    if (card && !card.dataset.locked) return true;
  }`,
`  // Space Lab unlock status is strictly determined by persisted storage or user unlock record`,
  'remove spaceCard dataset.locked bypass in isSectionUnlocked'
);

// 3c. Physics Lab open/close/back & re-entry unblocking
replaceExact(
`function open(){root.classList.add('on');sync();home();backBtn.focus()}
function close(){root.classList.remove('on');stop();trigger.focus()}
function back(){if(view==='home')close();else if(view==='pdo')prob();else if(view==='quizq')quiz();else home()}`,
`function open(){root.style.removeProperty('display');root.style.removeProperty('pointer-events');root.style.removeProperty('visibility');root.setAttribute('aria-hidden','false');root.classList.add('on');sync();home();backBtn.focus()}
function close(){root.classList.remove('on','fullscreen');document.body.classList.remove('pl-landscape-mode');root.setAttribute('aria-hidden','true');stop();if(trigger&&typeof trigger.focus==='function')trigger.focus()}
function back(){if(view==='home')close();else if(view==='pdo')prob();else if(view==='quizq')quiz();else home()}
window.openPhysicsLab=open;window.closePhysicsLabInternal=close;window.physicsBack=back;window.getPhysicsView=function(){return view};`,
  'Physics Lab open/close/back re-entry fix'
);

// 3d. Clear inline display/pointer-events/visibility on open in all other lab overlays
replaceExact(
  `function open(){overlay.classList.add('eng-on');document.body.style.overflow='hidden';}`,
  `function open(){overlay.style.removeProperty('display');overlay.style.removeProperty('pointer-events');overlay.style.removeProperty('visibility');overlay.setAttribute('aria-hidden','false');overlay.classList.remove('eng-subview');overlay.classList.add('eng-on');document.body.style.overflow='hidden';}
window.openEngLab=open;`,
  'Engineering Lab open() unblock'
);

replaceExact(
  `function open(){root.classList.add('on');root.scrollTop=0;document.body.style.overflow='hidden'}`,
  `function open(){root.style.removeProperty('display');root.style.removeProperty('pointer-events');root.style.removeProperty('visibility');root.setAttribute('aria-hidden','false');root.classList.add('on');root.scrollTop=0;document.body.style.overflow='hidden'}`,
  'chemOverlay open() unblock'
);

replaceExact(
`function open() {
  root.classList.add('on');
  root.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}`,
`function open() {
  root.style.removeProperty('display');
  root.style.removeProperty('pointer-events');
  root.style.removeProperty('visibility');
  root.setAttribute('aria-hidden', 'false');
  root.classList.add('on');
  root.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}`,
  'AI Lab open() unblock'
);

replaceExact(
  `function open(){root.classList.add('open');root.scrollTop=0;document.body.style.overflow='hidden';drawGraph();}`,
  `function open(){root.style.removeProperty('display');root.style.removeProperty('pointer-events');root.style.removeProperty('visibility');root.setAttribute('aria-hidden','false');root.classList.add('open');root.scrollTop=0;document.body.style.overflow='hidden';drawGraph();}window.openMathLab=open;`,
  'Math Lab open() unblock'
);

replaceExact(
  `function open(){root.classList.add('on');root.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';go('home')}`,
  `function open(){root.style.removeProperty('display');root.style.removeProperty('pointer-events');root.style.removeProperty('visibility');root.classList.add('on');root.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';go('home')}window.openComputerLab=open;`,
  'Computer Lab open() unblock'
);

replaceExact(
`function openChem() {
  chemRoot.classList.add('on');`,
`function openChem() {
  chemRoot.style.removeProperty('display');
  chemRoot.style.removeProperty('pointer-events');
  chemRoot.style.removeProperty('visibility');
  chemRoot.setAttribute('aria-hidden', 'false');
  chemRoot.classList.add('on');`,
  'Chemistry 3D Lab openChem() unblock'
);

replaceExact(
  `card.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();root.classList.add('open');root.scrollTop=0;document.body.style.overflow='hidden';},true);`,
  `function openBio(){root.style.removeProperty('display');root.style.removeProperty('pointer-events');root.style.removeProperty('visibility');root.setAttribute('aria-hidden','false');root.classList.add('open');root.scrollTop=0;document.body.style.overflow='hidden';}window.openBioLab=openBio;card.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openBio();},true);`,
  'Biology Lab openBio() unblock'
);

replaceExact(
`  function openProfile() {
    closeSwitchModal();
    closeLogoutModal();
    refresh();
    screen('home');
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
  }`,
`  function openProfile() {
    closeSwitchModal();
    closeLogoutModal();
    refresh();
    screen('home');
    root.style.removeProperty('display');
    root.style.removeProperty('pointer-events');
    root.style.removeProperty('visibility');
    root.setAttribute('aria-hidden', 'false');
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
  }`,
  'Profile openProfile() unblock'
);

// 3e. SU_NAV overlay manager: add chemLabRoot + .pl MutationObserver + Physics subview back support
replaceExact(
  `    { id: 'chemOverlay', openClasses: ['on', 'open'], closeSelectors: ['#chemClose', '.ch-back#chemClose', '#clBackBtn', '.cl-back#clBackBtn'] },`,
  `    { id: 'chemLabRoot', openClasses: ['on', 'fullscreen', 'open'], closeSelectors: ['#clBackBtn', '.cl-back#clBackBtn'] },\n    { id: 'chemOverlay', openClasses: ['on', 'open'], closeSelectors: ['#chemClose', '.ch-back#chemClose', '#clBackBtn', '.cl-back#clBackBtn'] },`,
  'SU_NAV OVERLAY_CONFIGS chemLabRoot'
);

replaceExact(
`    const math = $('mathOverlay');
    if (math && (math.classList.contains('open') || math.classList.contains('on'))) {
      const activeTab = math.querySelector('.mtab.active, [data-mtab].active');
      if (activeTab && activeTab.dataset.mtab && activeTab.dataset.mtab !== 'learn') {
        return { type: 'mathSubtab', tab: activeTab.dataset.mtab };
      }
    }

    return null;`,
`    const pl = document.querySelector('.pl');
    if (pl && pl.classList.contains('on') && typeof window.getPhysicsView === 'function') {
      const pv = window.getPhysicsView();
      if (pv && pv !== 'home') {
        return { type: 'physicsSubview', view: pv };
      }
    }

    const math = $('mathOverlay');
    if (math && (math.classList.contains('open') || math.classList.contains('on'))) {
      const activeTab = math.querySelector('.mtab.active, [data-mtab].active');
      if (activeTab && activeTab.dataset.mtab && activeTab.dataset.mtab !== 'learn') {
        return { type: 'mathSubtab', tab: activeTab.dataset.mtab };
      }
    }

    return null;`,
  'SU_NAV getActiveSubView physicsSubview'
);

replaceExact(
`  function closePhysicsLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || getComputedStyle(pl).display !== 'none')) {
      pl.classList.remove('on');
      pl.style.setProperty('display', 'none', 'important');
      pl.style.setProperty('pointer-events', 'none', 'important');
      pl.setAttribute('aria-hidden', 'true');
      if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch(_) {}
      }
      return true;
    }
    return false;
  }`,
`  function closePhysicsLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || getComputedStyle(pl).display !== 'none')) {
      if (typeof window.closePhysicsLabInternal === 'function') {
        try { window.closePhysicsLabInternal(); } catch (_) {}
      }
      pl.classList.remove('on', 'fullscreen');
      document.body.classList.remove('pl-landscape-mode');
      pl.style.setProperty('display', 'none', 'important');
      pl.style.setProperty('pointer-events', 'none', 'important');
      pl.setAttribute('aria-hidden', 'true');
      if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch(_) {}
      }
      return true;
    }
    return false;
  }`,
  'SU_NAV closePhysicsLab internal cleanup'
);

replaceExact(
`      if (subView.type === 'mathSubtab') {
        const math = $('mathOverlay');
        const learnBtn = math ? math.querySelector('[data-mtab="learn"]') : null;
        if (learnBtn) {
          learnBtn.click();
          return true;
        }
      }`,
`      if (subView.type === 'physicsSubview' && typeof window.physicsBack === 'function') {
        window.physicsBack();
        return true;
      }
      if (subView.type === 'mathSubtab') {
        const math = $('mathOverlay');
        const learnBtn = math ? math.querySelector('[data-mtab="learn"]') : null;
        if (learnBtn) {
          learnBtn.click();
          return true;
        }
      }`,
  'SU_NAV back() physicsSubview'
);

replaceExact(
`      observer.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'] });
    });`,
`      observer.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'] });
    });

    const plRoot = document.querySelector('.pl');
    if (plRoot) {
      const plObs = new MutationObserver(() => {
        if (plRoot.classList.contains('on')) unblockOverlayElement(plRoot);
      });
      plObs.observe(plRoot, { attributes: true, attributeFilter: ['class'] });
    }`,
  'SU_NAV .pl MutationObserver unblock'
);

replaceExact(
  `      if (btn.matches('.pl-back')) { closePhysicsLab(); restoreBaseState(); return; }`,
  `      if (btn.matches('.pl-back')) {\n        const sub = getActiveSubView();\n        if (sub && sub.type === 'physicsSubview' && typeof window.physicsBack === 'function') { window.physicsBack(); return; }\n        closePhysicsLab(); restoreBaseState(); return;\n      }`,
  'SU_NAV .pl-back subview step-back'
);

// 3f. Desktop dashboard script: dynamic door query + carousel rotation sync
replaceExact(
`  function initDesktopDashboard() {
    const ring = document.getElementById('ring');
    const doors = ring ? [].slice.call(ring.querySelectorAll('.wall .card')) : [];

    // 1. Quick Launcher Tiles (all 8 labs)
    document.querySelectorAll('.su-launcher-tile[data-su-wall-idx]').forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(tile.dataset.suWallIdx, 10);
        if (doors[idx]) {
          doors[idx].click();
        }
      });
    });

    // 2. Quick Action Buttons
    document.querySelectorAll('.su-qa-btn[data-qa-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const act = btn.dataset.qaAction;
        if (act === 'space' && doors[6]) doors[6].click();
        else if (act === 'math' && doors[5]) doors[5].click();
        else if (act === 'ai' && doors[2]) doors[2].click();
        else if (act === 'profile') {
          const accBtn = document.getElementById('logout');
          if (accBtn) accBtn.click();
        }
      });
    });

    // 3. Recommended Learning Path Buttons
    document.querySelectorAll('.su-path-card[data-path-open]').forEach(card => {
      const btn = card.querySelector('.su-pc-btn');
      const action = () => {
        const idx = parseInt(card.dataset.pathOpen, 10);
        if (doors[idx]) doors[idx].click();
      };
      if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); action(); });
      card.addEventListener('click', action);
    });`,
`  function initDesktopDashboard() {
    function triggerLabAt(idx) {
      const ring = document.getElementById('ring');
      const doors = ring ? [].slice.call(ring.querySelectorAll('.wall .card')) : [];
      if (typeof window.suRotateToLab === 'function') window.suRotateToLab(idx);
      if (doors[idx]) doors[idx].click();
    }

    // 1. Quick Launcher Tiles (all 8 labs)
    document.querySelectorAll('.su-launcher-tile[data-su-wall-idx]').forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(tile.dataset.suWallIdx, 10);
        triggerLabAt(idx);
      });
    });

    // 2. Quick Action Buttons
    document.querySelectorAll('.su-qa-btn[data-qa-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const act = btn.dataset.qaAction;
        if (act === 'space') triggerLabAt(6);
        else if (act === 'math') triggerLabAt(5);
        else if (act === 'ai') triggerLabAt(2);
        else if (act === 'profile') {
          const accBtn = document.getElementById('logout');
          if (accBtn) accBtn.click();
        }
      });
    });

    // 3. Recommended Learning Path Buttons
    document.querySelectorAll('.su-path-card[data-path-open]').forEach(card => {
      const btn = card.querySelector('.su-pc-btn');
      const action = () => {
        const idx = parseInt(card.dataset.pathOpen, 10);
        triggerLabAt(idx);
      };
      if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); action(); });
      card.addEventListener('click', action);
    });`,
  'su-desktop-dashboard-script dynamic doors and carousel sync'
);

// ============================================================================
// 4. REPLACE AI-LIKE EMOJIS WITH CLEAN VECTOR OUTLINE ICONS (.su-ico)
// ============================================================================

// 4a. Remove universal-emoji-mono-engine script
const monoEngineRe = /<script id="universal-emoji-mono-engine">[\s\S]*?<\/script>\s*/;
if (!monoEngineRe.test(html)) {
  throw new Error('Could not find <script id="universal-emoji-mono-engine">');
}
html = html.replace(monoEngineRe, '');

// 4b. Lab Directory (#suLabDirectory) — vector SVG icons + unblock on open + carousel sync
replaceExact(
` const labs=[['⚛️','Physics Lab','Физик, хөдөлгөөн, таталцал'],['🧪','Chemistry Lab','Хими, бодис, урвал'],['🤖','AI Lab','Хиймэл оюун ухаан'],['🧬','Biology Lab','Биологи, эс, генетик'],['💻','Computer Lab','Компьютерийн шинжлэх ухаан'],['📐','Math Lab','Математик, геометр'],['🪐','Space Lab','Сансар огторгуй'],['⚙️','Engineering Lab','Инженерчлэл, бүтээл']];
 function close(){modal.classList.remove('open')}
 function open(){modal.classList.add('open')}
 document.getElementById('suDirectoryClose').onclick=close;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
 labs.forEach((lab,i)=>{let b=document.createElement('button');b.type='button';b.className='directory-item';b.innerHTML='<span class="directory-icon">'+lab[0]+'</span><span class="directory-copy"><strong>'+lab[1]+'</strong><small>'+lab[2]+'</small></span><span class="directory-arrow">›</span>';
 b.addEventListener('click',()=>{close();const ring=document.getElementById('ring');const doors=ring&&ring.querySelectorAll('.wall .card');if(doors&&doors[i]){doors[i].click()}else{alert('Лабораторийг нээж чадсангүй')}});items.appendChild(b)});`,
` const labs=[
   ['${ICO.atom('lg')}','Physics Lab','Физик, хөдөлгөөн, таталцал'],
   ['${ICO.flask('lg')}','Chemistry Lab','Хими, бодис, урвал'],
   ['${ICO.bot('lg')}','AI Lab','Хиймэл оюун ухаан'],
   ['${ICO.dna('lg')}','Biology Lab','Биологи, эс, генетик'],
   ['${ICO.code('lg')}','Computer Lab','Компьютерийн шинжлэх ухаан'],
   ['${ICO.compass('lg')}','Math Lab','Математик, геометр'],
   ['${ICO.planet('lg')}','Space Lab','Сансар огторгуй'],
   ['${ICO.wrench('lg')}','Engineering Lab','Инженерчлэл, бүтээл']
 ];
 function close(){modal.classList.remove('open')}
 function open(){modal.style.removeProperty('display');modal.style.removeProperty('pointer-events');modal.style.removeProperty('visibility');modal.setAttribute('aria-hidden','false');modal.classList.add('open')}
 document.getElementById('suDirectoryClose').onclick=close;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
 labs.forEach((lab,i)=>{let b=document.createElement('button');b.type='button';b.className='directory-item';b.innerHTML='<span class="directory-icon">'+lab[0]+'</span><span class="directory-copy"><strong>'+lab[1]+'</strong><small>'+lab[2]+'</small></span><span class="directory-arrow">›</span>';
 b.addEventListener('click',()=>{close();if(typeof window.suRotateToLab==='function')window.suRotateToLab(i);const ring=document.getElementById('ring');const doors=ring&&ring.querySelectorAll('.wall .card');if(doors&&doors[i]){doors[i].click()}});items.appendChild(b)});`,
  'suLabDirectory vector icons and open/click sync'
);

// 4c. Profile (#suProfile) — vector SVG icons
replaceExact(
  `<button type="button" class="pr-avatar pr-avatar-upload" id="prAvatar" title="Зураг солих" aria-label="Профайл зураг солих">👤</button>`,
  `<button type="button" class="pr-avatar pr-avatar-upload" id="prAvatar" title="Зураг солих" aria-label="Профайл зураг солих">${ICO.user('xl')}</button>`,
  'prAvatar default SVG'
);
replaceExact(
  `<span style="color:#ff6b6b">🚪</span>`,
  `<span style="color:#ff6b6b">${ICO.logout('md')}</span>`,
  'prLogoutBtn SVG'
);
replaceExact(
  `<span style="color:#6ff0cf">🔑</span>`,
  `<span style="color:#6ff0cf">${ICO.key('md')}</span>`,
  'prLoginModalBtn SVG'
);
replaceExact(
  `<div class="pr-photo-hint">📷 Зураг солихын тулд дээрх профайл зураг дээр дарна уу</div>`,
  `<div class="pr-photo-hint">${ICO.camera('sm')} Зураг солихын тулд дээрх профайл зураг дээр дарна уу</div>`,
  'pr-photo-hint SVG'
);
replaceExact(
`        <button class="pr-row" data-propen="edit" type="button" id="prRowEdit">
          <span>👤</span>`,
`        <button class="pr-row" data-propen="edit" type="button" id="prRowEdit">
          <span>${ICO.user('md')}</span>`,
  'prRowEdit SVG'
);
replaceExact(
`        <button class="pr-row" data-propen="interests" type="button" id="prRowInterests">
          <span>📚</span>`,
`        <button class="pr-row" data-propen="interests" type="button" id="prRowInterests">
          <span>${ICO.book('md')}</span>`,
  'prRowInterests SVG'
);
replaceExact(
`        <button class="pr-row" data-propen="notes" type="button" id="prRowNotes">
          <span>📝</span>`,
`        <button class="pr-row" data-propen="notes" type="button" id="prRowNotes">
          <span>${ICO.note('md')}</span>`,
  'prRowNotes SVG'
);
replaceExact(
`        <button class="pr-row" data-propen="appearance" type="button" id="prRowAppearance">
          <span>🎨</span>`,
`        <button class="pr-row" data-propen="appearance" type="button" id="prRowAppearance">
          <span>${ICO.palette('md')}</span>`,
  'prRowAppearance SVG'
);
replaceExact(
  `<div class="pr-avatar pr-avatar-upload" id="prPreview" title="Зураг сонгох" style="cursor:pointer;width:84px;height:84px;font-size:36px;border:2px solid #5b6bff;box-shadow:0 0 16px rgba(91,107,255,0.4)">👤</div>`,
  `<div class="pr-avatar pr-avatar-upload" id="prPreview" title="Зураг сонгох" style="cursor:pointer;width:84px;height:84px;font-size:36px;border:2px solid #5b6bff;box-shadow:0 0 16px rgba(91,107,255,0.4)">${ICO.user('xl')}</div>`,
  'prPreview default SVG'
);
replaceExact(
  `<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;color:#7ea2ff">🔒 Түгжээтэй</span>`,
  `<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;color:#7ea2ff;display:inline-flex;align-items:center;gap:4px">${ICO.lock('sm')} Түгжээтэй</span>`,
  'prEditEmail lock SVG'
);
replaceExact(
  `<div style="font-size:36px;margin-bottom:10px;text-align:center">🚪</div>`,
  `<div style="margin-bottom:10px;text-align:center;color:#ff6b6b">${ICO.logout('xxl')}</div>`,
  'suLogoutConfirmModal SVG'
);
replaceExact(
`  const ALL_INTERESTS = [
    { id: 'Физик', label: '⚛️ Физик' },
    { id: 'Хими', label: '🧪 Хими' },
    { id: 'Биологи', label: '🧬 Биологи' },
    { id: 'Математик', label: '📐 Математик' },
    { id: 'Инженерчлэл', label: '⚙️ Инженерчлэл' },
    { id: 'Сансар судлал', label: '🪐 Сансар судлал' },
    { id: 'Компьютер', label: '💻 Компьютерийн шинжлэх ухаан' },
    { id: 'AI', label: '🤖 Хиймэл оюун' }
  ];`,
`  const ALL_INTERESTS = [
    { id: 'Физик', ico: '${ICO.atom('sm')}', label: 'Физик' },
    { id: 'Хими', ico: '${ICO.flask('sm')}', label: 'Хими' },
    { id: 'Биологи', ico: '${ICO.dna('sm')}', label: 'Биологи' },
    { id: 'Математик', ico: '${ICO.compass('sm')}', label: 'Математик' },
    { id: 'Инженерчлэл', ico: '${ICO.wrench('sm')}', label: 'Инженерчлэл' },
    { id: 'Сансар судлал', ico: '${ICO.planet('sm')}', label: 'Сансар судлал' },
    { id: 'Компьютер', ico: '${ICO.code('sm')}', label: 'Компьютерийн шинжлэх ухаан' },
    { id: 'AI', ico: '${ICO.bot('sm')}', label: 'Хиймэл оюун' }
  ];`,
  'ALL_INTERESTS vector icons'
);
replaceExact(
  `el.textContent = '👤';`,
  `el.innerHTML = '${ICO.user('xl')}';`,
  'syncAllAvatars fallback SVG'
);
replaceExact(
  `b.textContent = item.label;`,
  `b.innerHTML = item.ico + ' <span>' + item.label + '</span>';`,
  'renderInterests innerHTML SVG'
);

// 4d. Unlock Modal (#suUnlockModal)
replaceExact(
  `actionsEl.innerHTML = '<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn" aria-label="Болих">Болих</button>';`,
  `actionsEl.innerHTML = '<button type="button" class="su-btn-pay" id="suUnlockPayBtn">${ICO.unlock('sm')} ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn" aria-label="Болих">Болих</button>';`,
  'suUnlockPayBtn SVG'
);
replaceExact(
  `toast.textContent = '🚀 ' + info.title + ' амжилттай нээгдлээ!';`,
  `toast.textContent = info.title + ' амжилттай нээгдлээ!';`,
  'unlock toast clean text'
);

// 4e. Engineering Lab (#engOverlay)
replaceExact(
  `<div class="eng-tabs" role="tablist"><button class="active" data-engtab="learn">📚 Мэдлэг</button><button data-engtab="build">🛠 Загвар зохион бүтээх</button><button data-engtab="calc">🧮 Тооны машин</button><button data-engtab="experiments">🧪 Судалгаа, туршилт</button></div>`,
  `<div class="eng-tabs" role="tablist"><button class="active" data-engtab="learn">${ICO.book('sm')} Мэдлэг</button><button data-engtab="build">${ICO.wrench('sm')} Загвар зохион бүтээх</button><button data-engtab="calc">${ICO.calc('sm')} Тооны машин</button><button data-engtab="experiments">${ICO.flask('sm')} Судалгаа, туршилт</button></div>`,
  'engOverlay tabs SVGs'
);
replaceExact(
  `<section class="eng-panel" data-engpanel="build"><h2 class="eng-heading">🧪 ENGINEERING DESIGN STUDIO</h2>`,
  `<section class="eng-panel" data-engpanel="build"><h2 class="eng-heading">${ICO.wrench('md')} ENGINEERING DESIGN STUDIO</h2>`,
  'engOverlay studio heading SVG'
);
replaceExact(`<h3>🌉 1. Гүүрний ачаалал</h3>`, `<h3>${ICO.bridge('md')} 1. Гүүрний ачаалал</h3>`, 'eng exp 1 SVG');
replaceExact(`<h3>⚙️ 2. Арааны механизм</h3>`, `<h3>${ICO.gear('md')} 2. Арааны механизм</h3>`, 'eng exp 2 SVG');
replaceExact(`<h3>💡 3. Цахилгаан хэлхээ</h3>`, `<h3>${ICO.bulb('md')} 3. Цахилгаан хэлхээ</h3>`, 'eng exp 3 SVG');
replaceExact(`<h3>🏗️ 4. Дам нурууны гулзайлт</h3>`, `<h3>${ICO.beam('md')} 4. Дам нурууны гулзайлт</h3>`, 'eng exp 4 SVG');

replaceExact(
`var topics=[['⚙️ Механик инженерчлэл','Хүч, хөдөлгөөн, араа, хөшүүрэг, хөдөлгүүр, машин механизмын ажиллагаа.'],['🏗️ Барилгын инженерчлэл','Гүүр, барилга, дам нуруу, тулгуур, ачаалал, бат бэх ба тогтвортой байдал.'],['⚡ Цахилгааны инженерчлэл','Хүчдэл, гүйдэл, эсэргүүцэл, хэлхээ, мэдрэгч, цахилгаан төхөөрөмж.'],['🤖 Робот техник','Мотор, араа, мэдрэгч, удирдлага, автоматжуулалт, роботын хөдөлгөөн.'],['🧱 Материал судлал','Ган, хөнгөн цагаан, хуванцар, модны бат бэх, жин, уян чанар.'],['🚀 Агаар-сансрын инженерчлэл','Пуужин, нисэх төхөөрөмж, түлхэлт, аэродинамик, бүтцийн загвар.'],['💧 Шингэний механик','Даралт, насос, хоолойн урсгал, гидравлик механизм.'],['🌱 Эрчим хүчний инженерчлэл','Нар, салхи, генератор, энергийн хувиргалт ба үр ашиг.']];
var projects=[['🌉 Гүүр бүтээх','Алслалт, ачааллыг өөрчилж даацын моментыг шалга.','eBridgeF'],['⚙️ Арааны дамжуулга','Арааны шүдийг өөрчилж хурдны харьцааг тооц.','eGear1'],['💡 Хэлхээ угсрах','Хүчдэл ба эсэргүүцлээр гүйдлийг тохируул.','eVolt'],['🏗️ Дам нуруу сонгох','Материал, өндөр, огтлолын нөлөөг судал.','eE']];`,
`var topics=[['${ICO.gear('sm')} Механик инженерчлэл','Хүч, хөдөлгөөн, араа, хөшүүрэг, хөдөлгүүр, машин механизмын ажиллагаа.'],['${ICO.beam('sm')} Барилгын инженерчлэл','Гүүр, барилга, дам нуруу, тулгуур, ачаалал, бат бэх ба тогтвортой байдал.'],['${ICO.bolt('sm')} Цахилгааны инженерчлэл','Хүчдэл, гүйдэл, эсэргүүцэл, хэлхээ, мэдрэгч, цахилгаан төхөөрөмж.'],['${ICO.bot('sm')} Робот техник','Мотор, араа, мэдрэгч, удирдлага, автоматжуулалт, роботын хөдөлгөөн.'],['${ICO.layers('sm')} Материал судлал','Ган, хөнгөн цагаан, хуванцар, модны бат бэх, жин, уян чанар.'],['${ICO.rocket('sm')} Агаар-сансрын инженерчлэл','Пуужин, нисэх төхөөрөмж, түлхэлт, аэродинамик, бүтцийн загвар.'],['${ICO.droplet('sm')} Шингэний механик','Даралт, насос, хоолойн урсгал, гидравлик механизм.'],['${ICO.leaf('sm')} Эрчим хүчний инженерчлэл','Нар, салхи, генератор, энергийн хувиргалт ба үр ашиг.']];
var projects=[['${ICO.bridge('sm')} Гүүр бүтээх','Алслалт, ачааллыг өөрчилж даацын моментыг шалга.','eBridgeF'],['${ICO.gear('sm')} Арааны дамжуулга','Арааны шүдийг өөрчилж хурдны харьцааг тооц.','eGear1'],['${ICO.bulb('sm')} Хэлхээ угсрах','Хүчдэл ба эсэргүүцлээр гүйдлийг тохируул.','eVolt'],['${ICO.beam('sm')} Дам нуруу сонгох','Материал, өндөр, огтлолын нөлөөг судал.','eE']];`,
  'engOverlay topics & projects SVGs'
);

replaceExact(
`home.innerHTML='<div class="eng-home-hero"><div class="eng-emblem">⚙️</div><h2>ENGINEERING LAB</h2><p>Суралц • Зохион бүтээ • Тооцоол • Турш</p></div><div class="eng-home-grid">'+[
['learn','📚','Инженерчлэл гэж юу вэ?','Үндсэн мэдлэг','#438eff','#3473ff50'],
['build','🛠️','Загвар зохион бүтээх','Механизм ба бүтээл','#ffa54b','#ff913c50'],
['calc','🧮','Тооны машин','Энгийн ба инженерийн тооцоо','#20e3aa','#1bcf9d50'],
['experiments','🧪','Судалгаа, туршилт','Интерактив туршилтууд','#b18aff','#9c65ff50']`,
`home.innerHTML='<div class="eng-home-hero"><div class="eng-emblem">${ICO.gear('xxl')}</div><h2>ENGINEERING LAB</h2><p>Суралц • Зохион бүтээ • Тооцоол • Турш</p></div><div class="eng-home-grid">'+[
['learn','${ICO.book('xl')}','Инженерчлэл гэж юу вэ?','Үндсэн мэдлэг','#438eff','#3473ff50'],
['build','${ICO.wrench('xl')}','Загвар зохион бүтээх','Механизм ба бүтээл','#ffa54b','#ff913c50'],
['calc','${ICO.calc('xl')}','Тооны машин','Энгийн ба инженерийн тооцоо','#20e3aa','#1bcf9d50'],
['experiments','${ICO.flask('xl')}','Судалгаа, туршилт','Интерактив туршилтууд','#b18aff','#9c65ff50']`,
  'engOverlay home grid SVGs'
);

// 4f. Chemistry 3D Lab (#chemLabRoot) & Chemistry Overlay (#chemOverlay)
replaceExact(
  `<div style="font-size:32px;margin-bottom:8px">🧪</div>`,
  `<div style="margin-bottom:8px;color:#00f2fe">${ICO.flask('xxl')}</div>`,
  'cl-blocker flask SVG'
);
replaceExact(
`          <div class="cl-overlay-tools">
            <button id="clSpeedBtn" class="cl-tool-btn" title="Хөдөлгөөний хурд тохируулах">⚙️</button>
            <button id="clFsBtn" class="cl-tool-btn" title="Бүрэн дэлгэцээр нээх">⛶</button>
            <button id="clAudioBtn" class="cl-tool-btn" title="Дуу асаах / унтраах">🔊</button>
          </div>`,
`          <div class="cl-overlay-tools">
            <button id="clSpeedBtn" class="cl-tool-btn" title="Хөдөлгөөний хурд тохируулах">${ICO.sliders('sm')}</button>
            <button id="clFsBtn" class="cl-tool-btn" title="Бүрэн дэлгэцээр нээх">⛶</button>
            <button id="clAudioBtn" class="cl-tool-btn" title="Дуу асаах / унтраах">${ICO.speaker('sm')}</button>
          </div>`,
  'chemLabRoot overlay tool buttons SVGs'
);
replaceExact(
  `<div style="font-size:12px;color:#00f2fe;font-weight:700;margin-bottom:8px">⚙️ Хурдны тохиргоо</div>`,
  `<div style="font-size:12px;color:#00f2fe;font-weight:700;margin-bottom:8px">${ICO.sliders('sm')} Хурдны тохиргоо</div>`,
  'clSpeedPanel title SVG'
);
replaceExact(
`          <div class="cl-hud-strip">
            <span class="cl-hud-tag" id="hudBunsen">🔥 Бунзен [E]</span>
            <span class="cl-hud-tag" id="hudTitration">🧪 Титрлэлт [E]</span>
            <span class="cl-hud-tag" id="hudLum">💡 Люминол [E]</span>
            <span class="cl-hud-tag" id="hudMicro">🔬 Микроскоп [E]</span>
          </div>`,
`          <div class="cl-hud-strip">
            <span class="cl-hud-tag" id="hudBunsen">${ICO.flame('sm')} Бунзен [E]</span>
            <span class="cl-hud-tag" id="hudTitration">${ICO.flask('sm')} Титрлэлт [E]</span>
            <span class="cl-hud-tag" id="hudLum">${ICO.bulb('sm')} Люминол [E]</span>
            <span class="cl-hud-tag" id="hudMicro">${ICO.microscope('sm')} Микроскоп [E]</span>
          </div>`,
  'chemLabRoot HUD strip SVGs'
);
replaceExact(
  `<button class="cl-action-btn" id="clActionBtn">⚡ ҮЙЛДЭЛ [E]</button>`,
  `<button class="cl-action-btn" id="clActionBtn">${ICO.bolt('sm')} ҮЙЛДЭЛ [E]</button>`,
  'clActionBtn SVG'
);
replaceExact(
`      <div class="cl-tips-strip">
        <div><b>💻 Компьютер:</b> [W][A][S][D] - Хөдлөх · Хулгана - Харах · [E] эсвэл Зүүн даралт - Туршилт · [⚙️] - Хурд</div>
        <div><b>📱 Утас:</b> Баруун тал дээр чирж харах · Сумнуудаар алхах · [Үйлдэл] дарах</div>
      </div>`,
`      <div class="cl-tips-strip">
        <div><b>${ICO.monitor('sm')} Компьютер:</b> [W][A][S][D] - Хөдлөх · Хулгана - Харах · [E] эсвэл Зүүн даралт - Туршилт</div>
        <div><b>${ICO.phone('sm')} Утас:</b> Баруун тал дээр чирж харах · Сумнуудаар алхах · [Үйлдэл] дарах</div>
      </div>`,
  'chemLabRoot tips strip SVGs'
);
replaceExact(
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">🔥 1. Бунзен халаагуур ба Буцлах үзэгдэл</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#ea580c,#c2410c);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('boil')">🔥 Тавцан дээр турших</button></div>`,
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ICO.flame('md')} 1. Бунзен халаагуур ба Буцлах үзэгдэл</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#ea580c,#c2410c);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('boil')">${ICO.flame('sm')} Тавцан дээр турших</button></div>`,
  'chem exp 1 SVGs'
);
replaceExact(
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">🧪 2. Хүчил-Шүлтийн Титрлэлт (Саармагжих)</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#db2777,#be185d);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('titration')">🌸 Тавцан дээр турших</button></div>`,
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ICO.flask('md')} 2. Хүчил-Шүлтийн Титрлэлт (Саармагжих)</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#db2777,#be185d);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('titration')">${ICO.flask('sm')} Тавцан дээр турших</button></div>`,
  'chem exp 2 SVGs'
);
replaceExact(
  `<h3>💡 3. Люминолын Хүйтэн Гэрэл (Люминесценци)</h3>`,
  `<h3>${ICO.bulb('md')} 3. Люминолын Хүйтэн Гэрэл (Люминесценци)</h3>`,
  'chem exp 3 SVG'
);
replaceExact(
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">🔬 4. Зэсийн байван & Тунадас (CuSO₄)</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#0284c7,#0369a1);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('precip')">🟦 Тавцан дээр турших</button></div>`,
  `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ICO.microscope('md')} 4. Зэсийн байван & Тунадас (CuSO₄)</h3><button class="pl-btn" type="button" style="background:linear-gradient(135deg,#0284c7,#0369a1);font-size:11px;padding:4px 10px" onclick="if(window.chemLoadPreset)window.chemLoadPreset('precip')">${ICO.flask('sm')} Тавцан дээр турших</button></div>`,
  'chem exp 4 SVGs'
);
replaceExact(
`        <h3>⚛️ Химийн шинжлэх ухаан гэж юу вэ?</h3>
        <p>Хими бол бодисын найрлага, бүтэц, шинж чанар болон тэдгээрийн хоорондын хувирал өөрчлөлтийг судалдаг байгалийн шинжлэх ухаан юм.</p>
        <div style="margin-top:8px">
          <span class="cl-chip">⚛️ Атом</span>
          <span class="cl-chip">🧪 Молекул</span>
          <span class="cl-chip">⚡ Ион</span>
          <span class="cl-chip">💧 Уусмал</span>
          <span class="cl-chip">🔥 Экзотерм</span>
          <span class="cl-chip">❄️ Эндотерм</span>
        </div>`,
`        <h3>${ICO.atom('md')} Химийн шинжлэх ухаан гэж юу вэ?</h3>
        <p>Хими бол бодисын найрлага, бүтэц, шинж чанар болон тэдгээрийн хоорондын хувирал өөрчлөлтийг судалдаг байгалийн шинжлэх ухаан юм.</p>
        <div style="margin-top:8px">
          <span class="cl-chip">${ICO.atom('sm')} Атом</span>
          <span class="cl-chip">${ICO.flask('sm')} Молекул</span>
          <span class="cl-chip">${ICO.bolt('sm')} Ион</span>
          <span class="cl-chip">${ICO.droplet('sm')} Уусмал</span>
          <span class="cl-chip">${ICO.flame('sm')} Экзотерм</span>
          <span class="cl-chip">${ICO.snowflake('sm')} Эндотерм</span>
        </div>`,
  'chem theory chips SVGs'
);
replaceExact(`<h3>📋 Түгээмэл Химийн Элементүүд</h3>`, `<h3>${ICO.note('md')} Түгээмэл Химийн Элементүүд</h3>`, 'chem elements heading SVG');
replaceExact(`<h3>⚠️ Лабораторийн Аюулгүй Ажиллагаа</h3>`, `<h3>${ICO.alert('md')} Лабораторийн Аюулгүй Ажиллагаа</h3>`, 'chem safety heading SVG');
replaceExact(
  `audioBtn.textContent = audioEnabled ? '🔊' : '🔇';`,
  `audioBtn.innerHTML = audioEnabled ? '${ICO.speaker('sm')}' : '${ICO.mute('sm')}';`,
  'chemLabRoot audioBtn toggle SVG'
);

replaceExact(
  `<div class="ch-cinema-controls"><button class="ch-mode active" data-chmode="atom" type="button">⚛ Атом</button><button class="ch-mode" data-chmode="molecule" type="button">🧬 Молекул</button><button class="ch-mode" data-chmode="flask" type="button">🧪 Урвал</button><button aria-pressed="false" class="ch-mode" id="chCinemaPause" type="button">⏸ Түр зогсоох</button></div>`,
  `<div class="ch-cinema-controls"><button class="ch-mode active" data-chmode="atom" type="button">${ICO.atom('sm')} Атом</button><button class="ch-mode" data-chmode="molecule" type="button">${ICO.dna('sm')} Молекул</button><button class="ch-mode" data-chmode="flask" type="button">${ICO.flask('sm')} Урвал</button><button aria-pressed="false" class="ch-mode" id="chCinemaPause" type="button">⏸ Түр зогсоох</button></div>`,
  'chemOverlay cinema controls SVGs'
);
replaceExact(
  `<div class="ch-tabs" role="tablist"><button class="active" data-chtab="learn">📚 Химийн мэдлэг</button><button data-chtab="atom">⚛️ Атом ба элемент</button><button data-chtab="reaction">🧬 Урвал тэнцүүлэх</button><button data-chtab="experiment">🧪 Виртуал туршилт</button><button data-chtab="formula">🧮 Химийн тооцоо</button><button data-chtab="quiz">🎯 Мэдлэг шалгах</button></div>`,
  `<div class="ch-tabs" role="tablist"><button class="active" data-chtab="learn">${ICO.book('sm')} Химийн мэдлэг</button><button data-chtab="atom">${ICO.atom('sm')} Атом ба элемент</button><button data-chtab="reaction">${ICO.refresh('sm')} Урвал тэнцүүлэх</button><button data-chtab="experiment">${ICO.flask('sm')} Виртуал туршилт</button><button data-chtab="formula">${ICO.calc('sm')} Химийн тооцоо</button><button data-chtab="quiz">${ICO.target('sm')} Мэдлэг шалгах</button></div>`,
  'chemOverlay tabs SVGs'
);
replaceExact(
  `$('#chEquationResult').textContent=(ok?'✅ Зөв! Атомын тоо хоёр талд тэнцсэн.':'❌ Хараахан тэнцээгүй. Дараах тоонуудыг харьцуул:')`,
  `$('#chEquationResult').textContent=(ok?'✓ Зөв! Атомын тоо хоёр талд тэнцсэн.':'✗ Хараахан тэнцээгүй. Дараах тоонуудыг харьцуул:')`,
  'chemOverlay equation check symbols'
);
replaceExact(
  `$('#chQuizFeedback').textContent=(ok?'✅ Зөв! ':'❌ Буруу. ')+q[3];`,
  `$('#chQuizFeedback').textContent=(ok?'✓ Зөв! ':'✗ Буруу. ')+q[3];`,
  'chemOverlay quiz feedback symbols'
);

// 4g. AI Lab (#aiOverlay)
replaceExact(
  `<button class="ai-btn" data-ai-tab="train" type="button">⚡ AI сургах</button>`,
  `<button class="ai-btn" data-ai-tab="train" type="button">${ICO.bolt('sm')} AI сургах</button>`,
  'aiOverlay train tab SVG'
);
replaceExact(
  `<button class="ai-btn" id="aiTrain" style="width:100%" type="button">⚡ Загвар сургах (Босго олох)</button>`,
  `<button class="ai-btn" id="aiTrain" style="width:100%" type="button">${ICO.bolt('sm')} Загвар сургах (Босго олох)</button>`,
  'aiOverlay train btn SVG'
);

// 4h. Math Lab (#mathOverlay)
replaceExact(`<span class="mnav-icon">📚</span>`, `<span class="mnav-icon">${ICO.book('md')}</span>`, 'math nav learn SVG');
replaceExact(`<span class="mnav-icon">📈</span>`, `<span class="mnav-icon">${ICO.chart('md')}</span>`, 'math nav graph SVG');
replaceExact(`<span class="mnav-icon">📐</span>`, `<span class="mnav-icon">${ICO.compass('md')}</span>`, 'math nav geometry SVG');
replaceExact(`<span class="mnav-icon">🧮</span>`, `<span class="mnav-icon">${ICO.calc('md')}</span>`, 'math nav algebra SVG');
replaceExact(`<span class="mnav-icon">📊</span>`, `<span class="mnav-icon">${ICO.bars('md')}</span>`, 'math nav stats SVG');
replaceExact(`<span class="mnav-icon">🎯</span>`, `<span class="mnav-icon">${ICO.target('md')}</span>`, 'math nav quiz SVG');
replaceExact(`<h3>📚 Математикийн дэлгэрэнгүй сургалтын сан</h3>`, `<h3>${ICO.book('md')} Математикийн дэлгэрэнгүй сургалтын сан</h3>`, 'math learn heading SVG');
replaceExact(`<h3>🧩 Алхамчилсан бодлого бодох дасгал</h3>`, `<h3>${ICO.puzzle('md')} Алхамчилсан бодлого бодох дасгал</h3>`, 'math practice heading SVG');
replaceExact(`<h3>📐 GEOMETRY STUDIO — Ахисан геометр</h3>`, `<h3>${ICO.compass('md')} GEOMETRY STUDIO — Ахисан геометр</h3>`, 'math geometry heading SVG');
replaceExact(`<summary>📖 Томьёо ба бодох аргачлал</summary>`, `<summary>${ICO.book('sm')} Томьёо ба бодох аргачлал</summary>`, 'math geo steps SVG');
replaceExact(`<h4>🎯 Геометрийн сорил</h4>`, `<h4>${ICO.target('sm')} Геометрийн сорил</h4>`, 'math geo challenge SVG');
replaceExact(`<button class="mbtn" id="mRoll">🎲 Шоо хаях</button>`, `<button class="mbtn" id="mRoll">${ICO.dice('sm')} Шоо хаях</button>`, 'math dice roll SVG');
replaceExact(`q('mathProblemSolution').textContent='💡 '+current.hint`, `q('mathProblemSolution').textContent='Зөвлөмж: '+current.hint`, 'math hint clean text');

// 4i. Computer Lab (#computerOverlay)
replaceExact(`<span class="c-nav-icon">⌂</span>`, `<span class="c-nav-icon">${ICO.home('md')}</span>`, 'computer nav home SVG');
replaceExact(`<span class="c-nav-icon">📚</span>`, `<span class="c-nav-icon">${ICO.book('md')}</span>`, 'computer nav learn SVG');
replaceExact(`<span class="c-nav-icon">🧩</span>`, `<span class="c-nav-icon">${ICO.puzzle('md')}</span>`, 'computer nav explore SVG');
replaceExact(`<span class="c-nav-icon">🔎</span>`, `<span class="c-nav-icon">${ICO.search('md')}</span>`, 'computer nav terms SVG');
replaceExact(`<span class="c-tile-icon">📚</span>`, `<span class="c-tile-icon">${ICO.book('lg')}</span>`, 'computer tile learn SVG');
replaceExact(`<span class="c-tile-icon">🧩</span>`, `<span class="c-tile-icon">${ICO.puzzle('lg')}</span>`, 'computer tile explore SVG');
replaceExact(`<span class="c-tile-icon">🌐</span>`, `<span class="c-tile-icon">${ICO.network('lg')}</span>`, 'computer tile network SVG');
replaceExact(`<span class="c-tile-icon">🔎</span>`, `<span class="c-tile-icon">${ICO.search('lg')}</span>`, 'computer tile terms SVG');
replaceExact(`<h3>🖥️ Компьютерын бүрэлдэхүүн</h3>`, `<h3>${ICO.monitor('md')} Компьютерын бүрэлдэхүүн</h3>`, 'computer demo 1 SVG');
replaceExact(`<h3>🔁 Мэдээлэл боловсруулах үе шат</h3>`, `<h3>${ICO.refresh('md')} Мэдээлэл боловсруулах үе шат</h3>`, 'computer demo 2 SVG');
replaceExact(`<h3>🔢 Хоёртын дүрслэл (Binary 8-Bit)</h3>`, `<h3>${ICO.hash('md')} Хоёртын дүрслэл (Binary 8-Bit)</h3>`, 'computer demo 3 SVG');
replaceExact(`<h3>🌐 Сүлжээний аялал (Packet Routing)</h3>`, `<h3>${ICO.network('md')} Сүлжээний аялал (Packet Routing)</h3>`, 'computer demo 4 SVG');
replaceExact(
  `<div class="c-display" id="cNetworkOutput">💻 A     · · ·     📡 Router     · · ·     💻 B</div>`,
  `<div class="c-display" id="cNetworkOutput">[PC A]   · · ·   [Router]   · · ·   [PC B]</div>`,
  'computer network display clean text'
);

// 4j. Biology Lab (#bioOverlay)
replaceExact(`<h1>🧬 BIOLOGY LAB</h1>`, `<h1>${ICO.dna('lg')} BIOLOGY LAB</h1>`, 'bio header SVG');
replaceExact(
  `<button class="bio-tab active" data-btab="learn">📚 Мэдлэг</button><button class="bio-tab" data-btab="cell">🔬 Эс ба микроскоп</button><button class="bio-tab" data-btab="dna">🧬 Генетик</button><button class="bio-tab" data-btab="body">🫀 Хүний бие</button><button class="bio-tab" data-btab="experiments">🌱 Туршилт</button><button class="bio-tab" data-btab="quiz">📝 Шалгалт</button>`,
  `<button class="bio-tab active" data-btab="learn">${ICO.book('sm')} Мэдлэг</button><button class="bio-tab" data-btab="cell">${ICO.microscope('sm')} Эс ба микроскоп</button><button class="bio-tab" data-btab="dna">${ICO.dna('sm')} Генетик</button><button class="bio-tab" data-btab="body">${ICO.heart('sm')} Хүний бие</button><button class="bio-tab" data-btab="experiments">${ICO.leaf('sm')} Туршилт</button><button class="bio-tab" data-btab="quiz">${ICO.note('sm')} Шалгалт</button>`,
  'bio tabs SVGs'
);
replaceExact(`<h3>🔬 Виртуал микроскоп</h3>`, `<h3>${ICO.microscope('md')} Виртуал микроскоп</h3>`, 'bio microscope SVG');
replaceExact(`<h3>🧬 ДНХ-ийн хослол</h3>`, `<h3>${ICO.dna('md')} ДНХ-ийн хослол</h3>`, 'bio dna SVG');
replaceExact(`<h3>❤️ Зүрхний цохилтын симуляц</h3>`, `<h3>${ICO.heart('md')} Зүрхний цохилтын симуляц</h3>`, 'bio heart SVG');
replaceExact(`<h3>☀️ Фотосинтез</h3>`, `<h3>${ICO.sun('md')} Фотосинтез</h3>`, 'bio sun SVG');
replaceExact(`<h3>🦠 Бактерийн өсөлт</h3>`, `<h3>${ICO.microscope('md')} Бактерийн өсөлт</h3>`, 'bio bacteria SVG');
replaceExact(`<h3>💧 Осмос</h3>`, `<h3>${ICO.droplet('md')} Осмос</h3>`, 'bio osmosis SVG');
replaceExact(`<h3>🌍 Экосистем ба хүнсний хэлхээ</h3>`, `<h3>${ICO.globe('md')} Экосистем ба хүнсний хэлхээ</h3>`, 'bio ecosystem SVG');
replaceExact(
  `<section class="sp-pane" data-sppane="extras"><div class="sp-card"><h3>🌠 Миний танилцуулга</h3><p id="spBioShow"></p><h3>🎯 Миний зорилго</h3><p id="spGoalShow"></p></div><div class="sp-card"><h3>🧪 Сонирхож буй лаборатори</h3><div id="spInterests"></div><p class="sp-muted">Эдгээрийг сонгож, өөрийн сонирхлыг хадгалаарай.</p></div><div class="sp-card"><h3>📌 Миний тэмдэглэл</h3>`,
  `<section class="sp-pane" data-sppane="extras"><div class="sp-card"><h3>${ICO.user('sm')} Миний танилцуулга</h3><p id="spBioShow"></p><h3>${ICO.target('sm')} Миний зорилго</h3><p id="spGoalShow"></p></div><div class="sp-card"><h3>${ICO.flask('sm')} Сонирхож буй лаборатори</h3><div id="spInterests"></div><p class="sp-muted">Эдгээрийг сонгож, өөрийн сонирхлыг хадгалаарай.</p></div><div class="sp-card"><h3>${ICO.note('sm')} Миний тэмдэглэл</h3>`,
  'bio extras pane SVGs'
);
replaceExact(
  `const systems=[['🧠 Мэдрэлийн','Тархи, нугас, мэдрэл; мэдээлэл хүлээн авч боловсруулан хариу үйлдлийг зохицуулна.'],['❤️ Цусны эргэлтийн','Зүрх, судас, цус; хүчилтөрөгч, шим бодис болон бусад бодисыг тээвэрлэнэ.'],['🫁 Амьсгалын','Уушги ба амьсгалын зам; O₂ авах, CO₂ ялгаруулах хийн солилцоо.'],['🍎 Хоол боловсруулах','Ам, ходоод, гэдэс, элэг, нойр булчирхай; хоолыг задлан шимэгдүүлнэ.'],['🦴 Тулгуур хөдөлгөөний','Яс, үе, булчин; биеийг тулж, хамгаалж, хөдөлгөнө.'],['🛡️ Дархлааны','Цагаан эс, тунгалгийн эрхтэн; эмгэгтөрөгчөөс хамгаалахад оролцоно.'],['💧 Шээс ялгаруулах','Бөөр, шээлэй, давсаг; бодисын солилцооны хаягдлыг гадагшлуулна.'],['⚖️ Дотоод шүүрлийн','Даавраар өсөлт, бодисын солилцоо, нөхөн үржихүйг зохицуулна.'],['👶 Үржлийн','Үржлийн эс, эрхтэн; үржил ба удамшлын мэдээлэл дамжуулалтад оролцоно.'],['🧴 Арьс бүрхүүлийн','Арьс, үс, хумс; хамгаалах, дулаан зохицуулах үүрэгтэй.']];`,
  `const systems=[['${ICO.bot('sm')} Мэдрэлийн','Тархи, нугас, мэдрэл; мэдээлэл хүлээн авч боловсруулан хариу үйлдлийг зохицуулна.'],['${ICO.heart('sm')} Цусны эргэлтийн','Зүрх, судас, цус; хүчилтөрөгч, шим бодис болон бусад бодисыг тээвэрлэнэ.'],['${ICO.refresh('sm')} Амьсгалын','Уушги ба амьсгалын зам; O₂ авах, CO₂ ялгаруулах хийн солилцоо.'],['${ICO.leaf('sm')} Хоол боловсруулах','Ам, ходоод, гэдэс, элэг, нойр булчирхай; хоолыг задлан шимэгдүүлнэ.'],['${ICO.layers('sm')} Тулгуур хөдөлгөөний','Яс, үе, булчин; биеийг тулж, хамгаалж, хөдөлгөнө.'],['${ICO.shield('sm')} Дархлааны','Цагаан эс, тунгалгийн эрхтэн; эмгэгтөрөгчөөс хамгаалахад оролцоно.'],['${ICO.droplet('sm')} Шээс ялгаруулах','Бөөр, шээлэй, давсаг; бодисын солилцооны хаягдлыг гадагшлуулна.'],['${ICO.scale('sm')} Дотоод шүүрлийн','Даавраар өсөлт, бодисын солилцоо, нөхөн үржихүйг зохицуулна.'],['${ICO.dna('sm')} Үржлийн','Үржлийн эс, эрхтэн; үржил ба удамшлын мэдээлэл дамжуулалтад оролцоно.'],['${ICO.user('sm')} Арьс бүрхүүлийн','Арьс, үс, хумс; хамгаалах, дулаан зохицуулах үүрэгтэй.']];`,
  'bio systems SVGs'
);
replaceExact(
  `$('bioFeedback').textContent=correct?'✅ Зөв!':'❌ Зөв хариулт: '+q[1][q[2]];`,
  `$('bioFeedback').textContent=correct?'✓ Зөв!':'✗ Зөв хариулт: '+q[1][q[2]];`,
  'bio quiz feedback clean symbols'
);

// 4k. Physics Lab (.pl) — vector SVG icons
replaceExact(
  `var QCATS=["Ерөнхий ба түүх","Эрдэмтэд","Нэгж","Хууль","Томьёо","Тооцоо"],QIC={"Ерөнхий ба түүх":"🌍","Эрдэмтэд":"👨‍🔬","Нэгж":"📏","Хууль":"⚖️","Томьёо":"🧮","Тооцоо":"✏️"};`,
  `var QCATS=["Ерөнхий ба түүх","Эрдэмтэд","Нэгж","Хууль","Томьёо","Тооцоо"],QIC={"Ерөнхий ба түүх":'${ICO.globe('md')}',"Эрдэмтэд":'${ICO.user('md')}',"Нэгж":'${ICO.ruler('md')}',"Хууль":'${ICO.scale('md')}',"Томьёо":'${ICO.calc('md')}',"Тооцоо":'${ICO.pencil('md')}'};`,
  'Physics QIC SVGs'
);

replaceExact(
`var TABS=["🌍 Танилцуулга","📜 Түүх","👨‍🔬 Эрдэмтэд","🧩 Салбарууд","📏 Нэгж","🧮 Томьёо","⚖️ Хууль","✏️ Бодлого бодох арга"];
var EVERY=[["🚲","Унадаг дугуй","хөдөлгөөн, хурд, үрэлт, хүч"],["📱","Гар утас, компьютер","цахилгаан, соронзон орон, хагас дамжуулагч"],["🚗","Машин","механик хөдөлгөөн, дулаан, энергийн хувирал"],["📷","Нүд, камер","гэрлийн ойлт ба хугарал"],["🔊","Дуу өсгөгч","дууны долгион, цахилгаан дохио"],["☀️","Нар, одод","таталцал, гэрэл, дулаан, цөмийн урвал"]];`,
`var TABS=[['${ICO.globe('sm')}','Танилцуулга'],['${ICO.book('sm')}','Түүх'],['${ICO.user('sm')}','Эрдэмтэд'],['${ICO.puzzle('sm')}','Салбарууд'],['${ICO.ruler('sm')}','Нэгж'],['${ICO.calc('sm')}','Томьёо'],['${ICO.scale('sm')}','Хууль'],['${ICO.pencil('sm')}','Бодлого бодох арга']];
var EVERY=[['${ICO.gear('md')}','Унадаг дугуй','хөдөлгөөн, хурд, үрэлт, хүч'],['${ICO.phone('md')}','Гар утас, компьютер','цахилгаан, соронзон орон, хагас дамжуулагч'],['${ICO.rocket('md')}','Машин','механик хөдөлгөөн, дулаан, энергийн хувирал'],['${ICO.camera('md')}','Нүд, камер','гэрлийн ойлт ба хугарал'],['${ICO.speaker('md')}','Дуу өсгөгч','дууны долгион, цахилгаан дохио'],['${ICO.sun('md')}','Нар, одод','таталцал, гэрэл, дулаан, цөмийн урвал']];`,
  'Physics TABS & EVERY SVGs'
);

replaceExact(
  `TABS.map(function(t,n){var sp=t.indexOf(' '),ic=sp>-1?t.slice(0,sp):'',lb=sp>-1?t.slice(sp+1):t;return '<button type="button" role="tab" aria-selected="'+(n===itab)+'" class="pl-card-tab '+(n===itab?'on':'')+'" data-t="'+n+'"><span class="pl-tab-ico" aria-hidden="true">'+ic+'</span><span class="pl-tab-txt">'+lb+'</span></button>';})`,
  `TABS.map(function(t,n){var ic=Array.isArray(t)?t[0]:'',lb=Array.isArray(t)?t[1]:t;return '<button type="button" role="tab" aria-selected="'+(n===itab)+'" class="pl-card-tab '+(n===itab?'on':'')+'" data-t="'+n+'"><span class="pl-tab-ico" aria-hidden="true">'+ic+'</span><span class="pl-tab-txt">'+lb+'</span></button>';})`,
  'Physics renderInfo TABS array support'
);

replaceExact(
`var HIST=[["МЭӨ хэдэн мянган жил","🏺 Эртний соёл иргэншлүүд","Египет, Вавилон, Энэтхэг, Хятадын хүмүүс од эрхэс, улирал, цаг хугацаа, барилгын хэмжилт, хөдөлгөөнийг ажиглаж байв. Эдгээр мэдлэг нь одон орон, механик, хэмжилтийн хөгжлийн суурь болсон."],
["МЭӨ VI–IV зуун","🏛️ Эртний Грек","Фалес, Демокрит, Аристотель зэрэг сэтгэгчид байгаль, бодис, хөдөлгөөний талаар тайлбар дэвшүүлсэн. Зарим санаа хожим буруу болох нь тогтоогдсон ч байгалийг учир шалтгаанаар тайлбарлах оролдлого нь чухал байв."],
["V–XV зуун","🕌 Дундад зуун","Ибн аль-Хайсам гэрэл, харааны үзэгдлийг туршилт, ажиглалтаар судалсан. Түүний оптикийн судалгаа шинжлэх ухааны хөгжилд ихээхэн нөлөөлсөн."],
["XVI–XVII зуун","🔭 Шинжлэх ухааны хувьсгал","Коперник, Галилей, Кеплер нарын судалгаа байгалийг ажиглалт, хэмжилт, математикаар судлах аргыг хөгжүүлсэн. Орчин үеийн физикийн суурь тавигдсан чухал үе."],
["XVII–XIX зуун","🍎 Сонгодог физик","Ньютон хөдөлгөөний гурван хууль болон бүх ертөнцийн таталцлын хуулийг боловсруулсан. Дараа нь Фарадей, Максвелл, Жоуль нар цахилгаан соронзон үзэгдэл, энерги, дулааны мэдлэгийг хөгжүүлсэн."],
["XX зуун","⚛️ Орчин үеийн физик","Эйнштейн харьцангуйн онолыг хөгжүүлж, Планк, Бор, Хайзенберг нар квант физикийн хөгжилд хувь нэмэр оруулсан. Атом, электрон, гэрлийн шинж чанарыг илүү гүн ойлгох боломж нээгдсэн."],
["XXI зуун","🌌 Орчин үеийн судалгаа","Эрдэмтэд сансар огторгуй, хар нүх, квант технологи, бөөмс, таталцлын долгион болон орчлон ертөнцийн үүслийг судалсаар байна."]];`,
`var HIST=[["МЭӨ хэдэн мянган жил","Эртний соёл иргэншлүүд","Египет, Вавилон, Энэтхэг, Хятадын хүмүүс од эрхэс, улирал, цаг хугацаа, барилгын хэмжилт, хөдөлгөөнийг ажиглаж байв. Эдгээр мэдлэг нь одон орон, механик, хэмжилтийн хөгжлийн суурь болсон."],
["МЭӨ VI–IV зуун","Эртний Грек","Фалес, Демокрит, Аристотель зэрэг сэтгэгчид байгаль, бодис, хөдөлгөөний талаар тайлбар дэвшүүлсэн. Зарим санаа хожим буруу болох нь тогтоогдсон ч байгалийг учир шалтгаанаар тайлбарлах оролдлого нь чухал байв."],
["V–XV зуун","Дундад зуун","Ибн аль-Хайсам гэрэл, харааны үзэгдлийг туршилт, ажиглалтаар судалсан. Түүний оптикийн судалгаа шинжлэх ухааны хөгжилд ихээхэн нөлөөлсөн."],
["XVI–XVII зуун","Шинжлэх ухааны хувьсгал","Коперник, Галилей, Кеплер нарын судалгаа байгалийг ажиглалт, хэмжилт, математикаар судлах аргыг хөгжүүлсэн. Орчин үеийн физикийн суурь тавигдсан чухал үе."],
["XVII–XIX зуун","Сонгодог физик","Ньютон хөдөлгөөний гурван хууль болон бүх ертөнцийн таталцлын хуулийг боловсруулсан. Дараа нь Фарадей, Максвелл, Жоуль нар цахилгаан соронзон үзэгдэл, энерги, дулааны мэдлэгийг хөгжүүлсэн."],
["XX зуун","Орчин үеийн физик","Эйнштейн харьцангуйн онолыг хөгжүүлж, Планк, Бор, Хайзенберг нар квант физикийн хөгжилд хувь нэмэр оруулсан. Атом, электрон, гэрлийн шинж чанарыг илүү гүн ойлгох боломж нээгдсэн."],
["XXI зуун","Орчин үеийн судалгаа","Эрдэмтэд сансар огторгуй, хар нүх, квант технологи, бөөмс, таталцлын долгион болон орчлон ертөнцийн үүслийг судалсаар байна."]];`,
  'Physics HIST clean headings'
);

replaceExact(
  `var BR=[["⚙️","Механик","Биеийн хөдөлгөөн, хурд, хүч, энерги, таталцлыг судална.","Машин яагаад хөдөлдөг, бөмбөг яагаад газарт унадаг вэ?"],["🔥","Дулааны физик","Температур, дулаан, бодисын төлөв, энергийн шилжилтийг судална.","Цай яагаад хөрдөг, мөс яагаад хайлдаг вэ?"],["⚡","Цахилгаан ба соронзон","Цэнэг, гүйдэл, хүчдэл, эсэргүүцэл, соронзон орныг судална.","Гар утас яагаад цэнэглэгддэг вэ?"],["💡","Оптик","Гэрлийн ойлт, хугарал, линз, толь, өнгө болон дүрс үүсэхийг судална.","Солонго яаж үүсдэг вэ?"],["🔊","Долгион ба акустик","Дуу, хэлбэлзэл, долгионы тархалт, давтамж, далайцыг судална.","Дуу яагаад зарим үед нимгэн, зарим үед бүдүүн сонсогддог вэ?"],["⚛️","Атом ба цөмийн физик","Атом, атомын цөм, бөөмс, цацраг идэвхт үзэгдлийг судална.","Нар яагаад гэрэлтдэг вэ?"],["🪐","Астрофизик","Од, гараг, галактик, хар нүх болон орчлон ертөнцийг физикийн хуулиар судална.","Хар нүх гэж юу вэ?"]];`,
  `var BR=[['${ICO.gear('md')}',"Механик","Биеийн хөдөлгөөн, хурд, хүч, энерги, таталцлыг судална.","Машин яагаад хөдөлдөг, бөмбөг яагаад газарт унадаг вэ?"],['${ICO.flame('md')}',"Дулааны физик","Температур, дулаан, бодисын төлөв, энергийн шилжилтийг судална.","Цай яагаад хөрдөг, мөс яагаад хайлдаг вэ?"],['${ICO.bolt('md')}',"Цахилгаан ба соронзон","Цэнэг, гүйдэл, хүчдэл, эсэргүүцэл, соронзон орныг судална.","Гар утас яагаад цэнэглэгддэг вэ?"],['${ICO.bulb('md')}',"Оптик","Гэрлийн ойлт, хугарал, линз, толь, өнгө болон дүрс үүсэхийг судална.","Солонго яаж үүсдэг вэ?"],['${ICO.speaker('md')}',"Долгион ба акустик","Дуу, хэлбэлзэл, долгионы тархалт, давтамж, далайцыг судална.","Дуу яагаад зарим үед нимгэн, зарим үед бүдүүн сонсогддог вэ?"],['${ICO.atom('md')}',"Атом ба цөмийн физик","Атом, атомын цөм, бөөмс, цацраг идэвхт үзэгдлийг судална.","Нар яагаад гэрэлтдэг вэ?"],['${ICO.planet('md')}',"Астрофизик","Од, гараг, галактик, хар нүх болон орчлон ертөнцийг физикийн хуулиар судална.","Хар нүх гэж юу вэ?"]];`,
  'Physics BR SVGs'
);

replaceExact(
`var LAWS=[["🍎","Ньютоны хөдөлгөөний гурван хууль","<ol><li>Гадны нийлбэр хүч үйлчлэхгүй бол бие тайван эсвэл шулуун жигд хөдөлгөөнөө хадгална.</li><li>Нийлбэр хүч нь масс ба хурдатгалын үржвэртэй тэнцүү: <span class=\\"pl-f\\">F = m·a</span></li><li>Харилцан үйлчлэх хоёр бие бие биедээ хэмжээ тэнцүү, чиглэл эсрэг хүчээр үйлчилнэ.</li></ol>"],
["🌀","Хукийн хууль","Пүршний суналт нь уян харимхайн мужид үйлчлэх хүчтэй пропорционал байна."],
["🔌","Омын хууль","Тогтмол эсэргүүцэлтэй хэлхээнд гүйдэл нь хүчдэлтэй шууд, эсэргүүцэлтэй урвуу пропорционал."],
["🛟","Архимедийн зарчим","Шингэн эсвэл хийд дүрэгдсэн биед шилжүүлэн түрэгдсэн шингэн буюу хийн жинтэй тэнцүү дээш чиглэсэн хөвүүлэх хүч үйлчилнэ."],
["🧲","Фарадейн цахилгаан соронзон индукцийн хууль","Хэлхээгээр нэвтрэх соронзон урсгал өөрчлөгдөхөд индукцийн цахилгаан хөдөлгөгч хүч үүснэ. Энэ зарчим генераторын ажиллагааны үндэс юм."],
["🔥","Жоуль–Ленцийн хууль","Дамжуулагчаар гүйдэл гүйхэд ялгарах дулаан нь гүйдлийн квадратад, эсэргүүцэл болон хугацаанд пропорционал."]];`,
`var LAWS=[['${ICO.scale('md')}',"Ньютоны хөдөлгөөний гурван хууль","<ol><li>Гадны нийлбэр хүч үйлчлэхгүй бол бие тайван эсвэл шулуун жигд хөдөлгөөнөө хадгална.</li><li>Нийлбэр хүч нь масс ба хурдатгалын үржвэртэй тэнцүү: <span class=\\"pl-f\\">F = m·a</span></li><li>Харилцан үйлчлэх хоёр бие бие биедээ хэмжээ тэнцүү, чиглэл эсрэг хүчээр үйлчилнэ.</li></ol>"],
['${ICO.refresh('md')}',"Хукийн хууль","Пүршний суналт нь уян харимхайн мужид үйлчлэх хүчтэй пропорционал байна."],
['${ICO.bolt('md')}',"Омын хууль","Тогтмол эсэргүүцэлтэй хэлхээнд гүйдэл нь хүчдэлтэй шууд, эсэргүүцэлтэй урвуу пропорционал."],
['${ICO.droplet('md')}',"Архимедийн зарчим","Шингэн эсвэл хийд дүрэгдсэн биед шилжүүлэн түрэгдсэн шингэн буюу хийн жинтэй тэнцүү дээш чиглэсэн хөвүүлэх хүч үйлчилнэ."],
['${ICO.magnet('md')}',"Фарадейн цахилгаан соронзон индукцийн хууль","Хэлхээгээр нэвтрэх соронзон урсгал өөрчлөгдөхөд индукцийн цахилгаан хөдөлгөгч хүч үүснэ. Энэ зарчим генераторын ажиллагааны үндэс юм."],
['${ICO.flame('md')}',"Жоуль–Ленцийн хууль","Дамжуулагчаар гүйдэл гүйхэд ялгарах дулаан нь гүйдлийн квадратад, эсэргүүцэл болон хугацаанд пропорционал."]];`,
  'Physics LAWS SVGs'
);

// Replace SP problem category `e:"..."` emojis with vector icons
html = html.replace(/(\{id:"[a-z0-9_]+",e:)"([^"]+)"(,g:"([^"]+)")/g, (_, pre, _old, post, grp) => {
  const byGrp = {
    'Механик': ICO.gear('md'),
    'Дулаан': ICO.flame('md'),
    'Цахилгаан': ICO.bolt('md'),
    'Долгион, оптик': ICO.bulb('md'),
    'Таталцал, орчин үе': ICO.atom('md'),
  };
  return `${pre}'${byGrp[grp] || ICO.calc('md')}'${post}`;
});

replaceExact(`h:["💡 "+sp.tip+" Үндсэн томьёо: "+sp.f`, `h:["Зөвлөмж: "+sp.tip+" Үндсэн томьёо: "+sp.f`, 'Physics SP hint clean text');
replaceExact(`<span class="pl-te">🎲</span>`, `<span class="pl-te">${ICO.dice('md')}</span>`, 'Physics mixed quiz dice SVG');

replaceExact(
  `<div style="font-size:32px;margin-bottom:8px">⚛️</div>`,
  `<div style="margin-bottom:8px;color:#ffb866">${ICO.atom('xxl')}</div>`,
  'pl-blocker atom SVG'
);
replaceExact(
`          <div class="pl-overlay-tools">
            <button id="plSpeedBtn" class="pl-tool-btn" type="button" title="Хөдөлгөөний хурд тохируулах">⚙️</button>
            <button id="plFsBtn" class="pl-tool-btn" type="button" title="Бүрэн дэлгэцээр нээх">⛶</button>
            <button id="plAudioBtn" class="pl-tool-btn" type="button" title="Дуу асаах / унтраах">🔊</button>
          </div>`,
`          <div class="pl-overlay-tools">
            <button id="plSpeedBtn" class="pl-tool-btn" type="button" title="Хөдөлгөөний хурд тохируулах">${ICO.sliders('sm')}</button>
            <button id="plFsBtn" class="pl-tool-btn" type="button" title="Бүрэн дэлгэцээр нээх">⛶</button>
            <button id="plAudioBtn" class="pl-tool-btn" type="button" title="Дуу асаах / унтраах">${ICO.speaker('sm')}</button>
          </div>`,
  'pl-overlay-tools SVGs'
);
replaceExact(
  `<div style="font-size:12px;color:#ffb866;font-weight:700;margin-bottom:8px">⚙️ Хурдны тохиргоо</div>`,
  `<div style="font-size:12px;color:#ffb866;font-weight:700;margin-bottom:8px">${ICO.sliders('sm')} Хурдны тохиргоо</div>`,
  'plSpeedPanel title SVG'
);
replaceExact(
`            <div class="pl-quest-hdr">
              <span class="pl-quest-badge">🎮 ДААЛГАВАР <b id="plQuestStep">1/5</b></span>
              <span class="pl-quest-score" id="plQuestScore">★ 0 / 75</span>
            </div>
            <div class="pl-quest-title" id="plQuestTitle">⚖️ 1. Ньютоны дүүжин: Импульс дамжуулах</div>
            <div class="pl-quest-desc" id="plQuestDesc">Бөмбөлгийг 35° өнцгөөр татаж савлуул. Импульс дундын бөмбөлгүүдээр алдагдалгүй дамжиж эсрэг бөмбөлгийг ойлгохыг 3D орчинд бодитоор ажигла!</div>
            <div class="pl-quest-actions">
              <button class="pl-qbtn primary" id="plQuestActBtn" type="button">🕹️ Турших / Угсрах</button>
              <button class="pl-qbtn" id="plQuestTeleportBtn" type="button" title="Багаж руу ойртож харах">👁️ Очиж харах</button>
            </div>`,
`            <div class="pl-quest-hdr">
              <span class="pl-quest-badge">${ICO.target('sm')} ДААЛГАВАР <b id="plQuestStep">1/5</b></span>
              <span class="pl-quest-score" id="plQuestScore">★ 0 / 75</span>
            </div>
            <div class="pl-quest-title" id="plQuestTitle">1. Ньютоны дүүжин: Импульс дамжуулах</div>
            <div class="pl-quest-desc" id="plQuestDesc">Бөмбөлгийг 35° өнцгөөр татаж савлуул. Импульс дундын бөмбөлгүүдээр алдагдалгүй дамжиж эсрэг бөмбөлгийг ойлгохыг 3D орчинд бодитоор ажигла!</div>
            <div class="pl-quest-actions">
              <button class="pl-qbtn primary" id="plQuestActBtn" type="button">${ICO.wrench('sm')} Турших / Угсрах</button>
              <button class="pl-qbtn" id="plQuestTeleportBtn" type="button" title="Багаж руу ойртож харах">${ICO.eye('sm')} Очиж харах</button>
            </div>`,
  'pl-quest-card SVGs'
);
replaceExact(
  `<div style="font-size:36px;animation:plBounce 0.6s infinite alternate">🏆</div>`,
  `<div style="color:#fbbf24;animation:plBounce 0.6s infinite alternate">${ICO.trophy('xxl')}</div>`,
  'pl-victory trophy SVG'
);
replaceExact(
  `<button class="pl-action-btn" id="plActionBtn" type="button">⚡ ҮЙЛДЭЛ [E]</button>`,
  `<button class="pl-action-btn" id="plActionBtn" type="button">${ICO.bolt('sm')} ҮЙЛДЭЛ [E]</button>`,
  'plActionBtn SVG'
);
replaceExact(
`          <div class="pl-tools-dock" id="plToolsDock">
            <button class="pl-tool-item active" data-tool="newton" type="button"><span>⚖️</span><small>Ньютон [1]</small></button>
            <button class="pl-tool-item" data-tool="beam" type="button"><span>🏗️</span><small>Дамнуурга [2]</small></button>
            <button class="pl-tool-item" data-tool="laser" type="button"><span>🔴</span><small>Лазер [3]</small></button>
            <button class="pl-tool-item" data-tool="toroid" type="button"><span>⚡</span><small>Соронзон [4]</small></button>
            <button class="pl-tool-item" data-tool="atom" type="button"><span>⚛️</span><small>Атом [5]</small></button>
          </div>`,
`          <div class="pl-tools-dock" id="plToolsDock">
            <button class="pl-tool-item active" data-tool="newton" type="button"><span>${ICO.scale('md')}</span><small>Ньютон [1]</small></button>
            <button class="pl-tool-item" data-tool="beam" type="button"><span>${ICO.beam('md')}</span><small>Дамнуурга [2]</small></button>
            <button class="pl-tool-item" data-tool="laser" type="button"><span>${ICO.target('md')}</span><small>Лазер [3]</small></button>
            <button class="pl-tool-item" data-tool="toroid" type="button"><span>${ICO.bolt('md')}</span><small>Соронзон [4]</small></button>
            <button class="pl-tool-item" data-tool="atom" type="button"><span>${ICO.atom('md')}</span><small>Атом [5]</small></button>
          </div>`,
  'plToolsDock SVGs'
);
replaceExact(
`      <div class="cl-tips-strip" style="border-color:rgba(255,150,50,.35)">
        <div><b>💻 Компьютер:</b> [W][A][S][D] - Алхах · Хулгана - Харах · [E] - Турших · [⚙️] - Хурд/Өндөр · [⛶] - Дэлгэц дүүргэх</div>
        <div><b>📱 Утас:</b> Дэлгэц дээр чирж харах · Сумнуудаар алхах · [ҮЙЛДЭЛ] дарах</div>
      </div>`,
`      <div class="cl-tips-strip" style="border-color:rgba(255,150,50,.35)">
        <div><b>${ICO.monitor('sm')} Компьютер:</b> [W][A][S][D] - Алхах · Хулгана - Харах · [E] - Турших · [⛶] - Дэлгэц дүүргэх</div>
        <div><b>${ICO.phone('sm')} Утас:</b> Дэлгэц дээр чирж харах · Сумнуудаар алхах · [ҮЙЛДЭЛ] дарах</div>
      </div>`,
  'pl tips strip SVGs'
);
replaceExact(
`    audioBtn.textContent = window.plSoundMuted ? '🔇' : '🔊';
    audioBtn.title = 'Дуу асаах / унтраах';
    audioBtn.onclick = function(e) {
      e.preventDefault(); e.stopPropagation();
      window.plSoundMuted = !window.plSoundMuted;
      audioBtn.textContent = window.plSoundMuted ? '🔇' : '🔊';
      toast(window.plSoundMuted ? '🔇 Дуу хаалттай' : '🔊 Дуу асаалттай');
    };`,
`    audioBtn.innerHTML = window.plSoundMuted ? '${ICO.mute('sm')}' : '${ICO.speaker('sm')}';
    audioBtn.title = 'Дуу асаах / унтраах';
    audioBtn.onclick = function(e) {
      e.preventDefault(); e.stopPropagation();
      window.plSoundMuted = !window.plSoundMuted;
      audioBtn.innerHTML = window.plSoundMuted ? '${ICO.mute('sm')}' : '${ICO.speaker('sm')}';
      toast(window.plSoundMuted ? 'Дуу хаалттай' : 'Дуу асаалттай');
    };`,
  'plAudioBtn toggle SVGs'
);

// Strip remaining colorful pictographic emojis (U+1F300..U+1FAFF + variation selectors) across text labels/buttons
// while strictly preserving ★, π, Ω, √, ±, ×, ÷, →, ←, ‹, ›, ✕, ⛶, ²/³ subscripts/superscripts, and all SVGs!
const PICTO_EMOJI_RE = /[\u{1F300}-\u{1FAFF}][\uFE00-\uFE0F]?(?:\u200D[\u{1F300}-\u{1FAFF}\u2640\u2642\u2695\u2696\u2708][\uFE00-\uFE0F]?)*/gu;
const strippedPictos = (html.match(PICTO_EMOJI_RE) || []).length;
html = html.replace(PICTO_EMOJI_RE, '');
// Clean up double spaces created right after opening tag or quotes when stripping leading emoji + space
html = html.replace(/(>|\btextContent\s*=\s*['"`]) +(?=[А-ЯӨҮЁа-яөүёA-Za-z0-9])/g, '$1');

// ============================================================================
// 5. SAFETY VALIDATION BEFORE WRITING TO DISK
// ============================================================================

// Check 1: Zero <svg inside .textContent = '...' or <option>...
const badTextContent = html.match(/\.textContent\s*=\s*['"`][^'"`\n]*<svg/g);
if (badTextContent) {
  throw new Error(`Found <svg inside .textContent: ${badTextContent.join(' | ')}`);
}
const badOption = html.match(/<option[^>]*>[^<]*<svg/g);
if (badOption) {
  throw new Error(`Found <svg inside <option>: ${badOption.join(' | ')}`);
}

// Check 2: Parse every inline classic <script> block with Node vm.Script to guarantee 0 JS syntax errors!
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m;
let checkedScripts = 0;
while ((m = scriptRe.exec(html)) !== null) {
  const attrs = m[1] || '';
  const body = m[2] || '';
  if (/type\s*=\s*["'](?:module|importmap|text\/plain)["']/i.test(attrs)) continue;
  if (/src\s*=/i.test(attrs) && !body.trim()) continue;
  try {
    new vm.Script(body, { filename: `inline-script-${checkedScripts + 1}.js` });
    checkedScripts++;
  } catch (err) {
    throw new Error(`JS syntax error in inline script #${checkedScripts + 1} (${attrs.trim()}): ${err.message}`);
  }
}

fs.writeFileSync(FILE, html, 'utf8');
console.log(`SUCCESS: Updated index.html (${checkedScripts} classic inline scripts syntax-verified, ${strippedPictos} residual pictographs stripped).`);

