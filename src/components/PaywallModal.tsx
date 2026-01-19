import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';
import { usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale } from '@/utils/responsive';
import i18n from '@/i18n';
import {
    formatPrice,
    getSubscriptionPeriod,
    getMonthlyPackage,
    getYearlyPackage,
    calculateYearlySavings,
    getManagementURL,
} from '@/services/purchases';
import { Haptic } from '@/utils/haptics';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
}

type SelectedPlan = 'monthly' | 'yearly';

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
    const { isPro, purchasePro, restorePurchases, offerings, loadOfferings } = usePro();

    // Theme colors
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const borderColor = useThemeColor({}, 'border');
    const inputBgColor = useThemeColor({}, 'inputBg');
    const primaryColor = useThemeColor({}, 'buttonPrimary');
    const buttonTextColor = useThemeColor({}, 'buttonText');

    const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>('yearly');
    const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
    const [yearlyPkg, setYearlyPkg] = useState<PurchasesPackage | null>(null);
    const [yearlySavings, setYearlySavings] = useState<number>(0);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // Load offerings when modal opens
    useEffect(() => {
        if (visible && !offerings) {
            loadOfferings();
        }
    }, [visible, offerings, loadOfferings]);

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
            await purchasePro(pkg || undefined);
            await Haptic.success();
            Alert.alert(i18n.t('success'), i18n.t('premium.purchaseSuccess'));
            onClose();
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
                onClose();
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
    if (isPro) {
        return (
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={[styles.container, { backgroundColor: cardColor }]}>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: inputBgColor }]}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={scale(24)} color={textColor} />
                        </TouchableOpacity>

                        <View style={[styles.iconContainer, { backgroundColor: '#4CD964' + '20' }]}>
                            <Ionicons name="checkmark-circle" size={scale(48)} color="#4CD964" />
                        </View>

                        <Text style={[styles.title, { color: textColor }]}>
                            {i18n.t('premium.alreadyPremium')}
                        </Text>

                        <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
                            {i18n.t('premium.thankYou')}
                        </Text>

                        <TouchableOpacity
                            style={[styles.manageButton, { borderColor: borderColor }]}
                            onPress={handleManageSubscription}
                        >
                            <Text style={[styles.manageButtonText, { color: primaryColor }]}>
                                {i18n.t('premium.manageSubscription')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.subscribeButton, { backgroundColor: primaryColor }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.subscribeText, { color: buttonTextColor }]}>{i18n.t('common.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: cardColor }]}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: inputBgColor }]}
                        onPress={onClose}
                        disabled={purchaseLoading}
                    >
                        <Ionicons name="close" size={scale(24)} color={textColor} />
                    </TouchableOpacity>

                    {/* Diamond icon */}
                    <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
                        <Ionicons name="diamond" size={scale(48)} color={primaryColor} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: textColor }]}>
                        {i18n.t('premium.title')}
                    </Text>

                    {/* Subtitle */}
                    <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
                        {i18n.t('premium.subtitle')}
                    </Text>

                    {/* Features */}
                    <View style={styles.features}>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark-circle" size={scale(24)} color="#4CD964" />
                            <Text style={[styles.featureText, { color: textColor }]}>
                                {i18n.t('premium.feature1')}
                            </Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark-circle" size={scale(24)} color="#4CD964" />
                            <Text style={[styles.featureText, { color: textColor }]}>
                                {i18n.t('premium.feature2')}
                            </Text>
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
                                            <Text style={styles.savingsText}>
                                                {i18n.t('premium.save', { percent: yearlySavings })}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.planInfo}>
                                        <Text style={[styles.planName, { color: textColor }]}>
                                            {i18n.t('premium.yearly')}
                                        </Text>
                                        <Text style={[styles.planPrice, { color: textSecondaryColor }]}>
                                            {formatPrice(yearlyPkg)}{getSubscriptionPeriod(yearlyPkg)}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.radioButton,
                                        {
                                            borderColor: selectedPlan === 'yearly' ? primaryColor : borderColor,
                                            backgroundColor: selectedPlan === 'yearly' ? primaryColor : 'transparent',
                                        },
                                    ]}>
                                        {selectedPlan === 'yearly' && (
                                            <Ionicons name="checkmark" size={scale(14)} color="#fff" />
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
                                        <Text style={[styles.planName, { color: textColor }]}>
                                            {i18n.t('premium.monthly')}
                                        </Text>
                                        <Text style={[styles.planPrice, { color: textSecondaryColor }]}>
                                            {formatPrice(monthlyPkg)}{getSubscriptionPeriod(monthlyPkg)}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.radioButton,
                                        {
                                            borderColor: selectedPlan === 'monthly' ? primaryColor : borderColor,
                                            backgroundColor: selectedPlan === 'monthly' ? primaryColor : 'transparent',
                                        },
                                    ]}>
                                        {selectedPlan === 'monthly' && (
                                            <Ionicons name="checkmark" size={scale(14)} color="#fff" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}

                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={primaryColor} />
                            <Text style={[styles.loadingText, { color: textSecondaryColor }]}>
                                {i18n.t('premium.loadingProducts')}
                            </Text>
                        </View>
                    )}

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
                            <ActivityIndicator color={buttonTextColor} />
                        ) : (
                            <Text style={[styles.subscribeText, { color: buttonTextColor }]}>
                                {i18n.t('premium.subscribe')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Restore Button */}
                    <TouchableOpacity
                        style={styles.restoreButton}
                        onPress={handleRestorePurchases}
                        disabled={purchaseLoading}
                    >
                        <Text style={[styles.restoreText, { color: primaryColor }]}>
                            {i18n.t('premium.restore')}
                        </Text>
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text style={[styles.terms, { color: textSecondaryColor }]}>
                        {i18n.t('premium.termsIntro')}
                    </Text>
                    <View style={styles.legalLinks}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://privacy-policy-app-flax.vercel.app/bills-tracker/terms.html')}
                        >
                            <Text style={[styles.legalLink, { color: primaryColor }]}>
                                {i18n.t('premium.termsOfUse')}
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.legalSeparator, { color: textSecondaryColor }]}> | </Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://privacy-policy-app-flax.vercel.app/bills-tracker/')}
                        >
                            <Text style={[styles.legalLink, { color: primaryColor }]}>
                                {i18n.t('premium.privacyPolicy')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
        padding: scale(24),
        paddingBottom: Platform.OS === 'ios' ? scale(40) : scale(24),
        maxHeight: '90%',
    },
    closeButton: {
        position: 'absolute',
        top: scale(16),
        right: scale(16),
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    iconContainer: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: scale(16),
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
    },
    manageButtonText: {
        fontSize: scale(16),
        fontWeight: '500',
    },
});
