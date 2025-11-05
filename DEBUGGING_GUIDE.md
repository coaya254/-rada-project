# Debugging Guide - Manage Politicians Screen

**Date:** 2025-10-25
**Status:** ⚠️ **NEEDS TESTING**

---

## What I've Fixed

### 1. API URL Configuration ✅
Changed all API services from `localhost` to your computer's IP address `192.168.100.41`:
- api.ts
- AdminAPIService.ts
- PoliticsAPIService.ts
- LearningAPIService.ts
- ProfileAPIService.ts
- communityApi.ts

### 2. Backend API Routes ✅
Fixed table name mismatches:
- `admin-api-routes.js` - Fixed JOIN queries (timeline_events → politician_timeline, commitments → politician_commitments)
- `voting-api-routes.js` - Fixed typo in bulk import table name
- `commitment-api-routes.js` - Fixed all table/field names
- `document-api-routes.js` - Fixed all table/field names

### 3. Added Comprehensive Debugging ✅

**In ManagePoliticiansScreen.tsx:**
- Added console logs showing:
  - 🔍 When loading starts
  - 📡 Full API response
  - ✅ Number of politicians found
  - 📊 Processing status
  - ❌ Any errors
- Added loading state
- Added empty state with helpful messages
- Added debug info showing total vs filtered politicians

**In AdminAPIService.ts:**
- Added console logs showing:
  - 🌐 Full URL being called
  - 📡 HTTP response status
  - ✅ Success responses
  - ❌ Error responses

---

## How to Test

### Step 1: RESTART Your React Native App

**THIS IS CRITICAL!** The app must be restarted for the IP address changes to take effect.

```bash
# Stop the app if running (Ctrl+C in terminal)

# Clear cache and restart:
cd RadaAppClean
npx expo start --clear
```

### Step 2: Make Sure Server is Running

```bash
# In a separate terminal:
cd C:\Users\muthe\OneDrive\Desktop\radamtaani
node server.js

# You should see:
# 🚀 Rada.ke server running on port 5000
# Mobile access: http://192.168.100.41:5000/api
```

### Step 3: Open the App and Navigate

1. Open the app on your device/emulator
2. Navigate to: **Admin Panel → Politics → Manage Politicians**

### Step 4: What You Should See

#### Scenario A: Loading (Brief moment)
```
Loading politicians...
Check console for API logs
```

#### Scenario B: Success (23 politician cards)
- You should see politician cards for:
  - William Ruto
  - Raila Odinga
  - Susan Siili
  - And 20 more...

#### Scenario C: Empty/Error
```
No politicians found
Failed to load data from API. Check console logs.
Total in DB: 0 | Filtered: 0
```

---

## Check Console Logs

### In Expo Terminal

Look for these logs:

#### If Working ✅:
```
🔍 Loading politicians from API...
🌐 Admin API Request: GET http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true
📡 Response status: 200 OK
✅ API Success: { success: true, data: [...] }
✅ Found 23 politicians
📊 Processed politicians: 23
✅ State updated with politicians
```

#### If Failing ❌:
```
🔍 Loading politicians from API...
🌐 Admin API Request: GET http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true
❌ Admin API Error: Network request failed
```

---

## Common Issues & Solutions

### Issue 1: Network request failed

**Cause:** App can't reach the backend server

**Solutions:**
1. Make sure backend server is running (`node server.js`)
2. Make sure your phone/emulator is on the same WiFi as your computer
3. Check firewall isn't blocking port 5000
4. Verify IP address is correct:
   ```bash
   ipconfig
   # Look for IPv4 Address under your active network adapter
   ```
5. If IP changed, update all 6 API service files

### Issue 2: Shows "Loading politicians..." forever

**Cause:** API request timing out

**Solutions:**
1. Check console for error messages
2. Verify server is running
3. Test API directly in browser: `http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true`
4. Restart app with cache clear

### Issue 3: Empty screen, no loading or error

**Cause:** Screen not mounting or rendering

**Solutions:**
1. Check for React Native errors in console
2. Restart app completely
3. Check navigation is correct

### Issue 4: API returns empty array

**Cause:** Search endpoint issue or no data in database

**Solutions:**
1. Test the endpoint directly: `curl http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true`
2. Check database has politicians:
   ```bash
   node -e "const mysql = require('mysql2'); const db = mysql.createConnection({host:'localhost',user:'root',password:'!1754Swm',database:'radamtani'}); db.query('SELECT COUNT(*) FROM politicians', (e,r) => {console.log('Count:', r); process.exit()});"
   ```

---

## Manual API Test

You can test the API directly from your browser or curl:

### Browser Test:
Open: `http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true`

### Curl Test:
```bash
curl "http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 23,
      "name": "Test Politician E2E 1761377559848",
      "title": "Test Member of Parliament",
      "party": "UDA",
      "status": "published",
      "total_timeline_events": 0,
      "total_commitments": 1,
      "completion_score": "0"
    },
    // ... 22 more politicians
  ]
}
```

---

## Debug Checklist

Before asking for more help, please check:

- [ ] Backend server is running
- [ ] Server shows `Mobile access: http://192.168.100.41:5000/api`
- [ ] React Native app has been restarted with `--clear` flag
- [ ] Phone/emulator is on same WiFi as computer
- [ ] Checked console logs in Expo terminal
- [ ] Tested API endpoint in browser/curl - works
- [ ] Firewall allows Node.js on port 5000

---

## What to Share If Still Not Working

Please provide:

1. **Expo Console Logs** - Copy all logs starting with 🔍
2. **Browser/Curl Test Result** - Does the API work when accessed directly?
3. **Server Console** - Any errors from `node server.js`?
4. **What You See** - Screenshot of the screen
5. **Network Info** - What's your computer's IP? (`ipconfig`)

---

## Expected Behavior

### When Everything Works:

1. You start the app
2. Navigate to Manage Politicians
3. Screen shows "Loading politicians..." for 1-2 seconds
4. Then displays 23 politician cards
5. Each card shows:
   - Name, position, party
   - Timeline events count
   - Commitments count
   - Completion score
   - Last updated date
   - Draft/Published badge
6. You can:
   - Search politicians
   - Click cards to edit
   - Delete politicians
   - Publish/unpublish

### Console Logs (Success Path):

```
🔍 Loading politicians from API...
🌐 Admin API Request: GET http://192.168.100.41:5000/api/admin/politicians/search?q=&include_drafts=true
📡 Response status: 200 OK
✅ API Success: { success: true, data: [Array(23)] }
✅ Found 23 politicians
📊 Processed politicians: 23
✅ State updated with politicians
```

---

## Files Changed

### Frontend (RadaAppClean/src/services/):
1. api.ts
2. AdminAPIService.ts (+ added debugging)
3. PoliticsAPIService.ts
4. LearningAPIService.ts
5. ProfileAPIService.ts
6. communityApi.ts

### Frontend (RadaAppClean/src/screens/admin/):
7. ManagePoliticiansScreen.tsx (+ added debugging, loading & empty states)

### Backend:
8. admin-api-routes.js
9. voting-api-routes.js

---

**Next Step:** RESTART YOUR APP and check the console logs!

**Status:** 🟡 Waiting for testing
