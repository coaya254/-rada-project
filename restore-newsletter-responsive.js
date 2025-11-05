const fs = require('fs');
const path = require('path');

console.log('Restoring Newsletter card with responsive positioning...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// The newsletter card HTML
const newsletterCard = `
          {/* Newsletter - Position varies by screen size */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100 order-2 lg:order-2">
            <h3 className="text-xl font-black mb-2 text-center">Stay Updated 💌</h3>
            <p className="text-xs text-center mb-4 opacity-90">
              Weekly politics & policy insights
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full border-2 border-white/50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm bg-white/95"
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
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-white/30 transition hover:scale-110 transform border border-white/30"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
`;

// Insert after Quick Search
const afterQuickSearch = `          </div>
${newsletterCard}
          {/* Trending Compact */}`;

content = content.replace(
  '          </div>\n\n          {/* Trending Compact */',
  afterQuickSearch
);

// Update the sidebar to use flexbox with responsive ordering
content = content.replace(
  '{/* Right Sidebar */}\n        <div className="lg:col-span-4 space-y-5">',
  '{/* Right Sidebar */}\n        <div className="lg:col-span-4 flex flex-col space-y-5">'
);

// Add order classes to other items
// Quick Search: order-1
content = content.replace(
  '{/* Quick Search */}\n          <div className="bg-white/95 backdrop-blur-xl rounded-2xl',
  '{/* Quick Search */}\n          <div className="order-1 bg-white/95 backdrop-blur-xl rounded-2xl'
);

// Trending: order-3 mobile, order-3 desktop
content = content.replace(
  '{/* Trending Compact */}\n          <div className="bg-white/95 backdrop-blur-xl rounded-2xl',
  '{/* Trending Compact */}\n          <div className="order-3 bg-white/95 backdrop-blur-xl rounded-2xl'
);

// Quote: order-4
content = content.replace(
  '{/* Quote */}\n          <div className="bg-white/80 backdrop-blur-md rounded-2xl',
  '{/* Quote */}\n          <div className="order-4 bg-white/80 backdrop-blur-md rounded-2xl'
);

fs.writeFileSync(homePath, content, 'utf8');

console.log('✅ Newsletter card restored!');
console.log('   Position:');
console.log('   - Desktop: After Quick Search (order-2)');
console.log('   - Mobile: After Quick Search (order-2)');
console.log('');
console.log('   Sidebar order:');
console.log('   1. Quick Search');
console.log('   2. Stay Updated (Newsletter)');
console.log('   3. Trending Now');
console.log('   4. Quote of the Day');
