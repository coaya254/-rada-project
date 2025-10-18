const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get all news (with optional filters)
  router.get('/api/admin/news', (req, res) => {
    const { category, isExternal, search } = req.query;

    let query = `
      SELECT id,
             title,
             title as headline,
             description,
             description as summary,
             source,
             url,
             url as link,
             published_date,
             published_date as source_publication_date,
             created_at,
             created_at as system_addition_date,
             image_url,
             image_url as imageUrl,
             category,
             is_external,
             is_external as isExternal,
             'high' as credibility
      FROM news WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (isExternal !== undefined && isExternal !== 'all') {
      query += ' AND is_external = ?';
      params.push(isExternal === 'true' ? 1 : 0);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR source LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY published_date DESC';

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching news:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch news'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get single news by ID
  router.get('/api/admin/news/:id', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id,
             title,
             title as headline,
             description,
             description as summary,
             source,
             url,
             url as link,
             published_date,
             published_date as source_publication_date,
             created_at,
             created_at as system_addition_date,
             image_url,
             image_url as imageUrl,
             category,
             is_external,
             is_external as isExternal,
             'high' as credibility
      FROM news WHERE id = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching news:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch news'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'News not found'
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  });

  // Create new news article
  router.post('/api/admin/news', (req, res) => {
    const {
      title,
      description,
      source,
      url,
      published_date,
      image_url,
      category,
      is_external
    } = req.body;

    // Validate required fields
    if (!title || !description || !source || !published_date) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, source, and published date are required'
      });
    }

    const query = `
      INSERT INTO news (
        title, description, source, url, published_date,
        image_url, category, is_external
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      description,
      source,
      url || null,
      published_date,
      image_url || null,
      category || 'General',
      true  // All news is external
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating news:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create news'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          title,
          source,
          category: category || 'General'
        },
        message: 'News created successfully'
      });
    });
  });

  // Update news article
  router.put('/api/admin/news/:id', (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      source,
      url,
      published_date,
      image_url,
      category,
      is_external
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
    if (source !== undefined) {
      updates.push('source = ?');
      values.push(source);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (published_date !== undefined) {
      updates.push('published_date = ?');
      values.push(published_date);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (is_external !== undefined) {
      updates.push('is_external = ?');
      values.push(is_external);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE news SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating news:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update news'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'News not found'
        });
      }

      res.json({
        success: true,
        message: 'News updated successfully'
      });
    });
  });

  // Delete news article
  router.delete('/api/admin/news/:id', (req, res) => {
    const { id } = req.params;

    // First, delete all politician links
    db.query('DELETE FROM politician_news WHERE news_id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting politician links:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete news'
        });
      }

      // Then delete the news article
      db.query('DELETE FROM news WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('Error deleting news:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to delete news'
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            error: 'News not found'
          });
        }

        res.json({
          success: true,
          message: 'News deleted successfully'
        });
      });
    });
  });

  // Get politicians linked to a news article
  router.get('/api/admin/news/:id/politicians', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT p.id, p.name, p.party, p.position, p.image_url
      FROM politicians p
      INNER JOIN politician_news pn ON p.id = pn.politician_id
      WHERE pn.news_id = ?
      ORDER BY p.name
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching linked politicians:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch linked politicians'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Link news to politician
  router.post('/api/admin/news/:newsId/link/:politicianId', (req, res) => {
    const { newsId, politicianId } = req.params;

    // Check if link already exists
    db.query(
      'SELECT * FROM politician_news WHERE news_id = ? AND politician_id = ?',
      [newsId, politicianId],
      (err, results) => {
        if (err) {
          console.error('Error checking link:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to link news to politician'
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'News is already linked to this politician'
          });
        }

        // Create the link
        db.query(
          'INSERT INTO politician_news (politician_id, news_id) VALUES (?, ?)',
          [politicianId, newsId],
          (err) => {
            if (err) {
              console.error('Error linking news:', err);
              return res.status(500).json({
                success: false,
                error: 'Failed to link news to politician'
              });
            }

            res.status(201).json({
              success: true,
              message: 'News linked to politician successfully'
            });
          }
        );
      }
    );
  });

  // Unlink news from politician
  router.delete('/api/admin/news/:newsId/unlink/:politicianId', (req, res) => {
    const { newsId, politicianId } = req.params;

    db.query(
      'DELETE FROM politician_news WHERE news_id = ? AND politician_id = ?',
      [newsId, politicianId],
      (err, result) => {
        if (err) {
          console.error('Error unlinking news:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to unlink news from politician'
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            error: 'Link not found'
          });
        }

        res.json({
          success: true,
          message: 'News unlinked from politician successfully'
        });
      }
    );
  });

  return router;
};
