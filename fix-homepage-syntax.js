const fs = require('fs');
const path = require('path');

console.log('Fixing HomePage.jsx syntax error...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Remove the duplicate old hero section (lines 121-189)
// This is the extra content after the new hero ends at line 119

const duplicateHeroRegex = /        <\/div>\s*<\/div>\s*\s*<div className="relative flex flex-col lg:flex-row[\s\S]*?›\s*<\/button>\s*<\/div>\s*<\/div>\s*(?=\s*{\/\* Main Content Grid \*\/})/;

content = content.replace(duplicateHeroRegex, '        </div>\n      </div>\n');

fs.writeFileSync(homePath, content, 'utf8');

console.log('✅ Fixed HomePage.jsx syntax error!');
console.log('   Removed duplicate hero section remnants');
