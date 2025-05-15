/**
 * Script to check if the build directory exists and has the necessary files
 */

const fs = require('fs');
const path = require('path');

// Path to the build directory
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

console.log('Checking build directory...');

// Check if the build directory exists
if (fs.existsSync(buildDir)) {
  console.log('Build directory exists at:', buildDir);
  
  // List files in the build directory
  try {
    const files = fs.readdirSync(buildDir);
    console.log('Files in build directory:', files);
    
    // Check if index.html exists
    if (fs.existsSync(indexPath)) {
      console.log('index.html exists in build directory');
      
      // Read index.html
      const indexHtml = fs.readFileSync(indexPath, 'utf8');
      
      // Check if index.html contains React app or static placeholder
      if (indexHtml.includes('static/js/') && indexHtml.includes('static/css/')) {
        console.log('Build directory contains React app!');
      } else if ((indexHtml.includes('Agape Seminary School') || indexHtml.includes('St John Vianney')) && indexHtml.includes('bootstrap')) {
        console.error('Build directory contains static placeholder!');
        process.exit(1);
      } else {
        console.warn('Unable to determine if build directory contains React app or static placeholder.');
      }
    } else {
      console.error('index.html does not exist in build directory!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading build directory:', error);
    process.exit(1);
  }
} else {
  console.error('Build directory does not exist!');
  process.exit(1);
}

console.log('Build directory check completed successfully.');
