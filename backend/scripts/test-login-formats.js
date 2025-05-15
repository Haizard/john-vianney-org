/**
 * Script to test different login request formats
 */

const fetch = require('node-fetch');

// API endpoint
const apiUrl = 'https://john-vianney-api.onrender.com/api/users/login';

// Different request formats to test
const requestFormats = [
  {
    name: 'username and password',
    body: {
      username: 'admin',
      password: 'Admin@123'
    }
  },
  {
    name: 'emailOrUsername and password',
    body: {
      emailOrUsername: 'admin',
      password: 'Admin@123'
    }
  },
  {
    name: 'email and password',
    body: {
      email: 'admin@stjohnvianney.org',
      password: 'Admin@123'
    }
  },
  {
    name: 'username as emailOrUsername',
    body: {
      emailOrUsername: 'admin@stjohnvianney.org',
      password: 'Admin@123'
    }
  }
];

// Function to test a login request format
async function testLoginFormat(format) {
  try {
    console.log(`Testing login format: ${format.name}`);
    console.log('Request body:', format.body);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(format.body)
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    // Parse the response
    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if the login was successful
    if (response.ok) {
      console.log('Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('Login failed!');
      console.log('Error message:', data.message);
    }
    
    console.log('-----------------------------------');
  } catch (error) {
    console.error('Error testing login format:', error);
    console.log('-----------------------------------');
  }
}

// Function to test all login formats
async function testAllLoginFormats() {
  for (const format of requestFormats) {
    await testLoginFormat(format);
  }
}

// Run the tests
testAllLoginFormats();
