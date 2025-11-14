const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // ==========================================
  // GET USER POSTS (from discussions table - same as Community tab)
  // ==========================================
  router.get('/api/profile/:uuid/posts', (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // This query matches what the Community tab shows
    // discussions table stores posts with uuid (not author_id)
    const query = `
      SELECT
        d.id,
        d.uuid,
        d.title,
        d.content,
        d.category,
        d.replies_count,
        d.likes_count,
        d.views_count,
        d.is_anonymous,
        d.created_at,
        d.updated_at,
        u.nickname,
        u.emoji
      FROM discussions d
      LEFT JOIN users u ON d.uuid = u.uuid
      WHERE d.uuid = ?
      ORDER BY d.created_at DESC
      LIMIT 50
    `;

    db.query(query, [uuid], (err, results) => {
      if (err) {
        console.error('Error fetching user posts:', err);
        return res.status(500).json({ error: 'Failed to fetch posts' });
      }

      res.json({
        success: true,
        posts: results,
        count: results.length
      });
    });
  });

  // ==========================================
  // GET USER SAVED ITEMS
  // ==========================================
  router.get('/api/profile/:uuid/saved', (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Get all saved items from different tables using UUID
    const savedItemsQuery = `
      SELECT
        'discussion' as type,
        d.id,
        d.title,
        d.content,
        d.category,
        b.created_at as saved_at
      FROM bookmarks b
      INNER JOIN discussions d ON b.post_id = d.id
      WHERE b.uuid = ?

      UNION ALL

      SELECT
        si.item_type as type,
        si.item_id as id,
        si.title,
        si.description as content,
        NULL as category,
        si.created_at as saved_at
      FROM saved_items si
      WHERE si.uuid = ?

      UNION ALL

      SELECT
        CONCAT('learning_', lb.item_type) as type,
        lb.item_id as id,
        CASE
          WHEN lb.item_type = 'lesson' THEN (SELECT title FROM learning_lessons WHERE id = lb.item_id)
          WHEN lb.item_type = 'module' THEN (SELECT title FROM learning_modules WHERE id = lb.item_id)
          WHEN lb.item_type = 'quiz' THEN (SELECT title FROM learning_quizzes WHERE id = lb.item_id)
        END as title,
        NULL as content,
        lb.item_type as category,
        lb.created_at as saved_at
      FROM learning_bookmarks lb
      WHERE lb.user_uuid = ?

      ORDER BY saved_at DESC
      LIMIT 50
    `;

    db.query(savedItemsQuery, [uuid, uuid, uuid], (err, results) => {
      if (err) {
        console.error('Error fetching saved items:', err);
        return res.status(500).json({ error: 'Failed to fetch saved items' });
      }

      res.json({
        success: true,
        saved: results,
        count: results.length
      });
    });
  });

  // ==========================================
  // GET USER ACTIVITIES
  // ==========================================
  router.get('/api/profile/:uuid/activities', (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // Get recent activities from multiple sources using UUID
    const activitiesQuery = `
      SELECT
        'xp_earned' as activity_type,
        xp.action as action_name,
        xp.xp_earned as points,
        xp.content_type,
        xp.content_id,
        xp.created_at
      FROM xp_transactions xp
      WHERE xp.uuid = ?

      UNION ALL

      SELECT
        'discussion_created' as activity_type,
        CONCAT('Posted: ', d.title) as action_name,
        0 as points,
        'discussion' as content_type,
        d.id as content_id,
        d.created_at
      FROM discussions d
      WHERE d.uuid = ?

      UNION ALL

      SELECT
        'reply_created' as activity_type,
        'Replied to discussion' as action_name,
        0 as points,
        'reply' as content_type,
        dr.id as content_id,
        dr.created_at
      FROM discussion_replies dr
      WHERE dr.uuid = ?

      UNION ALL

      SELECT
        'quiz_completed' as activity_type,
        CONCAT('Completed quiz') as action_name,
        COALESCE(uqt.amount, 0) as points,
        'quiz' as content_type,
        uqt.source_id as content_id,
        uqt.created_at
      FROM user_xp_transactions uqt
      WHERE uqt.user_uuid = ? AND uqt.source_type = 'quiz'

      UNION ALL

      SELECT
        'lesson_completed' as activity_type,
        CONCAT('Completed lesson: ', l.title) as action_name,
        l.xp_reward as points,
        'lesson' as content_type,
        ull.lesson_id as content_id,
        ull.completed_at as created_at
      FROM user_learning_lessons ull
      INNER JOIN learning_lessons l ON ull.lesson_id = l.id
      WHERE ull.user_uuid = ?

      ORDER BY created_at DESC
      LIMIT 50
    `;

    db.query(activitiesQuery, [uuid, uuid, uuid, uuid, uuid], (err, results) => {
      if (err) {
        console.error('Error fetching activities:', err);
        return res.status(500).json({ error: 'Failed to fetch activities' });
      }

      res.json({
        success: true,
        activities: results,
        count: results.length
      });
    });
  });

  return router;
};
