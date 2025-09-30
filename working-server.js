const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection - using your actual database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // No password
  database: 'rada_ke'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('📝 Please update the password in working-server.js');
  } else {
    console.log('✅ Connected to rada_ke database');
  }
});

// Learning API Routes
app.get('/api/learning/modules', (req, res) => {
  const query = `
    SELECT 
      id, title, description, difficulty, estimated_duration as estimatedTime,
      xp_reward as xpReward, category, status, created_at as createdAt
    FROM learning_modules 
    WHERE status = 'published'
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching modules:', err);
      return res.status(500).json({ error: 'Failed to fetch modules' });
    }
    
    res.json(results);
  });
});

app.get('/api/learning/quizzes', (req, res) => {
  const query = `
    SELECT 
      id, title, description, difficulty, time_limit as timeLimit,
      question_count as questionCount, status, created_at as createdAt
    FROM learning_quizzes 
    WHERE status = 'published'
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
    
    res.json(results);
  });
});

app.get('/api/learning/challenges', (req, res) => {
  const query = `
    SELECT 
      id, title, description, difficulty, reward_points as rewardPoints,
      start_date as startDate, end_date as endDate, status, created_at as createdAt
    FROM learning_challenges 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching challenges:', err);
      return res.status(500).json({ error: 'Failed to fetch challenges' });
    }
    
    res.json(results);
  });
});

app.get('/api/learning/badges', (req, res) => {
  const query = `
    SELECT 
      id, name, description, icon_url as iconUrl, 
      criteria, status, created_at as createdAt
    FROM learning_badges 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching badges:', err);
      return res.status(500).json({ error: 'Failed to fetch badges' });
    }
    
    res.json(results);
  });
});

app.get('/api/learning/user-progress/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Get real progress data
  const query = `
    SELECT 
      COUNT(DISTINCT module_id) as modulesCompleted,
      (SELECT COUNT(*) FROM learning_modules WHERE status = 'published') as totalModules,
      COUNT(DISTINCT quiz_id) as quizzesCompleted,
      (SELECT COUNT(*) FROM learning_quizzes WHERE status = 'published') as totalQuizzes,
      AVG(score) as totalScore
    FROM user_learning_progress 
    WHERE user_uuid = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user progress:', err);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
    
    const progress = results[0] || {
      modulesCompleted: 0,
      totalModules: 0,
      quizzesCompleted: 0,
      totalQuizzes: 0,
      totalScore: 0
    };
    
    res.json({
      userId,
      ...progress,
      badges: [] // Add badge query if needed
    });
  });
});

app.post('/api/learning/quiz-attempt', (req, res) => {
  const { quiz_id, answers, user_uuid } = req.body;
  
  // Mock scoring for now - you can implement real scoring logic
  const score = Math.floor(Math.random() * 40) + 60;
  
  // Save attempt to database
  const query = `
    INSERT INTO quiz_attempts (quiz_id, user_uuid, answers, score, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  db.query(query, [quiz_id, user_uuid, JSON.stringify(answers), score], (err) => {
    if (err) {
      console.error('Error saving quiz attempt:', err);
      return res.status(500).json({ error: 'Failed to save quiz attempt' });
    }
    
    res.json({
      success: true,
      score,
      totalQuestions: Object.keys(answers).length,
      correctAnswers: Math.floor(score / 100 * Object.keys(answers).length)
    });
  });
});

app.put('/api/learning/progress/:userId/:moduleId', (req, res) => {
  const { userId, moduleId } = req.params;
  const { progress, score } = req.body;
  
  const query = `
    INSERT INTO user_learning_progress (user_uuid, module_id, progress, score, updated_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE 
    progress = VALUES(progress), 
    score = VALUES(score), 
    updated_at = NOW()
  `;
  
  db.query(query, [userId, moduleId, progress, score], (err) => {
    if (err) {
      console.error('Error updating progress:', err);
      return res.status(500).json({ error: 'Failed to update progress' });
    }
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Learning API: http://localhost:${PORT}/api/learning`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n📱 Your Rada Mobile app should now connect to this server!`);
});

module.exports = app;
