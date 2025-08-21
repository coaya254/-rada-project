const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// =====================================================
// ENHANCED AUTHENTICATION MIDDLEWARE
// =====================================================

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced permission middleware with trust score support
const checkPermission = (permission, options = {}) => {
  return (req, res, next) => {
    try {
      // Admin wildcard - admins have all permissions
      if (req.user?.role === 'admin') {
        return next();
      }

      // Check specific permissions for staff users
      if (req.user?.permissions?.includes(permission)) {
        return next();
      }

      // Special case: high trust score users get some moderator abilities
      if (options.allowHighTrust && req.userTrustScore > 2.0) {
        if (['peer_review', 'fast_track', 'community_flag'].includes(permission)) {
          return next();
        }
      }

      // Check for anonymous user with high trust score
      if (req.user?.role === 'anonymous' && req.user?.trust_score > 2.5) {
        if (['auto_approve_content', 'peer_review'].includes(permission)) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user?.role,
        userTrustScore: req.user?.trust_score
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// JWT blacklist for forced logout
const jwtBlacklist = new Set();

// Enhanced user authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userUuid = req.headers['x-user-uuid'];

    if (!token && !userUuid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For staff users, verify JWT token
    if (token) {
      try {
        // Check if token is blacklisted
        if (jwtBlacklist.has(token)) {
          return res.status(401).json({ error: 'Token has been invalidated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        req.isStaffUser = true;
        return next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // For anonymous users, verify UUID and get user data
    if (userUuid) {
      try {
        const user = await getUserByUuid(userUuid);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        // Check if user needs to re-authenticate (last_active is NULL)
        if (!user.last_active) {
          return res.status(401).json({ error: 'Session expired, please re-authenticate' });
        }

        req.user = user;
        req.userTrustScore = user.trust_score;
        req.isStaffUser = false;
        return next();
      } catch (dbError) {
        console.error('Database user lookup failed:', dbError);
        return res.status(500).json({ error: 'Authentication failed' });
      }
    }

    return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Enhanced staff authentication middleware
const authenticateStaff = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Staff authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Verify staff user exists in database
      const staffUser = await getStaffUserById(decoded.id);
      if (!staffUser) {
        return res.status(401).json({ error: 'Staff user not found' });
      }

      // Check if account is locked
      if (staffUser.locked_until && new Date() < new Date(staffUser.locked_until)) {
        return res.status(423).json({ 
          error: 'Account temporarily locked',
          lockedUntil: staffUser.locked_until 
        });
      }

      req.user = staffUser;
      req.isStaffUser = true;
      return next();
    } catch (jwtError) {
      console.error('Staff JWT verification failed:', jwtError);
      return res.status(401).json({ error: 'Invalid staff token' });
    }
  } catch (error) {
    console.error('Staff authentication middleware error:', error);
    return res.status(500).json({ error: 'Staff authentication failed' });
  }
};

// Enhanced anonymous user generation
const generateAnonymousUser = () => {
  const emojis = ['😊', '🌟', '💫', '✨', '🎯', '🚀', '💡', '🔥', '🌈', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'];
  
  return {
    uuid: uuidv4(),
    nickname: '',
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    xp: 0,
    badges: [],
    streak_days: 0,
    trust_score: 1.0,
    county: null,
    preferences: {
      notifications: true,
      content_types: ['all'],
      language: 'en'
    },
    role: 'anonymous',
    created_at: new Date(),
    last_active: new Date()
  };
};

// Enhanced user storage with backup
const saveUser = (user) => {
  try {
    localStorage.setItem('rada_user', JSON.stringify(user));
    localStorage.setItem('rada_user_backup', JSON.stringify({
      uuid: user.uuid,
      created_at: user.created_at,
      trust_score: user.trust_score
    }));
    return true;
  } catch (error) {
    console.error('Failed to save user:', error);
    return false;
  }
};

// Enhanced trust score management
const updateTrustScore = async (userUuid, eventType, trustChange, reason) => {
  try {
    // Get current user
    const user = await getUserByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate new trust score
    const newTrustScore = Math.max(0.1, Math.min(5.0, user.trust_score + trustChange));

    // Update user trust score
    await updateUserTrustScore(userUuid, newTrustScore);

    // Record trust event
    await recordTrustEvent(userUuid, eventType, trustChange, newTrustScore, reason);

    return newTrustScore;
  } catch (error) {
    console.error('Trust score update failed:', error);
    throw error;
  }
};

// Auto-moderation intelligence
const autoModerationCheck = async (content, userTrustScore) => {
  try {
    // High trust users get auto-approval
    if (userTrustScore > 2.5) {
      return { 
        approved: true, 
        reason: 'high_trust',
        priority: 'low'
      };
    }

    // AI content screening (placeholder for actual AI implementation)
    const aiFlags = await runAIScreening(content);
    
    if (aiFlags.length === 0 && userTrustScore > 1.5) {
      return { 
        approved: true, 
        reason: 'clean_content',
        priority: 'normal'
      };
    }

    // Queue for manual review
    return {
      approved: false,
      priority: aiFlags.includes('urgent') ? 'high' : 'normal',
      flags: aiFlags,
      reason: 'requires_review'
    };
  } catch (error) {
    console.error('Auto-moderation check failed:', error);
    return {
      approved: false,
      priority: 'normal',
      reason: 'error'
    };
  }
};

// Community self-moderation
const processCommunityFlag = async (contentId, flaggedBy, reason) => {
  try {
    const flaggerTrust = await getUserTrustScore(flaggedBy);
    const flagWeight = Math.min(flaggerTrust, 3.0); // max weight of 3

    // Get total flag weight for this content
    const totalWeight = await getTotalFlagWeight(contentId) + flagWeight;

    // Auto-remove if enough weighted flags
    if (totalWeight > 10) {
      await autoRemoveContent(contentId, 'community_consensus');
      return { action: 'removed', reason: 'community_consensus' };
    }

    // Add to moderation queue
    await addToModerationQueue(contentId, 'post', flaggedBy, reason, 'normal');
    return { action: 'queued', reason: 'flagged' };
  } catch (error) {
    console.error('Community flag processing failed:', error);
    throw error;
  }
};

// Enhanced staff login with security
const staffLogin = async (email, password) => {
  try {
    // Get staff user
    const staffUser = await getStaffUserByEmail(email);
    if (!staffUser) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (staffUser.locked_until && new Date() < new Date(staffUser.locked_until)) {
      throw new Error('Account temporarily locked');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, staffUser.password);
    if (!isValidPassword) {
      // Increment login attempts
      await incrementLoginAttempts(staffUser.id);
      
      // Lock account if too many attempts
      if (staffUser.login_attempts >= 4) {
        await lockStaffAccount(staffUser.id, 15); // lock for 15 minutes
        throw new Error('Account locked due to too many failed attempts');
      }
      
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(staffUser.id);
    
    // Update last login
    await updateStaffLastLogin(staffUser.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: staffUser.id, 
        email: staffUser.email, 
        role: staffUser.role,
        permissions: staffUser.permissions 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: staffUser.id,
        email: staffUser.email,
        role: staffUser.role,
        permissions: staffUser.permissions,
        specialization: staffUser.specialization,
        admin_level: staffUser.admin_level
      }
    };
  } catch (error) {
    console.error('Staff login failed:', error);
    throw error;
  }
};

// Enhanced permission matrix
const PERMISSION_MATRIX = {
  // Anonymous users
  anonymous: {
    submit_posts: true,
    vote_polls: true,
    light_candles: true,
    complete_learning: true,
    submit_evidence: true,
    comment_posts: true,
    flag_content: true,
    access_directory: true,
    earn_xp: true,
    peer_review: false, // unless high trust
    create_challenges: false
  },
  
  // High trust anonymous users (trust_score > 2.0)
  high_trust_anonymous: {
    submit_posts: true,
    auto_approve_content: true,
    peer_review: true,
    fast_track_review: true,
    create_challenges: true
  },
  
  // Educators
  educator: {
    create_lessons: true,
    create_quizzes: true,
    moderate_learning: true,
    view_learning_analytics: true,
    mentor_users: true,
    create_certifications: true
  },
  
  // Moderators
  moderator: {
    approve_content: true,
    manage_flags: true,
    verify_evidence: true,
    manage_civic_memory: true,
    escalate_to_admin: true,
    fast_track_trusted: true,
    issue_warnings: true
  },
  
  // Admins
  admin: {
    '*': true // all permissions
  }
};

// Helper function to check if user has permission
const hasPermission = (user, permission) => {
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check specific permissions
  if (user.permissions?.includes(permission)) return true;
  
  // Check high trust anonymous permissions
  if (user.role === 'anonymous' && user.trust_score > 2.0) {
    const highTrustPermissions = PERMISSION_MATRIX.high_trust_anonymous;
    if (highTrustPermissions[permission]) return true;
  }
  
  // Check role-based permissions
  const rolePermissions = PERMISSION_MATRIX[user.role];
  return rolePermissions?.[permission] || false;
};

// Database helper functions (to be implemented based on your database setup)
const getUserByUuid = async (uuid) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db; // Get database connection from server
    db.query('SELECT * FROM users WHERE uuid = ?', [uuid], (err, results) => {
      if (err) {
        console.error('Error getting user by UUID:', err);
        reject(err);
      } else {
        const user = results[0];
        if (user) {
          // Parse JSON fields
          user.badges = user.badges ? JSON.parse(user.badges) : [];
          user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
          user.preferences = user.preferences ? JSON.parse(user.preferences) : {};
        }
        resolve(user || null);
      }
    });
  });
};

const getStaffUserById = async (id) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query('SELECT * FROM staff_users WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error getting staff user by ID:', err);
        reject(err);
      } else {
        const user = results[0];
        if (user) {
          user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
        }
        resolve(user || null);
      }
    });
  });
};

const getStaffUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query('SELECT * FROM staff_users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error getting staff user by email:', err);
        reject(err);
      } else {
        const user = results[0];
        if (user) {
          user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
        }
        resolve(user || null);
      }
    });
  });
};

const updateUserTrustScore = async (uuid, newScore) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query('UPDATE users SET trust_score = ? WHERE uuid = ?', [newScore, uuid], (err, result) => {
      if (err) {
        console.error('Error updating user trust score:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const recordTrustEvent = async (uuid, eventType, change, newScore, reason) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'INSERT INTO trust_events (user_uuid, event_type, trust_change, new_trust_score, reason) VALUES (?, ?, ?, ?, ?)',
      [uuid, eventType, change, newScore, reason],
      (err, result) => {
        if (err) {
          console.error('Error recording trust event:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const getUserTrustScore = async (uuid) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query('SELECT trust_score FROM users WHERE uuid = ?', [uuid], (err, results) => {
      if (err) {
        console.error('Error getting user trust score:', err);
        reject(err);
      } else {
        resolve(results[0]?.trust_score || 1.0);
      }
    });
  });
};

const getTotalFlagWeight = async (contentId) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      `SELECT SUM(flagger_trust_score) as total_weight 
       FROM moderation_queue 
       WHERE content_id = ? AND content_type = 'post'`,
      [contentId],
      (err, results) => {
        if (err) {
          console.error('Error getting total flag weight:', err);
          reject(err);
        } else {
          resolve(results[0]?.total_weight || 0);
        }
      }
    );
  });
};

