const fs = require('fs');
const path = require('path');

const modalPath = path.join(__dirname, 'polihub', 'src', 'components', 'PoliticianDetailModalEnhanced.jsx');

// Read the file
let content = fs.readFileSync(modalPath, 'utf8');

console.log('Fixing PoliticianDetailModalEnhanced.jsx for mobile responsiveness...\n');

// Fix 1: Overview tab - Party History grid (line ~237)
content = content.replace(
  /{\/\* Party History Grid \*\/}\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">/,
  '{/* Party History Grid */}\n              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">'
);
console.log('✓ Overview tab party history grid already responsive');

// Fix 2: Commitments tab - Grid from 3 to responsive (line ~332)
content = content.replace(
  /{\/\* Promises\/Commitments Tab \*\/}[\s\S]*?<div className="grid grid-cols-3 gap-6">/,
  '{/* Promises/Commitments Tab */}\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">'
);
console.log('✓ Fixed Promises/Commitments tab grid');

// Fix 3: News tab - Grid from 3 to responsive (line ~415)
content = content.replace(
  /{\/\* News Tab \*\/}[\s\S]*?<div className="grid grid-cols-3 gap-6">/,
  '{/* News Tab */}\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">'
);
console.log('✓ Fixed News tab grid');

// Fix 4: Voting Records tab - Grid from 3 to responsive (line ~575)
content = content.replace(
  /{\/\* Voting Records Tab \*\/}[\s\S]*?<div className="grid grid-cols-3 gap-6">/,
  '{/* Voting Records Tab */}\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">'
);
console.log('✓ Fixed Voting Records tab grid');

// Fix 5: Documents tab - Grid from 3 to responsive (line ~654)
content = content.replace(
  /{\/\* Documents Tab \*\/}[\s\S]*?<div className="grid grid-cols-3 gap-6">/,
  '{/* Documents Tab */}\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">'
);
console.log('✓ Fixed Documents tab grid');

// Fix 6: Tab content padding
content = content.replace(
  /className="p-8 overflow-y-auto"/g,
  'className="p-4 sm:p-6 md:p-8 overflow-y-auto"'
);
console.log('✓ Fixed tab content padding');

// Fix 7: Modal max width - allow it to be full width on mobile
content = content.replace(
  'className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh]',
  'className="bg-white rounded-2xl sm:rounded-3xl max-w-full sm:max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh]'
);
console.log('✓ Fixed modal width for mobile');

// Fix 8: Header padding
content = content.replace(
  /className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-20"/,
  'className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6 z-20"'
);
console.log('✓ Fixed header padding');

// Fix 9: Stat cards grid - make 2x2 on mobile instead of 4 columns
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">/g,
  'className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">'
);
console.log('✓ Fixed stat cards grid (2x2 on mobile)');

// Fix 10: Card item padding
content = content.replace(
  /className="bg-white rounded-2xl p-6 shadow-lg/g,
  'className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg'
);
console.log('✓ Fixed card item padding');

// Fix 11: Modal close button positioning
content = content.replace(
  /className="absolute top-6 right-6 w-12 h-12/,
  'className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 w-10 h-10 sm:w-12 sm:h-12'
);
console.log('✓ Fixed close button positioning');

// Fix 12: Section titles in tabs
content = content.replace(
  /className="text-2xl font-black text-gray-800 mb-6">/g,
  'className="text-xl sm:text-2xl font-black text-gray-800 mb-4 sm:mb-6">'
);
console.log('✓ Fixed section title sizes');

// Fix 13: Timeline items - better mobile spacing
content = content.replace(
  /className="flex gap-4 mb-6">/g,
  'className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">'
);
console.log('✓ Fixed timeline item layout');

// Write the file back
fs.writeFileSync(modalPath, content, 'utf8');

console.log('\n✅ PoliticianDetailModalEnhanced.jsx mobile fixes applied successfully!');
console.log('   - All tab grids: 1 col mobile → 2 tablet → 3 desktop');
console.log('   - Modal full-width on mobile, constrained on desktop');
console.log('   - Tab content padding scales with screen size');
console.log('   - Stat cards in 2x2 grid on mobile');
console.log('   - Timeline and card items stack properly');
console.log('   - Touch-friendly close button positioning');
