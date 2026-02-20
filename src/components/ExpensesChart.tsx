import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { getSubscriptionIcon } from '@/constants/companyIcons';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type ViewMode = 'category' | 'bill';

interface ExpensesChartProps {
    subscriptions: Subscription[];
}

export function ExpensesChart({ subscriptions }: ExpensesChartProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useLanguage(); // Re-render on locale change
    const { formatAmount, getCurrencyByCode } = useCurrency();

    // Get unique currencies from subscriptions
    const availableCurrencies = useMemo(() => {
        const currencies = new Set(subscriptions.map(sub => sub.currency || 'USD'));
        return Array.from(currencies);
    }, [subscriptions]);

    const [selectedCurrency, setSelectedCurrency] = useState<string>(availableCurrencies[0] || 'USD');
    const [viewMode, setViewMode] = useState<ViewMode>('category');

    // Update selected currency if it's no longer available
    useEffect(() => {
        if (!availableCurrencies.includes(selectedCurrency) && availableCurrencies.length > 0) {
            setSelectedCurrency(availableCurrencies[0]);
        }
    }, [availableCurrencies, selectedCurrency]);

    const defaultColors = useMemo(() => [
        primaryColor,
        '#FFB300', // Amber
        '#FF5722', // Deep Orange
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#E91E63', // Pink
        '#795548', // Brown
    ], [primaryColor]);

    // Filter subscriptions by selected currency
    const filteredSubscriptions = useMemo(() =>
        subscriptions.filter(sub => (sub.currency || 'USD') === selectedCurrency),
        [subscriptions, selectedCurrency]
    );

    const total = useMemo(() =>
        filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
        [filteredSubscriptions]
    );

    // Group by category
    const byCategory = useMemo(() =>
        filteredSubscriptions.reduce((acc, sub) => {
            const category = sub.categoryGroup || 'Uncategorized';
            acc[category] = (acc[category] || 0) + sub.amount;
            return acc;
        }, {} as Record<string, number>),
        [filteredSubscriptions]
    );

    // Generate chart data based on view mode
    const data = useMemo(() => {
        if (total === 0) return [];

        if (viewMode === 'category') {
            return Object.keys(byCategory).map((category, index) => ({
                value: byCategory[category],
                text: `${((byCategory[category] / total) * 100).toFixed(0)}%`,
                color: defaultColors[index % defaultColors.length],
                textColor: '#FFFFFF',
                label: i18n.t(`cat_${category.toLowerCase().replace(' ', '_')}`, { defaultValue: category }),
            }));
        } else {
            // By individual bill
            return filteredSubscriptions.map((sub, index) => {
                const companyIcon = getSubscriptionIcon(sub);
                return {
                    value: sub.amount,
                    text: `${((sub.amount / total) * 100).toFixed(0)}%`,
                    color: companyIcon.color || defaultColors[index % defaultColors.length],
                    textColor: '#FFFFFF',
                    label: sub.name,
                };
            });
        }
    }, [viewMode, byCategory, filteredSubscriptions, total, defaultColors]);

    useEffect(() => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver,
            }),
        ]).start();
    }, [subscriptions.length, selectedCurrency, viewMode, fadeAnim, scaleAnim]);

    // Early returns after all hooks
    if (!subscriptions || subscriptions.length === 0) return null;
    if (total === 0) return null;

    const chartTitle = viewMode === 'category' ? i18n.t('spendByCategory') : i18n.t('spendByBill');

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Card style={styles.card}>
                {/* View Mode Toggle */}
                <View style={[styles.viewModeContainer, { backgroundColor }]}>
                    <TouchableOpacity
                        style={[
                            styles.viewModeTab,
                            viewMode === 'category' && { backgroundColor: buttonPrimaryColor }
                        ]}
                        onPress={() => setViewMode('category')}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: viewMode === 'category' }}
                        accessibilityLabel={i18n.t('spendByCategory')}
                    >
                        <ThemedText
                            style={[
                                styles.viewModeText,
                                viewMode === 'category' && { color: '#FFFFFF' }
                            ]}
                        >
                            {i18n.t('byCategory')}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.viewModeTab,
                            viewMode === 'bill' && { backgroundColor: buttonPrimaryColor }
                        ]}
                        onPress={() => setViewMode('bill')}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: viewMode === 'bill' }}
                        accessibilityLabel={i18n.t('spendByBill')}
                    >
                        <ThemedText
                            style={[
                                styles.viewModeText,
                                viewMode === 'bill' && { color: '#FFFFFF' }
                            ]}
                        >
                            {i18n.t('byBill')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText type="subtitle" style={styles.title}>{chartTitle}</ThemedText>

                {/* Currency Tabs */}
                {availableCurrencies.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.currencyTabs}
                        contentContainerStyle={styles.currencyTabsContent}
                        accessibilityRole="tablist"
                    >
                        {availableCurrencies.map(currCode => {
                            const currInfo = getCurrencyByCode(currCode);
                            const isSelected = currCode === selectedCurrency;
                            return (
                                <TouchableOpacity
                                    key={currCode}
                                    style={[
                                        styles.currencyTab,
                                        isSelected && { backgroundColor: buttonPrimaryColor }
                                    ]}
                                    onPress={() => setSelectedCurrency(currCode)}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: isSelected }}
                                    accessibilityLabel={`${currInfo?.name || currCode} ${i18n.t('currency')}`}
                                >
                                    <ThemedText
                                        style={[
                                            styles.currencyTabText,
                                            isSelected && { color: '#FFFFFF' }
                                        ]}
                                    >
                                        {currInfo?.symbol || currCode} {currCode}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                <View style={styles.chartContainer}>
                    <PieChart
                        data={data}
                        donut
                        showGradient
                        sectionAutoFocus
                        radius={70}
                        innerRadius={50}
                        innerCircleColor={cardColor}
                        centerLabelComponent={() => (
                            <View style={styles.centerLabel}>
                                <ThemedText style={[styles.centerValue, { color: textColor }]}>
                                    {formatAmount(total, selectedCurrency)}
                                </ThemedText>
                                <ThemedText style={[styles.centerText, { color: textColor }]}>{i18n.t('total')}</ThemedText>
                            </View>
                        )}
                    />
                </View>
                <View style={styles.legend}>
                    {data.map((d, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.legendItem,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
                                }
                            ]}
                        >
                            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                            <ThemedText style={styles.legendText}>{d.label}</ThemedText>
                            <ThemedText style={styles.legendValue}>{formatAmount(d.value, selectedCurrency)}</ThemedText>
                        </Animated.View>
                    ))}
                </View>
            </Card>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    card: {
        padding: 16,
    },
    viewModeContainer: {
        flexDirection: 'row',
        borderRadius: 10,
        padding: 4,
        marginBottom: 12,
    },
    viewModeTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    viewModeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    currencyTabs: {
        marginBottom: 16,
    },
    currencyTabsContent: {
        gap: 12,
    },
    currencyTab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: 'rgba(128,128,128,0.15)',
        minHeight: 44, // iOS HIG minimum touch target
        justifyContent: 'center',
    },
    currencyTabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    centerLabel: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    centerText: {
        fontSize: 10,
        opacity: 0.7,
    },
    legend: {
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 13,
        flex: 1,
    },
    legendValue: {
        fontSize: 13,
        fontWeight: '600',
    },
});
