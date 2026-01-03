# Bill Subscriptions Organizer Tracker

A local-first, offline-capable mobile application for tracking and organizing bill subscriptions. Built with React Native, Expo, and SQLite.

## Features

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

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| Navigation | Expo Router v6 |
| State Management | Zustand |
| Database | Expo SQLite + Drizzle ORM |
| Charts | react-native-gifted-charts |
| Notifications | expo-notifications |
| Localization | i18n-js |
| Testing | Jest |

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── subscription/      # Subscription detail/edit
│   └── modal.tsx          # Add subscription modal
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, Input)
│   └── ...               # Feature components
├── constants/            # App constants
│   ├── Currencies.ts     # 40+ currency definitions
│   ├── Languages.ts      # 40+ language definitions
│   ├── categories.ts     # Subscription categories
│   └── companyIcons.ts   # 80+ company icon mappings
├── contexts/             # React contexts
│   ├── CurrencyContext   # Currency formatting & selection
│   ├── LanguageContext   # i18n management
│   └── ThemeContext      # Dark/light mode
├── db/                   # Database layer
│   ├── schema.ts         # Drizzle schema
│   └── actions.ts        # CRUD operations
├── i18n/                 # Internationalization
│   └── locales/          # 40+ language files
├── utils/                # Utility functions
│   ├── notifications.ts  # Reminder scheduling
│   ├── haptics.ts        # Haptic feedback
│   └── date.ts           # Date calculations
└── theme/                # Theme configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bill-subscriptions-organizer-tracker.git
cd bill-subscriptions-organizer-tracker

# Install dependencies
npm install

# Start development server
npx expo start
```

### Running on Device
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan QR code with Expo Go app

## Development

### Commands

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run lint       # Run ESLint
npm test           # Run Jest tests
```

### Database Migrations

```bash
# Generate migration after schema changes
npx drizzle-kit generate

# Migrations are auto-applied on app start
```

### Adding a New Language

1. Create a new file in `src/i18n/locales/` (e.g., `ko.ts`)
2. Copy structure from `en.ts` and translate
3. Add import and mapping in `src/i18n/index.ts`
4. Add language to `SUPPORTED_LANGUAGES` in `src/constants/Languages.ts`

### Adding a New Currency

1. Add currency to `PREDEFINED_CURRENCIES` in `src/constants/Currencies.ts`
2. Add locale mapping in `LOCALE_CURRENCY_MAP` if needed

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- currencies.test.ts
```

### Test Coverage

| Module | Tests |
|--------|-------|
| Currencies | 27 tests |
| Languages | 25 tests |
| Company Icons | 20 tests |
| Categories | 13 tests |
| Notifications | 13 tests |
| Date Utils | 5 tests |
| **Total** | **103 tests** |

## Privacy

This app is **100% offline**. Your financial data:
- Stays on your device
- Is never uploaded to any server
- Is never shared with third parties
- Is stored in a local SQLite database

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
