const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // ==========================================
  // GET USER PROFILE
  // ==========================================
  router.get('/api/profile/:uuid', (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    const query = `
      SELECT
        u.uuid,
        u.nickname,
        u.emoji,
        u.email,
        u.bio,
        u.county,
        u.persona,
        u.xp,
        u.level,
        u.streak,
        u.last_streak,
        u.badges,
        u.trust_score,
        u.preferences,
        u.created_at,
        u.last_active,
        ulp.total_xp,
        ulp.current_streak,
        ulp.longest_streak,
        ulp.modules_completed,
        ulp.lessons_completed,
        ulp.quizzes_passed,
        ulp.achievements_earned
      FROM users u
      LEFT JOIN user_learning_progress ulp ON u.id = ulp.user_id
      WHERE u.uuid = ?
    `;

    db.query(query, [uuid], (err, results) => {
      if (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = results[0];

      // Parse JSON fields
      if (profile.badges && typeof profile.badges === 'string') {
        try {
          profile.badges = JSON.parse(profile.badges);
        } catch (e) {
          profile.badges = [];
        }
      }

      if (profile.preferences && typeof profile.preferences === 'string') {
        try {
          profile.preferences = JSON.parse(profile.preferences);
        } catch (e) {
          profile.preferences = {};
        }
      }

      res.json({
        success: true,
        profile: profile
      });
    });
  });

  // ==========================================
  // UPDATE USER PROFILE
  // ==========================================
  router.put('/api/profile/:uuid', (req, res) => {
    const { uuid } = req.params;
    const { nickname, bio, county, emoji, preferences } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (county !== undefined) {
      updates.push('county = ?');
      values.push(county);
    }
    if (emoji !== undefined) {
      updates.push('emoji = ?');
      values.push(emoji);
    }
    if (preferences !== undefined) {
      updates.push('preferences = ?');
      values.push(JSON.stringify(preferences));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(uuid);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE uuid = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating user profile:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    });
  });

  // ==========================================
  // GET USER STATS
  // ==========================================
  router.get('/api/profile/:uuid/stats', (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }

    // First get user ID from UUID
    db.query('SELECT id FROM users WHERE uuid = ?', [uuid], (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResults[0].id;

      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM user_learning_modules WHERE user_id = ? AND completed_at IS NOT NULL) as modules_completed,
          (SELECT COUNT(*) FROM user_learning_lessons WHERE user_id = ? AND completed_at IS NOT NULL) as lessons_completed,
          (SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id = ? AND passed = 1) as quizzes_passed,
          (SELECT COUNT(*) FROM user_learning_achievements WHERE user_id = ?) as achievements_count,
          (SELECT COALESCE(SUM(amount), 0) FROM user_xp_transactions WHERE user_id = ?) as total_xp_earned,
          (SELECT current_streak FROM user_learning_streaks WHERE user_id = ?) as current_streak,
          (SELECT longest_streak FROM user_learning_streaks WHERE user_id = ?) as longest_streak
      `;

      db.query(statsQuery, [userId, userId, userId, userId, userId, userId, userId], (err, statsResults) => {
        if (err) {
          console.error('Error fetching user stats:', err);
          return res.status(500).json({ error: 'Failed to fetch stats' });
        }

        res.json({
          success: true,
          stats: statsResults[0]
        });
      });
    });
  });

  return router;
};
