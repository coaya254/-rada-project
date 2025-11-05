const fs = require('fs');
const path = require('path');

const politiciansPagePath = path.join(__dirname, 'polihub', 'src', 'pages', 'PoliticiansPage.jsx');

// Read the file
let content = fs.readFileSync(politiciansPagePath, 'utf8');

console.log('Fixing PoliticiansPage.jsx for mobile responsiveness...\n');

// Fix 1: Filter bar grid - make it stack on mobile
content = content.replace(
  /<div className="grid grid-cols-12 gap-4">\s*{\/\* Filter Bar \*\/}/,
  '<div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4">\n          {/* Filter Bar */}'
);
console.log('✓ Fixed filter bar grid layout');

// Fix 2: Filter selects - make them full width on mobile
content = content.replace(
  /className="col-span-5">\s*<select/g,
  'className="w-full lg:col-span-5">\n            <select'
);
content = content.replace(
  /className="col-span-3">\s*<select/g,
  'className="w-full lg:col-span-3">\n            <select'
);
content = content.replace(
  /className="col-span-1 flex justify-end">/,
  'className="w-full lg:col-span-1 flex justify-center lg:justify-end">'
);
console.log('✓ Fixed filter select widths');

// Fix 3: Main content grid - stack on mobile
content = content.replace(
  /{\/\* Main Content Grid \*\/}\s*<div className="grid grid-cols-12 gap-6">/,
  '{/* Main Content Grid */}\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);
console.log('✓ Fixed main content grid');

// Fix 4: Politicians gallery column span
content = content.replace(
  /{\/\* Left - Politicians Grid \*\/}\s*<div className="col-span-9">/,
  '{/* Left - Politicians Grid */}\n        <div className="lg:col-span-9">'
);
console.log('✓ Fixed politicians grid column span');

// Fix 5: Politicians cards grid - 1 col mobile, 2 tablet, 3 desktop
content = content.replace(
  '<div className="grid grid-cols-3 gap-5">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">'
);
console.log('✓ Fixed politicians cards grid');

// Fix 6: Sidebar column span
content = content.replace(
  /{\/\* Right - Sidebar \*\/}\s*<div className="col-span-3 space-y-5">/,
  '{/* Right - Sidebar */}\n        <div className="lg:col-span-3 space-y-4 sm:space-y-5">'
);
console.log('✓ Fixed sidebar column span');

// Fix 7: Card containers padding
content = content.replace(
  /className="bg-white\/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-white/g,
  'className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-white'
);
console.log('✓ Fixed card padding');

// Fix 8: Title text sizes
content = content.replace(
  /className="text-5xl font-black/g,
  'className="text-3xl sm:text-4xl lg:text-5xl font-black'
);
console.log('✓ Fixed title text sizes');

// Fix 9: Politician card images - responsive height
content = content.replace(
  /className="relative h-72 overflow-hidden/g,
  'className="relative h-48 sm:h-64 lg:h-72 overflow-hidden'
);
console.log('✓ Fixed politician card image heights');

// Fix 10: Button padding - make smaller on mobile
content = content.replace(
  /className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full/g,
  'className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full'
);
console.log('✓ Fixed button padding');

// Write the file back
fs.writeFileSync(politiciansPagePath, content, 'utf8');

console.log('\n✅ PoliticiansPage.jsx mobile fixes applied successfully!');
console.log('   - Filter bar stacks vertically on mobile');
console.log('   - Main grid collapses to single column');
console.log('   - Politicians cards: 1 col mobile → 2 tablet → 3 desktop');
console.log('   - Sidebar stacks below on mobile');
console.log('   - Responsive padding and text sizes');
console.log('   - Card images scale with breakpoints');
