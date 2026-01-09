import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { IAPService } from '@/services/IAPService';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isPro } = usePro();
    const [loading, setLoading] = useState(false);

    const cardBg = useThemeColor({}, 'card');
    const infoColor = useThemeColor({}, 'info');
    const successColor = useThemeColor({}, 'statusPaid');
    const secondaryText = useThemeColor({}, 'textSecondary');
    const borderColor = useThemeColor({}, 'border');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Feature row animations
    const featureAnims = useRef([
        new Animated.Value(0),
    ]).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver,
            }),
        ]).start();

        // Stagger feature rows
        featureAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                delay: 200 + index * 80,
                useNativeDriver,
            }).start();
        });
    }, [fadeAnim, slideAnim, scaleAnim, featureAnims]);

    const handlePurchase = async () => {
        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver,
            }),
            Animated.spring(buttonScale, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver,
            }),
        ]).start();

        setLoading(true);
        await Haptic.medium();
        try {
            await IAPService.purchaseRemoveAds();
            await Haptic.success();
            Alert.alert(i18n.t('success'), i18n.t('purchaseSuccess'));
            router.back();
        } catch {
            await Haptic.error();
            Alert.alert(i18n.t('error'), i18n.t('purchaseFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        await Haptic.light();
        try {
            const restored = await IAPService.restorePurchases();
            if (restored) {
                await Haptic.success();
                Alert.alert(i18n.t('success'), i18n.t('restoreSuccess'));
                router.back();
            } else {
                Alert.alert(i18n.t('error'), i18n.t('restoreFailed'));
            }
        } catch {
            await Haptic.error();
            Alert.alert(i18n.t('error'), i18n.t('restoreFailed'));
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: 'xmark.circle.fill', text: i18n.t('proBenefit1') },
    ];

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            {/* Close button */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: cardBg }]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <IconSymbol name="xmark" size={18} color={secondaryText} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Hero Section */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                        },
                    ]}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: infoColor + '15' }]}>
                        <IconSymbol name="sparkles" size={48} color={infoColor} />
                    </View>
                    <ThemedText style={styles.title}>
                        {i18n.t('goPro')}
                    </ThemedText>
                    <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
                        {i18n.t('removeAdsUnlockFeatures')}
                    </ThemedText>
                </Animated.View>

                {/* Features List */}
                <Animated.View
                    style={[
                        styles.featuresCard,
                        { backgroundColor: cardBg, opacity: fadeAnim },
                    ]}
                >
                    {features.map((feature, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.featureRow,
                                index < features.length - 1 && {
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderBottomColor: borderColor,
                                },
                                {
                                    opacity: featureAnims[index],
                                    transform: [{
                                        translateX: featureAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    }],
                                },
                            ]}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: successColor + '15' }]}>
                                <IconSymbol
                                    name="checkmark.circle.fill"
                                    size={22}
                                    color={successColor}
                                />
                            </View>
                            <ThemedText style={styles.featureText}>
                                {feature.text}
                            </ThemedText>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Pricing Card */}
                <Animated.View
                    style={[
                        styles.pricingCard,
                        {
                            backgroundColor: infoColor + '08',
                            borderColor: infoColor + '30',
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.priceRow}>
                        <ThemedText style={[styles.currency, { color: successColor }]}>$</ThemedText>
                        <ThemedText style={[styles.price, { color: successColor }]}>4.99</ThemedText>
                        <ThemedText style={[styles.period, { color: secondaryText }]}>/month</ThemedText>
                    </View>
                    <ThemedText style={[styles.priceSubtext, { color: secondaryText, opacity: 0.7 }]}>
                        {i18n.t('cancelAnytime')}
                    </ThemedText>
                </Animated.View>
            </View>

            {/* Bottom Actions */}
            <Animated.View
                style={[
                    styles.bottomActions,
                    { paddingBottom: insets.bottom + 20, opacity: fadeAnim },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        style={[
                            styles.purchaseButton,
                            { backgroundColor: infoColor },
                            (loading || isPro) && { opacity: 0.6 },
                        ]}
                        onPress={handlePurchase}
                        disabled={loading || isPro}
                        activeOpacity={0.9}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ThemedText style={styles.purchaseButtonText}>
                                {isPro ? i18n.t('alreadyPurchased') : i18n.t('subscribeNow')}
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    onPress={handleRestore}
                    style={styles.restoreButton}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <ThemedText style={[styles.restoreText, { color: secondaryText }]}>
                        {i18n.t('restorePurchases')}
                    </ThemedText>
                </TouchableOpacity>

                <ThemedText style={[styles.termsText, { color: secondaryText, opacity: 0.6 }]}>
                    {i18n.t('subscriptionTerms')}
                </ThemedText>
            </Animated.View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        gap: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 16,
        gap: 8,
    },
    iconWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresCard: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 16,
        flex: 1,
    },
    pricingCard: {
        alignItems: 'center',
        padding: 24,
        paddingVertical: 20,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 2,
    },
    price: {
        fontSize: 56,
        fontWeight: '700',
        letterSpacing: -2,
    },
    period: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 4,
    },
    priceSubtext: {
        fontSize: 13,
        marginTop: 4,
    },
    bottomActions: {
        padding: 20,
        gap: 12,
    },
    purchaseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 14,
    },
    purchaseButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    restoreButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    restoreText: {
        fontSize: 15,
        fontWeight: '500',
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
});
