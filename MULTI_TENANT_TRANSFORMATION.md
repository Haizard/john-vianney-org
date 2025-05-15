# Multi-Tenant School System Transformation Guide

## Overview

This document provides a comprehensive guide for transforming the current St. John Vianney School Management System into a multi-tenant platform capable of hosting multiple schools, each with their own website, system, and database. This transformation will enable the platform to serve as a SaaS (Software as a Service) solution for educational institutions.

## Table of Contents

1. [Current System Architecture](#current-system-architecture)
2. [Target Multi-Tenant Architecture](#target-multi-tenant-architecture)
3. [Phase 1: Core Infrastructure Redesign](#phase-1-core-infrastructure-redesign)
4. [Phase 2: Database Restructuring](#phase-2-database-restructuring)
5. [Phase 3: Authentication and Authorization](#phase-3-authentication-and-authorization)
6. [Phase 4: School-Specific Customization](#phase-4-school-specific-customization)
7. [Phase 5: Admin Dashboard](#phase-5-admin-dashboard)
8. [Phase 6: Deployment and Infrastructure](#phase-6-deployment-and-infrastructure)
9. [Phase 7: Testing and Quality Assurance](#phase-7-testing-and-quality-assurance)
10. [Phase 8: Documentation and Training](#phase-8-documentation-and-training)
11. [Technical Considerations](#technical-considerations)
12. [Implementation Timeline](#implementation-timeline)

## Current System Architecture

The current system is a monolithic application designed for a single school:

- **Backend**: Node.js/Express.js REST API
- **Frontend**: React-based single-page application
- **Database**: MongoDB (single database)
- **Authentication**: JWT-based authentication
- **Deployment**: Configured for Render, with options for Vercel, Cloudflare, and Koyeb

## Target Multi-Tenant Architecture

The transformed system will follow a multi-tenant architecture:

- **Tenant Identification**: Each school will be identified by a unique tenant ID
- **Database Isolation**: Each school will have its own database or isolated collections
- **Custom Domains**: Schools will have their own domains or subdomains
- **Customization**: Schools will be able to customize branding, features, and configurations
- **Central Administration**: A super-admin interface will manage all schools

## Phase 1: Core Infrastructure Redesign

### 1.1 Tenant Identification System

```javascript
// Example tenant middleware
const tenantMiddleware = async (req, res, next) => {
  // Extract tenant identifier from subdomain, header, or path
  const hostname = req.hostname;
  const subdomain = hostname.split('.')[0];

  // Look up tenant in database
  const tenant = await Tenant.findOne({ subdomain });
  if (!tenant) {
    return res.status(404).json({ message: 'School not found' });
  }

  // Attach tenant to request object
  req.tenant = tenant;
  next();
};
```

#### Tasks:
- Create a Tenant model to store school information
- Implement tenant identification middleware
- Modify request handling to include tenant context
- Create tenant routing system
- Implement tenant configuration service

### 1.2 API Gateway for Tenant Routing

- Implement an API gateway to route requests to the appropriate tenant
- Create a tenant resolver to map domains to tenant IDs
- Implement request/response transformation for tenant-specific data

### 1.3 Service Layer Refactoring

- Refactor service layer to be tenant-aware
- Implement tenant context propagation
- Create tenant-specific service factories

## Phase 2: Database Restructuring

### 2.1 Multi-Tenant Database Strategy

Choose and implement one of the following approaches:

#### Database-per-tenant
```javascript
// Example database connection factory
const getTenantConnection = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  const connectionString = tenant.databaseConnectionString;

  if (!connections[tenantId]) {
    connections[tenantId] = await mongoose.createConnection(connectionString);
  }

  return connections[tenantId];
};
```

#### Collection-per-tenant
```javascript
// Example collection naming strategy
const getTenantCollectionName = (tenantId, baseCollectionName) => {
  return `tenant_${tenantId}_${baseCollectionName}`;
};
```

#### Shared collections with tenant field
```javascript
// Example schema modification
const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  // existing fields...
});
```

### 2.2 Schema Modifications

- Add tenant identifier to all schemas
- Create indexes for tenant fields
- Implement tenant-specific validation rules

### 2.3 Data Migration Tools

- Create scripts to migrate existing data to the new structure
- Implement data validation and integrity checks
- Create tenant data import/export utilities

## Phase 3: Authentication and Authorization

### 3.1 Multi-Tenant Authentication

```javascript
// Example multi-tenant authentication
const authenticateUser = async (email, password, tenantId) => {
  const user = await User.findOne({ email, tenantId });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
};
```

#### Tasks:
- Modify user model to include tenant ID
- Update authentication middleware to validate tenant context
- Implement tenant-specific JWT issuance
- Create tenant-specific password policies

### 3.2 Role-Based Access Control Enhancements

- Implement tenant-specific roles and permissions
- Create role inheritance system
- Implement permission checking middleware

### 3.3 Cross-Tenant Access Control

- Define policies for super-admin access to tenant data
- Implement tenant isolation enforcement
- Create audit logging for cross-tenant operations

## Phase 4: School-Specific Customization

### 4.1 Branding and Theming

```javascript
// Example tenant configuration schema
const tenantConfigSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  theme: {
    primaryColor: String,
    secondaryColor: String,
    logoUrl: String,
    favicon: String
  },
  // other configuration...
});
```

#### Tasks:
- Create tenant configuration model
- Implement theme customization options
- Create asset storage for tenant-specific media
- Implement theme switching based on tenant

### 4.2 Feature Toggles

- Implement feature flag system
- Create tenant-specific feature configuration
- Implement conditional rendering based on features

### 4.3 Custom Domain Setup

- Implement domain management system
- Create DNS configuration helpers
- Implement SSL certificate management

## Phase 5: Admin Dashboard

### 5.1 Super-Admin Interface

- Create super-admin user role
- Implement tenant management dashboard
- Create tenant creation and configuration workflows

### 5.2 Tenant Management

- Implement tenant lifecycle management (create, suspend, delete)
- Create tenant configuration interface
- Implement tenant usage monitoring

### 5.3 Billing and Subscription

- Implement subscription plans
- Create billing integration
- Implement usage-based billing
- Create payment processing system

## Phase 6: Deployment and Infrastructure

### 6.1 Multi-Tenant Hosting Configuration

- Configure load balancing for multi-tenant setup
- Implement tenant-specific caching
- Create tenant isolation at infrastructure level

### 6.2 Database Scaling

- Implement database sharding strategy
- Create connection pooling for multi-tenant databases
- Implement query optimization for tenant-specific queries

### 6.3 Backup and Disaster Recovery

- Create tenant-specific backup strategies
- Implement point-in-time recovery
- Create tenant data export functionality

## Phase 7: Testing and Quality Assurance

### 7.1 Multi-Tenant Testing Framework

- Create tenant-specific test environments
- Implement tenant context in test cases
- Create tenant isolation tests

### 7.2 Performance Testing

- Implement load testing for multi-tenant scenarios
- Create performance benchmarks
- Implement tenant-specific performance monitoring

### 7.3 Security Testing

- Implement tenant isolation security tests
- Create penetration testing plan
- Implement data privacy compliance checks

## Phase 8: Documentation and Training

### 8.1 System Documentation

- Create architecture documentation
- Document tenant management procedures
- Create API documentation with tenant context

### 8.2 School Onboarding Guide

- Create tenant setup documentation
- Implement guided onboarding process
- Create configuration checklists

### 8.3 Administrator Training

- Create training materials for system administrators
- Implement knowledge base for common issues
- Create video tutorials for key operations

## Technical Considerations

### Data Isolation and Security

- Ensure complete data isolation between tenants
- Implement row-level security where applicable
- Create regular security audits for tenant isolation

### Scalability

- Design for horizontal scaling
- Implement caching strategies for tenant data
- Create performance optimization guidelines

### Compliance

- Implement data residency options for different regions
- Create compliance documentation for educational data regulations
- Implement data retention policies per tenant

## Implementation Timeline

A phased approach is recommended:

1. **Months 1-2**: Core infrastructure redesign and database restructuring
2. **Months 3-4**: Authentication system and school-specific customization
3. **Months 5-6**: Admin dashboard and deployment infrastructure
4. **Month 7**: Testing, quality assurance, and documentation
5. **Month 8**: Pilot deployment with select schools
6. **Month 9+**: Full rollout and ongoing improvements

## Detailed Implementation Steps

### Step 1: Create Tenant Model and Management System

```javascript
// models/Tenant.js
const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  customDomain: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  schoolConfig: {
    name: String,
    shortName: String,
    address: {
      street: String,
      city: String,
      country: String
    },
    contact: {
      phone: String,
      email: String,
      website: String
    },
    logo: String,
    motto: String,
    organization: String
  },
  databaseConfig: {
    connectionString: String,
    databaseName: String
  },
  features: {
    financialManagement: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    advancedReporting: {
      type: Boolean,
      default: true
    },
    parentPortal: {
      type: Boolean,
      default: true
    }
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3f51b5'
    },
    secondaryColor: {
      type: String,
      default: '#f50057'
    },
    fontFamily: {
      type: String,
      default: 'Roboto, sans-serif'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled'],
      default: 'trial'
    }
  }
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;
```

### Step 2: Implement Tenant Middleware

```javascript
// middleware/tenantMiddleware.js
const Tenant = require('../models/Tenant');

const tenantMiddleware = async (req, res, next) => {
  try {
    // Extract tenant identifier from subdomain
    const hostname = req.hostname;
    let subdomain;

    // Check if using custom domain or subdomain
    if (hostname.includes('.')) {
      // Check if this is a custom domain
      const tenant = await Tenant.findOne({ customDomain: hostname });
      if (tenant) {
        req.tenant = tenant;
        return next();
      }

      // Extract subdomain
      const parts = hostname.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    // If no subdomain found, check for tenant header or query param
    if (!subdomain) {
      subdomain = req.headers['x-tenant-id'] || req.query.tenantId;
    }

    if (!subdomain) {
      return res.status(400).json({
        message: 'Tenant identifier not found',
        error: 'TENANT_NOT_FOUND'
      });
    }

    // Look up tenant in database
    const tenant = await Tenant.findOne({
      subdomain,
      active: true
    });

    if (!tenant) {
      return res.status(404).json({
        message: 'School not found or inactive',
        error: 'TENANT_NOT_ACTIVE'
      });
    }

    // Attach tenant to request object
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      message: 'Error processing tenant information',
      error: 'TENANT_PROCESSING_ERROR'
    });
  }
};

module.exports = tenantMiddleware;
```

### Step 3: Database Connection Factory

```javascript
// utils/databaseManager.js
const mongoose = require('mongoose');

// Cache for tenant connections
const connections = {};

// Default connection (for super admin)
let defaultConnection = null;

/**
 * Get database connection for a specific tenant
 * @param {Object} tenant - Tenant object
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const getTenantConnection = async (tenant) => {
  if (!tenant) {
    throw new Error('Tenant is required');
  }

  const tenantId = tenant._id.toString();

  // Return cached connection if exists
  if (connections[tenantId]) {
    return connections[tenantId];
  }

  // Get connection string from tenant config or generate one
  let connectionString = tenant.databaseConfig?.connectionString;

  if (!connectionString) {
    // Generate connection string based on main connection
    const baseUri = process.env.MONGODB_URI;
    const dbName = tenant.databaseConfig?.databaseName || `school_${tenantId}`;
    connectionString = baseUri.replace(/\/[^/]+(\?|$)/, `/${dbName}$1`);
  }

  // Create new connection
  try {
    connections[tenantId] = await mongoose.createConnection(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Connected to database for tenant: ${tenant.name}`);
    return connections[tenantId];
  } catch (error) {
    console.error(`Error connecting to database for tenant ${tenant.name}:`, error);
    throw error;
  }
};

/**
 * Get default connection (for super admin)
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const getDefaultConnection = async () => {
  if (!defaultConnection) {
    defaultConnection = await mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return defaultConnection;
};

/**
 * Close all tenant connections
 */
const closeAllConnections = async () => {
  const closePromises = Object.values(connections).map(conn => conn.close());
  if (defaultConnection) {
    closePromises.push(defaultConnection.close());
  }
  await Promise.all(closePromises);

  // Clear connections cache
  Object.keys(connections).forEach(key => delete connections[key]);
  defaultConnection = null;
};

module.exports = {
  getTenantConnection,
  getDefaultConnection,
  closeAllConnections
};
```

### Step 4: Model Factory for Tenant-Specific Models

```javascript
// utils/modelFactory.js
const mongoose = require('mongoose');
const { getTenantConnection } = require('./databaseManager');

// Cache for tenant models
const modelCache = {};

/**
 * Create a tenant-specific model
 * @param {Object} tenant - Tenant object
 * @param {String} modelName - Name of the model
 * @param {mongoose.Schema} schema - Mongoose schema
 * @returns {Promise<mongoose.Model>} Mongoose model
 */
const createTenantModel = async (tenant, modelName, schema) => {
  if (!tenant || !modelName || !schema) {
    throw new Error('Tenant, model name, and schema are required');
  }

  const tenantId = tenant._id.toString();
  const cacheKey = `${tenantId}:${modelName}`;

  // Return cached model if exists
  if (modelCache[cacheKey]) {
    return modelCache[cacheKey];
  }

  // Get tenant connection
  const connection = await getTenantConnection(tenant);

  // Create model with tenant connection
  const model = connection.model(modelName, schema);

  // Cache the model
  modelCache[cacheKey] = model;

  return model;
};

module.exports = {
  createTenantModel
};
```

### Step 5: Modify Authentication for Multi-Tenant Support

```javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createTenantModel } = require('../utils/modelFactory');
const userSchema = require('../schemas/userSchema');

/**
 * Login user with tenant context
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Get tenant from request (set by tenant middleware)
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({
        message: 'Tenant context is required',
        error: 'MISSING_TENANT'
      });
    }

    // Get User model for this tenant
    const User = await createTenantModel(tenant, 'User', userSchema);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Create JWT token with tenant information
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        tenantId: tenant._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        tenantId: tenant._id
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error during login',
      error: 'LOGIN_ERROR'
    });
  }
};

module.exports = {
  login
};
```

### Step 6: Update Authentication Middleware

```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token contains tenant ID
    if (!decoded.tenantId) {
      return res.status(401).json({
        message: 'Invalid token format - missing tenant information',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Get tenant from database
    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant || !tenant.active) {
      return res.status(403).json({
        message: 'Tenant not found or inactive',
        error: 'TENANT_NOT_ACTIVE'
      });
    }

    // Attach user and tenant to request
    req.user = decoded;
    req.tenant = tenant;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      message: 'Error during authentication',
      error: 'AUTH_ERROR'
    });
  }
};

module.exports = authenticateToken;
```

### Step 7: Create Super Admin Dashboard Routes

```javascript
// routes/superAdminRoutes.js
const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const superAdminAuth = require('../middleware/superAdminAuth');

// Get all tenants
router.get('/tenants', superAdminAuth, async (req, res) => {
  try {
    const tenants = await Tenant.find().select('-databaseConfig.connectionString');
    res.status(200).json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      message: 'Error fetching tenants',
      error: 'FETCH_ERROR'
    });
  }
});

// Create new tenant
router.post('/tenants', superAdminAuth, async (req, res) => {
  try {
    const {
      name,
      subdomain,
      customDomain,
      schoolConfig,
      features,
      subscription
    } = req.body;

    // Validate required fields
    if (!name || !subdomain) {
      return res.status(400).json({
        message: 'Name and subdomain are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({
        message: 'Subdomain already in use',
        error: 'SUBDOMAIN_EXISTS'
      });
    }

    // Create new tenant
    const tenant = new Tenant({
      name,
      subdomain,
      customDomain,
      schoolConfig: schoolConfig || {
        name,
        shortName: name.split(' ').map(word => word[0]).join('').toUpperCase(),
        address: {
          street: '',
          city: '',
          country: ''
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        motto: 'Education for Excellence',
        organization: name
      },
      features: features || {},
      subscription: subscription || {
        plan: 'basic',
        startDate: new Date(),
        status: 'trial'
      }
    });

    // Generate database name
    tenant.databaseConfig = {
      databaseName: `school_${subdomain.replace(/[^a-zA-Z0-9]/g, '_')}`
    };

    await tenant.save();

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain
      }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      message: 'Error creating tenant',
      error: 'CREATE_ERROR'
    });
  }
});

// Update tenant
router.put('/tenants/:id', superAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.databaseConfig;

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({
        message: 'Tenant not found',
        error: 'TENANT_NOT_FOUND'
      });
    }

    res.status(200).json({
      message: 'Tenant updated successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        active: tenant.active
      }
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      message: 'Error updating tenant',
      error: 'UPDATE_ERROR'
    });
  }
});

module.exports = router;
```

### Step 8: Frontend Configuration for Multi-Tenant Support

```javascript
// src/config/apiConfig.js
/**
 * API Configuration for multi-tenant support
 */

// Get tenant information from the current domain
const getTenantFromDomain = () => {
  const hostname = window.location.hostname;

  // Check if running locally
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local development, get tenant from localStorage or use default
    return localStorage.getItem('current_tenant') || 'demo';
  }

  // Extract subdomain from hostname
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  // If no subdomain found, this might be a custom domain
  // The backend will handle this case
  return null;
};

// Set the API URL based on environment and tenant
const getApiUrl = () => {
  const tenant = getTenantFromDomain();
  let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Ensure the API_URL ends with a trailing slash
  if (!apiUrl.endsWith('/')) {
    apiUrl = `${apiUrl}/`;
  }

  // For production, use the appropriate domain
  if (process.env.NODE_ENV === 'production') {
    // If we have a tenant subdomain, use it
    if (tenant) {
      // The API is likely on the same domain but with /api path
      apiUrl = `/api/`;
    } else {
      // Use the configured production API URL
      apiUrl = process.env.REACT_APP_PROD_API_URL || apiUrl;
    }
  }

  return apiUrl;
};

// Add tenant header to API requests
const addTenantHeader = (headers = {}) => {
  const tenant = getTenantFromDomain();
  if (tenant) {
    return {
      ...headers,
      'X-Tenant-ID': tenant
    };
  }
  return headers;
};

export const API_URL = getApiUrl();
export const withTenantHeader = addTenantHeader;

// Export tenant information
export const TENANT_INFO = {
  subdomain: getTenantFromDomain()
};
```

### Step 9: Create Initial Tenant Setup Script

```javascript
// scripts/createInitialTenant.js
require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const bcrypt = require('bcrypt');
const { getTenantConnection } = require('../utils/databaseManager');
const userSchema = require('../schemas/userSchema');

/**
 * Create initial tenant and admin user
 */
async function createInitialTenant() {
  try {
    // Connect to main database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to main database');

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ subdomain: 'demo' });
    if (existingTenant) {
      console.log('Demo tenant already exists');
      return existingTenant;
    }

    // Create demo tenant
    const tenant = new Tenant({
      name: 'Demo School',
      subdomain: 'demo',
      active: true,
      schoolConfig: {
        name: 'Demo School',
        shortName: 'DEMO',
        address: {
          street: 'P.O.BOX 1234',
          city: 'Demo City',
          country: 'Tanzania'
        },
        contact: {
          phone: '+255 123 456 789',
          email: 'info@demoschool.com',
          website: 'www.demoschool.com'
        },
        logo: '/assets/demo-logo.png',
        motto: 'Education for All',
        organization: 'Demo School System'
      },
      databaseConfig: {
        databaseName: 'school_demo'
      },
      features: {
        financialManagement: true,
        smsNotifications: true,
        advancedReporting: true,
        parentPortal: true
      },
      subscription: {
        plan: 'premium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        status: 'active'
      }
    });

    await tenant.save();
    console.log('Demo tenant created successfully');

    // Create admin user in tenant database
    const connection = await getTenantConnection(tenant);
    const User = connection.model('User', userSchema);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@demoschool.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    return tenant;
  } catch (error) {
    console.error('Error creating initial tenant:', error);
    throw error;
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
createInitialTenant()
  .then(() => {
    console.log('Initial setup completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
```

## Detailed Execution Plan for Coding Agent

This section provides a step-by-step execution plan with specific tasks and prompts for the coding agent. Each step includes instructions for the agent to research the current state, evaluate previous work, and execute the current task effectively.

### Phase 1: Foundation Setup

#### A. Project Analysis and Planning

**Before starting:** First analyze the entire codebase to understand its structure, dependencies, and architecture.

- **A1. Review existing codebase thoroughly**
  - *Agent prompt:* "Analyze the current codebase structure, focusing on the backend architecture, database models, and authentication system. Identify the key components that will need modification for multi-tenancy."

- **A2. Document current database schema**
  - *Agent prompt:* "Extract and document the current MongoDB schema from the models directory. Create a diagram or structured documentation of entity relationships to understand data dependencies."

- **A3. Identify all components that need to be modified**
  - *Agent prompt:* "Based on the codebase analysis, create a comprehensive list of all components that will require modification to support multi-tenancy. Categorize them by priority and complexity."

- **A4. Create a detailed project plan with milestones**
  - *Agent prompt:* "Create a detailed implementation plan with specific milestones based on the identified components. Include dependency mapping to ensure proper sequencing of tasks."

#### B. Tenant Model and Database Structure

**Before starting:** Review the analysis from Step A and ensure you understand the current database structure completely.

- **B1. Create the Tenant model (as shown in Step 1)**
  - *Agent prompt:* "Implement the Tenant model as specified in Step 1 of the implementation details. Ensure it includes all necessary fields for school configuration, domain management, and feature toggles."

- **B2. Set up the database connection factory (as shown in Step 3)**
  - *Agent prompt:* "Implement the database connection factory as specified in Step 3. Test that it can successfully create and manage connections to different tenant databases."

- **B3. Create model factory for tenant-specific models (as shown in Step 4)**
  - *Agent prompt:* "Implement the model factory as specified in Step 4. Verify it can correctly create tenant-specific models using the appropriate database connection."

- **B4. Write tests for tenant model and database connections**
  - *Agent prompt:* "Create comprehensive tests for the Tenant model and database connection functionality. Include tests for connection pooling, error handling, and model creation."

#### C. Tenant Identification and Routing

**Before starting:** Ensure the Tenant model and database connections are working correctly from Step B.

- **C1. Implement tenant identification middleware (as shown in Step 2)**
  - *Agent prompt:* "Implement the tenant identification middleware as specified in Step 2. Test it with various domain scenarios including subdomains and custom domains."

- **C2. Create tenant context propagation system**
  - *Agent prompt:* "Develop a system to propagate tenant context throughout the request lifecycle. Ensure it's accessible to all necessary components without manual passing."

- **C3. Write tests for tenant identification**
  - *Agent prompt:* "Create tests for the tenant identification system covering all edge cases: missing tenant, inactive tenant, custom domains, and subdomains."

- **C4. Implement API gateway for tenant routing**
  - *Agent prompt:* "Implement an API gateway that routes requests to the appropriate tenant context. Test with multiple simulated tenants."

- **C5. Create tenant-specific request handlers**
  - *Agent prompt:* "Modify request handlers to be tenant-aware, using the tenant context from middleware. Verify they correctly isolate tenant-specific operations."

- **C6. Set up domain/subdomain routing**
  - *Agent prompt:* "Implement domain and subdomain routing that maps to the correct tenant. Test with various domain configurations."

#### D. Authentication System Adaptation

**Before starting:** Verify that tenant identification is working correctly from Step C.

- **D1. Modify authentication system for tenant awareness (as shown in Step 5)**
  - *Agent prompt:* "Update the authentication system as specified in Step 5 to include tenant context. Ensure user lookups are scoped to the current tenant."

- **D2. Update JWT token generation to include tenant information**
  - *Agent prompt:* "Modify JWT token generation to include tenant ID and relevant tenant information. Test token creation and validation."

- **D3. Implement tenant-specific user management**
  - *Agent prompt:* "Create tenant-specific user management functionality ensuring users from one tenant cannot access another tenant's resources."

- **D4. Update authentication middleware (as shown in Step 6)**
  - *Agent prompt:* "Implement the updated authentication middleware as specified in Step 6. Test that it correctly validates tenant context in tokens."

- **D5. Implement tenant-specific role-based access control**
  - *Agent prompt:* "Extend the role-based access control system to be tenant-specific. Ensure roles and permissions are isolated between tenants."

- **D6. Write tests for authentication and authorization**
  - *Agent prompt:* "Create comprehensive tests for the multi-tenant authentication system. Include tests for cross-tenant access attempts and permission boundaries."

#### E. Core Service Adaptation

**Before starting:** Ensure authentication with tenant context is working correctly from Step D.

- **E1. Refactor core services to be tenant-aware**
  - *Agent prompt:* "Refactor all core services to use the tenant context. Verify each service correctly isolates operations to the current tenant."

- **E2. Implement tenant context in service factories**
  - *Agent prompt:* "Create service factories that incorporate tenant context when instantiating services. Test with multiple tenant scenarios."

- **E3. Create tenant-specific configuration service**
  - *Agent prompt:* "Implement a configuration service that provides tenant-specific settings. Test with different configuration scenarios per tenant."

- **E4. Implement tenant-specific data access patterns**
  - *Agent prompt:* "Modify data access patterns to enforce tenant isolation. Ensure all database queries include tenant context."

- **E5. Create data isolation enforcement**
  - *Agent prompt:* "Implement a system to enforce data isolation between tenants at the database level. Test with attempts to access cross-tenant data."

- **E6. Write tests for service layer and data access**
  - *Agent prompt:* "Create tests for all tenant-aware services and data access patterns. Verify complete isolation between tenant data."

### Phase 2: First Tenant Migration

#### F. Data Migration Tools

**Before starting:** Verify that all core services are tenant-aware from Step E.

- **F1. Create tenant setup script (as shown in Step 9)**
  - *Agent prompt:* "Implement the tenant setup script as specified in Step 9. Test it creates a fully functional tenant with all necessary initial data."

- **F2. Develop data migration utilities**
  - *Agent prompt:* "Create utilities to migrate existing data to the new multi-tenant structure. Include data validation and error handling."

- **F3. Implement schema validation tools**
  - *Agent prompt:* "Develop tools to validate data schema during migration. Ensure they catch and report any inconsistencies."

- **F4. Set up test environment**
  - *Agent prompt:* "Configure a test environment with multiple tenant databases. Verify isolation and proper connection management."

- **F5. Perform test migration with sample data**
  - *Agent prompt:* "Execute a test migration with sample data. Document the process and any issues encountered."

- **F6. Validate data integrity after migration**
  - *Agent prompt:* "Implement validation scripts to verify data integrity post-migration. Ensure all relationships and constraints are maintained."

#### G. First Tenant Implementation

**Before starting:** Ensure migration tools are working correctly from Step F.

- **G1. Create the first tenant in the system**
  - *Agent prompt:* "Create the first real tenant in the system using the setup script. Verify all components are correctly initialized."

- **G2. Migrate existing school data to tenant database**
  - *Agent prompt:* "Migrate the existing school data to the new tenant database structure. Document the process and verify data integrity."

- **G3. Configure tenant-specific settings**
  - *Agent prompt:* "Configure all tenant-specific settings for the first tenant. Test that configuration is correctly applied."

- **G4. Implement frontend configuration for multi-tenant support (as shown in Step 8)**
  - *Agent prompt:* "Update the frontend configuration as specified in Step 8. Test with the first tenant's domain."

- **G5. Update API service to include tenant headers**
  - *Agent prompt:* "Modify API services to include tenant headers in all requests. Verify correct tenant context propagation."

- **G6. Test frontend with tenant context**
  - *Agent prompt:* "Perform comprehensive testing of the frontend with tenant context. Ensure all operations are correctly scoped to the tenant."

#### H. Testing and Refinement

**Before starting:** Verify that the first tenant implementation is working correctly from Step G.

- **H1. Test all core functionality with tenant context**
  - *Agent prompt:* "Create and execute test cases for all core functionality with tenant context. Document any issues found."

- **H2. Verify data isolation between test tenants**
  - *Agent prompt:* "Set up multiple test tenants and verify complete data isolation. Attempt cross-tenant access to confirm security."

- **H3. Fix any issues found during testing**
  - *Agent prompt:* "Address all issues identified during testing. Prioritize security and data isolation concerns."

- **H4. Conduct load testing with tenant context**
  - *Agent prompt:* "Perform load testing with multiple active tenants. Identify any performance bottlenecks."

- **H5. Optimize database queries for tenant-specific data**
  - *Agent prompt:* "Review and optimize all database queries for tenant-specific operations. Implement indexing strategies for tenant fields."

- **H6. Implement caching strategies for tenant data**
  - *Agent prompt:* "Develop tenant-aware caching strategies. Ensure cache isolation between tenants."

#### I. Security and Compliance

**Before starting:** Review all testing results from Step H to identify security concerns.

- **I1. Perform security audit of tenant isolation**
  - *Agent prompt:* "Conduct a comprehensive security audit focusing on tenant isolation. Document all findings and recommendations."

- **I2. Test cross-tenant access controls**
  - *Agent prompt:* "Create specific tests for cross-tenant access attempts. Verify all attempts are properly blocked."

- **I3. Implement additional security measures as needed**
  - *Agent prompt:* "Based on the security audit, implement additional security measures. Focus on tenant isolation and authentication."

- **I4. Implement data retention policies**
  - *Agent prompt:* "Create tenant-specific data retention policies. Implement automated enforcement mechanisms."

- **I5. Create data export functionality**
  - *Agent prompt:* "Implement functionality to export tenant-specific data. Ensure exports only contain data for the requesting tenant."

- **I6. Document compliance measures**
  - *Agent prompt:* "Create comprehensive documentation of all compliance measures implemented. Include data isolation, security, and privacy features."

### Phase 3: Admin Dashboard and Scaling

#### J. Super Admin Dashboard

**Before starting:** Ensure security and compliance measures are in place from Step I.

- **J1. Implement super admin routes (as shown in Step 7)**
  - *Agent prompt:* "Implement the super admin routes as specified in Step 7. Test access control and functionality."

- **J2. Create tenant management controllers**
  - *Agent prompt:* "Develop controllers for tenant management operations. Include creation, suspension, and configuration of tenants."

- **J3. Implement tenant analytics collection**
  - *Agent prompt:* "Create a system to collect and store tenant usage analytics. Ensure data is properly isolated and secured."

- **J4. Create super admin dashboard UI**
  - *Agent prompt:* "Develop the UI for the super admin dashboard. Include tenant management, analytics, and system monitoring."

- **J5. Implement tenant management interface**
  - *Agent prompt:* "Create the interface for managing tenant configurations, subscriptions, and settings."

- **J6. Develop tenant monitoring visualizations**
  - *Agent prompt:* "Implement visualizations for tenant monitoring data. Include usage trends, performance metrics, and health indicators."

#### K. Tenant Customization

**Before starting:** Verify that the super admin dashboard is working correctly from Step J.

- **K1. Implement theme customization**
  - *Agent prompt:* "Create a system for tenant-specific theme customization. Include colors, logos, and styling options."

- **K2. Create feature toggle system**
  - *Agent prompt:* "Implement a feature toggle system that allows enabling/disabling features per tenant. Test with various configurations."

- **K3. Develop tenant-specific asset management**
  - *Agent prompt:* "Create a system for managing tenant-specific assets like images, documents, and media files."

- **K4. Implement custom domain management**
  - *Agent prompt:* "Develop functionality to manage custom domains for tenants. Include validation and SSL configuration."

- **K5. Create SSL certificate provisioning**
  - *Agent prompt:* "Implement automated SSL certificate provisioning for tenant domains. Test with multiple domain scenarios."

- **K6. Test with multiple domains**
  - *Agent prompt:* "Perform comprehensive testing with multiple tenant domains. Verify correct routing and tenant identification."

#### L. Tenant Onboarding

**Before starting:** Ensure tenant customization features are working correctly from Step K.

- **L1. Create tenant registration process**
  - *Agent prompt:* "Implement a complete tenant registration process. Include validation, initial setup, and admin user creation."

- **L2. Implement guided setup wizard**
  - *Agent prompt:* "Develop a step-by-step setup wizard for new tenants. Test the complete onboarding flow."

- **L3. Develop tenant initialization scripts**
  - *Agent prompt:* "Create scripts to initialize a new tenant with default data and configurations. Test with various tenant types."

- **L4. Implement tenant self-management features**
  - *Agent prompt:* "Develop features for tenants to manage their own settings, users, and configurations."

- **L5. Create tenant settings interface**
  - *Agent prompt:* "Implement the UI for tenant administrators to manage their settings. Test with different permission levels."

- **L6. Develop user invitation system**
  - *Agent prompt:* "Create a system for tenant administrators to invite users. Include role assignment and email notifications."

#### M. Scaling and Optimization

**Before starting:** Verify that tenant onboarding is working correctly from Step L.

- **M1. Implement horizontal scaling for multi-tenant setup**
  - *Agent prompt:* "Configure the system for horizontal scaling. Test with simulated load across multiple tenants."

- **M2. Configure load balancing**
  - *Agent prompt:* "Set up load balancing for the multi-tenant system. Test distribution of tenant requests."

- **M3. Set up monitoring and alerting**
  - *Agent prompt:* "Implement comprehensive monitoring and alerting for the system. Include tenant-specific metrics."

- **M4. Perform end-to-end testing**
  - *Agent prompt:* "Conduct full end-to-end testing of the entire system. Document all findings and address any issues."

- **M5. Create comprehensive documentation**
  - *Agent prompt:* "Develop detailed documentation for the entire system. Include architecture, APIs, and tenant management."

- **M6. Prepare training materials for administrators**
  - *Agent prompt:* "Create training materials for both super administrators and tenant administrators."

### Phase 4: Launch and Expansion

#### N. Pilot Deployment

**Before starting:** Ensure all optimization and documentation is complete from Step M.

- **N1. Set up production environment**
  - *Agent prompt:* "Configure the production environment for the multi-tenant system. Include all necessary security measures."

- **N2. Deploy the system with initial tenant**
  - *Agent prompt:* "Deploy the system to production with the initial tenant. Verify all components are functioning correctly."

- **N3. Configure monitoring and logging**
  - *Agent prompt:* "Set up production monitoring and logging. Ensure tenant-specific data is properly isolated."

- **N4. Conduct user acceptance testing**
  - *Agent prompt:* "Perform user acceptance testing with the initial tenant. Document feedback and issues."

- **N5. Gather feedback from pilot users**
  - *Agent prompt:* "Collect and analyze feedback from pilot users. Identify areas for improvement."

- **N6. Make necessary adjustments**
  - *Agent prompt:* "Implement changes based on pilot feedback. Prioritize critical issues and usability improvements."

#### O. Additional Tenant Onboarding

**Before starting:** Verify that the pilot deployment is stable from Step N.

- **O1. Migrate data for additional schools**
  - *Agent prompt:* "Migrate data for additional schools to the multi-tenant system. Document the process for each tenant."

- **O2. Configure tenant-specific settings**
  - *Agent prompt:* "Configure settings for each new tenant based on their specific requirements."

- **O3. Provide training to school administrators**
  - *Agent prompt:* "Conduct training sessions for administrators of each new tenant. Document common questions and issues."

- **O4. Monitor system performance with multiple tenants**
  - *Agent prompt:* "Closely monitor system performance as new tenants are added. Identify any scaling issues."

- **O5. Identify and resolve bottlenecks**
  - *Agent prompt:* "Address any performance bottlenecks identified during multi-tenant operation."

- **O6. Optimize resource utilization**
  - *Agent prompt:* "Fine-tune resource allocation and utilization across all tenants."

#### P. Final Launch Preparation

**Before starting:** Ensure multiple tenants are operating successfully from Step O.

- **P1. Implement additional features based on feedback**
  - *Agent prompt:* "Develop additional features requested by tenants during the pilot phase. Prioritize based on impact."

- **P2. Refine tenant isolation mechanisms**
  - *Agent prompt:* "Review and enhance tenant isolation based on operational experience. Address any edge cases."

- **P3. Enhance user experience**
  - *Agent prompt:* "Implement user experience improvements based on feedback. Focus on common workflows."

- **P4. Conduct final security audit**
  - *Agent prompt:* "Perform a comprehensive security audit of the production system with multiple active tenants."

- **P5. Prepare marketing materials**
  - *Agent prompt:* "Create marketing materials highlighting the multi-tenant capabilities and benefits."

- **P6. Set up support channels**
  - *Agent prompt:* "Establish support channels for tenant administrators and users. Document support procedures."

#### Q. Launch

**Before starting:** Verify all preparation is complete from Step P.

- **Q1. Open the platform for general registration**
  - *Agent prompt:* "Configure the system to allow public tenant registration. Monitor the registration process closely."

- **Q2. Monitor system during launch**
  - *Agent prompt:* "Implement enhanced monitoring during the launch period. Be prepared to address any issues quickly."

- **Q3. Provide immediate support for new tenants**
  - *Agent prompt:* "Ensure support staff are ready to assist new tenants. Document common onboarding issues."

- **Q4. Collect and analyze usage metrics**
  - *Agent prompt:* "Gather comprehensive usage metrics across all tenants. Identify patterns and potential improvements."

- **Q5. Implement continuous improvement process**
  - *Agent prompt:* "Establish a process for ongoing system improvements based on operational data and feedback."

- **Q6. Plan for future enhancements**
  - *Agent prompt:* "Create a roadmap for future platform enhancements. Prioritize based on tenant needs and strategic goals."

## Migration Strategy

To migrate the existing system to the multi-tenant architecture, follow these steps:

1. **Create the tenant infrastructure** (models, middleware, database connections)
2. **Migrate the first school** as the initial tenant
3. **Test thoroughly** with the first tenant
4. **Gradually add more tenants** and test with real data
5. **Implement the super admin dashboard** for tenant management
6. **Develop tenant onboarding workflows** for self-service

## Implementation Checklist

Use this checklist to track progress during implementation:

### Core Infrastructure
- [ ] Create Tenant model
- [ ] Implement tenant middleware
- [ ] Set up database connection factory
- [ ] Create model factory for tenant-specific models
- [ ] Implement API gateway for tenant routing

### Authentication and Authorization
- [ ] Modify authentication system for tenant awareness
- [ ] Update JWT token generation
- [ ] Implement tenant-specific user management
- [ ] Update authentication middleware
- [ ] Implement tenant-specific role-based access control

### Data Migration
- [ ] Create tenant setup script
- [ ] Develop data migration utilities
- [ ] Implement schema validation tools
- [ ] Migrate existing school data to tenant database

### Frontend Adaptation
- [ ] Implement frontend configuration for multi-tenant support
- [ ] Update API service to include tenant headers
- [ ] Create tenant-specific theming
- [ ] Implement feature toggles in UI

### Admin Dashboard
- [ ] Implement super admin routes
- [ ] Create tenant management controllers
- [ ] Create super admin dashboard UI
- [ ] Implement tenant monitoring visualizations

### Tenant Onboarding
- [ ] Create tenant registration process
- [ ] Implement guided setup wizard
- [ ] Develop tenant initialization scripts
- [ ] Create tenant settings interface

### Testing and Deployment
- [ ] Test all core functionality with tenant context
- [ ] Perform security audit of tenant isolation
- [ ] Conduct load testing with tenant context
- [ ] Set up production environment
- [ ] Deploy the system with initial tenant

## Troubleshooting Guide

This section provides solutions to common issues that may arise during the multi-tenant transformation process.

### Database Connection Issues

**Problem**: Tenant database connections fail to establish or are unstable.
**Solution**:
- Verify MongoDB connection strings are correctly formatted
- Check that database credentials have appropriate permissions
- Implement connection pooling with proper timeout and retry logic
- Add detailed logging for connection attempts and failures

**Agent prompt**: "When troubleshooting database connection issues, first verify the connection string format, then check credentials and permissions. Implement proper error handling with specific error codes and messages for different failure scenarios."

### Tenant Identification Failures

**Problem**: System fails to correctly identify the tenant from the request.
**Solution**:
- Add detailed logging of hostname, headers, and request parameters
- Implement fallback mechanisms for tenant identification
- Create a diagnostic endpoint that shows the current tenant identification process
- Add validation for tenant subdomains to prevent conflicts

**Agent prompt**: "If tenant identification is failing, add comprehensive logging at each step of the identification process. Create a diagnostic tool that shows exactly how the system is attempting to identify the tenant."

### Data Isolation Breaches

**Problem**: Data from one tenant is visible to another tenant.
**Solution**:
- Audit all database queries to ensure tenant context is always included
- Implement database-level security policies as a second layer of protection
- Create automated tests that attempt to access cross-tenant data
- Add tenant validation in all service methods

**Agent prompt**: "To address data isolation issues, implement a query auditing system that logs any query executed without tenant context. Create a comprehensive test suite specifically for testing tenant isolation."

### Performance Degradation

**Problem**: System performance decreases as more tenants are added.
**Solution**:
- Implement tenant-specific caching strategies
- Optimize database indexes for tenant-specific queries
- Consider sharding strategies for high-traffic tenants
- Implement resource limits per tenant to prevent resource monopolization

**Agent prompt**: "When addressing performance issues, first profile the system to identify bottlenecks. Implement tenant-specific performance monitoring to identify which tenants are consuming the most resources."

### Authentication Failures

**Problem**: Users cannot authenticate or receive incorrect permissions.
**Solution**:
- Verify JWT token includes correct tenant information
- Check that user lookup is scoped to the correct tenant
- Implement detailed authentication logging
- Create tenant-specific authentication diagnostics

**Agent prompt**: "For authentication issues, implement detailed logging of the entire authentication process. Create a diagnostic tool that shows the exact JWT payload and verification steps."

## Best Practices for Multi-Tenant Development

### Code Organization

- **Tenant Context Propagation**: Use a consistent pattern for propagating tenant context throughout the application
- **Service Layer Isolation**: Ensure all service methods require tenant context as their first parameter
- **Middleware Consistency**: Apply tenant identification and validation middleware consistently across all routes
- **Error Handling**: Implement specific error types for tenant-related issues

**Agent prompt**: "When organizing code for multi-tenancy, create a consistent pattern for tenant context propagation. Consider implementing a decorator or higher-order function that automatically applies tenant context to service methods."

### Database Design

- **Indexing Strategy**: Create compound indexes with tenant ID as the first field
- **Query Optimization**: Optimize all queries to use tenant-specific indexes
- **Schema Validation**: Implement JSON schema validation that requires tenant ID in all documents
- **Connection Management**: Implement efficient connection pooling and caching per tenant

**Agent prompt**: "For database design, ensure all collections have a compound index with tenant ID as the first field. Implement schema validation to require tenant ID in all documents."

### Security Considerations

- **Tenant Validation**: Validate tenant context in every request
- **Cross-Tenant Protection**: Implement specific protections against cross-tenant access attempts
- **Rate Limiting**: Apply rate limiting per tenant to prevent resource abuse
- **Audit Logging**: Maintain detailed audit logs for all tenant management operations

**Agent prompt**: "Implement comprehensive security measures including tenant validation on every request, protection against cross-tenant access, and detailed audit logging for all tenant operations."

### Testing Strategies

- **Tenant Isolation Tests**: Create specific tests that verify data isolation between tenants
- **Multi-Tenant Load Testing**: Test system performance with multiple active tenants
- **Security Penetration Testing**: Attempt to access other tenant's data through various attack vectors
- **Tenant Lifecycle Testing**: Test the complete lifecycle of tenant creation, operation, and deletion

**Agent prompt**: "Develop a comprehensive testing strategy specifically for multi-tenancy. Include isolation tests, performance tests with multiple tenants, and security tests that attempt to breach tenant boundaries."

## Monitoring and Maintenance

### Key Metrics to Monitor

- **Per-Tenant Resource Usage**: Track CPU, memory, database operations, and storage per tenant
- **Tenant Health Indicators**: Monitor authentication failures, error rates, and performance metrics per tenant
- **Cross-Tenant Access Attempts**: Log and alert on any attempts to access data across tenant boundaries
- **Tenant Growth Metrics**: Track tenant onboarding, user growth, and feature utilization

**Agent prompt**: "Implement a comprehensive monitoring system that tracks resource usage, health indicators, security events, and growth metrics for each tenant individually and for the system as a whole."

### Maintenance Procedures

- **Tenant Database Backups**: Implement tenant-specific backup and restore procedures
- **Tenant Migration**: Create procedures for migrating tenants between environments
- **Version Updates**: Develop a strategy for rolling out updates across multiple tenants
- **Tenant Archiving**: Implement procedures for archiving inactive tenants

**Agent prompt**: "Develop maintenance procedures specifically for a multi-tenant environment, including tenant-specific backups, migration procedures, and strategies for rolling out updates across tenants."

## Scaling the Multi-Tenant System

### Horizontal Scaling

- **Stateless Services**: Ensure all services are stateless and can be scaled horizontally
- **Tenant-Aware Load Balancing**: Implement load balancing that considers tenant context
- **Database Sharding**: Prepare for database sharding based on tenant ID
- **Tenant-Specific Resource Allocation**: Consider dedicated resources for high-demand tenants

**Agent prompt**: "Design the system for horizontal scaling from the beginning. Ensure all components are stateless and can be scaled independently based on tenant demand."

### Vertical Scaling

- **Resource Monitoring**: Implement detailed monitoring to identify when vertical scaling is needed
- **Database Optimization**: Regularly optimize database performance for high-traffic tenants
- **Caching Strategies**: Implement tenant-specific caching to reduce database load
- **Query Optimization**: Continuously optimize queries for the most active tenants

**Agent prompt**: "Implement systems to identify when vertical scaling is needed. Create optimization procedures for high-traffic tenants."

## Conclusion

This transformation will convert the current single-school system into a scalable multi-tenant platform capable of hosting multiple schools with isolated data and customized experiences. The architecture ensures proper separation of concerns, data isolation, and scalability while maintaining the core functionality of the school management system.

By following the detailed execution plan, implementation checklist, and best practices provided in this document, your coding agent can systematically transform the existing single-school system into a robust multi-tenant platform. The phased approach allows for incremental development and testing, minimizing risks and ensuring a smooth transition.

The troubleshooting guide, best practices, and monitoring recommendations will help address common challenges and ensure the long-term success of the multi-tenant platform. With proper implementation, the system will be able to scale efficiently as more schools are added, providing each with a customized and secure experience.
