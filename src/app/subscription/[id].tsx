import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SUBSCRIPTION_CATEGORIES } from '@/constants/categories';
import { getSubscriptionById, getSubscriptionHistory, Subscription, updateSubscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SubscriptionDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // Form state (initialized when subscription loads)
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [interval, setInterval] = useState('monthly');
    const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0].value);
    const [nextDate, setNextDate] = useState(new Date());
    const [notes, setNotes] = useState('');

    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        const sub = await getSubscriptionById(Number(id));
        if (sub) {
            setSubscription(sub);
            setName(sub.name);
            setAmount(sub.amount.toString());
            setCurrency(sub.currency);
            setInterval(sub.billingInterval);
            setCategory(sub.categoryGroup || SUBSCRIPTION_CATEGORIES[0].value);
            setNextDate(new Date(sub.nextBillingDate));
            setNotes(sub.notes || '');

            const hist = await getSubscriptionHistory(sub.id);
            setHistory(hist);
        }
    };

    const handleSave = async () => {
        if (!name || !amount) {
            Alert.alert('Error', 'Name and Amount are required');
            return;
        }

        try {
            await updateSubscription(Number(id), {
                name,
                amount: parseFloat(amount),
                currency,
                billingInterval: interval,
                categoryGroup: category,
                nextBillingDate: nextDate.toISOString(),
                notes,
            });
            setIsEditing(false);
            loadData();
            Alert.alert('Success', 'Subscription updated');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update subscription');
        }
    };

    if (!subscription) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <ThemedText type="title">{isEditing ? 'Edit Subscription' : subscription.name}</ThemedText>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <ThemedText style={{ color: '#0a7ea4' }}>{isEditing ? 'Cancel' : 'Edit'}</ThemedText>
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <View style={styles.form}>
                        <ThemedText>Name</ThemedText>
                        <Input value={name} onChangeText={setName} placeholder="Netflix" />

                        <ThemedText>Amount</ThemedText>
                        <Input value={amount} onChangeText={setAmount} placeholder="15.99" keyboardType="numeric" />

                        <ThemedText>Billing Interval</ThemedText>
                        <View style={[styles.pickerContainer, { borderColor: textColor }]}>
                            <Picker
                                selectedValue={interval}
                                onValueChange={(itemValue) => setInterval(itemValue)}
                                style={{ color: textColor }}
                                dropdownIconColor={textColor}
                            >
                                <Picker.Item label="Monthly" value="monthly" />
                                <Picker.Item label="Yearly" value="yearly" />
                                <Picker.Item label="Weekly" value="weekly" />
                                <Picker.Item label="Daily" value="daily" />
                            </Picker>
                        </View>

                        <ThemedText>Category</ThemedText>
                        <View style={[styles.pickerContainer, { borderColor: textColor }]}>
                            <Picker
                                selectedValue={category}
                                onValueChange={(itemValue) => setCategory(itemValue)}
                                style={{ color: textColor }}
                                dropdownIconColor={textColor}
                            >
                                {SUBSCRIPTION_CATEGORIES.map((cat) => (
                                    <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                                ))}
                            </Picker>
                        </View>

                        <ThemedText>Next Billing Date</ThemedText>
                        <DateTimePicker
                            value={nextDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                const currentDate = selectedDate || nextDate;
                                setNextDate(currentDate);
                            }}
                            style={{ alignSelf: 'flex-start', marginVertical: 8 }}
                        />

                        <ThemedText>Notes</ThemedText>
                        <Input value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />

                        <Button title="Save Changes" onPress={handleSave} />
                    </View>
                ) : (
                    <View style={styles.details}>
                        <ThemedText type="subtitle">{subscription.currency} {subscription.amount.toFixed(2)} / {subscription.billingInterval}</ThemedText>
                        <ThemedText>Category: {subscription.categoryGroup || 'Uncategorized'}</ThemedText>
                        <ThemedText>Next Billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</ThemedText>
                        {subscription.notes ? <ThemedText style={styles.notes}>{subscription.notes}</ThemedText> : null}
                    </View>
                )}

                <View style={styles.historySection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Payment History</ThemedText>
                    {history.length === 0 ? (
                        <ThemedText>No payments recorded yet.</ThemedText>
                    ) : (
                        history.map((record, index) => (
                            <View key={index} style={[styles.historyItem, { borderColor: textColor }]}>
                                <ThemedText>{new Date(record.datePaid).toLocaleDateString()}</ThemedText>
                                <ThemedText type="defaultSemiBold">{subscription.currency} {record.amountPaid.toFixed(2)}</ThemedText>
                            </View>
                        ))
                    )}
                </View>
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
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    form: {
        gap: 12,
    },
    details: {
        gap: 8,
        marginBottom: 30,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    notes: {
        fontStyle: 'italic',
        marginTop: 8,
        opacity: 0.8,
    },
    historySection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 20,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    }
});
