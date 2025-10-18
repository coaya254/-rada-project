const express = require('express');
const router = express.Router();
const { validatePolitician } = require('./validation-middleware');
const { auditLog } = require('./audit-log-middleware');

module.exports = (db) => {
  // Search politicians (must be before /:id route)
  router.get('/api/admin/politicians/search', (req, res) => {
    const { q = '', include_drafts = 'true' } = req.query;

    let query;
    let params;

    if (!q || q.trim() === '') {
      // Return all politicians when search is empty
      query = `
        SELECT
          p.id,
          p.name,
          p.position as title,
          p.position as current_position,
          p.party,
          p.bio,
          p.image_url,
          p.is_draft,
          CASE
            WHEN p.is_draft = 1 THEN 'draft'
            ELSE 'published'
          END as status,
          '' as constituency,
          COALESCE(COUNT(DISTINCT t.id), 0) as total_timeline_events,
          COALESCE(COUNT(DISTINCT c.id), 0) as total_commitments,
          COALESCE(
            ROUND(
              (SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) /
              NULLIF(COUNT(c.id), 0)) * 100
            ), 0
          ) as completion_score,
          DATE_FORMAT(p.updated_at, '%Y-%m-%d') as last_updated
        FROM politicians p
        LEFT JOIN timeline_events t ON p.id = t.politician_id
        LEFT JOIN commitments c ON p.id = c.politician_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 100
      `;
      params = [];
    } else {
      // Search with filter
      const searchTerm = `%${q}%`;
      query = `
        SELECT
          p.id,
          p.name,
          p.position as title,
          p.position as current_position,
          p.party,
          p.bio,
          p.image_url,
          p.is_draft,
          CASE
            WHEN p.is_draft = 1 THEN 'draft'
            ELSE 'published'
          END as status,
          '' as constituency,
          COALESCE(COUNT(DISTINCT t.id), 0) as total_timeline_events,
          COALESCE(COUNT(DISTINCT c.id), 0) as total_commitments,
          COALESCE(
            ROUND(
              (SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) /
              NULLIF(COUNT(c.id), 0)) * 100
            ), 0
          ) as completion_score,
          DATE_FORMAT(p.updated_at, '%Y-%m-%d') as last_updated
        FROM politicians p
        LEFT JOIN timeline_events t ON p.id = t.politician_id
        LEFT JOIN commitments c ON p.id = c.politician_id
        WHERE p.name LIKE ? OR p.party LIKE ? OR p.position LIKE ?
        GROUP BY p.id
        ORDER BY p.name ASC
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

  // Bulk operations (must be before /:id route)
  router.post('/api/admin/politicians/bulk-delete', (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM politicians WHERE id IN (${placeholders})`;

    db.query(query, ids, (err, result) => {
      if (err) {
        console.error('Error bulk deleting politicians:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete politicians'
        });
      }

      res.json({
        success: true,
        data: { deleted: result.affectedRows },
        message: `Successfully deleted ${result.affectedRows} politician(s)`
      });
    });
  });

  router.post('/api/admin/politicians/bulk-update', (req, res) => {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required'
      });
    }

    let completed = 0;
    let errors = [];

    updates.forEach((update, index) => {
      const { id, data } = update;

      const updateFields = [];
      const values = [];

      Object.entries(data).forEach(([key, value]) => {
        updateFields.push(`${key} = ?`);
        values.push(value);
      });

      if (updateFields.length === 0) {
        completed++;
        return;
      }

      values.push(id);
      const query = `UPDATE politicians SET ${updateFields.join(', ')} WHERE id = ?`;

      db.query(query, values, (err, result) => {
        if (err) {
          errors.push({ id, error: err.message });
        } else {
          completed++;
        }

        if (completed + errors.length === updates.length) {
          res.json({
            success: true,
            data: {
              updated: completed,
              errors: errors.length > 0 ? errors : undefined
            },
            message: `Successfully updated ${completed} politician(s)`
          });
        }
      });
    });
  });

  // Create new politician
  router.post('/api/admin/politicians', auditLog('CREATE', 'politician'), validatePolitician, (req, res) => {
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
  router.put('/api/admin/politicians/:id', auditLog('UPDATE', 'politician'), (req, res) => {
    const { id } = req.params;
    const {
      name,
      party,
      position,
      bio,
      image_url,
      constituency,
      education,
      party_history,
      key_achievements,
      wikipedia_summary,
      current_position,
      title,
      slug,
      party_color,
      years_in_office,
      age,
      email,
      phone,
      website,
      social_media_twitter,
      education_sources,
      achievements_sources,
      position_sources
    } = req.body;

    console.log('UPDATE politician request - ID:', id);
    console.log('Constituency value received:', constituency);
    console.log('Full request body:', req.body);

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
    if (constituency !== undefined) {
      updateFields.push('constituency = ?');
      values.push(constituency);
    }
    if (education !== undefined) {
      updateFields.push('education = ?');
      values.push(education);
    }
    if (party_history !== undefined) {
      updateFields.push('party_history = ?');
      values.push(JSON.stringify(party_history));
    }
    if (key_achievements !== undefined) {
      updateFields.push('key_achievements = ?');
      values.push(JSON.stringify(key_achievements));
    }
    if (wikipedia_summary !== undefined) {
      updateFields.push('wikipedia_summary = ?');
      values.push(wikipedia_summary);
    }
    if (current_position !== undefined) {
      updateFields.push('current_position = ?');
      values.push(current_position);
    }
    if (title !== undefined) {
      updateFields.push('title = ?');
      values.push(title);
    }
    if (slug !== undefined) {
      updateFields.push('slug = ?');
      values.push(slug);
    }
    if (party_color !== undefined) {
      updateFields.push('party_color = ?');
      values.push(party_color);
    }
    if (years_in_office !== undefined) {
      updateFields.push('years_in_office = ?');
      values.push(years_in_office);
    }
    if (age !== undefined) {
      updateFields.push('age = ?');
      values.push(age);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      values.push(website);
    }
    if (social_media_twitter !== undefined) {
      updateFields.push('social_media_twitter = ?');
      values.push(social_media_twitter);
    }
    if (education_sources !== undefined) {
      updateFields.push('education_sources = ?');
      values.push(JSON.stringify(education_sources));
    }
    if (achievements_sources !== undefined) {
      updateFields.push('achievements_sources = ?');
      values.push(JSON.stringify(achievements_sources));
    }
    if (position_sources !== undefined) {
      updateFields.push('position_sources = ?');
      values.push(JSON.stringify(position_sources));
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
  router.delete('/api/admin/politicians/:id', auditLog('DELETE', 'politician'), (req, res) => {
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

      console.log('GET politician - ID:', id);
      console.log('Constituency from DB:', results[0].constituency);
      console.log('Education from DB:', results[0].education);
      console.log('Party history from DB:', results[0].party_history);

      res.json({
        success: true,
        data: results[0]
      });
    });
  });

  // Publish politician (set is_draft to false)
  router.post('/api/admin/politicians/:id/publish', auditLog('PUBLISH', 'politician'), (req, res) => {
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

  // Unpublish politician (set is_draft to true)
  router.post('/api/admin/politicians/:id/unpublish', auditLog('UNPUBLISH', 'politician'), (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE politicians SET is_draft = 1 WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error unpublishing politician:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to unpublish politician'
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
        message: 'Politician moved to draft successfully'
      });
    });
  });

  // Get admin statistics
  router.get('/api/admin/statistics', (req, res) => {
    // Count total politicians
    const totalPoliticiansQuery = 'SELECT COUNT(*) as count FROM politicians';

    // Count draft entries
    const draftEntriesQuery = 'SELECT COUNT(*) as count FROM politicians WHERE is_draft = 1';

    // Count published politicians
    const publishedQuery = 'SELECT COUNT(*) as count FROM politicians WHERE is_draft = 0 OR is_draft IS NULL';

    db.query(totalPoliticiansQuery, (err1, totalResult) => {
      if (err1) {
        console.error('Error counting total politicians:', err1);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch statistics'
        });
      }

      db.query(draftEntriesQuery, (err2, draftResult) => {
        if (err2) {
          console.error('Error counting draft entries:', err2);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
          });
        }

        db.query(publishedQuery, (err3, publishedResult) => {
          if (err3) {
            console.error('Error counting published:', err3);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch statistics'
            });
          }

          res.json({
            success: true,
            data: {
              totalPoliticians: totalResult[0].count,
              pendingReviews: 0, // TODO: Implement review system
              draftEntries: draftResult[0].count,
              publishedPoliticians: publishedResult[0].count,
              totalTimelineEvents: 0, // TODO: Implement when timeline_events table exists
              totalCommitments: 0, // TODO: Implement when commitments table exists
              totalVotingRecords: 0, // TODO: Implement when voting_records table exists
            }
          });
        });
      });
    });
  });

  return router;
};
