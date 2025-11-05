const fs = require('fs');
const path = require('path');

const blogPagePath = path.join(__dirname, 'polihub', 'src', 'pages', 'BlogPage.jsx');

// Read the file
let content = fs.readFileSync(blogPagePath, 'utf8');

console.log('Fixing BlogPage.jsx for mobile responsiveness...\n');

// Fix 1: Main content grid - stack on mobile
content = content.replace(
  /{\/\* Main Content Grid \*\/}\s*<div className="grid grid-cols-12 gap-6">/,
  '{/* Main Content Grid */}\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);
console.log('✓ Fixed main content grid');

// Fix 2: Blog posts section column span
content = content.replace(
  /{\/\* Blog Posts \*\/}\s*<div className="col-span-8 space-y-6">/,
  '{/* Blog Posts */}\n        <div className="lg:col-span-8 space-y-4 sm:space-y-6">'
);
console.log('✓ Fixed blog posts section column span');

// Fix 3: Sidebar column span
content = content.replace(
  /{\/\* Sidebar \*\/}\s*<div className="col-span-4 space-y-5">/,
  '{/* Sidebar */}\n        <div className="lg:col-span-4 space-y-4 sm:space-y-5">'
);
console.log('✓ Fixed sidebar column span');

// Fix 4: Blog card grid - make it stack on mobile instead of 5-column split
content = content.replace(
  /<div className="bg-white\/90 backdrop-blur-md rounded-3xl shadow-xl border-2 border-white overflow-hidden hover:shadow-2xl transition cursor-pointer">\s*<div className="grid grid-cols-5">\s*<div className="col-span-2 relative h-64">/g,
  '<div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white overflow-hidden hover:shadow-2xl transition cursor-pointer">\n            <div className="flex flex-col sm:grid sm:grid-cols-5">\n              <div className="sm:col-span-2 relative h-48 sm:h-64">'
);
console.log('✓ Fixed blog card layout (stack on mobile, side-by-side on desktop)');

// Fix 5: Blog card content section
content = content.replace(
  /className="col-span-3 p-8 flex flex-col justify-between">/g,
  'className="sm:col-span-3 p-4 sm:p-6 md:p-8 flex flex-col justify-between">'
);
console.log('✓ Fixed blog card content padding');

// Fix 6: Page title
content = content.replace(
  /className="text-5xl font-black flex items-center gap-4 mb-6">/,
  'className="text-3xl sm:text-4xl lg:text-5xl font-black flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">'
);
console.log('✓ Fixed page title size');

// Fix 7: Filter bar - make it wrap better on mobile
content = content.replace(
  /className="flex gap-2 mb-8 overflow-x-auto pb-2">/g,
  'className="flex flex-wrap gap-2 mb-6 sm:mb-8">'
);
console.log('✓ Fixed filter bar wrapping');

// Fix 8: Card containers
content = content.replace(
  /className="bg-white\/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-white"(?! overflow)/g,
  'className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-white"'
);
console.log('✓ Fixed card container padding');

// Fix 9: Blog post title in cards
content = content.replace(
  /className="text-3xl font-black text-gray-800 mb-4 leading-tight">/g,
  'className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 leading-tight">'
);
console.log('✓ Fixed blog post title sizes in cards');

// Fix 10: Category badges
content = content.replace(
  /className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold mb-4">/g,
  'className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold mb-3 sm:mb-4">'
);
console.log('✓ Fixed category badge sizing');

// Fix 11: Modal content
content = content.replace(
  /className="p-8 pb-24">/g,
  'className="p-4 sm:p-6 md:p-8 pb-20 sm:pb-24">'
);
console.log('✓ Fixed modal content padding');

// Fix 12: Modal header
content = content.replace(
  /className="text-4xl font-black text-gray-800 mb-6">/g,
  'className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-4 sm:mb-6">'
);
console.log('✓ Fixed modal header sizes');

// Fix 13: Section headings in modals
content = content.replace(
  /className="text-2xl font-black text-gray-800 mb-4">/g,
  'className="text-xl sm:text-2xl font-black text-gray-800 mb-3 sm:mb-4">'
);
console.log('✓ Fixed section heading sizes');

// Write the file back
fs.writeFileSync(blogPagePath, content, 'utf8');

console.log('\n✅ BlogPage.jsx mobile fixes applied successfully!');
console.log('   - Blog cards stack vertically on mobile');
console.log('   - Image/content side-by-side on larger screens');
console.log('   - Main layout stacks content then sidebar');
console.log('   - Filter bar wraps properly');
console.log('   - Responsive padding and text sizes');
console.log('   - Improved touch targets and readability');
