/**
 * Simplified Express server for Render deployment
 * This version doesn't use http-proxy-middleware to avoid path-to-regexp errors
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting Render server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Basic middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Frontend server is running',
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV
  });
});

// Simple API proxy using native http/https modules
app.use('/api', (req, res) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'https://john-vianney-api.onrender.com/api';
  
  try {
    console.log(`Proxying request to: ${apiUrl}${req.url}`);
    
    // For GET requests, use a simple redirect
    if (req.method === 'GET') {
      return res.redirect(`${apiUrl}${req.url}`);
    }
    
    // For other methods, return a message
    return res.status(200).json({
      message: 'API proxy is configured',
      apiUrl: apiUrl,
      requestUrl: req.url,
      method: req.method,
      info: 'This server only supports GET redirects. For other methods, please access the API directly.'
    });
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({
      error: 'API proxy error',
      message: error.message
    });
  }
});

// For any request that doesn't match a static file, send the index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Error: index.html not found in build directory');
  }
});

// List files in build directory for debugging
try {
  const buildDir = path.join(__dirname, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('Build directory exists');
    const files = fs.readdirSync(buildDir);
    console.log('Files in build directory:', files);
    
    if (fs.existsSync(path.join(buildDir, 'index.html'))) {
      console.log('index.html exists in build directory');
    } else {
      console.error('WARNING: index.html does not exist in build directory!');
    }
  } else {
    console.error('Build directory does not exist!');
  }
} catch (error) {
  console.error('Error checking build directory:', error);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});
