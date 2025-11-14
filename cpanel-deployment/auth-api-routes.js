const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'rada-mtaani-admin-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

module.exports = (db) => {
  // Admin login
  router.post('/api/admin/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Query admin user from database
    const query = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';

    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Error fetching admin user:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      const user = results[0];

      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      // Update last login timestamp
      db.query(
        'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
        [user.id],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating last login:', updateErr);
          }
        }
      );

      // Get permissions for this role
      const permissions = getPermissionsForRole(user.role);

      // Return user data and token
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name
          },
          token,
          permissions
        },
        message: 'Login successful'
      });
    });
  });

  // Admin logout (client-side mainly, but can add server-side token blacklisting)
  router.post('/api/admin/auth/logout', (req, res) => {
    // In a more robust implementation, you could:
    // - Blacklist the token
    // - Store logout time
    // - Clear any sessions

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });

  // Verify token and return user info
  router.get('/api/admin/auth/verify', authenticateToken, (req, res) => {
    // If token is valid, req.user is set by authenticateToken middleware
    const userId = req.user.id;

    const query = 'SELECT id, username, email, role, full_name, last_login FROM admin_users WHERE id = ? AND is_active = 1';

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      const user = results[0];
      const permissions = getPermissionsForRole(user.role);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            last_login: user.last_login
          },
          permissions
        }
      });
    });
  });

  return router;
};

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
}

// Helper function to get permissions based on role
function getPermissionsForRole(role) {
  const permissions = {
    super_admin: [
      'manage_all',
      'manage_politicians',
      'manage_users',
      'manage_content',
      'view_analytics',
      'system_settings'
    ],
    editor: [
      'manage_politicians',
      'manage_content',
      'view_analytics'
    ],
    moderator: [
      'manage_content',
      'view_analytics'
    ],
    viewer: [
      'view_analytics'
    ]
  };

  return permissions[role] || permissions.viewer;
}

// Export the authenticateToken middleware for use in other routes
module.exports.authenticateToken = authenticateToken;
