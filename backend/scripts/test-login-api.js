/**
 * Script to test the login API endpoint directly
 */

const fetch = require('node-fetch');

// Test credentials
const testCredentials = {
  username: 'admin',
  password: 'Admin@123'
};

// API endpoint
const apiUrl = 'https://john-vianney-api.onrender.com/api/users/login';

// Function to test the login API
async function testLoginApi() {
  try {
    console.log('Testing login API endpoint...');
    console.log('API URL:', apiUrl);
    console.log('Credentials:', testCredentials);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
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
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

// Run the test
testLoginApi();
