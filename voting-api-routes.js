const express = require('express');
const router = express.Router();
const { auditLog } = require('./audit-log-middleware');

module.exports = (db) => {
  // Bulk import voting records (must be before /:id route)
  router.post('/api/admin/voting-records/bulk-import', auditLog('BULK_IMPORT', 'voting_record'), (req, res) => {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Records array is required'
      });
    }

    let imported = 0;
    let errors = [];

    const sendResponse = () => {
      res.json({
        success: true,
        data: {
          imported,
          errors: errors.length > 0 ? errors : undefined
        },
        message: `Successfully imported ${imported} voting record(s)`
      });
    };

    records.forEach((record, index) => {
      const {
        politician_id,
        bill_title,
        bill_number,
        bill_description,
        significance,
        vote_date,
        category,
        vote_value,
        reasoning,
        bill_status,
        bill_passed,
        vote_count_for,
        vote_count_against,
        vote_count_abstain,
        total_votes,
        session_name,
        source_links,
        verification_links,
        hansard_reference
      } = record;

      // Validate required fields
      if (!politician_id || !bill_title || !bill_number || !vote_date || !vote_value) {
        errors.push({ index, error: 'Missing required fields' });
        if (imported + errors.length === records.length) {
          sendResponse();
        }
        return;
      }

      const query = `
        INSERT INTO voting_records (
          politician_id, bill_title, bill_number, bill_description, significance,
          vote_date, category, vote_value, reasoning, bill_status, bill_passed,
          vote_count_for, vote_count_against, vote_count_abstain, total_votes,
          session_name, source_links, verification_links, hansard_reference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [
          politician_id, bill_title, bill_number, bill_description || null, significance || 'medium',
          vote_date, category || 'General', vote_value, reasoning || null, bill_status || null,
          bill_passed !== undefined ? (bill_passed ? 1 : 0) : null,
          vote_count_for || null, vote_count_against || null, vote_count_abstain || null,
          total_votes || null, session_name || null,
          source_links ? JSON.stringify(source_links) : null,
          verification_links ? JSON.stringify(verification_links) : null,
          hansard_reference || null
        ],
        (err, result) => {
          if (err) {
            errors.push({ index, error: err.message });
          } else {
            imported++;
          }

          if (imported + errors.length === records.length) {
            sendResponse();
          }
        }
      );
    });
  });

  // Get all voting records (with optional politician filter)
  router.get('/api/admin/voting-records', (req, res) => {
    const { politicianId } = req.query;

    let query = 'SELECT * FROM voting_records';
    const params = [];

    if (politicianId) {
      query += ' WHERE politician_id = ?';
      params.push(politicianId);
    }

    query += ' ORDER BY vote_date DESC';

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching voting records:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch voting records'
        });
      }

      // Convert database ENUM values to frontend format
      const dbToFrontendVote = {
        'yes': 'for',
        'no': 'against',
        'abstain': 'abstain',
        'absent': 'absent'
      };

      // Parse JSON fields and map database fields to frontend format
      const records = results.map(record => ({
        id: record.id,
        politician_id: record.politician_id,
        bill_title: record.bill_title,
        bill_number: record.bill_number,
        bill_description: record.bill_description,
        significance: record.significance,
        vote_date: record.vote_date,
        category: record.category,
        vote_value: dbToFrontendVote[record.vote_value] || record.vote_value,
        reasoning: record.reasoning,
        bill_status: record.bill_status,
        bill_passed: record.bill_passed,
        vote_count_for: record.vote_count_for,
        vote_count_against: record.vote_count_against,
        vote_count_abstain: record.vote_count_abstain,
        total_votes: record.total_votes,
        session_name: record.session_name,
        source_links: record.source_links ?
          (typeof record.source_links === 'string' ? JSON.parse(record.source_links) : record.source_links) : [],
        verification_links: record.verification_links ?
          (typeof record.verification_links === 'string' ? JSON.parse(record.verification_links) : record.verification_links) : [],
        hansard_reference: record.hansard_reference
      }));

      res.json({
        success: true,
        data: records
      });
    });
  });

  // Get single voting record by ID
  router.get('/api/admin/voting-records/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM voting_records WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching voting record:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch voting record'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Voting record not found'
        });
      }

      // Convert database ENUM values to frontend format
      const dbToFrontendVote = {
        'yes': 'for',
        'no': 'against',
        'abstain': 'abstain',
        'absent': 'absent'
      };

      const record = {
        id: results[0].id,
        politician_id: results[0].politician_id,
        bill_title: results[0].bill_title,
        bill_number: results[0].bill_number,
        bill_description: results[0].bill_description,
        significance: results[0].significance,
        vote_date: results[0].vote_date,
        category: results[0].category,
        vote_value: dbToFrontendVote[results[0].vote_value] || results[0].vote_value,
        reasoning: results[0].reasoning,
        bill_status: results[0].bill_status,
        bill_passed: results[0].bill_passed,
        vote_count_for: results[0].vote_count_for,
        vote_count_against: results[0].vote_count_against,
        vote_count_abstain: results[0].vote_count_abstain,
        total_votes: results[0].total_votes,
        session_name: results[0].session_name,
        source_links: results[0].source_links ?
          (typeof results[0].source_links === 'string' ? JSON.parse(results[0].source_links) : results[0].source_links) : [],
        verification_links: results[0].verification_links ?
          (typeof results[0].verification_links === 'string' ? JSON.parse(results[0].verification_links) : results[0].verification_links) : [],
        hansard_reference: results[0].hansard_reference
      };

      res.json({
        success: true,
        data: record
      });
    });
  });

  // Create new voting record
  router.post('/api/admin/voting-records', auditLog('CREATE', 'voting_record'), (req, res) => {
    const {
      politician_id,
      bill_title,
      bill_number,
      bill_description,
      significance,
      vote_date,
      category,
      vote_value,
      reasoning,
      bill_status,
      bill_passed,
      vote_count_for,
      vote_count_against,
      vote_count_abstain,
      total_votes,
      session_name,
      source_links,
      verification_links,
      hansard_reference
    } = req.body;

    // Validate required fields
    if (!politician_id || !bill_title || !bill_number || !vote_date || !vote_value) {
      return res.status(400).json({
        success: false,
        error: 'Politician ID, bill title, bill number, vote date, and vote value are required'
      });
    }

    // Convert frontend vote values to database ENUM values
    const voteValueMap = {
      'for': 'yes',
      'against': 'no',
      'abstain': 'abstain',
      'absent': 'absent',
      // Also accept database values directly
      'yes': 'yes',
      'no': 'no'
    };

    const mappedVoteValue = voteValueMap[vote_value.toLowerCase()] || vote_value;

    const query = `
      INSERT INTO voting_records (
        politician_id, bill_title, bill_number, bill_description, significance, vote_date,
        category, vote_value, reasoning, bill_status, bill_passed, vote_count_for,
        vote_count_against, vote_count_abstain, total_votes, session_name,
        source_links, verification_links, hansard_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      politician_id,
      bill_title,
      bill_number,
      bill_description || '',
      significance || null,
      vote_date,
      category || 'Other',
      mappedVoteValue,
      reasoning || null,
      bill_status || 'Proposed',
      bill_passed !== undefined ? bill_passed : null,
      vote_count_for || 0,
      vote_count_against || 0,
      vote_count_abstain || 0,
      total_votes || 0,
      session_name || '',
      source_links ? JSON.stringify(source_links) : null,
      verification_links ? JSON.stringify(verification_links) : null,
      hansard_reference || null
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating voting record:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create voting record'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          politician_id,
          bill_title,
          vote_value
        },
        message: 'Voting record created successfully'
      });
    });
  });

  // Update voting record
  router.put('/api/admin/voting-records/:id', auditLog('UPDATE', 'voting_record'), (req, res) => {
    const { id } = req.params;
    const {
      bill_title,
      bill_number,
      bill_description,
      significance,
      vote_date,
      category,
      vote_value,
      reasoning,
      bill_status,
      bill_passed,
      vote_count_for,
      vote_count_against,
      vote_count_abstain,
      total_votes,
      session_name,
      source_links,
      verification_links,
      hansard_reference
    } = req.body;

    const updates = [];
    const values = [];

    if (bill_title !== undefined) {
      updates.push('bill_title = ?');
      values.push(bill_title);
    }
    if (bill_number !== undefined) {
      updates.push('bill_number = ?');
      values.push(bill_number);
    }
    if (bill_description !== undefined) {
      updates.push('bill_description = ?');
      values.push(bill_description);
    }
    if (significance !== undefined) {
      updates.push('significance = ?');
      values.push(significance);
    }
    if (vote_date !== undefined) {
      updates.push('vote_date = ?');
      values.push(vote_date);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (vote_value !== undefined) {
      // Convert frontend vote values to database ENUM values
      const voteValueMap = {
        'for': 'yes',
        'against': 'no',
        'abstain': 'abstain',
        'absent': 'absent',
        'yes': 'yes',
        'no': 'no'
      };
      const mappedVoteValue = voteValueMap[vote_value.toLowerCase()] || vote_value;
      updates.push('vote_value = ?');
      values.push(mappedVoteValue);
    }
    if (reasoning !== undefined) {
      updates.push('reasoning = ?');
      values.push(reasoning);
    }
    if (bill_status !== undefined) {
      updates.push('bill_status = ?');
      values.push(bill_status);
    }
    if (bill_passed !== undefined) {
      updates.push('bill_passed = ?');
      values.push(bill_passed);
    }
    if (vote_count_for !== undefined) {
      updates.push('vote_count_for = ?');
      values.push(vote_count_for);
    }
    if (vote_count_against !== undefined) {
      updates.push('vote_count_against = ?');
      values.push(vote_count_against);
    }
    if (vote_count_abstain !== undefined) {
      updates.push('vote_count_abstain = ?');
      values.push(vote_count_abstain);
    }
    if (total_votes !== undefined) {
      updates.push('total_votes = ?');
      values.push(total_votes);
    }
    if (session_name !== undefined) {
      updates.push('session_name = ?');
      values.push(session_name);
    }
    if (source_links !== undefined) {
      updates.push('source_links = ?');
      values.push(JSON.stringify(source_links));
    }
    if (verification_links !== undefined) {
      updates.push('verification_links = ?');
      values.push(JSON.stringify(verification_links));
    }
    if (hansard_reference !== undefined) {
      updates.push('hansard_reference = ?');
      values.push(hansard_reference);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE voting_records SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating voting record:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update voting record'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Voting record not found'
        });
      }

      res.json({
        success: true,
        message: 'Voting record updated successfully'
      });
    });
  });

  // Delete voting record
  router.delete('/api/admin/voting-records/:id', auditLog('DELETE', 'voting_record'), (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM voting_records WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting voting record:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete voting record'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Voting record not found'
        });
      }

      res.json({
        success: true,
        message: 'Voting record deleted successfully'
      });
    });
  });

  // Get all custom categories
  router.get('/api/admin/custom-categories', (req, res) => {
    db.query('SELECT * FROM custom_categories ORDER BY name', (err, results) => {
      if (err) {
        console.error('Error fetching custom categories:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch custom categories'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  });

  // Create custom category
  router.post('/api/admin/custom-categories', (req, res) => {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({
        success: false,
        error: 'Name and color are required'
      });
    }

    db.query(
      'INSERT INTO custom_categories (name, color) VALUES (?, ?)',
      [name, color],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              success: false,
              error: 'Category already exists'
            });
          }
          console.error('Error creating custom category:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to create custom category'
          });
        }

        res.status(201).json({
          success: true,
          data: { id: result.insertId, name, color }
        });
      }
    );
  });

  return router;
};
