import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrencyPickerModal } from '@/components/CurrencyPickerModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { TooltipLabel } from '@/components/Tooltip';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { addSubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Haptic } from '@/utils/haptics';
import { createDefaultReminder, scheduleAllReminders, serializeReminderSchema } from '@/utils/notifications';

import { Currency } from '@/constants/Currencies';
import { getSubscriptionCategories } from '@/constants/categories';
import i18n from '@/i18n';

const CUSTOM_CATEGORY_VALUE = '__custom__';

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  useLanguage(); // Triggers re-render when locale changes
  const { defaultCurrency, getCurrencyByCode } = useCurrency();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency?.code || 'USD');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = getSubscriptionCategories();
  const currentCurrency = getCurrencyByCode(selectedCurrency);
  const { showSuccess, showError } = useToast();
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const pickerTextColor = useThemeColor({}, 'pickerText');
  const pickerBgColor = useThemeColor({}, 'pickerBg');
  const borderColor = useThemeColor({}, 'border');

  const handleCategoryChange = (value: string) => {
    if (value === CUSTOM_CATEGORY_VALUE) {
      setShowCustomCategoryModal(true);
    } else {
      setCategory(value);
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setShowCustomCategoryModal(false);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency.code);
  };

  const handleSubmit = async () => {
    if (!name || !amount) {
      await Haptic.error();
      showError(i18n.t('fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));

      // Create default reminder schema (1 day before at midnight)
      const defaultReminder = createDefaultReminder();
      let reminderSchema = { reminders: [defaultReminder] };

      // Schedule the reminder
      reminderSchema = await scheduleAllReminders(
        name,
        parsedAmount,
        selectedCurrency,
        date.toISOString(),
        reminderSchema,
        i18n.t.bind(i18n)
      );

      await addSubscription({
        name,
        amount: parsedAmount,
        currency: selectedCurrency,
        billingInterval: interval,
        nextBillingDate: date.toISOString(),
        categoryGroup: category,
        notes,
        reminderSchema: serializeReminderSchema(reminderSchema),
        active: true,
      });

      await Haptic.success();
      showSuccess(i18n.t('billSaved'));
      router.dismiss();
    } catch (e) {
      console.error(e);
      await Haptic.error();
      showError(i18n.t('saveError'));
    } finally {
      setLoading(false);
    }
  };

  const allCategories = [
    ...categories,
    { label: `+ ${i18n.t('customCategory')}`, value: CUSTOM_CATEGORY_VALUE }
  ];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.title}>{i18n.t('addSubscription')}</ThemedText>

          <TooltipLabel label={i18n.t('name')} hint={i18n.t('hintServiceName')} />
          <Input placeholder={i18n.t('serviceNamePlaceholder')} value={name} onChangeText={setName} style={styles.input} />

          <TooltipLabel label={`${i18n.t('amount')} (${selectedCurrency})`} hint={i18n.t('hintAmount')} />
          <View style={styles.amountInputContainer}>
            <TouchableOpacity
              style={[styles.currencyButton, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }]}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <ThemedText style={[styles.currencyPrefix, { color: primaryColor }]}>
                {currentCurrency?.symbol || '$'}
              </ThemedText>
              <IconSymbol name="chevron.down" size={12} color={primaryColor} />
            </TouchableOpacity>
            <Input
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[styles.input, styles.amountInput]}
            />
          </View>

          <View style={[styles.pickerContainer, { backgroundColor: pickerBgColor, borderRadius: 8, borderWidth: 1, borderColor: borderColor }]}>
            <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
              <TooltipLabel label={i18n.t('billingInterval')} hint={i18n.t('hintBillingInterval')} />
            </View>
            <Picker
              selectedValue={interval}
              onValueChange={(itemValue) => setInterval(itemValue)}
              style={{ color: pickerTextColor }}
              dropdownIconColor={pickerTextColor}
              itemStyle={{ color: pickerTextColor }}
            >
              <Picker.Item label={i18n.t('monthly')} value="monthly" color={pickerTextColor} />
              <Picker.Item label={i18n.t('yearly')} value="yearly" color={pickerTextColor} />
              <Picker.Item label={i18n.t('weekly')} value="weekly" color={pickerTextColor} />
              <Picker.Item label={i18n.t('daily')} value="daily" color={pickerTextColor} />
              <Picker.Item label={i18n.t('unique')} value="unique" color={pickerTextColor} />
            </Picker>
          </View>

          <View style={[styles.pickerContainer, { backgroundColor: pickerBgColor, borderRadius: 8, borderWidth: 1, borderColor: borderColor }]}>
            <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
              <TooltipLabel label={i18n.t('category')} hint={i18n.t('hintCategory')} />
            </View>
            <Picker
              selectedValue={allCategories.find(c => c.value === category) ? category : CUSTOM_CATEGORY_VALUE}
              onValueChange={handleCategoryChange}
              style={{ color: pickerTextColor }}
              dropdownIconColor={pickerTextColor}
              itemStyle={{ color: pickerTextColor }}
            >
              {allCategories.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} color={pickerTextColor} />
              ))}
            </Picker>
            {!allCategories.find(c => c.value === category && c.value !== CUSTOM_CATEGORY_VALUE) && category && (
              <View style={[styles.customCategoryBadge, { backgroundColor: primaryColor + '20' }]}>
                <ThemedText style={{ fontSize: 12, color: primaryColor }}>{category}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.dateContainer}>
            <TooltipLabel label={i18n.t('nextBilling')} hint={i18n.t('hintNextBilling')} />
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                setDate(currentDate);
              }}
              themeVariant={colorScheme}
              accentColor={primaryColor}
            />
          </View>

          <TooltipLabel label={i18n.t('notes')} hint={i18n.t('hintNotes')} />
          <Input
            placeholder={i18n.t('notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, { height: 80 }]}
          />

          <View style={{ marginBottom: 40 }}>
            <Button title={loading ? i18n.t('saving') : i18n.t('save')} onPress={handleSubmit} disabled={loading} style={styles.button} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Category Modal */}
      <Modal
        visible={showCustomCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCustomCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{i18n.t('customCategory')}</ThemedText>
              <TouchableOpacity onPress={() => setShowCustomCategoryModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={textColor} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            </View>
            <Input
              placeholder={i18n.t('enterCustomCategory')}
              value={customCategory}
              onChangeText={setCustomCategory}
              style={styles.modalInput}
              autoFocus
            />
            <Button
              title={i18n.t('save')}
              onPress={handleCustomCategorySubmit}
              disabled={!customCategory.trim()}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={handleCurrencySelect}
        mode="select"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 16,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  input: {
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
    gap: 4,
  },
  currencyPrefix: {
    fontSize: 17,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  pickerContainer: {
    marginVertical: 8,
    overflow: 'hidden',
  },
  dateContainer: {
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 24,
  },
  customCategoryBadge: {
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  // iOS-style modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 14,
    gap: 16,
    // iOS card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInput: {
    marginBottom: 0,
  },
});
