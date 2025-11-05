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
             years_in_office, age, constituency, current_position,
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
      SELECT id, politician_id, title, subtitle, icon, type, category, category_color,
             date, published_date, description, briefing, summary, details, pages,
             image_url, thumbnail_url, document_url, file_url, source_links, tags,
             created_at
      FROM politician_documents
      WHERE politician_id = ?
      ORDER BY published_date DESC, date DESC, created_at DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching documents:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch documents'
        });
      }

      // Parse JSON fields
      const processedResults = results.map(doc => {
        let details = doc.details;
        let tags = doc.tags;
        let source_links = doc.source_links;

        // Parse details (JSON array)
        if (typeof details === 'string') {
          try {
            details = JSON.parse(details);
          } catch (e) {
            details = [];
          }
        }

        // Parse tags (JSON array)
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch (e) {
            tags = [];
          }
        }

        // Parse source_links (JSON object)
        if (typeof source_links === 'string') {
          try {
            source_links = JSON.parse(source_links);
          } catch (e) {
            source_links = null;
          }
        }

        return {
          ...doc,
          details,
          tags,
          source_links
        };
      });

      res.json({
        success: true,
        data: processedResults
      });
    });
  });

  // Get politician timeline
  router.get('/api/politicians/:id/timeline', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, politician_id, date, title, description, type, category,
             summary, source, source_url, source_links, tags, icon,
             created_at
      FROM politician_timeline
      WHERE politician_id = ?
      ORDER BY date DESC, created_at DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching timeline:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch timeline'
        });
      }

      // Parse JSON fields
      const timeline = results.map(t => {
        let source_links = t.source_links;
        let tags = t.tags;

        if (typeof source_links === 'string') {
          try { source_links = JSON.parse(source_links); } catch (e) { source_links = null; }
        }
        if (typeof tags === 'string') {
          try { tags = JSON.parse(tags); } catch (e) { tags = []; }
        }

        return { ...t, source_links, tags };
      });

      res.json({
        success: true,
        data: timeline
      });
    });
  });

  // Get politician commitments/promises
  router.get('/api/politicians/:id/commitments', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, politician_id, title, description, summary, status, category,
             date_made, deadline, progress, progress_percentage,
             evidence_text, evidence_url, source_links, tags,
             created_at, updated_at
      FROM politician_commitments
      WHERE politician_id = ?
      ORDER BY date_made DESC, created_at DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching commitments:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch commitments'
        });
      }

      // Parse JSON fields
      const commitments = results.map(c => {
        let source_links = c.source_links;
        let tags = c.tags;

        if (typeof source_links === 'string') {
          try { source_links = JSON.parse(source_links); } catch (e) { source_links = null; }
        }
        if (typeof tags === 'string') {
          try { tags = JSON.parse(tags); } catch (e) { tags = []; }
        }

        return { ...c, source_links, tags };
      });

      res.json({
        success: true,
        data: commitments
      });
    });
  });

  // Get politician voting records
  router.get('/api/politicians/:id/voting-records', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, politician_id, bill_name, vote, vote_date, category, description,
             bill_number, legislative_session, bill_status, vote_result,
             notes, bill_url, source_url, source_links, tags,
             created_at
      FROM politician_voting_records
      WHERE politician_id = ?
      ORDER BY vote_date DESC, created_at DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching voting records:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch voting records'
        });
      }

      // Parse JSON fields and process results
      const processedResults = results.map(record => {
        let source_links = record.source_links;
        let tags = record.tags;

        // Parse JSON strings if needed
        if (typeof source_links === 'string') {
          try {
            source_links = JSON.parse(source_links);
          } catch (e) {
            console.error('Error parsing source_links:', e);
            source_links = null;
          }
        }

        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch (e) {
            console.error('Error parsing tags:', e);
            tags = [];
          }
        }

        return {
          ...record,
          source_links,
          tags,
          date: record.vote_date // Add date alias for backward compatibility
        };
      });

      res.json({
        success: true,
        data: processedResults
      });
    });
  });

  // Alias for backward compatibility
  router.get('/api/politicians/:id/voting', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, politician_id, bill_name, vote, vote_date, category, description,
             bill_number, legislative_session, bill_status, vote_result,
             notes, bill_url, source_url, source_links, tags,
             created_at
      FROM politician_voting_records
      WHERE politician_id = ?
      ORDER BY vote_date DESC, created_at DESC
    `;

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching voting records:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch voting records'
        });
      }

      // Parse JSON fields and process results
      const processedResults = results.map(record => {
        let source_links = record.source_links;
        let tags = record.tags;

        // Parse JSON strings if needed
        if (typeof source_links === 'string') {
          try {
            source_links = JSON.parse(source_links);
          } catch (e) {
            console.error('Error parsing source_links:', e);
            source_links = null;
          }
        }

        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch (e) {
            console.error('Error parsing tags:', e);
            tags = [];
          }
        }

        return {
          ...record,
          source_links,
          tags,
          date: record.vote_date // Add date alias for backward compatibility
        };
      });

      res.json({
        success: true,
        data: processedResults
      });
    });
  });

  // Get politician career information
  router.get('/api/politicians/:id/career', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT id, name, party, position, current_position, title,
             bio, education, wikipedia_summary,
             party_history, key_achievements, constituency,
             image_url as imageUrl, party_color,
             years_in_office, age, email, phone, website, social_media_twitter,
             education_sources, achievements_sources, position_sources,
             created_at as createdAt, updated_at as updatedAt
      FROM politicians
      WHERE id = ?
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

      // Parse JSON fields
      const career = {
        ...results[0],
        party_history: results[0].party_history ?
          (typeof results[0].party_history === 'string' ? JSON.parse(results[0].party_history) : results[0].party_history) : [],
        key_achievements: results[0].key_achievements ?
          (typeof results[0].key_achievements === 'string' ? JSON.parse(results[0].key_achievements) : results[0].key_achievements) : [],
        education_sources: results[0].education_sources ?
          (typeof results[0].education_sources === 'string' ? JSON.parse(results[0].education_sources) : results[0].education_sources) : [],
        achievements_sources: results[0].achievements_sources ?
          (typeof results[0].achievements_sources === 'string' ? JSON.parse(results[0].achievements_sources) : results[0].achievements_sources) : [],
        position_sources: results[0].position_sources ?
          (typeof results[0].position_sources === 'string' ? JSON.parse(results[0].position_sources) : results[0].position_sources) : []
      };

      res.json({
        success: true,
        data: career
      });
    });
  });

  // Get politician news
  router.get('/api/politicians/:id/news', (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT n.id,
             n.title as headline,
             n.title,
             n.description as summary,
             n.description,
             n.source,
             n.url as link,
             n.url,
             n.published_date as source_publication_date,
             n.published_date,
             n.created_at as system_addition_date,
             n.created_at,
             n.image_url as imageUrl,
             n.image_url,
             n.category,
             n.is_external as isExternal,
             n.credibility,
             n.source_links
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

      // Parse source_links JSON field
      const processedResults = results.map(news => {
        let sourceLinks = news.source_links;

        // Parse source_links if it's a string
        if (typeof sourceLinks === 'string') {
          try {
            sourceLinks = JSON.parse(sourceLinks);
          } catch (e) {
            console.error('Error parsing source_links:', e);
            sourceLinks = null;
          }
        }

        // Convert source_links object to array format for easier use
        let sources = [];
        if (sourceLinks && typeof sourceLinks === 'object') {
          sources = Object.entries(sourceLinks).map(([name, url]) => ({
            name,
            url
          }));
        } else if (news.source && news.url) {
          // Fallback to single source if no source_links
          sources = [{ name: news.source, url: news.url }];
        }

        return {
          ...news,
          source_links: sourceLinks,
          sources: sources,
          credibility: news.credibility || 'medium'
        };
      });

      res.json({
        success: true,
        data: processedResults
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
             'high' as credibility
      FROM news
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

  // Compare multiple politicians
  router.post('/api/politicians/compare', (req, res) => {
    const { politicianIds } = req.body;

    if (!politicianIds || !Array.isArray(politicianIds) || politicianIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 2 politician IDs to compare'
      });
    }

    const placeholders = politicianIds.map(() => '?').join(',');

    // Get politician details
    const politicianQuery = `
      SELECT
        id, name, party, position, current_position, image_url as imageUrl,
        bio, slug, wikipedia_summary,
        YEAR(CURDATE()) - YEAR(COALESCE(career_start_date, created_at)) as years
      FROM politicians
      WHERE id IN (${placeholders})
    `;

    db.query(politicianQuery, politicianIds, (err1, politicians) => {
      if (err1) {
        console.error('Error fetching politicians for comparison:', err1);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch politicians'
        });
      }

      // Get voting stats for each politician
      const votingQuery = `
        SELECT
          politician_id,
          COUNT(*) as totalVotes,
          SUM(CASE WHEN vote = 'Yes' OR vote = 'For' THEN 1 ELSE 0 END) as votesFor,
          SUM(CASE WHEN vote = 'No' OR vote = 'Against' THEN 1 ELSE 0 END) as votesAgainst,
          SUM(CASE WHEN vote = 'Abstain' OR vote = 'Abstained' THEN 1 ELSE 0 END) as abstentions,
          SUM(CASE WHEN role = 'Sponsor' OR role = 'Co-Sponsor' THEN 1 ELSE 0 END) as billsSponsored,
          AVG(CASE WHEN attendance_status = 'Present' THEN 100 ELSE 0 END) as attendance
        FROM voting_records
        WHERE politician_id IN (${placeholders})
        GROUP BY politician_id
      `;

      db.query(votingQuery, politicianIds, (err2, votingStats) => {
        if (err2) {
          console.error('Error fetching voting stats:', err2);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch voting statistics'
          });
        }

        // Get commitment/promise stats
        const commitmentQuery = `
          SELECT
            politician_id,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' OR status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled,
            SUM(CASE WHEN status = 'in_progress' OR status = 'early_progress' OR status = 'significant_progress' THEN 1 ELSE 0 END) as inProgress,
            SUM(CASE WHEN status = 'broken' OR status = 'stalled' THEN 1 ELSE 0 END) as broken
          FROM commitments
          WHERE politician_id IN (${placeholders})
          GROUP BY politician_id
        `;

        db.query(commitmentQuery, politicianIds, (err3, commitmentStats) => {
          if (err3) {
            console.error('Error fetching commitment stats:', err3);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch commitment statistics'
            });
          }

          // Get key achievements from timeline
          const achievementQuery = `
            SELECT
              politician_id,
              title,
              event_date,
              event_type
            FROM timeline_events
            WHERE politician_id IN (${placeholders})
              AND event_type IN ('achievement', 'position')
            ORDER BY politician_id, event_date DESC
          `;

          db.query(achievementQuery, politicianIds, (err4, achievements) => {
            if (err4) {
              console.error('Error fetching achievements:', err4);
              return res.status(500).json({
                success: false,
                error: 'Failed to fetch achievements'
              });
            }

            // Combine all data
            const comparisonData = politicians.map(politician => {
              const voting = votingStats.find(v => v.politician_id === politician.id) || {
                totalVotes: 0,
                votesFor: 0,
                votesAgainst: 0,
                abstentions: 0,
                billsSponsored: 0,
                attendance: 0
              };

              const promises = commitmentStats.find(c => c.politician_id === politician.id) || {
                total: 0,
                fulfilled: 0,
                inProgress: 0,
                broken: 0
              };

              const keyAchievements = achievements
                .filter(a => a.politician_id === politician.id)
                .slice(0, 5)
                .map(a => a.title);

              // Calculate ratings (simple algorithm based on available data)
              const fulfillmentRate = promises.total > 0 ? (promises.fulfilled / promises.total) * 100 : 0;
              const votingParticipation = voting.totalVotes > 0 ? ((voting.votesFor + voting.votesAgainst) / voting.totalVotes) * 100 : 0;

              const transparency = Math.min(5, (fulfillmentRate / 20) + (voting.billsSponsored / 5));
              const effectiveness = Math.min(5, (fulfillmentRate / 20) + (keyAchievements.length / 2));
              const accessibility = Math.min(5, (voting.attendance || 0) / 20);
              const overall = (transparency + effectiveness + accessibility) / 3;

              return {
                ...politician,
                years: politician.years || 0,
                attendance: Math.round(voting.attendance || 0),
                votesFor: voting.votesFor || 0,
                votesAgainst: voting.votesAgainst || 0,
                abstentions: voting.abstentions || 0,
                billsSponsored: voting.billsSponsored || 0,
                promises: {
                  total: promises.total || 0,
                  fulfilled: promises.fulfilled || 0,
                  inProgress: promises.inProgress || 0,
                  broken: promises.broken || 0
                },
                ratings: {
                  overall: Math.round(overall * 10) / 10,
                  transparency: Math.round(transparency * 10) / 10,
                  effectiveness: Math.round(effectiveness * 10) / 10,
                  accessibility: Math.round(accessibility * 10) / 10
                },
                keyAchievements
              };
            });

            res.json({
              success: true,
              data: comparisonData
            });
          });
        });
      });
    });
  });

  return router;
};
