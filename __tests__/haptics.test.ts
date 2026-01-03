/**
 * Haptics Utility Tests
 *
 * Tests for the haptic feedback utility functions.
 * The haptics module uses import * as Haptics from 'expo-haptics'
 * which creates a namespace object.
 */

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Define mock functions - must use jest.fn() here so they're hoisted
const mockImpactAsync = jest.fn().mockResolvedValue(undefined);
const mockSelectionAsync = jest.fn().mockResolvedValue(undefined);
const mockNotificationAsync = jest.fn().mockResolvedValue(undefined);

// Mock expo-haptics - accessing the mock functions via a getter to work around hoisting
jest.mock('expo-haptics', () => ({
  get impactAsync() {
    return mockImpactAsync;
  },
  get selectionAsync() {
    return mockSelectionAsync;
  },
  get notificationAsync() {
    return mockNotificationAsync;
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Now import the module under test
import {
  Haptic,
  lightImpact,
  mediumImpact,
  heavyImpact,
  selectionFeedback,
  successNotification,
  warningNotification,
  errorNotification,
} from '../src/utils/haptics';

describe('Haptics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Impact Functions', () => {
    it('should call light impact with correct style', async () => {
      await lightImpact();
      expect(mockImpactAsync).toHaveBeenCalledWith('light');
    });

    it('should call medium impact with correct style', async () => {
      await mediumImpact();
      expect(mockImpactAsync).toHaveBeenCalledWith('medium');
    });

    it('should call heavy impact with correct style', async () => {
      await heavyImpact();
      expect(mockImpactAsync).toHaveBeenCalledWith('heavy');
    });
  });

  describe('Selection Feedback', () => {
    it('should call selection feedback', async () => {
      await selectionFeedback();
      expect(mockSelectionAsync).toHaveBeenCalled();
    });
  });

  describe('Notification Functions', () => {
    it('should call success notification with correct type', async () => {
      await successNotification();
      expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    });

    it('should call warning notification with correct type', async () => {
      await warningNotification();
      expect(mockNotificationAsync).toHaveBeenCalledWith('warning');
    });

    it('should call error notification with correct type', async () => {
      await errorNotification();
      expect(mockNotificationAsync).toHaveBeenCalledWith('error');
    });
  });

  describe('Haptic Convenience Object', () => {
    it('should export all haptic functions', () => {
      expect(Haptic.light).toBeDefined();
      expect(Haptic.medium).toBeDefined();
      expect(Haptic.heavy).toBeDefined();
      expect(Haptic.selection).toBeDefined();
      expect(Haptic.success).toBeDefined();
      expect(Haptic.warning).toBeDefined();
      expect(Haptic.error).toBeDefined();
    });

    it('should have correct function references', () => {
      expect(Haptic.light).toBe(lightImpact);
      expect(Haptic.medium).toBe(mediumImpact);
      expect(Haptic.heavy).toBe(heavyImpact);
      expect(Haptic.selection).toBe(selectionFeedback);
      expect(Haptic.success).toBe(successNotification);
      expect(Haptic.warning).toBe(warningNotification);
      expect(Haptic.error).toBe(errorNotification);
    });

    it('should call through Haptic object correctly', async () => {
      await Haptic.light();
      expect(mockImpactAsync).toHaveBeenCalledWith('light');

      await Haptic.success();
      expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    });
  });
});

describe('Haptics on Android Platform', () => {
  it('should not call haptic functions on Android', async () => {
    // Reset modules to apply new Platform mock
    jest.resetModules();

    // Mock Platform as Android
    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'android',
      },
    }));

    // Set up fresh mock for Android test
    const androidMockImpactAsync = jest.fn();
    jest.doMock('expo-haptics', () => ({
      impactAsync: androidMockImpactAsync,
      selectionAsync: jest.fn(),
      notificationAsync: jest.fn(),
      ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
      },
      NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
      },
    }));

    // Re-import with new mocks
    const hapticsAndroid = require('../src/utils/haptics');

    // Call the function - should not throw and should not call the underlying function
    await hapticsAndroid.lightImpact();

    // On Android, the haptic functions should not be called (isHapticsSupported = false)
    expect(androidMockImpactAsync).not.toHaveBeenCalled();
  });
});
