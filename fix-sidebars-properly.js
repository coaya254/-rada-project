const fs = require('fs');
const path = require('path');

console.log('Fixing sidebar positioning for mobile (moving to bottom)...\n');

// 1. Fix PoliticiansPage
const politiciansPath = path.join(__dirname, 'polihub', 'src', 'pages', 'PoliticiansPage.jsx');
let politiciansContent = fs.readFileSync(politiciansPath, 'utf8');

// Change the grid to be mobile-responsive
politiciansContent = politiciansContent.replace(
  /{\/\* Politicians Grid \*\/}\s*<div className="grid grid-cols-12 gap-4 sm:gap-6">/,
  '{/* Politicians Grid */}\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);

// Make main grid full width on mobile, 9 cols on desktop
politiciansContent = politiciansContent.replace(
  /{\/\* Main Grid \*\/}\s*<div className="col-span-9">/,
  '{/* Main Grid */}\n        <div className="lg:col-span-9 order-1">'
);

// Make sidebar full width on mobile, 3 cols on desktop, and order it after
politiciansContent = politiciansContent.replace(
  /{\/\* Sidebar \*\/}\s*<div className="col-span-3 space-y-5">/,
  '{/* Sidebar */}\n        <div className="lg:col-span-3 space-y-4 sm:space-y-5 order-2">'
);

fs.writeFileSync(politiciansPath, politiciansContent, 'utf8');
console.log('✓ Fixed PoliticiansPage sidebar ordering');

// 2. Fix CivicEducationPage
const civicPath = path.join(__dirname, 'polihub', 'src', 'pages', 'CivicEducationPage.jsx');
let civicContent = fs.readFileSync(civicPath, 'utf8');

// Find and fix the main content grid
civicContent = civicContent.replace(
  /className="grid grid-cols-12 gap-4 sm:gap-6">\s*{\/\* Topics Section \*\/}/g,
  'className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">\n          {/* Topics Section */}'
);

// Fix topics section column span
civicContent = civicContent.replace(
  /<div className="lg:col-span-8">\s*{\/\* Browse View \*\/}/,
  '<div className="lg:col-span-8 order-1">\n            {/* Browse View */}'
);

// Fix sidebar column span
civicContent = civicContent.replace(
  /{\/\* Sidebar \*\/}\s*<div className="lg:col-span-4 space-y-4 sm:space-y-5">/g,
  '{/* Sidebar */}\n          <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);

fs.writeFileSync(civicPath, civicContent, 'utf8');
console.log('✓ Fixed CivicEducationPage sidebar ordering');

// 3. Fix BlogPage
const blogPath = path.join(__dirname, 'polihub', 'src', 'pages', 'BlogPage.jsx');
let blogContent = fs.readFileSync(blogPath, 'utf8');

// Fix main content grid
blogContent = blogContent.replace(
  /{\/\* Main Content Grid \*\/}\s*<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">/,
  '{/* Main Content Grid */}\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);

// Fix blog posts section
blogContent = blogContent.replace(
  /{\/\* Blog Posts \*\/}\s*<div className="lg:col-span-8 space-y-4 sm:space-y-6">/,
  '{/* Blog Posts */}\n        <div className="lg:col-span-8 space-y-4 sm:space-y-6 order-1">'
);

// Fix sidebar
blogContent = blogContent.replace(
  /{\/\* Sidebar \*\/}\s*<div className="lg:col-span-4 space-y-4 sm:space-y-5">/,
  '{/* Sidebar */}\n        <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);

fs.writeFileSync(blogPath, blogContent, 'utf8');
console.log('✓ Fixed BlogPage sidebar ordering');

// 4. Fix HomePage - just add order classes, grid already fixed
const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

// Add order to main section if not already there
if (!homeContent.includes('order-1')) {
  homeContent = homeContent.replace(
    /{\/\* Left - Politicians Gallery \*\/}\s*<div className="lg:col-span-8">/,
    '{/* Left - Politicians Gallery */}\n        <div className="lg:col-span-8 order-1">'
  );

  homeContent = homeContent.replace(
    /{\/\* Right - Sidebar \*\/}\s*<div className="lg:col-span-4/,
    '{/* Right - Sidebar */}\n        <div className="lg:col-span-4 order-2'
  );

  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('✓ Fixed HomePage sidebar ordering');
} else {
  console.log('○ HomePage already has order classes');
}

console.log('\n✅ All sidebars now move to bottom on mobile!');
console.log('   - Main content appears first (order-1)');
console.log('   - Sidebar appears below (order-2)');
console.log('   - Applied to: Politicians, Civic Ed, Blog, Home pages');
console.log('   - Uses responsive classes: lg:col-span-*');
