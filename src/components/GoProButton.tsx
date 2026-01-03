import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface GoProButtonProps {
    variant?: 'full' | 'compact' | 'banner';
    onPress?: () => void;
    style?: object;
}

export function GoProButton({ variant = 'full', onPress, style }: GoProButtonProps) {
    const { isPro, purchasePro, isLoading } = usePro();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 100,
        }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(async () => {
        await Haptic.medium();
        if (onPress) {
            onPress();
        } else {
            try {
                await purchasePro();
                await Haptic.success();
            } catch {
                await Haptic.error();
            }
        }
    }, [onPress, purchasePro]);

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
                    style={styles.compactButton}
                >
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.compactGradient}
                    >
                        <IconSymbol name="crown.fill" size={16} color="#FFFFFF" />
                    </LinearGradient>
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
                >
                    <LinearGradient
                        colors={['#5856D6', '#AF52DE']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bannerGradient}
                    >
                        <View style={styles.bannerContent}>
                            <View style={styles.bannerLeft}>
                                <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                                <View style={styles.bannerTextContainer}>
                                    <ThemedText style={styles.bannerTitle}>{i18n.t('goPro')}</ThemedText>
                                    <ThemedText style={styles.bannerSubtitle}>{i18n.t('removeAdsUnlockFeatures')}</ThemedText>
                                </View>
                            </View>
                            <IconSymbol name="chevron.right" size={18} color="#FFFFFF" style={{ opacity: 0.8 }} />
                        </View>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        );
    }

    // Full variant (default)
    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
            >
                <LinearGradient
                    colors={['#5856D6', '#AF52DE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fullGradient}
                >
                    <View style={styles.fullContent}>
                        <IconSymbol name="crown.fill" size={24} color="#FFD700" />
                        <View style={styles.fullTextContainer}>
                            <ThemedText style={styles.fullTitle}>{i18n.t('upgradeToPro')}</ThemedText>
                            <ThemedText style={styles.fullSubtitle}>{i18n.t('noAdsMoreFeatures')}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                    </View>
                </LinearGradient>
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
        overflow: 'hidden',
    },
    compactGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Banner variant
    bannerGradient: {
        borderRadius: 12,
        padding: 14,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bannerTextContainer: {
        gap: 2,
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },

    // Full variant
    fullGradient: {
        borderRadius: 16,
        padding: 16,
    },
    fullContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    fullTextContainer: {
        flex: 1,
        gap: 2,
    },
    fullTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    fullSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
});
