/**
 * Script to test the login process directly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test credentials
const testCredentials = {
  username: 'admin',
  password: 'Admin@123'
};

// Connect to MongoDB
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Define User schema if it doesn't exist
    let User;
    try {
      User = mongoose.model('User');
    } catch (error) {
      console.log('User model not found, creating it...');
      const userSchema = new mongoose.Schema({
        username: {
          type: String,
          required: true,
          unique: true,
          trim: true
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
          required: true
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
          enum: ['active', 'inactive', 'terminated'],
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

    // Find the user
    const user = await User.findOne({ username: testCredentials.username });

    if (!user) {
      console.log('User not found');
      mongoose.connection.close();
      return;
    }

    console.log('User found:', {
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Check if the password is correct using bcryptjs
    const isMatch = await bcrypt.compare(testCredentials.password, user.password);

    if (isMatch) {
      console.log('Password is correct using bcryptjs');

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'kjjf6565i87utgfu64erd';
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          email: user.email,
          username: user.username
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Generated JWT token:', token);

      // Verify the token
      try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Token verified successfully:', decoded);
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    } else {
      console.log('Password is incorrect using bcryptjs');

      // Try using bcrypt directly
      const bcrypt = require('bcrypt');
      const isBcryptMatch = await bcrypt.compare(testCredentials.password, user.password);

      if (isBcryptMatch) {
        console.log('Password is correct using bcrypt');
      } else {
        console.log('Password is incorrect using bcrypt');
      }

      // Log the stored password hash for debugging
      console.log('Stored password hash:', user.password);

      // Hash the test password for comparison
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testCredentials.password, salt);
      console.log('Test password hash:', hashedPassword);
    }

    // Close the MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing login:', error);
    mongoose.connection.close();
  }
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
});
