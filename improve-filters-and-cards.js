const fs = require('fs');
const path = require('path');

console.log('Improving filters, cards, and visual hierarchy...\n');

// 1. Fix PoliticiansPage filters
const politiciansPath = path.join(__dirname, 'polihub', 'src', 'pages', 'PoliticiansPage.jsx');
let politiciansContent = fs.readFileSync(politiciansPath, 'utf8');

// Make filter selects more touch-friendly with better styling
politiciansContent = politiciansContent.replace(
  /<select className="w-full px-4 py-3 bg-white rounded-xl shadow-sm border-2 border-gray-200 focus:border-purple-500 focus:outline-none/g,
  '<select className="w-full px-4 py-3 sm:py-3.5 bg-white rounded-xl shadow-md border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base font-semibold appearance-none cursor-pointer'
);

// Improve reset button
politiciansContent = politiciansContent.replace(
  /className="bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-300/g,
  'className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 sm:px-5 py-3 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 active:scale-95'
);

fs.writeFileSync(politiciansPath, politiciansContent, 'utf8');
console.log('✓ Improved PoliticiansPage filters');

// 2. Improve card visual hierarchy across all pages
const cardFiles = [
  'polihub/src/pages/HomePage.jsx',
  'polihub/src/pages/PoliticiansPage.jsx',
  'polihub/src/pages/CivicEducationPage.jsx',
  'polihub/src/pages/BlogPage.jsx'
];

cardFiles.forEach(filePath => {
  let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  // Add better card borders and shadows
  content = content.replace(
    /border-2 border-white">/g,
    'border-2 border-white/50 ring-1 ring-gray-100">'
  );

  // Improve stat/info badges
  content = content.replace(
    /bg-gray-100 text-gray-600 rounded-full text-xs/g,
    'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full text-xs font-semibold shadow-sm'
  );

  // Make category badges pop more
  content = content.replace(
    /bg-purple-100 text-purple-700/g,
    'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm'
  );

  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
});
console.log('✓ Improved card visual hierarchy');

// 3. Add scrollbar hide utility to index.css
const cssPath = path.join(__dirname, 'polihub', 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('scrollbar-hide')) {
  cssContent += `

/* Hide scrollbar but maintain functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scroll behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Thin scrollbar for desktop */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Better text rendering on mobile */
@media (max-width: 640px) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
}

/* Prevent text size adjustment on iOS */
html {
  -webkit-text-size-adjust: 100%;
}

/* Better tap highlight */
* {
  -webkit-tap-highlight-color: rgba(168, 85, 247, 0.2);
}

/* Improve focus visibility */
*:focus-visible {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}
`;

  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('✓ Added custom mobile CSS utilities');
}

// 4. Improve typography hierarchy
const typographyFiles = [
  'polihub/src/pages/HomePage.jsx',
  'polihub/src/pages/PoliticiansPage.jsx',
  'polihub/src/pages/CivicEducationPage.jsx'
];

typographyFiles.forEach(filePath => {
  let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  // Improve section headings
  content = content.replace(
    /text-3xl font-black flex items-center gap-3/g,
    'text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 tracking-tight'
  );

  // Improve card titles with better line height
  content = content.replace(
    /text-lg font-bold text-gray-800 mb-2/g,
    'text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug'
  );

  // Improve descriptions
  content = content.replace(
    /text-sm text-gray-600 mb-4/g,
    'text-sm text-gray-700 mb-4 leading-relaxed'
  );

  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
});
console.log('✓ Improved typography hierarchy');

// 5. Add better empty states
const emptyStateFiles = [
  'polihub/src/components/politician/DocumentsTab.jsx',
  'polihub/src/components/politician/NewsTab.jsx',
  'polihub/src/components/politician/PromisesTab.jsx'
];

emptyStateFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Improve empty state styling
    content = content.replace(
      /className="text-center py-12">/g,
      'className="text-center py-16 sm:py-20">'
    );

    content = content.replace(
      /className="text-xl font-bold text-gray-600 mb-2">/g,
      'className="text-lg sm:text-xl font-bold text-gray-700 mb-2">'
    );

    fs.writeFileSync(fullPath, content, 'utf8');
  }
});
console.log('✓ Improved empty states');

console.log('\n✅ All improvements applied!');
console.log('   - Touch-friendly filters with better styling');
console.log('   - Enhanced card visual hierarchy');
console.log('   - Custom scrollbar utilities');
console.log('   - Better typography and line heights');
console.log('   - Improved empty states');
console.log('   - Better iOS/mobile optimizations');
console.log('   - Enhanced focus states for accessibility');
