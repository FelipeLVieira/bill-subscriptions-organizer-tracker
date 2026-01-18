import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { PaywallModal } from './PaywallModal';

interface GoProButtonProps {
    variant?: 'full' | 'compact' | 'banner';
    onPress?: () => void;
    style?: object;
}

export function GoProButton({ variant = 'banner', onPress, style }: GoProButtonProps) {
    const { isPro, isLoading } = usePro();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [showPaywall, setShowPaywall] = useState(false);

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
            setShowPaywall(true);
        }
    }, [onPress]);

    // Don't show if already pro
    if (isPro) {
        return null;
    }

    return (
        <>
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <Pressable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isLoading}
                    style={[
                        styles.container,
                        {
                            backgroundColor: tintColor + '10',
                            borderColor: tintColor + '20',
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

            <PaywallModal
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
});
