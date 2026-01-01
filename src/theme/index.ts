import { Platform } from 'react-native';

/**
 * Apple-inspired Design System
 *
 * Following Apple Human Interface Guidelines:
 * - Clean, minimal aesthetic
 * - Subtle depth and layering
 * - System-consistent typography
 * - Generous whitespace
 */
export const theme = {
    light: {
        // Backgrounds - Apple uses subtle gray tints
        background: '#F2F2F7', // iOS system background
        card: '#FFFFFF', // Pure white cards for clarity
        text: '#000000', // True black for maximum contrast
        textSecondary: '#8E8E93', // iOS secondary label

        // Brand colors
        primary: '#007AFF', // iOS system blue
        accent: '#5856D6', // iOS system indigo

        // Semantic colors (iOS system colors)
        border: 'rgba(60, 60, 67, 0.12)', // iOS separator
        success: '#34C759', // iOS system green
        warning: '#FF9500', // iOS system orange
        danger: '#FF3B30', // iOS system red

        // Status colors for bills (semantic)
        statusOverdue: '#FF3B30', // Same as danger - red for overdue
        statusOverdueBg: 'rgba(255, 59, 48, 0.12)', // Light red background
        statusUpcoming: '#FF9500', // Warning orange for upcoming
        statusUpcomingBg: 'rgba(255, 149, 0, 0.12)', // Light orange background
        statusPaid: '#34C759', // Success green for paid
        statusPaidBg: 'rgba(52, 199, 89, 0.12)', // Light green background
        statusLater: '#8E8E93', // Secondary text for later items
        statusLaterBg: 'rgba(142, 142, 147, 0.12)', // Light gray background

        // Input/Form
        inputBg: '#FFFFFF',
        infoBg: '#E5F2FF', // Light blue tint
        pickerText: '#000000',
        pickerBg: '#F2F2F7',

        // Tab bar (iOS standard)
        tint: '#007AFF',
        icon: '#8E8E93',
        tabIconDefault: '#8E8E93',
        tabIconSelected: '#007AFF',

        // Toast colors
        toastSuccess: '#34C759',
        toastError: '#FF3B30',
        toastWarning: '#FF9500',
        toastInfo: '#007AFF',
        toastBg: '#FFFFFF',

        // Gradients - subtle for Apple aesthetic
        gradients: {
            header: ['#F2F2F7', '#F2F2F7'] as const, // Flat, no gradient
            button: ['#007AFF', '#0056B3'] as const, // Subtle blue gradient
            card: ['#FFFFFF', '#FFFFFF'] as const,
        },
    },
    dark: {
        // Backgrounds - Apple dark mode uses elevated surfaces
        background: '#000000', // True black for OLED
        card: '#1C1C1E', // iOS elevated surface
        text: '#FFFFFF', // White text
        textSecondary: '#8E8E93', // iOS secondary label

        // Brand colors (brighter in dark mode)
        primary: '#0A84FF', // iOS system blue (dark)
        accent: '#5E5CE6', // iOS system indigo (dark)

        // Semantic colors (iOS dark mode)
        border: 'rgba(84, 84, 88, 0.65)', // iOS separator dark
        success: '#30D158', // iOS system green (dark)
        warning: '#FF9F0A', // iOS system orange (dark)
        danger: '#FF453A', // iOS system red (dark)

        // Status colors for bills (semantic - dark mode)
        statusOverdue: '#FF453A', // Dark mode danger red
        statusOverdueBg: 'rgba(255, 69, 58, 0.2)', // Dark red background
        statusUpcoming: '#FF9F0A', // Dark mode warning orange
        statusUpcomingBg: 'rgba(255, 159, 10, 0.2)', // Dark orange background
        statusPaid: '#30D158', // Dark mode success green
        statusPaidBg: 'rgba(48, 209, 88, 0.2)', // Dark green background
        statusLater: '#8E8E93', // Secondary text
        statusLaterBg: 'rgba(142, 142, 147, 0.2)', // Dark gray background

        // Input/Form
        inputBg: '#1C1C1E',
        infoBg: '#1C2A3A',
        pickerText: '#FFFFFF',
        pickerBg: '#2C2C2E', // iOS tertiary system fill

        // Tab bar
        tint: '#0A84FF',
        icon: '#8E8E93',
        tabIconDefault: '#8E8E93',
        tabIconSelected: '#0A84FF',

        // Toast colors
        toastSuccess: '#30D158',
        toastError: '#FF453A',
        toastWarning: '#FF9F0A',
        toastInfo: '#0A84FF',
        toastBg: '#2C2C2E',

        // Gradients
        gradients: {
            header: ['#000000', '#000000'] as const,
            button: ['#0A84FF', '#0066CC'] as const,
            card: ['#1C1C1E', '#1C1C1E'] as const,
        },
    },
};

export const Colors = theme; // Alias for compatibility

export type ThemeColors = typeof theme.light;
export type ThemeGradients = typeof theme.light.gradients;

// Placeholder to check the file content first.

export const useThemeGradient = (colorScheme: 'light' | 'dark' | null | undefined, name: keyof ThemeGradients) => {
    const t = theme[colorScheme === 'dark' ? 'dark' : 'light'];
    return t.gradients[name];
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
