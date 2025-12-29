import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }
    return true;
}

export async function scheduleReminder(title: string, body: string, triggerDate: Date) {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
    });

    // ...
    return id;
}

export async function cancelReminder(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
}
