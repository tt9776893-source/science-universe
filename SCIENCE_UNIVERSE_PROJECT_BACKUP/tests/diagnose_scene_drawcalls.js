import puppeteer from 'puppeteer-core';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 2000));

  const stats = await page.evaluate(() => {
    const frustum = new window.THREE.Frustum();
    const projScreenMatrix = new window.THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(window.suGame.camera.projectionMatrix, window.suGame.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    const counts = {};
    const visibleCounts = {};
    const inFrustumCounts = {};
    let shadowCasters = 0;
    let meshes = 0;
    let visibleMeshes = 0;
    let inFrustumMeshes = 0;

    window.suGame.scene.traverse(obj => {
      if (obj.isMesh) {
        meshes++;
        const parentName = obj.parent ? (obj.parent.name || obj.parent.constructor.name) : 'none';
        const key = `${obj.name || 'unnamed'} (parent: ${parentName})`;
        counts[key] = (counts[key] || 0) + 1;
        if (obj.visible) {
          visibleMeshes++;
          visibleCounts[key] = (visibleCounts[key] || 0) + 1;

          // Frustum check
          if (!obj.geometry.boundingSphere) obj.geometry.computeBoundingSphere();
          const sphere = obj.geometry.boundingSphere.clone().applyMatrix4(obj.matrixWorld);
          if (frustum.intersectsSphere(sphere)) {
            inFrustumMeshes++;
            inFrustumCounts[key] = (inFrustumCounts[key] || 0) + 1;
          }
        }
        if (obj.castShadow) {
          shadowCasters++;
        }
      }
    });

    return {
      totalMeshes: meshes,
      visibleMeshes,
      inFrustumMeshes,
      shadowCasters,
      topInFrustum: Object.entries(inFrustumCounts).sort((a,b) => b[1] - a[1]).slice(0, 20),
      renderInfo: window.suGame.renderer.info.render
    };
  });

  console.log(JSON.stringify(stats, null, 2));
  await browser.close();
}

diagnose();
