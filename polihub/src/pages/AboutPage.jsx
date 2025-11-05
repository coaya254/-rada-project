import React, { useState, useEffect } from 'react';
import { Mail, Heart, Sparkles, Target, Users } from 'lucide-react';

export default function AboutPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback data (shown if API fails)
  const defaultData = {
    hero: {
      title: "We're Building Democracy's Future",
      subtitle: "Empowering Gen Z to understand, engage, and shape the political landscape.",
      imageUrl: ""
    },
    mission: {
      text: "Making political education accessible, engaging, and empowering for young people. We're breaking down barriers and building bridges between Gen Z and democracy."
    },
    vision: {
      text: "A future where every young person feels confident participating in democracy, equipped with knowledge and tools to shape their communities."
    },
    story: {
      paragraphs: [
        "PoliHub was born from a simple observation: young people wanted to engage with politics, but traditional civics education wasn't speaking their language.",
        "In 2024, while organizing voter registration drives, our founder kept hearing \"I want to vote, but I don't understand how any of this works.\" That's when everything clicked.",
        "We built the platform we wished existed—one that makes democracy feel accessible, exciting, and actually relevant to our lives."
      ],
      stats: [
        { label: "Founded", value: "2024" },
        { label: "Active Users", value: "50K+" },
        { label: "Potential", value: "∞" }
      ],
      imageUrl: ""
    },
    values: [
      { icon: "🎓", title: "Education First", desc: "Clear, accurate, unbiased information", color: "from-blue-400 to-blue-600" },
      { icon: "🌈", title: "Radically Inclusive", desc: "Every voice and perspective matters", color: "from-purple-400 to-purple-600" },
      { icon: "⚡", title: "Boldly Engaging", desc: "Making politics exciting, not boring", color: "from-pink-400 to-pink-600" },
      { icon: "🔍", title: "Deeply Transparent", desc: "Sources, facts, and critical thinking", color: "from-green-400 to-green-600" },
      { icon: "💪", title: "Truly Empowering", desc: "Tools to create real change", color: "from-orange-400 to-orange-600" },
      { icon: "🤝", title: "Community Driven", desc: "Building connections that matter", color: "from-red-400 to-red-600" }
    ],
    team: [
      { name: "Alex Chen", role: "Founder & CEO", emoji: "💼", bio: "Former political organizer turned civic tech entrepreneur", imageUrl: "" },
      { name: "Jordan Smith", role: "Head of Content", emoji: "✍️", bio: "Making complex policy accessible to everyone", imageUrl: "" },
      { name: "Taylor Kim", role: "Lead Developer", emoji: "💻", bio: "Building beautiful, powerful civic tools", imageUrl: "" },
      { name: "Morgan Davis", role: "Community Manager", emoji: "🤝", bio: "Connecting young voices with political action", imageUrl: "" },
      { name: "Casey Rivera", role: "Education Director", emoji: "🎓", bio: "Designing curriculum that actually works", imageUrl: "" },
      { name: "Sam Patel", role: "Head of Design", emoji: "🎨", bio: "Crafting beautiful, intuitive experiences", imageUrl: "" }
    ],
    contact: {
      email: "hello@polihub.com",
      socials: [
        { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/polihub' },
        { name: 'Instagram', icon: '📸', url: 'https://instagram.com/polihub' },
        { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@polihub' },
        { name: 'YouTube', icon: '📺', url: 'https://youtube.com/@polihub' }
      ]
    },
    bannerImageUrl: ""
  };

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polihub/about-page');
      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ About page data loaded from database');
        setData(result.data);
      } else {
        console.log('⚠️ Using default about page data');
        setData(defaultData);
      }
    } catch (error) {
      console.error('❌ Error loading about page data:', error);
      setData(defaultData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-bold text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const aboutData = data || defaultData;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-2xl md:rounded-3xl overflow-hidden mb-6 md:mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center">
          <div className="p-6 sm:p-10 lg:p-16 text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 md:mb-6 leading-tight">{aboutData.hero.title}</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 leading-relaxed">
              {aboutData.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
              <button className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:scale-105 transition">
                Join the Movement
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:bg-white/30 transition">
                Our Story
              </button>
            </div>
          </div>
          <div className="p-6 sm:p-8 lg:pr-16">
            {aboutData.hero.imageUrl ? (
              <img
                src={aboutData.hero.imageUrl}
                alt="Hero"
                className="rounded-2xl w-full h-full object-cover"
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl aspect-[4/3] flex items-center justify-center border-4 border-white/30">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🎯</div>
                  <div className="text-white text-xl font-bold">Hero Image</div>
                  <div className="text-white/70 text-sm mt-2">Add your team photo here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission & Vision Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-6xl sm:text-9xl opacity-10">💎</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl">
                <Target className="w-8 h-8 md:w-12 md:h-12" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">Our Mission</h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed opacity-95">
              {aboutData.mission.text}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border-2 md:border-4 border-purple-100 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 text-6xl sm:text-9xl opacity-5">✨</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 md:p-4 rounded-xl md:rounded-2xl">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800">Our Vision</h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700">
              {aboutData.vision.text}
            </p>
          </div>
        </div>
      </div>

      {/* Story Section with Image */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-purple-100 overflow-hidden mb-6 md:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="col-span-1 lg:col-span-3 p-6 sm:p-8 md:p-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6 text-gray-800 flex items-center gap-3 md:gap-4">
              <span className="text-4xl sm:text-5xl md:text-6xl">📖</span> Our Story
            </h2>
            <div className="space-y-4 md:space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
              {aboutData.story.paragraphs.map((paragraph, idx) => (
                <p key={idx} className={idx === aboutData.story.paragraphs.length - 1 ? "font-bold text-purple-600 text-lg sm:text-xl" : ""}>
                  {paragraph}
                </p>
              ))}
              <div className="flex flex-wrap gap-4 md:gap-6 mt-6 md:mt-8">
                {aboutData.story.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-600">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-6 sm:p-8 min-h-[200px] lg:min-h-0">
            {aboutData.story.imageUrl ? (
              <img
                src={aboutData.story.imageUrl}
                alt="Story"
                className="rounded-xl w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-6xl sm:text-9xl mb-3 md:mb-4">🚀</div>
                <div className="text-base sm:text-lg font-bold text-gray-700">Founder Story Image</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-2">Add your image here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Values Grid - Redesigned */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 mb-6 md:mb-8 border-2 md:border-4 border-white shadow-xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 md:mb-10 text-center text-gray-800">
          What Drives Us 💪
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {aboutData.values.map((value, idx) => (
            <div key={idx} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-xl md:rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl p-6 md:p-8 m-1 text-center hover:bg-white transition-colors">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 md:mb-4">{value.icon}</div>
                <h3 className="font-black text-lg sm:text-xl md:text-2xl mb-2 md:mb-3 text-gray-800">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section - Full Width */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-purple-100 p-6 sm:p-8 md:p-12 mb-6 md:mb-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-4 text-gray-800">Meet The Humans Behind PoliHub</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Passionate people building the future of civic engagement</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {aboutData.team.map((member, idx) => (
            <div key={idx} className="group">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="rounded-xl md:rounded-2xl w-full aspect-square object-cover mb-3 md:mb-4 border-2 md:border-4 border-purple-200 group-hover:border-purple-400 transition"
                />
              ) : (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl md:rounded-2xl p-4 mb-3 md:mb-4 aspect-square flex items-center justify-center border-2 md:border-4 border-purple-200 group-hover:border-purple-400 transition">
                  <div className="text-center">
                    <div className="text-6xl sm:text-7xl md:text-9xl mb-2">{member.emoji}</div>
                    <div className="text-xs sm:text-sm font-bold text-gray-600">Add Team Photo</div>
                  </div>
                </div>
              )}
              <h3 className="font-black text-xl sm:text-2xl mb-2 text-gray-800">{member.name}</h3>
              <p className="text-purple-600 font-bold mb-2 md:mb-3 text-sm sm:text-base">{member.role}</p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join & Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Join Us */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 text-6xl sm:text-9xl opacity-10">🚀</div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
              <Users className="w-8 h-8 md:w-10 md:h-10" />
              Join Our Mission
            </h3>
            <p className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 opacity-95 leading-relaxed">
              Help us build the future of civic engagement. We're looking for passionate contributors, volunteers, and partners.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-white text-purple-600 py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:scale-105 transition">
                Contribute Content
              </button>
              <button className="w-full bg-white/20 backdrop-blur-md py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-white/30 transition">
                Volunteer With Us
              </button>
              <button className="w-full bg-white/20 backdrop-blur-md py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-white/30 transition">
                Partner With Us
              </button>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border-2 md:border-4 border-purple-100">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 md:mb-6 text-gray-800 flex items-center gap-3 md:gap-4">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />
            Let's Connect
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
            Questions? Ideas? Just want to say hi? We'd love to hear from you.
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border-2 border-purple-200">
            <a href={`mailto:${aboutData.contact.email}`} className="flex items-center gap-2 md:gap-3 text-gray-800 hover:text-purple-600 transition text-sm sm:text-base md:text-lg font-bold break-all">
              <Mail className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              {aboutData.contact.email}
            </a>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-black text-gray-600 mb-3 uppercase tracking-wide">Follow Our Journey</div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {aboutData.contact.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg md:rounded-xl font-bold hover:scale-105 transition text-sm md:text-base"
                >
                  <span>{social.icon}</span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Culture/Community Image Banner */}
      {aboutData.bannerImageUrl ? (
        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
          <img
            src={aboutData.bannerImageUrl}
            alt="Community Banner"
            className="w-full h-48 sm:h-56 md:h-64 object-cover"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-xl">
          <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl aspect-[3/1] flex items-center justify-center border-2 md:border-4 border-white/30">
            <div className="text-center p-4 sm:p-6 md:p-8">
              <div className="text-6xl sm:text-7xl md:text-9xl mb-3 md:mb-4">🎉</div>
              <div className="text-white text-lg sm:text-xl md:text-2xl font-black">Community & Culture Banner</div>
              <div className="text-white/80 mt-1 md:mt-2 text-xs sm:text-sm md:text-base">Add a wide photo of your team, events, or community here</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
