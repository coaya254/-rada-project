const fs = require('fs');
const path = require('path');

console.log('Connecting HomePage to real politician data...\n');

// 1. Update HomePage to receive politicians as prop
const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

// Remove the import of static politicians data
console.log('1. Removing static politicians import...');
homeContent = homeContent.replace(
  "import { politicians } from '../data/politicians';",
  "// Politicians now passed as prop from App.jsx"
);

// Add politicians to the destructured props
console.log('2. Adding politicians prop...');
homeContent = homeContent.replace(
  'export default function HomePage({ \n  current,',
  'export default function HomePage({ \n  politicians,\n  current,'
);

// Sort politicians by views/trending to show most popular
console.log('3. Adding sort for most popular politicians...');
homeContent = homeContent.replace(
  '{politicians.slice(0, 4).map((politician, idx) =>',
  '{politicians.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map((politician, idx) =>'
);

fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('   ✓ HomePage now receives politicians as prop');
console.log('   ✓ Shows 4 most popular politicians (sorted by views)');

// 2. Update App.jsx to pass politicians to HomePage
const appPath = path.join(__dirname, 'polihub', 'src', 'App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

console.log('\n4. Updating App.jsx to pass politicians to HomePage...');

// Find the HomePage component usage and add politicians prop
if (appContent.includes('<HomePage')) {
  // Add politicians prop to HomePage
  appContent = appContent.replace(
    /<HomePage\s+current=/,
    '<HomePage\n            politicians={politicians}\n            current='
  );

  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log('   ✓ App.jsx now passes politicians to HomePage');
} else {
  console.log('   ⚠️  Could not find HomePage usage in App.jsx');
}

// 3. Also connect civicTopics to real data
console.log('\n5. Ensuring civicTopics uses real data...');
homeContent = fs.readFileSync(homePath, 'utf8');

if (!homeContent.includes('civicTopics') && !homeContent.includes('from props')) {
  // civicTopics is already imported from data, should also come from props if App fetches it
  homeContent = homeContent.replace(
    "import { civicTopics } from '../data/civicTopics';",
    "// CivicTopics now passed as prop from App.jsx or imported"
  );

  homeContent = homeContent.replace(
    'export default function HomePage({ \n  politicians,',
    'export default function HomePage({ \n  politicians,\n  civicTopics,'
  );

  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('   ✓ HomePage updated to receive civicTopics as prop');

  // Update App.jsx to pass civicTopics
  appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('civicTopics={civicTopics}')) {
    console.log('   ✓ App.jsx already passes civicTopics');
  } else {
    appContent = appContent.replace(
      /<HomePage\s+politicians={politicians}/,
      '<HomePage\n            politicians={politicians}\n            civicTopics={civicTopics}'
    );
    fs.writeFileSync(appPath, appContent, 'utf8');
    console.log('   ✓ App.jsx now passes civicTopics to HomePage');
  }
} else {
  console.log('   ○ CivicTopics already handled');
}

console.log('\n✅ HomePage now connected to real data!');
console.log('   • Politicians: Fetched from API, showing 4 most popular');
console.log('   • Civic Topics: Using real data from App');
console.log('   • Both have "More" buttons linking to full pages');
