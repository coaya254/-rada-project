const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Get content feed
  router.get('/api/content/feed', (req, res) => {


    const userUuid = req.headers['x-user-uuid'];
    
    const query = `
      SELECT 
        p.*,

        u.nickname as username,
        u.trust_score,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT ps.id) as shares_count,
        CASE WHEN user_likes.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
        CASE WHEN user_bookmarks.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
      FROM posts p
      LEFT JOIN users u ON p.uuid = u.uuid
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_shares ps ON p.id = ps.post_id
      LEFT JOIN post_likes user_likes ON p.id = user_likes.post_id AND user_likes.uuid = ?
      LEFT JOIN bookmarks user_bookmarks ON p.id = user_bookmarks.post_id AND user_bookmarks.uuid = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    
    db.query(query, [userUuid, userUuid], (err, results) => {
      if (err) {
        console.error('Error fetching posts:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(results || []);
    });
  });

  // Create new post
  router.post('/api/content/posts', (req, res) => {
    const { title, content, type, is_anonymous } = req.body;
    const uuid = req.headers['x-user-uuid'];
    
    if (!content || !uuid) {
      return res.status(400).json({ error: 'Content and user UUID are required' });
    }

    const query = `
      INSERT INTO posts (title, content, type, is_anonymous, uuid, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      title || '',
      content,
      type || 'story',
      is_anonymous || false,
      uuid
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating post:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        postId: result.insertId,
        message: 'Post created successfully' 
      });
    });
  });

  // Like a post
  router.post('/api/content/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const { isLiked } = req.body;
    const uuid = req.headers['x-user-uuid'];
    
    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if already liked
    const checkQuery = 'SELECT id FROM post_likes WHERE post_id = ? AND uuid = ?';
    db.query(checkQuery, [postId, uuid], (err, results) => {
      if (err) {
        console.error('Error checking like:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        // Unlike
        const deleteQuery = 'DELETE FROM post_likes WHERE post_id = ? AND uuid = ?';
        db.query(deleteQuery, [postId, uuid], (err) => {
          if (err) {
            console.error('Error removing like:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, liked: false });
        });
      } else {
        // Like
        const insertQuery = 'INSERT INTO post_likes (post_id, uuid) VALUES (?, ?)';
        db.query(insertQuery, [postId, uuid], (err) => {
          if (err) {
            console.error('Error adding like:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, liked: true });
        });
      }
    });
  });

  // Comment on a post
  router.post('/api/content/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { comment, parent_comment_id } = req.body;
    const uuid = req.headers['x-user-uuid'];
    
    if (!comment || !uuid) {
      return res.status(400).json({ error: 'Comment and user UUID are required' });
    }

    const query = `
      INSERT INTO comments (post_id, uuid, content, is_anonymous, parent_comment_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [postId, uuid, comment, false, parent_comment_id || null]; // Default to not anonymous
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating comment:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        commentId: result.insertId,
        message: 'Comment added successfully' 
      });
    });
  });

  // Like/Unlike a comment
  router.post('/api/comments/:commentId/like', (req, res) => {
    const commentId = req.params.commentId;
    const { isLiked } = req.body;
    const uuid = req.headers['x-user-uuid'];
    
    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if already liked
    const checkQuery = 'SELECT id FROM comment_likes WHERE comment_id = ? AND uuid = ?';
    db.query(checkQuery, [commentId, uuid], (err, results) => {
      if (err) {
        console.error('Error checking comment like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Unlike
        const deleteQuery = 'DELETE FROM comment_likes WHERE comment_id = ? AND uuid = ?';
        db.query(deleteQuery, [commentId, uuid], (err) => {
          if (err) {
            console.error('Error removing comment like:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, message: 'Comment unliked successfully' });
        });
      } else {
        // Like
        const insertQuery = 'INSERT INTO comment_likes (comment_id, uuid) VALUES (?, ?)';
        db.query(insertQuery, [commentId, uuid], (err) => {
          if (err) {
            console.error('Error adding comment like:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, message: 'Comment liked successfully' });
        });
      }
    });
  });

  // Bookmark a post
  router.post('/api/content/posts/:id/bookmark', (req, res) => {
    const postId = req.params.id;
    const { isBookmarked } = req.body;
    const uuid = req.headers['x-user-uuid'];
    
    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Check if already bookmarked
    const checkQuery = 'SELECT id FROM bookmarks WHERE post_id = ? AND uuid = ?';
    db.query(checkQuery, [postId, uuid], (err, results) => {
      if (err) {
        console.error('Error checking bookmark:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        // Remove bookmark
        const deleteQuery = 'DELETE FROM bookmarks WHERE post_id = ? AND uuid = ?';
        db.query(deleteQuery, [postId, uuid], (err) => {
          if (err) {
            console.error('Error removing bookmark:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, bookmarked: false });
        });
      } else {
        // Add bookmark
        const insertQuery = 'INSERT INTO bookmarks (post_id, uuid, created_at) VALUES (?, ?, NOW())';
        db.query(insertQuery, [postId, uuid], (err) => {
          if (err) {
            console.error('Error adding bookmark:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, bookmarked: true });
        });
      }
    });
  });

  // Share a post
  router.post('/api/content/posts/:id/share', (req, res) => {
    const postId = req.params.id;
    const uuid = req.headers['x-user-uuid'];
    
    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Insert share record
    const insertQuery = 'INSERT INTO post_shares (post_id, uuid, created_at) VALUES (?, ?, NOW())';
    db.query(insertQuery, [postId, uuid], (err, result) => {
      if (err) {
        console.error('Error recording share:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        shareId: result.insertId,
        message: 'Share recorded successfully' 
      });
    });
  });

  // Get comments for a post
  router.get('/api/content/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    
    const query = `
      SELECT 
        c.*,
        u.nickname as username,
        u.trust_score
      FROM comments c
      LEFT JOIN users u ON c.uuid = u.uuid
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;
    
    db.query(query, [postId], (err, results) => {
      if (err) {
        console.error('Error fetching comments:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results || []);
    });
  });

  return router;
};


