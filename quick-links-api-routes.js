// Quick Links API Routes
const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // GET all active quick links (public)
  router.get('/quick-links', (req, res) => {
    connection.query(
      'SELECT * FROM quick_links WHERE is_active = 1 ORDER BY order_index ASC',
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  });

  // GET all quick links including inactive (admin)
  router.get('/admin/quick-links', (req, res) => {
    connection.query(
      'SELECT * FROM quick_links ORDER BY order_index ASC',
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  });

  // GET single quick link
  router.get('/admin/quick-links/:id', (req, res) => {
    connection.query(
      'SELECT * FROM quick_links WHERE id = ?',
      [req.params.id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Quick link not found' });
        }
        res.json(rows[0]);
      }
    );
  });

  // CREATE quick link
  router.post('/admin/quick-links', (req, res) => {
    const { title, url, icon, order_index, is_active } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    connection.query(
      'INSERT INTO quick_links (title, url, icon, order_index, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, url, icon || '🔗', order_index || 0, is_active !== false ? 1 : 0],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: 'Quick link created successfully',
          id: result.insertId
        });
      }
    );
  });

  // UPDATE quick link
  router.put('/admin/quick-links/:id', (req, res) => {
    const { title, url, icon, order_index, is_active } = req.body;

    connection.query(
      'UPDATE quick_links SET title = ?, url = ?, icon = ?, order_index = ?, is_active = ? WHERE id = ?',
      [title, url, icon, order_index, is_active ? 1 : 0, req.params.id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Quick link not found' });
        }
        res.json({ message: 'Quick link updated successfully' });
      }
    );
  });

  // DELETE quick link
  router.delete('/admin/quick-links/:id', (req, res) => {
    connection.query(
      'DELETE FROM quick_links WHERE id = ?',
      [req.params.id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Quick link not found' });
        }
        res.json({ message: 'Quick link deleted successfully' });
      }
    );
  });

  return router;
};
