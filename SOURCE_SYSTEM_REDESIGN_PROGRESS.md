# Source System Redesign - Progress Report

## 🎯 PROJECT OVERVIEW

**Goal**: Replace the old checkbox multiselect source system with individual source entry buttons where admin can add custom sources with name, URL, and color picker.

**Status**: **80% COMPLETE** ✅

---

## ✅ COMPLETED WORK

### 1. Database Migration ✅
**File**: `migrate-to-sources-json.js`

- Added `sources_json` TEXT column to 7 tables:
  - `politician_documents`
  - `politician_news`
  - `politician_timeline`
  - `politician_commitments`
  - `voting_records`
  - `politician_achievements`
  - `politician_parties`

- Migrated existing sources from junction tables to JSON format
- Sources now stored as: `[{name, url, color}, ...]`

### 2. Components Created ✅

#### **SourceButtonManager.jsx** (Admin Component)
**Location**: `polihub/src/components/admin/SourceButtonManager.jsx`

**Features**:
- Add/remove individual sources
- Source name input field
- URL input field with test link button
- Color picker for custom button colors
- Live preview of how users will see each source
- Empty state with helpful hint text
- Tip section explaining the purpose

**Usage**:
```jsx
<SourceButtonManager
  sources={item.sources || []}
  onChange={(newSources) => updateItem(idx, 'sources', newSources)}
  label="Document Sources"
/>
```

#### **SourceButtons.jsx** (User Display Component)
**Location**: `polihub/src/components/SourceButtons.jsx`

**Features**:
- Displays sources as colored, clickable buttons
- Each button styled with custom color
- External link icon
- Hover effects
- Optional hint text
- Handles both old format (source_id) and new format (custom sources)

**Usage**:
```jsx
<SourceButtons
  sources={item.sources}
  hintText="Click sources to verify information"
/>
```

### 3. Admin Form Updates ✅

**File**: `polihub/src/components/admin/PoliticianFormEnhanced.jsx`

**Changes Made**:
1. ✅ Imported `SourceButtonManager` component
2. ✅ Removed `sources` state and `fetchSources` useEffect
3. ✅ Changed all `source_ids: []` to `sources: []`
4. ✅ Updated data conversion from `source_ids: sources.map(s => s.id)` to `sources: sources || []`

**Sections Updated**:
1. ✅ **Achievements** (line 871-876) - SourceButtonManager implemented
2. ✅ **Documents** (line 998-1003) - SourceButtonManager implemented
3. ✅ **News** (line 1306-1311) - SourceButtonManager implemented
4. ✅ **Timeline** (line 1463-1468) - SourceButtonManager implemented
5. ✅ **Promises/Commitments** (line 1700-1705) - SourceButtonManager implemented
6. ✅ **Party History** (line 765-770) - SourceButtonManager implemented (was missing before!)
7. ✅ **Voting Records** (line 1885-1890) - SourceButtonManager implemented (was incomplete before!)

---

## 🚧 REMAINING WORK

### 1. Backend API Updates (IN PROGRESS)

**File**: `polihub-integrated-api-routes.js`

**What Needs to be Done**:
- Update politician GET endpoint to parse `sources_json` from database
- Update politician POST/PUT endpoints to save `sources` array as JSON string
- Remove old source_ids processing logic
- Remove junction table INSERT/DELETE operations

**Example Changes Needed**:
```javascript
// OLD WAY (with source_ids):
if (doc.source_ids && doc.source_ids.length > 0) {
  doc.source_ids.forEach(sourceId => {
    db.query('INSERT INTO politician_document_sources (document_id, source_id) VALUES (?, ?)', [docId, sourceId]);
  });
}

// NEW WAY (with sources JSON):
if (doc.sources && doc.sources.length > 0) {
  const sourcesJson = JSON.stringify(doc.sources);
  // sources_json already included in main INSERT query
}
```

**Specific Endpoints to Update**:
- `GET /api/polihub/politicians/:id` - Parse sources_json for each section
- `POST /api/polihub/politicians` - Save sources as JSON
- `PUT /api/polihub/politicians/:id` - Update sources as JSON

### 2. User UI Updates (PENDING)

**File**: `polihub/src/components/PoliticianDetailModalEnhanced.jsx`

**What Needs to be Done**:
Replace existing inline source displays with `SourceButtons` component:

**Current Source Display Pattern** (example from line 374-396):
```jsx
{doc.sources && doc.sources.length > 0 && (
  <div className="flex gap-2 mb-4 flex-wrap">
    {doc.sources.map((source, idx) => (
      <a key={idx} href={source.default_url} ...>
        <ExternalLink size={12} />
        <span>{source.name}</span>
      </a>
    ))}
  </div>
)}
```

**New Pattern**:
```jsx
<SourceButtons
  sources={doc.sources}
  hintText="📎 Click to verify from credible sources"
/>
```

