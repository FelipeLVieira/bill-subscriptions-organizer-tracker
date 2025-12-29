import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addSubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scheduleReminder } from '@/utils/notifications';

import { SUBSCRIPTION_CATEGORIES } from '@/constants/categories';

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0].value);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');

  const handleSubmit = async () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please fill in Name and Amount');
      return;
    }

    setLoading(true);
    try {
      await addSubscription({
        name,
        amount: parseFloat(amount),
        currency: 'USD',
        billingInterval: interval,
        nextBillingDate: date.toISOString(),
        categoryGroup: category,
        notes,
        active: true,
      });

      // Schedule reminder 1 day before
      const reminderDate = new Date(date);
      reminderDate.setDate(reminderDate.getDate() - 1);
      if (reminderDate > new Date()) {
        await scheduleReminder(
          `Bill Due: ${name}`,
          `Your payment of ${amount} is due tomorrow.`,
          reminderDate
        );
      }

      router.dismiss();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>New Subscription</ThemedText>

        <Input placeholder="Service Name (e.g. Netflix)" value={name} onChangeText={setName} style={styles.input} />

        <Input
          placeholder="Amount (e.g. 15.99)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.pickerContainer}>
          <ThemedText>Billing Interval</ThemedText>
          <Picker
            selectedValue={interval}
            onValueChange={(itemValue) => setInterval(itemValue)}
            style={{ color: textColor }}
          >
            <Picker.Item label="Monthly" value="monthly" />
            <Picker.Item label="Yearly" value="yearly" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Daily" value="daily" />
          </Picker>
        </View>

        <View style={styles.dateContainer}>
          <ThemedText>Next Billing Date</ThemedText>
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || date;
              setDate(currentDate);
            }}
            themeVariant="light"
          />
        </View>

        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, { height: 80 }]}
        />

        <Button title={loading ? "Saving..." : "Save Subscription"} onPress={handleSubmit} disabled={loading} style={styles.button} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  dateContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
  },
});
