const express = require('express');
const router = express.Router();
const os = require('os');

// In-memory cache (in production, use Redis)
const cache = new Map();

// In-memory audit logs (in production, use database)
const auditLogs = [];

module.exports = (db) => {
  // Get system health
  router.get('/api/admin/system/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Check database connection
    db.query('SELECT 1', (err) => {
      const dbStatus = err ? 'unhealthy' : 'healthy';

      res.json({
        success: true,
        data: {
          status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
          uptime: Math.floor(uptime),
          memory: {
            rss: Math.floor(memoryUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            external: Math.floor(memoryUsage.external / 1024 / 1024) + ' MB'
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          system: {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            totalMemory: Math.floor(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
            freeMemory: Math.floor(os.freemem() / 1024 / 1024 / 1024) + ' GB',
            cpus: os.cpus().length
          },
          database: {
            status: dbStatus,
            error: err ? err.message : null
          }
        }
      });
    });
  });

  // Clear cache
  router.post('/api/admin/system/cache/clear', (req, res) => {
    const { type } = req.query;

    if (type) {
      // Clear specific cache type
      let cleared = 0;
      for (const [key, value] of cache.entries()) {
        if (key.startsWith(type)) {
          cache.delete(key);
          cleared++;
        }
      }

      res.json({
        success: true,
        data: { cleared, type },
        message: `Cleared ${cleared} ${type} cache entries`
      });
    } else {
      // Clear all cache
      const size = cache.size;
      cache.clear();

      res.json({
        success: true,
        data: { cleared: size },
        message: `Cleared ${size} cache entries`
      });
    }
  });

  // Get audit logs
  router.get('/api/admin/system/audit-logs', (req, res) => {
    const { action, userId, startDate, endDate, limit = 100 } = req.query;

    let filteredLogs = auditLogs;

    // Filter by action
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    // Filter by userId
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === parseInt(userId));
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Limit results
    filteredLogs = filteredLogs.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredLogs,
      total: auditLogs.length,
      filtered: filteredLogs.length
    });
  });

  // Create audit log (helper endpoint for testing)
  router.post('/api/admin/system/audit-logs', (req, res) => {
    const { action, userId, details, ipAddress } = req.body;

    const log = {
      id: auditLogs.length + 1,
      action,
      userId,
      details,
      ipAddress: ipAddress || req.ip,
      timestamp: new Date().toISOString()
    };

    auditLogs.push(log);

    res.status(201).json({
      success: true,
      data: log,
      message: 'Audit log created'
    });
  });

  // Get cache stats
  router.get('/api/admin/system/cache/stats', (req, res) => {
    const stats = {
      total_entries: cache.size,
      memory_usage: 0 // Approximate
    };

    // Calculate approximate memory usage
    for (const [key, value] of cache.entries()) {
      stats.memory_usage += JSON.stringify({ key, value }).length;
    }

    res.json({
      success: true,
      data: stats
    });
  });

  return router;
};
