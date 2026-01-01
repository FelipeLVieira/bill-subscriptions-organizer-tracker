import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps;

/**
 * Apple-style Text Input
 *
 * Features:
 * - iOS system background colors
 * - No visible border (relies on background contrast)
 * - Proper typography sizing
 * - Rounded corners matching iOS HIG
 */
export function Input({ style, multiline, ...props }: Props) {
    const colorScheme = useColorScheme();
    const color = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'textSecondary');

    // iOS uses subtle gray backgrounds for inputs
    const backgroundColor = colorScheme === 'dark'
        ? 'rgba(118, 118, 128, 0.12)'
        : 'rgba(118, 118, 128, 0.12)';

    return (
        <TextInput
            style={[
                styles.input,
                { backgroundColor, color },
                multiline && styles.multiline,
                style
            ]}
            placeholderTextColor={placeholderColor}
            multiline={multiline}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        height: 44, // iOS standard
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 17, // iOS body size
        letterSpacing: -0.4,
    },
    multiline: {
        height: 'auto',
        minHeight: 80,
        paddingTop: 12,
        paddingBottom: 12,
        textAlignVertical: 'top',
    },
});
