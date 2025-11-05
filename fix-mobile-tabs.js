const fs = require('fs');
const path = require('path');

console.log('Fixing politician tab components for mobile responsiveness...\n');

const tabFiles = [
  'DocumentsTab.jsx',
  'NewsTab.jsx',
  'PromisesTab.jsx',
  'VotingRecordsTab.jsx',
  'TimelineTab.jsx',
  'CareerTab.jsx',
  'BillsTab.jsx',
  'ContactTab.jsx'
];

let totalFixes = 0;

tabFiles.forEach(fileName => {
  const filePath = path.join(__dirname, 'polihub', 'src', 'components', 'politician', fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;

  // Fix 1: Document/News/Promise cards grid - 2 columns is too many for mobile
  if (content.includes('className="grid grid-cols-2 gap-4"') ||
      content.includes('className="grid grid-cols-2 gap-5"')) {
    content = content.replace(
      /className="grid grid-cols-2 gap-([45])"/g,
      'className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-$1"'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 2: Card padding
  if (content.includes('rounded-2xl p-6')) {
    content = content.replace(
      /className="bg-white rounded-2xl p-6 shadow/g,
      'className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 3: Modal padding
  if (content.includes('className="p-6 space-y-6"')) {
    content = content.replace(
      /className="p-6 space-y-6"/g,
      'className="p-4 sm:p-6 space-y-4 sm:space-y-6"'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 4: Modal header padding
  if (content.includes('border-gray-200 p-6')) {
    content = content.replace(
      /className="sticky top-0 bg-white border-b border-gray-200 p-6/g,
      'className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 5: Modal max width
  if (content.includes('max-w-2xl')) {
    content = content.replace(
      /max-w-2xl/g,
      'max-w-full sm:max-w-2xl'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 6: Title sizes
  if (content.includes('text-2xl font-black')) {
    content = content.replace(
      /className="text-2xl font-black/g,
      'className="text-xl sm:text-2xl font-black'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 7: Card titles
  if (content.includes('text-lg font-black')) {
    content = content.replace(
      /className="text-lg font-black/g,
      'className="text-base sm:text-lg font-black'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 8: Filter button padding
  if (content.includes('px-4 py-2 rounded-full')) {
    content = content.replace(
      /className="(.*?)px-4 py-2 rounded-full/g,
      'className="$1px-3 sm:px-4 py-1.5 sm:py-2 rounded-full'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Fix 9: Filter bar spacing
  if (content.includes('className="flex gap-2 mb-6')) {
    content = content.replace(
      /className="flex gap-2 mb-6/g,
      'className="flex flex-wrap gap-2 mb-4 sm:mb-6'
    );
    totalFixes++;
    fileFixed = true;
  }

  // Write back if changes were made
  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${fileName}`);
  } else {
    console.log(`○ ${fileName} (no changes needed)`);
  }
});

console.log(`\n✅ Tab components mobile fixes complete!`);
console.log(`   Total fixes applied: ${totalFixes}`);
console.log(`   - Card grids: 1 col mobile → 2 desktop`);
console.log(`   - Responsive padding and text sizes`);
console.log(`   - Filter bars wrap properly`);
console.log(`   - Modals full-width on mobile`);
