import { useThemeColor } from '@/hooks/use-theme-color';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, any> = {
    success: 'checkmark.circle.fill',
    error: 'xmark.circle.fill',
    warning: 'exclamationmark.triangle.fill',
    info: 'info.circle.fill',
};

interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const toastBg = useThemeColor({}, 'toastBg');
    const successColor = useThemeColor({}, 'toastSuccess');
    const errorColor = useThemeColor({}, 'toastError');
    const warningColor = useThemeColor({}, 'toastWarning');
    const infoColor = useThemeColor({}, 'toastInfo');
    const textColor = useThemeColor({}, 'text');

    const colors: Record<ToastType, string> = {
        success: successColor,
        error: errorColor,
        warning: warningColor,
        info: infoColor,
    };

    useEffect(() => {
        // Play haptic based on type
        const playHaptic = async () => {
            switch (toast.type) {
                case 'success':
                    await Haptic.success();
                    break;
                case 'error':
                    await Haptic.error();
                    break;
                case 'warning':
                    await Haptic.warning();
                    break;
                default:
                    await Haptic.light();
            }
        };
        playHaptic();

        // Animate in
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 80,
                useNativeDriver,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver,
            }),
        ]).start();

        // Auto dismiss
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 200,
                    useNativeDriver,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver,
                }),
            ]).start(() => {
                onDismiss(toast.id);
            });
        }, toast.duration || 3000);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- animation refs and callbacks are stable, only run once on mount
    }, []);

    const iconColor = colors[toast.type];

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: toastBg,
                    borderLeftColor: iconColor,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <IconSymbol name={ICONS[toast.type]} size={22} color={iconColor} />
            <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
                {toast.message}
            </Text>
        </Animated.View>
    );
}

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const insets = useSafeAreaInsets();

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <View style={[styles.container, { top: insets.top + 10, pointerEvents: 'none' }]}>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        ...shadows.medium,
        borderLeftWidth: 4,
        maxWidth: 400,
        width: '100%',
    },
    message: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
});
