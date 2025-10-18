const express = require('express');
const router = express.Router();
const { auditLog } = require('./audit-log-middleware');

module.exports = (db) => {
  // Get all commitments (with optional politician filter)
  router.get('/api/admin/commitments', (req, res) => {
    const { politicianId, status, category } = req.query;

    let query = 'SELECT * FROM commitments WHERE 1=1';
    const params = [];

    if (politicianId) {
      query += ' AND politician_id = ?';
      params.push(politicianId);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date_made DESC';

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching commitments:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch commitments'
        });
      }

      // Parse JSON fields
      const commitments = results.map(c => ({
        ...c,
        source_links: c.source_links ? (typeof c.source_links === 'string' ? JSON.parse(c.source_links) : c.source_links) : [],
        verification_links: c.verification_links ? (typeof c.verification_links === 'string' ? JSON.parse(c.verification_links) : c.verification_links) : [],
        related_actions: c.related_actions ? (typeof c.related_actions === 'string' ? JSON.parse(c.related_actions) : c.related_actions) : []
      }));

      res.json({
        success: true,
        data: commitments
      });
    });
  });

  // Get single commitment by ID
  router.get('/api/admin/commitments/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM commitments WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching commitment:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch commitment'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Commitment not found'
        });
      }

      const commitment = {
        ...results[0],
        source_links: results[0].source_links ? JSON.parse(results[0].source_links) : [],
        verification_links: results[0].verification_links ? JSON.parse(results[0].verification_links) : [],
        related_actions: results[0].related_actions ? JSON.parse(results[0].related_actions) : []
      };

      res.json({
        success: true,
        data: commitment
      });
    });
  });

  // Create new commitment
  router.post('/api/admin/commitments', auditLog('CREATE', 'commitment'), (req, res) => {
    const {
      politician_id,
      promise,
      description,
      category,
      context,
      date_made,
      status,
      progress_percentage,
      evidence,
      last_activity_date,
      source_links,
      verification_links,
      related_actions
    } = req.body;

    // Validate required fields
    if (!politician_id || !promise || !description || !category || !date_made) {
      return res.status(400).json({
        success: false,
        error: 'Politician ID, promise, description, category, and date made are required'
      });
    }

    const query = `
      INSERT INTO commitments (
        politician_id, promise, description, category, context, date_made,
        status, progress_percentage, evidence, last_activity_date,
        source_links, verification_links, related_actions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      politician_id,
      promise,
      description,
      category,
      context || null,
      date_made,
      status || 'no_evidence',
      progress_percentage || 0,
      evidence || null,
      last_activity_date || null,
      source_links ? JSON.stringify(source_links) : null,
      verification_links ? JSON.stringify(verification_links) : null,
      related_actions ? JSON.stringify(related_actions) : null
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating commitment:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create commitment'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          politician_id,
          promise,
          category,
          status: status || 'no_evidence'
        },
        message: 'Commitment created successfully'
      });
    });
  });

  // Update commitment
  router.put('/api/admin/commitments/:id', auditLog('UPDATE', 'commitment'), (req, res) => {
    const { id } = req.params;
    const {
      promise,
      description,
      category,
      context,
      date_made,
      status,
      progress_percentage,
      evidence,
      last_activity_date,
      source_links,
      verification_links,
      related_actions
    } = req.body;

    const updates = [];
    const values = [];

    if (promise !== undefined) {
      updates.push('promise = ?');
      values.push(promise);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (context !== undefined) {
      updates.push('context = ?');
      values.push(context);
    }
    if (date_made !== undefined) {
      updates.push('date_made = ?');
      values.push(date_made);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (progress_percentage !== undefined) {
      updates.push('progress_percentage = ?');
      values.push(progress_percentage);
    }
    if (evidence !== undefined) {
      updates.push('evidence = ?');
      values.push(evidence);
    }
    if (last_activity_date !== undefined) {
      updates.push('last_activity_date = ?');
      values.push(last_activity_date);
    }
    if (source_links !== undefined) {
      updates.push('source_links = ?');
      values.push(JSON.stringify(source_links));
    }
    if (verification_links !== undefined) {
      updates.push('verification_links = ?');
      values.push(JSON.stringify(verification_links));
    }
    if (related_actions !== undefined) {
      updates.push('related_actions = ?');
      values.push(JSON.stringify(related_actions));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE commitments SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating commitment:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update commitment'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Commitment not found'
        });
      }

      res.json({
        success: true,
        message: 'Commitment updated successfully'
      });
    });
  });

  // Delete commitment
  router.delete('/api/admin/commitments/:id', auditLog('DELETE', 'commitment'), (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM commitments WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting commitment:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete commitment'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Commitment not found'
        });
      }

      res.json({
        success: true,
        message: 'Commitment deleted successfully'
      });
    });
  });

  // Update commitment progress
  router.patch('/api/admin/commitments/:id/progress', (req, res) => {
    const { id } = req.params;
    const { status, progress_percentage, evidence } = req.body;

    const query = `
      UPDATE commitments
      SET status = ?, progress_percentage = ?, evidence = ?, last_activity_date = CURDATE()
      WHERE id = ?
    `;

    db.query(query, [status, progress_percentage, evidence, id], (err, result) => {
      if (err) {
        console.error('Error updating commitment progress:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update commitment progress'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Commitment not found'
        });
      }

      res.json({
        success: true,
        message: 'Commitment progress updated successfully'
      });
    });
  });

  return router;
};
