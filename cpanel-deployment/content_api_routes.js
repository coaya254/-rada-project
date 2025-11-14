const express = require('express');
const router = express.Router();
const db = require('./server').db;

// Get content feed
router.get('/api/content/feed', (req, res) => {
  const query = `
    SELECT 
      p.*,
      u.username,
      u.trust_score,
      COUNT(DISTINCT c.id) as comments_count,
      COUNT(DISTINCT pl.id) as likes_count
    FROM posts p
    LEFT JOIN users u ON p.uuid = u.uuid
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ posts: results || [] });
  });
    
    res.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;
