# Production Build Guide - Bills Tracker

**Version**: 1.0.6  
**Last Updated**: 2026-01-29  
**Status**: ✅ READY TO BUILD

---

## Prerequisites Checklist

Before creating the production archive, verify:

- [x] All tests passing (135/135)
- [x] Dev build working on simulator
- [x] No console errors or warnings
- [x] Revenue Cat configured
- [x] AdMob app ID set
- [x] Bundle ID correct: `com.fullstackdev1.bill-subscriptions-organizer-tracker`
- [x] Version number set: 1.0 (6)
- [ ] Apple Developer account active
- [ ] Signing certificates valid
- [ ] App Store Connect app created

---

## Step 1: Open Project in Xcode

```bash
cd ~/repos/bill-subscriptions-organizer-tracker
open ios/BillsTracker.xcworkspace
```

⚠️ **Important**: Open the `.xcworkspace` file, NOT `.xcodeproj`

---

## Step 2: Configure Build Settings

### Select Target Device
1. In Xcode toolbar, click the device dropdown
2. Select **"Any iOS Device"** (not a simulator)
   - Alternative: Select a connected physical device

### Verify Signing
1. Select **BillsTracker** project in left sidebar
2. Select **BillsTracker** target
3. Go to **"Signing & Capabilities"** tab
4. Ensure:
   - ✅ "Automatically manage signing" is checked
   - ✅ Team: Your Apple Developer account
   - ✅ Bundle Identifier: `com.fullstackdev1.bill-subscriptions-organizer-tracker`
   - ✅ Signing Certificate: "Apple Distribution"

### Verify Build Configuration
1. Go to **Product → Scheme → Edit Scheme**
2. Select **Archive** on left
3. Ensure **Build Configuration** is set to **"Release"**
4. Click **Close**

---

## Step 3: Create Archive

1. **Product → Archive** (or ⌘⇧B)
2. Wait for build to complete (~5-10 minutes)
   - Progress bar shows in Xcode top bar
   - Watch for any build errors (there shouldn't be any)

### Expected Build Output
```
▸ Building BillsTracker [Release]
▸ Copying BillsTracker.app to archive
▸ Generating dSYM file
▸ Archive succeeded
```

---

## Step 4: Distribute to App Store

Once archive completes, the **Organizer** window opens automatically.

### In Organizer Window:

1. **Select the Archive**
   - Should see "BillsTracker 1.0 (6)" with today's date
   - Click **"Distribute App"** button

2. **Distribution Method**
   - Select **"App Store Connect"**
   - Click **Next**

3. **Distribution Options**
   - Select **"Upload"**
   - Click **Next**

4. **App Store Distribution Options**
   - ✅ Include bitcode for iOS content: YES (if available)
   - ✅ Upload symbols: YES
   - ✅ Manage version and build number: Automatic (recommended)
   - Click **Next**

5. **Re-sign Options**
   - **Automatically manage signing** (recommended)
   - Click **Next**

6. **Review Summary**
   - Verify all details
   - Click **Upload**

7. **Wait for Upload**
   - Progress bar shows upload status
   - Usually takes 2-5 minutes
   - ✅ Success message when done

---

## Step 5: Verify Upload in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Apps → Bills Tracker**
3. Go to **TestFlight** tab
4. Wait ~5-10 minutes for processing
5. Build should appear with status:
   - **"Processing"** → **"Missing Compliance"** → **"Ready to Submit"**

### Export Compliance
When build shows "Missing Compliance":
1. Click on the build
2. Answer export compliance questions:
   - **"Does your app use encryption?"**
     - Select **"No"** (or answer appropriately)
3. Submit answers

---

## Step 6: Submit for Review (Optional - TestFlight First)

### Option A: TestFlight Beta (Recommended)
1. In TestFlight tab, add build to internal testing
2. Test thoroughly before public submission
3. Get feedback from beta testers

### Option B: Immediate Submission
1. Go to **App Store** tab (not TestFlight)
2. Click **"+ Version or Platform"** if needed
3. Select the uploaded build
4. Fill in **"What's New in This Version"**
5. Click **"Submit for Review"**

---

## Troubleshooting

### Build Fails with Signing Error
**Solution**: 
- Go to Xcode Preferences → Accounts
- Select your Apple ID
- Click "Download Manual Profiles"
- Try archiving again

### Archive Option is Greyed Out
**Solution**:
- Ensure "Any iOS Device" is selected (not a simulator)
- Close and restart Xcode
- Clean build folder: Product → Clean Build Folder (⌘⇧K)

### Upload Fails
**Solution**:
- Check internet connection
- Verify Apple Developer account is active
- Check App Store Connect status page
- Try uploading again

### "No Accounts with App Store Connect Access"
**Solution**:
- Go to App Store Connect
- Ensure your Apple ID has "Admin" or "Developer" role
- Re-login in Xcode → Preferences → Accounts

---

## Post-Upload Checklist

After successful upload:

- [ ] Build appears in App Store Connect
- [ ] Export compliance answered (if required)
- [ ] Build status: "Ready to Submit" or "Testing" (TestFlight)
- [ ] Version number correct: 1.0 (6)
- [ ] Screenshots uploaded (if first submission)
- [ ] App description complete
- [ ] Privacy policy URL set
- [ ] Support URL set
- [ ] Categories selected
- [ ] Age rating set
- [ ] Pricing set

---

## Expected Timeline

| Step | Duration | Status |
|------|----------|--------|
| Archive creation | 5-10 min | ⏳ Pending |
| Upload to ASC | 2-5 min | ⏳ Pending |
| Processing in ASC | 5-15 min | ⏳ Pending |
| TestFlight approval | Instant | ⏳ Pending |
| App Review (if submitted) | 1-3 days | ⏳ Pending |

---

## Success Criteria

✅ Archive created without errors  
✅ Upload completed successfully  
✅ Build appears in App Store Connect  
✅ Export compliance answered  
✅ Build available in TestFlight (if enabled)  
✅ App metadata complete  
✅ Ready for App Review submission  

---

## Next Steps After Production Build

1. **TestFlight Testing** (1-2 hours)
   - Install beta on real device
   - Test all features per checklist
   - Get feedback from internal testers

2. **Fix Any Issues** (if found)
   - Create fixes in dev branch
   - Re-test
   - Create new build (1.0.7)

3. **Submit for Review** (when confident)
   - Fill in submission form
   - Click "Submit for Review"
   - Wait for Apple review (1-3 days)

4. **Monitor Review Status**
   - Check App Store Connect daily
   - Respond to any Apple questions
   - Celebrate when approved! 🎉

---

## Contact & Support

- **Developer**: Felipe Vieira
- **Bundle ID**: com.fullstackdev1.bill-subscriptions-organizer-tracker
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com

---

**Ready to build? Let's ship this! 🚀**
