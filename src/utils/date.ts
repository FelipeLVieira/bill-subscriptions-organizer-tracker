export type BillingInterval = 'monthly' | 'yearly' | 'weekly' | 'daily' | 'unique';

export function calculateNextBillingDate(currentDate: string | Date, interval: BillingInterval): Date {
    const nextDate = new Date(currentDate);
    if (interval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (interval === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else if (interval === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (interval === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    // 'unique' (one-time) bills don't recur — return the same date
    // so the bill stays as-is after being marked paid
    return nextDate;
}
