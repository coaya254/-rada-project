const fs = require('fs');
const path = require('path');

console.log('Moving Stay Updated card to bottom of sidebar...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Extract the Newsletter section (lines 243-277 approximately)
const newsletterSection = `
          {/* Newsletter */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-xl font-black mb-2 text-center">Stay Updated 💌</h3>
            <p className="text-xs text-center mb-4 opacity-90">
              Weekly politics & policy insights
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full border-2 border-white/50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-2 focus:ring-white text-sm bg-white/95"
              placeholder="your.email@example.com"
            />
            <button
              onClick={handleSubscribe}
              className={\`w-full py-2 rounded-full font-bold transition text-sm \${
                subscribed
                  ? 'bg-green-400 text-white'
                  : 'bg-white text-purple-700 hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-lg'
              }\`}
            >
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </button>
            <div className="flex justify-center gap-2 mt-4">
              {['TT', 'IG', 'YT', 'DC'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-white/30 transition hover:scale-110 transform border border-white/30 min-h-[40px]"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
`;

// Remove the newsletter section from its current position
const newsletterRegex = /\n          {\/\* Newsletter \*\/}\s*<div className="bg-gradient-to-br from-purple-500[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(newsletterRegex, '');

// Now insert it after the Quote section (before the closing sidebar div)
// Find the Quote section closing and insert after it
const quoteEnd = `          </div>

        </div>`;

const quoteEndWithNewsletter = `          </div>
${newsletterSection}
        </div>`;

content = content.replace(quoteEnd, quoteEndWithNewsletter);

fs.writeFileSync(homePath, content, 'utf8');

console.log('✅ Stay Updated card moved to bottom of sidebar!');
console.log('   Order is now:');
console.log('   1. Quick Search');
console.log('   2. Trending Now');
console.log('   3. Quote of the Day');
console.log('   4. Stay Updated (Newsletter)');
