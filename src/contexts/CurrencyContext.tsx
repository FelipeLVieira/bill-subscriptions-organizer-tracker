import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Currency, getDefaultCurrencyForLocale, PREDEFINED_CURRENCIES, UserCurrency } from '@/constants/Currencies';
import { useLanguage } from './LanguageContext';

interface CurrencyContextType {
    userCurrencies: UserCurrency[];
    defaultCurrency: UserCurrency | null;
    addCurrency: (currency: Currency) => void;
    removeCurrency: (code: string) => void;
    setDefaultCurrency: (code: string) => void;
    addCustomCurrency: (currency: Omit<Currency, 'flag'> & { flag?: string }) => void;
    getCurrencyByCode: (code: string) => UserCurrency | undefined;
    formatAmount: (amount: number, currencyCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCIES_STORAGE_KEY = '@app_currencies';

interface StoredCurrencyData {
    currencies: UserCurrency[];
    defaultCode: string | null;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const { locale } = useLanguage();
    const [userCurrencies, setUserCurrencies] = useState<UserCurrency[]>([]);
    const [defaultCode, setDefaultCode] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        loadSavedCurrencies();
    }, []);

    // Initialize with locale-based default on first launch
    useEffect(() => {
        if (isInitialized && userCurrencies.length === 0) {
            const defaultCurrency = getDefaultCurrencyForLocale(locale);
            const initialCurrency: UserCurrency = {
                ...defaultCurrency,
                isDefault: true,
            };
            setUserCurrencies([initialCurrency]);
            setDefaultCode(defaultCurrency.code);
            saveCurrencies([initialCurrency], defaultCurrency.code);
        }
    }, [isInitialized, locale, userCurrencies.length]);

    const loadSavedCurrencies = async () => {
        try {
            const saved = await AsyncStorage.getItem(CURRENCIES_STORAGE_KEY);
            if (saved) {
                const data: StoredCurrencyData = JSON.parse(saved);
                setUserCurrencies(data.currencies);
                setDefaultCode(data.defaultCode);
            }
            setIsInitialized(true);
        } catch (e) {
            console.error('Failed to load currencies', e);
            setIsInitialized(true);
        }
    };

    const saveCurrencies = async (currencies: UserCurrency[], defCode: string | null) => {
        try {
            const data: StoredCurrencyData = {
                currencies,
                defaultCode: defCode,
            };
            await AsyncStorage.setItem(CURRENCIES_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save currencies', e);
        }
    };

    const addCurrency = useCallback((currency: Currency) => {
        setUserCurrencies(prev => {
            // Check if already added
            if (prev.some(c => c.code === currency.code)) {
                return prev;
            }
            const newCurrencies = [...prev, { ...currency, isDefault: prev.length === 0 }];
            const newDefaultCode = prev.length === 0 ? currency.code : defaultCode;
            saveCurrencies(newCurrencies, newDefaultCode);
            if (prev.length === 0) {
                setDefaultCode(currency.code);
            }
            return newCurrencies;
        });
    }, [defaultCode]);

    const removeCurrency = useCallback((code: string) => {
        setUserCurrencies(prev => {
            const newCurrencies = prev.filter(c => c.code !== code);
            let newDefaultCode = defaultCode;

            // If removing the default, set first remaining as default
            if (code === defaultCode && newCurrencies.length > 0) {
                newDefaultCode = newCurrencies[0].code;
                newCurrencies[0] = { ...newCurrencies[0], isDefault: true };
                setDefaultCode(newDefaultCode);
            } else if (newCurrencies.length === 0) {
                newDefaultCode = null;
                setDefaultCode(null);
            }

            saveCurrencies(newCurrencies, newDefaultCode);
            return newCurrencies;
        });
    }, [defaultCode]);

    const setDefaultCurrencyFn = useCallback((code: string) => {
        setUserCurrencies(prev => {
            const newCurrencies = prev.map(c => ({
                ...c,
                isDefault: c.code === code,
            }));
            setDefaultCode(code);
            saveCurrencies(newCurrencies, code);
            return newCurrencies;
        });
    }, []);

    const addCustomCurrency = useCallback((currency: Omit<Currency, 'flag'> & { flag?: string }) => {
        const customCurrency: UserCurrency = {
            code: currency.code.toUpperCase(),
            symbol: currency.symbol,
            name: currency.name,
            flag: currency.flag,
            isCustom: true,
            isDefault: userCurrencies.length === 0,
        };

        setUserCurrencies(prev => {
            // Check if already added
            if (prev.some(c => c.code === customCurrency.code)) {
                return prev;
            }
            const newCurrencies = [...prev, customCurrency];
            const newDefaultCode = prev.length === 0 ? customCurrency.code : defaultCode;
            saveCurrencies(newCurrencies, newDefaultCode);
            if (prev.length === 0) {
                setDefaultCode(customCurrency.code);
            }
            return newCurrencies;
        });
    }, [defaultCode, userCurrencies.length]);

    const getCurrencyByCodeFn = useCallback((code: string): UserCurrency | undefined => {
        // First check user's currencies
        const userCurrency = userCurrencies.find(c => c.code === code);
        if (userCurrency) return userCurrency;

        // Then check predefined currencies
        const predefined = PREDEFINED_CURRENCIES.find(c => c.code === code);
        if (predefined) return { ...predefined };

        return undefined;
    }, [userCurrencies]);

    const formatAmount = useCallback((amount: number, currencyCode: string): string => {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            // Fallback for custom currencies that Intl doesn't recognize
            const currency = getCurrencyByCodeFn(currencyCode);
            const symbol = currency?.symbol || currencyCode;
            return `${symbol}${amount.toFixed(2)}`;
        }
    }, [locale, getCurrencyByCodeFn]);

    const defaultCurrency = useMemo(() => {
        return userCurrencies.find(c => c.code === defaultCode) || null;
    }, [userCurrencies, defaultCode]);

    const value = useMemo(() => ({
        userCurrencies,
        defaultCurrency,
        addCurrency,
        removeCurrency,
        setDefaultCurrency: setDefaultCurrencyFn,
        addCustomCurrency,
        getCurrencyByCode: getCurrencyByCodeFn,
        formatAmount,
    }), [
        userCurrencies,
        defaultCurrency,
        addCurrency,
        removeCurrency,
        setDefaultCurrencyFn,
        addCustomCurrency,
        getCurrencyByCodeFn,
        formatAmount,
    ]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
