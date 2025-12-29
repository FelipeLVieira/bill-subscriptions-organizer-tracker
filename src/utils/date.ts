export type BillingInterval = 'monthly' | 'yearly' | 'weekly' | 'daily';

export function calculateNextBillingDate(currentDate: string | Date, interval: BillingInterval): Date {
    const nextDate = new Date(currentDate);
    if (interval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (interval === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else if (interval === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (interval === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
}
