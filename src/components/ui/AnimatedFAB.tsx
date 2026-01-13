import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Fallback tab bar height
const FALLBACK_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;
const AD_BANNER_HEIGHT = 60; // Approximate banner ad height

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
    const interactiveColor = useThemeColor({}, 'interactive');
    const { shouldShowBannerAd } = usePro();
    const insets = useSafeAreaInsets();

    // Calculate bottom offset based on safe area + fixed amount to ensure visibility
    // Using fixed 10px base offset to sit just above the tab bar area
    const bottomOffset = insets.bottom + 10 + (shouldShowBannerAd ? AD_BANNER_HEIGHT : 0);

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
            useNativeDriver,
        }).start();
    }, [entranceValue]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.9,
                friction: 8,
                tension: 100,
                useNativeDriver,
            }),
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver,
            }),
            Animated.timing(rotateValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver,
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
                { bottom: bottomOffset },
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
                style={[styles.fab, { backgroundColor: interactiveColor }]}
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
        right: 24,
        zIndex: 100,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.fab,
    },
});
