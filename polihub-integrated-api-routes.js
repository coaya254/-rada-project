// ============================================
// POLIHUB INTEGRATED API ROUTES
// Combines Politics, Civic Education, and Learning
// Shares database with RadaAppClean
// ============================================

const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // ============================================
  // POLITICIANS ENDPOINTS
  // ============================================

  // Get all politicians with filters
  router.get('/api/polihub/politicians', (req, res) => {
    const { party, chamber, state, status = 'active', search } = req.query;

    let query = `
      SELECT
        id, full_name, nickname, title, party, chamber, state, district,
        image_url, biography, date_of_birth, years_in_office,
        office_address, phone, email, website as website_url,
        twitter_handle, instagram_handle, facebook_url, wikipedia_url,
        status, rating, total_votes, created_at, updated_at
      FROM politicians
      WHERE 1=1
    `;
    const params = [];

    // Only filter by status if it's not 'all'
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (party) {
      query += ' AND party = ?';
      params.push(party);
    }

    if (chamber) {
      query += ' AND chamber = ?';
      params.push(chamber);
    }

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR nickname LIKE ? OR biography LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY full_name ASC';

    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching politicians:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch politicians' });
      }

      res.json({ success: true, data: results });
    });
  });

  // Get single politician with full details
  router.get('/api/polihub/politicians/:id', (req, res) => {
    const { id } = req.params;

    const politicianQuery = `
      SELECT * FROM politicians WHERE id = ?
    `;

    const committeesQuery = `
      SELECT * FROM politician_committees WHERE politician_id = ? ORDER BY start_date DESC
    `;

    const issuesQuery = `
      SELECT * FROM politician_key_issues WHERE politician_id = ? ORDER BY priority_level DESC
    `;

    const statsQuery = `
      SELECT * FROM politician_stats WHERE politician_id = ?
    `;

    const careerQuery = `
      SELECT * FROM politician_career WHERE politician_id = ?
    `;

    const documentsQuery = `
      SELECT * FROM politician_documents WHERE politician_id = ? ORDER BY date DESC
    `;

    const newsQuery = `
      SELECT * FROM politician_news WHERE politician_id = ? ORDER BY created_at DESC
    `;

    const timelineQuery = `
      SELECT * FROM politician_timeline WHERE politician_id = ? ORDER BY date DESC
    `;

    const commitmentsQuery = `
      SELECT * FROM politician_commitments WHERE politician_id = ? ORDER BY date_made DESC
    `;

    const votingRecordsQuery = `
  SELECT 
    id, politician_id, bill_title, bill_number, bill_description,
    significance, vote_date, category, vote_value as vote,
    reasoning, bill_status, session_name, source_links,
    verification_links, hansard_reference, created_at
  FROM voting_records
  WHERE politician_id = ? 
  ORDER BY vote_date DESC
`;

    const partyHistoryQuery = `
      SELECT * FROM politician_parties WHERE politician_id = ? ORDER BY start_date DESC
    `;

    const achievementsQuery = `
      SELECT * FROM politician_achievements WHERE politician_id = ? ORDER BY achievement_date DESC
    `;

    db.query(politicianQuery, [id], (error, politicians) => {
      if (error || politicians.length === 0) {
        return res.status(404).json({ success: false, error: 'Politician not found' });
      }

      const politician = politicians[0];

      // Fetch all related data in parallel
      Promise.all([
        new Promise((resolve) => db.query(committeesQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(issuesQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(statsQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(careerQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(documentsQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(newsQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(timelineQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(commitmentsQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(votingRecordsQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(partyHistoryQuery, [id], (err, results) => resolve(results || []))),
        new Promise((resolve) => db.query(achievementsQuery, [id], (err, results) => resolve(results || [])))
      ]).then(async ([committees, issues, stats, career, documents, news, timeline, commitments, votingRecords, partyHistory, achievements]) => {

        // Parse sources JSON for each document
        documents.forEach(doc => {
          try {
            doc.sources = doc.sources_json ? JSON.parse(doc.sources_json) : [];
          } catch (e) {
            doc.sources = [];
          }
        });

        // Parse sources JSON for each news item
        news.forEach(item => {
          try {
            item.sources = item.sources_json ? JSON.parse(item.sources_json) : [];
          } catch (e) {
            item.sources = [];
          }
        });

        // Parse sources JSON for timeline events
        timeline.forEach(event => {
          try {
            event.sources = event.sources_json ? JSON.parse(event.sources_json) : [];
          } catch (e) {
            event.sources = [];
          }
        });

        // Parse sources JSON for commitments
        commitments.forEach(commitment => {
          try {
            commitment.sources = commitment.sources_json ? JSON.parse(commitment.sources_json) : [];
          } catch (e) {
            commitment.sources = [];
          }
        });

        // Parse sources JSON for voting records
        votingRecords.forEach(vote => {
          try {
            vote.sources = vote.sources_json ? JSON.parse(vote.sources_json) : [];
          } catch (e) {
            vote.sources = [];
          }
        });

        // Parse sources JSON for party history
        partyHistory.forEach(party => {
          try {
            party.sources = party.sources_json ? JSON.parse(party.sources_json) : [];
          } catch (e) {
            party.sources = [];
          }
        });

        // Parse sources JSON for achievements
        achievements.forEach(achievement => {
          try {
            achievement.sources = achievement.sources_json ? JSON.parse(achievement.sources_json) : [];
          } catch (e) {
            achievement.sources = [];
          }
        });

        res.json({
          success: true,
          data: {
            ...politician,
            committees: committees,
            key_issues: issues,
            stats: stats[0] || { profile_views: 0, total_comments: 0 },
            career: career[0] || {},
            documents: documents,
            news: news,
            timeline: timeline,
            commitments: commitments,
            voting_records: votingRecords,
            party_history: partyHistory,
            achievements: achievements
          }
        });
      });
    });
  });

  // Update politician stats (views)
  router.post('/api/polihub/politicians/:id/view', (req, res) => {
    const { id } = req.params;

    const query = `
      INSERT INTO politician_stats (politician_id, profile_views, last_updated)
      VALUES (?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        profile_views = profile_views + 1,
        last_updated = NOW()
    `;

    db.query(query, [id], (error) => {
      if (error) {
        console.error('Error updating politician stats:', error);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    });
  });

  // Get voting records for a politician
  router.get('/api/polihub/politicians/:id/voting-records', (req, res) => {
    const { id } = req.params;
  
    const query = `
      SELECT 
        id, politician_id, bill_title, bill_number, bill_description,
        vote_date, category, vote_value as vote, reasoning,
        bill_status, session_name, created_at
      FROM voting_records
      WHERE politician_id = ? 
      ORDER BY vote_date DESC
    `;
  
    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error fetching voting records:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch voting records' });
      }
  
      res.json({ success: true, data: results });
    });
  });

  // Create or update politician with all related data (ADMIN ENHANCED)
  router.post('/api/polihub/politicians/enhanced', async (req, res) => {
    const {
      id,
      full_name,
      nickname,
      title,
      party,
      chamber,
      state,
      district,
      county,
      image_url,
      image_source,
      biography,
      date_of_birth,
      years_in_office,
      office_address,
      phone,
      email,
      website,
      twitter_handle,
      instagram_handle,
      facebook_url,
      wikipedia_url,
      status,
      constituency_representation,
      constituency_focus_areas,
      documents = [],
      news = [],
      timeline = [],
      commitments = [],
      voting_records = [],
      party_history = [],
      achievements = []
    } = req.body;

    if (!full_name || !party) {
      return res.status(400).json({ success: false, error: 'Full name and party are required' });
    }

    try {
      let politicianId = id;

      // Insert or update politician
      if (id) {
        // Update existing
        const updateQuery = `
          UPDATE politicians SET
            full_name = ?, name = ?, nickname = ?, title = ?, party = ?, chamber = ?,
            state = ?, district = ?, county = ?, image_url = ?, image_source = ?,
            biography = ?, date_of_birth = ?, years_in_office = ?, office_address = ?,
            phone = ?, email = ?, website = ?, twitter_handle = ?,
            instagram_handle = ?, facebook_url = ?, wikipedia_url = ?,
            constituency_representation = ?, constituency_focus_areas = ?,
            status = ?, updated_at = NOW()
          WHERE id = ?
        `;

        await new Promise((resolve, reject) => {
          db.query(
            updateQuery,
            [
              full_name, full_name, nickname, title, party, chamber, state, district, county || state,
              image_url, image_source || null, biography, date_of_birth, years_in_office,
              office_address, phone, email, website, twitter_handle,
              instagram_handle, facebook_url, wikipedia_url,
              constituency_representation, constituency_focus_areas,
              status || 'active', id
            ],
            (error) => error ? reject(error) : resolve()
          );
        });

        // Delete existing related data to replace with new
        await Promise.all([
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_documents WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_news WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_timeline WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_commitments WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM voting_records WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_parties WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          }),
          new Promise((resolve, reject) => {
            db.query('DELETE FROM politician_achievements WHERE politician_id = ?', [id], (e) => e ? reject(e) : resolve());
          })
        ]);
      } else {
        // Insert new politician
        const insertQuery = `
          INSERT INTO politicians (
            full_name, name, nickname, title, position, party, chamber, state, district, county,
            image_url, image_source, biography, date_of_birth, years_in_office,
            office_address, phone, email, website, twitter_handle,
            instagram_handle, facebook_url, wikipedia_url,
            constituency_representation, constituency_focus_areas,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const result = await new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [
              full_name, full_name, nickname, title, title, party, chamber, state, district, county || state,
              image_url, image_source || null, biography, date_of_birth, years_in_office,
              office_address, phone, email, website, twitter_handle,
              instagram_handle, facebook_url, wikipedia_url,
              constituency_representation || null, constituency_focus_areas || null,
              status || 'active'
            ],
            (error, result) => error ? reject(error) : resolve(result)
          );
        });

        politicianId = result.insertId;
      }

      // Insert documents
      if (documents.length > 0) {
        const docPromises = documents.map(doc => {
          return new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO politician_documents (
                politician_id, title, subtitle, icon, type, category, category_color, source,
                date, published_date, briefing, summary, description, details,
                image_url, thumbnail_url, file_url, document_url, pages, tags, source_links, sources_json, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
              [
                politicianId,
                doc.title,
                doc.subtitle || null,
                doc.icon || null,
                doc.type,
                doc.category || null,
                doc.category_color || null,
                doc.source || null,
                doc.date,
                doc.published_date || doc.date,
                doc.briefing || null,
                doc.summary || null,
                doc.description || null,
                doc.details ? JSON.stringify(doc.details) : null,
                doc.image_url || null,
                doc.thumbnail_url || null,
                doc.file_url || null,
                doc.document_url || null,
                doc.pages || null,
                doc.tags ? JSON.stringify(doc.tags) : null,
                doc.source_links ? JSON.stringify(doc.source_links) : null,
                doc.sources ? JSON.stringify(doc.sources) : null
              ],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(docPromises);
      }

      // Insert news
      if (news.length > 0) {
        const newsPromises = news.map(item => {
          return new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO politician_news (
                politician_id, title, content, icon, image_url,
                source, source_url, credibility, sources, date, url, status, sources_json, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
              [
                politicianId,
                item.title,
                item.content || null,
                item.icon || '📰',
                item.image_url || null,
                item.source || null,
                item.source_url || null,
                item.credibility || 'medium',
                item.sources ? JSON.stringify(item.sources) : null,
                item.date,
                item.url || null,
                item.status || 'published',
                item.sources ? JSON.stringify(item.sources) : null
              ],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(newsPromises);
      }

      // Insert timeline
      if (timeline.length > 0) {
        const timelinePromises = timeline.map(event => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO politician_timeline (politician_id, date, title, description, type, icon, image_url, category, source, source_url, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
              [politicianId, event.date, event.title, event.description, event.type, event.icon || '📅', event.image_url || null, event.category || null, event.source || null, event.source_url || null, event.sources ? JSON.stringify(event.sources) : null],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(timelinePromises);
      }

      // Insert commitments
      if (commitments.length > 0) {
        const commitmentPromises = commitments.map(commitment => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO politician_commitments (politician_id, title, description, status, category, custom_category, type, custom_type, date_made, deadline, progress, progress_percentage, icon, image_url, source, source_url, sources_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
              [politicianId, commitment.title, commitment.description, commitment.status, commitment.category || null, commitment.custom_category || null, commitment.type || null, commitment.custom_type || null, commitment.date_made, commitment.deadline, commitment.progress || 0, commitment.progress_percentage || commitment.progress || 0, commitment.icon || '🤝', commitment.image_url || null, commitment.source || null, commitment.source_url || null, commitment.sources ? JSON.stringify(commitment.sources) : null],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(commitmentPromises);
      }

      // Insert voting records
      if (voting_records.length > 0) {
        const votePromises = voting_records.map(vote => {
          return new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO voting_records (
                politician_id, bill_title, bill_number, bill_description,
                vote_date, category, vote_value, reasoning, session_name,
                icon, image_url, source_links, sources_json, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
              [
                politicianId,
                vote.bill_title,           // ✅ Changed from bill_name
                vote.bill_number || null,
                vote.bill_description,     // ✅ Changed from description
                vote.vote_date,
                vote.category || null,
                vote.vote_value,           // ✅ Changed from vote
                vote.reasoning || null,
                vote.session_name || null,
                vote.icon || '🗳️',
                vote.image_url || null,
                vote.source_links ? JSON.stringify(vote.source_links) : null,
                vote.sources ? JSON.stringify(vote.sources) : null
              ],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(votePromises);
      }

      // Insert party history
      if (party_history.length > 0) {
        const partyPromises = party_history.map(party => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO politician_parties (politician_id, party_name, start_date, end_date, analysis, is_current, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
              [politicianId, party.party_name, party.start_date || null, party.end_date || null, party.analysis || null, party.is_current || false, party.sources ? JSON.stringify(party.sources) : null],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(partyPromises);
      }

      // Insert achievements
      if (achievements.length > 0) {
        const achievementPromises = achievements.map(achievement => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO politician_achievements (politician_id, title, description, achievement_date, category, custom_category, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
              [politicianId, achievement.title, achievement.description || null, achievement.achievement_date || null, achievement.category || null, achievement.custom_category || null, achievement.sources ? JSON.stringify(achievement.sources) : null],
              (error, result) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        });
        await Promise.all(achievementPromises);
      }

      res.json({
        success: true,
        message: 'Politician and all related data saved successfully',
        politicianId: politicianId
      });

    } catch (error) {
      console.error('Error saving politician:', error);
      res.status(500).json({ success: false, error: 'Failed to save politician: ' + error.message });
    }
  });

  // Create or update politician (ADMIN - Simple version)
  router.post('/api/polihub/politicians', (req, res) => {
    const {
      id,
      full_name,
      nickname,
      title,
      party,
      chamber,
      state,
      district,
      county,
      image_url,
      image_source,
      biography,
      date_of_birth,
      years_in_office,
      office_address,
      phone,
      email,
      website,
      twitter_handle,
      instagram_handle,
      facebook_url,
      wikipedia_url,
      status
    } = req.body;

    if (!full_name || !party) {
      return res.status(400).json({ success: false, error: 'Full name and party are required' });
    }

    if (id) {
      // Update existing politician
      const query = `
        UPDATE politicians SET
          full_name = ?, name = ?, nickname = ?, title = ?, party = ?, chamber = ?,
          state = ?, district = ?, county = ?, image_url = ?, image_source = ?,
          biography = ?, date_of_birth = ?, years_in_office = ?, office_address = ?,
          phone = ?, email = ?, website = ?, twitter_handle = ?,
          instagram_handle = ?, facebook_url = ?, wikipedia_url = ?,
          status = ?, updated_at = NOW()
        WHERE id = ?
      `;

      db.query(
        query,
        [
          full_name, full_name, nickname, title, party, chamber, state, district, county || state,
          image_url, image_source || null, biography, date_of_birth, years_in_office,
          office_address, phone, email, website, twitter_handle,
          instagram_handle, facebook_url, wikipedia_url, status || 'active', id
        ],
        (error) => {
          if (error) {
            console.error('Error updating politician:', error);
            return res.status(500).json({ success: false, error: 'Failed to update politician' });
          }
          res.json({ success: true, message: 'Politician updated successfully', politicianId: id });
        }
      );
    } else {
      // Create new politician
      const query = `
        INSERT INTO politicians (
          full_name, name, nickname, title, position, party, chamber, state, district, county,
          image_url, image_source, biography, date_of_birth, years_in_office,
          office_address, phone, email, website, twitter_handle,
          instagram_handle, facebook_url, wikipedia_url, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      db.query(
        query,
        [
          full_name, full_name, nickname, title, title, party, chamber, state, district, county || state,
          image_url, image_source || null, biography, date_of_birth, years_in_office,
          office_address, phone, email, website, twitter_handle,
          instagram_handle, facebook_url, wikipedia_url, status || 'active'
        ],
        (error, result) => {
          if (error) {
            console.error('Error creating politician:', error);
            return res.status(500).json({ success: false, error: 'Failed to create politician' });
          }
          res.json({ success: true, message: 'Politician created successfully', politicianId: result.insertId });
        }
      );
    }
  });

  // ============================================
  // CIVIC EDUCATION ENDPOINTS
  // ============================================

  // Get all civic topics (legacy endpoint - maps to learning_modules)
  router.get('/api/polihub/civic-topics', (req, res) => {
    const { category, difficulty } = req.query;

    let query = `
      SELECT
        id, title, title as slug, description as subtitle, category, icon as icon_emoji,
        difficulty as difficulty_level, estimated_duration as read_time_minutes, 
        'beginner' as badge_type, '#3B82F6' as color_gradient, description as intro_text,
        0 as views_count, status = 'published' as published, created_at as published_at, created_at
      FROM learning_modules
      WHERE status = 'published'
    `;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC';

    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching civic topics:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch topics' });
      }

      res.json({ success: true, data: results });
    });
  });

  // Get single civic topic with sections (legacy - maps to module with lessons)
  router.get('/api/polihub/civic-topics/:slug', async (req, res) => {
    const { slug } = req.params;

    console.log('📖 Fetching topic:', slug);

    // If slug is numeric, treat as ID, otherwise search by title
    const isNumeric = /^\d+$/.test(slug);
    const query = isNumeric 
      ? 'SELECT * FROM learning_modules WHERE id = ? AND status = "published"'
      : 'SELECT * FROM learning_modules WHERE LOWER(REPLACE(title, " ", "-")) = ? AND status = "published"';
    
    const searchValue = isNumeric ? slug : slug.toLowerCase();

    db.query(query, [searchValue], (error, topics) => {
      if (error || topics.length === 0) {
        console.log('❌ Topic not found:', slug);
        return res.status(404).json({ success: false, error: 'Topic not found' });
      }

      const topic = topics[0];
      console.log('✅ Found topic:', topic.title);

      // Get lessons for this module (these become sections)
      db.query(
        'SELECT * FROM learning_lessons WHERE module_id = ? AND is_published = 1 ORDER BY display_order ASC, id ASC',
        [topic.id],
        (err, lessons) => {
          if (err) {
            console.error('❌ Error fetching lessons:', err);
            return res.json({
              success: true,
              data: { 
                ...topic, 
                sections: [],
                key_points: [],
                examples: []
              }
            });
          }

          console.log(`✅ Topic has ${lessons?.length || 0} lessons`);

          // Map lessons to sections format
          const sections = (lessons || []).map((lesson, index) => ({
            id: lesson.id,
            topic_id: topic.id,
            heading: lesson.title,
            content: lesson.description || '',
            order_index: lesson.display_order || index
          }));

          res.json({
            success: true,
            data: {
              ...topic,
              sections: sections,
              key_points: [],
              examples: []
            }
          });
        }
      );
    });
  });

  // Get all learning modules
  router.get('/api/polihub/civic-modules', async (req, res) => {
    try {
      const { category, difficulty, status = 'published' } = req.query;

      console.log('📚 Fetching civic modules with filters:', { category, difficulty, status });

      let query = `
        SELECT
          id, title, description, category, difficulty, icon,
          xp_reward, estimated_duration, status, is_featured,
          created_at, updated_at
        FROM learning_modules
        WHERE 1=1
      `;
      const params = [];

      // Only filter by status if it's not 'all'
      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (difficulty && difficulty !== 'all') {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }

      query += ' ORDER BY is_featured DESC, created_at DESC';

      db.query(query, params, async (error, modules) => {
        if (error) {
          console.error('❌ Error fetching civic modules:', error);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch civic modules' 
          });
        }

        console.log(`✅ Found ${modules.length} modules`);

        // For each module, get its lessons
        const modulesWithLessons = await Promise.all(
          modules.map(async (module) => {
            return new Promise((resolve) => {
              db.query(
                'SELECT * FROM learning_lessons WHERE module_id = ? AND is_published = 1 ORDER BY display_order ASC, id ASC',
                [module.id],
                (err, lessons) => {
                  if (err) {
                    console.error('❌ Error fetching lessons for module', module.id, err);
                    resolve({ ...module, lessons: [] });
                  } else {
                    console.log(`  ✅ Module "${module.title}" has ${lessons?.length || 0} lessons`);
                    resolve({ ...module, lessons: lessons || [] });
                  }
                }
              );
            });
          })
        );

        res.json({
          success: true,
          data: modulesWithLessons
        });
      });

    } catch (error) {
      console.error('❌ Error in civic-modules endpoint:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Get single learning module with lessons
  router.get('/api/polihub/civic-modules/:id', (req, res) => {
    const { id } = req.params;

    const moduleQuery = `SELECT * FROM learning_modules WHERE id = ?`;
    const lessonsQuery = `
      SELECT
        id, title, description, lesson_type, duration_minutes,
        xp_reward, content, display_order
      FROM learning_lessons
      WHERE module_id = ? AND is_published = 1
      ORDER BY display_order ASC, id ASC
    `;

    db.query(moduleQuery, [id], (error, modules) => {
      if (error || modules.length === 0) {
        return res.status(404).json({ success: false, error: 'Module not found' });
      }

      const module = modules[0];

      db.query(lessonsQuery, [id], (err, lessons) => {
        if (err) {
          console.error('Error fetching lessons:', err);
          return res.status(500).json({ success: false, error: 'Failed to fetch lessons' });
        }

        // Keep lesson content as-is (it's plain text, not JSON)
        const parsedLessons = lessons.map(lesson => ({
          ...lesson,
          content: lesson.content || ''
        }));

        res.json({
          success: true,
          data: {
            ...module,
            lessons: parsedLessons
          }
        });
      });
    });
  });

  // Create new learning module with lessons (ADMIN)
  router.post('/api/polihub/civic-modules', (req, res) => {
    const {
      title,
      description,
      category,
      difficulty,
      icon,
      color,
      estimated_duration,
      xp_reward,
      status,
      is_featured,
      lessons
    } = req.body;

    if (!title || !description || !lessons || lessons.length === 0) {
      return res.status(400).json({ success: false, error: 'Title, description, and at least one lesson required' });
    }

    const moduleQuery = `
      INSERT INTO learning_modules (
        title, description, category, difficulty, icon,
        xp_reward, estimated_duration, status, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(
      moduleQuery,
      [title, description, category, difficulty, icon, xp_reward, estimated_duration, status || 'draft', is_featured || false],
      (error, result) => {
        if (error) {
          console.error('Error creating module:', error);
          return res.status(500).json({ success: false, error: 'Failed to create module' });
        }

        const moduleId = result.insertId;

        // Insert lessons
        const lessonPromises = lessons.map((lesson, index) => {
          return new Promise((resolve, reject) => {
            const lessonQuery = `
              INSERT INTO lessons (
                module_id, title, description, lesson_type,
                duration_minutes, xp_reward, content, order_index,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            db.query(
              lessonQuery,
              [
                moduleId,
                lesson.title,
                lesson.description || '',
                lesson.lesson_type || 'text',
                lesson.duration_minutes || 10,
                lesson.xp_reward || 20,
                lesson.content || '{}',
                lesson.order_index !== undefined ? lesson.order_index : index
              ],
              (err, lessonResult) => {
                if (err) reject(err);
                else resolve(lessonResult);
              }
            );
          });
        });

        Promise.all(lessonPromises)
          .then(() => {
            res.json({
              success: true,
              message: 'Module created successfully',
              moduleId: moduleId
            });
          })
          .catch((err) => {
            console.error('Error creating lessons:', err);
            res.status(500).json({ success: false, error: 'Module created but lessons failed' });
          });
      }
    );
  });

  // Delete politician
  router.delete('/api/polihub/politicians/:id', (req, res) => {
    const { id } = req.params;

    // First delete all related records
    const deleteRelated = [
      'DELETE FROM politician_documents WHERE politician_id = ?',
      'DELETE FROM politician_news WHERE politician_id = ?',
      'DELETE FROM politician_timeline WHERE politician_id = ?',
      'DELETE FROM politician_commitments WHERE politician_id = ?',
      'DELETE FROM politician_voting_records WHERE politician_id = ?'
    ];

    Promise.all(
      deleteRelated.map(query =>
        new Promise((resolve, reject) => {
          db.query(query, [id], (error) => {
            if (error) reject(error);
            else resolve();
          });
        })
      )
    )
    .then(() => {
      // Now delete the politician
      db.query('DELETE FROM politicians WHERE id = ?', [id], (error, result) => {
        if (error) {
          console.error('Error deleting politician:', error);
          return res.status(500).json({ success: false, error: 'Failed to delete politician' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, error: 'Politician not found' });
        }

        res.json({ success: true, message: 'Politician deleted successfully' });
      });
    })
    .catch((error) => {
      console.error('Error deleting related records:', error);
      res.status(500).json({ success: false, error: 'Failed to delete related records' });
    });
  });

  // Update politician status (publish/unpublish)
  router.patch('/api/polihub/politicians/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'published', 'draft'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const query = 'UPDATE politicians SET status = ?, updated_at = NOW() WHERE id = ?';

    db.query(query, [status, id], (error, result) => {
      if (error) {
        console.error('Error updating politician status:', error);
        return res.status(500).json({ success: false, error: 'Failed to update status' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Politician not found' });
      }

      res.json({ success: true, message: 'Status updated successfully', status });
    });
  });

  // ============================================
  // BLOG/DISCOURSE ENDPOINTS
  // ============================================

  // ============================================
  // BLOG AUTHORS & FEATURED AUTHOR ENDPOINTS
  // Must be BEFORE /:slug route to avoid conflicts
  // ============================================

  // Get all blog authors (for admin)
  router.get('/api/polihub/blog/authors', (req, res) => {
    const query = `
      SELECT DISTINCT
        author as name,
        author_role as title,
        author_avatar_emoji as profile_image,
        COUNT(*) as article_count
      FROM blog_posts
      WHERE status = 'published' AND author IS NOT NULL
      GROUP BY author, author_role, author_avatar_emoji
      ORDER BY article_count DESC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching blog authors:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch authors' });
      }

      // Add bio and IDs
      const authorsWithIds = results.map((author, index) => ({
        id: index + 1,
        ...author,
        bio: `Experienced writer covering political topics and civic engagement.`
      }));

      res.json({ success: true, data: authorsWithIds });
    });
  });

  // Get featured author
  router.get('/api/polihub/blog/featured-author', (req, res) => {
    const query = `
      SELECT
        id, name, title, bio, profile_image
      FROM blog_featured_author
      WHERE id = 1
    `;

    db.query(query, (error, results) => {
      if (error || !results || results.length === 0) {
        // Return default featured author if none set
        return res.json({
          success: true,
          data: {
            id: 1,
            name: 'Sarah Chen',
            title: 'Policy Analyst',
            bio: 'Expert in infrastructure policy with 10+ years covering federal legislation and local impact.',
            profile_image: null
          }
        });
      }

      res.json({ success: true, data: results[0] });
    });
  });

  // Set featured author (ADMIN)
  router.post('/api/polihub/blog/featured-author', (req, res) => {
    const { author_id, name, title, bio } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Author name is required' });
    }

    const query = `
      INSERT INTO blog_featured_author (id, name, title, bio, updated_at)
      VALUES (1, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        title = VALUES(title),
        bio = VALUES(bio),
        updated_at = NOW()
    `;

    db.query(query, [name, title || 'Author', bio || 'Experienced writer covering political topics.'], (error) => {
      if (error) {
        console.error('Error setting featured author:', error);
        return res.status(500).json({ success: false, error: 'Failed to set featured author' });
      }

      res.json({
        success: true,
        message: 'Featured author updated successfully'
      });
    });
  });

  // Get all blog posts
  router.get('/api/polihub/blog', (req, res) => {
    const { category, status = 'published', limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT
        id, title, slug, excerpt, content, tags, featured_image_url, category,
        author, author_role, author_avatar_emoji,
        read_time, views_count, comments_count, status,
        published_at, created_at
      FROM blog_posts
    `;
    const params = [];
    const conditions = [];

    // Only filter by status if not 'all'
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching blog posts:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch posts' });
      }

      res.json({ success: true, data: results });
    });
  });

  // Get single blog post with full content
  router.get('/api/polihub/blog/:slug', (req, res) => {
    const { slug } = req.params;

    const postQuery = `
      SELECT bp.*, bc.intro_text, bc.conclusion_text
      FROM blog_posts bp
      LEFT JOIN blog_content bc ON bp.id = bc.post_id
      WHERE bp.slug = ? AND bp.status = 'published'
    `;

    db.query(postQuery, [slug], (error, posts) => {
      if (error || posts.length === 0) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const post = posts[0];

      // Get sections and paragraphs
      const sectionsQuery = `
        SELECT s.id, s.heading, s.order_index,
               GROUP_CONCAT(p.content ORDER BY p.order_index SEPARATOR '|||') as paragraphs
        FROM blog_sections s
        LEFT JOIN blog_paragraphs p ON s.id = p.section_id
        WHERE s.post_id = ?
        GROUP BY s.id
        ORDER BY s.order_index
      `;

      // Get tags
      const tagsQuery = `
        SELECT t.id, t.name, t.slug
        FROM blog_tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `;

      db.query(sectionsQuery, [post.id], (err1, sections) => {
        db.query(tagsQuery, [post.id], (err2, tags) => {

          // Parse paragraphs
          const parsedSections = sections.map(s => ({
            ...s,
            paragraphs: s.paragraphs ? s.paragraphs.split('|||') : []
          }));

          // Update views
          db.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [post.id]);

          res.json({
            success: true,
            data: {
              ...post,
              sections: parsedSections,
              tags: tags || []
            }
          });
        });
      });
    });
  });

  // Create a new blog post (ADMIN)
  router.post('/api/polihub/blog', (req, res) => {
    const {
      title,
      excerpt,
      content,
      category,
      author,
      author_role,
      image_url,
      read_time,
      tags,
      is_published
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content required' });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const uuid = require('crypto').randomUUID();

    const query = `
      INSERT INTO blog_posts (
        uuid, title, slug, excerpt, content, category,
        author, author_role, featured_image_url, read_time, tags,
        status, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const status = is_published ? 'published' : 'draft';

    db.query(query, [
      uuid,
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      author_role,
      image_url,
      read_time || '5 min read',
      tags,
      status
    ], (error, result) => {
      if (error) {
        console.error('Error creating blog post:', error);
        return res.status(500).json({ success: false, error: 'Failed to create post' });
      }

      res.json({
        success: true,
        message: 'Blog post created successfully',
        postId: result.insertId
      });
    });
  });


// ============================================
// BLOG AUTHORS & FEATURED AUTHOR ENDPOINTS
// ============================================

// Get all blog authors (for admin)
router.get('/api/polihub/blog/authors', (req, res) => {
  const query = `
    SELECT DISTINCT
      author as name,
      author_role as title,
      author_avatar_emoji as profile_image,
      COUNT(*) as article_count
    FROM blog_posts
    WHERE status = 'published' AND author IS NOT NULL
    GROUP BY author, author_role, author_avatar_emoji
    ORDER BY article_count DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching blog authors:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch authors' });
    }

    // Add bio and IDs
    const authorsWithIds = results.map((author, index) => ({
      id: index + 1,
      ...author,
      bio: `Experienced writer covering political topics and civic engagement.`
    }));

    res.json({ success: true, data: authorsWithIds });
  });
});

