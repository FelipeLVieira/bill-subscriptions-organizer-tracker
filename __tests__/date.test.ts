import { calculateNextBillingDate, BillingInterval } from '../src/utils/date';

describe('Date Utilities', () => {
  describe('calculateNextBillingDate', () => {
    describe('Monthly Billing', () => {
      it('should calculate next monthly date correctly', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(15);
      });

      it('should handle month boundary correctly', () => {
        const date = new Date('2023-12-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCFullYear()).toBe(2024);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(15);
      });

      it('should handle end of month rollover (Jan 31 -> Mar)', () => {
        const date = new Date('2023-01-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        // Feb has 28 days in 2023, so Jan 31 + 1 month = Feb 31 = Mar 3
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(3);
      });

      it('should handle leap year end of month', () => {
        const date = new Date('2024-01-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        // Feb has 29 days in 2024, so Jan 31 + 1 month = Feb 31 = Mar 2
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(2);
      });

      it('should handle Feb 28 in non-leap year', () => {
        const date = new Date('2023-02-28T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(28);
      });

      it('should handle Feb 29 in leap year', () => {
        const date = new Date('2024-02-29T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(29);
      });
    });

    describe('Yearly Billing', () => {
      it('should calculate next yearly date correctly', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'yearly');
        expect(nextDate.getUTCFullYear()).toBe(2024);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(15);
      });

      it('should handle leap year to non-leap year (Feb 29 -> Mar 1)', () => {
        const date = new Date('2024-02-29T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'yearly');
        // 2025 is not a leap year, so Feb 29 becomes Mar 1
        expect(nextDate.getUTCFullYear()).toBe(2025);
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(1);
      });

      it('should preserve time of day', () => {
        const date = new Date('2023-06-15T14:30:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'yearly');
        expect(nextDate.getUTCHours()).toBe(14);
        expect(nextDate.getUTCMinutes()).toBe(30);
      });
    });

    describe('Weekly Billing', () => {
      it('should calculate next weekly date correctly', () => {
        const date = new Date('2023-01-01T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'weekly');
        expect(nextDate.getUTCFullYear()).toBe(2023);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(8);
      });

      it('should handle week spanning month boundary', () => {
        const date = new Date('2023-01-28T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'weekly');
        expect(nextDate.getUTCFullYear()).toBe(2023);
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(4);
      });

      it('should handle week spanning year boundary', () => {
        const date = new Date('2023-12-28T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'weekly');
        expect(nextDate.getUTCFullYear()).toBe(2024);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(4);
      });

      it('should add exactly 7 days', () => {
        const date = new Date('2023-03-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'weekly');
        const diffDays = (nextDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(7);
      });
    });

    describe('Daily Billing', () => {
      it('should calculate next daily date correctly', () => {
        const date = new Date('2023-01-01T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        expect(nextDate.getUTCFullYear()).toBe(2023);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(2);
      });

      it('should handle day spanning month boundary', () => {
        const date = new Date('2023-01-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        expect(nextDate.getUTCFullYear()).toBe(2023);
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(1);
      });

      it('should handle day spanning year boundary', () => {
        const date = new Date('2023-12-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        expect(nextDate.getUTCFullYear()).toBe(2024);
        expect(nextDate.getUTCMonth()).toBe(0); // January
        expect(nextDate.getUTCDate()).toBe(1);
      });

      it('should add exactly 1 day', () => {
        const date = new Date('2023-03-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        const diffDays = (nextDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(1);
      });
    });

    describe('Input Handling', () => {
      it('should accept Date object as input', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate).toBeInstanceOf(Date);
      });

      it('should accept ISO string as input', () => {
        const nextDate = calculateNextBillingDate('2023-01-15T12:00:00.000Z', 'monthly');
        expect(nextDate).toBeInstanceOf(Date);
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(15);
      });

      it('should not modify original date object', () => {
        const originalDate = new Date('2023-01-15T12:00:00.000Z');
        const originalTime = originalDate.getTime();
        calculateNextBillingDate(originalDate, 'monthly');
        expect(originalDate.getTime()).toBe(originalTime);
      });

      it('should return a new Date object', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate).not.toBe(date);
      });
    });

    describe('BillingInterval Type', () => {
      it('should accept all valid billing intervals', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const intervals: BillingInterval[] = ['daily', 'weekly', 'monthly', 'yearly'];

        intervals.forEach((interval) => {
          const nextDate = calculateNextBillingDate(date, interval);
          expect(nextDate).toBeInstanceOf(Date);
          expect(nextDate.getTime()).toBeGreaterThan(date.getTime());
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle midnight correctly', () => {
        const date = new Date('2023-01-15T00:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        expect(nextDate.getUTCHours()).toBe(0);
        expect(nextDate.getUTCMinutes()).toBe(0);
        expect(nextDate.getUTCSeconds()).toBe(0);
      });

      it('should handle end of day correctly', () => {
        const date = new Date('2023-01-15T23:59:59.999Z');
        const nextDate = calculateNextBillingDate(date, 'daily');
        expect(nextDate.getUTCHours()).toBe(23);
        expect(nextDate.getUTCMinutes()).toBe(59);
      });

      it('should handle first day of year', () => {
        const date = new Date('2023-01-01T12:00:00.000Z');
        const nextMonth = calculateNextBillingDate(date, 'monthly');
        expect(nextMonth.getUTCFullYear()).toBe(2023);
        expect(nextMonth.getUTCMonth()).toBe(1); // February
        expect(nextMonth.getUTCDate()).toBe(1);

        const nextYear = calculateNextBillingDate(date, 'yearly');
        expect(nextYear.getUTCFullYear()).toBe(2024);
        expect(nextYear.getUTCMonth()).toBe(0); // January
        expect(nextYear.getUTCDate()).toBe(1);
      });

      it('should handle last day of year', () => {
        const date = new Date('2023-12-31T12:00:00.000Z');
        const nextMonth = calculateNextBillingDate(date, 'monthly');
        expect(nextMonth.getUTCFullYear()).toBe(2024);
        expect(nextMonth.getUTCMonth()).toBe(0); // January

        const nextYear = calculateNextBillingDate(date, 'yearly');
        expect(nextYear.getUTCFullYear()).toBe(2024);
        expect(nextYear.getUTCMonth()).toBe(11); // December
        expect(nextYear.getUTCDate()).toBe(31);
      });
    });
  });
});
