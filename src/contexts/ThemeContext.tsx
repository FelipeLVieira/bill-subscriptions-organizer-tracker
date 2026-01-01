import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    colorScheme: ColorScheme;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
    isSystemDefault: boolean;
    useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemColorScheme || 'light');
    const [isSystemDefault, setIsSystemDefault] = useState(true);

    useEffect(() => {
        loadSavedTheme();
    }, []);

    useEffect(() => {
        if (isSystemDefault && systemColorScheme) {
            setColorSchemeState(systemColorScheme);
        }
    }, [systemColorScheme, isSystemDefault]);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                setColorSchemeState(savedTheme as ColorScheme);
                setIsSystemDefault(false);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const setColorScheme = useCallback(async (scheme: ColorScheme) => {
        setColorSchemeState(scheme);
        setIsSystemDefault(false);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setColorSchemeState(prev => {
            const newScheme = prev === 'dark' ? 'light' : 'dark';
            setIsSystemDefault(false);
            AsyncStorage.setItem(THEME_STORAGE_KEY, newScheme).catch(e =>
                console.error('Failed to save theme', e)
            );
            return newScheme;
        });
    }, []);

    const useSystemTheme = useCallback(async () => {
        setIsSystemDefault(true);
        setColorSchemeState(systemColorScheme || 'light');
        try {
            await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to remove theme', e);
        }
    }, [systemColorScheme]);

    const value = useMemo(() => ({
        colorScheme,
        toggleTheme,
        setColorScheme,
        isSystemDefault,
        useSystemTheme,
    }), [colorScheme, toggleTheme, setColorScheme, isSystemDefault, useSystemTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
