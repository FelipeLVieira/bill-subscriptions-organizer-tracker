import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic Feedback Utility
 *
 * Provides consistent haptic feedback across the app following iOS conventions:
 * - Light: Subtle feedback for minor actions (toggles, selections)
 * - Medium: Standard feedback for confirmations (mark as paid, save)
 * - Heavy: Strong feedback for important/destructive actions (delete)
 * - Success: Notification pattern for successful operations
 * - Warning: Notification pattern for warnings
 * - Error: Notification pattern for errors
 */

const isHapticsSupported = Platform.OS === 'ios';

/**
 * Light impact - for subtle UI feedback
 * Use for: toggles, filter selections, tab switches
 */
export const lightImpact = async () => {
    if (isHapticsSupported) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

/**
 * Medium impact - for standard confirmations
 * Use for: button presses, marking items as paid, saving
 */
export const mediumImpact = async () => {
    if (isHapticsSupported) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
};

/**
 * Heavy impact - for important actions
 * Use for: delete confirmations, destructive actions
 */
export const heavyImpact = async () => {
    if (isHapticsSupported) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
};

/**
 * Selection feedback - for picker/selection changes
 * Use for: category selection, currency picker, view mode toggle
 */
export const selectionFeedback = async () => {
    if (isHapticsSupported) {
        await Haptics.selectionAsync();
    }
};

/**
 * Success notification - for successful operations
 * Use for: subscription saved, payment marked, settings updated
 */
export const successNotification = async () => {
    if (isHapticsSupported) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
};

/**
 * Warning notification - for warning states
 * Use for: overdue bills, approaching due dates
 */
export const warningNotification = async () => {
    if (isHapticsSupported) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
};

/**
 * Error notification - for error states
 * Use for: form validation errors, failed operations
 */
export const errorNotification = async () => {
    if (isHapticsSupported) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
};

/**
 * Convenience object for all haptic functions
 */
export const Haptic = {
    light: lightImpact,
    medium: mediumImpact,
    heavy: heavyImpact,
    selection: selectionFeedback,
    success: successNotification,
    warning: warningNotification,
    error: errorNotification,
};

export default Haptic;
