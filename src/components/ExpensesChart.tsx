import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface ExpensesChartProps {
    subscriptions: Subscription[];
}

export function ExpensesChart({ subscriptions }: ExpensesChartProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
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

    // Update selected currency if it's no longer available
    useEffect(() => {
        if (!availableCurrencies.includes(selectedCurrency) && availableCurrencies.length > 0) {
            setSelectedCurrency(availableCurrencies[0]);
        }
    }, [availableCurrencies, selectedCurrency]);

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
    }, [subscriptions.length, selectedCurrency, fadeAnim, scaleAnim]);

    if (!subscriptions || subscriptions.length === 0) return null;

    // Filter subscriptions by selected currency
    const filteredSubscriptions = subscriptions.filter(
        sub => (sub.currency || 'USD') === selectedCurrency
    );

    const total = filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    // Group by category
    const byCategory = filteredSubscriptions.reduce((acc, sub) => {
        const category = sub.categoryGroup || 'Uncategorized';
        acc[category] = (acc[category] || 0) + sub.amount;
        return acc;
    }, {} as Record<string, number>);

    const colors = [
        primaryColor,
        '#FFB300', // Amber
        '#FF5722', // Deep Orange
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#E91E63', // Pink
        '#795548', // Brown
    ];

    const data = Object.keys(byCategory).map((category, index) => ({
        value: byCategory[category],
        text: `${((byCategory[category] / total) * 100).toFixed(0)}%`,
        color: colors[index % colors.length],
        textColor: '#FFFFFF',
        label: i18n.t(`cat_${category.toLowerCase().replace(' ', '_')}`, { defaultValue: category }),
    }));

    if (total === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Card style={styles.card}>
                <ThemedText type="subtitle" style={styles.title}>{i18n.t('spendByCategory')}</ThemedText>

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
                                        isSelected && { backgroundColor: primaryColor }
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
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    currencyTabs: {
        marginBottom: 16,
    },
    currencyTabsContent: {
        gap: 10,
    },
    currencyTab: {
        paddingHorizontal: 18,
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
