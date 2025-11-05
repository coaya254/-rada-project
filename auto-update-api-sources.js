/**
 * Automated script to update all INSERT statements in polihub-integrated-api-routes.js
 * to use sources_json instead of source_ids junction tables
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'polihub-integrated-api-routes.js');

console.log('🔄 Updating API to use sources_json...\n');

let content = fs.readFileSync(filePath, 'utf8');
let changesMade = 0;

// NEWS: Add sources_json
const newsInsertOld = `INSERT INTO politician_news (
                politician_id, title, content, icon, image_url,
                source, source_url, credibility, sources, date, url, status, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

const newsInsertNew = `INSERT INTO politician_news (
                politician_id, title, content, icon, image_url,
                source, source_url, credibility, sources, date, url, status, sources_json, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

if (content.includes(newsInsertOld)) {
  content = content.replace(newsInsertOld, newsInsertNew);
  console.log('✅ Updated NEWS INSERT to include sources_json');
  changesMade++;
}

// NEWS: Add sources value (after item.sources line in VALUES)
const newsValueOld = `item.sources ? JSON.stringify(item.sources) : null,
                item.date,`;

const newsValueNew = `item.sources ? JSON.stringify(item.sources) : null,
                item.date,`;

// Actually need to find the exact VALUES and add sources after status
const newsValuesPattern = /politician_news[\s\S]*?VALUES \(([\s\S]*?)\)\s*`,\s*\[[\s\S]*?item\.status/;
const newsMatch = content.match(newsValuesPattern);
if (newsMatch && !newsMatch[0].includes('item.sources ? JSON.stringify(item.sources)')) {
  // Add sources_json to the VALUES array for news
  content = content.replace(
    /(item\.status\s*(?:||[^,]*?),)/,
    '$1\n                item.sources ? JSON.stringify(item.sources) : null,'
  );
  console.log('✅ Added sources_json value to NEWS INSERT');
  changesMade++;
}

// NEWS: Remove source_ids junction table code
const newsSourcesRemove = /\/\/ Insert news sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (newsSourcesRemove.test(content)) {
  content = content.replace(newsSourcesRemove, 'resolve();');
  console.log('✅ Removed NEWS source_ids junction table code');
  changesMade++;
}

// TIMELINE: Add sources_json
const timelineInsert = `'INSERT INTO politician_timeline (politician_id, date, title, description, type, icon, image_url, category, source, source_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'`;
const timelineInsertNew = `'INSERT INTO politician_timeline (politician_id, date, title, description, type, icon, image_url, category, source, source_url, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'`;

if (content.includes(timelineInsert)) {
  content = content.replace(timelineInsert, timelineInsertNew);
  // Add value
  content = content.replace(
    /(event\.source_url[^,]*,)\s*\(/,
    '$1\n                event.sources ? JSON.stringify(event.sources) : null,\n                ('
  );
  console.log('✅ Updated TIMELINE INSERT');
  changesMade++;
}

// Remove timeline sources junction table code
const timelineSourcesRemove = /\/\/ Insert timeline sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (timelineSourcesRemove.test(content)) {
  content = content.replace(timelineSourcesRemove, 'resolve();');
  console.log('✅ Removed TIMELINE source_ids junction table code');
  changesMade++;
}

// COMMITMENTS: Update INSERT
const commitmentInsert = `'INSERT INTO politician_commitments (politician_id, title, description, status, category, custom_category, type, custom_type, date_made, deadline, progress, progress_percentage, icon, image_url, source, source_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'`;
const commitmentInsertNew = `'INSERT INTO politician_commitments (politician_id, title, description, status, category, custom_category, type, custom_type, date_made, deadline, progress, progress_percentage, icon, image_url, source, source_url, sources_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'`;

if (content.includes(commitmentInsert)) {
  content = content.replace(commitmentInsert, commitmentInsertNew);
  // Add value
  content = content.replace(
    /(commitment\.source_url[^,]*,)\s*\(/,
    '$1\n                commitment.sources ? JSON.stringify(commitment.sources) : null,\n                ('
  );
  console.log('✅ Updated COMMITMENTS INSERT');
  changesMade++;
}

// Remove commitment sources junction table code
const commitmentSourcesRemove = /\/\/ Insert commitment sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (commitmentSourcesRemove.test(content)) {
  content = content.replace(commitmentSourcesRemove, 'resolve();');
  console.log('✅ Removed COMMITMENTS source_ids junction table code');
  changesMade++;
}

// VOTING RECORDS: Add sources_json
const votingInsertPattern = /INSERT INTO voting_records \(([\s\S]*?)\) VALUES/;
const votingMatch = content.match(votingInsertPattern);
if (votingMatch && !votingMatch[1].includes('sources_json')) {
  content = content.replace(
    votingInsertPattern,
    (match, columns) => `INSERT INTO voting_records (${columns}, sources_json) VALUES`
  );
  // Add value before the closing parenthesis of VALUES
  content = content.replace(
    /(vote\.source_links[^,]*?),\s*\]/,
    '$1,\n                vote.sources ? JSON.stringify(vote.sources) : null\n              ]'
  );
  console.log('✅ Updated VOTING RECORDS INSERT');
  changesMade++;
}

// Remove voting sources junction table code
const votingSourcesRemove = /\/\/ Insert voting record sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (votingSourcesRemove.test(content)) {
  content = content.replace(votingSourcesRemove, 'resolve();');
  console.log('✅ Removed VOTING RECORDS source_ids junction table code');
  changesMade++;
}

// PARTY HISTORY: Update INSERT
const partyInsert = `'INSERT INTO politician_parties (politician_id, party_name, start_date, end_date, analysis, is_current, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())'`;
const partyInsertNew = `'INSERT INTO politician_parties (politician_id, party_name, start_date, end_date, analysis, is_current, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())'`;

if (content.includes(partyInsert)) {
  content = content.replace(partyInsert, partyInsertNew);
  // Add value
  content = content.replace(
    /(party\.is_current[^,]*),\s*\(/,
    '$1,\n                party.sources ? JSON.stringify(party.sources) : null,\n                ('
  );
  console.log('✅ Updated PARTY HISTORY INSERT');
  changesMade++;
}

// Remove party sources junction table code
const partySourcesRemove = /\/\/ Insert party sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (partySourcesRemove.test(content)) {
  content = content.replace(partySourcesRemove, 'resolve();');
  console.log('✅ Removed PARTY HISTORY source_ids junction table code');
  changesMade++;
}

// ACHIEVEMENTS: Update INSERT
const achievementInsert = `'INSERT INTO politician_achievements (politician_id, title, description, category, achievement_date, created_at) VALUES (?, ?, ?, ?, ?, NOW())'`;
const achievementInsertNew = `'INSERT INTO politician_achievements (politician_id, title, description, category, achievement_date, sources_json, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())'`;

if (content.includes(achievementInsert)) {
  content = content.replace(achievementInsert, achievementInsertNew);
  // Add value
  content = content.replace(
    /(achievement\.achievement_date[^,]*),\s*\(/,
    '$1,\n                achievement.sources ? JSON.stringify(achievement.sources) : null,\n                ('
  );
  console.log('✅ Updated ACHIEVEMENTS INSERT');
  changesMade++;
}

// Remove achievement sources junction table code
const achievementSourcesRemove = /\/\/ Insert achievement sources[\s\S]*?Promise\.all\(sourcePromises\)\.then\(\(\) => resolve\(\)\)\.catch\(reject\);[\s\S]*?} else {[\s\S]*?resolve\(\);[\s\S]*?}/;
if (achievementSourcesRemove.test(content)) {
  content = content.replace(achievementSourcesRemove, 'resolve();');
  console.log('✅ Removed ACHIEVEMENTS source_ids junction table code');
  changesMade++;
}

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Complete! Made ${changesMade} changes to the API file.`);
console.log('\n📝 Summary:');
console.log('   • Updated all INSERT statements to include sources_json');
console.log('   • Added JSON.stringify(sources) to all VALUES');
console.log('   • Removed all source_ids junction table code');
console.log('\n💡 Next: Restart server and test!');
