# Bills Tracker - Project Instructions

## Project Overview
Offline-first mobile app for tracking and organizing bill subscriptions. All data stays on-device with SQLite.

## Tech Stack
- **Framework**: Expo SDK 54, React Native
- **Language**: TypeScript
- **Navigation**: Expo Router v6
- **State**: Zustand
- **Database**: Expo SQLite + Drizzle ORM
- **Notifications**: expo-notifications
- **i18n**: i18n-js (40+ languages)
- **Monetization**: RevenueCat

## Architecture
- 100% offline with SQLite
- Drizzle ORM for type-safe queries
- Local notifications for bill reminders
- No cloud sync (privacy-first)
- File-based routing with Expo Router

## Personas (Select Based on Task)
- **Mobile Developer**: UI, navigation, gestures
- **Database Engineer**: Drizzle schema, SQLite queries
- **UX Designer**: Onboarding, accessibility
- **Monetization Engineer**: RevenueCat paywall

## Code Conventions
- Expo Router file-based routing
- Drizzle for all DB operations
- Zustand for UI state only
- Context for theme/language/currency
- Haptic feedback on iOS

## Key Principles
- Offline-first (no network required)
- Privacy-focused (data stays on device)
- Multi-currency support (40+)
- Multi-language support (40+ including RTL)
- Battery-efficient notifications

## Key Features
- Recurring bills (daily/weekly/monthly/yearly/one-time)
- Smart reminders with notifications
- Spending analytics by category
- 80+ company icons (auto-detection)
- 7 built-in + custom categories
- Overdue tracking with bulk actions

## Key Commands
```bash
npm start              # Start Expo dev server
npm test               # Run Jest tests (103 tests)
npx expo build         # Build for production
```
