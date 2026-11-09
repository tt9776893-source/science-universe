import puppeteer from 'puppeteer-core';
import * as THREE from 'three';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1000));

  const objects = await page.evaluate(() => {
    const list = [];
    window.suGame.scene.traverse(obj => {
      if (obj.isMesh) {
        const wp = obj.position.clone();
        if (obj.parent) obj.parent.localToWorld(wp);
        list.push({
          name: obj.name,
          geo: obj.geometry?.type,
          parent: obj.parent?.name || obj.parent?.type,
          pos: { x: Math.round(obj.position.x), y: Math.round(obj.position.y), z: Math.round(obj.position.z) },
          worldPos: { x: Math.round(wp.x), y: Math.round(wp.y), z: Math.round(wp.z) }
        });
      }
    });
    return list;
  });

  const nonGltf = objects.filter(o => 
    o.geo === 'BoxGeometry' || 
    o.geo === 'CylinderGeometry' || 
    o.geo === 'DodecahedronGeometry' ||
    (o.name === '' && o.geo !== 'BufferGeometry')
  );
  console.log('Procedural / Primitive meshes:', JSON.stringify(nonGltf, null, 2));
  await browser.close();
})();
