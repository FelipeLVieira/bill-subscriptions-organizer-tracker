import { Platform } from 'react-native';

// Lazy import for expo-notifications to avoid SSR issues on web
let Notifications: typeof import('expo-notifications') | null = null;

// Initialize notifications on demand (client-side only)
async function getNotifications() {
    if (Platform.OS === 'web') {
        return null;
    }
    if (!Notifications) {
        Notifications = await import('expo-notifications');
        try {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });
        } catch (e) {
            // Silently ignore
        }
    }
    return Notifications;
}

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

// Create default reminder (1 day before at 9 AM - a practical time)
export function createDefaultReminder(): Reminder {
    return {
        id: generateReminderId(),
        notificationId: null,
        daysBefore: 1,
        hour: 9,
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
    const notifications = await getNotifications();
    if (!notifications) return false;
    
    const { status: existingStatus } = await notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }
    return true;
}

export async function scheduleReminder(title: string, body: string, triggerDate: Date) {
    const notifications = await getNotifications();
    if (!notifications) return null;
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    // Don't schedule if trigger date is in the past
    if (triggerDate <= new Date()) {
        return null;
    }

    try {
        const id = await notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: {
                type: notifications.SchedulableTriggerInputTypes.DATE,
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
    const notifications = await getNotifications();
    if (!notifications) return;
    
    try {
        await notifications.cancelScheduledNotificationAsync(notificationId);
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

// Get due text based on days before
function getDueText(daysBefore: number, t: (key: string) => string): string {
    if (daysBefore === 0) {
        return t('notificationDueToday');
    } else if (daysBefore === 1) {
        return t('notificationDueTomorrow');
    } else {
        return t('notificationDueIn').replace('{{days}}', daysBefore.toString());
    }
}

// Format currency amount nicely
function formatCurrencyAmount(amount: number, currency: string): string {
    // Common currency symbols
    const symbols: { [key: string]: string } = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
        BRL: 'R$', CAD: 'C$', AUD: 'A$', INR: '₹', KRW: '₩',
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
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
            // Create informative notification content
            const dueText = getDueText(reminder.daysBefore, t);
            const formattedAmount = formatCurrencyAmount(amount, currency);

            const title = `💰 ${t('notificationTitle')}`;
            const body = `${subscriptionName} (${formattedAmount}) - ${dueText}`;

            notificationId = await scheduleReminder(
                title,
                body,
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

// Format time in 12-hour format with AM/PM
function formatTime12Hour(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    const minuteStr = minute.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${period}`;
}

// Calculate the display text for a reminder
export function getReminderDisplayText(
    reminder: Reminder,
    t: (key: string) => string
): string {
    const daysText = reminder.daysBefore === 0
        ? t('onDueDate')
        : reminder.daysBefore === 1
            ? `1 ${t('dayBefore')}`
            : `${reminder.daysBefore} ${t('daysBefore')}`;

    const timeText = formatTime12Hour(reminder.hour, reminder.minute);

    return `${daysText} ${t('at')} ${timeText}`;
}
