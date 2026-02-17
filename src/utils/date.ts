export type BillingInterval = 'monthly' | 'yearly' | 'weekly' | 'daily' | 'unique';

/**
 * Calculate the next billing date based on the interval.
 * 
 * For monthly/yearly billing on month-end dates (28th-31st), this function
 * clamps to the last day of the target month to prevent overflow.
 * E.g., Jan 31 + 1 month = Feb 28 (or Feb 29 in leap years), not Mar 2/3.
 * 
 * This matches user expectations: a bill due on the 31st should recur on
 * the last day of each month, not skip to early next month.
 */
export function calculateNextBillingDate(currentDate: string | Date, interval: BillingInterval): Date {
    const date = new Date(currentDate);

    if (interval === 'monthly') {
        // Move to next month
        const targetMonth = date.getMonth() + 1;
        date.setMonth(targetMonth);
        
        // If overflow occurred (e.g., Jan 31 -> Mar 3), clamp to last day of target month
        if (date.getMonth() !== targetMonth % 12) {
            // Set to day 0 of the overflowed month = last day of target month
            date.setDate(0);
        }
    } else if (interval === 'yearly') {
        // Move to next year
        const targetYear = date.getFullYear() + 1;
        const targetMonth = date.getMonth();
        date.setFullYear(targetYear);
        
        // Handle Feb 29 -> Feb 28 in non-leap years
        if (date.getMonth() !== targetMonth) {
            // Overflow occurred (Feb 29 in leap year -> Mar 1 in non-leap year)
            date.setDate(0); // Go back to last day of February
        }
    } else if (interval === 'weekly') {
        date.setDate(date.getDate() + 7);
    } else if (interval === 'daily') {
        date.setDate(date.getDate() + 1);
    }
    // 'unique' (one-time) bills don't recur — return the same date
    // so the bill stays as-is after being marked paid

    return date;
}
