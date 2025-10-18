const express = require('express');
const router = express.Router();
const { validateTimelineEvent } = require('./validation-middleware');
const { auditLog } = require('./audit-log-middleware');

module.exports = (db) => {
  // Get all timeline events (with optional politician filter)
  router.get('/api/admin/timeline-events', (req, res) => {
    const { politicianId } = req.query;

    let query = 'SELECT * FROM timeline_events';
    const params = [];

    if (politicianId) {
      query += ' WHERE politician_id = ?';
      params.push(politicianId);
    }

    query += ' ORDER BY event_date DESC';

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching timeline events:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch timeline events'
        });
      }

      // Parse JSON fields and map database fields to frontend format
      const events = results.map(event => ({
        id: event.id,
        politician_id: event.politician_id,
        title: event.title,
        description: event.description,
        date: event.event_date,
        type: event.event_type,
        source_links: event.source_links ?
          (typeof event.source_links === 'string' ? JSON.parse(event.source_links) : event.source_links) : [],
        verification_links: event.verification_links ?
          (typeof event.verification_links === 'string' ? JSON.parse(event.verification_links) : event.verification_links) : []
      }));

      res.json({
        success: true,
        data: events
      });
    });
  });

  // Get single timeline event by ID
  router.get('/api/admin/timeline-events/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM timeline_events WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching timeline event:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch timeline event'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Timeline event not found'
        });
      }

      const event = {
        id: results[0].id,
        politician_id: results[0].politician_id,
        title: results[0].title,
        description: results[0].description,
        date: results[0].event_date,
        type: results[0].event_type,
        source_links: results[0].source_links ?
          (typeof results[0].source_links === 'string' ? JSON.parse(results[0].source_links) : results[0].source_links) : [],
        verification_links: results[0].verification_links ?
          (typeof results[0].verification_links === 'string' ? JSON.parse(results[0].verification_links) : results[0].verification_links) : []
      };

      res.json({
        success: true,
        data: event
      });
    });
  });

  // Create new timeline event
  router.post('/api/admin/timeline-events', auditLog('CREATE', 'timeline_event'), validateTimelineEvent, (req, res) => {
    const {
      politician_id,
      title,
      description,
      date,
      type,
      source_links,
      verification_links
    } = req.body;

    // Validate required fields
    if (!politician_id || !title || !description || !date) {
      return res.status(400).json({
        success: false,
        error: 'Politician ID, title, description, and date are required'
      });
    }

    const query = `
      INSERT INTO timeline_events (
        politician_id, title, description, event_date, event_type,
        source_links, verification_links
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      politician_id,
      title,
      description,
      date,
      type || 'event',
      source_links ? JSON.stringify(source_links) : null,
      verification_links ? JSON.stringify(verification_links) : null
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating timeline event:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create timeline event'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          politician_id,
          title,
          type: type || 'event'
        },
        message: 'Timeline event created successfully'
      });
    });
  });

  // Update timeline event
  router.put('/api/admin/timeline-events/:id', auditLog('UPDATE', 'timeline_event'), (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      type,
      source_links,
      verification_links
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
    if (date !== undefined) {
      updates.push('event_date = ?');
      values.push(date);
    }
    if (type !== undefined) {
      updates.push('event_type = ?');
      values.push(type);
    }
    if (source_links !== undefined) {
      updates.push('source_links = ?');
      values.push(JSON.stringify(source_links));
    }
    if (verification_links !== undefined) {
      updates.push('verification_links = ?');
      values.push(JSON.stringify(verification_links));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE timeline_events SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating timeline event:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update timeline event'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Timeline event not found'
        });
      }

      res.json({
        success: true,
        message: 'Timeline event updated successfully'
      });
    });
  });

  // Delete timeline event
  router.delete('/api/admin/timeline-events/:id', auditLog('DELETE', 'timeline_event'), (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM timeline_events WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting timeline event:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete timeline event'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Timeline event not found'
        });
      }

      res.json({
        success: true,
        message: 'Timeline event deleted successfully'
      });
    });
  });

  return router;
};
