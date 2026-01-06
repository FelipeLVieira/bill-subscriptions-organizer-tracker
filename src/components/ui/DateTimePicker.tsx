// Cross-platform DateTimePicker wrapper
// Uses native picker on iOS/Android, HTML inputs on web

import { Platform } from 'react-native';

// Re-export the native picker for iOS/Android
export { default } from '@react-native-community/datetimepicker';
export * from '@react-native-community/datetimepicker';
