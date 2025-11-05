// Script to verify all politics/politician API endpoints exist
const fs = require('fs');
const path = require('path');

// All expected API endpoints for politicians/politics admin tools
const expectedEndpoints = {
  // Politician Management
  politicians: {
    'POST /api/admin/politicians': 'Create politician',
    'PUT /api/admin/politicians/:id': 'Update politician',
    'DELETE /api/admin/politicians/:id': 'Delete politician',
    'POST /api/admin/politicians/:id/publish': 'Publish politician',
    'POST /api/admin/politicians/:id/unpublish': 'Unpublish politician',
    'GET /api/admin/politicians/:id': 'Get single politician',
    'GET /api/admin/politicians/search': 'Search politicians',
    'POST /api/admin/politicians/bulk-delete': 'Bulk delete politicians',
    'POST /api/admin/politicians/bulk-update': 'Bulk update politicians',
  },

  // Timeline Events
  timeline: {
    'POST /api/admin/timeline-events': 'Create timeline event',
    'PUT /api/admin/timeline-events/:id': 'Update timeline event',
    'DELETE /api/admin/timeline-events/:id': 'Delete timeline event',
    'GET /api/admin/timeline-events': 'Get timeline events (with filters)',
  },

  // Commitments
  commitments: {
    'POST /api/admin/commitments': 'Create commitment',
    'PUT /api/admin/commitments/:id': 'Update commitment',
    'PATCH /api/admin/commitments/:id/progress': 'Update commitment progress',
    'DELETE /api/admin/commitments/:id': 'Delete commitment',
    'GET /api/admin/commitments': 'Get commitments (with filters)',
  },

  // Voting Records
  voting: {
    'POST /api/admin/voting-records': 'Create voting record',
    'PUT /api/admin/voting-records/:id': 'Update voting record',
    'DELETE /api/admin/voting-records/:id': 'Delete voting record',
    'GET /api/admin/voting-records': 'Get voting records (with filters)',
    'POST /api/admin/voting-records/bulk-import': 'Bulk import voting records',
    'GET /api/admin/custom-categories': 'Get custom categories',
    'POST /api/admin/custom-categories': 'Create custom category',
  },

  // Documents
  documents: {
    'POST /api/admin/documents': 'Create document',
    'POST /api/admin/documents/upload': 'Upload document file',
    'PUT /api/admin/documents/:id': 'Update document',
    'DELETE /api/admin/documents/:id': 'Delete document',
    'GET /api/admin/documents/:id': 'Get single document',
    'GET /api/admin/documents': 'Get documents (with filters)',
  },

  // News Management
  news: {
    'GET /api/admin/news': 'Get all news',
    'GET /api/admin/news/:id': 'Get single news article',
    'POST /api/admin/news': 'Create news article',
    'PUT /api/admin/news/:id': 'Update news article',
    'DELETE /api/admin/news/:id': 'Delete news article',
    'GET /api/admin/news/:newsId/politicians': 'Get politicians linked to news',
    'POST /api/admin/news/:newsId/link/:politicianId': 'Link news to politician',
    'DELETE /api/admin/news/:newsId/unlink/:politicianId': 'Unlink news from politician',
  },

  // Analytics
  analytics: {
    'GET /api/admin/analytics': 'Get analytics data',
    'GET /api/admin/analytics/engagement': 'Get engagement metrics',
    'GET /api/admin/analytics/content': 'Get content metrics',
    'GET /api/admin/analytics/performance': 'Get performance metrics',
  },

  // Reports
  reports: {
    'POST /api/admin/reports/generate': 'Generate report',
    'GET /api/admin/reports/:reportId/status': 'Get report status',
    'POST /api/admin/reports/schedule': 'Schedule report',
    'GET /api/admin/reports/scheduled': 'Get scheduled reports',
    'PUT /api/admin/reports/scheduled/:id': 'Update scheduled report',
    'DELETE /api/admin/reports/scheduled/:id': 'Delete scheduled report',
  },

  // Statistics & Overview
  statistics: {
    'GET /api/admin/statistics': 'Get admin statistics',
    'GET /api/admin/audit-log/recent': 'Get recent activity',
    'GET /api/admin/audit-log/stats': 'Get audit log statistics',
  },

  // System & Audit
  system: {
    'POST /api/admin/integrity/check': 'Run integrity check',
    'GET /api/admin/integrity/report': 'Get integrity report',
    'POST /api/admin/integrity/auto-fix': 'Auto-fix issues',
    'GET /api/admin/system/health': 'Get system health',
    'POST /api/admin/system/cache/clear': 'Clear cache',
    'GET /api/admin/system/audit-logs': 'Get audit logs',
  },

  // Public-facing endpoints (politics-api-routes)
  public: {
    'GET /api/politicians': 'Get all politicians (public)',
    'GET /api/politicians/:id': 'Get single politician (public)',
    'GET /api/politicians/:id/documents': 'Get politician documents',
    'GET /api/politicians/:id/timeline': 'Get politician timeline',
    'GET /api/politicians/:id/commitments': 'Get politician commitments',
    'GET /api/politicians/:id/voting-records': 'Get politician voting records',
    'GET /api/politicians/:id/career': 'Get politician career info',
    'GET /api/politicians/:id/news': 'Get politician news',
  },
};

