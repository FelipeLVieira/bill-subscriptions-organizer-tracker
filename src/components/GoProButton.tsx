import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
// Actually, BMI calc uses spacing constants. I'll hardcode or define them locally to keep it self-contained or use the new responsive utility if I exported constants.
// For now, I'll stick to hardcoded values close to the BMI design to ensure 1:1 match visually.

interface GoProButtonProps {
    variant?: 'full' | 'compact' | 'banner';
    onPress?: () => void;
    style?: object;
}

export function GoProButton({ variant = 'banner', onPress, style }: GoProButtonProps) {
    const router = useRouter();
    const { isPro, isLoading } = usePro();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Theme colors
    const textColor = useThemeColor({}, 'text');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const tintColor = useThemeColor({}, 'tint');

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver,
            friction: 8,
            tension: 100,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver,
            friction: 6,
            tension: 100,
        }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(async () => {
        await Haptic.medium();
        if (onPress) {
            onPress();
        } else {
            router.push('/paywall');
        }
    }, [onPress, router]);

    // Don't show if already pro
    if (isPro) {
        return null;
    }

    // BMI Calculator Style "GoPremiumBanner"
    // It creates a row with: Icon Container (Sparkles) | Text (Title + Chevron)
    // The BMI one used: 
    // container: { flexDirection: 'row', alignItems: 'center', paddingVertical: sm, paddingHorizontal: md, borderRadius: md, borderWidth: 1, gap: sm }
    // iconContainer: { width: xxl, height: xxl, borderRadius: xs, justifyContent: 'center', alignItems: 'center' }

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                style={[
                    styles.container,
                    {
                        backgroundColor: tintColor + '10', // 10% opacity
                        borderColor: tintColor + '20',    // 20% opacity
                    }
                ]}
                accessibilityLabel={i18n.t('premium.removeAds')}
                accessibilityRole="button"
            >
                <View style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
                    <Ionicons name="sparkles" size={20} color={tintColor} />
                </View>
                <ThemedText style={[styles.title, { color: textColor }]}>
                    {i18n.t('premium.removeAds')}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={textSecondary} />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // spacing.sm (approx 8-12)
        paddingHorizontal: 16, // spacing.md (approx 16)
        borderRadius: 12, // radius.md
        borderWidth: 1,
        gap: 12, // spacing.sm
    },
    iconContainer: {
        width: 40, // spacing.xxl (approx 40-48)
        height: 40,
        borderRadius: 8, // radius.xs
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16, // typography.size.body
        fontWeight: '500', // typography.weight.medium
        flex: 1,
    },
});
