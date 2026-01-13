import { Platform } from 'react-native';

/**
 * Minimalist Grayscale Design System
 *
 * Gender-neutral, professional aesthetic:
 * - Clean black, white, and gray palette
 * - Subtle semantic colors for status only
 * - Timeless, unisex appeal
 * - Maximum readability
 */
export const theme = {
    light: {
        // Backgrounds - Cleaner, slightly brighter
        background: '#F2F2F7', // Standard iOS system gray 6
        card: '#FFFFFF', // Pure white cards
        text: '#000000', // True black for max contrast
        textSecondary: '#8E8E93', // Standard iOS gray

        // Brand colors - Darker, more premium charcoal/black
        primary: '#000000', // True black
        accent: '#1C1C1E', // Off-black
        interactive: '#007AFF', // Standard iOS Blue for interactivity (better affordance)

        // Semantic colors - More vibrant
        border: 'rgba(60, 60, 67, 0.12)', // Slightly subtler border
        success: '#34C759', // iOS Green
        warning: '#FF9500', // iOS Orange
        danger: '#FF3B30', // iOS Red
        info: '#007AFF', // iOS Blue

        // Status colors for bills
        statusOverdue: '#FF3B30',
        statusOverdueBg: 'rgba(255, 59, 48, 0.1)',
        statusUpcoming: '#8E8E93',
        statusUpcomingBg: 'rgba(142, 142, 147, 0.1)',
        statusPaid: '#34C759',
        statusPaidBg: 'rgba(52, 199, 89, 0.1)',
        statusLater: '#AEAEB2',
        statusLaterBg: 'rgba(174, 174, 178, 0.1)',

        // Input/Form
        inputBg: '#FFFFFF',
        infoBg: '#F2F2F7',
        pickerText: '#000000',
        pickerBg: '#E5E5EA',

        // Tab bar
        tint: '#007AFF', // Active tab color (Blue)
        icon: '#8E8E93', // Inactive tab color
        tabIconDefault: '#8E8E93',
        tabIconSelected: '#007AFF',

        // Toast colors
        toastSuccess: '#34C759',
        toastError: '#FF3B30',
        toastWarning: '#8E8E93',
        toastInfo: '#000000',
        toastBg: '#FFFFFF',

        // Gradients
        gradients: {
            header: ['#F2F2F7', '#F2F2F7'] as const,
            button: ['#000000', '#1C1C1E'] as const,
            card: ['#FFFFFF', '#FFFFFF'] as const,
        },
    },
    dark: {
        // Backgrounds - True black and dark grays
        background: '#000000', // True black for OLED
        card: '#1C1C1E', // Dark gray cards
        text: '#FFFFFF', // Pure white text
        textSecondary: '#8E8E93', // Medium gray

        // Brand colors - Keep charcoal for interactive elements in dark mode
        primary: '#F5F5F7', // Light gray primary for text emphasis (improved contrast)
        accent: '#C7C7CC', // Brighter gray accent (improved contrast)
        interactive: '#636366', // For buttons, toggles, FAB - brighter gray for visibility

        // Semantic colors
        border: 'rgba(84, 84, 88, 0.65)',
        success: '#30D158', // Green
        warning: '#FF9F0A', // Orange/yellow for pending/upcoming
        danger: '#FF453A', // Red
        info: '#0A84FF', // Blue for total/info

        // Status colors for bills - Dark mode
        statusOverdue: '#FF453A',
        statusOverdueBg: 'rgba(255, 69, 58, 0.15)',
        statusUpcoming: '#8E8E93',
        statusUpcomingBg: 'rgba(142, 142, 147, 0.15)',
        statusPaid: '#30D158',
        statusPaidBg: 'rgba(48, 209, 88, 0.15)',
        statusLater: '#636366',
        statusLaterBg: 'rgba(99, 99, 102, 0.15)',

        // Input/Form
        inputBg: '#1C1C1E',
        infoBg: '#2C2C2E',
        pickerText: '#FFFFFF',
        pickerBg: '#2C2C2E',

        // Tab bar - Grayscale
        tint: '#FFFFFF',
        icon: '#636366',
        tabIconDefault: '#636366',
        tabIconSelected: '#FFFFFF',

        // Toast colors
        toastSuccess: '#30D158',
        toastError: '#FF453A',
        toastWarning: '#8E8E93',
        toastInfo: '#FFFFFF',
        toastBg: '#2C2C2E',

        // Gradients
        gradients: {
            header: ['#000000', '#000000'] as const,
            button: ['#FFFFFF', '#E5E5EA'] as const,
            card: ['#1C1C1E', '#1C1C1E'] as const,
        },
    },
};

export const Colors = theme; // Alias for compatibility

export type ThemeColors = typeof theme.light;
export type ThemeGradients = typeof theme.light.gradients;

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
