import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState(i18n.locale);

    useEffect(() => {
        loadSavedLanguage();
    }, []);

    const loadSavedLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (savedLanguage) {
                i18n.locale = savedLanguage;
                setLocaleState(savedLanguage);
            }
        } catch (e) {
            console.error('Failed to load language', e);
        }
    };

    const setLocale = useCallback(async (newLocale: string) => {
        i18n.locale = newLocale;
        setLocaleState(newLocale);
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
        } catch (e) {
            console.error('Failed to save language', e);
        }
    }, []);

    const value = useMemo(() => ({
        locale,
        setLocale,
    }), [locale, setLocale]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
