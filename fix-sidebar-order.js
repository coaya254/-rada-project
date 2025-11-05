const fs = require('fs');
const path = require('path');

console.log('Fixing sidebar ordering for mobile...\n');

// Fix PoliticiansPage
const politiciansPath = path.join(__dirname, 'polihub', 'src', 'pages', 'PoliticiansPage.jsx');
let politiciansContent = fs.readFileSync(politiciansPath, 'utf8');

// Add order classes to make sidebar come after on mobile
politiciansContent = politiciansContent.replace(
  '{/* Left - Politicians Grid */}\n        <div className="lg:col-span-9">',
  '{/* Left - Politicians Grid */}\n        <div className="lg:col-span-9 order-1">'
);
politiciansContent = politiciansContent.replace(
  '{/* Right - Sidebar */}\n        <div className="lg:col-span-3 space-y-4 sm:space-y-5">',
  '{/* Right - Sidebar */}\n        <div className="lg:col-span-3 space-y-4 sm:space-y-5 order-2">'
);
fs.writeFileSync(politiciansPath, politiciansContent, 'utf8');
console.log('✓ Fixed PoliticiansPage sidebar order');

// Fix CivicEducationPage
const civicPath = path.join(__dirname, 'polihub', 'src', 'pages', 'CivicEducationPage.jsx');
let civicContent = fs.readFileSync(civicPath, 'utf8');

civicContent = civicContent.replace(
  '{/* Topics Section */}\n          <div className="lg:col-span-8">',
  '{/* Topics Section */}\n          <div className="lg:col-span-8 order-1">'
);
civicContent = civicContent.replace(
  '{/* Sidebar */}\n          <div className="lg:col-span-4 space-y-4 sm:space-y-5">',
  '{/* Sidebar */}\n          <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);
fs.writeFileSync(civicPath, civicContent, 'utf8');
console.log('✓ Fixed CivicEducationPage sidebar order');

// Fix BlogPage
const blogPath = path.join(__dirname, 'polihub', 'src', 'pages', 'BlogPage.jsx');
let blogContent = fs.readFileSync(blogPath, 'utf8');

blogContent = blogContent.replace(
  '{/* Blog Posts */}\n        <div className="lg:col-span-8 space-y-4 sm:space-y-6">',
  '{/* Blog Posts */}\n        <div className="lg:col-span-8 space-y-4 sm:space-y-6 order-1">'
);
blogContent = blogContent.replace(
  '{/* Sidebar */}\n        <div className="lg:col-span-4 space-y-4 sm:space-y-5">',
  '{/* Sidebar */}\n        <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);
fs.writeFileSync(blogPath, blogContent, 'utf8');
console.log('✓ Fixed BlogPage sidebar order');

// Fix HomePage - main content area
const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

homeContent = homeContent.replace(
  '{/* Left - Politicians Gallery */}\n        <div className="lg:col-span-8">',
  '{/* Left - Politicians Gallery */}\n        <div className="lg:col-span-8 order-1">'
);
homeContent = homeContent.replace(
  /{\/\* Right - Sidebar \*\/}\s*<div className="lg:col-span-4 space-y-5">/,
  '{/* Right - Sidebar */}\n        <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">'
);
fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('✓ Fixed HomePage sidebar order');

console.log('\n✅ All sidebar orders fixed!');
console.log('   Sidebars now appear below main content on mobile');
console.log('   Main content appears first on all pages');
