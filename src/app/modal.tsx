import DateTimePicker from '@/components/ui/DateTimePicker';
import { isTablet } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Attachment, AttachmentPicker } from '@/components/AttachmentPicker';
import { CurrencyPickerModal } from '@/components/CurrencyPickerModal';
import { IconPickerModal } from '@/components/IconPickerModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
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
import { DEFAULT_ICON, getCompanyIcon } from '@/constants/companyIcons';
import i18n from '@/i18n';

const BILLING_INTERVALS = [
  { label: 'monthly', value: 'monthly', icon: 'calendar' as const },
  { label: 'yearly', value: 'yearly', icon: 'calendar.badge.clock' as const },
  { label: 'weekly', value: 'weekly', icon: 'calendar.day.timeline.left' as const },
  { label: 'daily', value: 'daily', icon: 'sun.max' as const },
  { label: 'unique', value: 'unique', icon: 'star' as const },
];

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: string } = {
  Entertainment: 'play.tv',
  Utilities: 'bolt.fill',
  Housing: 'house.fill',
  Insurance: 'shield.fill',
  'Personal Care': 'heart.fill',
  Software: 'app.fill',
  Other: 'ellipsis.circle.fill',
};

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  useLanguage();
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [customIconColor, setCustomIconColor] = useState<string | null>(null);

  const [touched, setTouched] = useState({ name: false, amount: false });

  const errors = useMemo(() => {
    const cleanedAmount = amount.replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(cleanedAmount);
    return {
      name: !name.trim() ? i18n.t('nameRequired') : undefined,
      amount: (!cleanedAmount || isNaN(parsedAmount) || parsedAmount <= 0)
        ? i18n.t('validAmountRequired')
        : undefined,
    };
  }, [name, amount]);

  const categories = getSubscriptionCategories();
  const currentCurrency = getCurrencyByCode(selectedCurrency);
  const { showSuccess, showError } = useToast();

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const cardColor = useThemeColor({}, 'card');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
  const buttonTextColor = useThemeColor({}, 'buttonText');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');

  const handleClose = () => {
    router.dismiss();
  };

  const showIntervalPicker = () => {
    if (Platform.OS === 'ios') {
      const options = BILLING_INTERVALS.map(i => i18n.t(i.label));
      options.push(i18n.t('cancel'));
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: i18n.t('billingInterval'),
        },
        (buttonIndex) => {
          if (buttonIndex < BILLING_INTERVALS.length) {
            setInterval(BILLING_INTERVALS[buttonIndex].value);
          }
        }
      );
    }
  };

  const showCategoryPicker = () => {
    if (Platform.OS === 'ios') {
      const options = categories.map(c => c.label);
      options.push(`+ ${i18n.t('customCategory')}`);
      options.push(i18n.t('cancel'));
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: i18n.t('category'),
        },
        (buttonIndex) => {
          if (buttonIndex < categories.length) {
            setCategory(categories[buttonIndex].value);
          } else if (buttonIndex === categories.length) {
            setShowCustomCategoryModal(true);
          }
        }
      );
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
    setTouched({ name: true, amount: true });

    if (errors.name || errors.amount) {
      await Haptic.error();
      return;
    }

    const cleanedAmount = amount.replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(cleanedAmount);

    setLoading(true);
    try {
      const defaultReminder = createDefaultReminder();
      let reminderSchema = { reminders: [defaultReminder] };

      reminderSchema = await scheduleAllReminders(
        name,
        parsedAmount,
        selectedCurrency,
        date.toISOString(),
        reminderSchema,
        i18n.t.bind(i18n)
      );

      const attachmentsJson = attachments.length > 0
        ? JSON.stringify(attachments)
        : undefined;

      await addSubscription({
        name,
        amount: parsedAmount,
        currency: selectedCurrency,
        billingInterval: interval,
        nextBillingDate: date.toISOString(),
        categoryGroup: category,
        notes,
        attachments: attachmentsJson,
        reminderSchema: serializeReminderSchema(reminderSchema),
        active: true,
        customIcon: customIcon || undefined,
        customIconColor: customIconColor || undefined,
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

  const getCategoryLabel = () => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  const getCategoryIcon = () => {
    return CATEGORY_ICONS[category] || 'tag.fill';
  };

  const getIntervalLabel = () => {
    return i18n.t(interval);
  };

  const getIntervalIcon = () => {
    const found = BILLING_INTERVALS.find(i => i.value === interval);
    return found?.icon || 'calendar';
  };

  // Get the display icon (custom > auto-detected > default)
  const getDisplayIcon = () => {
    if (customIcon && customIconColor) {
      return { icon: customIcon, color: customIconColor };
    }
    const autoDetected = getCompanyIcon(name);
    return autoDetected || DEFAULT_ICON;
  };

  const handleIconSelect = (icon: string, color: string) => {
    if (!icon || !color) {
      // Reset to auto-detect
      setCustomIcon(null);
      setCustomIconColor(null);
    } else {
      setCustomIcon(icon);
      setCustomIconColor(color);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Modern Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor }]}>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.headerButton, { backgroundColor: cardColor }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="xmark" size={16} color={textColor} weight="semibold" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            {i18n.t('addSubscription')}
          </ThemedText>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.headerSaveButton,
            { backgroundColor: buttonPrimaryColor, opacity: loading ? 0.6 : 1 }
          ]}
        >
          <IconSymbol name="checkmark.circle.fill" size={18} color={buttonTextColor} />
          <ThemedText style={[styles.headerSaveText, { color: buttonTextColor }]}>
            {loading ? '...' : i18n.t('save')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom + 80, 120) },
            isTablet() && styles.tabletScroll
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Amount Section */}
          <View style={[styles.amountHero, { backgroundColor: cardColor }]}>
            <View style={styles.amountInputContainer}>
              {/* Currency Selector with Label */}
              <View style={styles.currencySelectorContainer}>
                <ThemedText style={[styles.currencyLabel, { color: textSecondaryColor }]}>
                  {i18n.t('currency')}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.currencySelector, { backgroundColor: buttonPrimaryColor + '15' }]}
                  onPress={() => setShowCurrencyPicker(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ThemedText style={[styles.currencySymbol, { color: buttonPrimaryColor }]}>
                    {currentCurrency?.symbol || '$'}
                  </ThemedText>
                  <IconSymbol name="chevron.down" size={14} color={buttonPrimaryColor} />
                </TouchableOpacity>
              </View>
              {/* Amount Input with Label */}
              <View style={styles.amountInputWrapper}>
                <ThemedText style={[styles.amountLabel, { color: textSecondaryColor }]}>
                  {i18n.t('amount')}
                </ThemedText>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  onBlur={() => setTouched(t => ({ ...t, amount: true }))}
                  keyboardType="decimal-pad"
                  style={styles.heroAmountInput}
                  inputStyle={styles.heroAmountInputText}
                  showBorder={false}
                />
              </View>
            </View>
            {touched.amount && errors.amount && (
              <ThemedText style={styles.errorText}>{errors.amount}</ThemedText>
            )}
          </View>

          {/* Name Input Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: buttonPrimaryColor + '15' }]}>
                <IconSymbol name="tag.fill" size={18} color={buttonPrimaryColor} />
              </View>
              <View style={styles.cardInputContainer}>
                <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                  {i18n.t('name')}
                </ThemedText>
                <Input
                  placeholder={i18n.t('serviceNamePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  style={styles.cardInput}
                  inputStyle={styles.cardInputText}
                  showBorder={false}
                />
              </View>
            </View>
            {touched.name && errors.name && (
              <ThemedText style={[styles.errorText, { marginLeft: 52 }]}>{errors.name}</ThemedText>
            )}
          </View>

          {/* Icon Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Pressable style={styles.cardRow} onPress={() => setShowIconPicker(true)}>
              <View style={[styles.iconContainer, { backgroundColor: getDisplayIcon().color + '15' }]}>
                <IconSymbol name={getDisplayIcon().icon as any} size={18} color={getDisplayIcon().color} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                  {i18n.t('icon')}
                </ThemedText>
                <ThemedText style={styles.cardValue}>
                  {customIcon ? i18n.t('customIcon') : i18n.t('autoDetected')}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={textSecondaryColor} />
            </Pressable>
          </View>

          {/* Billing & Category Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            {/* Billing Interval Row */}
            <Pressable style={styles.cardRow} onPress={showIntervalPicker}>
              <View style={[styles.iconContainer, { backgroundColor: successColor + '15' }]}>
                <IconSymbol name={getIntervalIcon()} size={18} color={successColor} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                  {i18n.t('billingInterval')}
                </ThemedText>
                <ThemedText style={styles.cardValue}>{getIntervalLabel()}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={textSecondaryColor} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            {/* Category Row */}
            <Pressable style={styles.cardRow} onPress={showCategoryPicker}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF9500' + '15' }]}>
                <IconSymbol name={getCategoryIcon() as any} size={18} color="#FF9500" />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                  {i18n.t('category')}
                </ThemedText>
                <ThemedText style={styles.cardValue} numberOfLines={1}>
                  {getCategoryLabel()}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={textSecondaryColor} />
            </Pressable>
          </View>

          {/* Date Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' + '15' }]}>
                <IconSymbol name="calendar.badge.clock" size={18} color="#FF3B30" />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                  {i18n.t('nextBilling')}
                </ThemedText>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setDate(currentDate);
                }}
                themeVariant={colorScheme}
                accentColor={buttonPrimaryColor}
              />
            </View>
          </View>

          {/* Notes Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            {!showNotes ? (
              <Pressable style={styles.cardRow} onPress={() => setShowNotes(true)}>
                <View style={[styles.iconContainer, { backgroundColor: '#5856D6' + '15' }]}>
                  <IconSymbol name="note.text" size={18} color="#5856D6" />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={[styles.cardLabel, { color: textSecondaryColor }]}>
                    {i18n.t('notes')}
                  </ThemedText>
                  <ThemedText style={[styles.cardValue, { color: textSecondaryColor, fontStyle: 'italic' }]}>
                    {i18n.t('notesPlaceholder')}
                  </ThemedText>
                </View>
                <IconSymbol name="plus.circle.fill" size={22} color={buttonPrimaryColor} />
              </Pressable>
            ) : (
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <View style={styles.notesHeaderLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: '#5856D6' + '15' }]}>
                      <IconSymbol name="note.text" size={18} color="#5856D6" />
                    </View>
                    <ThemedText style={styles.notesTitle}>{i18n.t('notes')}</ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => { setShowNotes(false); setNotes(''); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol name="xmark.circle.fill" size={22} color={textSecondaryColor} />
                  </TouchableOpacity>
                </View>
                <Input
                  placeholder={i18n.t('notesPlaceholder')}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={styles.notesInput}
                  inputStyle={styles.notesInputText}
                  showBorder={false}
                />
              </View>
            )}
          </View>

          {/* Attachments */}
          <AttachmentPicker
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            maxAttachments={5}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: buttonPrimaryColor, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle.fill" size={22} color={buttonTextColor} />
            <ThemedText style={[styles.saveButtonText, { color: buttonTextColor }]}>
              {loading ? i18n.t('saving') : i18n.t('save')}
            </ThemedText>
          </TouchableOpacity>
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
                <IconSymbol name="xmark.circle.fill" size={24} color={textSecondaryColor} />
              </TouchableOpacity>
            </View>
            <Input
              placeholder={i18n.t('enterCustomCategory')}
              value={customCategory}
              onChangeText={setCustomCategory}
              style={styles.modalInput}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.modalSaveButton,
                { backgroundColor: buttonPrimaryColor, opacity: customCategory.trim() ? 1 : 0.5 }
              ]}
              onPress={handleCustomCategorySubmit}
              disabled={!customCategory.trim()}
            >
              <ThemedText style={[styles.modalSaveButtonText, { color: buttonTextColor }]}>
                {i18n.t('save')}
              </ThemedText>
            </TouchableOpacity>
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

      {/* Icon Picker Modal */}
      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={handleIconSelect}
        currentIcon={customIcon}
        currentColor={customIconColor}
        subscriptionName={name}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    letterSpacing: -0.4,
  },
  headerSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerSaveText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  // Hero Amount Section
  amountHero: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    gap: 20, // Increased gap between currency and amount
  },
  currencySelectorContainer: {
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70,
    minHeight: 60,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '500',
    letterSpacing: 0,
  },
  amountInputWrapper: {
    alignItems: 'flex-start',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroAmountInput: {
    flex: 0,
    width: 'auto',
    minWidth: 100,
    maxWidth: 200,
    backgroundColor: 'transparent',
    height: 60,
  },
  heroAmountInputText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -2,
    textAlign: 'left',
    padding: 0,
    height: 60,
  },
  // Card Styles
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInputContainer: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  cardInput: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  cardInputText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    padding: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },
  // Notes
  notesContainer: {
    padding: 14,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: 'transparent',
    minHeight: 80,
  },
  notesInputText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Error
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 14,
  },
  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInput: {
    marginBottom: 0,
  },
  modalSaveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // iPad-specific styles for better readability
  tabletScroll: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
});
