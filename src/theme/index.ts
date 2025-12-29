import { Platform } from 'react-native';

export const theme = {
    light: {
        background: '#F5F7FA', // Cool gray-white
        card: '#FFFFFF',
        text: '#1F2937', // Soft charcoal
        textSecondary: '#6B7280',
        primary: '#2563EB', // Vibrant Blue
        accent: '#4F46E5', // Indigo
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        inputBg: '#FFFFFF',
        infoBg: '#E0E7FF',
        // Template compatibility
        tint: '#2563EB',
        icon: '#6B7280',
        tabIconDefault: '#6B7280',
        tabIconSelected: '#2563EB',
    },
    dark: {
        background: '#111827', // Rich dark gray
        card: '#1F2937', // Lighter dark gray
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        primary: '#3B82F6', // Lighter blue for dark mode
        accent: '#6366F1',
        border: '#374151',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
        inputBg: '#374151',
        infoBg: '#1E1E2E',
        // Template compatibility
        tint: '#3B82F6',
        icon: '#9CA3AF',
        tabIconDefault: '#9CA3AF',
        tabIconSelected: '#3B82F6',
    },
};

export const Colors = theme; // Alias for compatibility

export type ThemeColors = typeof theme.light;

export const useThemeColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
    return theme[colorScheme === 'dark' ? 'dark' : 'light'];
};

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
