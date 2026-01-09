import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNativeDriver } from '@/utils/animation';
import { shadows } from '@/utils/shadow';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

interface TooltipProps {
    text: string;
    children?: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 60,
                    useNativeDriver,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- animation refs are stable
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver,
            }),
        ]).start(() => {
            setVisible(false);
        });
    };

    return (
        <View style={styles.container}>
            {children}
            <Pressable onPress={() => setVisible(true)} style={styles.iconButton} hitSlop={8}>
                <IconSymbol name="questionmark.circle" size={18} color={primaryColor} />
            </Pressable>

            <Modal
                visible={visible}
                animationType="none"
                transparent
                onRequestClose={handleClose}
            >
                <Pressable style={styles.overlay} onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.tooltipContainer,
                            {
                                backgroundColor: cardColor,
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: primaryColor + '20' }]}>
                            <IconSymbol name="lightbulb.fill" size={24} color={primaryColor} />
                        </View>
                        <ThemedText style={[styles.tooltipText, { color: textColor }]}>{text}</ThemedText>
                        <Pressable style={[styles.closeButton, { backgroundColor: primaryColor }]} onPress={handleClose}>
                            <ThemedText style={styles.closeText}>OK</ThemedText>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

interface TooltipLabelProps {
    label: string;
    hint: string;
}

export function TooltipLabel({ label, hint }: TooltipLabelProps) {
    const [visible, setVisible] = useState(false);
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 60,
                    useNativeDriver,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- animation refs are stable
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver,
            }),
        ]).start(() => {
            setVisible(false);
        });
    };

    return (
        <View style={styles.labelContainer}>
            <ThemedText>{label}</ThemedText>
            <Pressable onPress={() => setVisible(true)} style={styles.iconButton} hitSlop={8}>
                <IconSymbol name="questionmark.circle" size={16} color={primaryColor} />
            </Pressable>

            <Modal
                visible={visible}
                animationType="none"
                transparent
                onRequestClose={handleClose}
            >
                <Pressable style={styles.overlay} onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.tooltipContainer,
                            {
                                backgroundColor: cardColor,
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: primaryColor + '20' }]}>
                            <IconSymbol name="lightbulb.fill" size={24} color={primaryColor} />
                        </View>
                        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>{label}</ThemedText>
                        <ThemedText style={[styles.tooltipText, { color: textColor }]}>{hint}</ThemedText>
                        <Pressable style={[styles.closeButton, { backgroundColor: primaryColor }]} onPress={handleClose}>
                            <ThemedText style={styles.closeText}>OK</ThemedText>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconButton: {
        marginLeft: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    tooltipContainer: {
        width: '100%',
        maxWidth: 300,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        ...shadows.tooltip,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    tooltipText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 16,
    },
    closeButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    closeText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
