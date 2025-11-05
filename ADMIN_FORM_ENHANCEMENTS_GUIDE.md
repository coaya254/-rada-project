# Admin Form Enhancements - Implementation Guide

## 🎯 Summary of All Enhancements

This document outlines all the enhancements being added to the politician admin form for Timeline, Commitments (Promises), Voting Records, and News tabs.

---

## ✨ ENHANCEMENTS OVERVIEW

### 1. **NEWS Tab** ✅
Added fields:
- ✅ Icon (emoji picker dropdown)
- ✅ Image URL
- ✅ Source Name (renamed from just "Source")
- ✅ Source URL (separate from article URL)

### 2. **TIMELINE Tab**
Adding fields:
- Icon (emoji picker dropdown)
- Image URL
- Category (with custom input option)
- Source Name
- Source URL

### 3. **COMMITMENTS/PROMISES Tab**
Adding fields:
- Icon (emoji picker dropdown)
- Image URL
- Custom Category (text input for admin-defined categories)
- Custom Type (text input for admin-defined types)
- Progress Percentage Mapping (define what % equals each status)
- Source Name
- Source URL

### 4. **VOTING RECORDS Tab**
Adding fields:
- Icon (emoji picker dropdown)
- Image URL
- Custom Category (text input for admin-defined categories)
- Source Name
- Source URL

---

## 📝 DETAILED FIELD SPECIFICATIONS

### Timeline Fields:

```javascript
{
  id: Date.now(),
  date: '',
  title: '',
  description: '',
  type: 'achievement',
  icon: '📅',           // NEW - emoji picker
  image_url: '',        // NEW - image for the event
  category: '',         // NEW - custom category
  source: '',           // NEW - source name
  source_url: ''        // NEW - source URL
}
```

**Icon Options:**
- 📅 Event
- 🏆 Achievement
- 📝 Appointment
- 🗳️ Election
- 📜 Legislation
- ⚠️ Scandal
- 🎓 Education
- 💼 Career
- 📰 Media
- 🏛️ Government

**Category**: Free text input (admin can create own categories like "Education Reform", "Healthcare Policy", etc.)

---

### Commitments Fields:

```javascript
{
  id: Date.now(),
  title: '',
  description: '',
  status: 'in_progress',
  category: '',          // Predefined OR custom
  custom_category: '',   // NEW - admin-defined category
  type: '',              // Predefined OR custom
  custom_type: '',       // NEW - admin-defined type
  date_made: '',
  deadline: '',
  progress: 0,
  progress_percentage: 0, // NEW - % completion
  icon: '🤝',            // NEW - emoji picker
  image_url: '',         // NEW - image
  source: '',            // NEW - source name
  source_url: ''         // NEW - source URL
}
```

**Status Options with Default % Mapping:**
- `pending` = 0%
- `in_progress` = 50%
- `completed` = 100%
- `broken` = 0%

**Admin can customize:** "What percentage is considered 'in_progress'?" → Admin enters 30%, so 30-99% = in_progress

**Category Options** (with "Custom" option):
- Policy
- Legislation
- Infrastructure
- Healthcare
- Education
- Economy
- Security
- Environment
- Social
- **Custom** (shows text input)

**Type Options** (with "Custom" option):
- Campaign Promise
- Legislative Commitment
- Policy Goal
- Project Delivery
- Reform Initiative
- **Custom** (shows text input)

**Icon Options:**
- 🤝 Promise
- ✅ Kept
- ⏳ Pending
- 🚧 In Progress
- ❌ Broken
- 🎯 Goal
- 📋 Commitment

---

### Voting Records Fields:

```javascript
{
  id: Date.now(),
  bill_name: '',
  vote: 'yes',
  vote_date: '',
  category: '',          // Predefined OR custom
  custom_category: '',   // NEW - admin-defined category
  description: '',
  icon: '🗳️',           // NEW - emoji picker
  image_url: '',         // NEW - image
  source: '',            // NEW - source name
  source_url: ''         // NEW - source URL
}
```

**Category Options** (with "Custom" option):
- Legislation
- Budget
- Appointment
- Resolution
- Amendment
- Constitutional
- Emergency
- Procedural
- **Custom** (shows text input)

**Icon Options:**
- 🗳️ Vote
- ✅ Yes
- ❌ No
- 🤷 Abstain
- ⚖️ Law
- 💰 Budget
- 🏛️ Constitutional
- 📋 Resolution

---

## 🎨 UI/UX PATTERNS

### Custom Category/Type Pattern:

```jsx
<div>
  <label>Category</label>
  <select onChange={(e) => {
    if (e.target.value === 'custom') {
      // Show custom input
    } else {
      update('category', e.target.value);
    }
  }}>
    <option value="policy">Policy</option>
    <option value="legislation">Legislation</option>
    ...
    <option value="custom">✏️ Custom Category</option>
  </select>
</div>

{showCustomCategory && (
  <div>
    <label>Custom Category Name</label>
    <input
      type="text"
      placeholder="Enter your own category..."
      onChange={(e) => update('custom_category', e.target.value)}
    />
  </div>
)}
```

