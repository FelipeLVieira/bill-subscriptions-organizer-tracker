import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { shadows } from '@/utils/shadow';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

export type Period = 'weekly' | 'monthly' | 'yearly';

interface PeriodSelectorProps {
    value: Period;
    onChange: (period: Period) => void;
}

const PERIODS: Period[] = ['weekly', 'monthly', 'yearly'];
const PADDING = 2;

/**
 * Apple-style Segmented Control
 *
 * Matches iOS UISegmentedControl appearance:
 * - Rounded container with subtle background
 * - White/dark indicator pill
 * - Smooth spring animation
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    const colorScheme = useColorScheme();
    const textColor = useThemeColor({}, 'text');

    // iOS segmented control colors - proper contrast
    const containerBg = colorScheme === 'dark'
        ? 'rgba(118, 118, 128, 0.24)'
        : 'rgba(118, 118, 128, 0.12)';

    const indicatorBg = colorScheme === 'dark'
        ? '#636366' // Medium gray in dark mode
        : '#FFFFFF';

    // Selected text needs contrast with indicator
    const selectedTextColor = colorScheme === 'dark'
        ? '#FFFFFF' // White text on gray indicator
        : '#000000'; // Black text on white indicator

    const [containerWidth, setContainerWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(PERIODS.indexOf(value))).current;

    const optionWidth = containerWidth > 0 ? (containerWidth - PADDING * 2) / PERIODS.length : 0;

    useEffect(() => {
        if (containerWidth > 0) {
            Animated.spring(slideAnim, {
                toValue: PERIODS.indexOf(value),
                friction: 10,
                tension: 80,
                useNativeDriver: false,
            }).start();
        }
    }, [value, slideAnim, containerWidth]);

    const indicatorLeft = useMemo(() => {
        if (optionWidth === 0) return PADDING;
        return slideAnim.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [PADDING, PADDING + optionWidth, PADDING + optionWidth * 2],
        });
    }, [slideAnim, optionWidth]);

    const onLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (width !== containerWidth) {
            setContainerWidth(width);
        }
    };

    return (
        <View
            style={[styles.container, { backgroundColor: containerBg }]}
            onLayout={onLayout}
            accessibilityRole="tablist"
        >
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            backgroundColor: indicatorBg,
                            left: indicatorLeft,
                            width: optionWidth,
                        },
                    ]}
                />
            )}
            {PERIODS.map((period) => (
                <Pressable
                    key={period}
                    style={styles.option}
                    onPress={() => onChange(period)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: value === period }}
                    accessibilityLabel={i18n.t(period)}
                >
                    <Text
                        style={[
                            styles.optionText,
                            { color: value === period ? selectedTextColor : textColor },
                            value === period && styles.selectedText,
                        ]}
                    >
                        {i18n.t(period)}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 9, // iOS standard
        padding: PADDING,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        position: 'relative',
        height: 36, // iOS standard height
    },
    indicator: {
        position: 'absolute',
        top: PADDING,
        bottom: PADDING,
        borderRadius: 7,
        ...shadows.indicator,
    },
    option: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '500',
    },
    selectedText: {
        fontWeight: '600',
    },
});
