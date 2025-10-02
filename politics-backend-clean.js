// ==========================================================
// RADA POLITICS CLEAN BACKEND IMPLEMENTATION
// ==========================================================
// This is a complete, clean backend implementation that matches
// the frontend AdminAPIService.ts exactly and uses the clean database schema

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ==========================================================
// MIDDLEWARE SETUP
// ==========================================================

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:8085',
    'http://localhost:8086',
    'http://localhost:8087',
    'http://localhost:8088',
    'http://192.168.100.41:8081',
    'http://192.168.100.41:8082',
    'http://192.168.100.41:8083',
    'http://192.168.100.41:8084',
    'http://192.168.100.41:8085',
    'http://192.168.100.41:8086',
    'http://192.168.100.41:8087',
    'http://192.168.100.41:8088',
    'exp://localhost:8081',
    'exp://192.168.100.41:8081',
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/admin/auth/login', authLimiter);
app.use('/api', apiLimiter);

// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_politics',
  charset: 'utf8mb4',
  timezone: 'Z',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 10,
};

let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to politics database');

    // Test the connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// ==========================================================
// AUTHENTICATION MIDDLEWARE
// ==========================================================

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists and is valid
    const [sessions] = await db.execute(
      'SELECT * FROM admin_sessions WHERE admin_id = ? AND expires_at > NOW()',
      [decoded.id]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    // Get admin user with permissions
    const [users] = await db.execute(
      `SELECT au.*,
              GROUP_CONCAT(
                JSON_OBJECT(
                  'module', ap.module,
                  'actions', ap.actions
                )
              ) as permissions
       FROM admin_users au
       LEFT JOIN admin_permissions ap ON au.id = ap.admin_id
       WHERE au.id = ? AND au.is_active = TRUE
       GROUP BY au.id`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Admin user not found' });
    }

    const user = users[0];
    user.permissions = user.permissions ?
      user.permissions.split(',').map(p => JSON.parse(p)) : [];

    req.admin = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Permission checking helper
const checkPermission = (module, action) => {
  return (req, res, next) => {
    const userPermissions = req.admin.permissions;
    const hasPermission = userPermissions.some(p =>
      p.module === module && JSON.parse(p.actions).includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${action} on ${module}`
      });
    }

    next();
  };
};

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

const auditLog = async (action, data, req) => {
  try {
    await db.execute(
      `INSERT INTO audit_log (admin_id, action, table_name, record_id, new_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.admin?.id || null,
        action,
        data.table || 'unknown',
        data.recordId || null,
        JSON.stringify(data),
        req.ip,
        req.get('User-Agent') || ''
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const buildPoliticianResponse = async (politician) => {
  // Get party history
  const [partyHistory] = await db.execute(
    'SELECT party_name FROM politician_party_history WHERE politician_id = ? ORDER BY start_date DESC',
    [politician.id]
  );

  // Get achievements
  const [achievements] = await db.execute(
    'SELECT achievement FROM politician_achievements WHERE politician_id = ?',
    [politician.id]
  );

  // Get source links
  const [educationSources] = await db.execute(
    'SELECT type, url, title, source, date FROM education_sources WHERE politician_id = ?',
    [politician.id]
  );

  const [achievementSources] = await db.execute(
    'SELECT type, url, title, source, date FROM achievement_sources WHERE politician_id = ?',
    [politician.id]
  );

  const [positionSources] = await db.execute(
    'SELECT type, url, title, source, date FROM position_sources WHERE politician_id = ?',
    [politician.id]
  );

  return {
    id: politician.id,
    name: politician.name,
    title: politician.title,
    current_position: politician.current_position,
    party: politician.party,
    party_history: partyHistory.map(p => p.party_name),
    constituency: politician.constituency,
    wikipedia_summary: politician.wikipedia_summary,
    key_achievements: achievements.map(a => a.achievement),
    education: politician.education,
    image_url: politician.image_url,
    party_color: politician.party_color,
    slug: politician.slug,
    education_sources: educationSources,
    achievements_sources: achievementSources,
    position_sources: positionSources
  };
};

// ==========================================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================================

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    // Get admin user
    const [users] = await db.execute(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (users.length === 0) {
      await auditLog('ADMIN_LOGIN_FAILED', { username, reason: 'User not found' }, req);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(423).json({
        success: false,
        error: 'Account temporarily locked'
      });
    }

    // For development, use hardcoded passwords (in production, use bcrypt)
    const validPasswords = {
      'superadmin': 'Admin@2024!',
      'contentadmin': 'Content@2024!',
      'moderator': 'Mod@2024!'
    };

    const isValidPassword = validPasswords[username] === password;

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.execute(
        'UPDATE admin_users SET login_attempts = ?, locked_until = ? WHERE id = ?',
        [failedAttempts, lockUntil, user.id]
      );

      await auditLog('ADMIN_LOGIN_FAILED', { username, reason: 'Invalid password' }, req);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.execute(
      'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, token, expiresAt]
    );

    // Reset failed attempts and update last login
    await db.execute(
      'UPDATE admin_users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Get permissions
    const [permissions] = await db.execute(
      'SELECT module, actions FROM admin_permissions WHERE admin_id = ?',
      [user.id]
    );

    await auditLog('ADMIN_LOGIN_SUCCESS', { username, userId: user.id }, req);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        permissions: permissions.map(p => ({
          module: p.module,
          actions: JSON.parse(p.actions)
        }))
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

app.post('/api/admin/auth/logout', authenticateAdmin, async (req, res) => {
  try {
    // Delete session
    await db.execute(
      'DELETE FROM admin_sessions WHERE admin_id = ?',
      [req.admin.id]
    );

    await auditLog('ADMIN_LOGOUT', { userId: req.admin.id }, req);

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

app.get('/api/admin/auth/verify', authenticateAdmin, async (req, res) => {
  try {
    const [permissions] = await db.execute(
      'SELECT module, actions FROM admin_permissions WHERE admin_id = ?',
      [req.admin.id]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: req.admin.id,
          username: req.admin.username,
          email: req.admin.email,
          role: req.admin.role
        },
        permissions: permissions.map(p => ({
          module: p.module,
          actions: JSON.parse(p.actions)
        }))
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// ==========================================================
// POLITICIAN MANAGEMENT ROUTES
// ==========================================================

app.get('/api/admin/politicians', authenticateAdmin, checkPermission('politicians', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', party, constituency } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.current_position LIKE ? OR p.constituency LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (party) {
      whereClause += ' AND p.party = ?';
      params.push(party);
    }

    if (constituency) {
      whereClause += ' AND p.constituency = ?';
      params.push(constituency);
    }

    const [politicians] = await db.execute(`
      SELECT p.* FROM politicians p
      ${whereClause}
      ORDER BY p.name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total FROM politicians p ${whereClause}
    `, params);

    const politiciansWithDetails = await Promise.all(
      politicians.map(politician => buildPoliticianResponse(politician))
    );

    res.json({
      success: true,
      data: {
        politicians: politiciansWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching politicians:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch politicians'
    });
  }
});

app.post('/api/admin/politicians', authenticateAdmin, checkPermission('politicians', 'create'), async (req, res) => {
  try {
    const {
      name,
      title,
      current_position,
      party,
      constituency,
      wikipedia_summary,
      education,
      image_url,
      party_color,
      party_history = [],
      key_achievements = [],
      education_sources = [],
      achievements_sources = [],
      position_sources = []
    } = req.body;

    if (!name || !title || !current_position || !party || !constituency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, title, current_position, party, constituency'
      });
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const [existingSlug] = await db.execute(
      'SELECT id FROM politicians WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A politician with this name already exists'
      });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Insert politician
      const [result] = await db.execute(`
        INSERT INTO politicians (
          name, title, current_position, party, constituency,
          wikipedia_summary, education, image_url, party_color, slug,
          created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, title, current_position, party, constituency,
        wikipedia_summary, education, image_url, party_color, slug,
        req.admin.id, req.admin.id
      ]);

      const politicianId = result.insertId;

      // Insert party history
      for (const partyName of party_history) {
        await db.execute(
          'INSERT INTO politician_party_history (politician_id, party_name, start_date, is_current) VALUES (?, ?, CURDATE(), ?)',
          [politicianId, partyName, partyName === party]
        );
      }

      // Insert achievements
      for (const achievement of key_achievements) {
        await db.execute(
          'INSERT INTO politician_achievements (politician_id, achievement) VALUES (?, ?)',
          [politicianId, achievement]
        );
      }

      // Insert source links
      for (const source of education_sources) {
        await db.execute(
          'INSERT INTO education_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
          [politicianId, source.type, source.url, source.title, source.source, source.date]
        );
      }

      for (const source of achievements_sources) {
        await db.execute(
          'INSERT INTO achievement_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
          [politicianId, source.type, source.url, source.title, source.source, source.date]
        );
      }

      for (const source of position_sources) {
        await db.execute(
          'INSERT INTO position_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
          [politicianId, source.type, source.url, source.title, source.source, source.date]
        );
      }

      await db.commit();

      await auditLog('POLITICIAN_CREATED', {
        table: 'politicians',
        recordId: politicianId,
        name
      }, req);

      // Fetch and return the created politician
      const [newPolitician] = await db.execute(
        'SELECT * FROM politicians WHERE id = ?',
        [politicianId]
      );

      const politicianWithDetails = await buildPoliticianResponse(newPolitician[0]);

      res.status(201).json({
        success: true,
        data: politicianWithDetails
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error creating politician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create politician'
    });
  }
});

app.put('/api/admin/politicians/:id', authenticateAdmin, checkPermission('politicians', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      current_position,
      party,
      constituency,
      wikipedia_summary,
      education,
      image_url,
      party_color,
      party_history = [],
      key_achievements = [],
      education_sources = [],
      achievements_sources = [],
      position_sources = []
    } = req.body;

    // Check if politician exists
    const [existing] = await db.execute(
      'SELECT * FROM politicians WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }

    const slug = name ? generateSlug(name) : existing[0].slug;

    // Check if new slug conflicts with existing (excluding current record)
    if (name && slug !== existing[0].slug) {
      const [existingSlug] = await db.execute(
        'SELECT id FROM politicians WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (existingSlug.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'A politician with this name already exists'
        });
      }
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Update politician
      await db.execute(`
        UPDATE politicians SET
          name = COALESCE(?, name),
          title = COALESCE(?, title),
          current_position = COALESCE(?, current_position),
          party = COALESCE(?, party),
          constituency = COALESCE(?, constituency),
          wikipedia_summary = COALESCE(?, wikipedia_summary),
          education = COALESCE(?, education),
          image_url = COALESCE(?, image_url),
          party_color = COALESCE(?, party_color),
          slug = ?,
          updated_by = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [
        name, title, current_position, party, constituency,
        wikipedia_summary, education, image_url, party_color, slug,
        req.admin.id, id
      ]);

      // Update related data if provided
      if (party_history.length > 0) {
        await db.execute('DELETE FROM politician_party_history WHERE politician_id = ?', [id]);
        for (const partyName of party_history) {
          await db.execute(
            'INSERT INTO politician_party_history (politician_id, party_name, start_date, is_current) VALUES (?, ?, CURDATE(), ?)',
            [id, partyName, partyName === (party || existing[0].party)]
          );
        }
      }

      if (key_achievements.length > 0) {
        await db.execute('DELETE FROM politician_achievements WHERE politician_id = ?', [id]);
        for (const achievement of key_achievements) {
          await db.execute(
            'INSERT INTO politician_achievements (politician_id, achievement) VALUES (?, ?)',
            [id, achievement]
          );
        }
      }

      // Update source links if provided
      if (education_sources.length > 0) {
        await db.execute('DELETE FROM education_sources WHERE politician_id = ?', [id]);
        for (const source of education_sources) {
          await db.execute(
            'INSERT INTO education_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, source.type, source.url, source.title, source.source, source.date]
          );
        }
      }

      if (achievements_sources.length > 0) {
        await db.execute('DELETE FROM achievement_sources WHERE politician_id = ?', [id]);
        for (const source of achievements_sources) {
          await db.execute(
            'INSERT INTO achievement_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, source.type, source.url, source.title, source.source, source.date]
          );
        }
      }

      if (position_sources.length > 0) {
        await db.execute('DELETE FROM position_sources WHERE politician_id = ?', [id]);
        for (const source of position_sources) {
          await db.execute(
            'INSERT INTO position_sources (politician_id, type, url, title, source, date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, source.type, source.url, source.title, source.source, source.date]
          );
        }
      }

      await db.commit();

      await auditLog('POLITICIAN_UPDATED', {
        table: 'politicians',
        recordId: id,
        changes: req.body
      }, req);

      // Fetch and return updated politician
      const [updatedPolitician] = await db.execute(
        'SELECT * FROM politicians WHERE id = ?',
        [id]
      );

      const politicianWithDetails = await buildPoliticianResponse(updatedPolitician[0]);

      res.json({
        success: true,
        data: politicianWithDetails
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error updating politician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update politician'
    });
  }
});

app.delete('/api/admin/politicians/:id', authenticateAdmin, checkPermission('politicians', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if politician exists
    const [existing] = await db.execute(
      'SELECT name FROM politicians WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }

    // Soft delete
    await db.execute(
      'UPDATE politicians SET is_active = FALSE, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [req.admin.id, id]
    );

    await auditLog('POLITICIAN_DELETED', {
      table: 'politicians',
      recordId: id,
      name: existing[0].name
    }, req);

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting politician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete politician'
    });
  }
});

// ==========================================================
// PUBLIC FRONTEND ROUTES (for the user-facing app)
// ==========================================================

app.get('/api/politicians', async (req, res) => {
  try {
    const [politicians] = await db.execute(`
      SELECT p.* FROM politicians p
      WHERE p.is_active = TRUE
      ORDER BY p.name
    `);

    const politiciansWithDetails = await Promise.all(
      politicians.map(politician => buildPoliticianResponse(politician))
    );

    res.json(politiciansWithDetails);

  } catch (error) {
    console.error('Error fetching politicians for frontend:', error);
    res.status(500).json({ error: 'Failed to fetch politicians' });
  }
});

app.get('/api/politicians/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [politicians] = await db.execute(
      'SELECT * FROM politicians WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (politicians.length === 0) {
      return res.status(404).json({ error: 'Politician not found' });
    }

    const politicianWithDetails = await buildPoliticianResponse(politicians[0]);
    res.json(politicianWithDetails);

  } catch (error) {
    console.error('Error fetching politician for frontend:', error);
    res.status(500).json({ error: 'Failed to fetch politician' });
  }
});

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get('/api/admin/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// ==========================================================
// START SERVER
// ==========================================================

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clean Politics Backend running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/admin/health`);
      console.log(`Admin API base: http://localhost:${PORT}/api/admin`);
      console.log(`Public API base: http://localhost:${PORT}/api`);
      console.log('');
      console.log('📋 Available Admin Endpoints:');
      console.log('  POST /api/admin/auth/login');
      console.log('  POST /api/admin/auth/logout');
      console.log('  GET  /api/admin/auth/verify');
      console.log('  GET  /api/admin/politicians');
      console.log('  POST /api/admin/politicians');
      console.log('  PUT  /api/admin/politicians/:id');
      console.log('  DELETE /api/admin/politicians/:id');
      console.log('');
      console.log('📋 Available Public Endpoints:');
      console.log('  GET  /api/politicians');
      console.log('  GET  /api/politicians/:id');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (db) {
    await db.end();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (db) {
    await db.end();
  }
  process.exit(0);
});

startServer();