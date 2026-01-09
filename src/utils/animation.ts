import { Platform } from 'react-native';

/**
 * Returns whether to use native driver for animations
 *
 * On web, useNativeDriver is not supported (falls back to JS anyway)
 * Setting this to false on web prevents the console warning:
 * "Animated: `useNativeDriver` is not supported because the native animated module is missing"
 *
 * On native platforms (iOS/Android), use native driver for better performance
 */
export const useNativeDriver = Platform.OS !== 'web';
