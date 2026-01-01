import { BillingInterval, calculateNextBillingDate } from '@/utils/date';
import i18n from '@/i18n';
import {
    cancelAllReminders,
    parseReminderSchema,
    scheduleAllReminders,
    serializeReminderSchema,
} from '@/utils/notifications';
import { desc, eq } from 'drizzle-orm';
import { db } from './index';
import { billingHistory, subscriptions } from './schema';

export type NewSubscription = typeof subscriptions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;

export const addSubscription = async (sub: NewSubscription) => {
    return await db.insert(subscriptions).values(sub).returning();
};

export const getSubscriptions = async () => {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.nextBillingDate));
};

export const paySubscription = async (sub: Subscription) => {
    const amount = sub.amount;
    const datePaid = new Date().toISOString();

    // Parse existing reminder schema
    const reminderSchema = parseReminderSchema(sub.reminderSchema);

    // Cancel existing notifications
    await cancelAllReminders(reminderSchema);

    // Calculate next billing date
    const nextDate = calculateNextBillingDate(sub.nextBillingDate, sub.billingInterval as BillingInterval);

    // Schedule new notifications with the same reminder settings
    const updatedSchema = await scheduleAllReminders(
        sub.name,
        sub.amount,
        sub.currency,
        nextDate.toISOString(),
        reminderSchema,
        i18n.t.bind(i18n)
    );

    await db.transaction(async (tx) => {
        // Record history
        await tx.insert(billingHistory).values({
            subscriptionId: sub.id,
            datePaid,
            amountPaid: amount,
            currency: sub.currency,
            status: 'paid',
        });

        await tx.update(subscriptions)
            .set({
                nextBillingDate: nextDate.toISOString(),
                reminderSchema: serializeReminderSchema(updatedSchema)
            })
            .where(eq(subscriptions.id, sub.id));
    });
};

export const deleteSubscription = async (id: number) => {
    // Get sub to find notification IDs
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).get();
    if (sub && sub.reminderSchema) {
        const schema = parseReminderSchema(sub.reminderSchema);
        await cancelAllReminders(schema);
    }
    return await db.delete(subscriptions).where(eq(subscriptions.id, id));
};

export const getSubscriptionById = async (id: number) => {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return result[0];
};

export const updateSubscription = async (id: number, sub: Partial<NewSubscription>) => {
    return await db.update(subscriptions).set(sub).where(eq(subscriptions.id, id));
};

export const getSubscriptionHistory = async (id: number) => {
    return await db.select().from(billingHistory).where(eq(billingHistory.subscriptionId, id)).orderBy(desc(billingHistory.datePaid));
};

export const getPaidThisMonth = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const history = await db.select().from(billingHistory);

    return history
        .filter(h => h.datePaid >= startOfMonth && h.datePaid <= endOfMonth && h.status === 'paid')
        .reduce((sum, h) => sum + h.amountPaid, 0);
};

