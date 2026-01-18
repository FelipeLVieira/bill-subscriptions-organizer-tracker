import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
    initializePurchases,
    checkPremiumStatus,
    restorePurchases as rcRestorePurchases,
    isPremiumActive,
    addCustomerInfoUpdateListener,
    getOfferings,
    purchasePackage,
    getMonthlyPackage,
    ENTITLEMENT_ID,
} from '@/services/purchases';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

const PRO_STATUS_KEY = 'BILLS_TRACKER_PRO_STATUS';
const LAST_INTERSTITIAL_KEY = 'LAST_INTERSTITIAL_TIMESTAMP';
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes between interstitial ads

interface ProContextType {
    isPro: boolean;
    isLoading: boolean;
    purchasePro: (pkg?: PurchasesPackage) => Promise<void>;
    restorePurchases: () => Promise<boolean>;
    // Ad-related
    showInterstitialAd: () => Promise<void>;
    canShowInterstitialAd: () => boolean;
    shouldShowBannerAd: boolean;
    // For testing
    toggleProStatus: () => void;
    // RevenueCat offerings
    offerings: PurchasesOffering | null;
    loadOfferings: () => Promise<void>;
    // Error state for offerings
    offeringsError: string | null;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

// Ad Unit IDs - uses test IDs in development, production IDs in release builds
export const AD_UNIT_IDS = {
    banner: Platform.select({
        ios: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-9370146634701252/3389574843',
        android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-9370146634701252/4698787086',
        default: 'ca-app-pub-3940256099942544/6300978111',
    }),
    interstitial: Platform.select({
        ios: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-9370146634701252/3577277104',
        android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-9370146634701252/8925629096',
        default: 'ca-app-pub-3940256099942544/1033173712',
    }),
} as const;

// RevenueCat Entitlement ID
export { ENTITLEMENT_ID };

export function ProProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastInterstitialTime, setLastInterstitialTime] = useState(0);
    const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
    const [offeringsError, setOfferingsError] = useState<string | null>(null);

    // Initialize RevenueCat and load pro status on mount
    useEffect(() => {
        const init = async () => {
            try {
                // Load cached pro status first for quick UI
                const cachedStatus = await AsyncStorage.getItem(PRO_STATUS_KEY);
                if (cachedStatus === 'true') {
                    setIsPro(true);
                }

                // Load last interstitial time
                const lastAdTime = await AsyncStorage.getItem(LAST_INTERSTITIAL_KEY);
                if (lastAdTime) {
                    setLastInterstitialTime(parseInt(lastAdTime, 10));
                }

                // Initialize RevenueCat (only on native platforms)
                if (Platform.OS !== 'web') {
                    await initializePurchases();

                    // Load offerings immediately after initialization (like BMI Calculator)
                    try {
                        const currentOfferings = await getOfferings();
                        setOfferings(currentOfferings);
                        if (!currentOfferings) {
                            setOfferingsError('No products available. Please check your RevenueCat configuration.');
                        } else {
                            setOfferingsError(null);
                        }
                    } catch (offeringsErr) {
                        console.error('[Purchases] Failed to load offerings during init:', offeringsErr);
                        setOfferingsError('Failed to load products. Please try again.');
                    }

                    // Check actual premium status from RevenueCat
                    const hasPremium = await checkPremiumStatus();
                    setIsPro(hasPremium);
                    await AsyncStorage.setItem(PRO_STATUS_KEY, hasPremium.toString());

                    // Listen for customer info updates
                    addCustomerInfoUpdateListener((customerInfo) => {
                        const isActive = isPremiumActive(customerInfo);
                        setIsPro(isActive);
                        AsyncStorage.setItem(PRO_STATUS_KEY, isActive.toString());
                    });
                }
            } catch (error) {
                console.error('Failed to initialize purchases:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const loadOfferings = useCallback(async () => {
        if (Platform.OS === 'web') return;

        setOfferingsError(null); // Clear previous error
        try {
            const currentOfferings = await getOfferings();
            setOfferings(currentOfferings);
            if (!currentOfferings) {
                setOfferingsError('No products available. Please try again later.');
            }
        } catch (error) {
            console.error('Failed to load offerings:', error);
            setOfferingsError('Failed to load products. Please try again.');
        }
    }, []);

    const saveProStatus = async (status: boolean) => {
        try {
            await AsyncStorage.setItem(PRO_STATUS_KEY, status.toString());
            setIsPro(status);
        } catch (error) {
            console.error('Failed to save pro status:', error);
        }
    };

    const purchasePro = useCallback(async (pkg?: PurchasesPackage) => {
        if (Platform.OS === 'web') {
            // Simulate purchase on web for testing
            await saveProStatus(true);
            return;
        }

        try {
            setIsLoading(true);

            // If no package provided, get the default monthly package
            let packageToPurchase = pkg;
            if (!packageToPurchase) {
                const currentOfferings = offerings || await getOfferings();
                if (currentOfferings) {
                    packageToPurchase = getMonthlyPackage(currentOfferings) || undefined;
                }
            }

            if (!packageToPurchase) {
                throw new Error('No package available for purchase');
            }

            const customerInfo = await purchasePackage(packageToPurchase);
            const isActive = isPremiumActive(customerInfo);
            await saveProStatus(isActive);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Don't throw for user-initiated cancellation
            if (errorMessage === 'CANCELLED') {
                console.log('[Purchases] User cancelled purchase');
                return;
            }

            console.error('Purchase failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [offerings]);

    const restorePurchases = useCallback(async () => {
        if (Platform.OS === 'web') {
            // Check local storage for web testing
            const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
            if (status === 'true') {
                setIsPro(true);
                return true;
            }
            return false;
        }

        try {
            setIsLoading(true);
            const customerInfo = await rcRestorePurchases();
            const isActive = isPremiumActive(customerInfo);
            await saveProStatus(isActive);
            return isActive;
        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const canShowInterstitialAd = useCallback(() => {
        if (isPro) return false;
        const now = Date.now();
        return now - lastInterstitialTime >= INTERSTITIAL_COOLDOWN_MS;
    }, [isPro, lastInterstitialTime]);

    const showInterstitialAd = useCallback(async () => {
        if (!canShowInterstitialAd()) return;

        try {
            // The actual ad showing logic will be handled by the component
            // Here we just record that we showed an ad
            const now = Date.now();
            setLastInterstitialTime(now);
            await AsyncStorage.setItem(LAST_INTERSTITIAL_KEY, now.toString());
        } catch (error) {
            console.error('Failed to show interstitial:', error);
        }
    }, [canShowInterstitialAd]);

    const toggleProStatus = useCallback(() => {
        saveProStatus(!isPro);
    }, [isPro]);

    const shouldShowBannerAd = useMemo(() => !isPro, [isPro]);

    const value = useMemo(() => ({
        isPro,
        isLoading,
        purchasePro,
        restorePurchases,
        showInterstitialAd,
        canShowInterstitialAd,
        shouldShowBannerAd,
        toggleProStatus,
        offerings,
        loadOfferings,
        offeringsError,
    }), [
        isPro,
        isLoading,
        purchasePro,
        restorePurchases,
        showInterstitialAd,
        canShowInterstitialAd,
        shouldShowBannerAd,
        toggleProStatus,
        offerings,
        loadOfferings,
        offeringsError,
    ]);

    return (
        <ProContext.Provider value={value}>
            {children}
        </ProContext.Provider>
    );
}

export function usePro() {
    const context = useContext(ProContext);
    if (!context) {
        throw new Error('usePro must be used within a ProProvider');
    }
    return context;
}
