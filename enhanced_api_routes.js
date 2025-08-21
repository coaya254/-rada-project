const express = require('express');
const router = express.Router();
const { 
  authenticateUser, 
  authenticateStaff, 
  checkPermission, 
  authLimiter,
  generalLimiter,
  generateAnonymousUser,
  updateTrustScore,
  autoModerationCheck,
  processCommunityFlag,
  staffLogin,
  hasPermission
} = require('./enhanced_auth_middleware');

// =====================================================
// ENHANCED AUTHENTICATION ROUTES
// =====================================================

// Staff authentication routes
router.post('/auth/staff/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await staffLogin(email, password);
    res.json(result);
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// JWT blacklist for forced logout
const jwtBlacklist = new Set();

// Global logout endpoint - forces all users to re-authenticate
router.post('/auth/global-logout', async (req, res) => {
  try {
    // Clear all user sessions from database
    const db = require('./server').db;
    
    // Update all users to force re-authentication
    db.query('UPDATE users SET last_active = NULL WHERE 1', (err) => {
      if (err) {
        console.error('Error clearing user sessions:', err);
      }
    });

    // Clear staff user sessions
    db.query('UPDATE staff_users SET last_login = NULL WHERE 1', (err) => {
      if (err) {
        console.error('Error clearing staff sessions:', err);
      }
    });

    res.json({ 
      message: 'All users have been logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Global logout error:', error);
    res.status(500).json({ error: 'Failed to logout all users' });
  }
});

// Enhanced staff logout with blacklisting
router.post('/auth/staff/logout', authenticateStaff, (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Add token to blacklist
      jwtBlacklist.add(token);
      
      // Remove from blacklist after 24 hours (token expiry)
      setTimeout(() => {
        jwtBlacklist.delete(token);
      }, 24 * 60 * 60 * 1000);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Staff logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/auth/staff/me', authenticateStaff, (req, res) => {
  res.json({ user: req.user });
});

// Anonymous user management
router.post('/users/sync', authenticateUser, async (req, res) => {
  try {
    const { user } = req.body;
    
    // Update user's last active time
    await updateUserLastActive(user.uuid);
    
    // Sync XP and stats from server
    const serverUser = await getUserByUuid(user.uuid);
    
    res.json({
      user: serverUser,
      synced: true
    });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/users/stats/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await getUserByUuid(uuid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user statistics
    const stats = await getUserStats(uuid);
    
    res.json({
      user,
      stats
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Trust score management
router.post('/trust/event', authenticateUser, async (req, res) => {
  try {
    const { userUuid, eventType, trustChange, reason } = req.body;
    
    // Only staff can record trust events
    if (!req.isStaffUser) {
      return res.status(403).json({ error: 'Staff access required' });
    }
    
    const newTrustScore = await updateTrustScore(userUuid, eventType, trustChange, reason);
    
    res.json({
      userUuid,
      newTrustScore,
      eventRecorded: true
    });
  } catch (error) {
    console.error('Trust event error:', error);
    res.status(500).json({ error: 'Failed to record trust event' });
  }
});

router.get('/trust/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getTrustLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Trust leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// =====================================================
// ENHANCED CONTENT MANAGEMENT
// =====================================================

// Enhanced post creation with auto-moderation
router.post('/posts', authenticateUser, async (req, res) => {
  try {
    const { type, title, content, media_url, county, tags } = req.body;
    const userUuid = req.user.uuid;
    const userTrustScore = req.user.trust_score;

    // Auto-moderation check
    const moderationResult = await autoModerationCheck(content, userTrustScore);
    
    const postData = {
      uuid: userUuid,
      type,
      title: sanitizeInput(title, 200),
      content: sanitizeInput(content, 5000),
      media_url,
      county: sanitizeInput(county, 50),
      tags: safeJSONParse(tags),
      requires_approval: !moderationResult.approved,
      trust_boost: userTrustScore > 2.5,
      priority_level: moderationResult.priority,
      auto_flagged: moderationResult.flags?.length > 0
    };

    // Insert post
    const postId = await createPost(postData);
    
    // If auto-approved, update user trust score
    if (moderationResult.approved) {
      await updateTrustScore(userUuid, 'quality_content', 0.1, 'Auto-approved content');
    }

    // If requires approval, add to moderation queue
    if (!moderationResult.approved) {
      await addToModerationQueue(postId, 'post', null, 'Auto-flagged for review', moderationResult.priority);
    }

    res.json({
      postId,
      approved: moderationResult.approved,
      reason: moderationResult.reason,
      requiresApproval: !moderationResult.approved
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Community flagging
router.post('/posts/:id/flag', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const flaggedBy = req.user.uuid;

    const result = await processCommunityFlag(id, flaggedBy, reason);
    
    res.json({
      action: result.action,
      reason: result.reason
    });
  } catch (error) {
    console.error('Content flagging error:', error);
    res.status(500).json({ error: 'Failed to flag content' });
  }
});

// =====================================================
// MODERATION SYSTEM
// =====================================================

// Get moderation queue
router.get('/moderation/queue', authenticateStaff, checkPermission('approve_content'), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    const queue = await getModerationQueue(status, priority, page, limit);
    const stats = await getModerationStats();
    
    res.json({
      queue,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await getModerationQueueCount(status, priority)
      }
    });
  } catch (error) {
    console.error('Moderation queue error:', error);
    res.status(500).json({ error: 'Failed to get moderation queue' });
  }
});

// Approve content
router.put('/moderation/approve/:id', authenticateStaff, checkPermission('approve_content'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const moderatorId = req.user.id;

    await approveContent(id, moderatorId, reviewNotes);
    
    // Update author's trust score
    const content = await getContentById(id);
    await updateTrustScore(content.submitted_by, 'content_approved', 0.1, 'Content approved by moderator');
    
    res.json({ approved: true });
  } catch (error) {
    console.error('Content approval error:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

// Reject content
router.put('/moderation/reject/:id', authenticateStaff, checkPermission('approve_content'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes, reason } = req.body;
    const moderatorId = req.user.id;

    await rejectContent(id, moderatorId, reviewNotes, reason);
    
    // Update author's trust score
    const content = await getContentById(id);
    await updateTrustScore(content.submitted_by, 'content_rejected', -0.2, `Content rejected: ${reason}`);
    
    res.json({ rejected: true });
  } catch (error) {
    console.error('Content rejection error:', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

// Escalate to admin
router.post('/moderation/escalate/:id', authenticateStaff, checkPermission('escalate_to_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const moderatorId = req.user.id;

    await escalateContent(id, moderatorId, reason);
    
    res.json({ escalated: true });
  } catch (error) {
    console.error('Content escalation error:', error);
    res.status(500).json({ error: 'Failed to escalate content' });
  }
});

// Get moderation statistics
router.get('/moderation/stats', authenticateStaff, checkPermission('approve_content'), async (req, res) => {
  try {
    const stats = await getModerationStats();
    res.json(stats);
  } catch (error) {
    console.error('Moderation stats error:', error);
    res.status(500).json({ error: 'Failed to get moderation stats' });
  }
});

// =====================================================
// PEER REVIEW SYSTEM
// =====================================================

// Get content for peer review
router.get('/peer-review/queue', authenticateUser, async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const userTrustScore = req.user.trust_score;
    
    // Only high trust users can access peer review
    if (userTrustScore < 2.0) {
      return res.status(403).json({ error: 'Insufficient trust score for peer review' });
    }
    
    const reviewQueue = await getPeerReviewQueue(userUuid);
    res.json(reviewQueue);
  } catch (error) {
    console.error('Peer review queue error:', error);
    res.status(500).json({ error: 'Failed to get peer review queue' });
  }
});

// Submit peer review
router.post('/peer-review/:contentId', authenticateUser, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { reviewType, reviewNotes } = req.body;
    const reviewerUuid = req.user.uuid;
    const reviewerTrustScore = req.user.trust_score;
    
    // Only high trust users can submit peer reviews
    if (reviewerTrustScore < 2.0) {
      return res.status(403).json({ error: 'Insufficient trust score for peer review' });
    }
    
    const result = await submitPeerReview(contentId, reviewerUuid, reviewType, reviewNotes);
    
    res.json(result);
  } catch (error) {
    console.error('Peer review submission error:', error);
    res.status(500).json({ error: 'Failed to submit peer review' });
  }
});

// =====================================================
// CIVIC CHALLENGES SYSTEM
// =====================================================

// Get active challenges
router.get('/challenges', authenticateUser, async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const challenges = await getActiveChallenges(userUuid);
    res.json(challenges);
  } catch (error) {
    console.error('Challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// Create civic challenge (high trust users only)
router.post('/challenges', authenticateUser, async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const userTrustScore = req.user.trust_score;
    
    // Only high trust users can create challenges
    if (userTrustScore < 2.0) {
      return res.status(403).json({ error: 'Insufficient trust score to create challenges' });
    }
    
    const { title, description, challengeType, xpReward, requirements } = req.body;
    
    const challengeData = {
      title: sanitizeInput(title, 200),
      description: sanitizeInput(description, 1000),
      challenge_type: challengeType,
      xp_reward: parseInt(xpReward) || 50,
      requirements: safeJSONParse(requirements),
      created_by: userUuid
    };
    
    const challengeId = await createCivicChallenge(challengeData);
    
    res.json({
      challengeId,
      created: true
    });
  } catch (error) {
    console.error('Challenge creation error:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Join challenge
router.post('/challenges/:id/join', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userUuid = req.user.uuid;
    
    await joinChallenge(id, userUuid);
    
    res.json({ joined: true });
  } catch (error) {
    console.error('Challenge join error:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

// =====================================================
// GOVERNMENT ENGAGEMENT PIPELINE
// =====================================================

// Curate content for government submission
router.get('/government/curate', authenticateStaff, checkPermission('government_engagement'), async (req, res) => {
  try {
    const { timeframe = '7days' } = req.query;
    
    const curatedContent = await curateForGovernment(timeframe);
    
    res.json(curatedContent);
  } catch (error) {
    console.error('Government curation error:', error);
    res.status(500).json({ error: 'Failed to curate content' });
  }
});

// Submit to government
router.post('/government/submit', authenticateStaff, checkPermission('government_engagement'), async (req, res) => {
  try {
    const { title, contentSummary, originalContentIds, submissionType, targetOffice, priority } = req.body;
    const submittedBy = req.user.id;
    
    const submissionData = {
      title: sanitizeInput(title, 200),
      content_summary: sanitizeInput(contentSummary, 2000),
      original_content_ids: safeJSONParse(originalContentIds),
      submission_type: submissionType,
      target_office: sanitizeInput(targetOffice, 200),
      priority: priority || 'normal',
      submitted_by: submittedBy
    };
    
    const submissionId = await createGovernmentSubmission(submissionData);
    
    res.json({
      submissionId,
      submitted: true
    });
  } catch (error) {
    console.error('Government submission error:', error);
    res.status(500).json({ error: 'Failed to submit to government' });
  }
});

// Track government response
router.put('/government/response/:id', authenticateStaff, checkPermission('government_engagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { responseContent, responseOffice } = req.body;
    
    await trackGovernmentResponse(id, responseContent, responseOffice);
    
    res.json({ updated: true });
  } catch (error) {
    console.error('Government response tracking error:', error);
    res.status(500).json({ error: 'Failed to track government response' });
  }
});

// =====================================================
// CRISIS RESPONSE SYSTEM
// =====================================================

// Activate crisis response mode
router.post('/crisis/activate', authenticateStaff, checkPermission('crisis_response'), async (req, res) => {
  try {
    const { title, description, crisisType, severity, affectedCounties } = req.body;
    const createdBy = req.user.id;
    
    const crisisData = {
      title: sanitizeInput(title, 200),
      description: sanitizeInput(description, 2000),
      crisis_type: crisisType,
      severity: severity,
      affected_counties: safeJSONParse(affectedCounties),
      created_by: createdBy,
      response_mode: true
    };
    
    const crisisId = await createCrisisEvent(crisisData);
    
    res.json({
      crisisId,
      activated: true
    });
  } catch (error) {
    console.error('Crisis activation error:', error);
    res.status(500).json({ error: 'Failed to activate crisis response' });
  }
});

// Get active crisis events
router.get('/crisis/active', async (req, res) => {
  try {
    const activeCrises = await getActiveCrisisEvents();
    res.json(activeCrises);
  } catch (error) {
    console.error('Active crises error:', error);
    res.status(500).json({ error: 'Failed to get active crises' });
  }
});

// =====================================================
// COMMUNITY WARNINGS SYSTEM
// =====================================================

// Issue community warning
router.post('/warnings', authenticateStaff, checkPermission('issue_warnings'), async (req, res) => {
  try {
    const { userUuid, warningType, warningLevel, reason } = req.body;
    const issuedBy = req.user.id;
    
    const warningData = {
      user_uuid: userUuid,
      warning_type: warningType,
      warning_level: warningLevel,
      reason: sanitizeInput(reason, 500),
      issued_by: issuedBy
    };
    
    const warningId = await issueCommunityWarning(warningData);
    
    res.json({
      warningId,
      issued: true
    });
  } catch (error) {
    console.error('Warning issuance error:', error);
    res.status(500).json({ error: 'Failed to issue warning' });
  }
});

// Get user warnings
router.get('/warnings/:userUuid', authenticateUser, async (req, res) => {
  try {
    const { userUuid } = req.params;
    
    // Users can only see their own warnings, staff can see any
    if (!req.isStaffUser && req.user.uuid !== userUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const warnings = await getUserWarnings(userUuid);
    res.json(warnings);
  } catch (error) {
    console.error('User warnings error:', error);
    res.status(500).json({ error: 'Failed to get user warnings' });
  }
});

// Acknowledge warning
router.put('/warnings/:id/acknowledge', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userUuid = req.user.uuid;
    
    await acknowledgeWarning(id, userUuid);
    
    res.json({ acknowledged: true });
  } catch (error) {
    console.error('Warning acknowledgement error:', error);
    res.status(500).json({ error: 'Failed to acknowledge warning' });
  }
});

// =====================================================
// ANALYTICS AND REPORTING
// =====================================================

// Get platform analytics (admin only)
router.get('/analytics/platform', authenticateStaff, checkPermission('view_analytics'), async (req, res) => {
  try {
    const analytics = await getPlatformAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ error: 'Failed to get platform analytics' });
  }
});

// Get user analytics
router.get('/analytics/user/:uuid', authenticateUser, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Users can only see their own analytics, staff can see any
    if (!req.isStaffUser && req.user.uuid !== uuid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = await getUserAnalytics(uuid);
    res.json(analytics);
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// =====================================================
// LEARNING SYSTEM ROUTES
// =====================================================

// Get learning challenges
router.get('/learning/challenges', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "learning_challenges"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Learning challenges table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM learning_challenges WHERE active = 1 ORDER BY created_at DESC', (err, results) => {
        if (err) {
          console.error('Error fetching learning challenges:', err);
          return res.status(500).json({ error: 'Failed to fetch challenges' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Learning challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch learning challenges' });
  }
});

// Get learning badges
router.get('/learning/badges', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "learning_badges"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Learning badges table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM learning_badges ORDER BY required_xp ASC', (err, results) => {
        if (err) {
          console.error('Error fetching learning badges:', err);
          return res.status(500).json({ error: 'Failed to fetch badges' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Learning badges error:', error);
    res.status(500).json({ error: 'Failed to fetch learning badges' });
  }
});

// Get user learning stats
router.get('/learning/stats/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "user_learning_stats"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('User learning stats table does not exist, returning default stats');
        return res.json({ user_uuid: uuid, total_xp: 0, badges_earned: 0, modules_completed: 0 });
      }
      
      db.query('SELECT * FROM user_learning_stats WHERE user_uuid = ?', [uuid], (err, results) => {
        if (err) {
          console.error('Error fetching user learning stats:', err);
          return res.status(500).json({ error: 'Failed to fetch learning stats' });
        }
        
        res.json(results[0] || { user_uuid: uuid, total_xp: 0, badges_earned: 0, modules_completed: 0 });
      });
    });
  } catch (error) {
    console.error('User learning stats error:', error);
    res.status(500).json({ error: 'Failed to fetch learning stats' });
  }
});

// Get user learning progress
router.get('/learning/user-progress/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "user_learning_progress"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('User learning progress table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM user_learning_progress WHERE user_uuid = ? ORDER BY module_id ASC', [uuid], (err, results) => {
        if (err) {
          console.error('Error fetching user learning progress:', err);
          return res.status(500).json({ error: 'Failed to fetch learning progress' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('User learning progress error:', error);
    res.status(500).json({ error: 'Failed to fetch learning progress' });
  }
});

// Get learning quizzes
router.get('/learning/quizzes', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "learning_quizzes"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Learning quizzes table does not exist, returning empty array');
        return res.json([]);
        }
      
      db.query('SELECT * FROM learning_quizzes WHERE active = 1 ORDER BY difficulty ASC', (err, results) => {
        if (err) {
          console.error('Error fetching learning quizzes:', err);
          return res.status(500).json({ error: 'Failed to fetch quizzes' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Learning quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch learning quizzes' });
  }
});

// Get learning modules
router.get('/learning/modules', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "learning_modules"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Learning modules table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM learning_modules WHERE status = "published" ORDER BY is_featured DESC, created_at DESC', (err, results) => {
        if (err) {
          console.error('Error fetching learning modules:', err);
          return res.status(500).json({ error: 'Failed to fetch modules' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Learning modules error:', error);
    res.status(500).json({ error: 'Failed to fetch learning modules' });
  }
});

// Get lessons for a module
router.get('/learning/modules/:moduleId/lessons', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "lessons"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Lessons table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC', [moduleId], (err, results) => {
        if (err) {
          console.error('Error fetching lessons:', err);
          return res.status(500).json({ error: 'Failed to fetch lessons' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get posts for the feed
router.get('/posts', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "posts"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Posts table does not exist, returning empty array');
        return res.json([]);
      }
      
      db.query('SELECT * FROM posts ORDER BY featured DESC, created_at DESC LIMIT 20', (err, results) => {
        if (err) {
          console.error('Error fetching posts:', err);
          return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// =====================================================
// POLLS SYSTEM ROUTES
// =====================================================

// Get active polls
router.get('/polls/active', async (req, res) => {
  try {
    const db = require('./server').db;
    
    // Check if table exists first
    db.query('SHOW TABLES LIKE "polls"', (err, tableExists) => {
      if (err || tableExists.length === 0) {
        console.log('Polls table does not exist, returning empty array');
        return res.json([]);
      }
      
      // Check if end_date column exists, if not use a simpler query
      db.query('SELECT * FROM polls WHERE active = 1 ORDER BY created_at DESC', (err, results) => {
        if (err) {
          console.error('Error fetching active polls:', err);
          return res.status(500).json({ error: 'Failed to fetch active polls' });
        }
        
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Active polls error:', error);
    res.status(500).json({ error: 'Failed to fetch active polls' });
  }
});

// Get general user stats (for authenticated users)
router.get('/users/stats', authenticateUser, async (req, res) => {
  try {
    const db = require('./server').db;
    const userUuid = req.user.uuid;
    
    // Get user's basic stats with fallback for missing tables
    db.query(`
      SELECT 
        u.uuid,
        u.nickname,
        u.emoji,
        u.xp,
        u.streak,
        u.trust_score,
        u.county
      FROM users u
      WHERE u.uuid = ?
    `, [userUuid], (err, results) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        return res.status(500).json({ error: 'Failed to fetch user stats' });
      }
      
      const user = results[0] || {
        uuid: userUuid,
        nickname: 'Anonymous',
        emoji: '🌟',
        xp: 0,
        streak: 0,
        trust_score: 1.0,
        county: 'Nairobi'
      };
      
      // Try to get additional stats if tables exist
      db.query('SHOW TABLES LIKE "user_badges"', (err, badgesTableExists) => {
        if (err || badgesTableExists.length === 0) {
          user.badges_count = 0;
        } else {
          db.query('SELECT COUNT(*) as count FROM user_badges WHERE user_uuid = ?', [userUuid], (err, badgeCount) => {
            user.badges_count = badgeCount[0]?.count || 0;
          });
        }
        
        db.query('SHOW TABLES LIKE "posts"', (err, postsTableExists) => {
          if (err || postsTableExists.length === 0) {
            user.posts_count = 0;
          } else {
            db.query('SELECT COUNT(*) as count FROM posts WHERE uuid = ?', [userUuid], (err, postCount) => {
              user.posts_count = postCount[0]?.count || 0;
            });
          }
          
          db.query('SHOW TABLES LIKE "post_likes"', (err, likesTableExists) => {
            if (err || likesTableExists.length === 0) {
              user.likes_received = 0;
            } else {
              db.query('SELECT COUNT(*) as count FROM post_likes l JOIN posts p ON l.post_id = p.id WHERE p.uuid = ?', [userUuid], (err, likeCount) => {
                user.likes_received = likeCount[0]?.count || 0;
              });
            }
            
            res.json(user);
          });
        });
      });
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// =====================================================
// HELPER FUNCTIONS (to be implemented)
// =====================================================

// These functions need to be implemented based on your database setup
const sanitizeInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
};

const safeJSONParse = (jsonString, fallback = []) => {
  try {
    if (typeof jsonString === 'object') return jsonString || fallback;
    if (typeof jsonString === 'string' && jsonString.trim()) {
      return JSON.parse(jsonString);
    }
    return fallback;
  } catch (e) {
    console.warn('Invalid JSON:', jsonString);
    return fallback;
  }
};

// Database functions (placeholders - implement based on your setup)
const updateUserLastActive = async (uuid) => { /* implementation */ };
const getUserByUuid = async (uuid) => { /* implementation */ };
const getUserStats = async (uuid) => { /* implementation */ };
const getTrustLeaderboard = async () => { /* implementation */ };
const createPost = async (postData) => { /* implementation */ };
const addToModerationQueue = async (contentId, contentType, flaggedBy, reason, priority) => { /* implementation */ };
const getModerationQueue = async (status, priority, page, limit) => { /* implementation */ };
const getModerationStats = async () => { /* implementation */ };
const getModerationQueueCount = async (status, priority) => { /* implementation */ };
const approveContent = async (id, moderatorId, reviewNotes) => { /* implementation */ };
const rejectContent = async (id, moderatorId, reviewNotes, reason) => { /* implementation */ };
const escalateContent = async (id, moderatorId, reason) => { /* implementation */ };
const getContentById = async (id) => { /* implementation */ };
const getPeerReviewQueue = async (userUuid) => { /* implementation */ };
const submitPeerReview = async (contentId, reviewerUuid, reviewType, reviewNotes) => { /* implementation */ };
const getActiveChallenges = async (userUuid) => { /* implementation */ };
const createCivicChallenge = async (challengeData) => { /* implementation */ };
const joinChallenge = async (challengeId, userUuid) => { /* implementation */ };
const curateForGovernment = async (timeframe) => { /* implementation */ };
const createGovernmentSubmission = async (submissionData) => { /* implementation */ };
const trackGovernmentResponse = async (id, responseContent, responseOffice) => { /* implementation */ };
const createCrisisEvent = async (crisisData) => { /* implementation */ };
const getActiveCrisisEvents = async () => { /* implementation */ };
const issueCommunityWarning = async (warningData) => { /* implementation */ };
const getUserWarnings = async (userUuid) => { /* implementation */ };
const acknowledgeWarning = async (id, userUuid) => { /* implementation */ };
const getPlatformAnalytics = async () => { /* implementation */ };
const getUserAnalytics = async (uuid) => { /* implementation */ };

module.exports = router;
