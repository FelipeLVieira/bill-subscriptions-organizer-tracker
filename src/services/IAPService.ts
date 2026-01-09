import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_STATUS_KEY = 'BILLS_TRACKER_PRO_STATUS';

const itemSkus = Platform.select({
    ios: ['com.fullstackdev1.billstracker.removeads'],
    android: ['com.fullstackdev1.billstracker.removeads'],
    default: [],
}) || [];

// Callbacks for updating Pro status
let onProStatusChange: ((isPro: boolean) => void) | null = null;

// Dynamic import for react-native-iap (only on native platforms)
const getRNIap = async () => {
    if (Platform.OS === 'web') {
        return null;
    }
    return await import('react-native-iap');
};

export const IAPService = {
    setProStatusCallback: (callback: (isPro: boolean) => void) => {
        onProStatusChange = callback;
    },

    initialize: async () => {
        if (Platform.OS === 'web') return;
        try {
            const RNIap = await getRNIap();
            if (!RNIap) return;
            await RNIap.initConnection();
            await RNIap.fetchProducts({ skus: itemSkus });
            await IAPService.hasPurchased();
        } catch (err) {
            console.warn('IAP Init Error:', err);
        }
    },

    endConnection: async () => {
        if (Platform.OS === 'web') return;
        try {
            const RNIap = await getRNIap();
            if (!RNIap) return;
            await RNIap.endConnection();
        } catch (err) {
            console.warn('IAP End Connection Error:', err);
        }
    },

    purchaseRemoveAds: async () => {
        if (Platform.OS === 'web') {
            // Simulate purchase on web for testing
            await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
            onProStatusChange?.(true);
            return;
        }
        try {
            const RNIap = await getRNIap();
            if (!RNIap) throw new Error('IAP not available');

            const request = Platform.OS === 'ios'
                ? { apple: { sku: itemSkus[0] } }
                : { google: { skus: [itemSkus[0]] } };

            await RNIap.requestPurchase({
                request,
                type: 'in-app',
            });
        } catch (err) {
            console.warn('Purchase Error:', err);
            throw err;
        }
    },

    restorePurchases: async (): Promise<boolean> => {
        if (Platform.OS === 'web') {
            // Check AsyncStorage for web testing
            const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
            if (status === 'true') {
                onProStatusChange?.(true);
                return true;
            }
            return false;
        }
        try {
            const RNIap = await getRNIap();
            if (!RNIap) return false;

            const purchases = await RNIap.getAvailablePurchases();
            let restored = false;

            for (const purchase of purchases) {
                if (purchase.productId === itemSkus[0]) {
                    await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
                    onProStatusChange?.(true);
                    await RNIap.finishTransaction({ purchase, isConsumable: false });
                    restored = true;
                }
            }

            return restored;
        } catch (err) {
            console.warn('Restore Error:', err);
            throw err;
        }
    },

    hasPurchased: async (): Promise<boolean> => {
        if (Platform.OS === 'web') {
            const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
            if (status === 'true') {
                onProStatusChange?.(true);
                return true;
            }
            return false;
        }
        try {
            const RNIap = await getRNIap();
            if (!RNIap) return false;

            const purchases = await RNIap.getAvailablePurchases();
            const hasPro = purchases.some(p => p.productId === itemSkus[0]);
            if (hasPro) {
                await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
                onProStatusChange?.(true);
            }
            return hasPro;
        } catch {
            return false;
        }
    },

    getProducts: async () => {
        if (Platform.OS === 'web') return [];
        try {
            const RNIap = await getRNIap();
            if (!RNIap) return [];
            return await RNIap.fetchProducts({ skus: itemSkus });
        } catch (err) {
            console.warn('Get Products Error:', err);
            return [];
        }
    },
};
