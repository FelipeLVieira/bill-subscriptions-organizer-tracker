import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonType = 'primary' | 'secondary' | 'danger';

type Props = TouchableOpacityProps & {
    title: string;
    type?: ButtonType;
};

/**
 * Apple-style Button Component
 *
 * Features:
 * - Solid colors (no gradients - Apple prefers flat design)
 * - iOS system colors
 * - Proper touch feedback
 * - Rounded corners matching iOS HIG
 */
export function Button({ title, type = 'primary', style, disabled, ...props }: Props) {
    const primaryColor = useThemeColor({}, 'primary');
    const interactiveColor = useThemeColor({}, 'interactive');
    const dangerColor = useThemeColor({}, 'danger');
    const cardColor = useThemeColor({}, 'card');

    const backgroundColor = type === 'danger'
        ? dangerColor
        : type === 'secondary'
            ? cardColor
            : interactiveColor;

    const buttonTextColor = type === 'secondary' ? primaryColor : '#FFFFFF';
    const secondaryBorderColor = `${primaryColor}4D`; // 30% opacity (4D in hex = 77/255 ≈ 30%)

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[{ opacity: disabled ? 0.5 : 1 }, style]}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            {...props}
        >
            <View style={[
                styles.button,
                { backgroundColor },
                type === 'secondary' && [styles.secondaryButton, { borderColor: secondaryBorderColor }]
            ]}>
                <Text style={[styles.text, { color: buttonTextColor }]}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12, // iOS standard
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        borderWidth: 1,
        // borderColor applied dynamically from theme
    },
    text: {
        fontSize: 17, // iOS standard body size
        fontWeight: '600',
        letterSpacing: -0.4, // iOS typography
    },
});
