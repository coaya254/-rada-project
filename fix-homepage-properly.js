const fs = require('fs');
const path = require('path');

console.log('Fixing HomePage properly...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// 1. Fix the duplicate import
console.log('1. Removing duplicate civicTopics import...');
content = content.replace(
  "import { politicians as defaultPoliticians } from '../data/politicians';\nimport { civicTopics as defaultCivicTopics } from '../data/civicTopics';\nimport { civicTopics } from '../data/civicTopics';",
  "import { politicians as defaultPoliticians } from '../data/politicians';\nimport { civicTopics as defaultCivicTopics } from '../data/civicTopics';"
);

// 2. Add politicians and civicTopics to function parameters
console.log('2. Adding politicians and civicTopics to function parameters...');
content = content.replace(
  'export default function HomePage({ \n  current,',
  'export default function HomePage({ \n  politicians = [],\n  civicTopics = [],\n  current,'
);

// 3. Add the display variables at the start of the function
console.log('3. Adding display variables...');
content = content.replace(
  '}) {\n  return (',
  `}) {
  // Use prop if provided, otherwise use default data
  const displayPoliticians = politicians.length > 0 ? politicians : defaultPoliticians;
  const displayCivicTopics = civicTopics.length > 0 ? civicTopics : defaultCivicTopics;

  return (`
);

fs.writeFileSync(homePath, content, 'utf8');

console.log('\n✅ HomePage fixed properly!');
console.log('   - Removed duplicate import');
console.log('   - Added politicians and civicTopics parameters with defaults');
console.log('   - Created displayPoliticians and displayCivicTopics variables');
console.log('   - These variables are used in the JSX');
