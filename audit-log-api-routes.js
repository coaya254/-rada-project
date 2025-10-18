const express = require('express');
const router = express.Router();
const { getRecentActivity, getAuditStats } = require('./audit-log-middleware');

/**
 * GET /api/admin/audit-log/recent
 * Get recent audit log entries
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};

    if (req.query.userId) filters.userId = parseInt(req.query.userId);
    if (req.query.action) filters.action = req.query.action;
    if (req.query.entityType) filters.entityType = req.query.entityType;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;

    const activities = await getRecentActivity(limit, filters);

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/audit-log/stats
 * Get audit log statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getAuditStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/audit-log/:id
 * Get specific audit log entry details
 */
router.get('/:id', async (req, res) => {
  try {
    const { pool } = require('./audit-log-middleware');
    const [rows] = await pool.execute(
      'SELECT * FROM audit_log WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Audit log entry not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching audit log entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log entry',
      message: error.message
    });
  }
});

module.exports = router;
