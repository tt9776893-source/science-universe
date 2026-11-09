/**
 * Vector sci-fi equipment thumbnail icons representing the actual 3D GLB tools and assets
 */
export const TOOL_ICONS = {
  // 1. Mining Laser MK-1 (SU_Mining_Laser_MK1.glb)
  tool_mining_laser: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#0d1b2a"/>
    <path d="M10 26L24 16L32 16L36 20L28 28L18 28L14 34L10 32L10 26Z" fill="#1f3a52" stroke="#00f0ff" stroke-width="1.5"/>
    <rect x="30" y="18" width="8" height="3" rx="1" fill="#00f0ff"/>
    <path d="M38 19.5L46 19.5" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="45" cy="19.5" r="2" fill="#ffffff"/>
    <rect x="18" y="21" width="6" height="4" rx="1" fill="#00f0ff" opacity="0.6"/>
  </svg>`,

  // 2. Geological Pick Hammer (SU_Rock_Hammer.glb)
  tool_rock_hammer: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#141a1e"/>
    <line x1="12" y1="36" x2="32" y2="16" stroke="#8fa3b0" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 12L36 8L38 14L32 18L26 12Z" fill="#d1e3ee" stroke="#00f0ff" stroke-width="1.5"/>
    <path d="M36 8L42 10L38 14Z" fill="#00f0ff"/>
    <rect x="10" y="34" width="6" height="6" rx="1" fill="#00f0ff" opacity="0.4"/>
  </svg>`,

  // 3. Thermal Core Drill (SU_Thermal_Drill.glb)
  tool_thermal_drill: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#1c120c"/>
    <rect x="10" y="20" width="16" height="10" rx="2" fill="#2d221c" stroke="#ff7733" stroke-width="1.5"/>
    <path d="M26 21L42 25L26 29Z" fill="#ff5500" stroke="#ffaa44" stroke-width="1.5"/>
    <line x1="28" y1="23" x2="38" y2="25" stroke="#ffffff" stroke-width="1"/>
    <circle cx="16" cy="25" r="2.5" fill="#ff7733"/>
  </svg>`,

  // 4. Gravimetric Manipulator (SU_Terrain_Manipulator.glb)
  tool_terrain_manipulator: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#121820"/>
    <rect x="8" y="21" width="18" height="8" rx="2" fill="#1c2633" stroke="#33aaff" stroke-width="1.5"/>
    <circle cx="34" cy="25" r="9" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="3 2"/>
    <circle cx="34" cy="25" r="4" fill="#00f0ff" opacity="0.8"/>
    <path d="M26 23L30 21M26 27L30 29" stroke="#33aaff" stroke-width="1.5"/>
  </svg>`,

  // 5. Cryo Sample Vacuum (SU_Sample_Collector.glb)
  tool_sample_collector: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#0d1b1e"/>
    <rect x="12" y="16" width="14" height="18" rx="4" fill="#162e33" stroke="#44d4c4" stroke-width="1.5"/>
    <path d="M26 22L38 18L40 22L26 26Z" fill="#224d54" stroke="#44d4c4" stroke-width="1.5"/>
    <rect x="16" y="21" width="6" height="8" rx="1" fill="#44d4c4" opacity="0.6"/>
  </svg>`,

  // 6. Geological PIXL Scanner (SU_Geological_Scanner.glb)
  tool_scanner: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#111c16"/>
    <rect x="10" y="18" width="18" height="14" rx="3" fill="#182e22" stroke="#22e677" stroke-width="1.5"/>
    <circle cx="19" cy="25" r="4" stroke="#22e677" stroke-width="1.5"/>
    <path d="M28 22L42 14M28 28L42 36" stroke="#22e677" stroke-width="1.2" stroke-dasharray="2 2"/>
    <line x1="38" y1="16" x2="38" y2="34" stroke="#22e677" stroke-width="1"/>
  </svg>`,

  // 7. Multispectral Scanner (SU_Multispectral_Scanner.glb)
  tool_multispectral_scanner: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#181122"/>
    <rect x="10" y="16" width="20" height="16" rx="3" fill="#291a38" stroke="#bd55ff" stroke-width="1.5"/>
    <line x1="14" y1="21" x2="26" y2="21" stroke="#ff4488" stroke-width="2"/>
    <line x1="14" y1="25" x2="26" y2="25" stroke="#33ddff" stroke-width="2"/>
    <line x1="14" y1="29" x2="26" y2="29" stroke="#ffdd33" stroke-width="2"/>
    <path d="M30 24L40 24" stroke="#bd55ff" stroke-width="2"/>
  </svg>`,

  // 8. Subsurface GPR Radar (SU_GPR_Radar.glb)
  tool_gpr_radar: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#161a22"/>
    <rect x="14" y="12" width="20" height="12" rx="2" fill="#222a38" stroke="#00d4ff" stroke-width="1.5"/>
    <line x1="24" y1="24" x2="24" y2="32" stroke="#00d4ff" stroke-width="2"/>
    <path d="M12 36C18 32 30 32 36 36" stroke="#00d4ff" stroke-width="1.5"/>
    <path d="M8 40C16 35 32 35 40 40" stroke="#00d4ff" stroke-width="1" stroke-dasharray="2 2"/>
  </svg>`,

  // 9. Modular Fabricator Tool (SU_Construction_Tool.glb)
  tool_construction: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#1a180e"/>
    <rect x="10" y="20" width="16" height="10" rx="2" fill="#2d2816" stroke="#ffcc00" stroke-width="1.5"/>
    <rect x="28" y="14" width="12" height="12" stroke="#ffcc00" stroke-width="1.5" stroke-dasharray="2 2"/>
    <line x1="24" y1="23" x2="30" y2="18" stroke="#ffcc00" stroke-width="1.5"/>
    <circle cx="34" cy="20" r="2" fill="#ffcc00"/>
  </svg>`,

  // 10. Plasma Arc Welder (SU_Welding_Tool.glb)
  tool_welding_tool: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#0d1822"/>
    <path d="M12 28L24 16L32 16L34 20L26 28L18 28Z" fill="#1a2838" stroke="#44aaff" stroke-width="1.5"/>
    <line x1="34" y1="18" x2="42" y2="18" stroke="#ffffff" stroke-width="2"/>
    <circle cx="44" cy="18" r="3" fill="#00f0ff"/>
    <line x1="42" y1="14" x2="46" y2="22" stroke="#ffffff" stroke-width="1"/>
  </svg>`,

  // 11. Machinery Diagnostic Repair Tool (SU_Repair_Tool.glb)
  tool_repair_tool: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#1a141c"/>
    <rect x="12" y="18" width="16" height="12" rx="2" fill="#2e1f33" stroke="#e044ff" stroke-width="1.5"/>
    <line x1="28" y1="22" x2="40" y2="16" stroke="#e044ff" stroke-width="2"/>
    <line x1="28" y1="26" x2="40" y2="32" stroke="#e044ff" stroke-width="2"/>
    <circle cx="40" cy="16" r="2" fill="#00f0ff"/>
    <circle cx="40" cy="32" r="2" fill="#00f0ff"/>
  </svg>`,

  // 12. Portable Mass Spectrometer (SU_Portable_Analyzer.glb)
  tool_portable_analyzer: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#111a24"/>
    <rect x="10" y="12" width="28" height="24" rx="4" fill="#192838" stroke="#00f0ff" stroke-width="1.5"/>
    <rect x="14" y="16" width="20" height="10" rx="1" fill="#0d1b2a"/>
    <polyline points="16,22 19,19 22,23 25,18 28,24 31,20" fill="none" stroke="#00f0ff" stroke-width="1.5"/>
    <circle cx="16" cy="30" r="2" fill="#00f0ff"/>
    <circle cx="22" cy="30" r="2" fill="#ff7733"/>
    <circle cx="28" cy="30" r="2" fill="#22e677"/>
  </svg>`,

  // Generic resource/item fallback
  default_item: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="6" fill="#1b1c20"/>
    <polygon points="24,10 38,18 38,32 24,40 10,32 10,18" fill="#2c2e36" stroke="#00f0ff" stroke-width="1.5"/>
  </svg>`
};

/**
 * Returns formatted SVG string for any item ID
 */
export function getItemIcon(itemId) {
  if (TOOL_ICONS[itemId]) {
    return TOOL_ICONS[itemId];
  }
  // Resource and consumable icons
  if (itemId.includes('sedimentary')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#1e1612"/><polygon points="24,10 38,18 32,36 16,34 10,22" fill="#7a4a35" stroke="#a06048" stroke-width="1.5"/><line x1="14" y1="22" x2="34" y2="20" stroke="#a06048" stroke-width="1.5"/><line x1="12" y1="28" x2="30" y2="28" stroke="#a06048" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('hematite') || itemId.includes('iron')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#1f1412"/><polygon points="24,8 38,16 34,36 14,38 10,20" fill="#8b3a2b" stroke="#e05540" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('quartz')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#0f1b20"/><polygon points="24,6 34,18 28,40 20,40 14,18" fill="#55ccff" stroke="#ffffff" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('copper')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#20150d"/><polygon points="24,10 36,18 32,36 16,34 12,20" fill="#c87040" stroke="#ff9955" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('ice') || itemId.includes('water')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#0d1b24"/><polygon points="24,8 36,20 30,38 18,38 12,20" fill="#77ddff" stroke="#ffffff" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('sulfur')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#20200d"/><polygon points="24,8 38,20 32,38 16,36 10,22" fill="#d4c830" stroke="#ffee55" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('basalt') || itemId.includes('granite')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#141416"/><polygon points="24,10 38,18 34,36 14,36 10,22" fill="#444248" stroke="#888690" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('o2') || itemId.includes('oxygen')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#0d1f2d"/><rect x="16" y="10" width="16" height="28" rx="8" fill="#00a2ff" stroke="#ffffff" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('battery') || itemId.includes('power')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#221e0d"/><rect x="14" y="12" width="20" height="26" rx="3" fill="#ffd700" stroke="#ffffff" stroke-width="1.5"/></svg>`;
  }
  if (itemId.includes('hab') || itemId.includes('building')) {
    return `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="6" fill="#121820"/><polygon points="24,8 40,20 40,38 8,38 8,20" fill="#1f3a52" stroke="#00f0ff" stroke-width="1.5"/></svg>`;
  }
  return TOOL_ICONS.default_item;
}
