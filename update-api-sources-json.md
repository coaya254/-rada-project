# API Updates for sources_json - Manual Guide

The following INSERT statements need to be updated in `polihub-integrated-api-routes.js`:

## ✅ COMPLETED:
1. **Documents** (line 415-447) - Added sources_json column and value

## 🔧 TODO - ADD sources_json TO THESE INSERTS:

### 2. News (around line 474)
**Find**: `INSERT INTO politician_news (politician_id, title, content, icon, image_url, source, source_url, credibility, sources, date, url, status, created_at)`

**Change to**: `INSERT INTO politician_news (politician_id, title, content, icon, image_url, source, source_url, credibility, sources, date, url, status, sources_json, created_at)`

**Add to VALUES**: `item.sources ? JSON.stringify(item.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions (around lines 485-498)

---

### 3. Timeline (around line 512)
**Find**: `INSERT INTO politician_timeline (politician_id, title, description, date, event_type, icon, image_url, created_at)`

**Change to**: `INSERT INTO politician_timeline (politician_id, title, description, date, event_type, icon, image_url, sources_json, created_at)`

**Add to VALUES**: `event.sources ? JSON.stringify(event.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions

---

### 4. Commitments/Promises (around line 545)
**Find**: `INSERT INTO politician_commitments (politician_id, title, description, status, category, icon, date, source_url, image_url, created_at)`

**Change to**: `INSERT INTO politician_commitments (politician_id, title, description, status, category, icon, date, source_url, image_url, sources_json, created_at)`

**Add to VALUES**: `commitment.sources ? JSON.stringify(commitment.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions

---

### 5. Voting Records (around line 580)
**Find**: `INSERT INTO voting_records (politician_id, bill_title, bill_number, bill_description, vote_date, category, vote_value, reasoning, session_name, icon, image_url, source_links, created_at)`

**Change to**: `INSERT INTO voting_records (politician_id, bill_title, bill_number, bill_description, vote_date, category, vote_value, reasoning, session_name, icon, image_url, source_links, sources_json, created_at)`

**Add to VALUES**: `vote.sources ? JSON.stringify(vote.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions

---

### 6. Party History (around line 621)
**Find**: `INSERT INTO politician_parties (politician_id, party_name, start_date, end_date, analysis, is_current, created_at)`

**Change to**: `INSERT INTO politician_parties (politician_id, party_name, start_date, end_date, analysis, is_current, sources_json, created_at)`

**Add to VALUES**: `party.sources ? JSON.stringify(party.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions

---

### 7. Achievements (around line 656)
**Find**: `INSERT INTO politician_achievements (politician_id, title, description, category, achievement_date, created_at)`

**Change to**: `INSERT INTO politician_achievements (politician_id, title, description, category, achievement_date, sources_json, created_at)`

**Add to VALUES**: `achievement.sources ? JSON.stringify(achievement.sources) : null`

**Remove**: Lines with `source_ids` junction table insertions

---

## Pattern to Remove:

All sections have this pattern that needs to be REMOVED:

```javascript
// Insert [section] sources
if (item.source_ids && item.source_ids.length > 0) {
  const itemId = result.insertId;
  const sourcePromises = item.source_ids.map(sourceId => {
    return new Promise((sourceResolve, sourceReject) => {
      db.query(
        'INSERT INTO [junction_table] (item_id, source_id) VALUES (?, ?)',
        [itemId, sourceId],
        (err) => err ? sourceReject(err) : sourceResolve()
      );
    });
  });
  Promise.all(sourcePromises).then(() => resolve()).catch(reject);
} else {
  resolve();
}
```

**Replace with**: Just `resolve();`

---

## Update Pattern (Same for all sections):

1. Add `sources_json` to column list
2. Add `item.sources ? JSON.stringify(item.sources) : null` to VALUES
3. Remove `source_ids` junction table code
4. Keep just `resolve();` in the callback
