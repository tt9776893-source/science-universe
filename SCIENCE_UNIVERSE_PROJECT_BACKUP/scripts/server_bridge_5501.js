import http from 'http';
import net from 'net';

const TARGET_PORT = 7777;
const TARGET_HOST = '127.0.0.1';
const LISTEN_PORT = 5501;

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${TARGET_PORT}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Proxy Error: Vite development server is not reachable on port 7777.');
  });

  req.pipe(proxyReq, { end: true });
});

// Forward WebSocket upgrade requests for Vite Hot Module Replacement (HMR)
server.on('upgrade', (req, socket, head) => {
  const proxySocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
    proxySocket.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
    for (const [key, value] of Object.entries(req.headers)) {
      proxySocket.write(`${key}: ${value}\r\n`);
    }
    proxySocket.write('\r\n');
    if (head && head.length > 0) {
      proxySocket.write(head);
    }
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxySocket.on('error', () => socket.destroy());
  socket.on('error', () => proxySocket.destroy());
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[Bridge Server Active] Listening on http://127.0.0.1:${LISTEN_PORT}/ -> Proxying to http://${TARGET_HOST}:${TARGET_PORT}/`);
});
