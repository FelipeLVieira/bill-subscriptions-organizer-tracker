import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SUPPORTED_LANGUAGES } from '@/constants/Languages';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Apple-style Navigation Header
 *
 * Features:
 * - Large title (iOS standard)
 * - Blur effect on scroll (when supported)
 * - Subtle separator
 * - Clean, minimal design
 */
const TUTORIAL_KEY = 'HAS_SEEN_TUTORIAL_V3';

// Get the first tutorial step name for the current screen
// Dashboard: steps 1-4, My Bills: steps 11-13, History: steps 21-23
const getFirstStepName = (screenTitle: string): string => {
    // Match by checking if title matches any of the known screen translations
    const dashboardTitle = i18n.t('dashboard');
    const myBillsTitle = i18n.t('myBills');
    const historyTitle = i18n.t('history');

    if (screenTitle === dashboardTitle) return 'period';
    if (screenTitle === myBillsTitle) return 'bills-search';
    if (screenTitle === historyTitle) return 'history-search';

    return 'period'; // Default to Dashboard
};

export function MainHeader({ title }: { title: string }) {
    const insets = useSafeAreaInsets();
    const { colorScheme, toggleTheme } = useTheme();
    const { locale, setLocale } = useLanguage();
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');
    const { start: startTutorial } = useCopilot();

    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === locale) ||
        SUPPORTED_LANGUAGES.find(l => locale.startsWith(l.code.split('-')[0])) ||
        SUPPORTED_LANGUAGES.find(l => l.code === 'en');

    // Show Copilot tutorial on first launch (only on Dashboard)
    useEffect(() => {
        const checkTutorial = async () => {
            // Only auto-start tutorial on Dashboard
            if (title !== i18n.t('dashboard')) return;

            const seen = await AsyncStorage.getItem(TUTORIAL_KEY);
            if (!seen) {
                // Small delay to let the UI settle
                setTimeout(() => {
                    startTutorial('period'); // Start from Dashboard's first step
                }, 800);
                await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
            }
        };
        checkTutorial();
    }, [startTutorial, title]);

    const handleLanguageSelect = (code: string) => {
        setLocale(code);
        setLanguageModalVisible(false);
    };

    // Info button starts the tutorial from the current screen's first step
    const handleInfoPress = () => {
        const firstStep = getFirstStepName(title);
        startTutorial(firstStep);
    };

    const HeaderContent = (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
            <View style={styles.actions}>
                {/* Info button - starts tutorial balloons */}
                <TouchableOpacity
                    onPress={handleInfoPress}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={i18n.t('help')}
                    accessibilityRole="button"
                >
                    <IconSymbol
                        name="info.circle"
                        size={24}
                        weight="semibold"
                        color={primaryColor}
                    />
                </TouchableOpacity>
                {/* Language button */}
                <TouchableOpacity
                    onPress={() => setLanguageModalVisible(true)}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={i18n.t('changeLanguage')}
                    accessibilityRole="button"
                >
                    {currentLang ? (
                        <ThemedText style={styles.flag}>{currentLang.flag}</ThemedText>
                    ) : (
                        <IconSymbol name="globe" size={24} weight="semibold" color={primaryColor} />
                    )}
                </TouchableOpacity>
                {/* Theme button */}
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={styles.button}
                    activeOpacity={0.6}
                    accessibilityLabel={colorScheme === 'dark' ? i18n.t('switchToLightMode') : i18n.t('switchToDarkMode')}
                    accessibilityRole="button"
                >
                    <IconSymbol
                        name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
                        size={24}
                        weight="semibold"
                        color={primaryColor}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const borderThemeColor = useThemeColor({}, 'border');

    // Use blur effect on iOS for modern look
    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={[styles.header, { borderBottomColor: borderThemeColor }]}
            >
                {HeaderContent}
                <LanguagePickerModal
                    visible={languageModalVisible}
                    onClose={() => setLanguageModalVisible(false)}
                    onSelect={handleLanguageSelect}
                />
            </BlurView>
        );
    }

    return (
        <View style={[styles.header, { backgroundColor, borderBottomColor: borderThemeColor }]}>
            {HeaderContent}
            <LanguagePickerModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
                onSelect={handleLanguageSelect}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        zIndex: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'transparent', // Overridden by borderColor prop
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
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
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
});
