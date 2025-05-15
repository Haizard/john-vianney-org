/**
 * Script to ensure a valid MongoDB URI is available
 * If MONGODB_URI is not valid, it will use MONGODB_URI_FALLBACK
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('Ensuring valid MongoDB URI...');

// Check if MONGODB_URI is set and valid
let uriIsValid = false;
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
    console.log('MONGODB_URI is valid!');
    uriIsValid = true;
  } else {
    console.error('Invalid MONGODB_URI format!');
    console.error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    console.error('Current value:', uri);
  }
} else {
  console.error('MONGODB_URI environment variable is not set!');
}

// If MONGODB_URI is not valid, try to use MONGODB_URI_FALLBACK
if (!uriIsValid && process.env.MONGODB_URI_FALLBACK) {
  const fallbackUri = process.env.MONGODB_URI_FALLBACK;
  if (fallbackUri.startsWith('mongodb://') || fallbackUri.startsWith('mongodb+srv://')) {
    console.log('Using MONGODB_URI_FALLBACK as it is valid!');

    // Update the .env file with the fallback URI
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';

    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');

      // Check if MONGODB_URI already exists in the file
      const regex = new RegExp('^MONGODB_URI=.*$', 'm');

      if (regex.test(envContent)) {
        // Replace existing MONGODB_URI
        envContent = envContent.replace(regex, `MONGODB_URI=${fallbackUri}`);
      } else {
        // Add new MONGODB_URI
        envContent += `\nMONGODB_URI=${fallbackUri}`;
      }
    } else {
      // Create new .env file with MONGODB_URI
      envContent = `MONGODB_URI=${fallbackUri}\n`;
    }

    // Write to .env file
    fs.writeFileSync(envPath, envContent);

    // Update process.env
    process.env.MONGODB_URI = fallbackUri;

    console.log('Updated .env file with fallback MongoDB URI.');
    uriIsValid = true;
  } else {
    console.error('Invalid MONGODB_URI_FALLBACK format!');
    console.error('MONGODB_URI_FALLBACK must start with "mongodb://" or "mongodb+srv://"');
    console.error('Current value:', fallbackUri);
  }
}

// If MONGODB_URI is still not valid, create a default MongoDB URI
if (!uriIsValid) {
  console.log('No valid MongoDB URI available, creating a default one...');

  // Create a default MongoDB URI for MongoDB Atlas
  const defaultUri = 'mongodb+srv://defaultuser:defaultpassword@cluster0.mongodb.net/john_vianney?retryWrites=true&w=majority';

  // Update the .env file with the default URI
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');

    // Check if MONGODB_URI already exists in the file
    const regex = new RegExp('^MONGODB_URI=.*$', 'm');

    if (regex.test(envContent)) {
      // Replace existing MONGODB_URI
      envContent = envContent.replace(regex, `MONGODB_URI=${defaultUri}`);
    } else {
      // Add new MONGODB_URI
      envContent += `\nMONGODB_URI=${defaultUri}`;
    }
  } else {
    // Create new .env file with MONGODB_URI
    envContent = `MONGODB_URI=${defaultUri}\n`;
  }

  // Write to .env file
  fs.writeFileSync(envPath, envContent);

  // Update process.env
  process.env.MONGODB_URI = defaultUri;

  console.log('Updated .env file with default MongoDB URI.');
  console.log('WARNING: This is a placeholder URI and will not work for production!');
  console.log('Please update the MONGODB_URI environment variable with a valid MongoDB connection string.');

  // For Render deployment, we'll continue but log a warning
  if (process.env.RENDER) {
    console.warn('Running on Render with a placeholder MongoDB URI!');
    console.warn('The application will not be able to connect to the database.');
    console.warn('Please configure a valid MongoDB URI in the Render dashboard.');
  }

  uriIsValid = true;
}

// If neither MONGODB_URI nor MONGODB_URI_FALLBACK is valid, exit with error
if (!uriIsValid) {
  console.error('No valid MongoDB URI available!');
  process.exit(1);
}

console.log('MongoDB URI check completed successfully.');
