import Purchases, {
    PurchasesOffering,
    PurchasesPackage,
    CustomerInfo,
    LOG_LEVEL,
    PurchasesError,
    PURCHASES_ERROR_CODE,
    PACKAGE_TYPE,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys - Platform specific
// These are unique to the Bills & Subscriptions Tracker project
// iOS: Will use production key when App Store is configured
// Android: Will use production key when Play Store is configured
const API_KEYS = {
    // Test key for development - replace with production keys when configured
    ios: 'test_bdRFynvtUGigIKscAKmUlzJdopC',
    android: 'test_bdRFynvtUGigIKscAKmUlzJdopC',
};

const API_KEY = Platform.select({
    ios: API_KEYS.ios,
    android: API_KEYS.android,
}) || API_KEYS.ios;

// Entitlement ID configured in RevenueCat dashboard
export const ENTITLEMENT_ID = 'Bills & Subscriptions Tracker Pro';

// Package identifiers for different subscription tiers
export const PACKAGE_TYPES = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    LIFETIME: 'lifetime',
} as const;

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts
 */
export const initializePurchases = async (userId?: string): Promise<void> => {
    if (Platform.OS === 'web') {
        console.log('[Purchases] RevenueCat not available on web');
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

    console.log('[Purchases] RevenueCat initialized for Bills & Subscriptions Tracker');
};

/**
 * Get current offerings (available products)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    if (Platform.OS === 'web') return null;

    try {
        const offerings = await Purchases.getOfferings();

        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            return offerings.current;
        }

        console.warn('[Purchases] No offerings available');
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
        case 'LIFETIME':
            return offering.lifetime || null;
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
 * Get the yearly package from an offering
 */
export const getYearlyPackage = (offering: PurchasesOffering): PurchasesPackage | null => {
    return offering.annual || null;
};

/**
 * Get the lifetime package from an offering
 */
export const getLifetimePackage = (offering: PurchasesOffering): PurchasesPackage | null => {
    return offering.lifetime || null;
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
        return () => {};
    }

    Purchases.addCustomerInfoUpdateListener(callback);
    // Return a no-op cleanup function for compatibility
    return () => {};
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
    } else if (pkg.packageType === PACKAGE_TYPE.LIFETIME) {
        return ' (one-time)';
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
