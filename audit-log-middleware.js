const mysql = require('mysql2/promise');
require('dotenv').config();

// Create database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Audit logging middleware
 * Logs admin actions to the audit_log table
 *
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entityType - Entity type (politician, timeline_event, commitment, etc.)
 * @returns {Function} Express middleware function
 */
function auditLog(action, entityType) {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      // Only log if the operation was successful
      if (data && data.success) {
        try {
          const adminUser = req.adminUser; // Set by authenticateAdmin middleware
          const entityId = data.data?.id || req.params.id || null;
          const entityName = data.data?.name || data.data?.title || data.data?.promise || null;

          const auditEntry = {
            user_id: adminUser?.id || null,
            user_email: adminUser?.email || null,
            action: action,
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName,
            details: JSON.stringify({
              method: req.method,
              path: req.path,
              body: sanitizeBody(req.body),
              params: req.params,
              query: req.query
            }),
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent') || null
          };

          await logToDatabase(auditEntry);
        } catch (error) {
          console.error('Error writing to audit log:', error);
          // Don't fail the request if audit logging fails
        }
      }

      // Call original res.json
      return originalJson(data);
    };

    next();
  };
}

/**
 * Write audit entry to database
 */
async function logToDatabase(entry) {
  const query = `
    INSERT INTO audit_log (
      user_id, user_email, action, entity_type, entity_id,
      entity_name, details, ip_address, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    entry.user_id,
    entry.user_email,
    entry.action,
    entry.entity_type,
    entry.entity_id,
    entry.entity_name,
    entry.details,
    entry.ip_address,
    entry.user_agent
  ];

  await pool.execute(query, values);
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body) {
  if (!body) return body;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'api_key'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Get recent audit log entries
 */
async function getRecentActivity(limit = 20, filters = {}) {
  let query = `
    SELECT
      id,
      user_id,
      user_email,
      action,
      entity_type,
      entity_id,
      entity_name,
      details,
      ip_address,
      created_at
    FROM audit_log
    WHERE 1=1
  `;

  const values = [];

  if (filters.userId) {
    query += ' AND user_id = ?';
    values.push(filters.userId);
  }

  if (filters.action) {
    query += ' AND action = ?';
    values.push(filters.action);
  }

  if (filters.entityType) {
    query += ' AND entity_type = ?';
    values.push(filters.entityType);
  }

  if (filters.startDate) {
    query += ' AND created_at >= ?';
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND created_at <= ?';
    values.push(filters.endDate);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  values.push(limit);

  const [rows] = await pool.execute(query, values);
  return rows;
}

/**
 * Get audit statistics
 */
async function getAuditStats() {
  const [actionStats] = await pool.execute(`
    SELECT action, COUNT(*) as count
    FROM audit_log
    GROUP BY action
  `);

  const [entityStats] = await pool.execute(`
    SELECT entity_type, COUNT(*) as count
    FROM audit_log
    GROUP BY entity_type
  `);

  const [recentActivity] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM audit_log
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `);

  return {
    actionBreakdown: actionStats,
    entityBreakdown: entityStats,
    last24Hours: recentActivity[0].count
  };
}

module.exports = {
  auditLog,
  getRecentActivity,
  getAuditStats,
  pool
};
