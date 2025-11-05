const mysql = require('mysql2/promise');

async function createBlogAuthorsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rada_ke'
  });

  try {
    console.log('📝 Creating blog_authors table...');

    // Create blog_authors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_authors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        bio TEXT,
        expertise VARCHAR(255),
        profile_image VARCHAR(500),
        twitter VARCHAR(255),
        linkedin VARCHAR(255),
        email VARCHAR(255),
        website VARCHAR(255),
        posts_count INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_featured (featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ blog_authors table created successfully!');

    // Add sample author (Winfri)
    console.log('📝 Adding sample author: Winfri Owino...');

    await connection.query(`
      INSERT INTO blog_authors (name, slug, bio, expertise, profile_image, twitter, email, featured, status)
      VALUES (
        'Winfri Owino',
        'winfri-owino',
        'Winfri Owino is a passionate political analyst and civic educator dedicated to empowering young Kenyans through accessible political education. With over 8 years of experience covering Kenyan politics, she brings deep insights into governance, policy analysis, and democratic participation. Her work focuses on breaking down complex political issues into understandable content that inspires civic action.',
        'Political Analysis, Governance, Civic Education',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        '@WinfriOwino',
        'winfri.owino@radamtaani.ke',
        TRUE,
        'active'
      )
      ON DUPLICATE KEY UPDATE
        bio = VALUES(bio),
        expertise = VALUES(expertise),
        profile_image = VALUES(profile_image),
        twitter = VALUES(twitter),
        email = VALUES(email),
        featured = VALUES(featured)
    `);

    console.log('✅ Sample author added: Winfri Owino');

    // Add author_id column to blog_posts table
    console.log('📝 Adding author_id column to blog_posts...');

    await connection.query(`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS author_id INT,
      ADD FOREIGN KEY (author_id) REFERENCES blog_authors(id) ON DELETE SET NULL
    `);

    console.log('✅ blog_posts table updated with author_id column');

    // Update existing blog posts to link to Winfri
    console.log('📝 Linking existing blog posts to Winfri...');

    const [winfri] = await connection.query('SELECT id FROM blog_authors WHERE slug = ?', ['winfri-owino']);

    if (winfri.length > 0) {
      await connection.query('UPDATE blog_posts SET author_id = ? WHERE author_id IS NULL', [winfri[0].id]);
      console.log('✅ Existing blog posts linked to Winfri');
    }

    // Update posts count
    await connection.query(`
      UPDATE blog_authors a
      SET posts_count = (
        SELECT COUNT(*) FROM blog_posts b WHERE b.author_id = a.id
      )
    `);

    console.log('✅ Author post counts updated');

    console.log('\n🎉 Blog Authors System Setup Complete!');
    console.log('✅ blog_authors table created');
    console.log('✅ Sample author "Winfri Owino" added');
    console.log('✅ blog_posts linked to authors');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createBlogAuthorsTable();
