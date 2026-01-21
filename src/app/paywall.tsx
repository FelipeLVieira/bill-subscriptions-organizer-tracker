import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { calculateYearlySavings, formatPrice, getManagementURL, getMonthlyPackage, getSubscriptionPeriod, getYearlyPackage } from '@/services/purchases';
import { Haptic } from '@/utils/haptics';
import { isTablet, scale } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Make sure to export this as default since it's a screen
export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isPro, purchasePro, restorePurchases, offerings, loadOfferings, offeringsError } = usePro();
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // UI Theme Colors
    const primaryColor = useThemeColor({}, 'buttonPrimary'); // iOS Blue for buttons
    const textColor = useThemeColor({}, 'text');
    const secondaryText = useThemeColor({}, 'textSecondary');
    const borderColor = useThemeColor({}, 'border');
    const inputBg = useThemeColor({}, 'inputBg');
    const buttonText = useThemeColor({}, 'buttonText');

    const tablet = isTablet();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
    const [yearlyPkg, setYearlyPkg] = useState<PurchasesPackage | null>(null);
    const [yearlySavings, setYearlySavings] = useState<number>(0);

    // Load offerings on mount
    useEffect(() => {
        loadOfferings();
    }, [loadOfferings]);

    // Extract packages from offering
    useEffect(() => {
        if (offerings) {
            const monthly = getMonthlyPackage(offerings);
            const yearly = getYearlyPackage(offerings);

            setMonthlyPkg(monthly);
            setYearlyPkg(yearly);

            if (monthly && yearly) {
                setYearlySavings(calculateYearlySavings(monthly, yearly));
            }
        }
    }, [offerings]);

    const handleSubscribe = async () => {
        setPurchaseLoading(true);
        const pkg = getSelectedPackage();
        try {
            await Haptic.medium();
            // purchasePro returns void on success, throws on error
            await purchasePro(pkg || undefined);

            await Haptic.success();
            Alert.alert(i18n.t('success'), i18n.t('premium.purchaseSuccess'));
            router.back();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage !== 'CANCELLED') {
                await Haptic.error();
                Alert.alert(i18n.t('error'), i18n.t('premium.purchaseFailed'));
            }
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleRestorePurchases = async () => {
        setPurchaseLoading(true);
        try {
            await Haptic.light();
            const success = await restorePurchases();
            if (success) {
                await Haptic.success();
                Alert.alert(i18n.t('success'), i18n.t('premium.restoreSuccess'));
                router.back();
            } else {
                Alert.alert(i18n.t('error'), i18n.t('premium.restoreFailed'));
            }
        } catch {
            await Haptic.error();
            Alert.alert(i18n.t('error'), i18n.t('premium.restoreFailed'));
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        const url = await getManagementURL();
        if (url) {
            Linking.openURL(url);
        }
    };

    const getSelectedPackage = (): PurchasesPackage | null => {
        switch (selectedPlan) {
            case 'monthly':
                return monthlyPkg;
            case 'yearly':
                return yearlyPkg;
            default:
                return yearlyPkg || monthlyPkg;
        }
    };

    const selectedPackage = getSelectedPackage();

    // If user is already premium, show thank you message
    // Note: In the BMI app, this was a modal, here it's a screen. 
    // We can just render the "Already Premium" state cleanly.
    if (isPro) {
        return (
            <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.navBar}>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: inputBg }]}
                        onPress={() => router.back()}
                    >
                        <IconSymbol name="xmark" size={scale(18)} color={textColor} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.alreadyPremiumContainer, tablet && styles.tabletContent]}>
                    <View style={[styles.iconContainer, { backgroundColor: '#4CD964' + '20' }]}>
                        <IconSymbol name="checkmark.circle.fill" size={scale(48)} color="#4CD964" />
                    </View>

                    <ThemedText style={[styles.title]}>
                        {i18n.t('premium.alreadyPremium')}
                    </ThemedText>

                    <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
                        {i18n.t('premium.thankYou')}
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.manageButton, { borderColor: borderColor }]}
                        onPress={handleManageSubscription}
                    >
                        <ThemedText style={[styles.manageButtonText, { color: primaryColor }]}>
                            {i18n.t('premium.manageSubscription')}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.subscribeButton, { backgroundColor: primaryColor, marginTop: scale(20) }]}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={[styles.subscribeText, { color: buttonText }]}>{i18n.t('common.close')}</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Nav Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: inputBg }]}
                    onPress={() => router.back()}
                    disabled={purchaseLoading}
                >
                    <IconSymbol name="xmark" size={scale(18)} color={textColor} />
                </TouchableOpacity>
            </View>

            <View style={[styles.content, tablet && styles.tabletContent]}>
                {/* Crown icon */}
                <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
                    <IconSymbol name="sparkles" size={scale(48)} color={primaryColor} />
                </View>

                {/* Title */}
                <ThemedText style={[styles.title]}>
                    {i18n.t('premium.title')}
                </ThemedText>

                {/* Subtitle */}
                <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
                    {i18n.t('premium.subtitle')}
                </ThemedText>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.featureRow}>
                        <IconSymbol name="checkmark.circle.fill" size={scale(24)} color="#4CD964" />
                        <ThemedText style={[styles.featureText]}>
                            {i18n.t('premium.feature1')}
                        </ThemedText>
                    </View>
                    <View style={styles.featureRow}>
                        <IconSymbol name="checkmark.circle.fill" size={scale(24)} color="#4CD964" />
                        <ThemedText style={[styles.featureText]}>
                            {i18n.t('premium.feature2')}
                        </ThemedText>
                    </View>
                </View>

                {/* Plan Selection */}
                {offerings ? (
                    <View style={styles.planSelection}>
                        {/* Yearly Plan - Best Value */}
                        {yearlyPkg && (
                            <TouchableOpacity
                                style={[
                                    styles.planOption,
                                    {
                                        borderColor: selectedPlan === 'yearly' ? primaryColor : borderColor,
                                        backgroundColor: selectedPlan === 'yearly' ? primaryColor + '10' : 'transparent',
                                    },
                                ]}
                                onPress={() => setSelectedPlan('yearly')}
                                disabled={purchaseLoading}
                            >
                                {yearlySavings > 0 && (
                                    <View style={[styles.savingsBadge, { backgroundColor: primaryColor }]}>
                                        <ThemedText style={styles.savingsText}>
                                            {i18n.t('premium.save', { percent: yearlySavings })}
                                        </ThemedText>
                                    </View>
                                )}
                                <View style={styles.planInfo}>
                                    <ThemedText style={[styles.planName]}>
                                        {i18n.t('premium.yearly')}
                                    </ThemedText>
                                    <ThemedText style={[styles.planPrice, { color: primaryColor }]}>
                                        {formatPrice(yearlyPkg)}{getSubscriptionPeriod(yearlyPkg)}
                                    </ThemedText>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    {
                                        borderColor: selectedPlan === 'yearly' ? primaryColor : borderColor,
                                        backgroundColor: selectedPlan === 'yearly' ? primaryColor : 'transparent',
                                    },
                                ]}>
                                    {selectedPlan === 'yearly' && (
                                        <IconSymbol name="checkmark" size={scale(14)} color="#fff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Monthly Plan */}
                        {monthlyPkg && (
                            <TouchableOpacity
                                style={[
                                    styles.planOption,
                                    {
                                        borderColor: selectedPlan === 'monthly' ? primaryColor : borderColor,
                                        backgroundColor: selectedPlan === 'monthly' ? primaryColor + '10' : 'transparent',
                                    },
                                ]}
                                onPress={() => setSelectedPlan('monthly')}
                                disabled={purchaseLoading}
                            >
                                <View style={styles.planInfo}>
                                    <ThemedText style={[styles.planName]}>
                                        {i18n.t('premium.monthly')}
                                    </ThemedText>
                                    <ThemedText style={[styles.planPrice, { color: primaryColor }]}>
                                        {formatPrice(monthlyPkg)}{getSubscriptionPeriod(monthlyPkg)}
                                    </ThemedText>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    {
                                        borderColor: selectedPlan === 'monthly' ? primaryColor : borderColor,
                                        backgroundColor: selectedPlan === 'monthly' ? primaryColor : 'transparent',
                                    },
                                ]}>
                                    {selectedPlan === 'monthly' && (
                                        <IconSymbol name="checkmark" size={scale(14)} color="#fff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}

                    </View>
                ) : offeringsError ? (
                    <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.triangle" size={scale(48)} color="#FF9500" />
                        <ThemedText style={[styles.errorText, { color: textColor }]}>
                            {offeringsError}
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: primaryColor }]}
                            onPress={loadOfferings}
                            disabled={purchaseLoading}
                        >
                            <ThemedText style={[styles.retryButtonText, { color: buttonText }]}>
                                {i18n.t('common.retry') || 'Retry'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={primaryColor} />
                        <ThemedText style={[styles.loadingText, { color: secondaryText }]}>
                            {i18n.t('premium.loadingProducts')}
                        </ThemedText>
                    </View>
                )}

                {/* Buttons Container aligned to bottom */}
                <View style={styles.bottomContainer}>
                    {/* Subscribe Button */}
                    <TouchableOpacity
                        style={[
                            styles.subscribeButton,
                            {
                                backgroundColor: primaryColor,
                                opacity: purchaseLoading || !selectedPackage ? 0.7 : 1,
                            },
                        ]}
                        onPress={handleSubscribe}
                        disabled={purchaseLoading || !selectedPackage}
                    >
                        {purchaseLoading ? (
                            <ActivityIndicator color={buttonText} />
                        ) : (
                            <ThemedText style={[styles.subscribeText, { color: buttonText }]}>
                                {i18n.t('premium.subscribe')}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    {/* Restore Button */}
                    <TouchableOpacity
                        style={styles.restoreButton}
                        onPress={handleRestorePurchases}
                        disabled={purchaseLoading}
                    >
                        <ThemedText style={[styles.restoreText, { color: primaryColor }]}>
                            {i18n.t('premium.restore')}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Terms */}
                    <ThemedText style={[styles.terms, { color: secondaryText }]}>
                        {i18n.t('premium.termsIntro')}
                    </ThemedText>
                    <View style={styles.legalLinks}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://privacy-policy-app-flax.vercel.app/bills-tracker/terms.html')}
                        >
                            <ThemedText style={[styles.legalLink, { color: primaryColor }]}>
                                {i18n.t('premium.termsOfUse')}
                            </ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={[styles.legalSeparator, { color: secondaryText }]}> | </ThemedText>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://privacy-policy-app-flax.vercel.app/bills-tracker/')}
                        >
                            <ThemedText style={[styles.legalLink, { color: primaryColor }]}>
                                {i18n.t('premium.privacyPolicy')}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(24),
    },
    tabletContent: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        // zIndex: 10,
    },
    closeButton: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: scale(16),
        marginTop: scale(10), // Added some top spacing
    },
    title: {
        fontSize: scale(24),
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: scale(8),
    },
    subtitle: {
        fontSize: scale(14),
        textAlign: 'center',
        marginBottom: scale(20),
        lineHeight: scale(20),
    },
    features: {
        marginBottom: scale(20),
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(10),
        gap: scale(12),
    },
    featureText: {
        fontSize: scale(15),
        flex: 1,
    },
    planSelection: {
        marginBottom: scale(16),
        gap: scale(10),
    },
    planOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(14),
        borderRadius: scale(12),
        borderWidth: 2,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: scale(16),
        fontWeight: '600',
    },
    planPrice: {
        fontSize: scale(14),
        marginTop: scale(2),
    },
    radioButton: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    savingsBadge: {
        position: 'absolute',
        top: scale(-10),
        right: scale(12),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(8),
    },
    savingsText: {
        color: '#fff',
        fontSize: scale(11),
        fontWeight: '700',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: scale(20),
    },
    loadingText: {
        marginTop: scale(10),
        fontSize: scale(14),
    },
    errorContainer: {
        alignItems: 'center',
        padding: scale(20),
        gap: scale(16),
    },
    errorText: {
        fontSize: scale(14),
        textAlign: 'center',
        lineHeight: scale(20),
    },
    retryButton: {
        paddingHorizontal: scale(24),
        paddingVertical: scale(12),
        borderRadius: scale(10),
    },
    retryButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
    },
    bottomContainer: {
        marginTop: 'auto',
        marginBottom: scale(10),
    },
    subscribeButton: {
        paddingVertical: scale(16),
        borderRadius: scale(14),
        alignItems: 'center',
        marginBottom: scale(12),
    },
    subscribeText: {
        fontSize: scale(18),
        fontWeight: '600',
    },
    restoreButton: {
        padding: scale(12),
        alignItems: 'center',
    },
    restoreText: {
        fontSize: scale(14),
        fontWeight: '500',
    },
    terms: {
        fontSize: scale(11),
        textAlign: 'center',
        lineHeight: scale(16),
        marginBottom: scale(8),
    },
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    legalLink: {
        fontSize: scale(12),
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    legalSeparator: {
        fontSize: scale(12),
    },
    manageButton: {
        padding: scale(14),
        borderRadius: scale(12),
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: scale(12),
        width: '100%',
    },
    manageButtonText: {
        fontSize: scale(16),
        fontWeight: '500',
    },
    alreadyPremiumContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(24),
    }
});
