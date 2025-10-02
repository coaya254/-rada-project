// Politics API Routes for Rada App
// Handles all politician-related endpoints

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get all politicians (exclude drafts for public view)
  router.get('/api/politicians', (req, res) => {
    const query = `
      SELECT id, name, party, position, image_url as imageUrl,
             bio, rating, total_votes as totalVotes,
             created_at as createdAt, updated_at as updatedAt
      FROM politicians
      WHERE is_draft = 0 OR is_draft IS NULL
      ORDER BY name ASC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching politicians:', error);
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
  router.get('/api/politicians/:id', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, name, party, position, image_url as imageUrl,
             bio, rating, total_votes as totalVotes,
             created_at as createdAt, updated_at as updatedAt
      FROM politicians
      WHERE id = ?
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching politician:', error);
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

  // Get politician documents
  router.get('/api/politicians/:id/documents', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, title, type, date, description,
             file_url as fileUrl, created_at as createdAt
      FROM politician_documents
      WHERE politician_id = ?
      ORDER BY date DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching documents:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch documents'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get politician timeline
  router.get('/api/politicians/:id/timeline', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, date, title, description, type, created_at as createdAt
      FROM politician_timeline
      WHERE politician_id = ?
      ORDER BY date DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching timeline:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch timeline'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get politician commitments/promises
  router.get('/api/politicians/:id/commitments', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, title, description, status, category,
             date_made as dateMade, deadline, progress,
             created_at as createdAt, updated_at as updatedAt
      FROM politician_commitments
      WHERE politician_id = ?
      ORDER BY date_made DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching commitments:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch commitments'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get politician voting records
  router.get('/api/politicians/:id/voting-records', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, bill_name as billName, vote, date,
             category, description, created_at as createdAt
      FROM politician_voting_records
      WHERE politician_id = ?
      ORDER BY date DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching voting records:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch voting records'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get politician career information
  router.get('/api/politicians/:id/career', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, education, previous_positions as previousPositions,
             achievements, controversies,
             created_at as createdAt, updated_at as updatedAt
      FROM politician_career
      WHERE politician_id = ?
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching career:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch career information'
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          data: null
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  });

  // Get politician news
  router.get('/api/politicians/:id/news', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT n.id,
             n.title as headline,
             n.description as summary,
             n.source,
             n.url as link,
             n.published_date as source_publication_date,
             n.created_at as system_addition_date,
             n.image_url as imageUrl,
             n.category,
             n.is_external as isExternal,
             CASE
               WHEN n.is_external = 1 THEN 'high'
               ELSE 'maximum'
             END as credibility
      FROM news n
      INNER JOIN politician_news pn ON n.id = pn.news_id
      WHERE pn.politician_id = ?
      ORDER BY n.published_date DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching politician news:', error);
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

  // Get latest news (all politicians)
  router.get('/api/news/latest', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT id,
             title as headline,
             description as summary,
             source,
             url as link,
             published_date as source_publication_date,
             created_at as system_addition_date,
             image_url as imageUrl,
             category,
             is_external as isExternal,
             CASE
               WHEN is_external = 1 THEN 'high'
               ELSE 'maximum'
             END as credibility
      FROM news
      WHERE is_external = FALSE
      ORDER BY published_date DESC
      LIMIT ?
    `;

    db.query(query, [limit], (error, results) => {
      if (error) {
        console.error('Error fetching latest news:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch latest news'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get external news by source
  router.get('/api/news/external/:source', (req, res) => {
    const { source } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT id, title, description, source,
             image_url as imageUrl, url,
             published_date as publishedDate, category,
             is_external as isExternal, created_at as createdAt
      FROM news
      WHERE is_external = TRUE AND source = ?
      ORDER BY published_date DESC
      LIMIT ?
    `;

    db.query(query, [source, limit], (error, results) => {
      if (error) {
        console.error('Error fetching external news:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch external news'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get all external news
  router.get('/api/news/external', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT id, title, description, source,
             image_url as imageUrl, url,
             published_date as publishedDate, category,
             is_external as isExternal, created_at as createdAt
      FROM news
      WHERE is_external = TRUE
      ORDER BY published_date DESC
      LIMIT ?
    `;

    db.query(query, [limit], (error, results) => {
      if (error) {
        console.error('Error fetching external news:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch external news'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  return router;
};
