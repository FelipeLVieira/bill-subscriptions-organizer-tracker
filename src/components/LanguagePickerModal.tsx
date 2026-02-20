import { IconSymbol } from '@/components/ui/icon-symbol';
import { SUPPORTED_LANGUAGES } from '@/constants/Languages';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LanguagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (code: string) => void;
}

export function LanguagePickerModal({ visible, onClose, onSelect }: LanguagePickerModalProps) {
    const [search, setSearch] = useState('');
    const insets = useSafeAreaInsets();
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const { locale } = useLanguage();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            // Reset to start position before animating in
            fadeAnim.setValue(0);
            slideAnim.setValue(300);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 65,
                    useNativeDriver,
                }),
            ]).start();
        }
    }, [visible, fadeAnim, slideAnim]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver,
            }),
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 150,
                useNativeDriver,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const filteredLanguages = useMemo(() => {
        const searchLower = search.toLowerCase();
        return SUPPORTED_LANGUAGES.filter(lang =>
            lang.label.toLowerCase().includes(searchLower) ||
            lang.code.toLowerCase().includes(searchLower) ||
            lang.nativeName?.toLowerCase().includes(searchLower) ||
            lang.englishName?.toLowerCase().includes(searchLower)
        );
    }, [search]);

    const handleSelect = useCallback((code: string) => {
        Haptic.selection();
        onSelect(code);
    }, [onSelect]);

    const renderLanguageItem = useCallback(({ item }: { item: typeof SUPPORTED_LANGUAGES[0] }) => {
        // Show native name first (prominent), then English name below for non-native speakers
        const showEnglishName = item.nativeName !== item.englishName;

        return (
            <TouchableOpacity
                style={[styles.item, { borderBottomColor: textColor + '20' }]}
                onPress={() => handleSelect(item.code)}
                activeOpacity={0.7}
            >
                <ThemedText style={styles.flag}>{item.flag}</ThemedText>
                <View style={styles.labelContainer}>
                    <ThemedText style={styles.label}>{item.nativeName}</ThemedText>
                    {showEnglishName && (
                        <ThemedText style={[styles.englishName, { opacity: 0.5 }]}>{item.englishName}</ThemedText>
                    )}
                </View>
                {locale === item.code && (
                    <IconSymbol name="checkmark" size={20} color={primaryColor} />
                )}
            </TouchableOpacity>
        );
    }, [textColor, primaryColor, locale, handleSelect]);

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
                </Animated.View>
                <Animated.View style={[styles.modalWrapper, { transform: [{ translateY: slideAnim }] }]}>
                    <ThemedView style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.header}>
                            <ThemedText type="subtitle">{i18n.t('selectYourLanguage')}</ThemedText>
                            <TouchableOpacity onPress={handleClose}>
                                <IconSymbol name="xmark.circle.fill" size={24} color={textColor} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
                            <IconSymbol name="magnifyingglass" size={20} color={textColor} style={{ opacity: 0.5 }} />
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder={i18n.t('searchLanguages')}
                                placeholderTextColor={textColor + '80'}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <FlatList
                            data={filteredLanguages}
                            keyExtractor={(item) => item.code}
                            renderItem={renderLanguageItem}
                            style={styles.list}
                            removeClippedSubviews
                            maxToRenderPerBatch={15}
                            initialNumToRender={12}
                            windowSize={5}
                            getItemLayout={(_, index) => ({
                                length: 60,
                                offset: 60 * index,
                                index,
                            })}
                        />
                    </ThemedView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalWrapper: {
        height: '70%',
    },
    modalContent: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        ...shadows.bottomSheet,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 60,
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    labelContainer: {
        flex: 1,
    },
    label: {
        fontSize: 16,
    },
    nativeName: {
        fontSize: 13,
        marginTop: 2,
    },
    englishName: {
        fontSize: 12,
        marginTop: 2,
        fontStyle: 'italic',
    },
});
