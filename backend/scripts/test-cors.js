/**
 * Test script to verify CORS configuration
 * 
 * This script creates a simple server that responds to all requests with CORS headers
 * to help diagnose CORS issues.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes with detailed logging
app.use((req, res, next) => {
  // Log the request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    return res.status(204).end();
  }
  
  next();
});

// Test endpoint
app.get('/api/test-cors', (req, res) => {
  console.log('Test CORS endpoint called');
  res.json({
    message: 'CORS test successful',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Login test endpoint
app.post('/api/users/login', (req, res) => {
  console.log('Login endpoint called');
  console.log('Request body:', req.body);
  
  // Respond with a mock token
  res.json({
    token: 'test-token-12345',
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`- GET http://localhost:${PORT}/api/test-cors`);
  console.log(`- POST http://localhost:${PORT}/api/users/login`);
  console.log(`- GET http://localhost:${PORT}/api/health`);
});
