import { ExpensesChart } from '@/components/ExpensesChart';
import { GoProButton } from '@/components/GoProButton';
import { Period, PeriodSelector } from '@/components/PeriodSelector';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedFAB } from '@/components/ui/AnimatedFAB';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEFAULT_ICON, getCompanyIcon } from '@/constants/companyIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePro } from '@/contexts/ProContext';
import { Subscription, deleteSubscription, getPaidThisMonth, getSubscriptions, paySubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

const WalkthroughableView = walkthroughable(View);

export default function HomeScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paidThisMonth, setPaidThisMonth] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('monthly');
  const primaryColor = useThemeColor({}, 'primary');
  const statusOverdue = useThemeColor({}, 'statusOverdue');
  const statusPaid = useThemeColor({}, 'statusPaid');
  const dangerColor = useThemeColor({}, 'danger');
  const { locale } = useLanguage();
  const { showSuccess } = useToast();
  const { isPro } = usePro();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getSubscriptions();
    const paid = await getPaidThisMonth();
    // Sort by timeline: overdue first, then by next billing date (ascending)
    const sortedData = [...data].sort((a, b) => {
      const now = new Date();
      const dateA = new Date(a.nextBillingDate);
      const dateB = new Date(b.nextBillingDate);
      const isOverdueA = dateA < now;
      const isOverdueB = dateB < now;

      // Overdue items come first
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // Then sort by date (earliest first)
      return dateA.getTime() - dateB.getTime();
    });
    setSubscriptions(sortedData);
    setPaidThisMonth(paid);
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

  // Get overdue bills count for mark all paid button
  const overdueCount = useMemo(() => {
    const now = new Date();
    return subscriptions.filter(s => new Date(s.nextBillingDate) < now).length;
  }, [subscriptions]);

  const handleMarkAllPaid = async () => {
    const now = new Date();
    const overdueBills = subscriptions.filter(s => new Date(s.nextBillingDate) < now);

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
  };

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
    const companyIcon = getCompanyIcon(item.name) || DEFAULT_ICON;

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

  const listHeader = useMemo(
    () => (
      <>
        <CopilotStep text={i18n.t('copilotDashboardPeriod')} order={1} name="period">
          <WalkthroughableView>
            <PeriodSelector value={period} onChange={setPeriod} />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep text={i18n.t('copilotDashboardStats')} order={2} name="stats">
          <WalkthroughableView>
            <StatisticsPanel subscriptions={subscriptions} paidThisMonth={paidThisMonth} period={period} />
          </WalkthroughableView>
        </CopilotStep>

        {subscriptions.length > 0 && (
          <CopilotStep text={i18n.t('copilotDashboardChart')} order={3} name="chart">
            <WalkthroughableView>
              <ExpensesChart subscriptions={subscriptions} />
            </WalkthroughableView>
          </CopilotStep>
        )}

        {/* Go Pro Banner - show when user has subscriptions */}
        {subscriptions.length > 0 && !isPro && (
          <GoProButton variant="banner" style={styles.proBannerHeader} />
        )}

        {/* Step 4: List explanation - always render even when list is not empty */}
        {subscriptions.length > 0 && (
          <CopilotStep text={i18n.t('copilotDashboardList')} order={4} name="list-hint">
            <WalkthroughableView>
              <View />
            </WalkthroughableView>
          </CopilotStep>
        )}

        {subscriptions.length > 0 && (
          <View style={styles.subscriptionsHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {i18n.t('subscriptions')}
            </ThemedText>
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
        )}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale triggers i18n re-renders, handleMarkAllPaid is stable
    [subscriptions, paidThisMonth, period, locale, overdueCount, dangerColor, handleMarkAllPaid, isPro]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        initialNumToRender={6}
        windowSize={5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
        ListEmptyComponent={
          <CopilotStep text={i18n.t('copilotDashboardList')} order={3} name="empty">
            <WalkthroughableView style={styles.empty}>
              <IconSymbol name="list.bullet.clipboard" size={60} color={primaryColor} style={{ opacity: 0.6 }} />
              <ThemedText type="subtitle" style={styles.emptyTitle}>{i18n.t('emptyDashboardTitle')}</ThemedText>
              <ThemedText style={styles.emptyHint}>
                {i18n.t('emptyDashboardHint')}
              </ThemedText>
              {!isPro && <GoProButton variant="banner" style={styles.proBanner} />}
            </WalkthroughableView>
          </CopilotStep>
        }
      />

      <CopilotStep text={i18n.t('copilotDashboardFab')} order={subscriptions.length > 0 ? 5 : 4} name="fab">
        <WalkthroughableView>
          <AnimatedFAB
            onPress={() => router.push('/modal')}
            accessibilityLabel={i18n.t('addSubscription')}
          />
        </WalkthroughableView>
      </CopilotStep>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  subscriptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
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
  empty: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
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
  proBanner: {
    marginTop: 16,
    marginRight: 70,
  },
  proBannerHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
});
