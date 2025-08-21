const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rada.ke server is running',
    timestamp: new Date().toISOString()
  });
});

// Test user creation endpoint
app.post('/api/users/create', (req, res) => {
  const { nickname = 'Anonymous', emoji = '🧑', county = '' } = req.body;
  
  // For now, just return a mock response
  res.json({
    uuid: 'test-uuid-' + Date.now(),
    nickname,
    emoji,
    county,
    xp: 0,
    badges: ['civic_newbie'],
    streak: 0
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
