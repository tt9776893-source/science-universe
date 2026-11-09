import fs from 'fs';
import path from 'path';

function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    if (/[✕×✖✗]|>\s*[xX]\s*<|Хаах|Буцах|Болих|Гарах|Цуцлах|close|back|exit|cancel|dismiss/i.test(line)) {
      if (/button|class|id|onclick|aria-label|addEventListener/i.test(line)) {
        hits.push({ lineNum: i + 1, text: line.trim() });
      }
    }
  });
  if (hits.length > 0) {
    console.log(`\n=== File: ${filePath} (${hits.length} hits) ===`);
    hits.forEach(h => console.log(`  L${h.lineNum}: ${h.text.substring(0, 140)}`));
  }
}

inspectFile('sections/su-router.js');
inspectFile('sections/su-sandbox.js');
inspectFile('sections/spacelab/solar.mjs');
inspectFile('sections/spacelab/surface.mjs');
inspectFile('sections/explore/src/ui/UIManager.js');
inspectFile('sections/explore/src/ui/InventionUI.js');
inspectFile('sections/explore/src/spacecraft/RocketManager.js');
inspectFile('sections/explore/src/building/HabitatManager.js');
inspectFile('sections/explore/src/tutorial/TutorialUI.js');
inspectFile('js/builder/RocketBuilderModule.js');
inspectFile('js/life-genesis/LifeGenesisExperimentUI.js');
inspectFile('js/science/ExtremeUniverseModule.js');
inspectFile('js/science/PlanetXRayModule.js');
inspectFile('js/space/su-research.js');

