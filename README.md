# Bill Subscriptions Organizer Tracker

A local-first, offline-capable mobile application for tracking and organizing bill subscriptions. Built with React Native, Expo, and SQLite.

## Features
- **Subscription Tracking**: Add and manage recurring bills (monthly, yearly, weekly, daily).
- **Offline First**: All data is stored locally on the device using SQLite. No cloud account required.
- **Smart Reminders**: Get notified before your bills are due.
- **Analytics**: Visualize your spending habits with intuitive charts.
- **Search & Filter**: Easily find specific subscriptions.
- **Dark/Light Mode**: Automatic theme switching based on device settings.
- **Multi-language**: Supports English and Portuguese (and easily extensible).

## Tech Stack
- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **Navigation**: Expo Router v4
- **State Management**: Zustand
- **Database**: Expo SQLite + Drizzle ORM
- **UI Components**: Custom Design System
- **Charts**: react-native-gifted-charts

## Getting Started

### Prerequisites
- Node.js
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npx expo start
   ```

## Development
- **Database**: Schema is defined in `src/db/schema.ts`. Run `npx drizzle-kit generate` to create migrations after changes.
- **Localization**: Add new languages in `src/i18n/locales/`.

## Screenshots
(Add screenshots here)
