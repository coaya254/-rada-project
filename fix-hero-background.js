const fs = require('fs');
const path = require('path');

console.log('Redesigning featured hero section with background image...\n');

const homePath = path.join(__dirname, 'polihub', 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Find the entire hero section and replace it
const oldHeroPattern = /      {\/\* Featured Politician Hero Card \*\/}\s*<div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl border-4 border-white hover:shadow-\[0_20px_60px_rgba\(0,0,0,0\.15\)\] transition-all duration-300" style=\{\{ background: current\.gradient \}\}>[\s\S]*?<\/div>\s*<\/div>/;

const newHero = `      {/* Featured Politician Hero Card */}
      <div className="relative rounded-3xl overflow-hidden mb-6 sm:mb-8 shadow-2xl border-4 border-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: \`url(\${current.imageUrl})\`,
          }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0" style={{ background: current.gradient, opacity: 0.85 }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2 z-20">
          <div className="bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs font-bold">
            FEATURED
          </div>
          <div className="bg-white/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            Trending
          </div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 min-h-[500px] sm:min-h-[600px] lg:min-h-[650px]">
          {/* Previous Button */}
          <button
            onClick={prevPolitician}
            className="absolute left-3 sm:left-4 lg:left-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition z-20 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"
          >
            ‹
          </button>

          {/* Text Content - Centered */}
          <div className="text-white z-10 max-w-4xl text-center px-4">
            {/* Title Badge */}
            <div className="inline-block bg-white/30 backdrop-blur-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-white/50 shadow-lg">
              {current.title}
            </div>

            {/* Name */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-none">
              {current.nickname}
            </h2>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                <Eye size={14} />
                {current.stats.views}
              </span>
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                <MessageCircle size={14} />
                {current.stats.comments}
              </span>
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                <Calendar size={14} />
                {current.stats.time}
              </span>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mb-6 font-medium max-w-3xl mx-auto drop-shadow-lg">
              {current.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {current.tags.map((tag, idx) => (
                <span key={idx} className="bg-white/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-white/40 shadow-lg">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setSelectedPolitician(current)}
              className="bg-white text-purple-700 px-8 sm:px-12 py-3 sm:py-4 rounded-full font-black hover:bg-white/95 transition text-base sm:text-lg hover:scale-105 transform shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              Explore Full Profile →
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={nextPolitician}
            className="absolute right-3 sm:right-4 lg:right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition z-20 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"
          >
            ›
          </button>
        </div>
      </div>`;

content = content.replace(oldHeroPattern, newHero);

fs.writeFileSync(homePath, content, 'utf8');

console.log('✅ Hero section redesigned successfully!');
console.log('   - Image now used as background');
console.log('   - Text centered and overlaid on image');
console.log('   - Multiple gradient overlays for readability');
console.log('   - Better mobile presentation');
console.log('   - Larger, more immersive design');