### Progress Percentage Mapping Pattern:

```jsx
<div className="bg-blue-50 p-4 rounded-lg">
  <h4>Progress Percentage Mapping</h4>
  <p className="text-sm text-gray-600">Define what percentage equals each status</p>

  <div className="grid grid-cols-4 gap-3 mt-3">
    <div>
      <label>Pending (%)</label>
      <input type="number" value={0} disabled />
    </div>
    <div>
      <label>In Progress (%)</label>
      <input type="number" value={50}
        onChange={(e) => setProgressMapping({...mapping, in_progress: e.target.value})}
        placeholder="e.g. 30"
      />
    </div>
    <div>
      <label>Completed (%)</label>
      <input type="number" value={100} disabled />
    </div>
    <div>
      <label>Broken (%)</label>
      <input type="number" value={0} disabled />
    </div>
  </div>
</div>
```

### Source Fields Pattern (consistent across all tabs):

```jsx
<div className="border-t pt-3 mt-3">
  <h5 className="text-xs font-bold mb-2 text-gray-700">📎 Source Information</h5>
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label>Source Name</label>
      <input
        type="text"
        placeholder="The Nation, Parliament, etc."
        onChange={(e) => update('source', e.target.value)}
      />
    </div>
    <div>
      <label>Source URL</label>
      <input
        type="text"
        placeholder="https://..."
        onChange={(e) => update('source_url', e.target.value)}
      />
    </div>
  </div>
</div>
```

---

## 🗄️ DATABASE SCHEMA UPDATES NEEDED

### Add to `politician_timeline` table:
```sql
ALTER TABLE politician_timeline ADD COLUMN icon VARCHAR(50) NULL;
ALTER TABLE politician_timeline ADD COLUMN image_url VARCHAR(1000) NULL;
-- category, source, source_url already added
```

### Add to `politician_commitments` table:
```sql
ALTER TABLE politician_commitments ADD COLUMN custom_category VARCHAR(255) NULL;
ALTER TABLE politician_commitments ADD COLUMN type VARCHAR(100) NULL;
ALTER TABLE politician_commitments ADD COLUMN custom_type VARCHAR(255) NULL;
ALTER TABLE politician_commitments ADD COLUMN icon VARCHAR(50) NULL;
ALTER TABLE politician_commitments ADD COLUMN image_url VARCHAR(1000) NULL;
ALTER TABLE politician_commitments ADD COLUMN source VARCHAR(255) NULL;
ALTER TABLE politician_commitments ADD COLUMN source_url VARCHAR(1000) NULL;
-- progress_percentage, summary, evidence_text, evidence_url, source_links, tags already added
```

### Add to `politician_voting_records` table:
```sql
ALTER TABLE politician_voting_records ADD COLUMN custom_category VARCHAR(255) NULL;
ALTER TABLE politician_voting_records ADD COLUMN icon VARCHAR(50) NULL;
ALTER TABLE politician_voting_records ADD COLUMN image_url VARCHAR(1000) NULL;
ALTER TABLE politician_voting_records ADD COLUMN source VARCHAR(255) NULL;
ALTER TABLE politician_voting_records ADD COLUMN source_url VARCHAR(1000) NULL;
-- bill_number, legislative_session, bill_status, vote_result, notes, bill_url, source_links, tags already added
```

### Add to `politician_news` table:
```sql
ALTER TABLE politician_news ADD COLUMN icon VARCHAR(50) NULL;
ALTER TABLE politician_news ADD COLUMN image_url VARCHAR(1000) NULL;
ALTER TABLE politician_news ADD COLUMN source_url VARCHAR(1000) NULL;
-- source already exists
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Form Updates ⏳
- [x] News: Add icon, image, source_url
- [ ] Timeline: Add icon, image, category, source, source_url
- [ ] Commitments: Add icon, image, custom category/type, source, source_url
- [ ] Voting: Add icon, image, custom category, source, source_url

### Phase 2: Database Schema ⏳
- [ ] Create migration script for all new fields
- [ ] Run migration
- [ ] Verify all tables updated

### Phase 3: API Updates ⏳
- [ ] Update politician_timeline INSERT/UPDATE to include new fields
- [ ] Update politician_commitments INSERT/UPDATE to include new fields
- [ ] Update politician_voting_records INSERT/UPDATE to include new fields
- [ ] Update politician_news INSERT/UPDATE to include new fields

### Phase 4: Testing ⏳
- [ ] Test news creation with icon/image
- [ ] Test timeline with all new fields
- [ ] Test commitments with custom categories/types
- [ ] Test voting with custom categories
- [ ] Verify all data saves correctly

---

## 🎯 USER BENEFITS

1. **More Flexibility**: Admins can define their own categories and types
2. **Better Attribution**: Source name + URL for all content
3. **Visual Appeal**: Icons and images make content more engaging
4. **Progress Clarity**: Custom percentage mapping for commitments
5. **Consistency**: Same source pattern across all tabs

---

**Status**: Form structure updates in progress
**Next**: Complete timeline, commitments, and voting form sections
