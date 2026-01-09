import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface GoProButtonProps {
    variant?: 'full' | 'compact' | 'banner';
    onPress?: () => void;
    style?: object;
}

export function GoProButton({ variant = 'full', onPress, style }: GoProButtonProps) {
    const router = useRouter();
    const { isPro, isLoading } = usePro();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Theme colors for professional look
    const infoColor = useThemeColor({}, 'info');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const textSecondary = useThemeColor({}, 'textSecondary');

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

    if (variant === 'compact') {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <Pressable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isLoading}
                    style={[styles.compactButton, { backgroundColor: infoColor }]}
                    accessibilityLabel={i18n.t('goPro')}
                    accessibilityRole="button"
                >
                    <IconSymbol name="sparkles" size={16} color="#FFFFFF" />
                </Pressable>
            </Animated.View>
        );
    }

    if (variant === 'banner') {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <Pressable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isLoading}
                    style={[
                        styles.bannerContainer,
                        {
                            backgroundColor: cardColor,
                            borderColor: borderColor,
                        }
                    ]}
                >
                    <View style={styles.bannerContent}>
                        <View style={[styles.bannerIconWrapper, { backgroundColor: infoColor + '12' }]}>
                            <IconSymbol name="sparkles" size={22} color={infoColor} />
                        </View>
                        <View style={styles.bannerTextContainer}>
                            <ThemedText style={styles.bannerTitle}>{i18n.t('goPro')}</ThemedText>
                            <ThemedText style={[styles.bannerSubtitle, { color: textSecondary }]}>
                                {i18n.t('removeAdsUnlockFeatures')}
                            </ThemedText>
                        </View>
                        <View style={[styles.bannerArrow, { backgroundColor: infoColor }]}>
                            <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // Full variant (default) - Professional card style
    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                style={[
                    styles.fullContainer,
                    {
                        backgroundColor: cardColor,
                        borderColor: borderColor,
                    }
                ]}
            >
                <View style={styles.fullContent}>
                    <View style={[styles.fullIconWrapper, { backgroundColor: infoColor + '12' }]}>
                        <IconSymbol name="sparkles" size={28} color={infoColor} />
                    </View>
                    <View style={styles.fullTextContainer}>
                        <ThemedText style={styles.fullTitle}>{i18n.t('upgradeToPro')}</ThemedText>
                        <ThemedText style={[styles.fullSubtitle, { color: textSecondary }]}>
                            {i18n.t('noAdsMoreFeatures')}
                        </ThemedText>
                    </View>
                    <View style={[styles.fullArrow, { backgroundColor: infoColor }]}>
                        <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // Compact variant (icon only)
    compactButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Banner variant - Clean card style
    bannerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        ...shadows.goProButton,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bannerIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerTextContainer: {
        flex: 1,
        gap: 2,
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    bannerSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    bannerArrow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Full variant - Professional card
    fullContainer: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        ...shadows.goProCard,
    },
    fullContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    fullIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullTextContainer: {
        flex: 1,
        gap: 3,
    },
    fullTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    fullSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    fullArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
