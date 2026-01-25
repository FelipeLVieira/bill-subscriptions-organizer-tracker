// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

import {
  createDefaultReminder,
  generateReminderId,
  parseReminderSchema,
  serializeReminderSchema,
  getReminderDisplayText,
  ReminderSchema,
  Reminder,
} from '../src/utils/notifications';

describe('Notification Utilities', () => {
  describe('generateReminderId', () => {
    it('should generate a unique string ID', () => {
      const id = generateReminderId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should start with "reminder_" prefix', () => {
      const id = generateReminderId();
      expect(id.startsWith('reminder_')).toBe(true);
    });

    it('should generate unique IDs on each call', () => {
      const id1 = generateReminderId();
      const id2 = generateReminderId();
      const id3 = generateReminderId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should contain timestamp component', () => {
      const id = generateReminderId();
      const parts = id.split('_');
      expect(parts.length).toBeGreaterThanOrEqual(2);
      // The second part should be a timestamp (numeric)
      expect(!isNaN(Number(parts[1]))).toBe(true);
    });
  });

  describe('createDefaultReminder', () => {
    it('should create a reminder with default values', () => {
      const reminder = createDefaultReminder();

      expect(reminder.id).toBeDefined();
      expect(reminder.notificationId).toBeNull();
      expect(reminder.daysBefore).toBe(1);
      expect(reminder.hour).toBe(9); // Default is 9 AM for practical reminder time
      expect(reminder.minute).toBe(0);
      expect(reminder.enabled).toBe(true);
    });

    it('should generate unique IDs for each default reminder', () => {
      const reminder1 = createDefaultReminder();
      const reminder2 = createDefaultReminder();

      expect(reminder1.id).not.toBe(reminder2.id);
    });

    it('should have all required Reminder fields', () => {
      const reminder = createDefaultReminder();

      expect('id' in reminder).toBe(true);
      expect('notificationId' in reminder).toBe(true);
      expect('daysBefore' in reminder).toBe(true);
      expect('hour' in reminder).toBe(true);
      expect('minute' in reminder).toBe(true);
      expect('enabled' in reminder).toBe(true);
    });
  });

  describe('parseReminderSchema', () => {
    it('should return default schema for null input', () => {
      const schema = parseReminderSchema(null);

      expect(schema.reminders).toBeDefined();
      expect(Array.isArray(schema.reminders)).toBe(true);
      expect(schema.reminders.length).toBe(1);
    });

    it('should return default schema for undefined input', () => {
      const schema = parseReminderSchema(undefined);

      expect(schema.reminders).toBeDefined();
      expect(schema.reminders.length).toBe(1);
    });

    it('should return default schema for empty string', () => {
      const schema = parseReminderSchema('');

      expect(schema.reminders).toBeDefined();
      expect(schema.reminders.length).toBe(1);
    });

    it('should parse valid JSON schema', () => {
      const validSchema: ReminderSchema = {
        reminders: [
          {
            id: 'test-id-1',
            notificationId: 'notif-1',
            daysBefore: 2,
            hour: 9,
            minute: 30,
            enabled: true,
          },
          {
            id: 'test-id-2',
            notificationId: null,
            daysBefore: 0,
            hour: 18,
            minute: 0,
            enabled: false,
          },
        ],
      };

      const parsed = parseReminderSchema(JSON.stringify(validSchema));

      expect(parsed.reminders.length).toBe(2);
      expect(parsed.reminders[0].daysBefore).toBe(2);
      expect(parsed.reminders[0].hour).toBe(9);
      expect(parsed.reminders[1].enabled).toBe(false);
    });

    it('should handle legacy format with single notificationId', () => {
      const legacyFormat = { notificationId: 'legacy-id' };
      const parsed = parseReminderSchema(JSON.stringify(legacyFormat));

      expect(parsed.reminders).toBeDefined();
      expect(parsed.reminders.length).toBe(1);
      expect(parsed.reminders[0].notificationId).toBe('legacy-id');
      expect(parsed.reminders[0].daysBefore).toBe(1);
      expect(parsed.reminders[0].enabled).toBe(true);
    });

    it('should return default schema for invalid JSON', () => {
      const schema = parseReminderSchema('not valid json {{{');

      expect(schema.reminders).toBeDefined();
      expect(schema.reminders.length).toBe(1);
    });
  });

  describe('serializeReminderSchema', () => {
    it('should serialize schema to JSON string', () => {
      const schema: ReminderSchema = {
        reminders: [createDefaultReminder()],
      };

      const serialized = serializeReminderSchema(schema);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should preserve all reminder data', () => {
      const reminder: Reminder = {
        id: 'test-id',
        notificationId: 'notif-123',
        daysBefore: 3,
        hour: 14,
        minute: 45,
        enabled: true,
      };

      const schema: ReminderSchema = { reminders: [reminder] };
      const serialized = serializeReminderSchema(schema);
      const parsed = JSON.parse(serialized);

      expect(parsed.reminders[0].id).toBe('test-id');
      expect(parsed.reminders[0].notificationId).toBe('notif-123');
      expect(parsed.reminders[0].daysBefore).toBe(3);
      expect(parsed.reminders[0].hour).toBe(14);
      expect(parsed.reminders[0].minute).toBe(45);
      expect(parsed.reminders[0].enabled).toBe(true);
    });

    it('should be reversible with parseReminderSchema', () => {
      const originalSchema: ReminderSchema = {
        reminders: [
          {
            id: 'reminder-1',
            notificationId: 'notif-1',
            daysBefore: 1,
            hour: 9,
            minute: 0,
            enabled: true,
          },
          {
            id: 'reminder-2',
            notificationId: null,
            daysBefore: 7,
            hour: 18,
            minute: 30,
            enabled: false,
          },
        ],
      };

      const serialized = serializeReminderSchema(originalSchema);
      const parsed = parseReminderSchema(serialized);

      expect(parsed.reminders.length).toBe(2);
      expect(parsed.reminders[0].id).toBe('reminder-1');
      expect(parsed.reminders[1].id).toBe('reminder-2');
    });
  });

  describe('getReminderDisplayText', () => {
    const mockT = (key: string) => {
      const translations: Record<string, string> = {
        'onDueDate': 'On due date',
        'dayBefore': '1 day before',
        'daysBefore': 'days before',
        'at': 'at',
      };
      return translations[key] || key;
    };

    it('should display "On due date" for 0 days before', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 0,
        hour: 9,
        minute: 0,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('On due date');
    });

    it('should display "1 day before" for 1 day', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 1,
        hour: 9,
        minute: 0,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('1 day before');
    });

    it('should display "X days before" for multiple days', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 3,
        hour: 9,
        minute: 0,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('3');
      expect(text).toContain('days before');
    });

    it('should format time in 12-hour format with AM/PM', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 1,
        hour: 9,
        minute: 5,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('9:05 AM');
    });

    it('should handle midnight correctly (12:00 AM)', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 1,
        hour: 0,
        minute: 0,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('12:00 AM');
    });

    it('should handle evening time correctly (11:59 PM)', () => {
      const reminder: Reminder = {
        id: 'test',
        notificationId: null,
        daysBefore: 1,
        hour: 23,
        minute: 59,
        enabled: true,
      };

      const text = getReminderDisplayText(reminder, mockT);
      expect(text).toContain('11:59 PM');
    });
  });
});
