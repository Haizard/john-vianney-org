/**
 * Minimal static server for Render deployment
 * Uses only built-in Node.js modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain'
};

// Log startup information
console.log('Starting minimal static server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('BUILD_DIR:', BUILD_DIR);

// Check if build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  console.error('Build directory does not exist!');
  process.exit(1);
}

// List files in build directory
try {
  const files = fs.readdirSync(BUILD_DIR);
  console.log('Files in build directory:', files);
  
  if (fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.log('index.html exists in build directory');
  } else {
    console.error('WARNING: index.html does not exist in build directory!');
  }
} catch (error) {
  console.error('Error reading build directory:', error);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Static server is running',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      environment: process.env.NODE_ENV
    }));
    return;
  }
  
  // Handle API requests with a simple message
  if (pathname.startsWith('/api')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'API requests should be made directly to the backend',
      api_url: process.env.REACT_APP_API_URL || 'https://john-vianney-api.onrender.com/api',
      requested_path: pathname
    }));
    return;
  }
  
  // Normalize pathname
  pathname = pathname === '/' ? '/index.html' : pathname;
  
  // Resolve file path
  const filePath = path.join(BUILD_DIR, pathname);
  
  // Get file extension
  const ext = path.extname(filePath);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file doesn't exist, serve index.html (for client-side routing)
      const indexPath = path.join(BUILD_DIR, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error: Could not read index.html');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    
    // If it's a directory, serve index.html from that directory
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          // If no index.html in directory, serve main index.html
          const mainIndexPath = path.join(BUILD_DIR, 'index.html');
          fs.readFile(mainIndexPath, (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error: Could not read index.html');
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          });
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error reading file: ${err.message}`);
        return;
      }
      
      // Determine content type
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      // Set headers and send response
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});
