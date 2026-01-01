import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View, ViewProps } from 'react-native';

type Props = ViewProps;

/**
 * Apple-style Card Component
 *
 * Features:
 * - Clean white/dark background
 * - Subtle shadow for depth (iOS style)
 * - Rounded corners matching iOS HIG
 * - No visible border in light mode
 */
export function Card({ style, ...props }: Props) {
    const backgroundColor = useThemeColor({}, 'card');
    const colorScheme = useColorScheme();

    // iOS uses subtle shadows in light mode, subtle borders in dark mode
    const shadowStyle = colorScheme === 'dark'
        ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' }
        : {};

    return (
        <View style={[styles.card, { backgroundColor }, shadowStyle, style]} {...props} />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        // iOS-style subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
});
