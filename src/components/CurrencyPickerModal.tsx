import { IconSymbol } from '@/components/ui/icon-symbol';
import { Currency, PREDEFINED_CURRENCIES, UserCurrency } from '@/constants/Currencies';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface CurrencyPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect?: (currency: Currency) => void;
    showManageOptions?: boolean;
    mode?: 'select' | 'manage';
}

export function CurrencyPickerModal({
    visible,
    onClose,
    onSelect,
    showManageOptions = false,
    mode = 'select'
}: CurrencyPickerModalProps) {
    const [search, setSearch] = useState('');
    const [showAddMode, setShowAddMode] = useState(false);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customCode, setCustomCode] = useState('');
    const [customSymbol, setCustomSymbol] = useState('');
    const [customName, setCustomName] = useState('');

    const insets = useSafeAreaInsets();
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const interactiveColor = useThemeColor({}, 'interactive');
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const buttonTextColor = useThemeColor({}, 'buttonText');
    const dangerColor = useThemeColor({}, 'danger');

    const { userCurrencies, defaultCurrency, addCurrency, removeCurrency, setDefaultCurrency, addCustomCurrency } = useCurrency();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            fadeAnim.setValue(0);
            slideAnim.setValue(300);
            setSearch('');
            setShowAddMode(false);
            setShowCustomForm(false);

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

    const handleClose = useCallback(() => {
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
    }, [fadeAnim, slideAnim, onClose]);

    const handleSelect = useCallback((currency: Currency) => {
        if (mode === 'manage') {
            const isUserCurrency = userCurrencies.some(c => c.code === currency.code);
            if (!isUserCurrency) {
                addCurrency(currency);
            }
        }
        onSelect?.(currency);
        handleClose();
    }, [mode, userCurrencies, addCurrency, onSelect, handleClose]);

    const handleRemove = useCallback((code: string) => {
        Alert.alert(
            i18n.t('removeCurrency'),
            i18n.t('removeCurrencyConfirm'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: () => removeCurrency(code)
                },
            ]
        );
    }, [removeCurrency]);

    const handleSetDefault = useCallback((code: string) => {
        setDefaultCurrency(code);
    }, [setDefaultCurrency]);

    const handleAddCustom = useCallback(() => {
        if (!customCode.trim() || !customSymbol.trim() || !customName.trim()) {
            Alert.alert(i18n.t('error'), i18n.t('fillAllFields'));
            return;
        }
        addCustomCurrency({
            code: customCode.toUpperCase().trim(),
            symbol: customSymbol.trim(),
            name: customName.trim(),
        });
        setCustomCode('');
        setCustomSymbol('');
        setCustomName('');
        setShowCustomForm(false);
        setShowAddMode(false);
    }, [customCode, customSymbol, customName, addCustomCurrency]);

    const handleAddPredefined = useCallback((currency: Currency) => {
        const isAlreadyAdded = userCurrencies.some(c => c.code === currency.code);
        if (!isAlreadyAdded) {
            addCurrency(currency);
            Haptic.success();
        }
        setShowAddMode(false);
    }, [userCurrencies, addCurrency]);

    // List of predefined currencies not yet added by the user
    const availableCurrencies = useMemo(() => {
        const userCodes = new Set(userCurrencies.map(c => c.code));
        const searchLower = search.toLowerCase();
        return PREDEFINED_CURRENCIES.filter(c =>
            !userCodes.has(c.code) &&
            (c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower) ||
            c.symbol.includes(search))
        );
    }, [userCurrencies, search]);

    const dataToShow = useMemo(() => {
        if (showManageOptions && showAddMode && !showCustomForm) {
            // In add mode, show available predefined currencies
            return availableCurrencies;
        }
        if (showManageOptions) return userCurrencies;
        const searchLower = search.toLowerCase();
        return PREDEFINED_CURRENCIES.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower) ||
            c.symbol.includes(search)
        );
    }, [showManageOptions, showAddMode, showCustomForm, userCurrencies, availableCurrencies, search]);

    const renderCurrencyItem = useCallback(({ item }: { item: Currency | UserCurrency }) => {
        const isDefault = defaultCurrency?.code === item.code;
        const isUserCurrency = userCurrencies.some(c => c.code === item.code);
        const isInAddMode = showManageOptions && showAddMode && !showCustomForm;

        return (
            <TouchableOpacity
                style={[styles.item, { borderBottomColor: textColor + '20' }]}
                onPress={() => {
                    Haptic.selection();
                    if (isInAddMode) {
                        handleAddPredefined(item);
                    } else {
                        handleSelect(item);
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.currencyInfo}>
                    {item.flag && (
                        <ThemedText style={styles.flag}>{item.flag}</ThemedText>
                    )}
                    <View style={styles.currencyText}>
                        <ThemedText style={styles.currencyCode}>{item.code}</ThemedText>
                        <ThemedText style={[styles.currencyName, { opacity: 0.7 }]}>{item.name}</ThemedText>
                    </View>
                    <ThemedText style={styles.symbol}>{item.symbol}</ThemedText>
                </View>

                {isInAddMode && (
                    <View style={[styles.addBadge, { backgroundColor: primaryColor + '20' }]}>
                        <IconSymbol name="plus" size={16} color={primaryColor} />
                    </View>
                )}

                {showManageOptions && !showAddMode && isUserCurrency && (
                    <View style={styles.actions}>
                        {!isDefault && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: primaryColor + '20' }]}
                                onPress={() => {
                                    Haptic.light();
                                    handleSetDefault(item.code);
                                }}
                            >
                                <IconSymbol name="star" size={16} color={primaryColor} />
                            </TouchableOpacity>
                        )}
                        {isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: primaryColor }]}>
                                <IconSymbol name="star.fill" size={12} color="#fff" />
                            </View>
                        )}
                        {userCurrencies.length > 1 && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: dangerColor + '20' }]}
                                onPress={() => {
                                    Haptic.warning();
                                    handleRemove(item.code);
                                }}
                            >
                                <IconSymbol name="trash" size={16} color={dangerColor} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {!showManageOptions && isUserCurrency && (
                    <IconSymbol name="checkmark" size={20} color={primaryColor} />
                )}
            </TouchableOpacity>
        );
    }, [defaultCurrency, userCurrencies, textColor, primaryColor, dangerColor, showManageOptions, showAddMode, showCustomForm, handleSelect, handleSetDefault, handleRemove, handleAddPredefined]);

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
                            <ThemedText type="subtitle">
                                {showManageOptions ? i18n.t('manageCurrencies') : i18n.t('selectCurrency')}
                            </ThemedText>
                            <TouchableOpacity onPress={handleClose}>
                                <IconSymbol name="xmark.circle.fill" size={24} color={textColor} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Search bar - shown when not in manage mode OR when in add mode */}
                        {(!showManageOptions || showAddMode) && !showCustomForm && (
                            <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
                                <IconSymbol name="magnifyingglass" size={20} color={textColor} style={{ opacity: 0.5 }} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder={i18n.t('searchCurrencies')}
                                    placeholderTextColor={textColor + '80'}
                                    value={search}
                                    onChangeText={setSearch}
                                />
                            </View>
                        )}

                        {/* Add Currency / Back button in manage mode */}
                        {showManageOptions && (
                            <View style={styles.manageActions}>
                                {!showAddMode ? (
                                    <TouchableOpacity
                                        style={[styles.addButton, { backgroundColor: buttonPrimaryColor }]}
                                        onPress={() => setShowAddMode(true)}
                                    >
                                        <IconSymbol name="plus" size={18} color={buttonTextColor} />
                                        <ThemedText style={[styles.addButtonText, { color: buttonTextColor }]}>
                                            {i18n.t('addCurrency')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.addModeHeader}>
                                        <TouchableOpacity
                                            style={[styles.backButton, { backgroundColor: cardColor }]}
                                            onPress={() => {
                                                setShowAddMode(false);
                                                setShowCustomForm(false);
                                                setSearch('');
                                            }}
                                        >
                                            <IconSymbol name="chevron.left" size={18} color={textColor} />
                                            <ThemedText style={styles.backButtonText}>
                                                {i18n.t('cancel')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                        {!showCustomForm && (
                                            <TouchableOpacity
                                                style={[styles.customToggle, { backgroundColor: cardColor }]}
                                                onPress={() => setShowCustomForm(true)}
                                            >
                                                <IconSymbol name="pencil" size={16} color={textColor} />
                                                <ThemedText style={styles.customToggleText}>
                                                    {i18n.t('customCurrency')}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Custom currency form */}
                        {showAddMode && showCustomForm && (
                            <View style={[styles.customForm, { backgroundColor: cardColor }]}>
                                <TextInput
                                    style={[styles.customInput, { color: textColor, borderColor: textColor + '30' }]}
                                    placeholder={i18n.t('currencyCode')}
                                    placeholderTextColor={textColor + '60'}
                                    value={customCode}
                                    onChangeText={setCustomCode}
                                    maxLength={5}
                                    autoCapitalize="characters"
                                />
                                <TextInput
                                    style={[styles.customInput, { color: textColor, borderColor: textColor + '30' }]}
                                    placeholder={i18n.t('currencySymbol')}
                                    placeholderTextColor={textColor + '60'}
                                    value={customSymbol}
                                    onChangeText={setCustomSymbol}
                                    maxLength={5}
                                />
                                <TextInput
                                    style={[styles.customInput, { color: textColor, borderColor: textColor + '30' }]}
                                    placeholder={i18n.t('currencyName')}
                                    placeholderTextColor={textColor + '60'}
                                    value={customName}
                                    onChangeText={setCustomName}
                                />
                                <View style={styles.customFormActions}>
                                    <TouchableOpacity
                                        style={[styles.customFormBtn, { backgroundColor: cardColor, borderColor: textColor + '30', borderWidth: 1 }]}
                                        onPress={() => setShowCustomForm(false)}
                                    >
                                        <ThemedText>{i18n.t('cancel')}</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.customFormBtn, { backgroundColor: buttonPrimaryColor, flex: 1 }]}
                                        onPress={handleAddCustom}
                                    >
                                        <ThemedText style={[styles.saveCustomText, { color: buttonTextColor }]}>{i18n.t('save')}</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Info text when in add mode */}
                        {showAddMode && !showCustomForm && (
                            <ThemedText style={[styles.addModeHint, { opacity: 0.6 }]}>
                                {i18n.t('availableCurrencies')} ({availableCurrencies.length})
                            </ThemedText>
                        )}

                        <FlatList
                            data={dataToShow}
                            keyExtractor={(item) => item.code}
                            renderItem={renderCurrencyItem}
                            style={styles.list}
                            removeClippedSubviews
                            maxToRenderPerBatch={15}
                            initialNumToRender={10}
                            windowSize={5}
                            getItemLayout={(_, index) => ({
                                length: 60,
                                offset: 60 * index,
                                index,
                            })}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={{ opacity: 0.5, textAlign: 'center' }}>
                                        {showAddMode && !showCustomForm
                                            ? i18n.t('noCurrenciesFound')
                                            : showManageOptions
                                                ? i18n.t('noCurrencies')
                                                : i18n.t('noCurrenciesFound')}
                                    </ThemedText>
                                </View>
                            }
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
        height: '75%',
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
        padding: 10,
        borderRadius: 10,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    currencyText: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '600',
    },
    currencyName: {
        fontSize: 13,
    },
    symbol: {
        fontSize: 18,
        fontWeight: '500',
        marginRight: 12,
        opacity: 0.7,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 8,
    },
    defaultBadge: {
        padding: 6,
        borderRadius: 6,
    },
    addBadge: {
        padding: 8,
        borderRadius: 8,
    },
    manageActions: {
        marginBottom: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        fontWeight: '600',
    },
    addModeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 4,
    },
    backButtonText: {
        fontWeight: '500',
    },
    customToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 6,
    },
    customToggleText: {
        fontWeight: '500',
        fontSize: 14,
    },
    addModeHint: {
        fontSize: 13,
        marginBottom: 8,
    },
    customForm: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    customInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    customFormActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    customFormBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveCustomBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 4,
    },
    saveCustomText: {
        fontWeight: '600',
    },
    emptyContainer: {
        paddingVertical: 40,
    },
});
