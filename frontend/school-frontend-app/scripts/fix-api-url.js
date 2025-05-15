/**
 * Script to fix the API URL in the frontend code
 */

const fs = require('fs');
const path = require('path');

// The correct API URL for the deployed backend
const correctApiUrl = 'https://john-vianney-api.onrender.com/api';

// Files to update
const filesToUpdate = [
  {
    path: path.join(__dirname, '..', 'src', 'components', 'FixedLoginForm.js'),
    pattern: /const apiUrl = process\.env\.REACT_APP_API_URL \|\| ['"]http:\/\/localhost:5000\/api['"]/g,
    replacement: `const apiUrl = '${correctApiUrl}'`
  },
  {
    path: path.join(__dirname, '..', '.env'),
    pattern: /REACT_APP_API_URL=.*/g,
    replacement: `REACT_APP_API_URL=${correctApiUrl}`
  },
  {
    path: path.join(__dirname, '..', '.env.production'),
    pattern: /REACT_APP_API_URL=.*/g,
    replacement: `REACT_APP_API_URL=${correctApiUrl}`
  }
];

// Function to update a file
function updateFile(filePath, pattern, replacement) {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if the pattern exists in the file
    if (!pattern.test(content)) {
      console.log(`Pattern not found in file: ${filePath}`);
      return false;
    }

    // Replace the pattern
    const updatedContent = content.replace(pattern, replacement);

    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent);

    console.log(`Updated file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    return false;
  }
}

// Create .env file if it doesn't exist
function createEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `REACT_APP_API_URL=${correctApiUrl}\n`);
      console.log(`Created file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
    return false;
  }
}

// Create .env.production file if it doesn't exist
function createEnvProductionFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `REACT_APP_API_URL=${correctApiUrl}\nREACT_APP_ENV=production\n`);
      console.log(`Created file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
    return false;
  }
}

// Create a public/fix-api-url.js file to override the API URL at runtime
function createFixApiUrlScript() {
  const scriptPath = path.join(__dirname, '..', 'public', 'fix-api-url.js');
  const scriptContent = `
// Script to fix the API URL at runtime
(function() {
  console.log('Fixing API URL...');
  
  // The correct API URL
  const correctApiUrl = '${correctApiUrl}';
  
  // Override the fetch function to use the correct API URL
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Check if the URL is a relative API URL or localhost API URL
    if (typeof url === 'string' && (url.startsWith('/api') || url.includes('localhost:5000/api'))) {
      // Replace with the correct API URL
      const newUrl = url.replace(/^\/api/, correctApiUrl).replace(/http:\/\/localhost:5000\/api/, correctApiUrl);
      console.log(\`Redirecting API request from \${url} to \${newUrl}\`);
      return originalFetch(newUrl, options);
    }
    
    // Otherwise, use the original fetch
    return originalFetch(url, options);
  };
  
  // Override axios baseURL if axios is available
  if (window.axios) {
    console.log('Fixing axios baseURL...');
    window.axios.defaults.baseURL = correctApiUrl;
  }
  
  console.log('API URL fixed!');
})();
`;

  try {
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`Created file: ${scriptPath}`);
    
    // Add the script to index.html
    const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      
      // Check if the script is already added
      if (!indexHtml.includes('fix-api-url.js')) {
        // Add the script before the closing head tag
        const updatedIndexHtml = indexHtml.replace(
          '</head>',
          '  <script src="%PUBLIC_URL%/fix-api-url.js"></script>\n  </head>'
        );
        
        fs.writeFileSync(indexHtmlPath, updatedIndexHtml);
        console.log(`Updated file: ${indexHtmlPath}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating fix-api-url script:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log(`Fixing API URL to: ${correctApiUrl}`);
  
  // Create .env and .env.production files if they don't exist
  createEnvFile(path.join(__dirname, '..', '.env'));
  createEnvProductionFile(path.join(__dirname, '..', '.env.production'));
  
  // Create fix-api-url.js script
  createFixApiUrlScript();
  
  // Update files
  let updatedCount = 0;
  for (const file of filesToUpdate) {
    if (updateFile(file.path, file.pattern, file.replacement)) {
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} files.`);
  console.log('Please rebuild the frontend for the changes to take effect.');
}

// Run the main function
main();
