import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    error?: string;
    touched?: boolean;
    containerStyle?: any;
    inputStyle?: any;
    showBorder?: boolean;
}

/**
 * Apple-style Text Input
 *
 * Features:
 * - iOS system background colors
 * - Inline error messages with shake animation
 * - No visible border (relies on background contrast)
 * - Proper typography sizing
 * - Rounded corners matching iOS HIG
 */
export function Input({ style, multiline, error, touched, inputStyle, showBorder = true, ...props }: InputProps) {
    const colorScheme = useColorScheme();
    const color = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'textSecondary');
    const dangerColor = useThemeColor({}, 'danger');
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const hasError = touched && error;

    // iOS uses subtle gray backgrounds for inputs
    const backgroundColor = showBorder
        ? (colorScheme === 'dark' ? 'rgba(118, 118, 128, 0.12)' : 'rgba(118, 118, 128, 0.12)')
        : 'transparent';

    // Shake animation when error appears (native only - web doesn't support useNativeDriver well)
    useEffect(() => {
        if (hasError && Platform.OS !== 'web') {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [hasError, shakeAnim]);

    return (
        <View style={props.containerStyle}>
            <Animated.View style={Platform.OS !== 'web' ? { transform: [{ translateX: shakeAnim }] } : undefined}>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor, color },
                        multiline && styles.multiline,
                        !showBorder && styles.noBorder,
                        hasError && { borderWidth: 1, borderColor: dangerColor },
                        style,
                        inputStyle,
                    ]}
                    placeholderTextColor={placeholderColor}
                    multiline={multiline}
                    {...props}
                />
            </Animated.View>
            {hasError && (
                <ThemedText style={[styles.errorText, { color: dangerColor }]}>
                    {error}
                </ThemedText>
            )}
        </View>
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
    noBorder: {
        paddingHorizontal: 0,
        borderRadius: 0,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
