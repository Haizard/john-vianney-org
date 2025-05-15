/**
 * Startup script for the backend server
 * 
 * This script runs initialization tasks before the server starts.
 */

const path = require('path');
const { fork } = require('child_process');
const mongoose = require('mongoose');

/**
 * Run the create-admin-user script
 * @returns {Promise<void>}
 */
async function createAdminUser() {
  return new Promise((resolve, reject) => {
    console.log('Running create-admin-user script...');
    
    const scriptPath = path.join(__dirname, 'scripts', 'create-admin-user.js');
    const child = fork(scriptPath);
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('Admin user script completed successfully');
        resolve();
      } else {
        console.error(`Admin user script failed with code ${code}`);
        // Don't reject, we want to continue startup even if this fails
        resolve();
      }
    });
    
    child.on('error', (error) => {
      console.error('Error running admin user script:', error);
      // Don't reject, we want to continue startup even if this fails
      resolve();
    });
  });
}

/**
 * Run all startup tasks
 * @returns {Promise<void>}
 */
async function runStartupTasks() {
  try {
    console.log('Running startup tasks...');
    
    // Create admin user
    await createAdminUser();
    
    console.log('All startup tasks completed');
  } catch (error) {
    console.error('Error running startup tasks:', error);
  }
}

module.exports = {
  runStartupTasks
};
