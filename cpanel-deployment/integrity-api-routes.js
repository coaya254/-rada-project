const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Run integrity check
  router.post('/api/admin/integrity/check', async (req, res) => {
    const { type } = req.query;

    const issues = [];

    try {
      // Check politicians without required fields
      if (!type || type === 'politicians') {
        const politiciansQuery = `
          SELECT id, name FROM politicians
          WHERE name IS NULL OR name = '' OR party IS NULL OR party = '' OR position IS NULL OR position = ''
        `;

        const politiciansResult = await queryPromise(db, politiciansQuery);
        politiciansResult.forEach(p => {
          issues.push({
            type: 'missing_required_field',
            table: 'politicians',
            id: p.id,
            message: `Politician ${p.id} has missing required fields`
          });
        });
      }

      // Check orphaned timeline events
      if (!type || type === 'timeline') {
        const timelineQuery = `
          SELECT t.id, t.politician_id FROM timeline_events t
          LEFT JOIN politicians p ON t.politician_id = p.id
          WHERE p.id IS NULL
        `;

        const timelineResult = await queryPromise(db, timelineQuery);
        timelineResult.forEach(t => {
          issues.push({
            type: 'orphaned_record',
            table: 'timeline_events',
            id: t.id,
            politician_id: t.politician_id,
            message: `Timeline event ${t.id} references non-existent politician ${t.politician_id}`
          });
        });
      }

      // Check orphaned commitments
      if (!type || type === 'commitments') {
        const commitmentsQuery = `
          SELECT c.id, c.politician_id FROM commitments c
          LEFT JOIN politicians p ON c.politician_id = p.id
          WHERE p.id IS NULL
        `;

        const commitmentsResult = await queryPromise(db, commitmentsQuery);
        commitmentsResult.forEach(c => {
          issues.push({
            type: 'orphaned_record',
            table: 'commitments',
            id: c.id,
            politician_id: c.politician_id,
            message: `Commitment ${c.id} references non-existent politician ${c.politician_id}`
          });
        });
      }

      // Check orphaned voting records
      if (!type || type === 'voting') {
        const votingQuery = `
          SELECT v.id, v.politician_id FROM voting_records v
          LEFT JOIN politicians p ON v.politician_id = p.id
          WHERE p.id IS NULL
        `;

        const votingResult = await queryPromise(db, votingQuery);
        votingResult.forEach(v => {
          issues.push({
            type: 'orphaned_record',
            table: 'voting_records',
            id: v.id,
            politician_id: v.politician_id,
            message: `Voting record ${v.id} references non-existent politician ${v.politician_id}`
          });
        });
      }

      // Check orphaned documents
      if (!type || type === 'documents') {
        const documentsQuery = `
          SELECT d.id, d.politician_id FROM documents d
          LEFT JOIN politicians p ON d.politician_id = p.id
          WHERE p.id IS NULL
        `;

        const documentsResult = await queryPromise(db, documentsQuery);
        documentsResult.forEach(d => {
          issues.push({
            type: 'orphaned_record',
            table: 'documents',
            id: d.id,
            politician_id: d.politician_id,
            message: `Document ${d.id} references non-existent politician ${d.politician_id}`
          });
        });
      }

      res.json({
        success: true,
        data: {
          total_issues: issues.length,
          issues,
          checked_types: type ? [type] : ['politicians', 'timeline', 'commitments', 'voting', 'documents']
        },
        message: issues.length > 0 ? `Found ${issues.length} integrity issues` : 'No integrity issues found'
      });

    } catch (error) {
      console.error('Error running integrity check:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run integrity check'
      });
    }
  });

  // Get integrity report
  router.get('/api/admin/integrity/report', async (req, res) => {
    try {
      const stats = {};

      // Count total records
      stats.politicians = await countPromise(db, 'politicians');
      stats.timeline_events = await countPromise(db, 'timeline_events');
      stats.commitments = await countPromise(db, 'commitments');
      stats.voting_records = await countPromise(db, 'voting_records');
      stats.documents = await countPromise(db, 'documents');
      stats.news = await countPromise(db, 'news');

      // Check for inconsistencies
      const orphanedTimeline = await queryPromise(db, `
        SELECT COUNT(*) as count FROM timeline_events t
        LEFT JOIN politicians p ON t.politician_id = p.id
        WHERE p.id IS NULL
      `);

      const orphanedCommitments = await queryPromise(db, `
        SELECT COUNT(*) as count FROM commitments c
        LEFT JOIN politicians p ON c.politician_id = p.id
        WHERE p.id IS NULL
      `);

      const orphanedVoting = await queryPromise(db, `
        SELECT COUNT(*) as count FROM voting_records v
        LEFT JOIN politicians p ON v.politician_id = p.id
        WHERE p.id IS NULL
      `);

      stats.orphaned_records = {
        timeline_events: orphanedTimeline[0].count,
        commitments: orphanedCommitments[0].count,
        voting_records: orphanedVoting[0].count
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error generating integrity report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate integrity report'
      });
    }
  });

  // Auto-fix issues
  router.post('/api/admin/integrity/auto-fix', async (req, res) => {
    const { issueIds } = req.body;

    if (!issueIds || !Array.isArray(issueIds)) {
      return res.status(400).json({
        success: false,
        error: 'Issue IDs array is required'
      });
    }

    const fixed = [];
    const failed = [];

    // In a real implementation, you'd parse the issueIds and fix them
    // This is a placeholder implementation

    res.json({
      success: true,
      data: {
        fixed: fixed.length,
        failed: failed.length,
        details: { fixed, failed }
      },
      message: `Fixed ${fixed.length} issues, ${failed.length} failed`
    });
  });

  return router;
};

// Helper functions
function queryPromise(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function countPromise(db, table) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COUNT(*) as count FROM ${table}`, (err, results) => {
      if (err) reject(err);
      else resolve(results[0].count);
    });
  });
}
