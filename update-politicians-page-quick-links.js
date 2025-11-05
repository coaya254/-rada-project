const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'polihub', 'src', 'pages', 'PoliticiansPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Updating PoliticiansPage.jsx for Quick Links...\n');

// 1. Update import to include useEffect
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);
console.log('✓ Added useEffect import');

// 2. Add API_BASE_URL constant after imports
const apiConstant = "\nconst API_BASE_URL = 'http://localhost:5000';\n";
content = content.replace(
  "import { Search, Filter, Star, MapPin, Briefcase, TrendingUp } from 'lucide-react';",
  "import { Search, Filter, Star, MapPin, Briefcase, TrendingUp } from 'lucide-react';" + apiConstant
);
console.log('✓ Added API_BASE_URL constant');

// 3. Add quick links state and useEffect after ITEMS_PER_PAGE
const quickLinksCode = `
  // Quick links state
  const [quickLinks, setQuickLinks] = useState([]);

  // Fetch quick links from API
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const response = await fetch(\`\${API_BASE_URL}/api/quick-links\`);
        const data = await response.json();
        setQuickLinks(data);
      } catch (error) {
        console.error('Error fetching quick links:', error);
      }
    };

    fetchQuickLinks();
  }, []);
`;

content = content.replace(
  '  const ITEMS_PER_PAGE = 12;',
  '  const ITEMS_PER_PAGE = 12;' + quickLinksCode
);
console.log('✓ Added quick links state and fetch logic');

// 4. Replace hardcoded quick links with dynamic rendering
const oldQuickLinks = `          {/* Quick Links */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3">Quick Links 🔗</h3>
            <div className="space-y-2">
              <a href="#" className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition">
                📋 Voting Records
              </a>
              <a href="#" className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition">
                📊 Committee Assignments
              </a>
              <a href="#" className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition">
                💰 Campaign Finance
              </a>
              <a href="#" className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition">
                📰 Latest News
              </a>
            </div>
          </div>`;

const newQuickLinks = `          {/* Quick Links */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3">Quick Links 🔗</h3>
            <div className="space-y-2">
              {quickLinks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No quick links available</p>
              ) : (
                quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition"
                  >
                    {link.icon} {link.title}
                  </a>
                ))
              )}
            </div>
          </div>`;

content = content.replace(oldQuickLinks, newQuickLinks);
console.log('✓ Updated quick links rendering to use API data');

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ PoliticiansPage.jsx updated successfully!');
console.log('Quick links will now be fetched from the API and controlled by admin.');
