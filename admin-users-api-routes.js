const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (db) => {
  // Get all admin users
  router.get('/api/admin/users', (req, res) => {
    const query = `
      SELECT id, username, email, role, created_at, last_login, is_active
      FROM admin_users
      ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching admin users:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch admin users'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get single admin user
  router.get('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, username, email, role, created_at, last_login, is_active
      FROM admin_users
      WHERE id = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching admin user:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch admin user'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Admin user not found'
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  });

  // Create admin user
  router.post('/api/admin/users', async (req, res) => {
    const { username, email, password, role, permissions } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, and role are required'
      });
    }

    try {
      // Check if username or email already exists
      const checkQuery = 'SELECT id FROM admin_users WHERE username = ? OR email = ?';

      db.query(checkQuery, [username, email], async (err, existing) => {
        if (err) {
          console.error('Error checking existing user:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error'
          });
        }

        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Username or email already exists'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
          INSERT INTO admin_users (username, email, password, role, permissions, is_active)
          VALUES (?, ?, ?, ?, ?, 1)
        `;

        const permissionsJson = permissions ? JSON.stringify(permissions) : null;

        db.query(insertQuery, [username, email, hashedPassword, role, permissionsJson], (err, result) => {
          if (err) {
            console.error('Error creating admin user:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to create admin user'
            });
          }

          res.status(201).json({
            success: true,
            data: {
              id: result.insertId,
              username,
              email,
              role
            },
            message: 'Admin user created successfully'
          });
        });
      });
    } catch (error) {
      console.error('Error in user creation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create admin user'
      });
    }
  });

  // Update admin user
  router.put('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role, permissions, is_active } = req.body;

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (permissions !== undefined) {
      updates.push('permissions = ?');
      values.push(JSON.stringify(permissions));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating admin user:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update admin user'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Admin user not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin user updated successfully'
      });
    });
  });

  // Delete admin user
  router.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;

    // Prevent deleting the super admin
    db.query('SELECT role FROM admin_users WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error checking user role:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Admin user not found'
        });
      }

      if (results[0].role === 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete super admin user'
        });
      }

      db.query('DELETE FROM admin_users WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('Error deleting admin user:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to delete admin user'
          });
        }

        res.json({
          success: true,
          message: 'Admin user deleted successfully'
        });
      });
    });
  });

  return router;
};
