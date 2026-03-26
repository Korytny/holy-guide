import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let host = req.headers.host || 'localhost:8082';
  host = host.replace(/\\/g, '');
  
  let url;
  try {
    url = new URL(req.url, 'http://' + host);
  } catch (e) {
    url = new URL(req.url || '/', 'http://localhost:8082');
  }
  let pathname = url.pathname;

  const staticExtensions = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm'];
  const isStaticFile = staticExtensions.includes(extname(pathname));

  let filePath;
  if (isStaticFile) {
    filePath = join(__dirname, 'dist', pathname);
  } else {
    filePath = join(__dirname, 'dist', 'index.html');
  }

  if (!existsSync(filePath)) {
    filePath = join(__dirname, 'dist', 'index.html');
  }

  const contentType = getContentType(filePath);

  try {
    const fileContent = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fileContent);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

function getContentType(filePath) {
  const ext = extname(filePath);
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };
  return types[ext] || 'application/octet-stream';
}

const PORT = process.env.PORT || 8082;
server.listen(PORT, '0.0.0.0', () => {
  console.log('SPA server running on http://0.0.0.0' + PORT);
});
