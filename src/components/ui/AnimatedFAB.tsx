import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Haptic } from '@/utils/haptics';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedFABProps {
    onPress: () => void;
    icon?: string;
    accessibilityLabel: string;
    style?: ViewStyle;
}

/**
 * Animated Floating Action Button
 *
 * Features:
 * - Entrance animation with scale and rotate
 * - Press feedback with scale and shadow animation
 * - iOS-style shadow
 */
export function AnimatedFAB({
    onPress,
    icon = 'plus',
    accessibilityLabel,
    style,
}: AnimatedFABProps) {
    const primaryColor = useThemeColor({}, 'primary');

    const entranceValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.spring(entranceValue, {
            toValue: 1,
            friction: 6,
            tension: 50,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, [entranceValue]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.9,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = async () => {
        await Haptic.medium();
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                style,
                {
                    transform: [
                        {
                            scale: Animated.multiply(entranceValue, scaleValue),
                        },
                        {
                            rotate: rotateValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '45deg'],
                            }),
                        },
                    ],
                    opacity: entranceValue,
                },
            ]}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.fab, { backgroundColor: primaryColor }]}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
            >
                <IconSymbol name={icon as any} size={28} color="#FFFFFF" />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 24,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        // iOS-style shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
