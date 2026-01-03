import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

const PRO_STATUS_KEY = 'BILLS_TRACKER_PRO_STATUS';
const LAST_INTERSTITIAL_KEY = 'LAST_INTERSTITIAL_TIMESTAMP';
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes between interstitial ads

interface ProContextType {
    isPro: boolean;
    isLoading: boolean;
    purchasePro: () => Promise<void>;
    restorePurchases: () => Promise<void>;
    // Ad-related
    showInterstitialAd: () => Promise<void>;
    canShowInterstitialAd: () => boolean;
    shouldShowBannerAd: boolean;
    // For testing
    toggleProStatus: () => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

// Ad Unit IDs (replace with your actual IDs in production)
export const AD_UNIT_IDS = {
    banner: Platform.select({
        ios: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-XXXXXX/XXXXXX',
        android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-XXXXXX/XXXXXX',
        default: 'ca-app-pub-3940256099942544/6300978111',
    }),
    interstitial: Platform.select({
        ios: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-XXXXXX/XXXXXX',
        android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-XXXXXX/XXXXXX',
        default: 'ca-app-pub-3940256099942544/1033173712',
    }),
} as const;

// Product IDs for in-app purchases
export const PRODUCT_IDS = {
    proPurchase: Platform.select({
        ios: 'com.fullstackdev1.billstracker.pro',
        android: 'com.fullstackdev1.billstracker.pro',
        default: 'com.fullstackdev1.billstracker.pro',
    }),
} as const;

export function ProProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastInterstitialTime, setLastInterstitialTime] = useState(0);

    // Load pro status on mount
    useEffect(() => {
        loadProStatus();
    }, []);

    const loadProStatus = async () => {
        try {
            const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
            setIsPro(status === 'true');

            const lastAdTime = await AsyncStorage.getItem(LAST_INTERSTITIAL_KEY);
            if (lastAdTime) {
                setLastInterstitialTime(parseInt(lastAdTime, 10));
            }
        } catch (error) {
            console.error('Failed to load pro status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveProStatus = async (status: boolean) => {
        try {
            await AsyncStorage.setItem(PRO_STATUS_KEY, status.toString());
            setIsPro(status);
        } catch (error) {
            console.error('Failed to save pro status:', error);
        }
    };

    const purchasePro = useCallback(async () => {
        // In production, implement actual IAP logic here
        // For now, this is a placeholder that simulates a purchase
        try {
            setIsLoading(true);
            // Simulate purchase delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            await saveProStatus(true);
        } catch (error) {
            console.error('Purchase failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const restorePurchases = useCallback(async () => {
        // In production, implement actual restore logic here
        try {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Check if user has purchased before
            const hasPurchased = await AsyncStorage.getItem(PRO_STATUS_KEY);
            if (hasPurchased === 'true') {
                setIsPro(true);
            }
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
    }), [
        isPro,
        isLoading,
        purchasePro,
        restorePurchases,
        showInterstitialAd,
        canShowInterstitialAd,
        shouldShowBannerAd,
        toggleProStatus,
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
