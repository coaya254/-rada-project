const fs = require('fs');
const path = require('path');

console.log('Fixing Civic Education and Blog page sidebars...\n');

// 1. Fix CivicEducationPage
const civicPath = path.join(__dirname, 'polihub', 'src', 'pages', 'CivicEducationPage.jsx');
let civicContent = fs.readFileSync(civicPath, 'utf8');

// Find the grid at line 256 and make it responsive
civicContent = civicContent.replace(
  '          <div className="grid grid-cols-12 gap-4 sm:gap-6">',
  '          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);

// Fix main content col-span at line 258
civicContent = civicContent.replace(
  '            {/* Main Content */}\n            <div className="col-span-8">',
  '            {/* Main Content */}\n            <div className="lg:col-span-8 order-1">'
);

// Find and fix sidebar (should be after main content)
civicContent = civicContent.replace(
  /            {\/\* Sidebar \*\/}\s*<div className="col-span-4 space-y-5">/,
  '            {/* Sidebar */}\n            <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);

fs.writeFileSync(civicPath, civicContent, 'utf8');
console.log('✓ Fixed CivicEducationPage sidebar ordering');

// 2. Fix BlogPage - check if it needs fixing
const blogPath = path.join(__dirname, 'polihub', 'src', 'pages', 'BlogPage.jsx');
let blogContent = fs.readFileSync(blogPath, 'utf8');

// Check if Blog already has the fixes
if (!blogContent.includes('order-1') || !blogContent.includes('order-2')) {
  console.log('⚠️  BlogPage needs fixing...');

  // Fix any remaining non-responsive grids
  blogContent = blogContent.replace(
    /className="grid grid-cols-12 gap-/g,
    'className="grid grid-cols-1 lg:grid-cols-12 gap-'
  );

  // Make sure main content has order-1
  blogContent = blogContent.replace(
    /{\/\* Blog Posts \*\/}\s*<div className="col-span-8/,
    '{/* Blog Posts */}\n        <div className="lg:col-span-8 order-1'
  );

  // Make sure sidebar has order-2
  blogContent = blogContent.replace(
    /{\/\* Sidebar \*\/}\s*<div className="col-span-4/,
    '{/* Sidebar */}\n        <div className="lg:col-span-4 order-2'
  );

  fs.writeFileSync(blogPath, blogContent, 'utf8');
  console.log('✓ Fixed BlogPage sidebar ordering');
} else {
  console.log('○ BlogPage already has order classes');
}

console.log('\n✅ Civic Ed and Blog sidebars fixed!');
console.log('   - Sidebars now appear below main content on mobile');
console.log('   - Side-by-side layout preserved on desktop');
