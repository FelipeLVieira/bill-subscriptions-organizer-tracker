import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SUPPORTED_LANGUAGES } from '@/constants/Languages';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
    id: string;
    icon: string;
    titleKey: string;
    descriptionKey: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        icon: 'hand.wave.fill',
        titleKey: 'onboardingWelcomeTitle',
        descriptionKey: 'onboardingWelcomeDesc',
    },
    {
        id: 'dashboard',
        icon: 'chart.pie.fill',
        titleKey: 'onboardingDashboardTitle',
        descriptionKey: 'onboardingDashboardDesc',
    },
    {
        id: 'bills',
        icon: 'list.bullet.rectangle.fill',
        titleKey: 'onboardingBillsTitle',
        descriptionKey: 'onboardingBillsDesc',
    },
    {
        id: 'add',
        icon: 'plus.circle.fill',
        titleKey: 'onboardingAddTitle',
        descriptionKey: 'onboardingAddDesc',
    },
    {
        id: 'history',
        icon: 'clock.fill',
        titleKey: 'onboardingHistoryTitle',
        descriptionKey: 'onboardingHistoryDesc',
    },
    {
        id: 'language',
        icon: 'globe',
        titleKey: 'onboardingLanguageTitle',
        descriptionKey: 'onboardingLanguageDesc',
    },
];

interface OnboardingModalProps {
    visible: boolean;
    onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
    const insets = useSafeAreaInsets();
    const { locale, setLocale } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');
    const cardBg = useThemeColor({}, 'card');
    const secondaryText = useThemeColor({}, 'textSecondary');
    const contrastColor = useThemeColor({}, 'background');

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (index !== currentIndex) {
            setCurrentIndex(index);
            Haptic.selection();
        }
    }, [currentIndex]);

    const goToNext = useCallback(() => {
        if (currentIndex < ONBOARDING_STEPS.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            Haptic.light();
        } else {
            Haptic.success();
            onComplete();
        }
    }, [currentIndex, onComplete]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
            Haptic.light();
        }
    }, [currentIndex]);

    const handleLanguageSelect = useCallback((code: string) => {
        setLocale(code);
        Haptic.selection();
    }, [setLocale]);


    const renderStep = useCallback(({ item, index }: { item: OnboardingStep; index: number }) => {
        const isLanguageStep = item.id === 'language';

        return (
            <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
                <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
                    <IconSymbol name={item.icon as any} size={60} color={primaryColor} />
                </View>
                <ThemedText type="title" style={styles.stepTitle}>
                    {i18n.t(item.titleKey)}
                </ThemedText>
                <ThemedText style={[styles.stepDescription, { color: secondaryText }]}>
                    {i18n.t(item.descriptionKey)}
                </ThemedText>

                {isLanguageStep && (
                    <View style={styles.languageSelector}>
                        <ThemedText style={[styles.languageLabel, { color: secondaryText }]}>
                            {i18n.t('selectLanguage')}:
                        </ThemedText>
                        <View style={styles.languageGrid}>
                            {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.languageOption,
                                        { backgroundColor: cardBg },
                                        locale === lang.code && { borderColor: primaryColor, borderWidth: 2 }
                                    ]}
                                    onPress={() => handleLanguageSelect(lang.code)}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.languageFlag}>{lang.flag}</ThemedText>
                                    <ThemedText style={styles.languageName} numberOfLines={1}>
                                        {lang.nativeName}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <ThemedText style={[styles.moreLanguages, { color: secondaryText }]}>
                            {i18n.t('moreLanguagesAvailable')}
                        </ThemedText>
                    </View>
                )}
            </View>
        );
    }, [primaryColor, secondaryText, cardBg, locale, handleLanguageSelect]);

    const renderDot = useCallback((index: number) => (
        <View
            key={index}
            style={[
                styles.dot,
                {
                    backgroundColor: index === currentIndex ? primaryColor : secondaryText + '40',
                    width: index === currentIndex ? 24 : 8,
                }
            ]}
        />
    ), [currentIndex, primaryColor, secondaryText]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onComplete}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[
                    styles.container,
                    {
                        backgroundColor,
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 20,
                    }
                ]}>
                    {/* Skip button */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={onComplete}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={[styles.skipText, { color: secondaryText }]}>
                            {i18n.t('skip')}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Steps carousel */}
                    <FlatList
                        ref={flatListRef}
                        data={ONBOARDING_STEPS}
                        renderItem={renderStep}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        bounces={false}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                    />

                    {/* Pagination dots */}
                    <View style={styles.pagination}>
                        {ONBOARDING_STEPS.map((_, index) => renderDot(index))}
                    </View>

                    {/* Navigation buttons */}
                    <View style={styles.navigation}>
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                { opacity: currentIndex === 0 ? 0.3 : 1 }
                            ]}
                            onPress={goToPrevious}
                            disabled={currentIndex === 0}
                            activeOpacity={0.7}
                        >
                            <IconSymbol name="chevron.left" size={20} color={primaryColor} />
                            <ThemedText style={[styles.navText, { color: primaryColor }]}>
                                {i18n.t('previous')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.navButton, styles.nextButton, { backgroundColor: primaryColor }]}
                            onPress={goToNext}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.nextText, { color: contrastColor }]}>
                                {currentIndex === ONBOARDING_STEPS.length - 1
                                    ? i18n.t('getStarted')
                                    : i18n.t('next')}
                            </ThemedText>
                            <IconSymbol
                                name={currentIndex === ONBOARDING_STEPS.length - 1 ? 'checkmark' : 'chevron.right'}
                                size={20}
                                color={contrastColor}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 100,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },
    stepDescription: {
        fontSize: 17,
        lineHeight: 26,
        textAlign: 'center',
        maxWidth: 320,
    },
    languageSelector: {
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
    },
    languageLabel: {
        fontSize: 14,
        marginBottom: 12,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        maxWidth: 320,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
        minWidth: 100,
    },
    languageFlag: {
        fontSize: 18,
    },
    languageName: {
        fontSize: 13,
        fontWeight: '500',
        maxWidth: 70,
    },
    moreLanguages: {
        fontSize: 12,
        marginTop: 12,
        fontStyle: 'italic',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    navText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        minWidth: 140,
        justifyContent: 'center',
    },
    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
