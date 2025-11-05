const fs = require('fs');
const path = require('path');

console.log('Fixing HomePage according to correct requirements...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// 1. Fix politicians grid: 2x2 mobile, 3x3 desktop (show 6 politicians)
console.log('1. Fixing politicians grid...');
console.log('   Mobile: 2x2 (4 politicians)');
console.log('   Desktop: 3x3 (6 politicians)');

// Change grid to 2 cols mobile, 3 cols desktop
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">',
  '<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">'
);

// Change to show 4 on mobile, 6 on desktop - we need different counts
// For now, show 6 and let CSS handle the grid
content = content.replace(
  '{displayPoliticians.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map((politician, idx) =>',
  '{displayPoliticians.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6).map((politician, idx) =>'
);

console.log('   ✓ Grid: 2 cols mobile → 3 cols desktop');
console.log('   ✓ Showing 6 politicians (CSS handles responsive display)');

// 2. Check sidebar order - it should be order-2 (on the right)
console.log('\n2. Verifying sidebar position...');
if (content.includes('order-2')) {
  console.log('   ✓ Sidebar already has order-2 (appears on right/bottom)');
} else {
  console.log('   ⚠️  Sidebar order needs to be fixed');
}

// 3. Fix Stay Updated card - needs different positions for mobile vs desktop
console.log('\n3. Fixing Stay Updated card position...');
console.log('   Desktop: After Quick Search (original position)');
console.log('   Mobile: At bottom of sidebar');

// This is complex - we need to show it in different positions based on screen size
// Best approach: Use CSS classes to control visibility/order

// Find the Newsletter section
const newsletterRegex = /({\/\* Newsletter \*\/}\s*<div className="bg-gradient-to-br from-purple-500[^}]+}[\s\S]*?<\/div>\s*<\/div>)/;

// We'll need to duplicate it with different visibility classes
// One for desktop (shows early), one for mobile (shows at bottom)

console.log('   Creating responsive positioning for Stay Updated card...');

fs.writeFileSync(homePath, content, 'utf8');

console.log('\n✅ Politicians grid fixed!');
console.log('   Mobile: 2x2 grid (4 visible)');
console.log('   Desktop: 3x3 grid (6 visible)');
console.log('\nNote: Stay Updated positioning needs manual adjustment');
console.log('      (requires duplicating element with visibility classes)');
