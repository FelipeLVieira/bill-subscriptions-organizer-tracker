# Quick Start: Submit to App Store

**Status**: ✅ APP IS 100% READY TO SUBMIT!

## What's Already Done

✅ All 234 tests passing  
✅ Code quality verified (ESLint, TypeScript strict)  
✅ Privacy manifest configured  
✅ App icons and splash screens ready  
✅ Documentation complete  

## What You Need To Do

### 1. Create Screenshots (30 minutes)

Open the app in simulator and take screenshots:

```bash
# Boot the simulator
~/clawd/scripts/sim-manager.sh boot ios-bills

# Build and run the app
cd ~/repos/bill-subscriptions-organizer-tracker
npx expo run:ios --port 8082

# Take screenshots (use cmd+s in simulator)
# Or use the script:
~/clawd/scripts/sim-manager.sh screenshot ios-bills /tmp/screenshot.png
```

**Required size**: 1320 x 2868 pixels (iPhone 6.9" display)

**Suggested screenshots**:
1. Home screen with subscriptions
2. Analytics view with pie chart
3. Add subscription modal
4. Calendar view
5. Dark mode (optional but recommended)

### 2. Set Up App Store Connect (20 minutes)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in basic info:
   - Platform: iOS
   - Name: **Bills Tracker**
   - Primary Language: English (U.S.)
   - Bundle ID: `com.fullstackdev1.bill-subscriptions-organizer-tracker`
   - SKU: `bills-tracker-001` (or any unique identifier)

4. Open `APP_STORE_LISTING.md` in this directory
5. Copy-paste the following sections:
   - App name
   - Subtitle
   - Description
   - Keywords
   - Promotional text
   - What's New

6. Upload the screenshots you created in step 1

7. Set category to **Finance** (primary)

8. Set age rating to **4+**

### 3. Build & Upload (15 minutes)

```bash
# Open the project in Xcode
cd ~/repos/bill-subscriptions-organizer-tracker
open ios/BillsTracker.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)" as target
# 2. Product → Archive (wait 3-5 minutes)
# 3. When archive completes, Organizer opens
# 4. Click "Distribute App"
# 5. Select "App Store Connect"
# 6. Click "Upload"
# 7. Accept defaults and upload
```

### 4. Submit for Review (5 minutes)

1. Go back to App Store Connect
2. Select your app
3. Go to "App Store" tab
4. Under "Build", click "+" and select the build you just uploaded
5. Fill in "Review Information":
   - Email: felipe.lv.90@gmail.com
   - Phone: [your phone]
   - Notes: See `APP_STORE_LISTING.md` for suggested reviewer notes

6. Click "Submit for Review"

## Files to Reference

- `ASC_SUBMISSION_CHECKLIST.md` - Complete checklist of everything
- `APP_STORE_LISTING.md` - All copy to paste into ASC
- `README.md` - Project overview and tech details

## Troubleshooting

**Build fails in Xcode?**
```bash
cd ~/repos/bill-subscriptions-organizer-tracker
rm -rf ios/build .expo node_modules/.cache
npm install
npx expo prebuild --clean
```

**Need to test the build?**
```bash
npx expo run:ios --configuration Release --port 8082
```

**Screenshot size wrong?**
- Use iPhone 16 Pro Max simulator (6.9" display)
- Screenshots should be 1320 x 2868 pixels automatically
- If not, use: xcrun simctl io booted screenshot screenshot.png

## Estimated Time

- Screenshots: 30 min
- ASC Setup: 20 min  
- Build & Upload: 15 min
- Submit: 5 min

**Total**: ~1 hour 10 minutes

---

**Questions?** Check `ASC_SUBMISSION_CHECKLIST.md` for detailed steps.

**App Ready Since**: January 27, 2026  
**Last Test Run**: 234/234 passing  
**Build Number**: 1  
**Version**: 1.0.7
