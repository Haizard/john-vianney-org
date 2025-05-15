/**
 * Script to create an admin user with bcrypt (not bcryptjs)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Using bcrypt, not bcryptjs

// Admin user details
const adminUser = {
  username: 'admin',
  email: 'admin@stjohnvianney.org',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true
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
    // Check if User model exists, if not, create it
    let User;
    try {
      User = mongoose.model('User');
    } catch (error) {
      // Define User schema if it doesn't exist
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
          required: true,
          trim: true
        },
        lastName: {
          type: String,
          required: true,
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
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ username: adminUser.username });
    
    if (existingUser) {
      console.log('Admin user already exists');
      console.log('Updating password...');
      
      // Hash the password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Update the admin user
      existingUser.password = hashedPassword;
      existingUser.status = 'active'; // Ensure status is active
      existingUser.isActive = true; // Ensure isActive is true
      await existingUser.save();
      
      console.log('Admin password updated successfully');
      console.log('Username:', adminUser.username);
      console.log('Password:', adminUser.password);
      console.log('Email:', adminUser.email);
    } else {
      // Hash the password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Create the admin user
      const newUser = new User({
        ...adminUser,
        password: hashedPassword,
        status: 'active' // Ensure status is active
      });
      
      await newUser.save();
      console.log('Admin user created successfully');
      console.log('Username:', adminUser.username);
      console.log('Password:', adminUser.password);
      console.log('Email:', adminUser.email);
    }
    
    // Close the MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    mongoose.connection.close();
  }
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
});