// Get featured author
router.get('/api/polihub/blog/featured-author', (req, res) => {
  const query = `
    SELECT
      id, name, title, bio, profile_image
    FROM blog_featured_author
    WHERE id = 1
  `;

  db.query(query, (error, results) => {
    if (error || !results || results.length === 0) {
      // Return default featured author if none set
      return res.json({
        success: true,
        data: {
          id: 1,
          name: 'Sarah Chen',
          title: 'Policy Analyst',
          bio: 'Expert in infrastructure policy with 10+ years covering federal legislation and local impact.',
          profile_image: null
        }
      });
    }

    res.json({ success: true, data: results[0] });
  });
});

// Set featured author (ADMIN)
router.post('/api/polihub/blog/featured-author', (req, res) => {
  const { author_id, name, title, bio } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Author name is required' });
  }

  const query = `
    INSERT INTO blog_featured_author (id, name, title, bio, updated_at)
    VALUES (1, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      title = VALUES(title),
      bio = VALUES(bio),
      updated_at = NOW()
  `;

  db.query(query, [name, title || 'Author', bio || 'Experienced writer covering political topics.'], (error) => {
    if (error) {
      console.error('Error setting featured author:', error);
      return res.status(500).json({ success: false, error: 'Failed to set featured author' });
    }

    res.json({
      success: true,
      message: 'Featured author updated successfully'
    });
  });
});

