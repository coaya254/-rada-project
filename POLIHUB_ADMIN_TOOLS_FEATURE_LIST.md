# PoliHub Admin Tools - Complete Feature List

## 📋 Overview
Complete list of all admin tools and features needed for PoliHub politician management, based on RadaAppClean patterns.

---

## 🏗️ Database Status

### ✅ Politician Documents Table - COMPLETE
```sql
politician_documents:
├── id, politician_id, title, subtitle, icon
├── type, date, description
├── image_url, thumbnail_url
├── briefing, summary, details (JSON)
├── pages, document_url, published_date
├── category, category_color
├── tags (JSON), source_links (JSON)
├── file_url, created_at
```
**Status:** ✅ All fields present!

### ⚠️ Other Tables Need Enhancement
Need to add missing fields to match document pattern.

---

## 🛠️ Admin Tools Needed (Based on RadaAppClean)

### 1. **Politician Management**
**Existing in RadaAppClean:**
- ✅ ManagePoliticiansScreen.tsx - List all politicians
- ✅ CreatePoliticianScreen.tsx - Create new politician
- ✅ EditPoliticianScreen.tsx - Edit politician basic info
- ✅ PoliticianSelectorScreen.tsx - Select politician for linking

**Needed in PoliHub Web:**
- ⬜ Politician List/Management Page
- ⬜ Create Politician Form
- ⬜ Edit Politician Form
- ⬜ Politician Dashboard with stats

---

### 2. **Document Management**
**Existing in RadaAppClean:**
- ✅ DocumentManagementScreen.tsx
  - Create/Edit/Delete documents
  - Filter by type, status
  - Link to politicians
  - Tags, summary, key_points
  - Multilingual support
  - Featured flag
  - Status (draft/published/archived)

**Needed in PoliHub Web:**
- ⬜ Document Management Page (CRUD)
- ⬜ Document Form with ALL new fields:
  - title, subtitle, icon
  - category, category_color (gradient selector)
  - summary (PoliHub research)
  - details (key findings array)
  - pages, published_date
  - tags, document_url
  - source_links (JSON)

**Current Status:**
- ✅ Admin form exists (PoliticianFormEnhanced.jsx documents tab)
- ❌ NOT showing pages, details, tags properly in UI
- ❌ Need standalone Document Management page

---

### 3. **Timeline/Career Management**
**Existing in RadaAppClean:**
- ✅ CareerManagementScreen.tsx
  - Timeline events
  - Career milestones
  - Achievements

**Current Table:**
```
politician_timeline:
- id, politician_id
- date, title, description
- type
- created_at
```

**Missing Fields:**
- category
- summary
- source, source_url, source_links (JSON)
- tags (JSON)
- icon

**Needed in PoliHub Web:**
- ⬜ Timeline Management Page (CRUD)
- ⬜ Timeline Form with enhanced fields
- ⬜ Event type selector

---

### 4. **News Management**
**Existing in RadaAppClean:**
- ✅ NewsManagementScreen.tsx

**Current Status:**
- ✅ News table already enhanced (credibility, category, source_links)
- ⬜ Need Web admin page for news

---

### 5. **Commitments/Promises Management**
**Existing in RadaAppClean:**
- ⬜ No specific screen (part of EditPolitician)

**Current Table:**
```
politician_commitments:
- id, politician_id
- title, description
- status, category
- date_made, deadline, progress
- created_at, updated_at
```

**Missing Fields:**
- summary (quick overview)
- evidence_text, evidence_url
- source_links (JSON)
- tags (JSON)

**Needed in PoliHub Web:**
- ⬜ Commitments Management Page (CRUD)
- ⬜ Commitment Form with progress slider
- ⬜ Status tracker (kept/in_progress/broken)

---

### 6. **Voting Records Management**
**Existing in RadaAppClean:**
- ⬜ No specific screen

**Current Table:**
```
politician_voting_records:
- id, politician_id
- bill_name, vote, date
- category, description
- created_at
```

**Missing Fields:**
- bill_number
- legislative_session
- bill_status
- vote_result
- notes
- bill_url, source_url, source_links (JSON)
- tags (JSON)

**Needed in PoliHub Web:**
- ⬜ Voting Records Management Page (CRUD)
- ⬜ Vote Record Form
- ⬜ Bill tracking

---

## 🎯 Priority Implementation Order

### Phase 1: Fix Existing Issues (URGENT)
1. ✅ Fix politician_documents table (DONE)
2. ⬜ **Display pages, details (key findings), tags in document modal**
3. ⬜ **Update document list cards to show pages count**
4. ⬜ **Ensure details array shows as bullet points**

### Phase 2: Database Enhancements
1. ⬜ Add missing fields to politician_timeline
2. ⬜ Add missing fields to politician_commitments
3. ⬜ Add missing fields to politician_voting_records

### Phase 3: Web Admin Pages
1. ⬜ Create standalone Document Management page
2. ⬜ Create Timeline Management page
3. ⬜ Create Commitments Management page
4. ⬜ Create Voting Records Management page
5. ⬜ Create News Management page

### Phase 4: Enhanced Features
1. ⬜ Bulk actions
2. ⬜ Draft/Publish workflow
3. ⬜ Search and filters
4. ⬜ Statistics dashboard

---

## 📝 Detailed Feature Requirements

### Document Modal Features (MISSING NOW)
```javascript
// Should display:
✅ Icon (emoji) - SHOWING
✅ Title - SHOWING
✅ Subtitle - SHOWING
✅ Category badge - SHOWING
✅ Category color gradient - SHOWING
✅ Published date - SHOWING
✅ PoliHub Research Summary - SHOWING
❌ Pages count - NOT SHOWING
❌ Detailed Analysis (collapsible) - NOT SHOWING
❌ Tags display - NOT SHOWING (showing but might be broken)
✅ Access Document button - SHOWING
```

