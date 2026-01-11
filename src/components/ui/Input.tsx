import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, TextInput, TextInputProps, View, Animated, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useEffect, useRef } from 'react';

interface InputProps extends TextInputProps {
    error?: string;
    touched?: boolean;
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
export function Input({ style, multiline, error, touched, ...props }: InputProps) {
    const colorScheme = useColorScheme();
    const color = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'textSecondary');
    const dangerColor = useThemeColor({}, 'danger');
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const hasError = touched && error;

    // iOS uses subtle gray backgrounds for inputs
    const backgroundColor = colorScheme === 'dark'
        ? 'rgba(118, 118, 128, 0.12)'
        : 'rgba(118, 118, 128, 0.12)';

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
        <View>
            <Animated.View style={Platform.OS !== 'web' ? { transform: [{ translateX: shakeAnim }] } : undefined}>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor, color },
                        multiline && styles.multiline,
                        hasError && { borderWidth: 1, borderColor: dangerColor },
                        style
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
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
