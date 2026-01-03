import { CurrencyPickerModal } from '@/components/CurrencyPickerModal';
import { GoProButton } from '@/components/GoProButton';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SUPPORTED_LANGUAGES } from '@/constants/Languages';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePro } from '@/contexts/ProContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Apple-style Navigation Header
 *
 * Features:
 * - Large title (iOS standard)
 * - Blur effect on scroll (when supported)
 * - Subtle separator
 * - Clean, minimal design
 */
const ONBOARDING_KEY = 'HAS_SEEN_ONBOARDING_V2';

export function MainHeader({ title }: { title: string }) {
    const insets = useSafeAreaInsets();
    const { colorScheme, toggleTheme } = useTheme();
    const { locale, setLocale } = useLanguage();
    const { defaultCurrency } = useCurrency();
    const { isPro } = usePro();
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [onboardingVisible, setOnboardingVisible] = useState(false);

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === locale) ||
        SUPPORTED_LANGUAGES.find(l => locale.startsWith(l.code.split('-')[0])) ||
        SUPPORTED_LANGUAGES.find(l => l.code === 'en');

    // Show onboarding on first launch
    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
            if (!seen) {
                setTimeout(() => setOnboardingVisible(true), 500);
            }
        };
        checkOnboarding();
    }, []);

    const handleOnboardingComplete = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setOnboardingVisible(false);
    };

    const handleLanguageSelect = (code: string) => {
        setLocale(code);
        setLanguageModalVisible(false);
    };

    const HeaderContent = (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ThemedText type="title" style={styles.title}>{title}</ThemedText>
            <View style={styles.actions}>
                {/* Go Pro button - only show if not pro */}
                {!isPro && <GoProButton variant="compact" />}
                {/* Info button - opens onboarding */}
                <TouchableOpacity
                    onPress={() => setOnboardingVisible(true)}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={i18n.t('help')}
                >
                    <IconSymbol
                        name="info.circle"
                        size={22}
                        color={primaryColor}
                    />
                </TouchableOpacity>
                {/* Currency button - left */}
                <TouchableOpacity
                    onPress={() => setCurrencyModalVisible(true)}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={i18n.t('manageCurrencies')}
                >
                    <ThemedText style={styles.currencySymbol}>
                        {defaultCurrency?.symbol || '$'}
                    </ThemedText>
                </TouchableOpacity>
                {/* Language button - middle */}
                <TouchableOpacity
                    onPress={() => setLanguageModalVisible(true)}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={i18n.t('changeLanguage')}
                >
                    {currentLang ? (
                        <ThemedText style={styles.flag}>{currentLang.flag}</ThemedText>
                    ) : (
                        <IconSymbol name="globe" size={22} color={primaryColor} />
                    )}
                </TouchableOpacity>
                {/* Theme button - right */}
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={colorScheme === 'dark' ? i18n.t('switchToLightMode') : i18n.t('switchToDarkMode')}
                >
                    <IconSymbol
                        name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
                        size={22}
                        color={primaryColor}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Use blur effect on iOS for modern look
    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={styles.header}
            >
                {HeaderContent}
                <LanguagePickerModal
                    visible={languageModalVisible}
                    onClose={() => setLanguageModalVisible(false)}
                    onSelect={handleLanguageSelect}
                />
                <CurrencyPickerModal
                    visible={currencyModalVisible}
                    onClose={() => setCurrencyModalVisible(false)}
                    showManageOptions
                    mode="manage"
                />
                <OnboardingModal
                    visible={onboardingVisible}
                    onComplete={handleOnboardingComplete}
                />
            </BlurView>
        );
    }

    return (
        <View style={[styles.header, { backgroundColor }]}>
            {HeaderContent}
            <LanguagePickerModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
                onSelect={handleLanguageSelect}
            />
            <CurrencyPickerModal
                visible={currencyModalVisible}
                onClose={() => setCurrencyModalVisible(false)}
                showManageOptions
                mode="manage"
            />
            <OnboardingModal
                visible={onboardingVisible}
                onComplete={handleOnboardingComplete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        zIndex: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        padding: 8,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
    },
    flag: {
        fontSize: 24,
        lineHeight: 30,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '600',
    },
});
