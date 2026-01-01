import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const subscriptions = sqliteTable('subscriptions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    billingInterval: text('billing_interval').notNull(), // daily, monthly, yearly, custom
    nextBillingDate: text('next_billing_date').notNull(), // ISO Date
    reminderSchema: text('reminder_schema'), // JSON string
    categoryGroup: text('category_group'),
    notes: text('notes'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

export const billingHistory = sqliteTable('billing_history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    subscriptionId: integer('subscription_id').references(() => subscriptions.id),
    datePaid: text('date_paid').notNull(),
    amountPaid: real('amount_paid').notNull(),
    currency: text('currency').notNull().default('USD'),
    status: text('status').notNull(), // Paid, Skipped
});
