# PoliHub Web UI Design Guide
## Based on RadaAppClean Mobile Patterns

---

## 📱 Overview

This guide translates the mobile app UI patterns from RadaAppClean to the PoliHub web application. Each feature has been analyzed from the mobile implementation to ensure consistency across platforms.

---

## 🎨 Design System (From Mobile App)

### Color Palette
```javascript
const colors = {
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    500: '#3B82F6',
    600: '#2563EB',
  },
  success: {
    100: '#D1FAE5',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  neutral: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },
  purple: {
    100: '#F3E8FF',
    500: '#A855F7',
    600: '#9333EA',
  }
};
```

### Typography
```css
Font Sizes:
- Heading 1: 32px (bold/black)
- Heading 2: 24px (bold)
- Heading 3: 18px (bold)
- Body: 14-16px (regular)
- Small: 12px (regular)
- Tiny: 10px (bold for badges)
```

### Spacing
```css
4px, 8px, 12px, 16px, 20px, 24px, 32px
```

### Border Radius
```css
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
full: 9999px
```

---

## 🏛️ 1. DOCUMENTS FEATURE

### Mobile Implementation Pattern
**File:** `PoliticianDocumentsScreen.tsx`

**UI Structure:**
1. **Header Section**
   - Back button
   - Title: "{Politician Name}'s Documents"
   - Filter pills (All, Bill, Speech, Interview, Report)

2. **Document Cards** (Per Item):
   - Document type badge (colored pill - top left)
   - Title (bold, 16px)
   - Summary (2-3 lines, gray text)
   - Date & Source (small text with clock icon)
   - Tags (colored pills at bottom)
   - Download/View button (icon on right)
   - Source links indicator (if available)

3. **Document Detail Modal:**
   - Full title
   - Complete summary
   - Metadata (type, date, source)
   - Tags
   - Collapsible "Source Links" section
   - Collapsible "Verification Links" section
   - Download/View button

### Web Translation (PoliHub):

