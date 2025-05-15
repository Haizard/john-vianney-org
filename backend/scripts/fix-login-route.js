/**
 * Script to fix the login route in the backend
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Path to the userRoutes.js file
const userRoutesPath = path.join(__dirname, '..', 'routes', 'userRoutes.js');

// Check if the file exists
if (!fs.existsSync(userRoutesPath)) {
  console.error(`File not found: ${userRoutesPath}`);
  process.exit(1);
}

// Read the file
const userRoutes = fs.readFileSync(userRoutesPath, 'utf8');

// Updated login route with better error handling and logging
const updatedLoginRoute = `// Login route with enhanced debugging
router.post('/login', async (req, res) => {
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

    console.log(\`Attempting to find user with identifier: \${loginIdentifier}\`);

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!user) {
      console.log(\`User not found with identifier: \${loginIdentifier}\`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(\`User found: \${user.username} (role: \${user.role})\`);

    // Verify password using bcrypt
    const bcrypt = require('bcrypt');
    console.log('Verifying password with bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password verification failed');
      
      // Try with bcryptjs as fallback
      const bcryptjs = require('bcryptjs');
      console.log('Trying with bcryptjs as fallback');
      const isBcryptJsMatch = await bcryptjs.compare(password, user.password);
      
      if (!isBcryptJsMatch) {
        console.log('Password verification failed with bcryptjs too');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Password verified with bcryptjs');
    } else {
      console.log('Password verified with bcrypt');
    }

    // Ensure user has active status
    if (user.status !== 'active' && user.isActive !== true) {
      console.log(\`Setting user \${user.username} status to active\`);
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
});`;

// Replace the login route in the file
let updatedUserRoutes = userRoutes;

// Check if the file contains a login route
if (userRoutes.includes('router.post(\'/login\'')) {
  // Replace the login route
  updatedUserRoutes = userRoutes.replace(
    /\/\/ Login route[\s\S]*?router\.post\(['"]\/login['"][\s\S]*?}\);/,
    updatedLoginRoute
  );
} else {
  // Add the login route after the router definition
  updatedUserRoutes = userRoutes.replace(
    /const router = express\.Router\(\);/,
    'const router = express.Router();\n\n' + updatedLoginRoute
  );
}

// Write the updated file
fs.writeFileSync(userRoutesPath, updatedUserRoutes);

console.log('Login route updated successfully!');
console.log('Please restart the backend server for the changes to take effect.');
