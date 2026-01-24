import { IconSymbol } from '@/components/ui/icon-symbol';
import { CompanyIcon, DEFAULT_ICON, getCompanyIcon } from '@/constants/companyIcons';
import { ICON_PRESET_COLORS, SF_SYMBOL_CATEGORIES } from '@/constants/sfSymbolsPicker';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { useNativeDriver } from '@/utils/animation';
import { Haptic } from '@/utils/haptics';
import { shadows } from '@/utils/shadow';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface IconPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (icon: string, color: string) => void;
    currentIcon?: string | null;
    currentColor?: string | null;
    subscriptionName?: string; // For auto-detection preview
}

export function IconPickerModal({
    visible,
    onClose,
    onSelect,
    currentIcon,
    currentColor,
    subscriptionName = '',
}: IconPickerModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(SF_SYMBOL_CATEGORIES[0].id);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(currentIcon || null);
    const [selectedColor, setSelectedColor] = useState<string>(currentColor || ICON_PRESET_COLORS[5]);
    const [showCustomColor, setShowCustomColor] = useState(false);
    const [customColorHex, setCustomColorHex] = useState('');

    const insets = useSafeAreaInsets();
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const buttonTextColor = useThemeColor({}, 'buttonText');
    const borderColor = useThemeColor({}, 'border');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    // Get auto-detected icon for the subscription name
    const autoDetectedIcon = useMemo((): CompanyIcon | null => {
        if (!subscriptionName) return null;
        return getCompanyIcon(subscriptionName);
    }, [subscriptionName]);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedIcon(currentIcon || null);
            setSelectedColor(currentColor || autoDetectedIcon?.color || ICON_PRESET_COLORS[5]);
            setSelectedCategory(SF_SYMBOL_CATEGORIES[0].id);
            setShowCustomColor(false);
            setCustomColorHex('');

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
    }, [visible, currentIcon, currentColor, autoDetectedIcon, fadeAnim, slideAnim]);

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

    const handleSelectIcon = useCallback((icon: string) => {
        Haptic.selection();
        setSelectedIcon(icon);
    }, []);

    const handleSelectColor = useCallback((color: string) => {
        Haptic.selection();
        setSelectedColor(color);
        setShowCustomColor(false);
    }, []);

    const handleApplyCustomColor = useCallback(() => {
        const hex = customColorHex.startsWith('#') ? customColorHex : `#${customColorHex}`;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            setSelectedColor(hex.toUpperCase());
            setShowCustomColor(false);
            Haptic.success();
        } else {
            Haptic.error();
        }
    }, [customColorHex]);

    const handleConfirm = useCallback(() => {
        if (selectedIcon && selectedColor) {
            Haptic.success();
            onSelect(selectedIcon, selectedColor);
            handleClose();
        }
    }, [selectedIcon, selectedColor, onSelect, handleClose]);

    const handleUseAutoDetect = useCallback(() => {
        Haptic.selection();
        // Clear custom icon - will revert to auto-detect
        onSelect('', '');
        handleClose();
    }, [onSelect, handleClose]);

    const currentCategory = useMemo(() => {
        return SF_SYMBOL_CATEGORIES.find((cat) => cat.id === selectedCategory);
    }, [selectedCategory]);

    // Preview icon - show selected or auto-detected or default
    const previewIcon = selectedIcon || autoDetectedIcon?.icon || DEFAULT_ICON.icon;
    const previewColor = selectedIcon ? selectedColor : (autoDetectedIcon?.color || DEFAULT_ICON.color);

    const renderCategoryTab = useCallback(
        ({ item }: { item: typeof SF_SYMBOL_CATEGORIES[0] }) => {
            const isSelected = item.id === selectedCategory;
            return (
                <TouchableOpacity
                    style={[
                        styles.categoryTab,
                        {
                            backgroundColor: isSelected ? buttonPrimaryColor : cardColor,
                            borderColor: isSelected ? buttonPrimaryColor : borderColor,
                        },
                    ]}
                    onPress={() => {
                        Haptic.selection();
                        setSelectedCategory(item.id);
                    }}
                    activeOpacity={0.7}
                >
                    <ThemedText
                        style={[
                            styles.categoryTabText,
                            { color: isSelected ? buttonTextColor : textColor },
                        ]}
                    >
                        {i18n.t(item.labelKey)}
                    </ThemedText>
                </TouchableOpacity>
            );
        },
        [selectedCategory, buttonPrimaryColor, buttonTextColor, cardColor, borderColor, textColor]
    );

    const renderIconItem = useCallback(
        ({ item }: { item: string }) => {
            const isSelected = item === selectedIcon;
            return (
                <TouchableOpacity
                    style={[
                        styles.iconItem,
                        {
                            backgroundColor: isSelected ? selectedColor + '20' : cardColor,
                            borderColor: isSelected ? selectedColor : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                        },
                    ]}
                    onPress={() => handleSelectIcon(item)}
                    activeOpacity={0.7}
                >
                    <IconSymbol
                        name={item as any}
                        size={28}
                        color={isSelected ? selectedColor : textColor}
                    />
                </TouchableOpacity>
            );
        },
        [selectedIcon, selectedColor, cardColor, textColor, handleSelectIcon]
    );

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
                </Animated.View>
                <Animated.View
                    style={[styles.modalWrapper, { transform: [{ translateY: slideAnim }] }]}
                >
                    <ThemedView
                        style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <ThemedText type="subtitle">{i18n.t('selectIcon')}</ThemedText>
                            <TouchableOpacity onPress={handleClose}>
                                <IconSymbol
                                    name="xmark.circle.fill"
                                    size={24}
                                    color={textColor}
                                    style={{ opacity: 0.5 }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Preview Section */}
                        <View style={[styles.previewSection, { backgroundColor: cardColor }]}>
                            <View
                                style={[
                                    styles.previewIconContainer,
                                    { backgroundColor: previewColor + '20' },
                                ]}
                            >
                                <IconSymbol
                                    name={previewIcon as any}
                                    size={40}
                                    color={previewColor}
                                />
                            </View>
                            <View style={styles.previewInfo}>
                                <ThemedText style={styles.previewLabel}>
                                    {selectedIcon ? i18n.t('customIcon') : i18n.t('autoDetected')}
                                </ThemedText>
                                {autoDetectedIcon && !selectedIcon && (
                                    <ThemedText style={[styles.previewHint, { color: textColor + '80' }]}>
                                        {subscriptionName}
                                    </ThemedText>
                                )}
                            </View>
                        </View>

                        {/* Use Auto-Detect Button */}
                        {(selectedIcon || currentIcon) && autoDetectedIcon && (
                            <TouchableOpacity
                                style={[styles.autoDetectButton, { borderColor }]}
                                onPress={handleUseAutoDetect}
                            >
                                <IconSymbol name="sparkles" size={16} color={primaryColor} />
                                <ThemedText style={[styles.autoDetectText, { color: primaryColor }]}>
                                    {i18n.t('useAutoDetect')}
                                </ThemedText>
                            </TouchableOpacity>
                        )}

                        {/* Category Tabs */}
                        <FlatList
                            data={SF_SYMBOL_CATEGORIES}
                            keyExtractor={(item) => item.id}
                            renderItem={renderCategoryTab}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryList}
                            contentContainerStyle={styles.categoryListContent}
                        />

                        {/* Icon Grid */}
                        <FlatList
                            data={currentCategory?.icons || []}
                            keyExtractor={(item) => item}
                            renderItem={renderIconItem}
                            numColumns={5}
                            style={styles.iconGrid}
                            contentContainerStyle={styles.iconGridContent}
                            columnWrapperStyle={styles.iconGridRow}
                        />

                        {/* Color Selection */}
                        <View style={styles.colorSection}>
                            <ThemedText style={styles.sectionLabel}>{i18n.t('selectColor')}</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.colorList}
                            >
                                {ICON_PRESET_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorItem,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.colorItemSelected,
                                            color === '#FFFFFF' && { borderWidth: 1, borderColor: borderColor },
                                        ]}
                                        onPress={() => handleSelectColor(color)}
                                    >
                                        {selectedColor === color && (
                                            <IconSymbol
                                                name="checkmark"
                                                size={16}
                                                color={color === '#FFFFFF' || color === '#FFCC00' ? '#000' : '#FFF'}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.colorItem,
                                        styles.customColorButton,
                                        { borderColor },
                                    ]}
                                    onPress={() => setShowCustomColor(true)}
                                >
                                    <IconSymbol name="paintbrush.fill" size={18} color={textColor} />
                                </TouchableOpacity>
                            </ScrollView>

                            {/* Custom Color Input */}
                            {showCustomColor && (
                                <View style={[styles.customColorSection, { backgroundColor: cardColor }]}>
                                    <View style={styles.customColorInput}>
                                        <ThemedText style={styles.hashSymbol}>#</ThemedText>
                                        <TextInput
                                            style={[styles.hexInput, { color: textColor }]}
                                            placeholder="FF5500"
                                            placeholderTextColor={textColor + '50'}
                                            value={customColorHex.replace('#', '')}
                                            onChangeText={(text) => setCustomColorHex(text.replace('#', ''))}
                                            maxLength={6}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.applyColorButton, { backgroundColor: buttonPrimaryColor }]}
                                        onPress={handleApplyCustomColor}
                                    >
                                        <ThemedText style={{ color: buttonTextColor, fontWeight: '600' }}>
                                            {i18n.t('apply')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Confirm Button */}
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                { backgroundColor: buttonPrimaryColor },
                                !selectedIcon && { opacity: 0.5 },
                            ]}
                            onPress={handleConfirm}
                            disabled={!selectedIcon}
                        >
                            <IconSymbol name="checkmark" size={18} color={buttonTextColor} />
                            <ThemedText style={[styles.confirmButtonText, { color: buttonTextColor }]}>
                                {i18n.t('save')}
                            </ThemedText>
                        </TouchableOpacity>
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
        height: '85%',
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
    previewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 16,
    },
    previewIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewInfo: {
        flex: 1,
    },
    previewLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    previewHint: {
        fontSize: 13,
        marginTop: 4,
    },
    autoDetectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
        gap: 6,
    },
    autoDetectText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryList: {
        maxHeight: 44,
        marginBottom: 12,
    },
    categoryListContent: {
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    categoryTabText: {
        fontSize: 13,
        fontWeight: '500',
    },
    iconGrid: {
        flex: 1,
        marginBottom: 12,
    },
    iconGridContent: {
        gap: 8,
    },
    iconGridRow: {
        gap: 8,
        justifyContent: 'flex-start',
    },
    iconItem: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        opacity: 0.7,
    },
    colorList: {
        gap: 10,
    },
    colorItem: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorItemSelected: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    customColorButton: {
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    customColorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 10,
        borderRadius: 10,
        gap: 10,
    },
    customColorInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    hashSymbol: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 4,
    },
    hexInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
    },
    applyColorButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
