# Changelog

All notable changes to Bills Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.0] - 2026-01-30

### Status
✅ **READY FOR APP STORE** - Pristine code quality, 135/135 tests passing

### Fixed
- **Critical**: Fixed TypeScript syntax errors in `contentContainerStyle` that would have blocked Xcode builds
- **Critical**: Resolved malformed array syntax in history.tsx and search.tsx
- UI content cut-off issues on iPad Air (increased ScrollView padding)
- Dynamic safe area padding for all device sizes (iPhone 16 Pro Max, iPad Air)

### Changed
- **Code Quality**: Achieved 0 ESLint warnings (removed all unused variables and imports)
- **Code Quality**: TypeScript compiles with 0 errors
- Incremented build number to 4 for App Store submission
- Updated README with current version and status badges

### Technical Improvements
- Removed unused theme color constants across multiple components
- Removed unused Platform import
- Removed unused error variables in catch blocks
- Cleaned up FALLBACK_TAB_BAR_HEIGHT constant
- All 135 automated tests passing (100%)

### Developer Experience
- Added comprehensive STATUS_REPORT.md documenting production readiness
- Added PRODUCTION_BUILD_GUIDE.md with Xcode archive instructions
- Created bills-production-ready-cycle.md summarizing QA cycle
- Updated all documentation to reflect version 4.0.0

---

## [3.0.0] - 2026-01-29

### Added
- Support for iPad Air 5th generation
- Cursor IDE configuration rules

### Fixed
- Lodash prototype pollution vulnerability (npm audit fix)

### Changed
- Bumped version to 3.0.0 for resubmission after iPad UI fixes

---

## [2.0.0] - 2026-01-29

### Changed
- Incremented build number to 2
- Minor dependency updates (navigation, expo, purchases, charts, ESLint, TypeScript)

### Code Quality
- Auto-fixed ESLint warnings
- Added coverage directory to .gitignore
- Added .clawd/ to .gitignore

---

## [1.0.0] - Initial Release

### Core Features
- **Subscription Tracking**: Add and manage recurring bills (monthly, yearly, weekly, daily, one-time)
- **Offline First**: All data stored locally using SQLite - no cloud account required
- **Smart Reminders**: Customizable notifications before bills are due
- **Payment History**: Track all your past payments with detailed records
- **Analytics**: Visualize spending with interactive pie charts by category

### User Experience
- **Multi-Currency Support**: 40+ currencies with automatic locale detection
- **Multi-Language**: 40+ languages including RTL support (Arabic, Hebrew)
- **Dark/Light Mode**: Automatic theme switching based on device settings
- **Company Icons**: Auto-detection of 80+ popular services (Netflix, Spotify, etc.)
- **Haptic Feedback**: Native iOS haptic patterns for all interactions
- **Guided Tutorial**: Interactive onboarding for first-time users

### Organization
- **Smart Search**: Find subscriptions by name, category, or amount
- **Category System**: 7 built-in categories + custom categories
- **Period Views**: Weekly, monthly, or yearly spending breakdowns
- **Overdue Tracking**: Visual indicators and bulk "Mark All Paid" action

### Privacy
- 100% offline - no cloud syncing
- All data stays on device
- No third-party analytics
- No user tracking

### Tech Stack
- React Native (Expo SDK 54)
- TypeScript
- Expo Router v6
- Zustand for state management
- SQLite + Drizzle ORM
- Jest for testing (135 tests)

---

## Version History Summary

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 4.0.0 (Build 4) | 2026-01-30 | ✅ Ready for App Store | Pristine quality, 0 errors/warnings |
| 3.0.0 (Build 3) | 2026-01-29 | Superseded | iPad fixes |
| 2.0.0 (Build 2) | 2026-01-29 | Superseded | Dependency updates |
| 1.0.0 (Build 1) | Initial | Superseded | First build |

---

## Upgrade Notes

### From 3.x to 4.0.0
- No breaking changes for users
- Database schema unchanged
- All existing data will migrate automatically
- No action required from users

### Code Quality Improvements
This release focused heavily on code quality and App Store readiness:
- Fixed all TypeScript compilation errors
- Eliminated all ESLint warnings
- 100% test pass rate (135/135)
- Enhanced iPad compatibility
- Improved documentation

---

## Links

- [GitHub Repository](https://github.com/FelipeLVieira/bill-subscriptions-organizer-tracker)
- [Production Build Guide](PRODUCTION_BUILD_GUIDE.md)
- [Status Report](STATUS_REPORT.md)
- [README](README.md)
