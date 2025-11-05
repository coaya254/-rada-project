const fs = require('fs');
const path = require('path');

const homePagePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');

// Read the file
let content = fs.readFileSync(homePagePath, 'utf8');

console.log('Fixing HomePage.jsx for mobile responsiveness...\n');

// Fix 1: Hero container - make it responsive with flex-col on mobile
content = content.replace(
  'className="relative flex items-center justify-between p-12 min-h-[500px]"',
  'className="relative flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 md:p-8 lg:p-12 min-h-[400px] sm:min-h-[500px]"'
);
console.log('✓ Fixed hero container layout');

// Fix 2: Previous button - responsive sizing
content = content.replace(
  'className="absolute left-6 w-14 h-14 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition z-10 text-white text-3xl font-bold shadow-xl hover:scale-110 transform"',
  'className="absolute left-2 sm:left-4 lg:left-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition z-10 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"'
);
console.log('✓ Fixed previous button sizing');

// Fix 3: Next button - responsive sizing
content = content.replace(
  'className="absolute right-6 w-14 h-14 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition z-10 text-white text-3xl font-bold shadow-xl hover:scale-110 transform"',
  'className="absolute right-2 sm:right-4 lg:right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition z-10 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"'
);
console.log('✓ Fixed next button sizing');

// Fix 4: Text container - add responsive padding and centering
content = content.replace(
  'className="flex-1 text-white z-10 max-w-2xl pr-8"',
  'className="flex-1 text-white z-10 max-w-2xl pr-0 lg:pr-8 mb-6 lg:mb-0 text-center lg:text-left"'
);
console.log('✓ Fixed text container padding');

// Fix 5: Huge heading - make it responsive
content = content.replace(
  'className="text-9xl font-black mb-4 drop-shadow-2xl leading-none">{current.nickname}</h2>',
  'className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-4 drop-shadow-2xl leading-none">{current.nickname}</h2>'
);
console.log('✓ Fixed heading font size');

// Fix 6: Description text - responsive sizing
content = content.replace(
  'className="text-xl leading-relaxed opacity-95 mb-6 font-medium">',
  'className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed opacity-95 mb-6 font-medium">'
);
console.log('✓ Fixed description text size');

// Fix 7: Stats badges - responsive wrapping
content = content.replace(
  'className="flex items-center gap-4 mb-6">',
  'className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 mb-6">'
);
console.log('✓ Fixed stats badges layout');

// Fix 8: Hero image container - responsive sizing
content = content.replace(
  'className="w-[550px] h-[500px] flex items-end justify-end relative">',
  'className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[550px] h-[300px] sm:h-[400px] lg:h-[500px] flex items-end justify-center lg:justify-end relative">'
);
console.log('✓ Fixed hero image container');

// Fix 9: Main content grid - responsive columns
content = content.replace(
  'className="grid grid-cols-12 gap-6">',
  'className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">'
);
console.log('✓ Fixed main content grid');

// Fix 10: Politicians gallery container - responsive column span
content = content.replace(
  'className="col-span-8">',
  'className="lg:col-span-8">'
);
console.log('✓ Fixed politicians gallery column span');

// Fix 11: Politicians gallery padding
content = content.replace(
  'className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-white">',
  'className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-white">'
);
console.log('✓ Fixed gallery container padding');

// Fix 12: Politicians grid - make it 1 col mobile, 2 col tablet, 3 col desktop
content = content.replace(
  'className="grid grid-cols-3 gap-5">',
  'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">'
);
console.log('✓ Fixed politicians card grid');

// Fix 13: Civic topics grid - make it responsive
content = content.replace(
  'className="grid grid-cols-2 gap-4">',
  'className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
);
console.log('✓ Fixed civic topics grid');

// Fix 14: Right sidebar - responsive column span
content = content.replace(
  'className="col-span-4 space-y-5">',
  'className="lg:col-span-4 space-y-5">'
);
console.log('✓ Fixed sidebar column span');

// Fix 15: Sidebar card padding
const sidebarCardRegex = /className="bg-white\/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-white"/g;
content = content.replace(
  sidebarCardRegex,
  'className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-white"'
);
console.log('✓ Fixed sidebar card padding');

// Write the file back
fs.writeFileSync(homePagePath, content, 'utf8');

console.log('\n✅ HomePage.jsx mobile fixes applied successfully!');
console.log('   - Hero section now responsive (flex-col on mobile)');
console.log('   - Text scales from 4xl to 9xl across breakpoints');
console.log('   - Images responsive with max-width constraints');
console.log('   - Grids collapse to 1 column on mobile');
console.log('   - Padding reduces on small screens');
console.log('   - Touch targets sized appropriately');
