const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Remove query parameters from URL
  let filePath = req.url.split('?')[0];
  
  // Default to index.html for root
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Build full file path
  const fullPath = path.join(__dirname, 'dist', filePath);
  
  // Get file extension
  const extname = path.extname(fullPath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  // Check if file exists
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // If file doesn't exist, serve index.html for SPA routing
      fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`SPA server running on port ${PORT}`);
  console.log('All routes will serve index.html for client-side routing');
});