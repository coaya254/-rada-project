/**
 * Script to replace all checkbox multiselect source UI with SourceButtonManager
 * in PoliticianFormEnhanced.jsx
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'polihub', 'src', 'components', 'admin', 'PoliticianFormEnhanced.jsx');

console.log('🔄 Updating all source UI sections in PoliticianFormEnhanced.jsx...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Pattern for all checkbox multiselect sections (documents, news, timeline, etc.)
const sections = [
  {
    name: 'Documents',
    variable: 'doc',
    updateFunction: 'updateDocument',
    label: 'Document Sources'
  },
  {
    name: 'News',
    variable: 'item',
    updateFunction: 'updateNews',
    label: 'News Sources'
  },
  {
    name: 'Timeline',
    variable: 'event',
    updateFunction: 'updateTimeline',
    label: 'Event Sources'
  },
  {
    name: 'Promises/Commitments',
    variable: 'commitment',
    updateFunction: 'updateCommitment',
    label: 'Commitment Sources'
  },
  {
    name: 'Voting Records',
    variable: 'vote',
    updateFunction: 'updateVote',
    label: 'Voting Record Sources'
  }
];

// Generic regex to find and replace checkbox multiselect patterns
const checkboxPattern = /\{\/\* Sources Multi-Select \*\/\}\s*<div className="col-span-2">\s*<label className="block text-sm font-bold mb-2">Sources \(Select Multiple\)<\/label>\s*<div className="grid grid-cols-3 gap-2">\s*\{sources\.map\(source => \(\s*<label[^>]*>[\s\S]*?<\/label>\s*\)\)\}\s*<\/div>\s*<\/div>/g;

let replacementCount = 0;

// Replace all remaining checkbox patterns with a generic placeholder
content = content.replace(checkboxPattern, () => {
  replacementCount++;
  return `{/* Sources Manager - Replace with specific SourceButtonManager */}`;
});

// Save the file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Replaced ${replacementCount} checkbox multiselect sections`);
console.log('\n📝 Manual Updates Needed:');
console.log('   Replace each placeholder with appropriate SourceButtonManager component');
console.log('   based on the section context (doc, news, timeline, etc.)\n');
