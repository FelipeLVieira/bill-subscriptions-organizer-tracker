import { ExpensesChart } from '@/components/ExpensesChart';
import { Period, PeriodSelector } from '@/components/PeriodSelector';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEFAULT_ICON, getCompanyIcon } from '@/constants/companyIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Subscription, deleteSubscription, getPaidThisMonth, getSubscriptions, paySubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';

const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);
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
  const { start } = useCopilot();
  const { locale } = useLanguage();
  const { showSuccess } = useToast();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const checkTutorial = async () => {
      const seen = await AsyncStorage.getItem('HAS_SEEN_TUTORIAL');
      if (!seen) {
        setTimeout(() => {
          start();
        }, 1000);
        await AsyncStorage.setItem('HAS_SEEN_TUTORIAL', 'true');
      }
    };
    checkTutorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start should only run once on mount
  }, []);

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

  const renderItem = ({ item }: { item: Subscription }) => {
    const nextDate = new Date(item.nextBillingDate);
    const now = new Date();
    const isOverdue = nextDate < now;
    const dateColor = isOverdue ? statusOverdue : statusPaid;
    const companyIcon = getCompanyIcon(item.name) || DEFAULT_ICON;

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onLongPress={() => handleAction(item)}
          onPress={() => router.push(`/subscription/${item.id}`)}
          activeOpacity={0.7}
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
        </TouchableOpacity>
      </Card>
    );
  };

  const listHeader = useMemo(
    () => (
      <>
        <CopilotStep text="Switch between weekly, monthly, and yearly views to see your spending breakdown." order={1} name="period">
          <WalkthroughableView>
            <PeriodSelector value={period} onChange={setPeriod} />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep text="View your spending statistics at a glance." order={2} name="stats">
          <WalkthroughableView>
            <StatisticsPanel subscriptions={subscriptions} paidThisMonth={paidThisMonth} period={period} />
          </WalkthroughableView>
        </CopilotStep>

        {subscriptions.length > 0 && (
          <CopilotStep text="This chart shows your spending breakdown by category." order={3} name="chart">
            <WalkthroughableView>
              <ExpensesChart subscriptions={subscriptions} />
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
    [subscriptions, paidThisMonth, period, locale, overdueCount, dangerColor, handleMarkAllPaid]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
        ListEmptyComponent={
          <CopilotStep text="Your active subscriptions will appear here. You can see their details and next billing dates." order={4} name="empty">
            <WalkthroughableView style={styles.empty}>
              <IconSymbol name="list.bullet.clipboard" size={50} color={primaryColor} />
              <ThemedText type="subtitle" style={{ marginTop: 16 }}>{i18n.t('noSubscriptions')}</ThemedText>
              <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
                {i18n.t('addFirstSubscription')}
              </ThemedText>
            </WalkthroughableView>
          </CopilotStep>
        }
      />

      <CopilotStep text="Tap this button to add a new subscription!" order={5} name="fab">
        <WalkthroughableTouchableOpacity
          style={[styles.fab, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/modal')}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={30} color="#FFFFFF" />
        </WalkthroughableTouchableOpacity>
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllPaidText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // iOS-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
