import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, FlatList, RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

import { GoProButton } from '@/components/GoProButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { getSubscriptionIcon } from '@/constants/companyIcons';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePro } from '@/contexts/ProContext';
import { Subscription, deleteSubscription, getSubscriptions, paySubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import { isTablet } from '@/utils/responsive';

const WalkthroughableView = walkthroughable(View);

type ViewMode = 'list' | 'grouped' | 'currency';
type CategoryFilter = 'all' | string;

export default function MyBillsScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('currency');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const primaryColor = useThemeColor({}, 'primary');
    const interactiveColor = useThemeColor({}, 'interactive');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const statusOverdue = useThemeColor({}, 'statusOverdue');
    const statusPaid = useThemeColor({}, 'statusPaid');
    const dangerColor = useThemeColor({}, 'danger');
    const { locale } = useLanguage();
    const { getCurrencyByCode, formatAmount } = useCurrency();
    const { showSuccess } = useToast();
    const { isPro } = usePro();
  const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const data = await getSubscriptions();
        setSubscriptions(data);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAction = async (item: Subscription) => {
        await Haptic.medium();
        Alert.alert(item.name, i18n.t('chooseAction'), [
            { text: i18n.t('cancel'), style: 'cancel' },
            {
                text: i18n.t('markAsPaid'),
                onPress: async () => {
                    await paySubscription(item);
                    await Haptic.success();
                    showSuccess(i18n.t('subscriptionUpdated'));
                    loadData();
                }
            },
            {
                text: i18n.t('delete'),
                style: 'destructive',
                onPress: async () => {
                    await Haptic.heavy();
                    await deleteSubscription(item.id);
                    loadData();
                }
            }
        ]);
    };

    // Get unique categories from subscriptions
    const categories = useMemo(() => {
        const cats = new Set<string>();
        subscriptions.forEach(s => {
            if (s.categoryGroup) cats.add(s.categoryGroup);
        });
        return Array.from(cats).sort();
    }, [subscriptions]);

    const filteredData = useMemo(() => {
        let data = subscriptions;

        // Apply category filter
        if (categoryFilter !== 'all') {
            data = data.filter(s => s.categoryGroup === categoryFilter);
        }

        // Apply search filter
        if (query) {
            const lower = query.toLowerCase();
            data = data.filter(s =>
                s.name.toLowerCase().includes(lower) ||
                s.notes?.toLowerCase().includes(lower) ||
                s.categoryGroup?.toLowerCase().includes(lower) ||
                s.amount.toString().includes(lower)
            );
        }

        // Sort: overdue first, then upcoming, then later
        return [...data].sort((a, b) => {
            const now = new Date();
            const dateA = new Date(a.nextBillingDate);
            const dateB = new Date(b.nextBillingDate);
            const isOverdueA = dateA < now;
            const isOverdueB = dateB < now;

            if (isOverdueA && !isOverdueB) return -1;
            if (!isOverdueA && isOverdueB) return 1;
            return dateA.getTime() - dateB.getTime();
        });
    }, [query, subscriptions, categoryFilter]);

    // Group data by category for grouped view
    const groupedData = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const groups: { title: string; data: Subscription[] }[] = [];
        const overdue: Subscription[] = [];
        const upcoming: Subscription[] = [];
        const later: Subscription[] = [];

        filteredData.forEach(sub => {
            const date = new Date(sub.nextBillingDate);
            if (date < now) {
                overdue.push(sub);
            } else if (date <= sevenDaysFromNow) {
                upcoming.push(sub);
            } else {
                later.push(sub);
            }
        });

        if (overdue.length > 0) groups.push({ title: i18n.t('overdue'), data: overdue });
        if (upcoming.length > 0) groups.push({ title: i18n.t('upcoming'), data: upcoming });
        if (later.length > 0) groups.push({ title: i18n.t('later'), data: later });

        return groups;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- locale triggers i18n updates for group titles
    }, [filteredData, locale]);

    // Group data by currency
    const currencyGroupedData = useMemo(() => {
        const byCurrency: Record<string, { subs: Subscription[]; subtotal: number }> = {};

        filteredData.forEach(sub => {
            const curr = sub.currency || 'USD';
            if (!byCurrency[curr]) {
                byCurrency[curr] = { subs: [], subtotal: 0 };
            }
            byCurrency[curr].subs.push(sub);
            byCurrency[curr].subtotal += sub.amount;
        });

        return Object.entries(byCurrency).map(([currency, { subs, subtotal }]) => {
            const currInfo = getCurrencyByCode(currency);
            return {
                title: `${currInfo?.symbol || currency} ${currency}`,
                data: subs,
                subtotal,
                currency,
            };
        });
    }, [filteredData, getCurrencyByCode]);

    // Get overdue bills count for mark all paid button
    const overdueCount = useMemo(() => {
        const now = new Date();
        return filteredData.filter(s => new Date(s.nextBillingDate) < now).length;
    }, [filteredData]);

    const handleMarkAllPaid = useCallback(async () => {
        const now = new Date();
        const overdueBills = filteredData.filter(s => new Date(s.nextBillingDate) < now);

        if (overdueBills.length === 0) return;

        await Haptic.medium();
        Alert.alert(
            i18n.t('markAllPaid'),
            i18n.t('markAllPaidConfirm'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('markAsPaid'),
                    onPress: async () => {
                        for (const bill of overdueBills) {
                            await paySubscription(bill);
                        }
                        await Haptic.success();
                        showSuccess(i18n.t('allPaidSuccess'));
                        loadData();
                    }
                }
            ]
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, showSuccess]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(i18n.locale, {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const renderItem = ({ item, index }: { item: Subscription; index: number }) => {
        const nextDate = new Date(item.nextBillingDate);
        const now = new Date();
        const isOverdue = nextDate < now;
        const dateColor = isOverdue ? statusOverdue : statusPaid;
        const companyIcon = getSubscriptionIcon(item);

        return (
            <AnimatedCard
                index={index}
                onLongPress={() => handleAction(item)}
                onPress={() => router.push(`/subscription/${item.id}`)}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.cardIcon, { backgroundColor: companyIcon.color + '20' }]}>
                        <IconSymbol name={companyIcon.icon as any} size={20} color={companyIcon.color} />
                    </View>
                    <View style={styles.cardInfo}>
                        <View style={styles.cardHeader}>
                            <ThemedText type="subtitle">{item.name}</ThemedText>
                            <ThemedText type="defaultSemiBold">{formatCurrency(item.amount, item.currency)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                {i18n.t(item.billingInterval)} {item.categoryGroup ? `• ${item.categoryGroup}` : ''}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: dateColor }}>
                                {i18n.t('next')}: {nextDate.toLocaleDateString(i18n.locale)}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </AnimatedCard>
        );
    };

    const renderSectionHeader = ({ section }: { section: { title: string; subtotal?: number; currency?: string } }) => (
        <View style={[styles.sectionHeader, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{section.title}</ThemedText>
            {section.subtotal !== undefined && section.currency && (
                <ThemedText style={[styles.sectionSubtotal, { color: primaryColor }]}>
                    {formatAmount(section.subtotal, section.currency)}
                </ThemedText>
            )}
        </View>
    );

    // Check if we're on a tablet for adaptive layout
    const tablet = isTablet();

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, tablet && styles.tabletHeader]}>
                {/* Go Pro Banner - always show at top if not pro */}
                {!isPro && <GoProButton variant="banner" style={styles.proBannerHeader} />}

                {/* Search bar */}
                <CopilotStep text={i18n.t('copilotBillsSearch')} order={11} name="bills-search">
                    <WalkthroughableView>
                        <View style={styles.searchContainer}>
                            <IconSymbol name="magnifyingglass" size={20} color={textColor} style={{ opacity: 0.5 }} />
                            <Input
                                placeholder={i18n.t('searchBills')}
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

                {/* Filter and View Controls */}
                <View style={styles.controlsRow}>
                    {/* Category Filter */}
                    <CopilotStep text={i18n.t('copilotBillsFilter')} order={12} name="bills-filter">
                        <WalkthroughableView>
                            <View style={styles.filterContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: categoryFilter === 'all' ? interactiveColor : cardColor }
                                    ]}
                                    onPress={() => {
                                        Haptic.selection();
                                        setCategoryFilter('all');
                                    }}
                                    accessibilityLabel={i18n.t('allCategories')}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: categoryFilter === 'all' }}
                                >
                                    <ThemedText style={[
                                        styles.filterChipText,
                                        { color: categoryFilter === 'all' ? '#FFFFFF' : textColor }
                                    ]}>
                                        {i18n.t('allCategories')}
                                    </ThemedText>
                                </TouchableOpacity>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.filterChip,
                                            { backgroundColor: categoryFilter === cat ? interactiveColor : cardColor }
                                        ]}
                                        onPress={() => {
                                            Haptic.selection();
                                            setCategoryFilter(cat);
                                        }}
                                        accessibilityLabel={cat}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: categoryFilter === cat }}
                                    >
                                        <ThemedText style={[
                                            styles.filterChipText,
                                            { color: categoryFilter === cat ? '#FFFFFF' : textColor }
                                        ]}>
                                            {cat}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </WalkthroughableView>
                    </CopilotStep>



                    {/* View Toggle and Mark All Paid */}
                    <View style={styles.actionsRow}>
                        <CopilotStep text={i18n.t('copilotBillsView')} order={13} name="bills-view">
                            <WalkthroughableView>
                                <View style={styles.viewToggle}>
                                    <TouchableOpacity
                                        style={[
                                            styles.viewToggleBtn,
                                            { backgroundColor: viewMode === 'list' ? interactiveColor : cardColor }
                                        ]}
                                        onPress={() => {
                                            Haptic.selection();
                                            setViewMode('list');
                                        }}
                                        accessibilityLabel={i18n.t('listView')}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: viewMode === 'list' }}
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
                                            { backgroundColor: viewMode === 'grouped' ? interactiveColor : cardColor }
                                        ]}
                                        onPress={() => {
                                            Haptic.selection();
                                            setViewMode('grouped');
                                        }}
                                        accessibilityLabel={i18n.t('groupView')}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: viewMode === 'grouped' }}
                                    >
                                        <IconSymbol
                                            name="rectangle.3.group"
                                            size={16}
                                            color={viewMode === 'grouped' ? '#FFFFFF' : textColor}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.viewToggleBtn,
                                            { backgroundColor: viewMode === 'currency' ? interactiveColor : cardColor }
                                        ]}
                                        onPress={() => {
                                            Haptic.selection();
                                            setViewMode('currency');
                                        }}
                                        accessibilityLabel={i18n.t('currency')}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: viewMode === 'currency' }}
                                    >
                                        <IconSymbol
                                            name="dollarsign.circle"
                                            size={16}
                                            color={viewMode === 'currency' ? '#FFFFFF' : textColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </WalkthroughableView>
                        </CopilotStep>

                        {overdueCount > 0 && (
                            <TouchableOpacity
                                style={[styles.markAllPaidBtn, { backgroundColor: dangerColor }]}
                                onPress={handleMarkAllPaid}
                                accessibilityLabel={`${i18n.t('markAllPaid')}, ${overdueCount} bills`}
                                accessibilityRole="button"
                            >
                                <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                                <ThemedText style={styles.markAllPaidText}>
                                    {i18n.t('markAllPaid')} ({overdueCount})
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.list, tablet && styles.tabletList, { paddingBottom: insets.bottom + 100 }]}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    initialNumToRender={8}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconSymbol name="doc.text.magnifyingglass" size={60} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchTitle') : i18n.t('emptyBillsTitle')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchHint') : i18n.t('emptyBillsHint')}
                            </ThemedText>

                        </View>
                    }
                />
            ) : viewMode === 'grouped' ? (
                <SectionList
                    sections={groupedData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={[styles.list, tablet && styles.tabletList, { paddingBottom: insets.bottom + 100 }]}
                    stickySectionHeadersEnabled={true}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    initialNumToRender={8}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconSymbol name="doc.text.magnifyingglass" size={60} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchTitle') : i18n.t('emptyBillsTitle')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchHint') : i18n.t('emptyBillsHint')}
                            </ThemedText>
                        </View>
                    }
                />
            ) : (
                <SectionList
                    sections={currencyGroupedData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={[styles.list, tablet && styles.tabletList, { paddingBottom: insets.bottom + 100 }]}
                    stickySectionHeadersEnabled={true}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    initialNumToRender={8}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconSymbol name="doc.text.magnifyingglass" size={60} color={primaryColor} style={{ opacity: 0.5 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchTitle') : i18n.t('emptyBillsTitle')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {query || categoryFilter !== 'all' ? i18n.t('emptySearchHint') : i18n.t('emptyBillsHint')}
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
    controlsRow: {
        marginTop: 12,
        gap: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        minHeight: 44, // iOS HIG minimum touch target
        justifyContent: 'center',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewToggle: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
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
    markAllPaidBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        minHeight: 44, // iOS HIG minimum touch target
    },
    markAllPaidText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 8,
        // paddingBottom: dynamic via contentContainerStyle
        gap: 12,
    },
    card: {},
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    sectionSubtotal: {
        fontSize: 14,
        fontWeight: '700',
    },
    empty: {
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 16,
        // paddingBottom: dynamic via contentContainerStyle
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
    proBannerHeader: {
        marginTop: 8,
        marginBottom: 24,
    },
    // iPad-specific styles for better readability
    tabletHeader: {
        maxWidth: 600,
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
