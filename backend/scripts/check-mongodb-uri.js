/**
 * Script to check the MongoDB URI environment variable
 */

require('dotenv').config();

console.log('Checking MongoDB URI...');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1);
}

// Check if MONGODB_URI starts with mongodb:// or mongodb+srv://
const uri = process.env.MONGODB_URI;
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  console.error('Invalid MongoDB URI format!');
  console.error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  console.error('Current value:', uri);
  process.exit(1);
}

// Print a sanitized version of the URI (hiding username and password)
try {
  const sanitizedUri = uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    'mongodb$1://USERNAME:PASSWORD@'
  );
  console.log('MongoDB URI format is valid!');
  console.log('Sanitized URI:', sanitizedUri);
} catch (error) {
  console.error('Error sanitizing URI:', error);
}

console.log('MongoDB URI check completed.');
