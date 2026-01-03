import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCopilot } from 'react-native-copilot';

/**
 * Custom Copilot Tooltip Component
 *
 * Fixes:
 * - Removes white border from step number
 * - Fixes navigation bug by using stable callback refs
 * - Provides iOS-style design
 */
export function CopilotTooltip() {
    const {
        isFirstStep,
        isLastStep,
        goToNext,
        goToPrev,
        stop,
        currentStep,
    } = useCopilot();

    const primaryColor = useThemeColor({}, 'primary');
    const secondaryText = useThemeColor({}, 'textSecondary');

    const onNext = useCallback(async () => {
        await Haptic.light();
        // Use Promise-based API for reliable navigation
        await goToNext();
    }, [goToNext]);

    const onPrev = useCallback(async () => {
        await Haptic.light();
        await goToPrev();
    }, [goToPrev]);

    const onSkip = useCallback(async () => {
        await Haptic.medium();
        await stop();
    }, [stop]);

    const onFinish = useCallback(async () => {
        await Haptic.success();
        await stop();
    }, [stop]);

    return (
        <View style={styles.container}>
            {/* Step content */}
            <ThemedText style={styles.stepText}>
                {currentStep?.text}
            </ThemedText>

            {/* Navigation buttons */}
            <View style={styles.navigation}>
                {!isLastStep ? (
                    <TouchableOpacity
                        onPress={onSkip}
                        style={styles.skipButton}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ThemedText style={[styles.skipText, { color: secondaryText }]}>
                            {i18n.t('skip')}
                        </ThemedText>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.spacer} />
                )}

                <View style={styles.navButtons}>
                    {!isFirstStep && (
                        <TouchableOpacity
                            onPress={onPrev}
                            style={styles.navButton}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <IconSymbol name="chevron.left" size={16} color={primaryColor} />
                            <ThemedText style={[styles.navText, { color: primaryColor }]}>
                                {i18n.t('previous')}
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={isLastStep ? onFinish : onNext}
                        style={[styles.nextButton, { backgroundColor: primaryColor }]}
                        activeOpacity={0.8}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                        <ThemedText style={styles.nextText}>
                            {isLastStep ? i18n.t('done') : i18n.t('next')}
                        </ThemedText>
                        <IconSymbol
                            name={isLastStep ? 'checkmark' : 'chevron.right'}
                            size={16}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

/**
 * Custom Step Number Component
 *
 * Removes the white border from the default implementation
 */
export function CopilotStepNumber() {
    const { currentStepNumber } = useCopilot();
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <View style={[styles.stepNumber, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.stepNumberText}>
                {currentStepNumber}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    stepText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '500',
    },
    spacer: {
        width: 50,
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    navText: {
        fontSize: 15,
        fontWeight: '600',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        minWidth: 80,
        justifyContent: 'center',
    },
    nextText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Step number (badge) - no white border
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        // No border - this fixes the white border issue
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
