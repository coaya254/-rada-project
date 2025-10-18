const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auditLog } = require('./audit-log-middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|xlsx|xls|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

module.exports = (db) => {
  // Get all documents (with optional politician filter)
  router.get('/api/admin/documents', (req, res) => {
    const { politicianId } = req.query;

    let query = 'SELECT * FROM documents';
    const params = [];

    if (politicianId) {
      query += ' WHERE politician_id = ?';
      params.push(politicianId);
    }

    query += ' ORDER BY date_published DESC';

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching documents:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch documents'
        });
      }

      // Parse JSON fields
      const documents = results.map(doc => ({
        ...doc,
        tags: doc.tags ? (typeof doc.tags === 'string' ? JSON.parse(doc.tags) : doc.tags) : [],
        key_points: doc.key_points ? (typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points) : []
      }));

      res.json({
        success: true,
        data: documents
      });
    });
  });

  // Get single document by ID
  router.get('/api/admin/documents/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM documents WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching document:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch document'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const doc = {
        ...results[0],
        tags: results[0].tags ? JSON.parse(results[0].tags) : [],
        key_points: results[0].key_points ? JSON.parse(results[0].key_points) : []
      };

      res.json({
        success: true,
        data: doc
      });
    });
  });

  // Create new document
  router.post('/api/admin/documents', auditLog('CREATE', 'document'), (req, res) => {
    const {
      politician_id,
      title,
      type,
      description,
      content,
      date_published,
      source_url,
      file_url,
      status,
      tags,
      language,
      is_featured,
      transcript_available,
      summary,
      key_points
    } = req.body;

    // Validate required fields
    if (!politician_id || !title || !type || !date_published) {
      return res.status(400).json({
        success: false,
        error: 'Politician ID, title, type, and date published are required'
      });
    }

    const query = `
      INSERT INTO documents (
        politician_id, title, type, description, content, date_published,
        source_url, file_url, status, tags, language, is_featured,
        transcript_available, summary, key_points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      politician_id,
      title,
      type,
      description || '',
      content || '',
      date_published,
      source_url || null,
      file_url || null,
      status || 'draft',
      tags ? JSON.stringify(tags) : null,
      language || 'en',
      is_featured || false,
      transcript_available || false,
      summary || '',
      key_points ? JSON.stringify(key_points) : null
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating document:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create document'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          politician_id,
          title,
          type
        },
        message: 'Document created successfully'
      });
    });
  });

  // Update document
  router.put('/api/admin/documents/:id', auditLog('UPDATE', 'document'), (req, res) => {
    const { id } = req.params;
    const {
      title,
      type,
      description,
      content,
      date_published,
      source_url,
      file_url,
      status,
      tags,
      language,
      is_featured,
      transcript_available,
      summary,
      key_points
    } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (date_published !== undefined) {
      updates.push('date_published = ?');
      values.push(date_published);
    }
    if (source_url !== undefined) {
      updates.push('source_url = ?');
      values.push(source_url);
    }
    if (file_url !== undefined) {
      updates.push('file_url = ?');
      values.push(file_url);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(tags));
    }
    if (language !== undefined) {
      updates.push('language = ?');
      values.push(language);
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(is_featured);
    }
    if (transcript_available !== undefined) {
      updates.push('transcript_available = ?');
      values.push(transcript_available);
    }
    if (summary !== undefined) {
      updates.push('summary = ?');
      values.push(summary);
    }
    if (key_points !== undefined) {
      updates.push('key_points = ?');
      values.push(JSON.stringify(key_points));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating document:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to update document'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.json({
        success: true,
        message: 'Document updated successfully'
      });
    });
  });

  // Delete document
  router.delete('/api/admin/documents/:id', auditLog('DELETE', 'document'), (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM documents WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting document:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete document'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    });
  });

  // Upload document file
  router.post('/api/admin/documents/upload', auditLog('UPLOAD', 'document'), upload.single('document'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/documents/${req.file.filename}`;

      res.status(201).json({
        success: true,
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          file_url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload document'
      });
    }
  });

  return router;
};
