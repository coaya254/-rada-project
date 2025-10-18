const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get comprehensive analytics data
  router.get('/api/admin/analytics', (req, res) => {
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let daysAgo = 30;
    if (period === '7d') daysAgo = 7;
    else if (period === '90d') daysAgo = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get overview stats
    const overviewQuery = `
      SELECT
        (SELECT COUNT(*) FROM politicians) as totalPoliticians,
        (SELECT COUNT(*) FROM commitments) as totalCommitments,
        (SELECT COUNT(*) FROM voting_records) as totalVotingRecords,
        (SELECT COUNT(*) FROM documents) as totalDocuments,
        (SELECT COUNT(*) FROM timeline_events) as totalTimelineEvents
    `;

    // Get recently added content
    const recentContentQuery = `
      SELECT
        (SELECT COUNT(*) FROM politicians WHERE created_at >= ?) as politicians,
        (SELECT COUNT(*) FROM commitments WHERE created_at >= ?) as commitments,
        (SELECT COUNT(*) FROM documents WHERE created_at >= ?) as documents,
        (SELECT COUNT(*) FROM timeline_events WHERE created_at >= ?) as timeline
    `;

    // Get quality metrics
    const qualityQuery = `
      SELECT
        (SELECT COUNT(*) FROM politicians WHERE bio IS NOT NULL AND bio != '') as completedProfiles,
        (SELECT COUNT(*) FROM politicians WHERE image_url IS NOT NULL AND image_url != '') as profilesWithImages,
        (SELECT COUNT(*) FROM commitments WHERE source_links IS NOT NULL AND source_links != 'null') as sourcedCommitments,
        (SELECT COUNT(*) FROM documents) as verifiedDocuments
    `;

    // Execute all queries
    db.query(overviewQuery, (err1, overviewResult) => {
      if (err1) {
        console.error('Error fetching overview analytics:', err1);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch analytics'
        });
      }

      db.query(recentContentQuery, [startDate, startDate, startDate, startDate], (err2, recentResult) => {
        if (err2) {
          console.error('Error fetching recent content analytics:', err2);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
          });
        }

        db.query(qualityQuery, (err3, qualityResult) => {
          if (err3) {
            console.error('Error fetching quality metrics:', err3);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch analytics'
            });
          }

          res.json({
            success: true,
            data: {
              overview: overviewResult[0],
              engagement: {
                dailyActiveUsers: 0, // TODO: Implement user tracking
                weeklyActiveUsers: 0,
                monthlyActiveUsers: 0,
                averageSessionDuration: 0,
                mostViewedPoliticians: []
              },
              content: {
                recentlyAdded: recentResult[0],
                qualityMetrics: qualityResult[0]
              },
              performance: {
                apiResponseTime: 0, // TODO: Implement monitoring
                uptime: 99.9,
                errorRate: 0,
                cacheHitRate: 0
              }
            }
          });
        });
      });
    });
  });

  // Get engagement metrics
  router.get('/api/admin/analytics/engagement', (req, res) => {
    const { period = '30d' } = req.query;

    let daysAgo = 30;
    if (period === '7d') daysAgo = 7;
    else if (period === '90d') daysAgo = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Mock engagement data (in a real app, you'd have user interaction tables)
    res.json({
      success: true,
      data: {
        period,
        total_views: 0, // TODO: Implement views tracking
        unique_users: 0, // TODO: Implement user tracking
        avg_time_on_site: 0, // TODO: Implement time tracking
        top_politicians: [] // TODO: Implement popularity tracking
      }
    });
  });

  // Get content metrics
  router.get('/api/admin/analytics/content', (req, res) => {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM politicians) as total_politicians,
        (SELECT COUNT(*) FROM timeline_events) as total_timeline_events,
        (SELECT COUNT(*) FROM commitments) as total_commitments,
        (SELECT COUNT(*) FROM voting_records) as total_voting_records,
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COUNT(*) FROM news) as total_news
    `;

    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching content metrics:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch content metrics'
        });
      }

      res.json({
        success: true,
        data: result[0]
      });
    });
  });

  // Get performance metrics
  router.get('/api/admin/analytics/performance', (req, res) => {
    // Mock performance data (in a real app, you'd track API response times, etc.)
    res.json({
      success: true,
      data: {
        api_response_time: 0, // TODO: Implement API monitoring
        database_queries: 0, // TODO: Implement query tracking
        cache_hit_rate: 0, // TODO: Implement cache monitoring
        error_rate: 0 // TODO: Implement error tracking
      }
    });
  });

  return router;
};
