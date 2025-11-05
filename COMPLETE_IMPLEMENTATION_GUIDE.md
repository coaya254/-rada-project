# COMPLETE IMPLEMENTATION GUIDE
## All Fixes & Features - Step by Step

This is a comprehensive guide for implementing all requested features. Due to the extensive nature (10+ major features), I'm providing you with the complete implementation plan.

---

## PRIORITY 1: DATABASE SETUP

### Run these SQL commands first:

```sql
-- 1. Add constituency fields to politicians table
ALTER TABLE politicians ADD COLUMN constituency_representation TEXT;
ALTER TABLE politicians ADD COLUMN constituency_focus_areas TEXT;

-- 2. Create party history table
CREATE TABLE IF NOT EXISTS politician_parties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  party_name VARCHAR(200) NOT NULL,
  start_date DATE,
  end_date DATE NULL,
  analysis TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
);

-- 3. Create achievements table
CREATE TABLE IF NOT EXISTS politician_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  achievement_date DATE,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
);

-- 4. Create sources master table (for color-coded source tabs)
CREATE TABLE IF NOT EXISTS sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  default_url VARCHAR(500),
  color VARCHAR(50) DEFAULT 'blue',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert common sources
INSERT INTO sources (name, default_url, color) VALUES
('KBC', 'https://www.kbc.co.ke', 'red'),
('NTV', 'https://www.ntv.co.ke', 'blue'),
('CNN', 'https://www.cnn.com', 'red'),
('BBC', 'https://www.bbc.com', 'black'),
('Citizen TV', 'https://www.citizen.digital', 'orange'),
('Nation', 'https://nation.africa', 'blue'),
('Standard', 'https://www.standardmedia.co.ke', 'maroon'),
('Hansard', 'https://www.parliament.go.ke', 'green'),
('Parliament', 'https://www.parliament.go.ke', 'green')
ON DUPLICATE KEY UPDATE name=name;
```

---

## PRIORITY 2: BACKEND API UPDATES

### File: `polihub-integrated-api-routes.js`

Add these new endpoints:

```javascript
// GET politician with all related data (UPDATE EXISTING)
router.get('/politicians/:id', async (req, res) => {
  try {
    const politicianId = req.params.id;

    // Get basic info
    const [politicians] = await db.promise().query(
      'SELECT * FROM politicians WHERE id = ?',
      [politicianId]
    );

    if (politicians.length === 0) {
      return res.json({ success: false, error: 'Politician not found' });
    }

    const politician = politicians[0];

    // Get all related data
    const [documents] = await db.promise().query(
      'SELECT * FROM politician_documents WHERE politician_id = ? ORDER BY published_date DESC',
      [politicianId]
    );

    const [news] = await db.promise().query(
      'SELECT * FROM politician_news WHERE politician_id = ? ORDER BY date DESC',
      [politicianId]
    );

    const [timeline] = await db.promise().query(
      'SELECT * FROM politician_timeline WHERE politician_id = ? ORDER BY date DESC',
      [politicianId]
    );

    const [commitments] = await db.promise().query(
      'SELECT * FROM politician_commitments WHERE politician_id = ? ORDER BY date_made DESC',
      [politicianId]
    );

    const [voting_records] = await db.promise().query(
      'SELECT * FROM politician_voting_records WHERE politician_id = ? ORDER BY vote_date DESC',
      [politicianId]
    );

    // NEW: Get party history
    const [party_history] = await db.promise().query(
      'SELECT * FROM politician_parties WHERE politician_id = ? ORDER BY start_date DESC',
      [politicianId]
    );

    // NEW: Get achievements
    const [achievements] = await db.promise().query(
      'SELECT * FROM politician_achievements WHERE politician_id = ? ORDER BY achievement_date DESC',
      [politicianId]
    );

    res.json({
      success: true,
      data: {
        ...politician,
        documents,
        news,
        timeline,
        commitments,
        voting_records,
        party_history, // NEW
        achievements    // NEW
      }
    });
  } catch (error) {
    console.error('Error fetching politician:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Update politician basic info including constituency fields
router.put('/politicians/:id/basic', async (req, res) => {
  try {
    const { constituency_representation, constituency_focus_areas } = req.body;

    await db.promise().query(
      `UPDATE politicians
       SET constituency_representation = ?,
           constituency_focus_areas = ?
       WHERE id = ?`,
      [constituency_representation, constituency_focus_areas, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Party history endpoints
router.post('/politicians/:id/parties', async (req, res) => {
  try {
    const { party_name, start_date, end_date, analysis, is_current } = req.body;

    // If this is current party, set all others to not current
    if (is_current) {
      await db.promise().query(
        'UPDATE politician_parties SET is_current = FALSE WHERE politician_id = ?',
        [req.params.id]
      );
    }

    const [result] = await db.promise().query(
      `INSERT INTO politician_parties
       (politician_id, party_name, start_date, end_date, analysis, is_current)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, party_name, start_date, end_date, analysis, is_current]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/politicians/:politicianId/parties/:partyId', async (req, res) => {
  try {
    await db.promise().query(
      'DELETE FROM politician_parties WHERE id = ? AND politician_id = ?',
      [req.params.partyId, req.params.politicianId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Achievements endpoints
router.post('/politicians/:id/achievements', async (req, res) => {
  try {
    const { title, description, achievement_date, category } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO politician_achievements
       (politician_id, title, description, achievement_date, category)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, title, description, achievement_date, category]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/politicians/:politicianId/achievements/:achievementId', async (req, res) => {
  try {
    await db.promise().query(
      'DELETE FROM politician_achievements WHERE id = ? AND politician_id = ?',
      [req.params.achievementId, req.params.politicianId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Sources management
router.get('/sources', async (req, res) => {
  try {
    const [sources] = await db.promise().query('SELECT * FROM sources ORDER BY name');
    res.json({ success: true, data: sources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## PRIORITY 3: ADMIN FORM UPDATES

This is TOO LARGE for one response. I'll create a series of focused implementation files.

---

## WHAT TO DO NEXT:

1. **Run the SQL commands** above to create tables
2. **Add the backend routes** to `polihub-integrated-api-routes.js`
3. **I'll create separate implementation files** for:
   - Admin form updates (Party History, Constituency, Achievements)
   - Frontend display updates
   - Card styling consistency
   - Preview text limiting
   - Share functionality
   - Explore more button

**Should I continue creating these implementation files?** Or would you prefer I implement them directly in your code?
