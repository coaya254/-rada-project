const fs = require('fs');
const path = require('path');

const civicPagePath = path.join(__dirname, 'polihub', 'src', 'pages', 'CivicEducationPage.jsx');

// Read the file
let content = fs.readFileSync(civicPagePath, 'utf8');

console.log('Fixing CivicEducationPage.jsx for mobile responsiveness...\n');

// Fix 1: Stats cards grid - 4 cols is too many for mobile
content = content.replace(
  '<div className="grid grid-cols-4 gap-4 mb-8">',
  '<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">'
);
console.log('✓ Fixed stats cards grid (2 cols mobile, 4 desktop)');

// Fix 2: Topic cards grid - 1 col mobile, 2 desktop
content = content.replace(
  /<div className="grid grid-cols-2 gap-5 mb-6">/g,
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">'
);
console.log('✓ Fixed topic cards grid');

// Fix 3: Main content grid - stack on mobile
content = content.replace(
  /{\/\* Main Content Grid \*\/}\s*<div className="grid grid-cols-12 gap-6">/,
  '{/* Main Content Grid */}\n        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);
console.log('✓ Fixed main content grid');

// Fix 4: Topics section column span
content = content.replace(
  /{\/\* Topics Section \*\/}\s*<div className="col-span-8">/,
  '{/* Topics Section */}\n          <div className="lg:col-span-8">'
);
console.log('✓ Fixed topics section column span');

// Fix 5: Sidebar column span
content = content.replace(
  /{\/\* Sidebar \*\/}\s*<div className="col-span-4 space-y-5">/,
  '{/* Sidebar */}\n          <div className="lg:col-span-4 space-y-4 sm:space-y-5">'
);
console.log('✓ Fixed sidebar column span');

// Fix 6: Browse screen grid - 3 cols is too many
content = content.replace(
  '<div className="grid grid-cols-3 gap-5">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">'
);
console.log('✓ Fixed browse screen module grid');

// Fix 7: Card padding - reduce on mobile
content = content.replace(
  /className="bg-white\/90 backdrop-blur-md rounded-3xl p-8 shadow-xl/g,
  'className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl'
);
console.log('✓ Fixed card container padding');

// Fix 8: Section titles - responsive text size
content = content.replace(
  /className="text-5xl font-black(?! mb)/g,
  'className="text-3xl sm:text-4xl lg:text-5xl font-black'
);
console.log('✓ Fixed section title sizes');

// Fix 9: Subsection titles
content = content.replace(
  /className="text-3xl font-black/g,
  'className="text-2xl sm:text-3xl font-black'
);
console.log('✓ Fixed subsection title sizes');

// Fix 10: Module card image heights
content = content.replace(
  /className="h-48 overflow-hidden/g,
  'className="h-40 sm:h-48 overflow-hidden'
);
console.log('✓ Fixed module card image heights');

// Fix 11: Stats card padding
content = content.replace(
  /className="bg-white\/90 backdrop-blur-md rounded-2xl p-6 shadow-lg/g,
  'className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg'
);
console.log('✓ Fixed stats card padding');

// Fix 12: Modal content padding
content = content.replace(
  /className="p-8 space-y-6">/g,
  'className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">'
);
console.log('✓ Fixed modal content padding');

// Fix 13: Lesson content sections - make scrollable on mobile
content = content.replace(
  /className="bg-white\/95 backdrop-blur-sm rounded-2xl p-6/g,
  'className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6'
);
console.log('✓ Fixed lesson section padding');

// Write the file back
fs.writeFileSync(civicPagePath, content, 'utf8');

console.log('\n✅ CivicEducationPage.jsx mobile fixes applied successfully!');
console.log('   - Stats grid: 2 cols mobile → 4 desktop');
console.log('   - Topic cards: 1 col mobile → 2 desktop');
console.log('   - Module browse: 1 col mobile → 2 tablet → 3 desktop');
console.log('   - Main layout stacks on mobile');
console.log('   - Responsive padding and text sizes');
console.log('   - All content readable on small screens');