```jsx
// Component Structure
<div className="documents-section">
  {/* Filter Bar */}
  <div className="flex gap-2 mb-6">
    {['All', 'Bill', 'Speech', 'Interview', 'Report'].map(type => (
      <button className={`px-4 py-2 rounded-full font-bold text-sm ${
        filterType === type
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-white text-gray-600 hover:bg-purple-50'
      }`}>
        {type}
      </button>
    ))}
  </div>

  {/* Document Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {documents.map(doc => (
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer">
        {/* Type Badge */}
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
          doc.type === 'bill' ? 'bg-warning-100 text-warning-600' :
          doc.type === 'speech' ? 'bg-success-100 text-success-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          {doc.type.toUpperCase()}
        </span>

        {/* Title */}
        <h4 className="text-lg font-black text-gray-800 mb-2">{doc.title}</h4>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{doc.summary}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{new Date(doc.date).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            {doc.source_links && (
              <button className="p-2 bg-purple-50 rounded-lg hover:bg-purple-100">
                <Link size={16} className="text-purple-600" />
              </button>
            )}
            <button className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600">
              <Download size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {doc.tags?.map(tag => (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## 📰 2. NEWS FEATURE

### Mobile Implementation Pattern
**File:** `PoliticianNewsScreen.tsx` + `NewsCard.tsx`

**UI Structure:**
1. **Header**
   - Back button
   - Title: "News about {Politician Name}"
   - Filter button (source, credibility, date range)

2. **News Card** (NewsCard component):
   - Source badge (colored, left) + Credibility badge (colored, right)
   - Headline (bold, 16px, 2 lines max)
   - Summary (14px, gray, 3 lines max)
   - Date with clock icon
   - Chevron right icon

3. **Credibility System:**
   - Maximum: Green badge "VERIFIED"
   - High: Green badge "HIGH"
   - Medium: Yellow badge "MEDIUM"
   - Single: Red badge "SINGLE SOURCE"

4. **News Detail Modal:**
   - Full headline
   - Complete summary
   - Source info
   - Published date
   - Link to original article

### Web Translation:

```jsx
<div className="news-section">
  {/* Filter Bar */}
  <div className="flex gap-3 mb-6">
    <button className="px-4 py-2 bg-white rounded-xl shadow-sm">
      <Filter size={16} />
      <span>Filter by Source</span>
    </button>
    <button className="px-4 py-2 bg-white rounded-xl shadow-sm">
      <Shield size={16} />
      <span>Credibility</span>
    </button>
  </div>

  {/* News Cards */}
  <div className="space-y-4">
    {news.map(item => (
      <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            {/* Source Badge */}
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
              backgroundColor: getSourceColor(item.source) + '20',
              color: getSourceColor(item.source)
            }}>
              {item.source}
            </span>

            {/* Credibility Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              item.credibility === 'maximum' ? 'bg-green-500' :
              item.credibility === 'high' ? 'bg-green-500' :
              item.credibility === 'medium' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {item.credibility === 'maximum' ? 'VERIFIED' :
               item.credibility.toUpperCase()}
            </span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Headline */}
        <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {item.headline}
        </h4>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {item.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} />
          <span>{new Date(item.source_publication_date).toLocaleDateString()}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## 📅 3. TIMELINE FEATURE

### Mobile Implementation Pattern
**File:** `PoliticianTimelineScreen.tsx` + `TimelineItem.tsx`

**UI Structure:**
1. **Timeline Item Component:**
   - Icon (type-specific: vote, speech, bill, position, achievement, controversy)
   - Colored background for icon (type-specific)
   - Vertical line connecting items
   - Title (bold)
   - Date
   - Description (optional)
   - Source link indicator

2. **Type Colors:**
   - Vote: Blue
   - Speech: Green
   - Bill/Legislation: Yellow/Orange
   - Position: Blue
   - Achievement: Green (with trophy icon)
   - Controversy: Red (with warning icon)

3. **Timeline Filter:**
   - All
   - Position
   - Achievement
   - Controversy

### Web Translation:

```jsx
<div className="timeline-section">
  {/* Filter */}
  <div className="flex gap-2 mb-6">
    {['All', 'Position', 'Achievement', 'Controversy'].map(filter => (
      <button className={`px-4 py-2 rounded-full font-bold text-sm ${
        filterType === filter
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-white text-gray-600 hover:bg-purple-50'
      }`}>
        {filter}
      </button>
    ))}
  </div>

  {/* Timeline */}
  <div className="relative">
    {timeline.map((event, idx) => (
      <div className="flex gap-4 pb-8" key={event.id}>
        {/* Icon Column */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            event.type === 'position' ? 'bg-blue-100' :
            event.type === 'achievement' ? 'bg-green-100' :
            event.type === 'controversy' ? 'bg-red-100' :
            'bg-gray-100'
          }`}>
            {event.type === 'position' && <Briefcase className="text-blue-600" size={20} />}
            {event.type === 'achievement' && <Trophy className="text-green-600" size={20} />}
            {event.type === 'controversy' && <AlertTriangle className="text-red-600" size={20} />}
          </div>
          {idx !== timeline.length - 1 && (
            <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 pt-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-bold text-gray-800">{event.title}</h4>
            {event.source_links && (
              <button className="p-1 bg-purple-50 rounded-lg">
                <Link size={14} className="text-purple-600" />
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2">
            {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## ✅ 4. COMMITMENTS/PROMISES FEATURE

### Mobile Implementation Pattern
**File:** `PoliticianPromisesScreen.tsx`

**UI Structure:**
1. **Promise Card:**
   - Status badge (colored circle + text)
   - Title (bold)
   - Category badge
   - Description
   - Date made
   - Deadline (if applicable)
   - Progress indicator (if applicable)

2. **Status System:**
   - Completed: Green (check-circle icon)
   - Significant Progress: Light green (trending-up icon)
   - Early Progress: Yellow (schedule icon)
   - Stalled: Red (pause icon)
   - No Evidence: Gray (help icon)

3. **Promise Detail Modal:**
   - Full details
   - Timeline of updates
   - Source links
   - Verification links

### Web Translation:

```jsx
<div className="promises-section">
  {/* Filter */}
  <div className="flex gap-2 mb-6 overflow-x-auto">
    {['All', 'Completed', 'In Progress', 'Stalled', 'No Evidence'].map(status => (
      <button className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
        filterStatus === status
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-white text-gray-600 hover:bg-purple-50'
      }`}>
        {status}
      </button>
    ))}
  </div>

  {/* Promise Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {promises.map(promise => (
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer">
        {/* Status Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${
            promise.status === 'completed' ? 'bg-green-500' :
            promise.status === 'significant_progress' ? 'bg-green-400' :
            promise.status === 'early_progress' ? 'bg-yellow-500' :
            promise.status === 'stalled' ? 'bg-red-500' :
            'bg-gray-400'
          }`}></div>
          <span className={`text-xs font-bold uppercase ${
            promise.status === 'completed' ? 'text-green-600' :
            promise.status === 'significant_progress' ? 'text-green-500' :
            promise.status === 'early_progress' ? 'text-yellow-600' :
            promise.status === 'stalled' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {promise.status.replace('_', ' ')}
          </span>
        </div>

        {/* Category Badge */}
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-3">
          {promise.category}
        </span>

        {/* Title */}
        <h4 className="text-lg font-black text-gray-800 mb-2">{promise.title}</h4>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {promise.description}
        </p>

        {/* Dates */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Made: {new Date(promise.date_made).toLocaleDateString()}</span>
          {promise.deadline && (
            <span>Deadline: {new Date(promise.deadline).toLocaleDateString()}</span>
          )}
        </div>

        {/* Progress Bar (if applicable) */}
        {promise.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-bold text-purple-600">{promise.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${promise.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## 🗳️ 5. VOTING RECORDS FEATURE

### Mobile Implementation Pattern
**File:** `VotingRecordsScreen.tsx`

**UI Structure:**
1. **Filter Pills:**
   - All Votes
   - Voted For (green)
   - Voted Against (red)
   - Abstained (yellow)

2. **Vote Card:**
   - Bill name (bold)
   - Vote badge (colored: For/Against/Abstain)
   - Date
   - Category badge
   - Bill description (expandable)

3. **Vote Colors:**
   - For: Green (#10B981)
   - Against: Red (#EF4444)
   - Abstain: Yellow (#F59E0B)

### Web Translation:

```jsx
<div className="voting-records-section">
  {/* Filter */}
  <div className="flex gap-2 mb-6">
    {['All Votes', 'Voted For', 'Voted Against', 'Abstained'].map(filter => (
      <button className={`px-4 py-2 rounded-full font-bold text-sm ${
        filterVote === filter
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-white text-gray-600 hover:bg-purple-50'
      }`}>
        {filter}
      </button>
    ))}
  </div>

  {/* Vote Cards */}
  <div className="space-y-4">
    {votes.map(vote => (
      <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition">
        <div className="flex justify-between items-start mb-3">
          {/* Bill Name */}
          <h4 className="text-lg font-bold text-gray-800 flex-1">
            {vote.bill_name}
          </h4>

          {/* Vote Badge */}
          <span className={`px-4 py-2 rounded-full font-bold text-sm ml-4 ${
            vote.vote === 'For' ? 'bg-green-100 text-green-700' :
            vote.vote === 'Against' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {vote.vote}
          </span>
        </div>

        {/* Category & Date */}
        <div className="flex gap-4 mb-3">
          {vote.category && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              {vote.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {new Date(vote.date).toLocaleDateString()}
          </span>
        </div>

        {/* Description */}
        {vote.bill_description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {vote.bill_description}
          </p>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## 🎯 6. POLITICIAN DETAIL MODAL ENHANCEMENT

### Recommended Tab Structure (Based on Mobile Screens):

```jsx
<div className="politician-detail-modal">
  {/* Tabs */}
  <div className="flex gap-2 border-b border-gray-200 mb-6">
    {['Overview', 'Documents', 'News', 'Timeline', 'Promises', 'Voting', 'Career'].map(tab => (
      <button className={`px-4 py-3 font-bold text-sm transition ${
        activeTab === tab
          ? 'text-purple-600 border-b-2 border-purple-600'
          : 'text-gray-600 hover:text-purple-600'
      }`}>
        {tab}
      </button>
    ))}
  </div>

  {/* Tab Content */}
  {activeTab === 'Overview' && <OverviewTab />}
  {activeTab === 'Documents' && <DocumentsTab />}
  {activeTab === 'News' && <NewsTab />}
  {activeTab === 'Timeline' && <TimelineTab />}
  {activeTab === 'Promises' && <PromisesTab />}
  {activeTab === 'Voting' && <VotingTab />}
  {activeTab === 'Career' && <CareerTab />}
</div>
```

---

## 📱 → 💻 Responsive Design Guidelines

1. **Mobile First (< 768px):**
   - Single column layout
   - Full-width cards
   - Sticky filter bar
   - Bottom sheet modals

2. **Tablet (768px - 1024px):**
   - 2-column grid for cards
   - Side-by-side modals
   - Expanded filters

3. **Desktop (> 1024px):**
   - 2-3 column grid
   - Sidebar filters
   - Large modals with tabs

---

## 🎨 Component Library Needed

Based on mobile patterns, create these reusable components:

1. **StatusBadge** - For commitments, news credibility
2. **TimelineItem** - For timeline events
3. **NewsCard** - For news items
4. **DocumentCard** - For documents
5. **VoteCard** - For voting records
6. **ProgressBar** - For promise tracking
7. **FilterBar** - Reusable filter pills
8. **SourceLinks** - Collapsible source links section
9. **VerificationBadge** - Credibility indicators

---

## Next Steps:

1. Implement tab-based PoliticianDetailModal
2. Create reusable component library
3. Build individual feature tabs
4. Add API integration
5. Implement filtering and search
6. Add animations and transitions

