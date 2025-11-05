const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Create about_page table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS about_page (
    id INT PRIMARY KEY DEFAULT 1,
    hero_data JSON NOT NULL,
    mission_data JSON NOT NULL,
    vision_data JSON NOT NULL,
    story_data JSON NOT NULL,
    values_data JSON NOT NULL,
    team_data JSON NOT NULL,
    contact_data JSON NOT NULL,
    banner_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

console.log('📝 Creating about_page table...');

connection.query(createTableQuery, (error) => {
  if (error) {
    console.error('❌ Error creating table:', error);
    connection.end();
    process.exit(1);
  }

  console.log('✅ about_page table created successfully!');

  // Check if data already exists
  connection.query('SELECT COUNT(*) as count FROM about_page', (err, results) => {
    if (err) {
      console.error('❌ Error checking data:', err);
      connection.end();
      process.exit(1);
    }

    if (results[0].count === 0) {
      console.log('📝 Inserting default data...');

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

      const insertQuery = `
        INSERT INTO about_page
        (id, hero_data, mission_data, vision_data, story_data, values_data, team_data, contact_data, banner_image_url)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connection.query(
        insertQuery,
        [
          JSON.stringify(defaultData.hero),
          JSON.stringify(defaultData.mission),
          JSON.stringify(defaultData.vision),
          JSON.stringify(defaultData.story),
          JSON.stringify(defaultData.values),
          JSON.stringify(defaultData.team),
          JSON.stringify(defaultData.contact),
          defaultData.bannerImageUrl
        ],
        (error) => {
          if (error) {
            console.error('❌ Error inserting default data:', error);
          } else {
            console.log('✅ Default data inserted successfully!');
          }
          connection.end();
        }
      );
    } else {
      console.log('ℹ️  Data already exists, skipping default insert');
      connection.end();
    }
  });
});
