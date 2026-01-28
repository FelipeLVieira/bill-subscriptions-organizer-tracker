# App Store Connect Submission Checklist

## Pre-Submission Requirements

### ✅ App Assets
- [x] App Icon (1024x1024) - `assets/images/icon.png`
- [x] Splash Screen - `assets/images/splash-icon.png`
- [x] Adaptive Icon (Android) - `assets/images/adaptive-icon.png`

### ✅ App Configuration
- [x] App Name: "Bills Tracker"
- [x] Bundle ID: `com.fullstackdev1.bill-subscriptions-organizer-tracker`
- [x] Version: 1.0.7
- [x] Build Number: 1
- [x] Privacy Manifest (iOS 17+) configured in app.json

### ✅ Code Quality
- [x] All 234 tests passing (13 test suites)
- [x] ESLint: Clean (0 issues)
- [x] TypeScript: Strict mode, 0 `any` types
- [x] Console logs: All wrapped in `__DEV__`

### ✅ Accessibility
- [x] VoiceOver support on all modals and screens
- [x] Haptic feedback on all interactive elements

### ✅ Internationalization
- [x] 43 languages fully translated (323 keys each)
- [x] 40+ currencies supported
- [x] RTL support (Arabic, Hebrew)

### ✅ Features
- [x] Offline-first (SQLite database)
- [x] Dark/Light mode
- [x] 271 company icons
- [x] Smart notifications
- [x] Export functionality (CSV/JSON)
- [x] RevenueCat integration (Pro subscription)

### ✅ Privacy
- [x] Privacy manifest configured
- [x] Camera usage description in Info.plist
- [x] Photo library usage description in Info.plist
- [x] No data uploaded to servers (100% local)
- [x] ITSAppUsesNonExemptEncryption = false

### ✅ Monetization
- [x] RevenueCat API keys configured
- [x] Entitlement ID: "Bills & Subscriptions Tracker Pro"
- [x] Monthly and yearly subscription options
- [x] AdMob integration configured

## Missing/Pending

### ❌ App Store Connect Setup
- [ ] **ASC API Key (.p8 file)** - BLOCKER
  - Required for automated submission via Fastlane/EAS
  - Can be created in App Store Connect > Users and Access > Keys
- [ ] App Store listing (description, keywords, screenshots)
- [ ] Privacy Policy URL (recommended for subscription apps)
- [ ] Support URL
- [ ] Marketing URL (optional)

### 📱 Screenshots Needed
- [ ] iPhone 6.9" Display (iPhone 16 Pro Max): 1320 x 2868 pixels
- [ ] iPhone 6.7" Display (iPhone 15 Plus): 1290 x 2796 pixels
- [ ] iPhone 6.5" Display (iPhone 14 Plus): 1284 x 2778 pixels
- [ ] iPhone 5.5" Display (iPhone 8 Plus): 1242 x 2208 pixels

Minimum required: 1 set for the largest display size (6.9")

### 📝 App Store Listing Text
- [ ] App Name (30 characters max)
- [ ] Subtitle (30 characters max)
- [ ] Description (4000 characters max)
- [ ] Keywords (100 characters max, comma-separated)
- [ ] Promotional Text (170 characters, can be updated anytime)
- [ ] What's New (4000 characters, for this version)

### 🎯 Categories
- [ ] Primary Category (e.g., Finance, Productivity)
- [ ] Secondary Category (optional)

### 💰 Pricing & Availability
- [ ] Price Tier (Free)
- [ ] Countries/Regions for availability
- [ ] Age Rating

### 📋 Review Information
- [ ] Contact Information (email, phone)
- [ ] Demo Account Credentials (if app requires login)
- [ ] Notes for Reviewer

## Build & Submit Commands

### Local Build (Recommended)
```bash
# Clean build
cd ~/repos/bill-subscriptions-organizer-tracker
rm -rf ios/build .expo node_modules/.cache

# Install dependencies
npm install

# Build for iOS (on macOS with Xcode)
npx expo run:ios --configuration Release --port 8082

# Archive in Xcode
# 1. Open ios/BillsTracker.xcworkspace in Xcode
# 2. Product > Archive
# 3. Distribute App > App Store Connect
# 4. Upload
```

### Manual Submission Steps
1. Create app in App Store Connect
2. Fill in all metadata (name, description, screenshots, etc.)
3. Build and archive in Xcode
4. Upload to App Store Connect via Xcode Organizer
5. Select build in App Store Connect
6. Submit for review

## Post-Approval Tasks
- [ ] Update README with App Store link
- [ ] Update settings.tsx with real App Store ID (replace "idXXXXXXXXXX")
- [ ] Consider minor dependency updates:
  - react-native-gifted-charts: 1.4.70 → 1.4.71
  - react-native-purchases: 9.7.1 → 9.7.2
- [ ] Set up TestFlight for beta testing
- [ ] Create promotional assets for social media
- [ ] Write blog post/announcement

## Notes
- **Status**: Ready for submission, waiting for ASC API key
- **Last Updated**: 2026-01-27
- **Build Environment**: macOS with Xcode
- **Deployment Method**: Local build (not using EAS Cloud)
