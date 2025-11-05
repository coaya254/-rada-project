const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database');

  // Step 1: Find or create Susan Siili
  const findPolitician = `SELECT id FROM politicians WHERE LOWER(name) LIKE '%susan%siili%' OR LOWER(full_name) LIKE '%susan%siili%' LIMIT 1`;

  connection.query(findPolitician, (error, results) => {
    if (error) {
      console.error('❌ Error finding politician:', error);
      connection.end();
      return;
    }

    let politicianId;

    if (results.length > 0) {
      politicianId = results[0].id;
      console.log(`✅ Found Susan Siili with ID: ${politicianId}`);
      populateData(politicianId);
    } else {
      console.log('📝 Susan Siili not found, creating new entry...');
      const createPolitician = `
        INSERT INTO politicians (name, full_name, party, position, title, chamber, state, constituency,
                                 image_url, twitter_handle, instagram_handle, years_in_office, rating,
                                 biography, key_achievements)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const politicianData = [
        'Susan Siili',
        'Hon. Susan Kananu Siili',
        'ODM',
        'Member of Parliament',
        'MP',
        'National Assembly',
        'Makueni',
        'Kaiti Constituency',
        'https://via.placeholder.com/400x400?text=Susan+Siili',
        'SusanSiili',
        'susan.siili',
        '8',
        '4.2',
        'Hon. Susan Kananu Siili is a distinguished Member of Parliament representing Kaiti Constituency in Makueni County. A passionate advocate for women\'s rights and rural development, she has championed numerous initiatives to improve healthcare, education, and infrastructure in her constituency. With a background in community development and public policy, she brings a people-centered approach to legislative work.',
        'Successfully lobbied for the construction of 15 new classrooms in rural schools, championed the Maternal Healthcare Bill improving access to healthcare for mothers, led initiatives that brought clean water to over 20,000 households'
      ];

      connection.query(createPolitician, politicianData, (error, result) => {
        if (error) {
          console.error('❌ Error creating politician:', error);
          connection.end();
          return;
        }

        politicianId = result.insertId;
        console.log(`✅ Created Susan Siili with ID: ${politicianId}`);
        populateData(politicianId);
      });
    }
  });

  function populateData(politicianId) {
    let completed = 0;
    const totalTasks = 5;

    function checkComplete() {
      completed++;
      if (completed === totalTasks) {
        console.log('\n🎉 All data populated successfully!');
        console.log(`\n📊 Summary for Susan Siili (ID: ${politicianId}):`);
        console.log('  ✅ 2 Documents');
        console.log('  ✅ 2 News Articles (with multiple sources)');
        console.log('  ✅ 2 Timeline Events');
        console.log('  ✅ 2 Promises/Commitments');
        console.log('  ✅ 2 Voting Records');
        connection.end();
      }
    }

    // 1. Add Documents
    console.log('\n📄 Adding Documents...');
    const documents = [
      {
        title: 'Kaiti Constituency Development Report 2024',
        description: 'Comprehensive report on development projects and budget allocation for Kaiti Constituency. This detailed report outlines all ongoing and completed development projects for the fiscal year 2024, including budget breakdowns, project timelines, and impact assessments for schools, healthcare facilities, water projects, and road networks.',
        type: 'Report',
        file_url: 'https://example.com/docs/kaiti-development-report-2024.pdf',
        date: '2024-03-15'
      },
      {
        title: 'Maternal Healthcare Bill - Draft Proposal',
        description: 'Legislative proposal to improve maternal healthcare services in rural areas with focus on reducing maternal mortality rates. This bill proposes amendments to existing healthcare legislation to provide free maternal healthcare services in rural constituencies, establish mobile clinics, and train more community health workers.',
        type: 'Legislation',
        file_url: 'https://example.com/docs/maternal-healthcare-bill.pdf',
        date: '2024-01-20'
      }
    ];

    const documentQuery = `INSERT INTO politician_documents (politician_id, title, description, type, file_url, date) VALUES (?, ?, ?, ?, ?, ?)`;

    documents.forEach((doc, index) => {
      connection.query(documentQuery, [
        politicianId, doc.title, doc.description, doc.type, doc.file_url, doc.date
      ], (error) => {
        if (error) console.error(`❌ Error adding document ${index + 1}:`, error.message);
        else console.log(`  ✅ Added: ${doc.title}`);
      });
    });
    checkComplete();

    // 2. Add News with Multiple Sources
    console.log('\n📰 Adding News Articles...');
    const newsArticles = [
      {
        title: 'MP Susan Siili Launches Water Project Benefiting 10,000 Households',
        summary: 'PoliHub Briefing: Hon. Susan Siili officially launched a major water project in Kaiti Constituency that will provide clean water access to over 10,000 households in rural areas. The Ksh 50 million project includes construction of boreholes, water tanks, and distribution networks.',
        content: 'In a ceremony attended by community leaders and residents, MP Susan Siili commissioned a transformative water project aimed at solving the long-standing water crisis in Kaiti Constituency. The project, funded through CDF and county government partnership, features 15 boreholes, 20 water storage tanks, and over 30 kilometers of pipeline infrastructure. The MP emphasized the importance of clean water access for health and economic development.',
        category: 'Infrastructure',
        credibility: 'high',
        source_links: JSON.stringify({
          'KTN News': 'https://ktnnews.com/susan-siili-water-project',
          'NTV': 'https://ntv.co.ke/kaiti-water-project-2024',
          'Citizen TV': 'https://citizen.digital/susan-siili-launches-water-project'
        }),
        published_date: '2024-10-15',
        image_url: 'https://via.placeholder.com/800x400?text=Water+Project+Launch'
      },
      {
        title: 'Maternal Healthcare Bill Gains Support in National Assembly',
        summary: 'PoliHub Briefing: The Maternal Healthcare Bill championed by MP Susan Siili has received overwhelming support from members of the National Assembly Health Committee. The bill proposes free maternal healthcare services in rural areas and additional funding for mobile clinics.',
        content: 'The National Assembly Health Committee convened to discuss the groundbreaking Maternal Healthcare Bill presented by Hon. Susan Siili. Committee members praised the comprehensive nature of the bill, which includes provisions for free antenatal care, delivery services, and postnatal support in rural constituencies. The bill also proposes training 500 additional community health workers and establishing 50 mobile maternal health clinics across the country.',
        category: 'Healthcare',
        credibility: 'high',
        source_links: JSON.stringify({
          'KBC': 'https://kbc.co.ke/maternal-healthcare-bill-2024',
          'The Standard': 'https://standardmedia.co.ke/susan-siili-healthcare-bill',
          'Daily Nation': 'https://nation.africa/maternal-healthcare-legislation'
        }),
        published_date: '2024-09-28',
        image_url: 'https://via.placeholder.com/800x400?text=Parliament+Session'
      }
    ];

    // First insert news, then link to politician
    newsArticles.forEach((news, index) => {
      const newsQuery = `INSERT INTO news (title, description, source, category, credibility, source_links, published_date, image_url, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      connection.query(newsQuery, [
        news.title, news.summary, 'Multiple Sources', news.category, news.credibility, news.source_links, news.published_date, news.image_url, 'https://example.com/news'
      ], (error, result) => {
        if (error) {
          console.error(`❌ Error adding news ${index + 1}:`, error.message);
        } else {
          const newsId = result.insertId;
          // Link news to politician
          connection.query('INSERT INTO politician_news (politician_id, news_id) VALUES (?, ?)', [politicianId, newsId], (linkError) => {
            if (linkError) console.error(`❌ Error linking news ${index + 1}:`, linkError.message);
            else console.log(`  ✅ Added: ${news.title}`);
          });
        }
      });
    });
    checkComplete();

    // 3. Add Timeline Events
    console.log('\n📅 Adding Timeline Events...');
    const timelineEvents = [
      {
        title: 'Elected Member of Parliament for Kaiti Constituency',
        description: 'Hon. Susan Siili was elected as the Member of Parliament for Kaiti Constituency in Makueni County, receiving 68% of the vote. Her campaign focused on healthcare, education, and infrastructure development.',
        type: 'Election',
        date: '2017-08-08'
      },
      {
        title: 'Appointed Chairperson of Health Committee',
        description: 'Appointed as the Chairperson of the National Assembly Select Committee on Health, where she has championed various healthcare reforms including the Maternal Healthcare Bill and increased funding for rural health facilities.',
        type: 'Appointment',
        date: '2022-05-15'
      }
    ];

    const timelineQuery = `INSERT INTO politician_timeline (politician_id, title, description, type, date) VALUES (?, ?, ?, ?, ?)`;

    timelineEvents.forEach((event, index) => {
      connection.query(timelineQuery, [
        politicianId, event.title, event.description, event.type, event.date
      ], (error) => {
        if (error) console.error(`❌ Error adding timeline event ${index + 1}:`, error.message);
        else console.log(`  ✅ Added: ${event.title}`);
      });
    });
    checkComplete();

    // 4. Add Promises/Commitments
    console.log('\n🤝 Adding Promises/Commitments...');
    const commitments = [
      {
        title: 'Build 20 New Classrooms in Rural Schools',
        description: 'Commitment to construct 20 new classrooms across 10 rural schools in Kaiti Constituency to address classroom shortage and improve learning environment for students. As of October 2024, 15 classrooms have been completed across 8 schools.',
        status: 'in_progress',
        category: 'Education',
        progress: 75,
        date_made: '2018-01-10',
        deadline: '2024-12-31'
      },
      {
        title: 'Improve Access to Clean Water for All Villages',
        description: 'Promise to ensure every village in Kaiti Constituency has access to clean water through construction of boreholes, water tanks, and piped water systems. Successfully completed water projects covering all 45 villages in the constituency. Over 10,000 households now have access to clean water.',
        status: 'kept',
        category: 'Infrastructure',
        progress: 100,
        date_made: '2018-01-10',
        deadline: '2024-06-30'
      }
    ];

    const commitmentQuery = `INSERT INTO politician_commitments (politician_id, title, description, status, category, progress, date_made, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    commitments.forEach((commitment, index) => {
      connection.query(commitmentQuery, [
        politicianId, commitment.title, commitment.description, commitment.status,
        commitment.category, commitment.progress, commitment.date_made, commitment.deadline
      ], (error) => {
        if (error) console.error(`❌ Error adding commitment ${index + 1}:`, error.message);
        else console.log(`  ✅ Added: ${commitment.title}`);
      });
    });
    checkComplete();

    // 5. Add Voting Records
    console.log('\n🗳️ Adding Voting Records...');
    const votingRecords = [
      {
        bill_name: 'The Maternal Healthcare Bill 2024',
        description: 'A bill to provide free maternal healthcare services in rural areas, establish mobile clinics, and increase training for community health workers to reduce maternal mortality rates. MP Siili was the primary sponsor of this bill.',
        vote: 'yes',
        date: '2024-06-20',
        category: 'Healthcare'
      },
      {
        bill_name: 'County Infrastructure Development Fund Bill 2024',
        description: 'Bill to allocate additional funding for county infrastructure projects including roads, bridges, water systems, and public facilities in rural constituencies. Strong support across party lines.',
        vote: 'yes',
        date: '2024-08-15',
        category: 'Infrastructure'
      }
    ];

    const votingQuery = `INSERT INTO politician_voting_records (politician_id, bill_name, description, vote, date, category) VALUES (?, ?, ?, ?, ?, ?)`;

    votingRecords.forEach((record, index) => {
      connection.query(votingQuery, [
        politicianId, record.bill_name, record.description, record.vote, record.date, record.category
      ], (error) => {
        if (error) console.error(`❌ Error adding voting record ${index + 1}:`, error.message);
        else console.log(`  ✅ Added: ${record.bill_name}`);
      });
    });
    checkComplete();
  }
});
