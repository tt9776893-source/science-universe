import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 15000 });
  const cacheKeys = await page.evaluate(() => {
    const keys = Array.from(window.suGame.assetRegistry.cache.keys());
    const rover = window.suGame.assetRegistry.cache.get('SU_Vehicle_Explorer_Rover.glb');
    const airlock = window.suGame.assetRegistry.cache.get('SU_Base_Airlock.glb');
    const hab = window.suGame.assetRegistry.cache.get('SU_Base_Hab_Research.glb');

    // Also inspect what actual mesh is in vehicleSystem and habitatManager
    const activeRoverMesh = window.suGame.vehicleSystem.activeRover?.mesh;
    const isRoverBox = activeRoverMesh?.geometry?.type === 'BoxGeometry';
    const isAirlockBox = window.suGame.habitatManager.airlockModule?.geometry?.type === 'BoxGeometry';

    // Check scene children
    const sceneMeshes = [];
    window.suGame.scene.traverse(obj => {
      if (obj.isMesh && obj.geometry) {
        sceneMeshes.push({
          name: obj.name || 'unnamed',
          geoType: obj.geometry.type,
          parentName: obj.parent?.name || 'none'
        });
      }
    });

    return {
      keysCount: keys.length,
      keys: keys,
      hasRover: !!rover,
      isRoverBox,
      isAirlockBox,
      activeRoverMeshType: activeRoverMesh?.geometry?.type || activeRoverMesh?.type,
      airlockModuleType: window.suGame.habitatManager.airlockModule?.geometry?.type || window.suGame.habitatManager.airlockModule?.type,
      totalMeshesInScene: sceneMeshes.length,
      sampleSceneMeshes: sceneMeshes.slice(0, 30)
    };
  });
  console.log('Cache status:', JSON.stringify(cacheKeys, null, 2));
  await browser.close();
})();
