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
  console.log('✅ Connected to database\n');
});

// Check what's in the about_page table
connection.query('SELECT * FROM about_page WHERE id = 1', (error, rows) => {
  if (error) {
    console.error('❌ Error fetching data:', error);
    connection.end();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('❌ No data found in about_page table');
    connection.end();
    return;
  }

  console.log('✅ Found data in about_page table!\n');

  const row = rows[0];

  try {
    const hero = JSON.parse(row.hero_data);
    const mission = JSON.parse(row.mission_data);
    const vision = JSON.parse(row.vision_data);
    const story = JSON.parse(row.story_data);
    const values = JSON.parse(row.values_data);
    const team = JSON.parse(row.team_data);
    const contact = JSON.parse(row.contact_data);

    console.log('📊 CURRENT DATA IN DATABASE:');
    console.log('════════════════════════════════════════\n');

    console.log('🎯 HERO:');
    console.log(`   Title: ${hero.title}`);
    console.log(`   Subtitle: ${hero.subtitle}`);
    console.log(`   Image: ${hero.imageUrl || '(none)'}\n`);

    console.log('🎯 MISSION:');
    console.log(`   ${mission.text}\n`);

    console.log('✨ VISION:');
    console.log(`   ${vision.text}\n`);

    console.log('📖 STORY:');
    console.log(`   Paragraphs: ${story.paragraphs?.length || 0}`);
    console.log(`   Stats: ${story.stats?.length || 0}`);
    if (story.paragraphs && story.paragraphs.length > 0) {
      console.log(`   First paragraph: ${story.paragraphs[0].substring(0, 80)}...`);
    }
    console.log('');

    console.log('💪 VALUES:');
    console.log(`   Total: ${values.length}`);
    values.forEach((v, i) => {
      console.log(`   ${i+1}. ${v.icon} ${v.title}`);
    });
    console.log('');

    console.log('👥 TEAM:');
    console.log(`   Total: ${team.length}`);
    team.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.emoji} ${m.name} - ${m.role}`);
    });
    console.log('');

    console.log('📧 CONTACT:');
    console.log(`   Email: ${contact.email}`);
    console.log(`   Socials: ${contact.socials?.length || 0}`);
    console.log('');

    console.log('🎉 BANNER:');
    console.log(`   ${row.banner_image_url || '(none)'}`);

    console.log('\n════════════════════════════════════════');
    console.log('Last updated:', row.updated_at);

  } catch (e) {
    console.error('❌ Error parsing JSON data:', e.message);
    console.log('\nRaw data:');
    console.log(row);
  }

  connection.end();
});
