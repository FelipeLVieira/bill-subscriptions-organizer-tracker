import { CurrencyPickerModal } from '@/components/CurrencyPickerModal';
import { ReminderManager } from '@/components/ReminderManager';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { getCategoryLabel, getSubscriptionCategories } from '@/constants/categories';
import { DEFAULT_ICON, getCompanyIcon } from '@/constants/companyIcons';
import { Currency } from '@/constants/Currencies';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteSubscription, getSubscriptionById, paySubscription, Subscription, updateSubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import {
    parseReminderSchema,
    ReminderSchema,
    scheduleAllReminders,
    serializeReminderSchema,
} from '@/utils/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CUSTOM_CATEGORY_VALUE = '__custom__';

export default function SubscriptionDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state (initialized when subscription loads)
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [interval, setInterval] = useState('monthly');
    const [category, setCategory] = useState('Entertainment');
    const [nextDate, setNextDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [reminderSchema, setReminderSchema] = useState<ReminderSchema>({ reminders: [] });
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { colorScheme } = useTheme();
    const { locale } = useLanguage();
    const { getCurrencyByCode } = useCurrency();
    const { showSuccess, showError } = useToast();
    const insets = useSafeAreaInsets();
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const pickerTextColor = useThemeColor({}, 'pickerText');
    const pickerBgColor = useThemeColor({}, 'pickerBg');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const statusOverdue = useThemeColor({}, 'statusOverdue');
    const statusPaid = useThemeColor({}, 'statusPaid');
    const dangerColor = useThemeColor({}, 'danger');
    const categories = getSubscriptionCategories();
    const currentCurrency = getCurrencyByCode(currency);

    useEffect(() => {
        if (id) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData is stable, only re-run when id changes
    }, [id]);

    const loadData = async () => {
        const sub = await getSubscriptionById(Number(id));
        if (sub) {
            setSubscription(sub);
            setName(sub.name);
            setAmount(sub.amount.toString());
            setCurrency(sub.currency);
            setInterval(sub.billingInterval);
            setCategory(sub.categoryGroup || 'Entertainment');
            setNextDate(new Date(sub.nextBillingDate));
            setNotes(sub.notes || '');
            setReminderSchema(parseReminderSchema(sub.reminderSchema));
        }
    };

    const handleMarkAsPaid = async () => {
        if (!subscription) return;

        await Haptic.medium();
        Alert.alert(
            subscription.name,
            i18n.t('chooseAction'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('markAsPaid'),
                    onPress: async () => {
                        await paySubscription(subscription);
                        await Haptic.success();
                        showSuccess(i18n.t('billMarkedPaid'));
                        await loadData();
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            await Haptic.error();
            showError(i18n.t('nameRequired'));
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            await Haptic.error();
            showError(i18n.t('validAmountRequired'));
            return;
        }

        setIsSaving(true);
        try {
            // Schedule reminders
            const updatedReminderSchema = await scheduleAllReminders(
                name.trim(),
                parsedAmount,
                currency,
                nextDate.toISOString(),
                reminderSchema,
                i18n.t.bind(i18n)
            );

            await updateSubscription(Number(id), {
                name: name.trim(),
                amount: parsedAmount,
                currency,
                billingInterval: interval,
                categoryGroup: category,
                nextBillingDate: nextDate.toISOString(),
                notes: notes.trim(),
                reminderSchema: serializeReminderSchema(updatedReminderSchema),
            });
            await Haptic.success();
            showSuccess(i18n.t('billSaved'));
            setIsEditing(false);
            loadData();
        } catch (e) {
            console.error(e);
            await Haptic.error();
            showError(i18n.t('updateError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!subscription) return;

        await Haptic.warning();
        Alert.alert(
            i18n.t('deleteSubscription'),
            i18n.t('deleteConfirmation', { name: subscription.name }),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteSubscription(Number(id));
                            await Haptic.success();
                            showSuccess(i18n.t('billDeleted'));
                            router.back();
                        } catch (e) {
                            console.error(e);
                            await Haptic.error();
                            showError(i18n.t('deleteError'));
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    // Category handlers
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

    const handleCurrencySelect = (selectedCurrency: Currency) => {
        setCurrency(selectedCurrency.code);
    };

    // Build allCategories list with custom option
    const allCategories = [
        ...categories,
        { label: `+ ${i18n.t('customCategory')}`, value: CUSTOM_CATEGORY_VALUE }
    ];

    // Get company icon
    const companyIcon = subscription ? getCompanyIcon(subscription.name) || DEFAULT_ICON : DEFAULT_ICON;

    if (!subscription) {
        return (
            <ThemedView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }

    const nextBillingDate = new Date(subscription.nextBillingDate);
    const isOverdue = nextBillingDate < new Date();

    return (
        <ThemedView style={styles.container}>
            {/* Custom header */}
            <View style={[styles.customHeader, { paddingTop: insets.top + 10, backgroundColor }]}>
                <TouchableOpacity
                    onPress={() => isEditing ? setIsEditing(false) : router.back()}
                    style={styles.backButton}
                    accessibilityLabel={isEditing ? i18n.t('cancel') : i18n.t('goBack')}
                    accessibilityRole="button"
                    disabled={isSaving || isDeleting}
                >
                    <IconSymbol name="chevron.left" size={24} color={isSaving || isDeleting ? borderColor : primaryColor} />
                    <ThemedText style={{ color: isSaving || isDeleting ? borderColor : primaryColor, marginLeft: 4 }}>
                        {isEditing ? i18n.t('cancel') : i18n.t('myBills')}
                    </ThemedText>
                </TouchableOpacity>
                {isEditing ? (
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        accessibilityLabel={i18n.t('saveChanges')}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isSaving }}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={primaryColor} />
                        ) : (
                            <ThemedText style={{ color: primaryColor, fontWeight: '600' }}>
                                {i18n.t('save')}
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsEditing(true)}
                        accessibilityLabel={i18n.t('editSubscription')}
                        accessibilityRole="button"
                    >
                        <ThemedText style={{ color: primaryColor, fontWeight: '600' }}>
                            {i18n.t('edit')}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {isEditing ? (
                    // Edit Mode - Form only, no payment history
                    <View style={styles.form}>
                        <View style={styles.header}>
                            <ThemedText type="title">{i18n.t('editSubscription')}</ThemedText>
                        </View>

                        <ThemedText>{i18n.t('name')}</ThemedText>
                        <Input value={name} onChangeText={setName} placeholder="Netflix" />

                        <ThemedText>{`${i18n.t('amount')} (${currency})`}</ThemedText>
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
                            <Input value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" style={styles.amountInput} />
                        </View>

                        <ThemedText>{i18n.t('billingInterval')}</ThemedText>
                        <View style={[styles.pickerContainer, { borderColor: borderColor, backgroundColor: pickerBgColor }]}>
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

                        <ThemedText>{i18n.t('category')}</ThemedText>
                        <View style={[styles.pickerContainer, { borderColor: borderColor, backgroundColor: pickerBgColor }]}>
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

                        <ThemedText>{i18n.t('nextBilling')}</ThemedText>
                        <DateTimePicker
                            value={nextDate}
                            mode="date"
                            display="default"
                            themeVariant={colorScheme}
                            accentColor={primaryColor}
                            onChange={(event, selectedDate) => {
                                const currentDate = selectedDate || nextDate;
                                setNextDate(currentDate);
                            }}
                            style={{ alignSelf: 'flex-start', marginVertical: 8 }}
                        />

                        <ThemedText>{i18n.t('notes')}</ThemedText>
                        <Input value={notes} onChangeText={setNotes} placeholder={i18n.t('notesPlaceholder')} multiline />

                        {/* Reminders - Editable */}
                        <ReminderManager
                            schema={reminderSchema}
                            onUpdate={setReminderSchema}
                            isEditing={true}
                        />

                        {/* Delete Button */}
                        <View style={styles.deleteSection}>
                            <TouchableOpacity
                                style={[styles.deleteButton, { borderColor: dangerColor }]}
                                onPress={handleDelete}
                                disabled={isDeleting}
                                accessibilityLabel={i18n.t('deleteSubscription')}
                                accessibilityRole="button"
                                accessibilityHint={i18n.t('deleteConfirmationHint')}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color={dangerColor} />
                                ) : (
                                    <>
                                        <IconSymbol name="trash.fill" size={18} color={dangerColor} />
                                        <ThemedText style={[styles.deleteButtonText, { color: dangerColor }]}>
                                            {i18n.t('deleteSubscription')}
                                        </ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // View Mode - Show details with icon and payment history
                    <>
                        {/* Header with icon */}
                        <View style={styles.detailHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: companyIcon.color + '20' }]}>
                                <IconSymbol name={companyIcon.icon as any} size={40} color={companyIcon.color} />
                            </View>
                            <ThemedText type="title" style={styles.detailTitle}>{subscription.name}</ThemedText>
                        </View>

                        {/* Amount Card */}
                        <Card style={styles.amountCard}>
                            <ThemedText style={styles.amountLabel}>{i18n.t('amount')}</ThemedText>
                            <View style={styles.amountValueContainer}>
                                <ThemedText style={styles.amountCurrency}>{currentCurrency?.symbol || subscription.currency}</ThemedText>
                                <ThemedText style={styles.amountValue}>{subscription.amount.toFixed(2)}</ThemedText>
                            </View>
                            <ThemedText style={styles.intervalText}>/ {i18n.t(subscription.billingInterval)}</ThemedText>
                        </Card>

                        {/* Mark as Paid Button */}
                        <TouchableOpacity
                            style={[
                                styles.markAsPaidBtn,
                                { backgroundColor: isOverdue ? dangerColor : primaryColor }
                            ]}
                            onPress={handleMarkAsPaid}
                            accessibilityLabel={i18n.t('markAsPaid')}
                            accessibilityRole="button"
                        >
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                            <ThemedText style={styles.markAsPaidText}>{i18n.t('markAsPaid')}</ThemedText>
                        </TouchableOpacity>

                        {/* Details */}
                        <View style={styles.details}>
                            <View style={styles.detailRow}>
                                <ThemedText style={styles.detailLabel}>{i18n.t('category')}</ThemedText>
                                <ThemedText style={styles.detailValue}>{getCategoryLabel(subscription.categoryGroup || 'Uncategorized')}</ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <ThemedText style={styles.detailLabel}>{i18n.t('nextBilling')}</ThemedText>
                                <ThemedText style={[styles.detailValue, { color: isOverdue ? statusOverdue : statusPaid }]}>
                                    {nextBillingDate.toLocaleDateString(locale)}
                                </ThemedText>
                            </View>
                        </View>

                        {/* Notes Section */}
                        {subscription.notes ? (
                            <Card style={styles.notesCard}>
                                <ThemedText style={styles.notesLabel}>{i18n.t('notes')}</ThemedText>
                                <ThemedText style={styles.notesText}>{subscription.notes}</ThemedText>
                            </Card>
                        ) : null}

                        {/* Reminders - View Only */}
                        <ReminderManager
                            schema={reminderSchema}
                            onUpdate={setReminderSchema}
                            isEditing={false}
                        />
                    </>
                )}
            </ScrollView>

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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scroll: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
    },
    form: {
        gap: 12,
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
        fontSize: 18,
        fontWeight: '600',
    },
    amountInput: {
        flex: 1,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    // View Mode Styles
    detailHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    detailTitle: {
        textAlign: 'center',
    },
    amountCard: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    markAsPaidBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    markAsPaidText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    amountLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    amountValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    amountCurrency: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 2,
    },
    amountValue: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    intervalText: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    details: {
        gap: 12,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        opacity: 0.7,
    },
    detailValue: {
        fontWeight: '600',
    },
    notesCard: {
        padding: 16,
        marginBottom: 20,
    },
    notesLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    notesText: {
        fontStyle: 'italic',
        lineHeight: 20,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
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
    deleteSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
