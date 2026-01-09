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
        // Backgrounds - Clean whites and light grays
        background: '#F5F5F7', // Light gray background
        card: '#FFFFFF', // Pure white cards
        text: '#1C1C1E', // Near-black text
        textSecondary: '#6E6E73', // Medium gray

        // Brand colors - Neutral charcoal as primary
        primary: '#1C1C1E', // Charcoal black
        accent: '#3A3A3C', // Dark gray accent
        interactive: '#1C1C1E', // For buttons, toggles, FAB - stays dark

        // Semantic colors - Muted, professional
        border: 'rgba(60, 60, 67, 0.18)', // Subtle gray border
        success: '#34C759', // Keep green for success (universal)
        warning: '#FF9500', // Orange/yellow for pending/upcoming
        danger: '#FF3B30', // Keep red for danger (universal)
        info: '#007AFF', // Blue for total/info

        // Status colors for bills - Mostly grayscale with semantic hints
        statusOverdue: '#FF3B30', // Red for overdue (important)
        statusOverdueBg: 'rgba(255, 59, 48, 0.08)',
        statusUpcoming: '#6E6E73', // Gray for upcoming
        statusUpcomingBg: 'rgba(110, 110, 115, 0.08)',
        statusPaid: '#34C759', // Green for paid (positive)
        statusPaidBg: 'rgba(52, 199, 89, 0.08)',
        statusLater: '#AEAEB2', // Light gray for later
        statusLaterBg: 'rgba(174, 174, 178, 0.08)',

        // Input/Form
        inputBg: '#FFFFFF',
        infoBg: '#F5F5F7',
        pickerText: '#1C1C1E',
        pickerBg: '#E5E5EA',

        // Tab bar - Grayscale
        tint: '#1C1C1E',
        icon: '#AEAEB2',
        tabIconDefault: '#AEAEB2',
        tabIconSelected: '#1C1C1E',

        // Toast colors
        toastSuccess: '#34C759',
        toastError: '#FF3B30',
        toastWarning: '#6E6E73',
        toastInfo: '#1C1C1E',
        toastBg: '#FFFFFF',

        // Gradients - Flat, no gradients
        gradients: {
            header: ['#F5F5F7', '#F5F5F7'] as const,
            button: ['#1C1C1E', '#3A3A3C'] as const,
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
        primary: '#E5E5EA', // Light gray primary for text emphasis
        accent: '#AEAEB2', // Medium gray accent
        interactive: '#3A3A3C', // For buttons, toggles, FAB - dark gray in dark mode

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
