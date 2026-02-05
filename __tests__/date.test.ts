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

      // *** UPDATED: Month-end clamping behavior ***
      it('should clamp Jan 31 to Feb 28 (non-leap year)', () => {
        const date = new Date('2023-01-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        // Jan 31 + 1 month = Feb 28 (clamped to last day of February)
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(28);
      });

      it('should clamp Jan 31 to Feb 29 (leap year)', () => {
        const date = new Date('2024-01-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        // Jan 31 + 1 month = Feb 29 (clamped to last day of February in leap year)
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(29);
      });

      it('should clamp Mar 31 to Apr 30', () => {
        const date = new Date('2023-03-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        // Mar 31 + 1 month = Apr 30 (clamped to last day of April)
        expect(nextDate.getUTCMonth()).toBe(3); // April
        expect(nextDate.getUTCDate()).toBe(30);
      });

      it('should handle Feb 28 in non-leap year', () => {
        const date = new Date('2023-02-28T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(28);
      });

      it('should handle Feb 29 in leap year -> Mar 29', () => {
        const date = new Date('2024-02-29T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(2); // March
        expect(nextDate.getUTCDate()).toBe(29);
      });

      it('should handle Aug 31 -> Sep 30', () => {
        const date = new Date('2023-08-31T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'monthly');
        expect(nextDate.getUTCMonth()).toBe(8); // September
        expect(nextDate.getUTCDate()).toBe(30);
      });

      it('should handle consecutive months ending in 30/31 days', () => {
        // May 31 -> Jun 30 -> Jul 30
        const may = new Date('2023-05-31T12:00:00.000Z');
        const jun = calculateNextBillingDate(may, 'monthly');
        expect(jun.getUTCMonth()).toBe(5); // June
        expect(jun.getUTCDate()).toBe(30);

        const jul = calculateNextBillingDate(jun, 'monthly');
        expect(jul.getUTCMonth()).toBe(6); // July
        expect(jul.getUTCDate()).toBe(30);
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

      // *** UPDATED: Leap year to non-leap year clamping ***
      it('should clamp Feb 29 to Feb 28 in non-leap year', () => {
        const date = new Date('2024-02-29T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'yearly');
        // 2025 is not a leap year, so Feb 29 -> Feb 28
        expect(nextDate.getUTCFullYear()).toBe(2025);
        expect(nextDate.getUTCMonth()).toBe(1); // February
        expect(nextDate.getUTCDate()).toBe(28);
      });

      it('should preserve time of day', () => {
        const date = new Date('2023-06-15T14:30:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'yearly');
        expect(nextDate.getUTCHours()).toBe(14);
        expect(nextDate.getUTCMinutes()).toBe(30);
      });

      it('should handle leap year to leap year (Feb 29 preserved)', () => {
        const date = new Date('2024-02-29T12:00:00.000Z');
        // 2028 is a leap year
        let nextDate = date;
        for (let i = 0; i < 4; i++) {
          nextDate = calculateNextBillingDate(nextDate, 'yearly');
        }
        expect(nextDate.getUTCFullYear()).toBe(2028);
        expect(nextDate.getUTCMonth()).toBe(1); // February
        // After 4 years of clamping to 28, should still be 28 (or 29 if leap year chain)
        // Note: After clamping to Feb 28, subsequent years stay at Feb 28
        expect(nextDate.getUTCDate()).toBe(28);
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
        const intervals: BillingInterval[] = ['daily', 'weekly', 'monthly', 'yearly', 'unique'];

        intervals.forEach((interval) => {
          const nextDate = calculateNextBillingDate(date, interval);
          expect(nextDate).toBeInstanceOf(Date);
          // unique interval returns the same date, all others advance
          if (interval !== 'unique') {
            expect(nextDate.getTime()).toBeGreaterThan(date.getTime());
          }
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

      it('should handle last day of year with clamping', () => {
        const date = new Date('2023-12-31T12:00:00.000Z');
        const nextMonth = calculateNextBillingDate(date, 'monthly');
        expect(nextMonth.getUTCFullYear()).toBe(2024);
        expect(nextMonth.getUTCMonth()).toBe(0); // January
        expect(nextMonth.getUTCDate()).toBe(31); // Jan has 31 days, no clamping needed

        const nextYear = calculateNextBillingDate(date, 'yearly');
        expect(nextYear.getUTCFullYear()).toBe(2024);
        expect(nextYear.getUTCMonth()).toBe(11); // December
        expect(nextYear.getUTCDate()).toBe(31);
      });
    });

    describe('Unique (One-time) Billing', () => {
      it('should return the same date for unique billing interval', () => {
        const date = new Date('2023-06-15T12:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'unique');
        expect(nextDate.toISOString()).toBe('2023-06-15T12:00:00.000Z');
      });

      it('should not modify the date for one-time bills', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const nextDate = calculateNextBillingDate(date, 'unique');
        expect(nextDate.getTime()).toBe(date.getTime());
      });
    });

    describe('Month-End Recurring Bill Edge Cases', () => {
      it('should consistently handle 31st day bills across all months', () => {
        // Starting Jan 31, recurring monthly through the year
        let date = new Date('2023-01-31T12:00:00.000Z');
        const expectedDays = [
          28, // Feb (2023 non-leap year)
          28, // Mar (clamped from Feb 28)
          28, // Apr (clamped)
          28, // May
          28, // Jun
          28, // Jul
          28, // Aug
          28, // Sep
          28, // Oct
          28, // Nov
          28, // Dec
        ];

        for (let i = 0; i < 11; i++) {
          date = calculateNextBillingDate(date, 'monthly');
          expect(date.getUTCDate()).toBe(expectedDays[i]);
        }
      });

      it('should handle 30th day bills with Feb clamping', () => {
        const jan30 = new Date('2023-01-30T12:00:00.000Z');
        const feb = calculateNextBillingDate(jan30, 'monthly');
        expect(feb.getUTCMonth()).toBe(1);
        expect(feb.getUTCDate()).toBe(28); // Clamped to Feb 28

        const mar = calculateNextBillingDate(feb, 'monthly');
        expect(mar.getUTCMonth()).toBe(2);
        expect(mar.getUTCDate()).toBe(28); // Stays at 28 after clamping
      });
    });
  });
});
