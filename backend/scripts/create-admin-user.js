/**
 * Script to create or update an admin user in the MongoDB database
 *
 * This script ensures that there is always an admin user in the database
 * with known credentials for initial login.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Try to use bcrypt, fall back to bcryptjs if not available
let bcrypt;
try {
  bcrypt = require('bcrypt');
  console.log('Using bcrypt for password hashing');
} catch (error) {
  bcrypt = require('bcryptjs');
  console.log('Using bcryptjs for password hashing');
}

// Check if User model exists, if not, create it
let User;
try {
  User = mongoose.model('User');
  console.log('Using existing User model');
} catch (error) {
  console.log('Creating new User model');
  // Define User schema if it doesn't exist
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent', 'staff'],
      default: 'staff'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  User = mongoose.model('User', userSchema);
}

// Admin user details - using simpler credentials for testing
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',  // Simpler password for testing
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  status: 'active'
};

// Also create a backup admin user with different credentials
const backupAdmin = {
  username: 'admin2',
  email: 'admin2@example.com',
  password: 'admin123',
  firstName: 'Backup',
  lastName: 'Admin',
  role: 'admin',
  isActive: true,
  status: 'active'
};

// Connect to MongoDB
console.log('Connecting to MongoDB...');
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-db';
console.log('MongoDB URI:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Create or update the main admin user
    await createOrUpdateUser(adminUser);

    // Create or update the backup admin user
    await createOrUpdateUser(backupAdmin);

    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Error in script execution:', error);
    mongoose.connection.close();
  }
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

/**
 * Create or update a user
 * @param {Object} userData - User data
 */
async function createOrUpdateUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      console.log(`User ${userData.username} already exists - updating password`);

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Update the user
      existingUser.password = hashedPassword;
      existingUser.isActive = true;
      existingUser.status = 'active';

      await existingUser.save();
      console.log(`User ${userData.username} updated successfully`);
      console.log('Username:', userData.username);
      console.log('Password:', userData.password);
      console.log('Email:', userData.email);
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create the user
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });

    await newUser.save();
    console.log(`User ${userData.username} created successfully`);
    console.log('Username:', userData.username);
    console.log('Password:', userData.password);
    console.log('Email:', userData.email);
  } catch (error) {
    console.error(`Error creating/updating user ${userData.username}:`, error);
    throw error;
  }
}
