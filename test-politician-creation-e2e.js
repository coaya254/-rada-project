// End-to-End Integration Test: Create Complete Politician Profile
// This script tests the entire admin workflow by creating a politician with all related data

const mysql = require('mysql2/promise');
const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_API_BASE_URL = `${API_BASE_URL}/admin`;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '!1754Swm',
  database: process.env.DB_NAME || 'radamtani'
};

// Test data - use timestamp to make unique
const timestamp = Date.now();
const testPolitician = {
  name: `Test Politician E2E ${timestamp}`,
  party: 'UDA',
  position: 'Test Member of Parliament',
  bio: 'This is a test politician created for end-to-end testing of the admin system.',
  image_url: 'https://example.com/test-politician.jpg',
  constituency: 'Test Constituency',
  current_position: 'MP for Test Constituency',
  title: 'Hon. Test Politician',
  education: 'PhD in Testing, Test University',
  wikipedia_summary: 'A test politician profile for system verification.',
  is_draft: true
};

const testTimelineEvent = {
  date: '2024-01-15',
  title: 'Elected as Member of Parliament',
  description: 'Successfully elected to represent Test Constituency in the National Assembly.',
  type: 'political',
  category: 'election',
  summary: 'Election victory in Test Constituency',
  source: 'IEBC',
  source_url: 'https://example.com/election-results',
};

const testCommitment = {
  title: 'Improve Test Infrastructure',
  description: 'Committed to upgrading roads and schools in Test Constituency within first year.',
  summary: 'Infrastructure development promise',
  status: 'in_progress',
  category: 'infrastructure',
  date_made: '2024-01-20',
  deadline: '2025-01-20',
  progress_percentage: 45,
  evidence_text: 'Road construction has begun on 3 major routes.',
};

const testVotingRecord = {
  bill_name: 'Test Infrastructure Bill 2024',
  bill_number: 'TB-2024-001',
  legislative_session: '2024 Session 1',
  vote: 'yes',
  vote_date: '2024-03-15',
  category: 'infrastructure',
  description: 'Bill to allocate funds for rural infrastructure development.',
};

const testDocument = {
  title: 'Test Policy Paper on Education',
  subtitle: 'A comprehensive approach to improving education',
  type: 'policy',
  category: 'education',
  date: '2024-02-10',
  description: 'Policy paper outlining education reforms for Test Constituency.',
  summary: 'Education reform proposals including teacher training and infrastructure.',
  briefing: 'Key proposals for education sector improvement.',
};

let connection;
let createdPoliticianId = null;

// Helper function to make API requests
async function makeAPIRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to verify data in database
async function verifyInDatabase(table, conditions) {
  const whereClause = Object.keys(conditions)
    .map(key => `${key} = ?`)
    .join(' AND ');
  const values = Object.values(conditions);

  const [rows] = await connection.query(
    `SELECT * FROM ${table} WHERE ${whereClause}`,
    values
  );

  return rows.length > 0 ? rows[0] : null;
}

