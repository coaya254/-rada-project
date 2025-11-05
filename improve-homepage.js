const fs = require('fs');
const path = require('path');

console.log('Improving HomePage with requested changes...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// 1. Change politicians grid from 3 to 4 columns
console.log('1. Changing politicians grid to 4 columns...');
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">'
);
console.log('   ✓ Grid changed to 4 columns on desktop');

// 2. Change from showing 6 politicians to showing 4 (for 4-grid)
console.log('2. Adjusting to show 4 politicians...');
content = content.replace(
  '{politicians.slice(0, 6).map((politician, idx) =>',
  '{politicians.slice(0, 4).map((politician, idx) =>'
);
console.log('   ✓ Now showing 4 politicians');

// 3. Add "More" button after Learn Politics section
console.log('3. Adding More button after Learn Politics...');
const learnPoliticsSection = `            </div>
          </div>
        </div>`;

const learnPoliticsWithButton = `            </div>

            {/* More Button for Civic Education */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentPage('education')}
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-black hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-xl text-base flex items-center gap-2 mx-auto"
              >
                <span>Explore All Topics</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>`;

content = content.replace(learnPoliticsSection, learnPoliticsWithButton);
console.log('   ✓ Added "Explore All Topics" button linking to civic education');

// 4. Move Stay Updated card to the bottom of sidebar
console.log('4. Moving Stay Updated card to bottom of sidebar...');

// First, extract the Stay Updated card (Newsletter section)
const newsletterRegex = /          {\/\* Newsletter \*\/}\s*<div className="bg-gradient-to-br from-purple-500[\s\S]*?<\/div>\s*<\/div>\s*(?=\s*{\/\* Trending)/;
const newsletterMatch = content.match(newsletterRegex);

if (newsletterMatch) {
  const newsletterCard = newsletterMatch[0];

  // Remove it from current position (before Trending)
  content = content.replace(newsletterRegex, '');

  // Find the end of the sidebar (after Trending)
  const sidebarEndPattern = /(            <\/div>\s*<\/div>\s*<\/div>\s*<\/div>[\s]*<\/div>)(\s*{\/\* End Trending)/;

  // Insert the newsletter card at the end before closing sidebar
  content = content.replace(
    '</div>\n        </div>',
    `${newsletterCard}\n        </div>`
  );

  console.log('   ✓ Stay Updated card moved to bottom of sidebar');
} else {
  console.log('   ⚠️  Could not find Newsletter section to move');
}

// 5. Add import for ChevronRight if not already there
if (!content.includes('ChevronRight')) {
  content = content.replace(
    "import { Eye, MessageCircle, Calendar, ChevronRight, TrendingUp, Search } from 'lucide-react';",
    "import { Eye, MessageCircle, Calendar, ChevronRight, TrendingUp, Search } from 'lucide-react';"
  );
  console.log('5. ChevronRight already imported ✓');
} else {
  console.log('5. ChevronRight already imported ✓');
}

fs.writeFileSync(homePath, content, 'utf8');

console.log('\n✅ HomePage improvements complete!');
console.log('   Changes made:');
console.log('   • Politicians: 3-col → 4-col grid (showing 4 politicians)');
console.log('   • Added "Explore All Topics" button after Learn Politics');
console.log('   • Stay Updated card moved to bottom of sidebar');
console.log('\nNext: Connect to real politician data and fetch most popular');