// ============================================
// ABOUT PAGE ENDPOINTS
// ============================================

// GET - Fetch About Page Data
router.get('/api/polihub/about-page', async (req, res) => {
  try {
    const query = 'SELECT * FROM about_page WHERE id = 1';
    
    db.query(query, (error, rows) => {
      if (error) {
        console.error('Error fetching about page:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch about page data'
        });
      }

      if (rows.length === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No data found, using defaults'
        });
      }

      // MySQL JSON columns are automatically parsed, no need for JSON.parse()
      const aboutData = {
        hero: typeof rows[0].hero_data === 'string' ? JSON.parse(rows[0].hero_data) : rows[0].hero_data,
        mission: typeof rows[0].mission_data === 'string' ? JSON.parse(rows[0].mission_data) : rows[0].mission_data,
        vision: typeof rows[0].vision_data === 'string' ? JSON.parse(rows[0].vision_data) : rows[0].vision_data,
        story: typeof rows[0].story_data === 'string' ? JSON.parse(rows[0].story_data) : rows[0].story_data,
        values: typeof rows[0].values_data === 'string' ? JSON.parse(rows[0].values_data) : rows[0].values_data,
        team: typeof rows[0].team_data === 'string' ? JSON.parse(rows[0].team_data) : rows[0].team_data,
        contact: typeof rows[0].contact_data === 'string' ? JSON.parse(rows[0].contact_data) : rows[0].contact_data,
        bannerImageUrl: rows[0].banner_image_url
      };

      res.json({
        success: true,
        data: aboutData
      });
    });
  } catch (error) {
    console.error('Error fetching about page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about page data'
    });
  }
});

