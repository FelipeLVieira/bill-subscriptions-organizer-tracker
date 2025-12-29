import { BillingInterval, calculateNextBillingDate } from '@/utils/date';
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

import { cancelReminder, scheduleReminder } from '@/utils/notifications';

// ...

export const paySubscription = async (sub: Subscription) => {
    const amount = sub.amount;
    const datePaid = new Date().toISOString();

    // Cancel existing notification if present
    if (sub.reminderSchema) {
        try {
            const schema = JSON.parse(sub.reminderSchema);
            if (schema.notificationId) {
                await cancelReminder(schema.notificationId);
            }
        } catch (e) {
            console.error('Error parsing reminder schema', e);
        }
    }

    await db.transaction(async (tx) => {
        // Record history
        await tx.insert(billingHistory).values({
            subscriptionId: sub.id,
            datePaid,
            amountPaid: amount,
            status: 'paid',
        });

        // Update next billing date based on interval
        const nextDate = calculateNextBillingDate(sub.nextBillingDate, sub.billingInterval as BillingInterval);

        // Schedule new notification (24h before)
        const triggerDate = new Date(nextDate);
        triggerDate.setHours(triggerDate.getHours() - 24);

        const newNotificationId = await scheduleReminder(
            `Bill due: ${sub.name}`,
            `Your payment of ${sub.currency} ${sub.amount} is due tomorrow.`,
            triggerDate
        );

        await tx.update(subscriptions)
            .set({
                nextBillingDate: nextDate.toISOString(),
                reminderSchema: JSON.stringify({ notificationId: newNotificationId })
            })
            .where(eq(subscriptions.id, sub.id));
    });
};

export const deleteSubscription = async (id: number) => {
    // Get sub to find notification ID
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).get();
    if (sub && sub.reminderSchema) {
        try {
            const schema = JSON.parse(sub.reminderSchema);
            if (schema.notificationId) {
                await cancelReminder(schema.notificationId);
            }
        } catch (e) { console.error(e); }
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

