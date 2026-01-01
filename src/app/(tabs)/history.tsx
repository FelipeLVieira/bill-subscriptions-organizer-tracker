import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSubscriptions } from '@/db/actions';
import { billingHistory } from '@/db/schema';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { db } from '@/db';
import { desc } from 'drizzle-orm';

type ViewMode = 'list' | 'grouped';
type GroupBy = 'date' | 'subscription';

interface PaymentRecord {
    id: number;
    subscriptionId: number | null;
    subscriptionName: string;
    datePaid: string;
    amountPaid: number;
    currency: string;
}

export default function PaymentHistoryScreen() {
    const [query, setQuery] = useState('');
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [groupBy, setGroupBy] = useState<GroupBy>('date');

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const { locale } = useLanguage();
    const { formatAmount, defaultCurrency } = useCurrency();

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const subs = await getSubscriptions();

        const history = await db.select().from(billingHistory).orderBy(desc(billingHistory.datePaid));

        // Map history to include subscription names
        const paymentRecords: PaymentRecord[] = history.map(h => {
            const sub = subs.find(s => s.id === h.subscriptionId);
            return {
                id: h.id,
                subscriptionId: h.subscriptionId,
                subscriptionName: sub?.name || 'Unknown',
                datePaid: h.datePaid,
                amountPaid: h.amountPaid,
                currency: sub?.currency || 'USD',
            };
        });

        setPayments(paymentRecords);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const filteredData = useMemo(() => {
        if (!query) return payments;

        const lower = query.toLowerCase();
        return payments.filter(p =>
            p.subscriptionName.toLowerCase().includes(lower) ||
            p.amountPaid.toString().includes(lower) ||
            new Date(p.datePaid).toLocaleDateString(locale).includes(lower)
        );
    }, [query, payments, locale]);

    // Group data for section list
    const groupedData = useMemo(() => {
        if (groupBy === 'date') {
            // Group by month
            const groups: Record<string, PaymentRecord[]> = {};
            filteredData.forEach(payment => {
                const date = new Date(payment.datePaid);
                const key = date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
                if (!groups[key]) groups[key] = [];
                groups[key].push(payment);
            });
            return Object.entries(groups).map(([title, data]) => ({ title, data }));
        } else {
            // Group by subscription
            const groups: Record<string, PaymentRecord[]> = {};
            filteredData.forEach(payment => {
                const key = payment.subscriptionName;
                if (!groups[key]) groups[key] = [];
                groups[key].push(payment);
            });
            return Object.entries(groups)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([title, data]) => ({ title, data }));
        }
    }, [filteredData, groupBy, locale]);

    // Calculate totals
    const totalAmount = useMemo(() => {
        return filteredData.reduce((sum, p) => sum + p.amountPaid, 0);
    }, [filteredData]);

    const formatCurrencyAmount = (amount: number, currencyCode?: string) => {
        return formatAmount(amount, currencyCode || defaultCurrency?.code || 'USD');
    };

    const renderItem = ({ item }: { item: PaymentRecord }) => {
        const date = new Date(item.datePaid);

        return (
            <Card style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.cardInfo}>
                        <ThemedText type="subtitle" style={styles.cardTitle}>
                            {item.subscriptionName}
                        </ThemedText>
                        <ThemedText style={styles.cardDate}>
                            {date.toLocaleDateString(locale, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.cardAmount}>
                        {formatCurrencyAmount(item.amountPaid, item.currency)}
                    </ThemedText>
                </View>
            </Card>
        );
    };

    const renderSectionHeader = ({ section }: { section: { title: string; data: PaymentRecord[] } }) => {
        const sectionTotal = section.data.reduce((sum, p) => sum + p.amountPaid, 0);
        return (
            <View style={[styles.sectionHeader, { backgroundColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>{section.title}</ThemedText>
                <ThemedText style={styles.sectionTotal}>{formatCurrencyAmount(sectionTotal)}</ThemedText>
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                {/* Search bar */}
                <View style={styles.searchContainer}>
                    <IconSymbol name="magnifyingglass" size={20} color={textColor} style={{ opacity: 0.5 }} />
                    <Input
                        placeholder={i18n.t('searchPayments')}
                        value={query}
                        onChangeText={setQuery}
                        style={styles.input}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={20} color={textColor} style={{ opacity: 0.5 }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Total Summary */}
                <Card style={styles.summaryCard}>
                    <ThemedText style={styles.summaryLabel}>{i18n.t('totalPaid')}</ThemedText>
                    <ThemedText type="title" style={styles.summaryValue}>
                        {formatCurrencyAmount(totalAmount)}
                    </ThemedText>
                    <ThemedText style={styles.summaryCount}>
                        {filteredData.length} {i18n.t('payments')}
                    </ThemedText>
                </Card>

                {/* Controls */}
                <View style={styles.controlsRow}>
                    {/* View Toggle */}
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[
                                styles.viewToggleBtn,
                                { backgroundColor: viewMode === 'list' ? primaryColor : cardColor }
                            ]}
                            onPress={() => setViewMode('list')}
                        >
                            <IconSymbol
                                name="list.bullet"
                                size={16}
                                color={viewMode === 'list' ? '#FFFFFF' : textColor}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.viewToggleBtn,
                                { backgroundColor: viewMode === 'grouped' ? primaryColor : cardColor }
                            ]}
                            onPress={() => setViewMode('grouped')}
                        >
                            <IconSymbol
                                name="rectangle.3.group"
                                size={16}
                                color={viewMode === 'grouped' ? '#FFFFFF' : textColor}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Group By Toggle (only in grouped mode) */}
                    {viewMode === 'grouped' && (
                        <View style={styles.groupByToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.groupByBtn,
                                    { backgroundColor: groupBy === 'date' ? primaryColor : cardColor }
                                ]}
                                onPress={() => setGroupBy('date')}
                            >
                                <ThemedText style={[
                                    styles.groupByText,
                                    { color: groupBy === 'date' ? '#FFFFFF' : textColor }
                                ]}>
                                    {i18n.t('byDate')}
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.groupByBtn,
                                    { backgroundColor: groupBy === 'subscription' ? primaryColor : cardColor }
                                ]}
                                onPress={() => setGroupBy('subscription')}
                            >
                                <ThemedText style={[
                                    styles.groupByText,
                                    { color: groupBy === 'subscription' ? '#FFFFFF' : textColor }
                                ]}>
                                    {i18n.t('byBill')}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconSymbol name="clock.arrow.circlepath" size={50} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText style={{ marginTop: 16, opacity: 0.6 }}>
                                {i18n.t('noPaymentHistory')}
                            </ThemedText>
                        </View>
                    }
                />
            ) : (
                <SectionList
                    sections={groupedData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={styles.list}
                    stickySectionHeadersEnabled={true}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconSymbol name="clock.arrow.circlepath" size={50} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText style={{ marginTop: 16, opacity: 0.6 }}>
                                {i18n.t('noPaymentHistory')}
                            </ThemedText>
                        </View>
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        marginBottom: 0,
    },
    summaryCard: {
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    summaryValue: {
        marginVertical: 4,
    },
    summaryCount: {
        fontSize: 12,
        opacity: 0.7,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    viewToggle: {
        flexDirection: 'row',
        borderRadius: 8,
        gap: 2,
    },
    viewToggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    groupByToggle: {
        flexDirection: 'row',
        borderRadius: 8,
        gap: 2,
    },
    groupByBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    groupByText: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100,
        gap: 8,
    },
    card: {
        padding: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
    },
    cardDate: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },
    cardAmount: {
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    sectionTotal: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.7,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
});
