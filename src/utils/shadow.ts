import { Platform, ViewStyle } from 'react-native';

interface ShadowOptions {
    color?: string;
    offsetX?: number;
    offsetY?: number;
    opacity?: number;
    radius?: number;
    elevation?: number;
}

/**
 * Creates platform-aware shadow styles
 *
 * On web, uses boxShadow (CSS standard)
 * On native, uses React Native shadow* props
 *
 * This prevents the deprecation warning:
 * "shadow*" style props are deprecated. Use "boxShadow".
 */
export function createShadow({
    color = '#000',
    offsetX = 0,
    offsetY = 2,
    opacity = 0.1,
    radius = 8,
    elevation = 4,
}: ShadowOptions = {}): ViewStyle {
    if (Platform.OS === 'web') {
        // Convert opacity to rgba for web
        // Parse hex color and apply opacity
        const hexToRgba = (hex: string, alpha: number): string => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const shadowColor = hexToRgba(color, opacity);
        return {
            boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${shadowColor}`,
        } as ViewStyle;
    }

    // Native platforms use shadow* props
    return {
        shadowColor: color,
        shadowOffset: { width: offsetX, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation,
    };
}

// Pre-defined shadow presets for common use cases
export const shadows = {
    /** Subtle card shadow - iOS style */
    card: createShadow({
        offsetY: 2,
        opacity: 0.1,
        radius: 10,
        elevation: 3,
    }),

    /** Elevated card shadow - for highlighted cards */
    cardElevated: createShadow({
        offsetY: 4,
        opacity: 0.15,
        radius: 16,
        elevation: 6,
    }),

    /** Subtle inner glow effect */
    cardGlow: createShadow({
        offsetY: 0,
        opacity: 0.08,
        radius: 20,
        elevation: 2,
    }),

    /** Medium shadow for elevated elements */
    medium: createShadow({
        offsetY: 4,
        opacity: 0.15,
        radius: 12,
        elevation: 8,
    }),

    /** Strong shadow for floating elements like FAB */
    fab: createShadow({
        offsetY: 4,
        opacity: 0.3,
        radius: 4.65,
        elevation: 8,
    }),

    /** Modal/sheet shadow */
    modal: createShadow({
        offsetY: 8,
        opacity: 0.25,
        radius: 24,
        elevation: 16,
    }),

    /** Bottom sheet shadow (shadow going up) */
    bottomSheet: createShadow({
        offsetY: -2,
        opacity: 0.1,
        radius: 10,
        elevation: 10,
    }),

    /** Tooltip shadow */
    tooltip: createShadow({
        offsetY: 4,
        opacity: 0.2,
        radius: 8,
        elevation: 6,
    }),

    /** Period selector indicator shadow */
    indicator: createShadow({
        offsetY: 1,
        opacity: 0.12,
        radius: 4,
        elevation: 2,
    }),

    /** Go Pro button shadow */
    goProButton: createShadow({
        offsetY: 1,
        opacity: 0.06,
        radius: 4,
        elevation: 2,
    }),

    /** Go Pro card shadow */
    goProCard: createShadow({
        offsetY: 2,
        opacity: 0.08,
        radius: 8,
        elevation: 3,
    }),
};