// POST - Save/Update About Page Data
router.post('/api/polihub/about-page', async (req, res) => {
  try {
    const { hero, mission, vision, story, values, team, contact, bannerImageUrl } = req.body;

    // Validate required fields
    if (!hero || !mission || !vision) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if record exists
    db.query('SELECT id FROM about_page WHERE id = 1', (error, existing) => {
      if (error) {
        console.error('Error checking existing record:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to check existing data'
        });
      }

      if (existing.length === 0) {
        // Insert new record
        const insertQuery = `
          INSERT INTO about_page 
          (id, hero_data, mission_data, vision_data, story_data, values_data, team_data, contact_data, banner_image_url, updated_at) 
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        db.query(
          insertQuery,
          [
            JSON.stringify(hero),
            JSON.stringify(mission),
            JSON.stringify(vision),
            JSON.stringify(story),
            JSON.stringify(values),
            JSON.stringify(team),
            JSON.stringify(contact),
            bannerImageUrl || ''
          ],
          (error) => {
            if (error) {
              console.error('Error inserting about page:', error);
              return res.status(500).json({
                success: false,
                error: 'Failed to save about page data'
              });
            }
            res.json({
              success: true,
              message: 'About page saved successfully'
            });
          }
        );
      } else {
        // Update existing record
        const updateQuery = `
          UPDATE about_page 
          SET hero_data = ?, 
              mission_data = ?, 
              vision_data = ?, 
              story_data = ?, 
              values_data = ?, 
              team_data = ?, 
              contact_data = ?, 
              banner_image_url = ?, 
              updated_at = NOW() 
          WHERE id = 1
        `;

        db.query(
          updateQuery,
          [
            JSON.stringify(hero),
            JSON.stringify(mission),
            JSON.stringify(vision),
            JSON.stringify(story),
            JSON.stringify(values),
            JSON.stringify(team),
            JSON.stringify(contact),
            bannerImageUrl || ''
          ],
          (error) => {
            if (error) {
              console.error('Error updating about page:', error);
              return res.status(500).json({
                success: false,
                error: 'Failed to save about page data'
              });
            }
            res.json({
              success: true,
              message: 'About page saved successfully'
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error saving about page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save about page data'
    });
  }
});

  // ============================================
  // COMMENTS ENDPOINTS
  // ============================================

  // Get comments for a blog post
  router.get('/api/polihub/blog/:postId/comments', (req, res) => {
    const { postId } = req.params;

    const query = `
      SELECT
        id, post_id, parent_comment_id, pseudonym, content,
        status, created_at, approved_at
      FROM comments
      WHERE post_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `;

    db.query(query, [postId], (error, results) => {
      if (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch comments' });
      }

      // Organize into parent/child structure
      const commentMap = {};
      const rootComments = [];

      results.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
      });

      results.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap[comment.parent_comment_id];
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      res.json({ success: true, data: rootComments });
    });
  });

  // Post a new comment
  router.post('/api/polihub/blog/:postId/comments', (req, res) => {
    const { postId } = req.params;
    const { pseudonym, email, content, parent_comment_id } = req.body;

    if (!pseudonym || !content) {
      return res.status(400).json({ success: false, error: 'Pseudonym and content required' });
    }

    const ipHash = require('crypto')
      .createHash('sha256')
      .update(req.ip || 'unknown')
      .digest('hex');

    const query = `
      INSERT INTO comments (
        post_id, parent_comment_id, pseudonym, email, content,
        ip_address_hash, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(query, [postId, parent_comment_id || null, pseudonym, email || null, content, ipHash], (error, result) => {
      if (error) {
        console.error('Error posting comment:', error);
        return res.status(500).json({ success: false, error: 'Failed to post comment' });
      }

      res.json({
        success: true,
        message: 'Comment submitted for moderation',
        commentId: result.insertId
      });
    });
  });

  // ============================================
  // BILLS & VOTING RECORDS ENDPOINTS
  // ============================================

  // Get bills
  router.get('/api/polihub/bills', (req, res) => {
    const { status, chamber, search, limit = 20 } = req.query;

    let query = `
      SELECT
        b.id, b.bill_number, b.title, b.short_title, b.description,
        b.status, b.chamber, b.introduced_date, b.last_action_date,
        b.category, b.views_count,
        p.full_name as sponsor_name
      FROM bills b
      LEFT JOIN politicians p ON b.sponsor_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (chamber) {
      query += ' AND b.chamber = ?';
      params.push(chamber);
    }

    if (search) {
      query += ' AND (b.title LIKE ? OR b.bill_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY b.last_action_date DESC LIMIT ?';
    params.push(parseInt(limit));

    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching bills:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bills' });
      }

      res.json({ success: true, data: results });
    });
  });

  // Get bill details with votes
  router.get('/api/polihub/bills/:id', (req, res) => {
    const { id } = req.params;

    const billQuery = `
      SELECT b.*, p.full_name as sponsor_name, p.party as sponsor_party
      FROM bills b
      LEFT JOIN politicians p ON b.sponsor_id = p.id
      WHERE b.id = ?
    `;

    const votesQuery = `
      SELECT v.*, p.full_name, p.party, p.state
      FROM votes v
      JOIN politicians p ON v.politician_id = p.id
      WHERE v.bill_id = ?
      ORDER BY p.full_name
    `;

    const cosponsorsQuery = `
      SELECT p.full_name, p.party, bc.cosponsor_type, bc.date_cosponsored
      FROM bill_cosponsors bc
      JOIN politicians p ON bc.politician_id = p.id
      WHERE bc.bill_id = ?
      ORDER BY bc.date_cosponsored
    `;

    db.query(billQuery, [id], (error, bills) => {
      if (error || bills.length === 0) {
        return res.status(404).json({ success: false, error: 'Bill not found' });
      }

      const bill = bills[0];

      db.query(votesQuery, [id], (err1, votes) => {
        db.query(cosponsorsQuery, [id], (err2, cosponsors) => {

          // Calculate vote tallies
          const voteTally = {
            yea: votes.filter(v => v.vote_type === 'yea').length,
            nay: votes.filter(v => v.vote_type === 'nay').length,
            present: votes.filter(v => v.vote_type === 'present').length,
            not_voting: votes.filter(v => v.vote_type === 'not_voting').length
          };

          res.json({
            success: true,
            data: {
              ...bill,
              votes: votes || [],
              vote_tally: voteTally,
              cosponsors: cosponsors || []
            }
          });
        });
      });
    });
  });

  // ============================================
  // NEWSLETTER SUBSCRIPTION
  // ============================================

  router.post('/api/polihub/newsletter/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    const crypto = require('crypto');
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const ipHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex');

    const query = `
      INSERT INTO newsletter_subscribers (email, confirmation_token, ip_address_hash, subscribed_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE subscribed_at = NOW(), unsubscribed_at = NULL
    `;

    db.query(query, [email, confirmationToken, ipHash], (error) => {
      if (error) {
        console.error('Error subscribing to newsletter:', error);
        return res.status(500).json({ success: false, error: 'Failed to subscribe' });
      }

      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter'
      });
    });
  });

  // ============================================
  // SEARCH ENDPOINT
  // ============================================

  router.get('/api/polihub/search', (req, res) => {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, error: 'Search query too short' });
    }

    const searchTerm = `%${q}%`;
    const results = {};

    let completedQueries = 0;
    const totalQueries = (type === 'all' ? 3 : 1);

    function checkComplete() {
      completedQueries++;
      if (completedQueries === totalQueries) {
        // Log search
        db.query('INSERT INTO search_queries (query_text, search_type, results_count) VALUES (?, ?, ?)',
          [q, type, Object.values(results).reduce((sum, arr) => sum + arr.length, 0)]);

        res.json({ success: true, data: results });
      }
    }

    // Search politicians
    if (type === 'all' || type === 'politicians') {
      const politiciansQuery = `
        SELECT id, full_name, party, chamber, state, image_url, 'politician' as result_type
        FROM politicians
        WHERE (full_name LIKE ? OR nickname LIKE ?) AND status = 'active'
        LIMIT 5
      `;

      db.query(politiciansQuery, [searchTerm, searchTerm], (err, pols) => {
        results.politicians = pols || [];
        checkComplete();
      });
    } else {
      checkComplete();
    }

    // Search topics
    if (type === 'all' || type === 'topics') {
      const topicsQuery = `
        SELECT id, title, title as slug, category, icon as icon_emoji, 'topic' as result_type
        FROM learning_modules
        WHERE title LIKE ? AND status = 'published'
        LIMIT 5
      `;

      db.query(topicsQuery, [searchTerm], (err, topics) => {
        results.topics = topics || [];
        checkComplete();
      });
    } else {
      checkComplete();
    }

    // Search blog posts
    if (type === 'all' || type === 'posts') {
      const postsQuery = `
        SELECT id, title, slug, excerpt, category, 'post' as result_type
        FROM blog_posts
        WHERE (title LIKE ? OR excerpt LIKE ?) AND status = 'published'
        LIMIT 5
      `;

      db.query(postsQuery, [searchTerm, searchTerm], (err, posts) => {
        results.posts = posts || [];
        checkComplete();
      });
    } else {
      checkComplete();
    }
  });

  // ============================================
  // QUIZZES
  // ============================================

  // Get quizzes for a module
  router.get('/api/polihub/civic-modules/:moduleId/quizzes', async (req, res) => {
    try {
      const { moduleId } = req.params;

      const quizzesQuery = `
        SELECT
          q.id, q.title, q.description, q.quiz_type,
          q.passing_score, q.time_limit, q.xp_reward,
          COUNT(qq.id) as question_count
        FROM learning_quizzes q
        LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
        WHERE q.module_id = ? AND q.is_published = 1
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `;

      db.query(quizzesQuery, [moduleId], (err, quizzes) => {
        if (err) {
          console.error('Error fetching quizzes:', err);
          return res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
        }

        res.json({ success: true, data: quizzes });
      });
    } catch (error) {
      console.error('Error in quizzes endpoint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Get quiz with questions
  router.get('/api/polihub/quizzes/:quizId', async (req, res) => {
    try {
      const { quizId } = req.params;

      // Get quiz details
      const quizQuery = `SELECT * FROM learning_quizzes WHERE id = ? AND is_published = 1`;

      db.query(quizQuery, [quizId], (err, quizzes) => {
        if (err || !quizzes || quizzes.length === 0) {
          return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const quiz = quizzes[0];

        // Get questions for this quiz
        const questionsQuery = `
          SELECT id, question_text, options, correct_answer_index, explanation, points, display_order
          FROM learning_quiz_questions
          WHERE quiz_id = ?
          ORDER BY display_order ASC, id ASC
        `;

        db.query(questionsQuery, [quizId], (qErr, questions) => {
          if (qErr) {
            console.error('Error fetching questions:', qErr);
            return res.status(500).json({ success: false, error: 'Failed to fetch questions' });
          }

          // Parse options JSON for each question
          const parsedQuestions = questions.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
          }));

          res.json({
            success: true,
            data: {
              ...quiz,
              questions: parsedQuestions
            }
          });
        });
      });
    } catch (error) {
      console.error('Error in quiz detail endpoint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // ============================================
  // TRENDING TOPICS ENDPOINTS
  // ============================================

  // Get all trending topics
  router.get('/api/polihub/trending', (req, res) => {
    const query = `
      SELECT id, emoji, text, display_order, is_active
      FROM trending_topics
      WHERE is_active = 1
      ORDER BY display_order ASC, id ASC
      LIMIT 10
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching trending topics:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch trending topics' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get all trending topics (including inactive - for admin)
  router.get('/api/polihub/trending/all', (req, res) => {
    const query = `
      SELECT id, emoji, text, display_order, is_active, created_at, updated_at
      FROM trending_topics
      ORDER BY display_order ASC, id ASC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching all trending topics:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch trending topics' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Create trending topic
  router.post('/api/polihub/trending', (req, res) => {
    const { emoji, text, display_order = 0, is_active = 1 } = req.body;

    if (!emoji || !text) {
      return res.status(400).json({ success: false, error: 'Emoji and text are required' });
    }

    const query = `
      INSERT INTO trending_topics (emoji, text, display_order, is_active)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [emoji, text, display_order, is_active], (error, results) => {
      if (error) {
        console.error('Error creating trending topic:', error);
        return res.status(500).json({ success: false, error: 'Failed to create trending topic' });
      }

      res.json({
        success: true,
        data: { id: results.insertId, emoji, text, display_order, is_active }
      });
    });
  });

  // Update trending topic
  router.put('/api/polihub/trending/:id', (req, res) => {
    const { id } = req.params;
    const { emoji, text, display_order, is_active } = req.body;

    const query = `
      UPDATE trending_topics
      SET emoji = ?, text = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;

    db.query(query, [emoji, text, display_order, is_active, id], (error, results) => {
      if (error) {
        console.error('Error updating trending topic:', error);
        return res.status(500).json({ success: false, error: 'Failed to update trending topic' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Trending topic not found' });
      }

      res.json({ success: true });
    });
  });

  // Delete trending topic
  router.delete('/api/polihub/trending/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM trending_topics WHERE id = ?';

    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error deleting trending topic:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete trending topic' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Trending topic not found' });
      }

      res.json({ success: true });
    });
  });

  // ============================================
  // LEARNING PATHS ENDPOINTS
  // ============================================

  // Get all learning paths
  router.get('/api/polihub/learning-paths', (req, res) => {
    const query = `
      SELECT
        lp.id, lp.title, lp.description, lp.difficulty_level,
        lp.estimated_duration, lp.is_published, lp.created_at,
        COUNT(lpm.module_id) as module_count
      FROM learning_paths lp
      LEFT JOIN learning_path_modules lpm ON lp.id = lpm.path_id
      GROUP BY lp.id
      ORDER BY lp.display_order ASC, lp.id DESC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching learning paths:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch learning paths' });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Get single learning path with modules
  router.get('/api/polihub/learning-paths/:id', (req, res) => {
    const { id } = req.params;

    const pathQuery = `SELECT * FROM learning_paths WHERE id = ?`;

    db.query(pathQuery, [id], (error, pathResults) => {
      if (error) {
        console.error('Error fetching learning path:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch learning path' });
      }

      if (pathResults.length === 0) {
        return res.status(404).json({ success: false, error: 'Learning path not found' });
      }

      const modulesQuery = `
        SELECT lm.*, lpm.display_order as path_order
        FROM learning_path_modules lpm
        JOIN learning_modules lm ON lpm.module_id = lm.id
        WHERE lpm.path_id = ?
        ORDER BY lpm.display_order ASC
      `;

      db.query(modulesQuery, [id], (error, moduleResults) => {
        if (error) {
          console.error('Error fetching path modules:', error);
          return res.status(500).json({ success: false, error: 'Failed to fetch path modules' });
        }

        res.json({
          success: true,
          data: {
            ...pathResults[0],
            modules: moduleResults
          }
        });
      });
    });
  });

  // Create learning path
  router.post('/api/polihub/learning-paths', (req, res) => {
    const { title, description, difficulty_level, estimated_duration, is_published, modules } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const insertPathQuery = `
      INSERT INTO learning_paths (title, description, difficulty_level, estimated_duration, is_published)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertPathQuery, [title, description, difficulty_level, estimated_duration, is_published || 0], (error, results) => {
      if (error) {
        console.error('Error creating learning path:', error);
        return res.status(500).json({ success: false, error: 'Failed to create learning path' });
      }

      const pathId = results.insertId;

      // Add modules to path if provided
      if (modules && modules.length > 0) {
        const moduleValues = modules.map((moduleId, index) => [pathId, moduleId, index]);
        const insertModulesQuery = `INSERT INTO learning_path_modules (path_id, module_id, display_order) VALUES ?`;

        db.query(insertModulesQuery, [moduleValues], (error) => {
          if (error) {
            console.error('Error adding modules to path:', error);
            return res.status(500).json({ success: false, error: 'Path created but failed to add modules' });
          }

          res.json({
            success: true,
            data: { id: pathId }
          });
        });
      } else {
        res.json({
          success: true,
          data: { id: pathId }
        });
      }
    });
  });

  // Update learning path
  router.put('/api/polihub/learning-paths/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty_level, estimated_duration, is_published, modules } = req.body;

    const updateQuery = `
      UPDATE learning_paths
      SET title = ?, description = ?, difficulty_level = ?, estimated_duration = ?, is_published = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [title, description, difficulty_level, estimated_duration, is_published, id], (error) => {
      if (error) {
        console.error('Error updating learning path:', error);
        return res.status(500).json({ success: false, error: 'Failed to update learning path' });
      }

      // Update modules if provided
      if (modules) {
        // Delete existing modules
        db.query('DELETE FROM learning_path_modules WHERE path_id = ?', [id], (error) => {
          if (error) {
            console.error('Error removing old modules:', error);
            return res.status(500).json({ success: false, error: 'Failed to update modules' });
          }

          // Add new modules
          if (modules.length > 0) {
            const moduleValues = modules.map((moduleId, index) => [id, moduleId, index]);
            db.query('INSERT INTO learning_path_modules (path_id, module_id, display_order) VALUES ?', [moduleValues], (error) => {
              if (error) {
                console.error('Error adding new modules:', error);
                return res.status(500).json({ success: false, error: 'Failed to add modules' });
              }

              res.json({ success: true });
            });
          } else {
            res.json({ success: true });
          }
        });
      } else {
        res.json({ success: true });
      }
    });
  });

  // Delete learning path
  router.delete('/api/polihub/learning-paths/:id', (req, res) => {
    const { id } = req.params;

    // Delete path modules first
    db.query('DELETE FROM learning_path_modules WHERE path_id = ?', [id], (error) => {
      if (error) {
        console.error('Error deleting path modules:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete path modules' });
      }

      // Delete the path
      db.query('DELETE FROM learning_paths WHERE id = ?', [id], (error, results) => {
        if (error) {
          console.error('Error deleting learning path:', error);
          return res.status(500).json({ success: false, error: 'Failed to delete learning path' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, error: 'Learning path not found' });
        }

        res.json({ success: true });
      });
    });
  });

  // ============================================
  // SOURCES ENDPOINTS
  // ============================================

  // Get all sources
  router.get('/api/polihub/sources', (req, res) => {
    const query = `
      SELECT id, name, default_url, color, created_at
      FROM sources
      ORDER BY name ASC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching sources:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch sources' });
      }

      res.json({ success: true, data: results });
    });
  });

  // ============================================
  // RETURN THE ROUTER
  // ============================================
  return router;
};

