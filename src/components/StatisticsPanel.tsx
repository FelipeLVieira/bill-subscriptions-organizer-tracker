import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Period } from './PeriodSelector';

interface StatisticsPanelProps {
    subscriptions: Subscription[];
    paidThisMonth: number;
    period?: Period;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    delay?: number;
}

function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
    const { colorScheme } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const [displayValue, setDisplayValue] = useState(value);
    const fadeValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver,
                }),
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver,
                }),
            ]),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- animation refs are stable, only run once on mount
    }, []);

    // Animate value changes
    useEffect(() => {
        if (displayValue !== value) {
            Animated.sequence([
                Animated.timing(fadeValue, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver,
                }),
            ]).start(() => {
                setDisplayValue(value);
                Animated.timing(fadeValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver,
                }).start();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fadeValue ref is stable, displayValue comparison is intentional
    }, [value]);

    // Subtle gradient from color to transparent
    const gradientOpacity = colorScheme === 'dark' ? '08' : '06';

    return (
        <Animated.View
            style={[
                styles.statCard,
                {
                    opacity: animatedValue,
                    transform: [{ scale: scaleValue }],
                },
            ]}
        >
            <Card style={styles.cardContent}>
                {/* Subtle gradient overlay */}
                <LinearGradient
                    colors={[color + gradientOpacity, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                />
                <View style={[styles.iconContainer, { backgroundColor: color + '18' }]}>
                    <IconSymbol name={icon as any} size={22} color={color} />
                </View>
                <Animated.View style={{ opacity: fadeValue }}>
                    <ThemedText style={styles.statValue}>{displayValue}</ThemedText>
                </Animated.View>
                <ThemedText style={styles.statTitle}>{title}</ThemedText>
            </Card>
        </Animated.View>
    );
}

export function StatisticsPanel({ subscriptions, paidThisMonth, period = 'monthly' }: StatisticsPanelProps) {
    const infoColor = useThemeColor({}, 'info');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');
    const dangerColor = useThemeColor({}, 'danger');
    useLanguage(); // Re-render on locale change
    const { formatAmount, getCurrencyByCode } = useCurrency();

    // Memoize current date to prevent re-renders
    const now = useMemo(() => new Date(), []);

    // Calculate date ranges based on period
    const { endDate } = useMemo(() => {
        const start = new Date(now);
        const end = new Date(now);

        switch (period) {
            case 'weekly':
                // Start of week (Sunday)
                start.setDate(now.getDate() - now.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'monthly':
                start.setDate(1);
                end.setMonth(now.getMonth() + 1, 0);
                break;
            case 'yearly':
                start.setMonth(0, 1);
                end.setMonth(11, 31);
                break;
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return { startDate: start, endDate: end };
    }, [now, period]);

    // Convert subscription amount to the selected period view
    const getAmountForPeriod = (sub: Subscription) => {
        // First convert to yearly amount (base unit)
        let yearlyAmount: number;
        switch (sub.billingInterval) {
            case 'daily':
                yearlyAmount = sub.amount * 365;
                break;
            case 'weekly':
                yearlyAmount = sub.amount * 52;
                break;
            case 'monthly':
                yearlyAmount = sub.amount * 12;
                break;
            case 'yearly':
                yearlyAmount = sub.amount;
                break;
            case 'unique':
                // One-time bills are not recurring - show full amount in any period
                yearlyAmount = sub.amount;
                break;
            default:
                yearlyAmount = sub.amount * 12; // assume monthly
        }

        // Then convert to the selected period
        switch (period) {
            case 'weekly':
                return yearlyAmount / 52;
            case 'monthly':
                return yearlyAmount / 12;
            case 'yearly':
                return yearlyAmount;
        }
    };

    // Group subscriptions by currency and calculate totals
    const totalsByCurrency = useMemo(() => {
        const groups: Record<string, number> = {};
        subscriptions.forEach(sub => {
            const curr = sub.currency || 'USD';
            groups[curr] = (groups[curr] || 0) + getAmountForPeriod(sub);
        });
        return groups;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- getAmountForPeriod depends on period which is already included
    }, [subscriptions, period]);

    // Format multi-currency totals as a string
    const formatMultiCurrencyTotal = () => {
        const entries = Object.entries(totalsByCurrency);
        if (entries.length === 0) return formatAmount(0, 'USD');
        if (entries.length === 1) {
            const [currencyCode, amount] = entries[0];
            return formatAmount(amount, currencyCode);
        }
        // Multiple currencies - show each separately
        return entries
            .map(([currencyCode, amount]) => {
                const currencyInfo = getCurrencyByCode(currencyCode);
                const symbol = currencyInfo?.symbol || currencyCode;
                return `${symbol}${Math.round(amount)}`;
            })
            .join(' + ');
    };

    // Group pending by currency
    const pendingByCurrency = useMemo(() => {
        const groups: Record<string, number> = {};
        subscriptions
            .filter(sub => {
                const nextDate = new Date(sub.nextBillingDate);
                return nextDate >= now && nextDate <= endDate;
            })
            .forEach(sub => {
                const curr = sub.currency || 'USD';
                groups[curr] = (groups[curr] || 0) + sub.amount;
            });
        return groups;
    }, [subscriptions, now, endDate]);

    // Group overdue by currency
    const overdueByCurrency = useMemo(() => {
        const groups: Record<string, number> = {};
        subscriptions
            .filter(sub => new Date(sub.nextBillingDate) < now)
            .forEach(sub => {
                const curr = sub.currency || 'USD';
                groups[curr] = (groups[curr] || 0) + sub.amount;
            });
        return groups;
    }, [subscriptions, now]);

    // Format multi-currency amounts
    const formatMultiCurrency = (groups: Record<string, number>) => {
        const entries = Object.entries(groups);
        if (entries.length === 0) return '$0';
        if (entries.length === 1) {
            const [currencyCode, amount] = entries[0];
            return formatAmount(amount, currencyCode);
        }
        return entries
            .map(([currencyCode, amount]) => {
                const currencyInfo = getCurrencyByCode(currencyCode);
                const symbol = currencyInfo?.symbol || currencyCode;
                return `${symbol}${Math.round(amount)}`;
            })
            .join(' + ');
    };

    // For paid this period, we use the first currency or default
    const primaryCurrency = Object.keys(totalsByCurrency)[0] || 'USD';
    const paidThisPeriod = (() => {
        switch (period) {
            case 'weekly':
                return paidThisMonth / 4;
            case 'monthly':
                return paidThisMonth;
            case 'yearly':
                return paidThisMonth;
        }
    })();

    const getPeriodLabel = (key: string) => {
        const periodSuffix = period === 'weekly' ? 'Week' : period === 'monthly' ? 'Month' : 'Year';
        const baseKey = key.replace('ThisMonth', `This${periodSuffix}`);
        const translated = i18n.t(baseKey);
        return translated !== baseKey ? translated : i18n.t(key);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <StatCard
                    title={i18n.t(`total${period.charAt(0).toUpperCase() + period.slice(1)}`)}
                    value={formatMultiCurrencyTotal()}
                    icon="dollarsign.circle.fill"
                    color={infoColor}
                    delay={0}
                />
                <StatCard
                    title={getPeriodLabel('paidThisMonth')}
                    value={formatAmount(paidThisPeriod, primaryCurrency)}
                    icon="checkmark.circle.fill"
                    color={successColor}
                    delay={100}
                />
            </View>
            <View style={styles.row}>
                <StatCard
                    title={i18n.t('upcoming')}
                    value={formatMultiCurrency(pendingByCurrency)}
                    icon="calendar.badge.clock"
                    color={warningColor}
                    delay={200}
                />
                <StatCard
                    title={i18n.t('overdueAmount')}
                    value={formatMultiCurrency(overdueByCurrency)}
                    icon="exclamationmark.triangle.fill"
                    color={dangerColor}
                    delay={300}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
    },
    cardContent: {
        padding: 16,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statTitle: {
        fontSize: 11,
        opacity: 0.6,
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});
