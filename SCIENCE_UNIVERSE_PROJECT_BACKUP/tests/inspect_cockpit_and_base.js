import puppeteer from 'puppeteer-core';

async function inspectModels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });

  const result = await page.evaluate(async () => {
    const reg = window.suGame.assetRegistry;
    
    // Load cockpit
    const cockpit = await reg.loadModelOnDemand('spacecraft', 'SU_Part_Cockpit.glb');
    const baseOutpost = await reg.loadModelOnDemand('buildings', 'SU_Base_B_Scientific_Research_Center.glb');
    const quartzCrystal = await reg.loadModelOnDemand('resources', 'SU_Crystal_Quartz.glb');
    const iceCrystal = await reg.loadModelOnDemand('resources', 'SU_Ice_CrystalCluster.glb');

    function getHierarchy(obj, maxDepth = 2, depth = 0) {
      if (!obj || depth > maxDepth) return null;
      return {
        name: obj.name,
        type: obj.type,
        children: (obj.children || []).map(c => getHierarchy(c, maxDepth, depth + 1))
      };
    }

    return {
      cockpitLoaded: !!cockpit,
      cockpitTree: getHierarchy(cockpit, 2),
      baseLoaded: !!baseOutpost,
      baseTree: getHierarchy(baseOutpost, 2),
      quartzLoaded: !!quartzCrystal,
      iceCrystalLoaded: !!iceCrystal
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

inspectModels().catch(console.error);
