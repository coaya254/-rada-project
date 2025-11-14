const express = require('express');
const router = express.Router();
const { auditLog } = require('./audit-log-middleware');

module.exports = (db) => {
  // Get all commitments (with optional politician filter)
  router.get('/api/admin/commitments', (req, res) => {
    const { politicianId, status, category } = req.query;

    let query = 'SELECT * FROM politician_commitments WHERE 1=1';
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
        tags: c.tags ? (typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags) : []
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

    db.query('SELECT * FROM politician_commitments WHERE id = ?', [id], (err, results) => {
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
        tags: results[0].tags ? JSON.parse(results[0].tags) : []
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
      title,
      description,
      summary,
      category,
      date_made,
      deadline,
      status,
      progress_percentage,
      evidence_text,
      evidence_url,
      source_links,
      tags
    } = req.body;

    // Validate required fields
    if (!politician_id || !title || !description || !category || !date_made) {
      return res.status(400).json({
        success: false,
        error: 'Politician ID, title, description, category, and date made are required'
      });
    }

    const query = `
      INSERT INTO politician_commitments (
        politician_id, title, description, summary, category, date_made,
        deadline, status, progress_percentage, evidence_text, evidence_url,
        source_links, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      politician_id,
      title,
      description,
      summary || null,
      category,
      date_made,
      deadline || null,
      status || 'pending',
      progress_percentage || 0,
      evidence_text || null,
      evidence_url || null,
      source_links ? JSON.stringify(source_links) : null,
      tags ? JSON.stringify(tags) : null
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
          title,
          category,
          status: status || 'pending'
        },
        message: 'Commitment created successfully'
      });
    });
  });

  // Update commitment
  router.put('/api/admin/commitments/:id', auditLog('UPDATE', 'commitment'), (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      summary,
      category,
      date_made,
      deadline,
      status,
      progress_percentage,
      evidence_text,
      evidence_url,
      source_links,
      tags
    } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (summary !== undefined) {
      updates.push('summary = ?');
      values.push(summary);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (date_made !== undefined) {
      updates.push('date_made = ?');
      values.push(date_made);
    }
    if (deadline !== undefined) {
      updates.push('deadline = ?');
      values.push(deadline);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (progress_percentage !== undefined) {
      updates.push('progress_percentage = ?');
      values.push(progress_percentage);
    }
    if (evidence_text !== undefined) {
      updates.push('evidence_text = ?');
      values.push(evidence_text);
    }
    if (evidence_url !== undefined) {
      updates.push('evidence_url = ?');
      values.push(evidence_url);
    }
    if (source_links !== undefined) {
      updates.push('source_links = ?');
      values.push(JSON.stringify(source_links));
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(tags));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE politician_commitments SET ${updates.join(', ')} WHERE id = ?`;

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

    db.query('DELETE FROM politician_commitments WHERE id = ?', [id], (err, result) => {
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
    const { status, progress_percentage, evidence_text } = req.body;

    const query = `
      UPDATE politician_commitments
      SET status = ?, progress_percentage = ?, evidence_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(query, [status, progress_percentage, evidence_text, id], (err, result) => {
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
