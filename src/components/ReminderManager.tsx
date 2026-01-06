import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
    createDefaultReminder,
    getReminderDisplayText,
    Reminder,
    ReminderSchema,
} from '@/utils/notifications';

interface ReminderManagerProps {
    schema: ReminderSchema;
    onUpdate: (schema: ReminderSchema) => void;
    isEditing?: boolean;
}

export function ReminderManager({ schema, onUpdate, isEditing = false }: ReminderManagerProps) {
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');
    const pickerTextColor = useThemeColor({}, 'pickerText');
    const pickerBgColor = useThemeColor({}, 'pickerBg');
    const { colorScheme } = useTheme();

    const handleAddReminder = () => {
        const newReminder = createDefaultReminder();
        setEditingReminder(newReminder);
        setShowEditModal(true);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder({ ...reminder });
        setShowEditModal(true);
    };

    const handleDeleteReminder = (reminderId: string) => {
        Alert.alert(
            i18n.t('deleteReminder'),
            i18n.t('deleteReminderConfirm'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: () => {
                        const updatedReminders = schema.reminders.filter(r => r.id !== reminderId);
                        onUpdate({ reminders: updatedReminders });
                    },
                },
            ]
        );
    };

    const handleToggleReminder = (reminderId: string, enabled: boolean) => {
        const updatedReminders = schema.reminders.map(r =>
            r.id === reminderId ? { ...r, enabled } : r
        );
        onUpdate({ reminders: updatedReminders });
    };

    const handleSaveReminder = () => {
        if (!editingReminder) return;

        const existingIndex = schema.reminders.findIndex(r => r.id === editingReminder.id);

        if (existingIndex >= 0) {
            // Update existing
            const updatedReminders = [...schema.reminders];
            updatedReminders[existingIndex] = editingReminder;
            onUpdate({ reminders: updatedReminders });
        } else {
            // Add new
            onUpdate({ reminders: [...schema.reminders, editingReminder] });
        }

        setShowEditModal(false);
        setEditingReminder(null);
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate && editingReminder) {
            setEditingReminder({
                ...editingReminder,
                hour: selectedDate.getHours(),
                minute: selectedDate.getMinutes(),
            });
        }
    };

    // Create a Date object from hour and minute for the time picker
    const getTimePickerValue = () => {
        const date = new Date();
        date.setHours(editingReminder?.hour || 0);
        date.setMinutes(editingReminder?.minute || 0);
        return date;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">{i18n.t('reminders')}</ThemedText>
                {isEditing && (
                    <TouchableOpacity onPress={handleAddReminder} style={styles.addButton}>
                        <IconSymbol name="plus.circle.fill" size={24} color={primaryColor} />
                    </TouchableOpacity>
                )}
            </View>

            {schema.reminders.length === 0 ? (
                <ThemedText style={styles.noReminders}>{i18n.t('noReminders')}</ThemedText>
            ) : (
                schema.reminders.map((reminder) => (
                    <Card key={reminder.id} style={styles.reminderCard}>
                        <View style={styles.reminderRow}>
                            <View style={styles.reminderInfo}>
                                <IconSymbol
                                    name="bell.fill"
                                    size={18}
                                    color={reminder.enabled ? primaryColor : textColor}
                                    style={{ opacity: reminder.enabled ? 1 : 0.4 }}
                                />
                                <ThemedText
                                    style={[
                                        styles.reminderText,
                                        !reminder.enabled && styles.reminderTextDisabled,
                                    ]}
                                >
                                    {getReminderDisplayText(reminder, i18n.t.bind(i18n))}
                                </ThemedText>
                            </View>

                            {isEditing ? (
                                <View style={styles.reminderActions}>
                                    <Switch
                                        value={reminder.enabled}
                                        onValueChange={(value) => handleToggleReminder(reminder.id, value)}
                                        trackColor={{ false: borderColor, true: primaryColor + '80' }}
                                        thumbColor={reminder.enabled ? primaryColor : '#f4f3f4'}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleEditReminder(reminder)}
                                        style={styles.actionButton}
                                    >
                                        <IconSymbol name="pencil" size={18} color={primaryColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteReminder(reminder.id)}
                                        style={styles.actionButton}
                                    >
                                        <IconSymbol name="trash" size={18} color={dangerColor} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <IconSymbol
                                    name={reminder.enabled ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                                    size={20}
                                    color={reminder.enabled ? successColor : dangerColor}
                                />
                            )}
                        </View>
                    </Card>
                ))
            )}

            {/* Edit Reminder Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle">
                                {editingReminder && schema.reminders.find(r => r.id === editingReminder.id)
                                    ? i18n.t('editReminder')
                                    : i18n.t('addReminder')}
                            </ThemedText>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color={textColor} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.label}>{i18n.t('daysBefore')}</ThemedText>
                        <View style={[styles.pickerContainer, { borderColor, backgroundColor: pickerBgColor }]}>
                            <Picker
                                selectedValue={editingReminder?.daysBefore ?? 1}
                                onValueChange={(value) =>
                                    editingReminder && setEditingReminder({ ...editingReminder, daysBefore: value })
                                }
                                style={{ color: pickerTextColor }}
                                dropdownIconColor={pickerTextColor}
                                itemStyle={{ color: pickerTextColor }}
                            >
                                <Picker.Item label={i18n.t('onDueDate')} value={0} color={pickerTextColor} />
                                <Picker.Item label={`1 ${i18n.t('dayBefore')}`} value={1} color={pickerTextColor} />
                                <Picker.Item label={`2 ${i18n.t('daysBefore')}`} value={2} color={pickerTextColor} />
                                <Picker.Item label={`3 ${i18n.t('daysBefore')}`} value={3} color={pickerTextColor} />
                                <Picker.Item label={`5 ${i18n.t('daysBefore')}`} value={5} color={pickerTextColor} />
                                <Picker.Item label={`7 ${i18n.t('daysBefore')}`} value={7} color={pickerTextColor} />
                            </Picker>
                        </View>

                        <ThemedText style={styles.label}>{i18n.t('reminderTime')}</ThemedText>
                        <DateTimePicker
                            value={getTimePickerValue()}
                            mode="time"
                            display="default"
                            onChange={handleTimeChange}
                            themeVariant={colorScheme}
                            accentColor={primaryColor}
                            style={{ alignSelf: 'flex-start', marginVertical: 8 }}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor }]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <ThemedText>{i18n.t('cancel')}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: primaryColor }]}
                                onPress={handleSaveReminder}
                            >
                                <ThemedText style={{ color: '#fff' }}>{i18n.t('save')}</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addButton: {
        padding: 4,
    },
    noReminders: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
    reminderCard: {
        marginBottom: 8,
        padding: 12,
    },
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reminderText: {
        marginLeft: 8,
        flex: 1,
    },
    reminderTextDisabled: {
        opacity: 0.5,
    },
    reminderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        opacity: 0.7,
        fontSize: 14,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {},
});
