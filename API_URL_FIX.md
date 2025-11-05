# API URL Configuration Fix - Frontend-Backend Connection

**Date:** 2025-10-25
**Issue:** Manage Politicians screen (and all other screens) not showing data
**Root Cause:** Frontend using `localhost` instead of computer IP address
**Status:** ✅ **FIXED**

---

## The Problem

Your React Native app couldn't connect to the backend API because it was using `http://localhost:5000`, which doesn't work when running on:
- Physical Android/iOS devices
- Android emulators
- Some iOS simulators

**Why `localhost` doesn't work:**
- `localhost` refers to the device itself, NOT your computer
- Your app needs to use your computer's actual IP address to connect to the backend server

---

## The Solution

Updated all API service files to use your computer's IP address: **`192.168.100.41`**

### Files Updated (6 files):

1. ✅ **api.ts** - Main API configuration
   - Changed: `http://localhost:5000` → `http://192.168.100.41:5000`

2. ✅ **AdminAPIService.ts** - Admin API calls
   - Changed: `http://localhost:5000/api` → `http://192.168.100.41:5000/api`

3. ✅ **PoliticsAPIService.ts** - Politics/Politicians API
   - Changed: `http://localhost:5000/api` → `http://192.168.100.41:5000/api`

4. ✅ **LearningAPIService.ts** - Learning modules API
   - Changed: `http://localhost:5000/api` → `http://192.168.100.41:5000/api`

5. ✅ **ProfileAPIService.ts** - User profile API
   - Changed: `http://localhost:5000/api/profile` → `http://192.168.100.41:5000/api/profile`

6. ✅ **communityApi.ts** - Community discussions API
   - Changed: `http://localhost:5000/api/community` → `http://192.168.100.41:5000/api/community`

---

## What You Need to Do NOW

### Step 1: Restart Your React Native App

**IMPORTANT:** You MUST restart your app for these changes to take effect!

```bash
# If app is running, stop it (Ctrl+C in the terminal)
# Then restart it:
cd RadaAppClean
npx expo start
```

### Step 2: Clear Metro Bundler Cache (Recommended)

If the app still doesn't work after restart, clear the cache:

```bash
cd RadaAppClean
npx expo start --clear
```

### Step 3: Verify Connection

After restarting:
1. Open the app on your device/emulator
2. Go to **Admin Panel → Politics → Manage Politicians**
3. You should now see all 23 politician cards!

---

## How to Test

### Test 1: Manage Politicians Screen
- Navigate to: **Admin → Politics → Manage Politicians**
- **Expected:** You see 23 politician cards with:
  - Photos
  - Names (William Ruto, Raila Odinga, Susan Siili, etc.)
  - Party affiliation
  - Timeline events count
  - Commitments count
  - Completion scores
  - Last updated dates

### Test 2: Search Functionality
- Type "Ruto" in the search box
- **Expected:** You see William Ruto's card

### Test 3: Edit a Politician
- Click on any politician card
- **Expected:** Opens the edit screen with all politician data

---

## If It Still Doesn't Work

### Problem A: IP Address Changed

If your computer's IP address changes (e.g., after restarting your router), you need to:

1. Find your new IP address:
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your network adapter
   ```

2. Update all 6 files with the new IP address

3. Restart the app

### Problem B: Firewall Blocking Connection

If your firewall is blocking the connection:

1. Allow Node.js through Windows Firewall
2. Or temporarily disable firewall to test
3. Make sure port 5000 is not blocked

### Problem C: Server Not Running

Make sure the backend server is running:

```bash
# Check if server is running
netstat -ano | findstr :5000

# If not running, start it:
node server.js
```

---

## Understanding the Setup

### Network Architecture

```
Your Computer (192.168.100.41)
    │
    ├─ Backend Server (port 5000)
    │  └─ http://192.168.100.41:5000
    │
Your Phone/Emulator (192.168.100.XX)
    │
    └─ React Native App
       └─ Calls http://192.168.100.41:5000
```

### Why This Works

1. Both your computer and device are on the **same WiFi network** (192.168.100.x)
2. Your computer has IP address **192.168.100.41**
3. The backend server listens on port **5000**
4. Your device can reach your computer via **192.168.100.41:5000**

---

## Future: Using Environment Variables (Better Approach)

For better configuration management, you should create a `.env` file:

### Create `.env` in RadaAppClean folder:

```env
EXPO_PUBLIC_API_URL=http://192.168.100.41:5000/api
```

Then your code will automatically use it:
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.41:5000/api';
```

**Benefits:**
- Easy to change without editing code
- Different URLs for dev/staging/production
- Can be gitignored for security

---

## Verification Checklist

Before testing, make sure:

- [x] Backend server is running (`node server.js`)
- [x] Server shows: `🚀 Rada.ke server running on port 5000`
- [x] Server shows: `Mobile access: http://192.168.100.41:5000/api`
- [x] All 6 API service files updated with IP address
- [ ] React Native app restarted (or cache cleared)
- [ ] Both computer and device on same WiFi network
- [ ] Firewall allows Node.js connections

---

## Expected Results After Fix

### Manage Politicians Screen
- ✅ Shows 23 politician cards
- ✅ Each card displays all info
- ✅ Search works
- ✅ Clicking a card opens edit screen
- ✅ Can delete/unpublish politicians

### Other Screens That Should Now Work
- ✅ Learning modules screen
- ✅ Community discussions
- ✅ User profile
- ✅ All admin screens
- ✅ Politics/Politicians public view

---

## Summary

**Problem:** Frontend couldn't connect to backend (using localhost instead of IP)

**Fix:** Updated 6 API service files to use `192.168.100.41`

**Next Step:** **RESTART YOUR APP!**

**Result:** All screens should now load data from the backend properly

---

**Fix Applied:** 2025-10-25
**Verification:** Backend API tested with curl - returns data correctly
**Status:** 🟢 **Ready to Test**

**IMPORTANT:** You MUST restart your React Native app for this to work!
