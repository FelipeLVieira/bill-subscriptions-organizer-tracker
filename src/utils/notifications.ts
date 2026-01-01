import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Reminder schema types
export interface Reminder {
    id: string;
    notificationId: string | null;
    daysBefore: number;
    hour: number;
    minute: number;
    enabled: boolean;
}

export interface ReminderSchema {
    reminders: Reminder[];
}

// Create default reminder (1 day before at midnight)
export function createDefaultReminder(): Reminder {
    return {
        id: generateReminderId(),
        notificationId: null,
        daysBefore: 1,
        hour: 0,
        minute: 0,
        enabled: true,
    };
}

// Generate unique reminder ID
export function generateReminderId(): string {
    return `reminder_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Parse reminder schema from JSON string
export function parseReminderSchema(json: string | null | undefined): ReminderSchema {
    if (!json) {
        return { reminders: [createDefaultReminder()] };
    }
    try {
        const parsed = JSON.parse(json);
        // Handle legacy format (single notificationId)
        if (parsed.notificationId && !parsed.reminders) {
            return {
                reminders: [{
                    id: generateReminderId(),
                    notificationId: parsed.notificationId,
                    daysBefore: 1,
                    hour: 0,
                    minute: 0,
                    enabled: true,
                }]
            };
        }
        return parsed as ReminderSchema;
    } catch {
        return { reminders: [createDefaultReminder()] };
    }
}

// Serialize reminder schema to JSON string
export function serializeReminderSchema(schema: ReminderSchema): string {
    return JSON.stringify(schema);
}

export async function requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }
    return true;
}

export async function scheduleReminder(title: string, body: string, triggerDate: Date) {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    // Don't schedule if trigger date is in the past
    if (triggerDate <= new Date()) {
        return null;
    }

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        return id;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

export async function cancelReminder(notificationId: string) {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
        console.error('Error canceling notification:', e);
    }
}

// Cancel all reminders in a schema
export async function cancelAllReminders(schema: ReminderSchema) {
    for (const reminder of schema.reminders) {
        if (reminder.notificationId) {
            await cancelReminder(reminder.notificationId);
        }
    }
}

// Schedule all reminders for a subscription
export async function scheduleAllReminders(
    subscriptionName: string,
    amount: number,
    currency: string,
    nextBillingDate: string,
    schema: ReminderSchema,
    t: (key: string) => string
): Promise<ReminderSchema> {
    const billingDate = new Date(nextBillingDate);
    const updatedReminders: Reminder[] = [];

    for (const reminder of schema.reminders) {
        // Cancel existing notification if any
        if (reminder.notificationId) {
            await cancelReminder(reminder.notificationId);
        }

        if (!reminder.enabled) {
            updatedReminders.push({ ...reminder, notificationId: null });
            continue;
        }

        // Calculate trigger date
        const triggerDate = new Date(billingDate);
        triggerDate.setDate(triggerDate.getDate() - reminder.daysBefore);
        triggerDate.setHours(reminder.hour, reminder.minute, 0, 0);

        // Schedule if in the future
        let notificationId: string | null = null;
        if (triggerDate > new Date()) {
            notificationId = await scheduleReminder(
                `${t('billDue')}: ${subscriptionName}`,
                `${t('paymentDueRef')}: ${currency} ${amount.toFixed(2)}`,
                triggerDate
            );
        }

        updatedReminders.push({
            ...reminder,
            notificationId,
        });
    }

    return { reminders: updatedReminders };
}

// Calculate the display text for a reminder
export function getReminderDisplayText(
    reminder: Reminder,
    t: (key: string) => string
): string {
    const daysText = reminder.daysBefore === 0
        ? t('onDueDate')
        : reminder.daysBefore === 1
            ? t('dayBefore')
            : `${reminder.daysBefore} ${t('daysBefore')}`;

    const timeText = `${reminder.hour.toString().padStart(2, '0')}:${reminder.minute.toString().padStart(2, '0')}`;

    return `${daysText} ${t('at')} ${timeText}`;
}
