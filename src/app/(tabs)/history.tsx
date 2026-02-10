import { GoProButton } from '@/components/GoProButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePro } from '@/contexts/ProContext';
import { getAllBillingHistory, getSubscriptions } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { isTablet } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

const WalkthroughableView = walkthroughable(View);

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
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const successColor = useThemeColor({}, 'success');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const { locale } = useLanguage();
    const { formatAmount, defaultCurrency } = useCurrency();
    const { isPro } = usePro();
  const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const subs = await getSubscriptions();

        const history = await getAllBillingHistory();

        // Map history to include subscription names
        const paymentRecords: PaymentRecord[] = history.map((h: { id: number; subscriptionId: number | null; datePaid: string; amountPaid: number }) => {
            const sub = subs.find((s: { id: number }) => s.id === h.subscriptionId);
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

    // Check if we're on a tablet for adaptive layout
    const tablet = isTablet();

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, tablet && styles.tabletHeader]}>
                {/* Go Pro Banner - always show at top if not pro */}
                {!isPro && <GoProButton variant="banner" style={styles.proBannerHeader} />}

                {/* Search bar */}
                <CopilotStep text={i18n.t('copilotHistorySearch')} order={21} name="history-search">
                    <WalkthroughableView>
                        <View style={styles.searchContainer}>
                            <IconSymbol name="magnifyingglass" size={20} color={textColor} style={{ opacity: 0.5 }} />
                            <Input
                                placeholder={i18n.t('searchPayments')}
                                value={query}
                                onChangeText={setQuery}
                                containerStyle={styles.input}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setQuery('')}
                                    accessibilityLabel={i18n.t('cancel')}
                                    accessibilityRole="button"
                                >
                                    <IconSymbol name="xmark.circle.fill" size={20} color={textColor} style={{ opacity: 0.5 }} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </WalkthroughableView>
                </CopilotStep>

                {/* Total Summary - with gradient */}
                <Card style={styles.summaryCard}>
                    <LinearGradient
                        colors={[successColor + '10', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.summaryGradient}
                    />
                    <View style={[styles.summaryIconContainer, { backgroundColor: successColor + '18' }]}>
                        <IconSymbol name="checkmark.circle.fill" size={24} color={successColor} />
                    </View>
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
                    <CopilotStep text={i18n.t('copilotHistoryView')} order={22} name="history-view">
                        <WalkthroughableView>
                            <View style={styles.viewToggle} accessibilityRole="radiogroup">
                                <TouchableOpacity
                                    style={[
                                        styles.viewToggleBtn,
                                        { backgroundColor: viewMode === 'list' ? buttonPrimaryColor : cardColor }
                                    ]}
                                    onPress={() => setViewMode('list')}
                                    accessibilityLabel={i18n.t('listView')}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: viewMode === 'list' }}
                                >
                                    <IconSymbol
                                        name="list.bullet"
                                        size={18}
                                        color={viewMode === 'list' ? '#FFFFFF' : textColor}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.viewToggleBtn,
                                        { backgroundColor: viewMode === 'grouped' ? buttonPrimaryColor : cardColor }
                                    ]}
                                    onPress={() => setViewMode('grouped')}
                                    accessibilityLabel={i18n.t('groupView')}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: viewMode === 'grouped' }}
                                >
                                    <IconSymbol
                                        name="rectangle.3.group"
                                        size={18}
                                        color={viewMode === 'grouped' ? '#FFFFFF' : textColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </WalkthroughableView>
                    </CopilotStep>

                    {/* Group By Toggle (only visible in grouped mode, but always registered for copilot) */}
                    <CopilotStep
                        text={i18n.t('copilotHistoryGroup')}
                        order={23}
                        name="history-group"
                        active={viewMode === 'grouped'}
                    >
                        <WalkthroughableView>
                            {viewMode === 'grouped' && (
                                <View style={styles.groupByToggle} accessibilityRole="radiogroup">
                                    <TouchableOpacity
                                        style={[
                                            styles.groupByBtn,
                                            { backgroundColor: groupBy === 'date' ? buttonPrimaryColor : cardColor }
                                        ]}
                                        onPress={() => setGroupBy('date')}
                                        accessibilityLabel={i18n.t('byDate')}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: groupBy === 'date' }}
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
                                            { backgroundColor: groupBy === 'subscription' ? buttonPrimaryColor : cardColor }
                                        ]}
                                        onPress={() => setGroupBy('subscription')}
                                        accessibilityLabel={i18n.t('byBill')}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: groupBy === 'subscription' }}
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
                        </WalkthroughableView>
                    </CopilotStep>
                </View>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.list, tablet && styles.tabletList, { paddingBottom: insets.bottom + 100 }]}
                    removeClippedSubviews
                    maxToRenderPerBatch={15}
                    initialNumToRender={10}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty} accessibilityRole="text">
                            <IconSymbol name="clock.arrow.circlepath" size={60} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {query ? i18n.t('emptySearchTitle') : i18n.t('emptyHistoryTitle')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {query ? i18n.t('emptySearchHint') : i18n.t('emptyHistoryHint')}
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
                    contentContainerStyle={[styles.list, tablet && styles.tabletList, { paddingBottom: insets.bottom + 100 }]}
                    stickySectionHeadersEnabled={true}
                    removeClippedSubviews
                    maxToRenderPerBatch={15}
                    initialNumToRender={10}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty} accessibilityRole="text">
                            <IconSymbol name="clock.arrow.circlepath" size={60} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {query ? i18n.t('emptySearchTitle') : i18n.t('emptyHistoryTitle')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {query ? i18n.t('emptySearchHint') : i18n.t('emptyHistoryHint')}
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
        gap: 12,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        marginBottom: 0,
    },
    summaryCard: {
        padding: 20,
        alignItems: 'center',
        marginTop: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    summaryGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    summaryValue: {
        marginVertical: 6,
        letterSpacing: -0.5,
    },
    summaryCount: {
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '500',
    },
    proBannerHeader: {
        marginTop: 8,
        marginBottom: 24,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    viewToggle: {
        flexDirection: 'row',
        borderRadius: 12,
        gap: 6,
    },
    viewToggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        minWidth: 52,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupByToggle: {
        flexDirection: 'row',
        borderRadius: 12,
        gap: 6,
    },
    groupByBtn: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 10,
        minHeight: 50,
        justifyContent: 'center',
    },
    groupByText: {
        fontSize: 15,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 8,
        // paddingBottom: dynamic via contentContainerStyle
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
        marginTop: 20,
        padding: 16,
    },
    emptyTitle: {
        marginTop: 16,
        textAlign: 'center',
    },
    emptyHint: {
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.6,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    // iPad-specific styles for better readability
    tabletHeader: {
        maxWidth: 600,
        maxHeight: 350,
        alignSelf: 'center',
        width: '100%',
    },
    tabletList: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
});
