import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNativeDriver } from '@/utils/animation';
import { shadows } from '@/utils/shadow';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewProps } from 'react-native';

interface AnimatedCardProps extends ViewProps {
    index?: number;
    onPress?: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
}

/**
 * Animated Card Component
 *
 * Features:
 * - Staggered entrance animation
 * - Press feedback with scale animation
 * - iOS-style subtle shadow
 */
export function AnimatedCard({
    style,
    children,
    index = 0,
    onPress,
    onLongPress,
    disabled = false,
    ...props
}: AnimatedCardProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const colorScheme = useColorScheme();

    const animatedValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    // iOS uses subtle shadows in light mode, subtle borders in dark mode
    const shadowStyle = colorScheme === 'dark'
        ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' }
        : {};

    useEffect(() => {
        // Staggered entrance animation
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 350,
            delay: index * 50, // Stagger based on index
            useNativeDriver,
        }).start();
    }, [animatedValue, index]);

    const handlePressIn = () => {
        if (disabled) return;
        Animated.spring(scaleValue, {
            toValue: 0.97,
            friction: 8,
            tension: 100,
            useNativeDriver,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor },
                shadowStyle,
                {
                    opacity: animatedValue,
                    transform: [
                        { scale: scaleValue },
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        },
                    ],
                },
                style,
            ]}
            {...props}
        >
            {(onPress || onLongPress) ? (
                <Pressable
                    onPress={onPress}
                    onLongPress={onLongPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled}
                    style={styles.pressable}
                >
                    {children}
                </Pressable>
            ) : (
                children
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        ...shadows.card,
    },
    pressable: {
        flex: 1,
    },
});
