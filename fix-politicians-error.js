const fs = require('fs');
const path = require('path');

console.log('Fixing politicians undefined error...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Add fallback for politicians with default empty array
console.log('1. Adding fallback for politicians...');
content = content.replace(
  'export default function HomePage({ \n  politicians,',
  'export default function HomePage({ \n  politicians = [],'
);

// Also add fallback for civicTopics
console.log('2. Adding fallback for civicTopics...');
content = content.replace(
  '  civicTopics,',
  '  civicTopics = [],'
);

// Also restore the import as a fallback
console.log('3. Adding import fallback...');
content = content.replace(
  "// Politicians now passed as prop from App.jsx",
  "import { politicians as defaultPoliticians } from '../data/politicians';\nimport { civicTopics as defaultCivicTopics } from '../data/civicTopics';"
);

// Use the prop if provided, otherwise use default
console.log('4. Adding logic to use prop or default...');
const functionBodyStart = `) {
  return (`;

const functionBodyWithLogic = `) {
  // Use prop if provided, otherwise use default data
  const displayPoliticians = politicians.length > 0 ? politicians : defaultPoliticians;
  const displayCivicTopics = civicTopics.length > 0 ? civicTopics : defaultCivicTopics;

  return (`;

content = content.replace(functionBodyStart, functionBodyWithLogic);

// Update references to use display variables
console.log('5. Updating references...');
content = content.replace(
  '{politicians.sort(',
  '{displayPoliticians.sort('
);

content = content.replace(
  '{civicTopics.slice(0, 4)',
  '{displayCivicTopics.slice(0, 4)'
);

fs.writeFileSync(homePath, content, 'utf8');

console.log('\n✅ Fixed politicians error!');
console.log('   - Added default parameter values');
console.log('   - Restored fallback imports');
console.log('   - Uses prop if available, defaults otherwise');
console.log('   - Page will work even if props not passed');
