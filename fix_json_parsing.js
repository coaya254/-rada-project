const fs = require('fs');

// Read the enhanced auth middleware file
const filePath = 'enhanced_auth_middleware.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the JSON parsing issues by adding try-catch blocks
const fixes = [
  {
    search: `        const user = results[0];
        if (user) {
          user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
        }
        resolve(user || null);`,
    replace: `        const user = results[0];
        if (user) {
          try {
            user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
          } catch (parseError) {
            // Handle case where permissions is "*" or other non-JSON string
            user.permissions = user.permissions === "*" ? ["*"] : [];
          }
        }
        resolve(user || null);`
  }
];

// Apply fixes
fixes.forEach(fix => {
  content = content.replace(fix.search, fix.replace);
});

// Write the fixed content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed JSON parsing issues in enhanced_auth_middleware.js');
