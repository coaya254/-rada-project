const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // ==========================================
  // GET ALL DISCUSSIONS
  // ==========================================
  router.get('/api/community/discussions', (req, res) => {
    const { category, search, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        d.*,
        u.nickname,
        u.emoji
      FROM discussions d
      JOIN users u ON d.uuid = u.uuid
      WHERE 1=1
    `;
    let params = [];

    // Filter by category
    if (category && category !== 'all') {
      query += ' AND d.category = ?';
      params.push(category);
    }

    // Search filter
    if (search) {
      query += ' AND (d.title LIKE ? OR d.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching discussions:', err);
        return res.status(500).json({ error: 'Failed to fetch discussions' });
      }

      res.json(results);
    });
  });

  // ==========================================
  // GET SINGLE DISCUSSION
  // ==========================================
  router.get('/api/community/discussions/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid discussion ID' });
    }

    // Increment view count
    db.query('UPDATE discussions SET views_count = views_count + 1 WHERE id = ?', [id]);

    db.query(`
      SELECT 
        d.*,
        u.nickname,
        u.emoji
      FROM discussions d
      JOIN users u ON d.uuid = u.uuid
      WHERE d.id = ?
    `, [id], (err, results) => {
      if (err) {
        console.error('Error fetching discussion:', err);
        return res.status(500).json({ error: 'Failed to fetch discussion' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      res.json(results[0]);
    });
  });

  // ==========================================
  // CREATE NEW DISCUSSION
  // ==========================================
  router.post('/api/community/discussions', (req, res) => {
    const { uuid, title, content, category, is_anonymous } = req.body;

    // Validation
    if (!uuid || !title || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: uuid, title, content, and category are required' 
      });
    }

    if (title.trim().length < 10 || title.trim().length > 500) {
      return res.status(400).json({ 
        error: 'Title must be between 10 and 500 characters' 
      });
    }

    if (content.trim().length < 20 || content.trim().length > 10000) {
      return res.status(400).json({
        error: 'Content must be between 20 and 10,000 characters'
      });
    }

    // Validate category length (allow custom categories)
    if (category.trim().length < 3 || category.trim().length > 50) {
      return res.status(400).json({
        error: 'Category must be between 3 and 50 characters'
      });
    }

    // Insert discussion
    db.query(`
      INSERT INTO discussions (uuid, title, content, category, is_anonymous)
      VALUES (?, ?, ?, ?, ?)
    `, [uuid, title.trim(), content.trim(), category, is_anonymous || false], (err, result) => {
      if (err) {
        console.error('Error creating discussion:', err);
        return res.status(500).json({ error: 'Failed to create discussion' });
      }

      // Award XP for creating discussion
      db.query('UPDATE users SET xp = xp + 10 WHERE uuid = ?', [uuid]);
      db.query(
        'INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "create_discussion", 10, ?, "discussion")',
        [uuid, result.insertId]
      );

      res.json({
        success: true,
        message: 'Discussion created successfully',
        discussionId: result.insertId
      });
    });
  });

  // ==========================================
  // GET REPLIES FOR A DISCUSSION
  // ==========================================
  router.get('/api/community/discussions/:id/replies', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid discussion ID' });
    }

    db.query(`
      SELECT 
        r.*,
        u.nickname,
        u.emoji
      FROM discussion_replies r
      JOIN users u ON r.uuid = u.uuid
      WHERE r.discussion_id = ?
      ORDER BY r.created_at ASC
    `, [id], (err, results) => {
      if (err) {
        console.error('Error fetching replies:', err);
        return res.status(500).json({ error: 'Failed to fetch replies' });
      }

      res.json(results);
    });
  });

  // ==========================================
  // ADD REPLY TO DISCUSSION
  // ==========================================
  router.post('/api/community/discussions/:id/replies', (req, res) => {
    const { id } = req.params;
    const { uuid, content } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid discussion ID' });
    }

    if (!uuid || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'User UUID and content are required' });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({ error: 'Reply too long. Maximum 5000 characters' });
    }

    // Check if discussion exists
    db.query('SELECT id FROM discussions WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error checking discussion:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      // Insert reply
      db.query(
        'INSERT INTO discussion_replies (discussion_id, uuid, content) VALUES (?, ?, ?)',
        [id, uuid, content.trim()],
        (err, result) => {
          if (err) {
            console.error('Error creating reply:', err);
            return res.status(500).json({ error: 'Failed to create reply' });
          }

          // Update reply count
          db.query('UPDATE discussions SET replies_count = replies_count + 1 WHERE id = ?', [id]);

          // Award XP
          db.query('UPDATE users SET xp = xp + 5 WHERE uuid = ?', [uuid]);
          db.query(
            'INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "reply_discussion", 5, ?, "discussion")',
            [uuid, id]
          );

          res.json({
            success: true,
            message: 'Reply added successfully',
            replyId: result.insertId
          });
        }
      );
    });
  });

  // ==========================================
  // LIKE/UNLIKE DISCUSSION
  // ==========================================
  router.post('/api/community/discussions/:id/like', (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid discussion ID' });
    }

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if already liked
    db.query('SELECT id FROM discussion_likes WHERE discussion_id = ? AND uuid = ?', [id, uuid], (err, results) => {
      if (err) {
        console.error('Error checking like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Unlike
        db.query('DELETE FROM discussion_likes WHERE discussion_id = ? AND uuid = ?', [id, uuid], (err) => {
          if (err) {
            console.error('Error unliking:', err);
            return res.status(500).json({ error: 'Failed to unlike' });
          }

          db.query('UPDATE discussions SET likes_count = likes_count - 1 WHERE id = ?', [id]);

          res.json({ success: true, message: 'Discussion unliked', liked: false });
        });
      } else {
        // Like
        db.query('INSERT INTO discussion_likes (discussion_id, uuid) VALUES (?, ?)', [id, uuid], (err) => {
          if (err) {
            console.error('Error liking:', err);
            return res.status(500).json({ error: 'Failed to like' });
          }

          db.query('UPDATE discussions SET likes_count = likes_count + 1 WHERE id = ?', [id]);

          // Award XP
          db.query('UPDATE users SET xp = xp + 2 WHERE uuid = ?', [uuid]);

          res.json({ success: true, message: 'Discussion liked', liked: true });
        });
      }
    });
  });

  // ==========================================
  // DELETE DISCUSSION
  // ==========================================
  router.delete('/api/community/discussions/:id', (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid discussion ID' });
    }

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if user owns this discussion
    db.query('SELECT uuid FROM discussions WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error checking discussion ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Discussion not found' });
      }

      if (results[0].uuid !== uuid) {
        return res.status(403).json({ error: 'You can only delete your own discussions' });
      }

      // Delete associated data first
      db.query('DELETE FROM discussion_likes WHERE discussion_id = ?', [id]);
      db.query('DELETE FROM discussion_replies WHERE discussion_id = ?', [id]);

      // Delete discussion
      db.query('DELETE FROM discussions WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting discussion:', err);
          return res.status(500).json({ error: 'Failed to delete discussion' });
        }

        res.json({ success: true, message: 'Discussion deleted successfully' });
      });
    });
  });

  // ==========================================
  // DELETE REPLY
  // ==========================================
  router.delete('/api/community/replies/:id', (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid reply ID' });
    }

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if user owns this reply
    db.query('SELECT uuid, discussion_id FROM discussion_replies WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error checking reply ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      if (results[0].uuid !== uuid) {
        return res.status(403).json({ error: 'You can only delete your own replies' });
      }

      const discussionId = results[0].discussion_id;

      // Delete associated likes first
      db.query('DELETE FROM reply_likes WHERE reply_id = ?', [id]);

      // Delete reply
      db.query('DELETE FROM discussion_replies WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting reply:', err);
          return res.status(500).json({ error: 'Failed to delete reply' });
        }

        // Update reply count
        db.query('UPDATE discussions SET replies_count = replies_count - 1 WHERE id = ?', [discussionId]);

        res.json({ success: true, message: 'Reply deleted successfully' });
      });
    });
  });

  // ==========================================
  // LIKE/UNLIKE REPLY
  // ==========================================
  router.post('/api/community/replies/:id/like', (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid reply ID' });
    }

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if already liked
    db.query('SELECT id FROM reply_likes WHERE reply_id = ? AND uuid = ?', [id, uuid], (err, results) => {
      if (err) {
        console.error('Error checking like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Unlike
        db.query('DELETE FROM reply_likes WHERE reply_id = ? AND uuid = ?', [id, uuid], (err) => {
          if (err) {
            console.error('Error unliking:', err);
            return res.status(500).json({ error: 'Failed to unlike' });
          }

          db.query('UPDATE discussion_replies SET likes_count = likes_count - 1 WHERE id = ?', [id]);

          res.json({ success: true, message: 'Reply unliked', liked: false });
        });
      } else {
        // Like
        db.query('INSERT INTO reply_likes (reply_id, uuid) VALUES (?, ?)', [id, uuid], (err) => {
          if (err) {
            console.error('Error liking:', err);
            return res.status(500).json({ error: 'Failed to like' });
          }

          db.query('UPDATE discussion_replies SET likes_count = likes_count + 1 WHERE id = ?', [id]);

          // Award XP
          db.query('UPDATE users SET xp = xp + 1 WHERE uuid = ?', [uuid]);

          res.json({ success: true, message: 'Reply liked', liked: true });
        });
      }
    });
  });

  return router;
};