const addToModerationQueue = async (contentId, contentType, flaggedBy, reason, priority) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'INSERT INTO moderation_queue (content_type, content_id, flagged_by, flag_reason, priority) VALUES (?, ?, ?, ?, ?)',
      [contentType, contentId, flaggedBy, reason, priority],
      (err, result) => {
        if (err) {
          console.error('Error adding to moderation queue:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const autoRemoveContent = async (contentId, reason) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'UPDATE posts SET verified = FALSE, review_notes = ? WHERE id = ?',
      [reason, contentId],
      (err, result) => {
        if (err) {
          console.error('Error auto-removing content:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const runAIScreening = async (content) => {
  // Placeholder for AI content screening
  // In a real implementation, this would call an AI service
  // For now, return empty array (no flags)
  return [];
};

const incrementLoginAttempts = async (staffId) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'UPDATE staff_users SET login_attempts = login_attempts + 1 WHERE id = ?',
      [staffId],
      (err, result) => {
        if (err) {
          console.error('Error incrementing login attempts:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const lockStaffAccount = async (staffId, minutes) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    const lockUntil = new Date(Date.now() + minutes * 60 * 1000);
    db.query(
      'UPDATE staff_users SET locked_until = ? WHERE id = ?',
      [lockUntil, staffId],
      (err, result) => {
        if (err) {
          console.error('Error locking staff account:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const resetLoginAttempts = async (staffId) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'UPDATE staff_users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
      [staffId],
      (err, result) => {
        if (err) {
          console.error('Error resetting login attempts:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updateStaffLastLogin = async (staffId) => {
  return new Promise((resolve, reject) => {
    const db = require('./server').db;
    db.query(
      'UPDATE staff_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [staffId],
      (err, result) => {
        if (err) {
          console.error('Error updating staff last login:', err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

module.exports = {
  authLimiter,
  generalLimiter,
  checkPermission,
  authenticateUser,
  authenticateStaff,
  generateAnonymousUser,
  saveUser,
  updateTrustScore,
  autoModerationCheck,
  processCommunityFlag,
  staffLogin,
  hasPermission,
  PERMISSION_MATRIX
};
