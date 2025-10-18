const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Check if we already have sufficient data
  db.query('SELECT COUNT(*) as count FROM politicians', (err, results) => {
    if (err) {
      console.error('Error checking existing data:', err);
      db.end();
      process.exit(1);
    }

    if (results[0].count >= 5) {
      console.log(`✅ Database already has ${results[0].count} politicians. Skipping sample data insertion.`);
      db.end();
      process.exit(0);
    }

    console.log('\n📊 Adding sample politician data...\n');
    addSampleData();
  });
});

function addSampleData() {
  const politicians = [
    {
      name: 'Hon. William Ruto',
      party: 'UDA',
      position: 'President of Kenya',
      constituency: 'Uasin Gishu',
      bio: 'Fifth President of the Republic of Kenya. Former Deputy President (2013-2022). Known for his bottom-up economic model focusing on empowering small-scale enterprises and youth employment.',
      education: 'PhD in Plant Ecology from University of Nairobi, MSc in Botany from University of Nairobi, BSc in Botany and Zoology from University of Nairobi',
      key_achievements: JSON.stringify([
        'Championed the Bottom-Up Economic Model',
        'Led the Digital Superhighway Initiative',
        'Established the Hustler Fund for SMEs'
      ]),
      image_url: 'https://example.com/ruto.jpg',
      is_draft: false,
      slug: 'william-ruto'
    },
    {
      name: 'Hon. Raila Odinga',
      party: 'ODM',
      position: 'Opposition Leader',
      constituency: 'Lang\'ata',
      bio: 'Veteran politician and former Prime Minister of Kenya (2008-2013). Leader of the Orange Democratic Movement. Five-time presidential candidate and champion of democratic reforms.',
      education: 'MSc in Mechanical Engineering from Technical University of Magdeburg, BSc in Mechanical Engineering from University of Nairobi',
      key_achievements: JSON.stringify([
        'Served as Prime Minister (2008-2013)',
        'Led the 2010 Constitutional Referendum',
        'Champion of devolution and social justice'
      ]),
      image_url: 'https://example.com/raila.jpg',
      is_draft: false,
      slug: 'raila-odinga'
    },
    {
      name: 'Hon. Martha Karua',
      party: 'NARC-Kenya',
      position: 'Party Leader',
      constituency: 'Kirinyaga',
      bio: 'Former Minister of Justice and Constitutional Affairs. Known as the "Iron Lady" of Kenyan politics. Strong advocate for women\'s rights, rule of law, and constitutional reforms.',
      education: 'Bachelor of Laws (LL.B) from University of Nairobi, Diploma in Law from Kenya School of Law',
      key_achievements: JSON.stringify([
        'First woman to contest for presidency',
        'Championed 2010 Constitution',
        'Established women\'s rights advocacy programs'
      ]),
      image_url: 'https://example.com/karua.jpg',
      is_draft: false,
      slug: 'martha-karua'
    },
    {
      name: 'Hon. Kalonzo Musyoka',
      party: 'Wiper',
      position: 'Wiper Party Leader',
      constituency: 'Mwingi',
      bio: 'Former Vice President of Kenya (2008-2013). Seasoned diplomat and politician. Known for his mediation skills and commitment to peace and reconciliation.',
      education: 'Bachelor of Laws (LL.B) from University of Nairobi, Master of Laws (LL.M) from University of Cyprus',
      key_achievements: JSON.stringify([
        'Served as Vice President (2008-2013)',
        'Former Minister of Foreign Affairs',
        'Mediated regional peace initiatives'
      ]),
      image_url: 'https://example.com/kalonzo.jpg',
      is_draft: false,
      slug: 'kalonzo-musyoka'
    },
    {
      name: 'Hon. Musalia Mudavadi',
      party: 'ANC',
      position: 'Prime Cabinet Secretary',
      constituency: 'Vihiga',
      bio: 'Current Prime Cabinet Secretary and Foreign Minister. Former Deputy Prime Minister and Vice President. Leader of the Amani National Congress party.',
      education: 'Bachelor of Arts in Development Studies from University of Nairobi',
      key_achievements: JSON.stringify([
        'Served as Deputy Prime Minister',
        'Former Minister of Finance',
        'Led economic reform initiatives'
      ]),
      image_url: 'https://example.com/mudavadi.jpg',
      is_draft: false,
      slug: 'musalia-mudavadi'
    }
  ];

  let insertedCount = 0;
  const totalPoliticians = politicians.length;

  politicians.forEach((politician, index) => {
    const query = `
      INSERT INTO politicians (
        name, party, position, constituency, bio, education,
        key_achievements, image_url, is_draft, slug, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      politician.name,
      politician.party,
      politician.position,
      politician.constituency,
      politician.bio,
      politician.education,
      politician.key_achievements,
      politician.image_url,
      politician.is_draft,
      politician.slug
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(`❌ Error inserting ${politician.name}:`, err.message);
      } else {
        console.log(`✅ Added: ${politician.name} (ID: ${result.insertId})`);

        // Add sample timeline events for this politician
        addTimelineEvents(result.insertId, politician.name);

        // Add sample commitments
        addCommitments(result.insertId, politician.name);
      }

      insertedCount++;
      if (insertedCount === totalPoliticians) {
        setTimeout(() => {
          console.log(`\n✅ Successfully added ${totalPoliticians} politicians with sample data!`);
          db.end();
        }, 2000); // Wait for timeline/commitment inserts
      }
    });
  });
}

function addTimelineEvents(politicianId, politicianName) {
  const events = [
    {
      title: 'Elected to Parliament',
      description: `${politicianName} was elected as Member of Parliament, marking the beginning of their political career.`,
      event_date: '2007-12-27',
      event_type: 'position'
    },
    {
      title: 'Appointed Cabinet Minister',
      description: `Appointed to serve in the Cabinet, taking on key ministerial responsibilities.`,
      event_date: '2013-04-10',
      event_type: 'achievement'
    },
    {
      title: 'Launched Community Initiative',
      description: `Launched a major community development initiative focusing on youth empowerment and economic growth.`,
      event_date: '2018-06-15',
      event_type: 'event'
    }
  ];

  events.forEach(event => {
    const query = `
      INSERT INTO timeline_events (
        politician_id, title, description, event_date, event_type, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(query, [
      politicianId,
      event.title,
      event.description,
      event.event_date,
      event.event_type
    ], (err) => {
      if (err) {
        console.error(`  ❌ Error adding timeline event for ${politicianName}:`, err.message);
      } else {
        console.log(`  ✅ Added timeline: ${event.title}`);
      }
    });
  });
}

function addCommitments(politicianId, politicianName) {
  const commitments = [
    {
      promise: 'Create 1 million jobs',
      description: 'Commitment to create one million job opportunities for youth through various economic initiatives.',
      category: 'Economy',
      date_made: '2022-08-15',
      status: 'early_progress',
      progress_percentage: 25
    },
    {
      promise: 'Build 500 new schools',
      description: 'Construct 500 new schools across the country to improve access to education.',
      category: 'Education',
      date_made: '2022-08-15',
      status: 'significant_progress',
      progress_percentage: 60
    },
    {
      promise: 'Universal healthcare coverage',
      description: 'Implement universal healthcare coverage for all citizens.',
      category: 'Healthcare',
      date_made: '2022-08-15',
      status: 'early_progress',
      progress_percentage: 35
    }
  ];

  commitments.forEach(commitment => {
    const query = `
      INSERT INTO commitments (
        politician_id, promise, description, category, date_made,
        status, progress_percentage, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(query, [
      politicianId,
      commitment.promise,
      commitment.description,
      commitment.category,
      commitment.date_made,
      commitment.status,
      commitment.progress_percentage
    ], (err) => {
      if (err) {
        console.error(`  ❌ Error adding commitment for ${politicianName}:`, err.message);
      } else {
        console.log(`  ✅ Added commitment: ${commitment.promise}`);
      }
    });
  });
}
