import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PACKAGE_TYPE,
    PURCHASES_ERROR_CODE,
    PurchasesError,
    PurchasesOffering,
    PurchasesPackage,
} from 'react-native-purchases';

// RevenueCat API Keys - Platform specific
// Bills & Subscriptions Tracker in Wise Digital Inc project
const API_KEYS = {
    ios: 'appl_OskLRvGyYtfeTVyEpwVHPYCLfwQ',
    android: 'test_jDrfQgLJLkiSsGdIteBfhquKsRA', // Test key for Android
};

const API_KEY = Platform.select({
    ios: API_KEYS.ios,
    android: API_KEYS.android,
}) || API_KEYS.ios;

// Entitlement ID configured in RevenueCat dashboard
// Specific to Bills & Subscriptions Tracker
export const ENTITLEMENT_ID = 'Bills & Subscriptions Tracker Pro';

// Package identifiers for different subscription tiers
export const PACKAGE_TYPES = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
} as const;

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts
 */
export const initializePurchases = async (userId?: string): Promise<void> => {
    if (Platform.OS === 'web') {
        if (__DEV__) console.log('[Purchases] RevenueCat not available on web');
        return;
    }

    // Enable debug logs in development
    if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({
        apiKey: API_KEY,
        appUserID: userId || undefined,
    });

    if (__DEV__) console.log('[Purchases] RevenueCat initialized for Bills & Subscriptions Tracker');
};

/**
 * Get current offerings (available products)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    if (Platform.OS === 'web') return null;

    try {
        const offerings = await Purchases.getOfferings();

        // Debug logging to help diagnose issues
        if (__DEV__) {
            console.log('[Purchases] All offerings:', JSON.stringify(offerings, null, 2));
            console.log('[Purchases] Current offering:', offerings.current);
            console.log('[Purchases] All offering keys:', Object.keys(offerings.all || {}));
        }

        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            if (__DEV__) {
                console.log('[Purchases] Available packages:', offerings.current.availablePackages.map(p => ({
                    identifier: p.identifier,
                    packageType: p.packageType,
                    productId: p.product.identifier,
                    price: p.product.priceString,
                })));
            }
            return offerings.current;
        }

        // If no current offering, try to get any available offering
        const allOfferings = Object.values(offerings.all || {});
        if (allOfferings.length > 0) {
            const firstOffering = allOfferings[0];
            if (firstOffering.availablePackages.length > 0) {
                if (__DEV__) console.log('[Purchases] Using fallback offering:', firstOffering.identifier);
                return firstOffering;
            }
        }

        if (__DEV__) {
            console.warn('[Purchases] No offerings available. Check RevenueCat dashboard configuration.');
            console.warn('[Purchases] Common issues:');
            console.warn('  1. No "current" offering set in RevenueCat dashboard');
            console.warn('  2. Product IDs in RevenueCat don\'t match App Store Connect');
            console.warn('  3. Products not approved or missing metadata in App Store Connect');
            console.warn('  4. Paid Apps Agreement not accepted in App Store Connect');
        }
        return null;
    } catch (error) {
        console.error('[Purchases] Error fetching offerings:', error);
        throw error;
    }
};

/**
 * Get a specific package from an offering
 */
export const getPackageByType = (
    offering: PurchasesOffering,
    type: keyof typeof PACKAGE_TYPES
): PurchasesPackage | null => {
    switch (type) {
        case 'MONTHLY':
            return offering.monthly || null;
        case 'YEARLY':
            return offering.annual || null;
        default:
            return offering.availablePackages[0] || null;
    }
};

/**
 * Get the monthly package from an offering
 */
export const getMonthlyPackage = (offering: PurchasesOffering): PurchasesPackage | null => {
    return offering.monthly || offering.availablePackages[0] || null;
};

/**
 * Get yearly package from offerings
 */
export const getYearlyPackage = (offering: PurchasesOffering): PurchasesPackage | null => {
    if (offering.annual) return offering.annual;
    return (
        offering.availablePackages.find(
            (pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL
        ) || null
    );
};

/**
 * Purchase a package
 */
export const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo> => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return customerInfo;
    } catch (error) {
        const purchaseError = error as PurchasesError;

        // User cancelled the purchase
        if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            throw new Error('CANCELLED');
        }

        // Payment pending (e.g., waiting for parental approval)
        if (purchaseError.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
            throw new Error('PENDING');
        }

        // Already subscribed
        if (purchaseError.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
            throw new Error('ALREADY_PURCHASED');
        }

        console.error('[Purchases] Purchase error:', purchaseError);
        throw purchaseError;
    }
};

/**
 * Restore purchases for returning users
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
    } catch (error) {
        console.error('[Purchases] Restore error:', error);
        throw error;
    }
};

/**
 * Check if user has premium entitlement
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return isPremiumActive(customerInfo);
    } catch (error) {
        console.error('[Purchases] Error checking premium status:', error);
        return false;
    }
};

/**
 * Check if customer info has active premium entitlement
 */
export const isPremiumActive = (customerInfo: CustomerInfo): boolean => {
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
};

/**
 * Get customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
    if (Platform.OS === 'web') return null;

    try {
        return await Purchases.getCustomerInfo();
    } catch (error) {
        console.error('[Purchases] Error getting customer info:', error);
        return null;
    }
};

/**
 * Add listener for customer info updates
 * Returns a function to remove the listener
 */
export const addCustomerInfoUpdateListener = (
    callback: (customerInfo: CustomerInfo) => void
): (() => void) => {
    if (Platform.OS === 'web') {
        return () => { };
    }

    Purchases.addCustomerInfoUpdateListener(callback);
    return () => {
        Purchases.removeCustomerInfoUpdateListener(callback);
    };
};

/**
 * Format price for display
 */
export const formatPrice = (pkg: PurchasesPackage): string => {
    return pkg.product.priceString;
};

/**
 * Get subscription period text
 */
export const getSubscriptionPeriod = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === PACKAGE_TYPE.MONTHLY) {
        return '/month';
    } else if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
        return '/year';
    }
    return '';
};

/**
 * Calculate savings percentage for yearly vs monthly
 */
export const calculateYearlySavings = (
    monthlyPkg: PurchasesPackage,
    yearlyPkg: PurchasesPackage
): number => {
    const monthlyPrice = monthlyPkg.product.price;
    const yearlyPrice = yearlyPkg.product.price;
    const yearlyEquivalent = monthlyPrice * 12;

    if (yearlyEquivalent > 0) {
        return Math.round(((yearlyEquivalent - yearlyPrice) / yearlyEquivalent) * 100);
    }
    return 0;
};

/**
 * Get management URL for subscription
 * Users can cancel/modify their subscription here
 */
export const getManagementURL = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo.managementURL;
    } catch (error) {
        console.error('[Purchases] Error getting management URL:', error);
        return null;
    }
};

/**
 * Sync purchases with RevenueCat
 * Useful after a purchase is made outside the app
 */
export const syncPurchases = async (): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
        await Purchases.syncPurchases();
    } catch (error) {
        console.error('[Purchases] Error syncing purchases:', error);
        throw error;
    }
};
