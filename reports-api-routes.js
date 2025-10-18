const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for reports (in production, use database)
const reports = new Map();
const scheduledReports = new Map();

module.exports = (db) => {
  // Generate report
  router.post('/api/admin/reports/generate', async (req, res) => {
    const { templateId, format, options } = req.body;

    if (!templateId || !format) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and format are required'
      });
    }

    const reportId = uuidv4();

    // Store report metadata
    reports.set(reportId, {
      id: reportId,
      templateId,
      format,
      options,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    });

    // Simulate async report generation
    setTimeout(() => {
      const report = reports.get(reportId);
      if (report) {
        report.status = 'completed';
        report.progress = 100;
        report.downloadUrl = `/api/admin/reports/${reportId}/download`;
        reports.set(reportId, report);
      }
    }, 3000); // 3 second simulation

    res.status(202).json({
      success: true,
      data: {
        reportId,
        downloadUrl: `/api/admin/reports/${reportId}/download`,
        status: 'pending'
      },
      message: 'Report generation started'
    });
  });

  // Get report status
  router.get('/api/admin/reports/:reportId/status', (req, res) => {
    const { reportId } = req.params;

    const report = reports.get(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: report.status,
        progress: report.progress,
        downloadUrl: report.downloadUrl,
        error: report.error
      }
    });
  });

  // Download report (placeholder)
  router.get('/api/admin/reports/:reportId/download', (req, res) => {
    const { reportId } = req.params;

    const report = reports.get(reportId);

    if (!report || report.status !== 'completed') {
      return res.status(404).json({
        success: false,
        error: 'Report not ready or not found'
      });
    }

    // In a real implementation, you'd generate and send the actual file
    res.json({
      success: true,
      data: {
        reportId,
        message: 'Report download would start here',
        format: report.format
      }
    });
  });

  // Schedule report
  router.post('/api/admin/reports/schedule', (req, res) => {
    const { name, templateId, frequency, recipients, options } = req.body;

    if (!name || !templateId || !frequency || !recipients) {
      return res.status(400).json({
        success: false,
        error: 'Name, template ID, frequency, and recipients are required'
      });
    }

    const scheduleId = uuidv4();

    const schedule = {
      id: scheduleId,
      name,
      templateId,
      frequency,
      recipients,
      options,
      active: true,
      createdAt: new Date(),
      lastRun: null,
      nextRun: calculateNextRun(frequency)
    };

    scheduledReports.set(scheduleId, schedule);

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Report scheduled successfully'
    });
  });

  // Get all scheduled reports
  router.get('/api/admin/reports/scheduled', (req, res) => {
    const schedules = Array.from(scheduledReports.values());

    res.json({
      success: true,
      data: schedules
    });
  });

  // Update scheduled report
  router.put('/api/admin/reports/scheduled/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const schedule = scheduledReports.get(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled report not found'
      });
    }

    const updatedSchedule = { ...schedule, ...updates, updatedAt: new Date() };
    scheduledReports.set(id, updatedSchedule);

    res.json({
      success: true,
      data: updatedSchedule,
      message: 'Scheduled report updated successfully'
    });
  });

  // Delete scheduled report
  router.delete('/api/admin/reports/scheduled/:id', (req, res) => {
    const { id } = req.params;

    if (!scheduledReports.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled report not found'
      });
    }

    scheduledReports.delete(id);

    res.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    });
  });

  return router;
};

// Helper function to calculate next run time
function calculateNextRun(frequency) {
  const now = new Date();
  const nextRun = new Date(now);

  switch (frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    default:
      nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}
