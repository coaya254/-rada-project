const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  // First, check the structure of discussions table
  db.query('DESCRIBE discussions', (err, columns) => {
    if (err) {
      console.error('❌ Error describing discussions table:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('📋 Discussions table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Now check the data
    console.log('\n📊 Checking discussions data:\n');

    const query = `
      SELECT
        id,
        uuid,
        title,
        created_at
      FROM discussions
      ORDER BY created_at DESC
      LIMIT 10
    `;

    db.query(query, (err, discussions) => {
      if (err) {
        console.error('❌ Error fetching discussions:', err.message);
        db.end();
        process.exit(1);
      }

      console.log(`Found ${discussions.length} discussions:\n`);
      discussions.forEach((d, idx) => {
        console.log(`${idx + 1}. [ID: ${d.id}] ${d.title}`);
        console.log(`   UUID: ${d.uuid}`);
        console.log(`   Created: ${d.created_at}\n`);
      });

      // Now check if Jay's UUID exists in any discussions
      const jaysUUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
      console.log(`\n🔍 Searching for discussions by Jay (${jaysUUID}):\n`);

      db.query('SELECT id, uuid, title FROM discussions WHERE uuid = ?', [jaysUUID], (err, jaysDiscussions) => {
        if (err) {
          console.error('❌ Error:', err.message);
        } else if (jaysDiscussions.length === 0) {
          console.log('❌ NO DISCUSSIONS FOUND for Jay\'s UUID!');
          console.log('   This explains why Profile Posts tab is empty.');
          console.log('\n💡 The discussions.uuid field likely contains the discussion UUID, not author UUID!');
        } else {
          console.log(`✅ Found ${jaysDiscussions.length} discussions by Jay:`);
          jaysDiscussions.forEach(d => {
            console.log(`   - ${d.title}`);
          });
        }

        db.end();
        process.exit(0);
      });
    });
  });
});
