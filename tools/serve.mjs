// Static server with Range support for testing (node tools/serve.mjs [port])
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const root = path.resolve(process.argv[3] || 'D:/shine negtgel'); const port = +process.argv[2] || 8123;
const mime = { '.html':'text/html;charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.raw':'application/octet-stream','.wav':'audio/wav','.mp3':'audio/mpeg' };
http.createServer((req, res) => {
  let p = decodeURIComponent(url.parse(req.url).pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const st = fs.statSync(f); const type = mime[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const r = req.headers.range;
  if (r) { const m = /bytes=(\d*)-(\d*)/.exec(r); const s = m[1] ? +m[1] : 0; const e = m[2] ? +m[2] : st.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${s}-${e}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 });
    return fs.createReadStream(f, { start: s, end: e }).pipe(res); }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('serving', root, 'on', port));

