import { ExpensesChart } from '@/components/ExpensesChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Subscription, deleteSubscription, getSubscriptions, paySubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const primaryColor = useThemeColor({}, 'primary');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getSubscriptions();
    setSubscriptions(data);
  };

  const handleAction = async (item: Subscription) => {
    Alert.alert(item.name, 'Choose an action', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark as Paid',
        onPress: async () => {
          await paySubscription(item);
          loadData();
        }
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSubscription(item.id);
          loadData();
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Subscription }) => {
    const nextDate = new Date(item.nextBillingDate);
    const now = new Date();
    const isOverdue = nextDate < now;
    const dateColor = isOverdue ? '#D32F2F' : '#388E3C';

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onLongPress={() => handleAction(item)}
          onPress={() => router.push(`/subscription/${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText type="defaultSemiBold">{item.currency} {item.amount.toFixed(2)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              {item.billingInterval} {item.categoryGroup ? `• ${item.categoryGroup}` : ''}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: dateColor }}>
              Next: {nextDate.toLocaleDateString()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={subscriptions.length > 0 ? <ExpensesChart subscriptions={subscriptions} /> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="list.bullet.clipboard" size={50} color={primaryColor} />
            <ThemedText type="subtitle" style={{ marginTop: 16 }}>No subscriptions</ThemedText>
            <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
              Tap the + button to add your first subscription.
            </ThemedText>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => router.push('/modal')}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {

  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  interval: {
    fontSize: 14,
    opacity: 0.7,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    padding: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