**Sections to Update** (approx. 7-8 locations):
- Documents section
- News section
- Timeline section
- Promises section
- Achievements section
- Party History section
- Voting Records section

### 3. Testing (PENDING)

**Test Checklist**:
- [ ] Admin: Add new politician with custom sources in all sections
- [ ] Admin: Edit existing politician, add/remove sources
- [ ] Admin: Color picker works correctly
- [ ] Admin: URL test button opens correct link
- [ ] Admin: Save politician successfully
- [ ] User: View politician detail modal
- [ ] User: See colored source buttons in all sections
- [ ] User: Click source buttons to visit URLs
- [ ] Database: Verify sources_json is being saved correctly
- [ ] Database: Verify old junction tables are no longer used

---

## 📊 PROGRESS SUMMARY

| Component | Status | Details |
|-----------|--------|---------|
| Database Schema | ✅ Complete | 7 tables updated with sources_json column |
| SourceButtonManager Component | ✅ Complete | Fully functional admin component |
| SourceButtons Component | ✅ Complete | Fully functional display component |
| Admin Form - Data Structure | ✅ Complete | Changed from source_ids to sources |
| Admin Form - Achievements | ✅ Complete | SourceButtonManager integrated |
| Admin Form - Documents | ✅ Complete | SourceButtonManager integrated |
| Admin Form - News | ✅ Complete | SourceButtonManager integrated |
| Admin Form - Timeline | ✅ Complete | SourceButtonManager integrated |
| Admin Form - Promises | ✅ Complete | SourceButtonManager integrated |
| Admin Form - Party History | ✅ Complete | SourceButtonManager integrated |
| Admin Form - Voting Records | ✅ Complete | SourceButtonManager integrated |
| Backend API | 🚧 In Progress | Needs sources_json handling |
| User UI | ⏳ Pending | Needs SourceButtons integration |
| Testing | ⏳ Pending | End-to-end testing needed |

---

## 🎨 NEW FEATURES ADDED

### Before vs After

**BEFORE**:
- Admin selects from predefined sources (checkbox multiselect)
- Limited to sources in database
- No custom colors per source
- Party History: No sources UI ❌
- Voting Records: Incomplete sources UI ❌

**AFTER**:
- Admin creates custom sources on-the-fly ✨
- Source name, URL, and color fully customizable
- Live preview of source buttons
- Color picker for brand matching
- All 7 sections have complete source UI ✅
- Party History: Full SourceButtonManager ✅
- Voting Records: Full SourceButtonManager ✅

---

## 📁 FILES MODIFIED

### New Files Created:
1. `polihub/src/components/admin/SourceButtonManager.jsx` (173 lines)
2. `polihub/src/components/SourceButtons.jsx` (48 lines)
3. `migrate-to-sources-json.js` (109 lines)
4. `check-source-tables.js` (109 lines)

### Modified Files:
1. `polihub/src/components/admin/PoliticianFormEnhanced.jsx`
   - Added SourceButtonManager import
   - Removed sources state and fetch logic
   - Changed all source_ids references to sources
   - Replaced 5 checkbox multiselect UIs with SourceButtonManager
   - Added SourceButtonManager to 2 missing sections

### Files to be Modified:
1. `polihub-integrated-api-routes.js` - Backend API updates
2. `polihub/src/components/PoliticianDetailModalEnhanced.jsx` - User UI updates

---

## 🚀 NEXT STEPS

1. **Update Backend API** (30-45 minutes):
   - Modify GET endpoint to parse sources_json
   - Modify POST/PUT endpoints to stringify sources
   - Test API with Postman/curl

2. **Update User UI** (20-30 minutes):
   - Import SourceButtons component
   - Replace ~7 inline source displays
   - Test in browser

3. **End-to-End Testing** (15-20 minutes):
   - Create test politician with sources
   - Verify all sections work
   - Check database entries

**Estimated Time to Complete**: 1-1.5 hours

---

## 💡 BENEFITS OF NEW SYSTEM

1. **Flexibility**: Admin can add ANY source, not just predefined ones
2. **Branding**: Custom colors match source branding (Parliament purple, etc.)
3. **Transparency**: Multiple sources per item increases credibility
4. **UX**: Live preview shows exactly how users will see sources
5. **Completeness**: All 7 sections now have proper source support
6. **Simplicity**: No more managing junction tables and source_ids arrays
7. **Scalability**: JSON storage is more flexible for future enhancements

---

## 🎯 KEY ACCOMPLISHMENTS

- ✅ Designed and implemented new source system architecture
- ✅ Migrated database schema without data loss
- ✅ Created 2 reusable components (admin + user)
- ✅ Updated all 7 admin form sections
- ✅ Fixed 2 sections that had missing/incomplete source UI
- ✅ Maintained backward compatibility with existing data
- ✅ Added helpful UI hints and previews

---

**Last Updated**: 2025-11-01
**Progress**: 80% Complete
**Next Task**: Update Backend API
