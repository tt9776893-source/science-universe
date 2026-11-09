/* Syncs web assets to www/ for Capacitor Android/iOS packaging and Netlify deployment.
 * Excludes raw partial downloads (.partial) and temp files to keep the mobile package clean.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

function copyRecursive(src, dest, filterFn = null) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (filterFn && !filterFn(path.join(src, item))) continue;
      copyRecursive(path.join(src, item), path.join(dest, item), filterFn);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    // Copy if file doesn't exist, changed size, or source is newer
    if (!fs.existsSync(dest) || fs.statSync(dest).size !== stat.size || stat.mtimeMs > fs.statSync(dest).mtimeMs) {
      fs.copyFileSync(src, dest);
    }
  }
}

function rejectDevelopmentAssets(file) {
  if (!fs.existsSync(file)) return;
  const stat = fs.statSync(file);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(file)) rejectDevelopmentAssets(path.join(file, name));
  } else if (/\.(html|m?js)$/.test(file) &&
      (path.basename(file) === '__su_dev_storage__.js' || fs.readFileSync(file, 'utf8').includes('SU_DEVELOPER_TEST_ONLY_V1'))) {
    throw new Error('Refusing to package developer test access: ' + file);
  }
}
// Reject contaminated input AND stale development output before copying anything.
for (const base of [ROOT, WWW]) {
  for (const item of ['index.html', 'sections', 'js', '__su_dev_storage__.js']) {
    rejectDevelopmentAssets(path.join(base, item));
  }
}

console.log('Syncing web assets to', WWW, '...');

// 1. Core web app files
console.log('Copying index.html, favicon, _headers, and _redirects...');
copyRecursive(path.join(ROOT, 'index.html'), path.join(WWW, 'index.html'));
if (fs.existsSync(path.join(ROOT, 'favicon.svg'))) {
  copyRecursive(path.join(ROOT, 'favicon.svg'), path.join(WWW, 'favicon.svg'));
}
if (fs.existsSync(path.join(ROOT, '_headers'))) {
  copyRecursive(path.join(ROOT, '_headers'), path.join(WWW, '_headers'));
}
if (fs.existsSync(path.join(ROOT, '_redirects'))) {
  copyRecursive(path.join(ROOT, '_redirects'), path.join(WWW, '_redirects'));
}

// 2. Main app folders
['assets', 'vendor', 'sections', 'js'].forEach(dir => {
  const src = path.join(ROOT, dir);
  if (fs.existsSync(src)) {
    console.log('Copying ' + dir + '...');
    copyRecursive(src, path.join(WWW, dir));
  }
});

// 3. Space Lab 3D assets
const rfAssetsSrc = path.join(ROOT, 'REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED/REALITY-FORGE-ROCKET-SOLAR-ONLY/assets');
const rfAssetsDest = path.join(WWW, 'REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED/REALITY-FORGE-ROCKET-SOLAR-ONLY/assets');
if (fs.existsSync(rfAssetsSrc)) {
  console.log('Copying Space Lab 3D models and vehicles...');
  copyRecursive(rfAssetsSrc, rfAssetsDest);
}

// 4. Explore 3D assets (excluding uncompleted .partial files)
const expAssetsSrc = path.join(ROOT, 'SCIENCE_UNIVERSE_PROJECT_BACKUP/public/assets');
const expAssetsDest = path.join(WWW, 'SCIENCE_UNIVERSE_PROJECT_BACKUP/public/assets');
if (fs.existsSync(expAssetsSrc)) {
  console.log('Copying Explore 3D assets (skipping .partial files)...');
  copyRecursive(expAssetsSrc, expAssetsDest, (filePath) => {
    return !filePath.endsWith('.partial');
  });
}

function getDirSize(dir) {
  let size = 0;
  try {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) size += getDirSize(p);
      else size += fs.statSync(p).size;
    }
  } catch(e) {}
  return size;
}

const totalMB = (getDirSize(WWW) / (1024 * 1024)).toFixed(2);
console.log(`Sync complete! www/ total size: ${totalMB} MB`);
