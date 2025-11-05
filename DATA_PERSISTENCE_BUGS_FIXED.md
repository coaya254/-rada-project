# Data Persistence Bugs - FIXED ✅

## Critical Bugs Found and Fixed

### Problem 1: Voting Records Table Name Mismatch
**Issue**: Voting records were not persisting when editing politicians
**Cause**: API was using TWO different table names:
- **DELETE** used: `politician_voting_records` (line 447)
- **INSERT** used: `voting_records` (line 666)

**Result**: When editing a politician:
1. API tried to delete old votes from `politician_voting_records`
2. But new votes were inserted into `voting_records`
3. Old votes never got deleted (wrong table)
4. New votes appeared to "disappear" on next edit

**Fix Applied**:
- Changed line 447 from `DELETE FROM politician_voting_records` → `DELETE FROM voting_records`
- Now DELETE and INSERT use the same table ✅

---

### Problem 2: Voting Record Sources Table Name Mismatch
**Issue**: Vote sources were not being fetched in GET requests
**Cause**: Similar mismatch in source table names:
- **INSERT** used: `voting_records_sources` (line 692)
- **GET (fetch sources)** used: `politician_voting_records_sources` (line 238)

**Result**: Sources for voting records never displayed because GET looked in wrong table

**Fix Applied**:
- Changed line 238 from `politician_voting_records_sources pvrs` → `voting_records_sources vrs`
- Now INSERT and GET use the same table ✅

---

## Files Modified

### `polihub-integrated-api-routes.js`
1. **Line 447**: Fixed voting records DELETE table name
   ```javascript
   // BEFORE:
   db.query('DELETE FROM politician_voting_records WHERE politician_id = ?', [id], ...)

   // AFTER:
   db.query('DELETE FROM voting_records WHERE politician_id = ?', [id], ...)
   ```

2. **Line 238**: Fixed voting record sources GET table name
   ```javascript
   // BEFORE:
   FROM politician_voting_records_sources pvrs

   // AFTER:
   FROM voting_records_sources vrs
   ```

---

## What's Now Fixed ✅

### Votes:
- ✅ Vote values now persist when editing politician
- ✅ Can add multiple votes and they save properly
- ✅ Can edit votes and changes stick
- ✅ Vote sources display correctly

### Party History:
- ✅ Backend saves party history correctly (always worked)
- ✅ Backend fetches party history correctly (always worked)
- ⚠️ **Admin must add data** - tables are empty by default

### Achievements:
- ✅ Backend saves achievements correctly (always worked)
- ✅ Backend fetches achievements correctly (always worked)
- ⚠️ **Admin must add data** - tables are empty by default

### Constituency:
- ✅ Backend saves `constituency_representation` field (always worked)
- ✅ Backend saves `constituency_focus_areas` field (always worked)
- ⚠️ **Admin must fill in fields** - currently null by default

---

## Remaining Issues (Not bugs, just needs data/UI work)

### 1. Empty Data
Party history, achievements, and constituency fields are WORKING but empty because:
- No data has been added yet via admin form
- Once admin adds data through the form, it will save and display properly

### 2. "3 Vote Cards Appearing" Bug
- Still need to investigate this admin UI issue
- Not a backend problem - likely frontend state management

### 3. Missing UI Elements
User mentioned:
- Promise cards images not showing
- Timeline cards images not showing
- Icons showing defaults instead of selected ones
- Share buttons have errors

These are separate frontend issues that need investigation.

---

## How to Test

### Test Voting Records Persistence:
1. Open Admin Dashboard
2. Edit any politician
3. Go to Voting Records tab
4. Add a vote with details
5. Save politician
6. Re-open same politician for editing
7. ✅ Vote should still be there with all data

### Test Party History/Achievements:
1. Edit politician
2. Add party history entry
3. Add achievement
4. Fill in constituency fields
5. Save
6. Check frontend - data should display
7. Re-edit - data should still be there

---

## Server Status
✅ Server restarted with fixes applied
✅ Both frontend (port 3000) and backend (port 5000) running

---

## Next Steps
1. ✅ Data persistence - FIXED
2. 🔄 Fix "3 vote cards" duplication bug
3. 🔄 Add missing UI elements for images
4. 🔄 Fix share buttons
5. 🔄 Redesign source system (as user requested)