console.log('🔍 Verifying Politics/Politician API Endpoints\n');
console.log('='.repeat(100));

let totalEndpoints = 0;
let verifiedEndpoints = 0;
let missingEndpoints = [];

// Check which API route files exist
const apiRouteFiles = [
  'politics-api-routes.js',
  'admin-api-routes.js',
  'timeline-api-routes.js',
  'commitment-api-routes.js',
  'voting-api-routes.js',
  'document-api-routes.js',
  'news-api-routes.js',
  'analytics-api-routes.js',
  'reports-api-routes.js',
  'system-api-routes.js',
  'integrity-api-routes.js',
  'audit-log-api-routes.js',
];

console.log('\n📂 Checking API Route Files:\n');
const existingFiles = [];
const missingFiles = [];

for (const file of apiRouteFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MISSING`);
  }
}

console.log('\n' + '='.repeat(100));
console.log('\n📊 Expected Endpoints by Category:\n');

for (const [category, endpoints] of Object.entries(expectedEndpoints)) {
  console.log(`\n🔹 ${category.toUpperCase()}`);
  console.log('-'.repeat(100));

  for (const [endpoint, description] of Object.entries(endpoints)) {
    totalEndpoints++;
    console.log(`   ${endpoint.padEnd(60)} - ${description}`);
  }
}

console.log('\n' + '='.repeat(100));
console.log('\n📈 Summary:\n');
console.log(`   Total expected endpoints: ${totalEndpoints}`);
console.log(`   API route files found: ${existingFiles.length}/${apiRouteFiles.length}`);

if (missingFiles.length > 0) {
  console.log(`\n⚠️  Missing API route files:`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Read AdminAPIService.ts to verify frontend is calling these endpoints
console.log('\n' + '='.repeat(100));
console.log('\n📱 Checking Frontend API Service Integration:\n');

const apiServicePath = path.join(__dirname, 'RadaAppClean', 'src', 'services', 'AdminAPIService.ts');
if (fs.existsSync(apiServicePath)) {
  console.log('✅ AdminAPIService.ts exists');

  const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

  // Check for key methods
  const keyMethods = [
    'createPolitician',
    'updatePolitician',
    'publishPolitician',
    'createTimelineEvent',
    'createCommitment',
    'createVotingRecord',
    'uploadDocument',
    'createNews',
    'getAnalytics',
    'generateReport',
    'getStatistics',
  ];

  console.log('\n🔍 Key API methods in AdminAPIService.ts:\n');
  for (const method of keyMethods) {
    if (apiServiceContent.includes(`async ${method}(`)) {
      console.log(`   ✅ ${method}()`);
    } else {
      console.log(`   ❌ ${method}() - MISSING`);
    }
  }
} else {
  console.log('❌ AdminAPIService.ts NOT FOUND');
}

console.log('\n' + '='.repeat(100));
console.log('\n✅ Verification complete!\n');
console.log('📝 Next steps:');
console.log('   1. Ensure all API route files exist and are properly imported in server.js');
console.log('   2. Verify each endpoint is implemented in the route files');
console.log('   3. Test endpoints manually or with automated tests');
console.log('   4. Check that frontend components are using the API service methods\n');
