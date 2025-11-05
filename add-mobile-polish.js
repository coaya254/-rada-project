const fs = require('fs');
const path = require('path');

console.log('Adding mobile polish and visual improvements...\n');

const files = [
  { name: 'HomePage.jsx', path: 'polihub/src/pages/HomePage.jsx' },
  { name: 'PoliticiansPage.jsx', path: 'polihub/src/pages/PoliticiansPage.jsx' },
  { name: 'CivicEducationPage.jsx', path: 'polihub/src/pages/CivicEducationPage.jsx' },
  { name: 'BlogPage.jsx', path: 'polihub/src/pages/BlogPage.jsx' }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Improve card hover states - add transform and better shadows
  content = content.replace(
    /hover:shadow-xl transition/g,
    'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300'
  );

  // 2. Add active/press states for cards
  content = content.replace(
    /cursor-pointer">/g,
    'cursor-pointer active:scale-95 transition-transform duration-150">'
  );

  // 3. Improve button hover states
  content = content.replace(
    /hover:scale-105 transform/g,
    'hover:scale-105 active:scale-95 transform transition-transform duration-200'
  );

  // 4. Add better rounded corners for mobile
  content = content.replace(
    /rounded-3xl/g,
    'rounded-2xl sm:rounded-3xl'
  );

  // 5. Improve image aspect ratios - add object-cover for consistency
  content = content.replace(
    /className="(.*?)object-contain/g,
    'className="$1object-cover'
  );

  // 6. Add smooth scrolling for filter bars
  content = content.replace(
    /overflow-x-auto/g,
    'overflow-x-auto scrollbar-hide scroll-smooth'
  );

  // 7. Improve focus states for accessibility
  content = content.replace(
    /focus:outline-none/g,
    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
  );

  // 8. Add backdrop filters for better depth
  content = content.replace(
    /bg-white\/90 backdrop-blur-md/g,
    'bg-white/95 backdrop-blur-xl'
  );

  // 9. Improve gradient overlays
  content = content.replace(
    /bg-gradient-to-r from-purple-500 to-pink-500/g,
    'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500'
  );

  // 10. Add better spacing for small screens
  content = content.replace(
    /className="mb-8"/g,
    'className="mb-6 sm:mb-8"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Polished ${file.name}`);
});

console.log('\n✅ Mobile polish applied!');
console.log('   - Better hover/active states');
console.log('   - Improved shadows and transforms');
console.log('   - Better rounded corners on mobile');
console.log('   - Smooth scrolling');
console.log('   - Enhanced focus states');
console.log('   - Stronger backdrop effects');
console.log('   - Better gradients');
console.log('   - Optimized spacing');
