// Production Server Configuration for cPanel
// This is a wrapper for server.js optimized for cPanel deployment

const path = require('path');
const express = require('express');

// Load environment variables
require('dotenv').config({ path: '.env.cpanel' });

// Import main server
const app = require('./server');

// Serve PoliHub static files from build directory
const polihubBuildPath = path.join(__dirname, 'polihub', 'build');
app.use(express.static(polihubBuildPath));

// Handle React routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(polihubBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 PoliHub Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Domain: ${process.env.CLIENT_URL}`);
  console.log(`💾 Database: ${process.env.DB_NAME}`);
});

module.exports = app;
