// ==========================================================
// RADA POLITICS BACKEND - TEST VERSION (NO DATABASE)
// ==========================================================
// This version runs without database to test API endpoints

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'test-jwt-secret';

// ==========================================================
// MIDDLEWARE SETUP
// ==========================================================

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

app.use('/api/admin/auth/login', authLimiter);

// ==========================================================
// MOCK DATA STORAGE
// ==========================================================

let nextId = 1;
const politicians = [];
const sessions = new Map();

// Mock admin users
const adminUsers = {
  'superadmin': {
    id: 'admin_1',
    username: 'superadmin',
    email: 'admin@rada.go.ke',
    role: 'super_admin',
    password: 'Admin@2024!',
    permissions: [
      { module: 'politicians', actions: ['create', 'read', 'update', 'delete', 'publish'] },
      { module: 'content', actions: ['create', 'read', 'update', 'delete', 'publish', 'moderate'] }
    ]
  },
  'contentadmin': {
    id: 'admin_2',
    username: 'contentadmin',
    email: 'content@rada.go.ke',
    role: 'content_admin',
    password: 'Content@2024!',
    permissions: [
      { module: 'politicians', actions: ['create', 'read', 'update', 'publish'] },
      { module: 'content', actions: ['create', 'read', 'update', 'publish', 'moderate'] }
    ]
  }
};

// ==========================================================
// AUTHENTICATION MIDDLEWARE
// ==========================================================

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!sessions.has(decoded.id)) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ==========================================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================================

app.post('/api/admin/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    const user = adminUsers[username];
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    sessions.set(user.id, { token, expires: Date.now() + 24 * 60 * 60 * 1000 });

    console.log('✅ Admin login successful:', username);

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
        permissions: user.permissions
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

app.post('/api/admin/auth/logout', authenticateAdmin, (req, res) => {
  sessions.delete(req.admin.id);
  console.log('✅ Admin logout successful:', req.admin.username);
  res.json({ success: true });
});

app.get('/api/admin/auth/verify', authenticateAdmin, (req, res) => {
  const user = Object.values(adminUsers).find(u => u.id === req.admin.id);
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      permissions: user.permissions
    }
  });
});

// ==========================================================
// POLITICIAN MANAGEMENT ROUTES
// ==========================================================

app.get('/api/admin/politicians', authenticateAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let filteredPoliticians = politicians;
    if (search) {
      filteredPoliticians = politicians.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.current_position.toLowerCase().includes(search.toLowerCase()) ||
        p.constituency.toLowerCase().includes(search.toLowerCase())
      );
    }

    const paginatedPoliticians = filteredPoliticians.slice(offset, offset + parseInt(limit));

    console.log(`📋 Fetched ${paginatedPoliticians.length} politicians for admin`);

    res.json({
      success: true,
      data: {
        politicians: paginatedPoliticians,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPoliticians.length,
          pages: Math.ceil(filteredPoliticians.length / limit)
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

app.post('/api/admin/politicians', authenticateAdmin, (req, res) => {
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
      key_achievements = []
    } = req.body;

    if (!name || !title || !current_position || !party || !constituency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, title, current_position, party, constituency'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    // Check if politician already exists
    const existing = politicians.find(p => p.slug === slug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A politician with this name already exists'
      });
    }

    const newPolitician = {
      id: nextId++,
      name,
      title,
      current_position,
      party,
      constituency,
      wikipedia_summary,
      education,
      image_url: image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&sig=${nextId}`,
      party_color: party_color || '#6B7280',
      slug,
      party_history,
      key_achievements,
      education_sources: [],
      achievements_sources: [],
      position_sources: [],
      created_at: new Date().toISOString(),
      created_by: req.admin.id
    };

    politicians.push(newPolitician);

    console.log('✅ Politician created:', name);

    res.status(201).json({
      success: true,
      data: newPolitician
    });

  } catch (error) {
    console.error('Error creating politician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create politician'
    });
  }
});

app.put('/api/admin/politicians/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const politicianIndex = politicians.findIndex(p => p.id == id);

    if (politicianIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }

    const updatedPolitician = {
      ...politicians[politicianIndex],
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.admin.id
    };

    politicians[politicianIndex] = updatedPolitician;

    console.log('✅ Politician updated:', updatedPolitician.name);

    res.json({
      success: true,
      data: updatedPolitician
    });

  } catch (error) {
    console.error('Error updating politician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update politician'
    });
  }
});

app.delete('/api/admin/politicians/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const politicianIndex = politicians.findIndex(p => p.id == id);

    if (politicianIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }

    const deletedPolitician = politicians.splice(politicianIndex, 1)[0];

    console.log('✅ Politician deleted:', deletedPolitician.name);

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
// PUBLIC FRONTEND ROUTES
// ==========================================================

app.get('/api/politicians', (req, res) => {
  console.log(`📋 Fetched ${politicians.length} politicians for public view`);
  res.json(politicians);
});

app.get('/api/politicians/:id', (req, res) => {
  const { id } = req.params;
  const politician = politicians.find(p => p.id == id);

  if (!politician) {
    return res.status(404).json({ error: 'Politician not found' });
  }

  console.log('📋 Fetched politician for public view:', politician.name);
  res.json(politician);
});

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get('/api/admin/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'mock_data',
      politicians_count: politicians.length,
      active_sessions: sessions.size
    }
  });
});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Clean Politics Backend (TEST MODE) running on port', PORT);
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
  console.log('');
  console.log('🔐 Test Admin Credentials:');
  console.log('  superadmin / Admin@2024!');
  console.log('  contentadmin / Content@2024!');
  console.log('');
  console.log('✅ Ready to test the politics admin dashboard!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down gracefully...');
  process.exit(0);
});