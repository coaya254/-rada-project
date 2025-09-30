const express = require('express');

module.exports = (app, db) => {
  // Health check
  app.get('/api/admin/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });
};


