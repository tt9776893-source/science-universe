import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const URL = 'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse';
const DEST_ZIP = path.resolve('tools/jdk-21.zip');
const DEST_DIR = path.resolve('tools/jdk-21');

function download(url, dest, cb) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return download(res.headers.location, dest, cb);
    }
    if (res.statusCode !== 200) {
      console.error('Download failed status:', res.statusCode);
      process.exit(1);
    }
    const total = parseInt(res.headers['content-length'] || '0', 10);
    let cur = 0;
    const file = fs.createWriteStream(dest);
    res.on('data', (chunk) => {
      cur += chunk.length;
      if (total) {
        process.stdout.write(`\rDownloading JDK 21: ${(cur / (1024*1024)).toFixed(1)} / ${(total / (1024*1024)).toFixed(1)} MB (${Math.round(cur/total*100)}%)`);
      }
    });
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('\nDownload complete!');
      cb();
    });
  }).on('error', (err) => {
    console.error('Error downloading:', err);
    process.exit(1);
  });
}

download(URL, DEST_ZIP, () => {
  console.log('Extracting to', DEST_DIR, '...');
  fs.mkdirSync(DEST_DIR, { recursive: true });
  execSync(`tar -xf "${DEST_ZIP}" -C "${DEST_DIR}" --strip-components=1`, { stdio: 'inherit' });
  console.log('Extraction complete!');
  try { fs.unlinkSync(DEST_ZIP); } catch(e) {}
  console.log('Testing extracted java...');
  const javaExe = path.join(DEST_DIR, 'bin/java.exe');
  execSync(`"${javaExe}" -version`, { stdio: 'inherit' });
});

