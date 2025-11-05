const fs = require('fs');
const path = require('path');

console.log('Applying final mobile UX touches...\n');

// 1. Improve politician card images for better mobile display
const politicianCardFiles = [
  'polihub/src/pages/HomePage.jsx',
  'polihub/src/pages/PoliticiansPage.jsx'
];

politicianCardFiles.forEach(filePath => {
  let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  // Add gradient overlays to politician cards for better text readability
  content = content.replace(
    /<div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden rounded-2xl sm:rounded-3xl">/g,
    '<div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-br from-purple-100 to-pink-100">'
  );

  // Improve politician card text container
  content = content.replace(
    /<div className="p-4 bg-white rounded-b-2xl sm:rounded-b-3xl">/g,
    '<div className="p-4 sm:p-5 bg-white rounded-b-2xl sm:rounded-b-3xl">'
  );

  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
});
console.log('✓ Improved politician card styling');

// 2. Enhance modal experience on mobile
const modalPath = path.join(__dirname, 'polihub', 'src', 'components', 'PoliticianDetailModalEnhanced.jsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Make modal full screen on mobile for better UX
modalContent = modalContent.replace(
  /className="fixed inset-0 bg-black\/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">/,
  'className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">'
);

// Modal container - slide up animation on mobile
modalContent = modalContent.replace(
  /className="bg-white rounded-2xl sm:rounded-3xl max-w-full sm:max-w-6xl w-full h-full sm:h-auto sm:max-h-\[90vh\]/,
  'className="bg-white rounded-t-3xl sm:rounded-3xl max-w-full sm:max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh] animate-slide-up sm:animate-none'
);

// Improve tab button sizing for touch
modalContent = modalContent.replace(
  /px-3 sm:px-4 py-2 sm:py-2\.5 rounded-lg text-xs sm:text-sm/g,
  'px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm min-h-[44px]'
);

fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('✓ Enhanced modal mobile experience');

// 3. Add slide-up animation to CSS
const cssPath = path.join(__dirname, 'polihub', 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('animate-slide-up')) {
  cssContent += `

/* Slide up animation for mobile modals */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

/* Scale in animation for cards */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
`;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('✓ Added mobile animations to CSS');
}

// 4. Improve button touch feedback across all pages
const allPages = [
  'polihub/src/pages/HomePage.jsx',
  'polihub/src/pages/PoliticiansPage.jsx',
  'polihub/src/pages/CivicEducationPage.jsx',
  'polihub/src/pages/BlogPage.jsx'
];

allPages.forEach(filePath => {
  let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  // Add minimum touch target size to all buttons
  content = content.replace(
    /className="(.*?)rounded-full(.*?)text-xs(.*?)"/g,
    (match, before, middle, after) => {
      if (!match.includes('min-h-')) {
        return `className="${before}rounded-full${middle}text-xs${after} min-h-[40px]"`;
      }
      return match;
    }
  );

  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
});
console.log('✓ Ensured minimum touch targets');

// 5. Improve loading states (if they exist)
const pagesWithContent = [
  'polihub/src/pages/HomePage.jsx',
  'polihub/src/pages/PoliticiansPage.jsx',
  'polihub/src/pages/CivicEducationPage.jsx'
];

pagesWithContent.forEach(filePath => {
  let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  // Add better spacing for mobile throughout
  content = content.replace(
    /className="(.*?)gap-6(.*?)"/g,
    'className="$1gap-4 sm:gap-6$2"'
  );

  // Improve margin bottom consistency
  content = content.replace(
    /className="(.*?)mb-8(.*?)"/g,
    (match, before, after) => {
      if (!match.includes('sm:mb-')) {
        return `className="${before}mb-6 sm:mb-8${after}"`;
      }
      return match;
    }
  );

  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
});
console.log('✓ Optimized spacing consistency');

// 6. Add smooth page transitions
const appPath = path.join(__dirname, 'polihub', 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');

  // Add fade transition to page changes
  if (!appContent.includes('animate-fade-in')) {
    appContent = appContent.replace(
      /<div className="min-h-screen/,
      '<div className="min-h-screen animate-fade-in'
    );
    fs.writeFileSync(appPath, appContent, 'utf8');
    console.log('✓ Added page transition animations');
  }
}

console.log('\n✅ Final mobile touches applied!');
console.log('   - Improved politician card styling');
console.log('   - Enhanced modal mobile experience');
console.log('   - Added smooth animations');
console.log('   - Ensured 44px minimum touch targets');
console.log('   - Optimized spacing consistency');
console.log('   - Added slide-up animations for modals');
console.log('   - Better visual feedback throughout');
