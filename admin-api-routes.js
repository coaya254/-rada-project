const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Create new politician
  router.post('/api/admin/politicians', (req, res) => {
    const {
      name,
      party,
      position,
      bio,
      image_url,
      is_draft = false
    } = req.body;

    // Validate required fields
    if (!name || !party || !position) {
      return res.status(400).json({
        success: false,
        error: 'Name, party, and position are required fields'
      });
    }

    // Check if politician already exists
    const checkQuery = 'SELECT id, name FROM politicians WHERE LOWER(name) = LOWER(?)';

    db.query(checkQuery, [name], (err, results) => {
      if (err) {
        console.error('Error checking for duplicate:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          error: `A politician named "${results[0].name}" already exists in the database.`
        });
      }

      // Politician doesn't exist, proceed with creation
      const insertQuery = `
        INSERT INTO politicians (
          name, party, position, bio, image_url, is_draft
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [name, party, position, bio, image_url, is_draft ? 1 : 0],
        (err, result) => {
          if (err) {
            console.error('Error creating politician:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to create politician'
            });
          }

          res.status(201).json({
            success: true,
            data: {
              id: result.insertId,
              name,
              party,
              position,
              bio,
              image_url
            },
            message: `Politician ${is_draft ? 'saved as draft' : 'published'} successfully`
          });
        }
      );
    });
  });

  // Update existing politician
  router.put('/api/admin/politicians/:id', (req, res) => {
    const { id } = req.params;
    const {
      name,
      party,
      position,
      bio,
      image_url
    } = req.body;

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (party !== undefined) {
      updateFields.push('party = ?');
      values.push(party);
    }
    if (position !== undefined) {
      updateFields.push('position = ?');
      values.push(position);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      values.push(bio);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      values.push(image_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE politicians SET ${updateFields.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating politician:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update politician'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Politician not found'
        });
      }

      res.json({
        success: true,
        message: 'Politician updated successfully'
      });
    });
  });

  // Delete politician
  router.delete('/api/admin/politicians/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM politicians WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting politician:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete politician'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Politician not found'
        });
      }

      res.json({
        success: true,
        message: 'Politician deleted successfully'
      });
    });
  });

  // Search politicians
  router.get('/api/admin/politicians/search', (req, res) => {
    const { q = '' } = req.query;

    let query;
    let params;

    if (!q || q.trim() === '') {
      // Return all politicians when search is empty
      query = `
        SELECT * FROM politicians
        ORDER BY created_at DESC
        LIMIT 100
      `;
      params = [];
    } else {
      // Search with filter
      const searchTerm = `%${q}%`;
      query = `
        SELECT * FROM politicians
        WHERE name LIKE ? OR party LIKE ? OR position LIKE ?
        ORDER BY name ASC
        LIMIT 50
      `;
      params = [searchTerm, searchTerm, searchTerm];
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error searching politicians:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to search politicians'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get all politicians (including drafts for admin)
  router.get('/api/admin/politicians', (req, res) => {
    const { include_drafts = 'true' } = req.query;

    let query = 'SELECT * FROM politicians';

    if (include_drafts === 'false') {
      query += ' WHERE is_draft = 0';
    }

    query += ' ORDER BY created_at DESC';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching politicians:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch politicians'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get single politician by ID
  router.get('/api/admin/politicians/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM politicians WHERE id = ?';

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching politician:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch politician'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Politician not found'
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  });

  // Publish politician (set is_draft to false)
  router.post('/api/admin/politicians/:id/publish', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE politicians SET is_draft = 0 WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error publishing politician:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to publish politician'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Politician not found'
        });
      }

      res.json({
        success: true,
        message: 'Politician published successfully'
      });
    });
  });

  return router;
};
