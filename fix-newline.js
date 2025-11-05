const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Add proper newline before Main Content Grid comment
content = content.replace(
  '      </div>\n{/* Main Content Grid */',
  '      </div>\n\n      {/* Main Content Grid */'
);

fs.writeFileSync(homePath, content, 'utf8');
console.log('✓ Fixed formatting');
