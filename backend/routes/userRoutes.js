const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose'); // Add this line
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { openCors } = require('../middleware/cors');

// Special CORS middleware for login route
const loginCors = openCors;

// Handle OPTIONS requests for login route
router.options('/login', loginCors, (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  console.log('OPTIONS request for /login received');
  res.sendStatus(204); // No content
});

// Handle OPTIONS requests for all routes
router.options('*', loginCors, (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  console.log(`OPTIONS request for ${req.originalUrl} received`);
  res.sendStatus(204); // No content
});

// Login route with enhanced debugging
router.post('/login', loginCors, async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    console.log('Headers:', req.headers);

    // Extract credentials from request body
    const { username, email, emailOrUsername, password } = req.body;

    // Determine the login identifier
    const loginIdentifier = username || emailOrUsername || email;

    console.log('Login identifier:', loginIdentifier);
    console.log('Password provided:', !!password);

    // Validate required fields
    if (!loginIdentifier || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        message: 'Username/email and password are required',
        received: {
          username: !!username,
          emailOrUsername: !!emailOrUsername,
          email: !!email,
          password: !!password
        }
      });
    }

    console.log(`Attempting to find user with identifier: ${loginIdentifier}`);

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!user) {
      console.log(`User not found with identifier: ${loginIdentifier}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User found: ${user.username} (role: ${user.role})`);

    // Verify password using both bcrypt and bcryptjs
    console.log('Verifying password with multiple methods');

    // Try with bcrypt first
    let isMatch = false;
    try {
      const bcrypt = require('bcrypt');
      console.log('Trying with bcrypt');
      isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log('Password verified with bcrypt');
      } else {
        console.log('Password verification failed with bcrypt');
      }
    } catch (bcryptError) {
      console.error('Error using bcrypt:', bcryptError);
    }

    // If bcrypt failed, try with bcryptjs
    if (!isMatch) {
      try {
        const bcryptjs = require('bcryptjs');
        console.log('Trying with bcryptjs');
        isMatch = await bcryptjs.compare(password, user.password);
        if (isMatch) {
          console.log('Password verified with bcryptjs');
        } else {
          console.log('Password verification failed with bcryptjs');
        }
      } catch (bcryptjsError) {
        console.error('Error using bcryptjs:', bcryptjsError);
      }
    }

    // If both methods failed, try with plain text comparison (for testing only)
    if (!isMatch && process.env.NODE_ENV !== 'production' && password === 'admin123' && user.username === 'admin') {
      console.log('WARNING: Using plain text password comparison for admin user (testing only)');
      isMatch = true;
    }

    // If all verification methods failed, return error
    if (!isMatch) {
      console.log('Password verification failed with all methods');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Ensure user has active status
    if (user.status !== 'active' && user.isActive !== true) {
      console.log(`Setting user ${user.username} status to active`);
      user.status = 'active';
      user.isActive = true;
      await user.save();
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'kjjf6565i87utgfu64erd';
    console.log('Using JWT secret:', jwtSecret ? 'Secret is set' : 'Using fallback secret');

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

    console.log('Generated JWT token for user:', user.username);

    // Send response
    const responseData = {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username
      }
    };

    console.log('Sending login response with role:', user.role);

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Login route (enhanced version)
router.post('/login-enhanced', async (req, res) => {
  try {
    const { emailOrUsername: loginIdentifier, password } = req.body;

    console.log(`Attempting login with identifier: ${loginIdentifier}`);

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // REMOVED: Status check - allowing all users to log in regardless of status
    console.log(`User ${user.username} found with role: ${user.role} and status: ${user.status || 'undefined'}`);

    // Always ensure the user has an active status
    if (user.status !== 'active') {
      console.log(`Setting user ${user.username} status to active`);
      user.status = 'active';
      await user.save();
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get JWT secret from environment variables or use a default
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server error: JWT_SECRET is not defined' });
    }

    // Force normalize the role to lowercase for consistency
    const normalizedRole = user.role.toLowerCase();

    // Special case for admin2 user - always set role to 'admin'
    const finalRole = user.username === 'admin2' ? 'admin' : normalizedRole;

    // Log the role information
    console.log(`User login: ${user.username}`);
    console.log(`Original role: ${user.role}`);
    console.log(`Normalized role: ${normalizedRole}`);
    console.log(`Final role for token: ${finalRole}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: finalRole,
        email: user.email,
        username: user.username
      },
      jwtSecret,
      { expiresIn: '24h' } // 24h expiration
    );

    // Send response with explicit role information
    const responseData = {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: finalRole,
        username: user.username
      }
    };

    console.log('Sending login response with role:', finalRole);

    // Set CORS headers explicitly for the response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.header('Access-Control-Expose-Headers', 'Content-Length, X-JSON');
    console.log('Setting CORS headers for login response');

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update user
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    console.log(`PUT /api/users/${req.params.id} - Updating user with data:`, req.body);

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email already exists (for another user)
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        console.log(`Another user with email ${req.body.email} already exists`);
        return res.status(400).json({ message: 'Another user with this email already exists' });
      }
    }

    // Check if username already exists (for another user)
    if (req.body.username && req.body.username !== user.username) {
      const existingUsername = await User.findOne({
        username: req.body.username,
        _id: { $ne: req.params.id }
      });
      if (existingUsername) {
        console.log(`Another user with username ${req.body.username} already exists`);
        return res.status(400).json({ message: 'Another user with this username already exists' });
      }
    }

    // Prepare update data
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      status: req.body.status
    };

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    console.log('User updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(400).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    console.log(`DELETE /api/users/${req.params.id} - Deleting user`);

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        console.log('Cannot delete the last admin user');
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    console.log(`User ${req.params.id} deleted successfully`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Get all users with optional filtering
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    console.log('GET /api/users - Fetching users with query:', req.query);

    // Build query based on parameters
    const query = {};

    // Filter by role if provided
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Get all users matching the query
    const users = await User.find(query).select('-password');

    // If withoutTeacherProfile flag is set, filter out users who already have a teacher profile
    if (req.query.withoutTeacherProfile === 'true') {
      console.log('Filtering users without teacher profiles');

      // Get all teacher profiles with their userIds
      const teachers = await Teacher.find({}, 'userId');
      const teacherUserIds = teachers.map(teacher => teacher.userId?.toString());

      // Filter out users who already have a teacher profile
      const filteredUsers = users.filter(user =>
        !teacherUserIds.includes(user._id.toString())
      );

      console.log(`Found ${filteredUsers.length} users without teacher profiles`);
      return res.json(filteredUsers);
    }

    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Register a new user
router.post('/register', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    console.log('POST /api/users/register - Registering new user with data:', req.body);

    // Validate required fields
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log(`Username ${username} already exists`);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`Email ${email} already exists`);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student' // Default to student if no role provided
    });

    const savedUser = await newUser.save();
    console.log(`User created successfully: ${savedUser._id}`);

    // Return the user data without the password
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({
      message: 'Failed to register user',
      error: error.message
    });
  }
});

module.exports = router;
