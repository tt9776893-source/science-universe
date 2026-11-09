import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const overlayIds = [
  'mathOverlay',
  'computerOverlay',
  'chemOverlay',
  'engOverlay',
  'aiOverlay',
  'bioOverlay',
  'spaceExploreOverlay',
  'spaceLabOverlay',
  'profileOverlay'
];

overlayIds.forEach(id => {
  console.log(`\n=================== ${id} ===================`);
  // Find open/close classes in JS
  const regex = new RegExp(`['"]#?${id}['"].*?(classList\\.(add|remove|toggle)|style\\.display)`, 'g');
  const jsMatches = [...html.matchAll(new RegExp(`(?:classList\\.(?:add|remove|toggle)\\(['"]([^'"]+)['"]\\)|style\\.display\\s*=\\s*['"]([^'"]+)['"])`, 'g'))];
  
  // Find in CSS
  const cssMatches = [...html.matchAll(new RegExp(`(#${id}[^{]*)\\{([^}]+)\\}`, 'g'))];
  console.log(`CSS rules count: ${cssMatches.length}`);
  cssMatches.forEach(m => {
    const sel = m[1].trim();
    const body = m[2];
    if (body.includes('display:') || body.includes('z-index:')) {
      const disp = body.match(/display:[^;]+(!important)?/);
      const z = body.match(/z-index:[^;]+(!important)?/);
      console.log(`  ${sel} -> ${disp ? disp[0] : ''} | ${z ? z[0] : ''}`);
    }
  });
});