// Test functions
async function testCreatePolitician() {
  console.log('\n🧪 TEST 1: Creating Politician');
  console.log('-'.repeat(80));

  const result = await makeAPIRequest('/politicians', 'POST', testPolitician);

  if (!result.success) {
    console.log('❌ FAILED: Could not create politician');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success || !result.data.data) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  createdPoliticianId = result.data.data.id;
  console.log(`✅ PASSED: Politician created with ID ${createdPoliticianId}`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politicians', { id: createdPoliticianId });
  if (!dbRecord) {
    console.log('❌ FAILED: Politician not found in database');
    return false;
  }

  console.log(`✅ PASSED: Politician verified in database`);
  console.log(`   Name: ${dbRecord.name}`);
  console.log(`   Party: ${dbRecord.party}`);
  console.log(`   Position: ${dbRecord.position}`);
  console.log(`   Is Draft: ${dbRecord.is_draft}`);

  return true;
}

async function testCreateTimelineEvent() {
  console.log('\n🧪 TEST 2: Creating Timeline Event');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  const eventData = { ...testTimelineEvent, politician_id: createdPoliticianId };
  const result = await makeAPIRequest('/timeline-events', 'POST', eventData);

  if (!result.success) {
    console.log('❌ FAILED: Could not create timeline event');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success || !result.data.data) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  const eventId = result.data.data.id;
  console.log(`✅ PASSED: Timeline event created with ID ${eventId}`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politician_timeline', { id: eventId });
  if (!dbRecord) {
    console.log('❌ FAILED: Timeline event not found in database');
    return false;
  }

  console.log(`✅ PASSED: Timeline event verified in database`);
  console.log(`   Title: ${dbRecord.title}`);
  console.log(`   Date: ${dbRecord.date}`);
  console.log(`   Type: ${dbRecord.type}`);

  return true;
}

async function testCreateCommitment() {
  console.log('\n🧪 TEST 3: Creating Commitment/Promise');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  const commitmentData = { ...testCommitment, politician_id: createdPoliticianId };
  const result = await makeAPIRequest('/commitments', 'POST', commitmentData);

  if (!result.success) {
    console.log('❌ FAILED: Could not create commitment');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success || !result.data.data) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  const commitmentId = result.data.data.id;
  console.log(`✅ PASSED: Commitment created with ID ${commitmentId}`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politician_commitments', { id: commitmentId });
  if (!dbRecord) {
    console.log('❌ FAILED: Commitment not found in database');
    return false;
  }

  console.log(`✅ PASSED: Commitment verified in database`);
  console.log(`   Title: ${dbRecord.title}`);
  console.log(`   Status: ${dbRecord.status}`);
  console.log(`   Progress: ${dbRecord.progress_percentage}%`);

  return true;
}

async function testCreateVotingRecord() {
  console.log('\n🧪 TEST 4: Creating Voting Record');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  const votingData = { ...testVotingRecord, politician_id: createdPoliticianId };
  const result = await makeAPIRequest('/voting-records', 'POST', votingData);

  if (!result.success) {
    console.log('❌ FAILED: Could not create voting record');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success || !result.data.data) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  const recordId = result.data.data.id;
  console.log(`✅ PASSED: Voting record created with ID ${recordId}`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politician_voting_records', { id: recordId });
  if (!dbRecord) {
    console.log('❌ FAILED: Voting record not found in database');
    return false;
  }

  console.log(`✅ PASSED: Voting record verified in database`);
  console.log(`   Bill: ${dbRecord.bill_name}`);
  console.log(`   Vote: ${dbRecord.vote}`);
  console.log(`   Date: ${dbRecord.vote_date}`);

  return true;
}

async function testCreateDocument() {
  console.log('\n🧪 TEST 5: Creating Document');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  const documentData = { ...testDocument, politician_id: createdPoliticianId };
  const result = await makeAPIRequest('/documents', 'POST', documentData);

  if (!result.success) {
    console.log('❌ FAILED: Could not create document');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success || !result.data.data) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  const documentId = result.data.data.id;
  console.log(`✅ PASSED: Document created with ID ${documentId}`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politician_documents', { id: documentId });
  if (!dbRecord) {
    console.log('❌ FAILED: Document not found in database');
    return false;
  }

  console.log(`✅ PASSED: Document verified in database`);
  console.log(`   Title: ${dbRecord.title}`);
  console.log(`   Type: ${dbRecord.type}`);
  console.log(`   Category: ${dbRecord.category}`);

  return true;
}

async function testPublishPolitician() {
  console.log('\n🧪 TEST 6: Publishing Politician');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  const result = await makeAPIRequest(`/politicians/${createdPoliticianId}/publish`, 'POST');

  if (!result.success) {
    console.log('❌ FAILED: Could not publish politician');
    console.log('   Error:', result.error || result.data.error);
    return false;
  }

  if (!result.data.success) {
    console.log('❌ FAILED: API returned unsuccessful response');
    console.log('   Response:', result.data);
    return false;
  }

  console.log(`✅ PASSED: Politician published successfully`);

  // Verify in database
  const dbRecord = await verifyInDatabase('politicians', { id: createdPoliticianId });
  if (!dbRecord || dbRecord.is_draft !== 0) {
    console.log('❌ FAILED: Politician still marked as draft in database');
    console.log(`   is_draft value: ${dbRecord ? dbRecord.is_draft : 'not found'}`);
    return false;
  }

  console.log(`✅ PASSED: Politician is_draft set to 0 in database`);

  return true;
}

async function testRetrieveCompletePolitician() {
  console.log('\n🧪 TEST 7: Retrieving Complete Politician Profile');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  SKIPPED: No politician ID available');
    return false;
  }

  // Get politician
  const politicianResult = await makeAPIRequest(`/politicians/${createdPoliticianId}`, 'GET');
  if (!politicianResult.success || !politicianResult.data.success) {
    console.log('❌ FAILED: Could not retrieve politician');
    return false;
  }
  console.log(`✅ Politician retrieved: ${politicianResult.data.data.name}`);

  // Get timeline events
  const timelineResult = await makeAPIRequest(`/timeline-events?politicianId=${createdPoliticianId}`, 'GET');
  if (!timelineResult.success || !timelineResult.data.success) {
    console.log('❌ FAILED: Could not retrieve timeline events');
    return false;
  }
  console.log(`✅ Timeline events retrieved: ${timelineResult.data.data.data.length} events`);

  // Get commitments
  const commitmentsResult = await makeAPIRequest(`/commitments?politicianId=${createdPoliticianId}`, 'GET');
  if (!commitmentsResult.success || !commitmentsResult.data.success) {
    console.log('❌ FAILED: Could not retrieve commitments');
    return false;
  }
  console.log(`✅ Commitments retrieved: ${commitmentsResult.data.data.data.length} commitments`);

  // Get voting records
  const votingResult = await makeAPIRequest(`/voting-records?politicianId=${createdPoliticianId}`, 'GET');
  if (!votingResult.success || !votingResult.data.success) {
    console.log('❌ FAILED: Could not retrieve voting records');
    return false;
  }
  console.log(`✅ Voting records retrieved: ${votingResult.data.data.data.length} records`);

  // Get documents
  const documentsResult = await makeAPIRequest(`/documents?politicianId=${createdPoliticianId}`, 'GET');
  if (!documentsResult.success || !documentsResult.data.success) {
    console.log('❌ FAILED: Could not retrieve documents');
    return false;
  }
  console.log(`✅ Documents retrieved: ${documentsResult.data.data.data.length} documents`);

  console.log('\n✅ PASSED: Complete politician profile retrieved successfully');
  return true;
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  console.log('-'.repeat(80));

  if (!createdPoliticianId) {
    console.log('⚠️  No test data to clean up');
    return;
  }

  try {
    // Delete all related data (foreign key cascade should handle this, but let's be explicit)
    await connection.query('DELETE FROM politician_documents WHERE politician_id = ?', [createdPoliticianId]);
    await connection.query('DELETE FROM politician_voting_records WHERE politician_id = ?', [createdPoliticianId]);
    await connection.query('DELETE FROM politician_commitments WHERE politician_id = ?', [createdPoliticianId]);
    await connection.query('DELETE FROM politician_timeline WHERE politician_id = ?', [createdPoliticianId]);
    await connection.query('DELETE FROM politicians WHERE id = ?', [createdPoliticianId]);

    console.log(`✅ Test data cleaned up successfully (Politician ID: ${createdPoliticianId})`);
  } catch (error) {
    console.log(`❌ Error cleaning up test data: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('═'.repeat(80));
  console.log('🧪 END-TO-END INTEGRATION TEST: Complete Politician Creation');
  console.log('═'.repeat(80));
  console.log(`\nAPI Base URL: ${ADMIN_API_BASE_URL}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`\nStarting tests...\n`);

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected\n');

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Run all tests
    const tests = [
      { name: 'Create Politician', fn: testCreatePolitician },
      { name: 'Create Timeline Event', fn: testCreateTimelineEvent },
      { name: 'Create Commitment', fn: testCreateCommitment },
      { name: 'Create Voting Record', fn: testCreateVotingRecord },
      { name: 'Create Document', fn: testCreateDocument },
      { name: 'Publish Politician', fn: testPublishPolitician },
      { name: 'Retrieve Complete Profile', fn: testRetrieveCompletePolitician },
    ];

    for (const test of tests) {
      const passed = await test.fn();
      results.tests.push({ name: test.name, passed });
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }

    // Print summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\nTotal Tests: ${results.tests.length}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('\nDetailed Results:');
    results.tests.forEach((test, index) => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${index + 1}. ${status} - ${test.name}`);
    });

    // Cleanup
    await cleanupTestData();

    console.log('\n' + '═'.repeat(80));
    if (results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! The politician admin system is working correctly.');
    } else {
      console.log(`⚠️  ${results.failed} TEST(S) FAILED! Please review the errors above.`);
    }
    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}

// Check if server is running before starting tests
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/politicians`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Start tests
(async () => {
  console.log('🔍 Checking if server is running...\n');
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log('❌ ERROR: Server is not running!');
    console.log('\nPlease start the server first:');
    console.log('   cd C:\\Users\\muthe\\OneDrive\\Desktop\\radamtaani');
    console.log('   node server.js\n');
    process.exit(1);
  }

  console.log('✅ Server is running!\n');
  await runAllTests();
})();
