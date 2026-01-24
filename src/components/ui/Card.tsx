import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { shadows } from '@/utils/shadow';
import { StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    /** Elevated style with stronger shadow */
    elevated?: boolean;
    /** Glowing style for highlighted cards */
    glow?: boolean;
}

/**
 * Apple-style Card Component
 *
 * Features:
 * - Clean white/dark background
 * - Subtle shadow for depth (iOS style)
 * - Rounded corners matching iOS HIG
 * - Subtle border in dark mode for definition
 * - Optional elevated and glow variants
 */
export function Card({ style, elevated, glow, ...props }: CardProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const colorScheme = useColorScheme();

    // iOS uses subtle shadows in light mode, subtle borders in dark mode
    const shadowStyle = colorScheme === 'dark'
        ? {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(255,255,255,0.08)',
          }
        : {};

    // Choose shadow based on variant
    const shadow = glow
        ? shadows.cardGlow
        : elevated
            ? shadows.cardElevated
            : shadows.card;

    return (
        <View
            style={[
                styles.card,
                shadow,
                { backgroundColor },
                shadowStyle,
                style
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 14,
        overflow: 'hidden',
    },
});
