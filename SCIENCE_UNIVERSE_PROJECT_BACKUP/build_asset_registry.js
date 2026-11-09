import fs from 'fs';
import path from 'path';

const gameDir = 'C:/Users/Administrator/Desktop/SCIENCE_UNIVERSE_GAME';
const modelsDir = path.join(gameDir, 'public/assets/models');

const packs = [
  { id: 'tools', name: 'Pack 00 - Interactive Field Tools', dir: 'tools', type: 'tool' },
  { id: 'resources', name: 'Pack 01 - Geological Resources', dir: 'resources', type: 'resource' },
  { id: 'buildings', name: 'Pack 02 - Modular Colony Construction', dir: 'buildings', type: 'building' },
  { id: 'industrial', name: 'Pack 03 - Industrial Refining Equipment', dir: 'industrial', type: 'industrial' },
  { id: 'laboratory', name: 'Pack 04 - Scientific Research Lab', dir: 'laboratory', type: 'research' },
  { id: 'character', name: 'Pack 05 - Astronaut & EVA Suit', dir: 'character', type: 'character' },
  { id: 'vehicles', name: 'Pack 06 - Planetary Exploration Vehicles', dir: 'vehicles', type: 'vehicle' },
  { id: 'spacecraft', name: 'Pack 07 - Modular Spacecraft Parts', dir: 'spacecraft', type: 'spacecraft' },
  { id: 'energy', name: 'Pack 08 - Energy & Life Support Infrastructure', dir: 'energy', type: 'energy' }
];

const registry = {
  version: '2.0.0',
  timestamp: new Date().toISOString(),
  totalAssets: 0,
  categories: {},
  assets: []
};

packs.forEach(p => {
  const pPath = path.join(modelsDir, p.dir);
  if (!fs.existsSync(pPath)) return;
  const files = fs.readdirSync(pPath).filter(f => f.endsWith('.glb'));
  registry.categories[p.id] = { name: p.name, count: files.length };
  
  files.forEach(f => {
    const rawId = f.replace('.glb', '').toLowerCase();
    const cleanName = f.replace('.glb', '').replace(/^(SU_|res_|tool_)/, '').replace(/_/g, ' ');
    const stat = fs.statSync(path.join(pPath, f));
    
    registry.assets.push({
      assetId: rawId,
      filename: f,
      pack: p.name,
      category: p.type,
      relativePath: 'assets/models/' + p.dir + '/' + f,
      fileSizeKb: Math.round(stat.size / 1024 * 10) / 10,
      interactive: p.type === 'tool' || p.type === 'resource' || p.type === 'building' || p.type === 'vehicle' || p.type === 'industrial',
      interactionType: p.type === 'tool' ? 'equip' : (p.type === 'resource' ? 'mine' : (p.type === 'building' ? 'construct' : (p.type === 'vehicle' ? 'drive' : 'inspect'))),
      inInventory: p.type === 'tool' || p.type === 'resource' || p.type === 'building'
    });
  });
});

registry.totalAssets = registry.assets.length;
fs.writeFileSync(path.join(gameDir, 'ASSET_REGISTRY.json'), JSON.stringify(registry, null, 2));
console.log('ASSET_REGISTRY.json created with total assets:', registry.totalAssets);