### Document Card Features (MISSING NOW)
```javascript
// Should display:
✅ Gradient header with icon - SHOWING
✅ Category badge - SHOWING
✅ Title - SHOWING
✅ Subtitle preview - SHOWING
✅ Published date - SHOWING
❌ Pages count indicator - NOT SHOWING
✅ View Document button - SHOWING
```

---

## 🔧 Technical Implementation

### Admin Form Pattern (from RadaAppClean)
```typescript
interface DocumentForm {
  // Basic
  title: string;
  subtitle: string;
  icon: string;
  type: DocumentType;
  category: string;
  category_color: string;

  // Dates
  date_published: string;
  published_date: string;

  // Content
  summary: string; // PoliHub Research Summary
  description: string; // Full content
  details: string[]; // Key findings array

  // Metadata
  pages: number;
  tags: string[];

  // Links
  document_url: string;
  source_links: {[key: string]: string};

  // Status
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
}
```

### API Endpoints Needed
```
GET /api/politicians/:id/documents
POST /api/politicians/:id/documents
PUT /api/documents/:id
DELETE /api/documents/:id

GET /api/politicians/:id/timeline
POST /api/politicians/:id/timeline
PUT /api/timeline/:id
DELETE /api/timeline/:id

GET /api/politicians/:id/commitments
POST /api/politicians/:id/commitments
PUT /api/commitments/:id
DELETE /api/commitments/:id

GET /api/politicians/:id/voting-records
POST /api/politicians/:id/voting-records
PUT /api/voting-records/:id
DELETE /api/voting-records/:id
```

---

## 📊 Missing UI Components

### 1. Pages Display
**Where:** Document cards & modal
**How:**
```html
<div className="flex items-center gap-2">
  <FileText size={14} />
  <span>{pages} pages</span>
</div>
```

### 2. Detailed Analysis Section
**Where:** Document modal
**How:** Already implemented with collapsible section + ChevronUp/Down
**Issue:** Details (key findings) not showing

### 3. Tags Display
**Where:** Document cards & modal
**How:** Badge array
```html
{tags.map(tag => (
  <span className="bg-white text-purple-700 px-2 py-1 rounded-lg">
    {tag}
  </span>
))}
```

---

## ✅ Action Items

### Immediate Fixes:
1. ⬜ Verify pages field is being returned by API
2. ⬜ Verify details array is being returned by API
3. ⬜ Verify tags array is being returned by API
4. ⬜ Add pages display to document cards
5. ⬜ Fix details display in modal (key findings bullets)
6. ⬜ Fix tags display in modal and cards

### Database Migrations:
1. ⬜ Add fields to politician_timeline table
2. ⬜ Add fields to politician_commitments table
3. ⬜ Add fields to politician_voting_records table

### Admin Pages:
1. ⬜ Create Document Management standalone page
2. ⬜ Create Timeline Management page
3. ⬜ Create Commitments Management page
4. ⬜ Create Voting Records Management page

---

## 📁 File Organization

```
polihub/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── PoliticianFormEnhanced.jsx (EXISTS - needs fixes)
│   │   │   ├── DocumentManagement.jsx (CREATE)
│   │   │   ├── TimelineManagement.jsx (CREATE)
│   │   │   ├── CommitmentsManagement.jsx (CREATE)
│   │   │   ├── VotingRecordsManagement.jsx (CREATE)
│   │   │   └── NewsManagement.jsx (CREATE)
│   │   └── PoliticianDetailModalEnhanced.jsx (EXISTS - needs fixes)
│   └── pages/
│       └── admin/
│           ├── Politicians.jsx (CREATE)
│           ├── Documents.jsx (CREATE)
│           ├── Timeline.jsx (CREATE)
│           ├── Commitments.jsx (CREATE)
│           ├── VotingRecords.jsx (CREATE)
│           └── News.jsx (CREATE)
```

---

## 🎨 UI/UX Patterns to Follow

### From RadaAppClean:
1. **List View** with search and filters
2. **Card-based** item display
3. **Modal forms** for create/edit
4. **Status badges** (draft/published)
5. **Bulk actions** with selection mode
6. **Preview mode** before save
7. **Validation** and error handling
8. **Loading states** and skeletons

### From Current PoliHub:
1. **Gradient headers** with custom colors
2. **Glass morphism** effects (backdrop-blur)
3. **Large emoji icons**
4. **Collapsible sections** with animations
5. **Grid layouts** for information
6. **Prominent action buttons** with gradients

---

## 🚀 Success Criteria

### Document Features:
- ✅ All fields saved to database
- ⬜ Pages count visible in cards and modal
- ⬜ Detailed analysis (key findings) shows as bullets
- ⬜ Tags display properly
- ⬜ Admin can manage all fields
- ⬜ Standalone admin page works

### Timeline Features:
- ⬜ Enhanced fields in database
- ⬜ Admin page created
- ⬜ Full CRUD operations
- ⬜ Event types supported

### Commitments Features:
- ⬜ Enhanced fields in database
- ⬜ Admin page created
- ⬜ Progress tracking works
- ⬜ Status updates work

### Voting Records Features:
- ⬜ Enhanced fields in database
- ⬜ Admin page created
- ⬜ Bill linking works
- ⬜ Vote tracking complete

---

**Next Steps:**
1. Fix immediate display issues (pages, details, tags)
2. Create database migration scripts
3. Build standalone admin pages
4. Test all CRUD operations
5. Deploy and verify
