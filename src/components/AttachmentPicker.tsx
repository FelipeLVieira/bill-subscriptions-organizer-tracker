import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { Haptic } from '@/utils/haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Attachment {
    uri: string;
    type: 'image' | 'pdf';
    name: string;
}

interface AttachmentPickerProps {
    attachments: Attachment[];
    onAttachmentsChange: (attachments: Attachment[]) => void;
    maxAttachments?: number;
}

export function AttachmentPicker({
    attachments,
    onAttachmentsChange,
    maxAttachments = 5,
}: AttachmentPickerProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const [isLoading, setIsLoading] = useState(false);

    const showActionSheet = () => {
        if (attachments.length >= maxAttachments) {
            Alert.alert(i18n.t('error'), i18n.t('maxAttachmentsReached'));
            return;
        }

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [i18n.t('cancel'), i18n.t('takePhoto'), i18n.t('chooseFromLibrary'), i18n.t('choosePDF')],
                    cancelButtonIndex: 0,
                },
                handleActionSheetPress
            );
        } else {
            Alert.alert(
                i18n.t('addAttachment'),
                i18n.t('chooseAttachmentSource'),
                [
                    { text: i18n.t('takePhoto'), onPress: () => handleActionSheetPress(1) },
                    { text: i18n.t('chooseFromLibrary'), onPress: () => handleActionSheetPress(2) },
                    { text: i18n.t('choosePDF'), onPress: () => handleActionSheetPress(3) },
                    { text: i18n.t('cancel'), style: 'cancel' },
                ]
            );
        }
    };

    const handleActionSheetPress = async (buttonIndex: number) => {
        setIsLoading(true);
        try {
            switch (buttonIndex) {
                case 1: // Take Photo
                    await takePhoto();
                    break;
                case 2: // Choose from Library
                    await pickImage();
                    break;
                case 3: // Choose PDF
                    await pickDocument();
                    break;
            }
        } catch (error) {
            console.error('Error picking attachment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(i18n.t('error'), i18n.t('cameraPermissionRequired'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
            await saveAttachment(asset.uri, 'image', fileName);
        }
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(i18n.t('error'), i18n.t('libraryPermissionRequired'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsMultipleSelection: false,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const fileName = asset.fileName || `image_${Date.now()}.jpg`;
            await saveAttachment(asset.uri, 'image', fileName);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await saveAttachment(asset.uri, 'pdf', asset.name);
            }
        } catch (error) {
            console.error('Error picking document:', error);
        }
    };

    const saveAttachment = async (uri: string, type: 'image' | 'pdf', name: string) => {
        // Copy file to app's document directory for persistence
        const fileName = `attachment_${Date.now()}_${name}`;
        const destUri = `${FileSystem.documentDirectory}${fileName}`;

        try {
            await FileSystem.copyAsync({
                from: uri,
                to: destUri,
            });
            await Haptic.light();

            const newAttachment: Attachment = {
                uri: destUri,
                type,
                name,
            };

            onAttachmentsChange([...attachments, newAttachment]);
        } catch (error) {
            console.error('Error saving attachment:', error);
            Alert.alert(i18n.t('error'), i18n.t('attachmentSaveError'));
        }
    };

    const removeAttachment = async (index: number) => {
        await Haptic.medium();
        const attachment = attachments[index];

        Alert.alert(
            i18n.t('removeAttachment'),
            i18n.t('removeAttachmentConfirm'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(attachment.uri, { idempotent: true });
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                        const newAttachments = [...attachments];
                        newAttachments.splice(index, 1);
                        onAttachmentsChange(newAttachments);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.label}>{i18n.t('attachments')}</ThemedText>
                <ThemedText style={[styles.count, { color: textColor }]}>
                    {attachments.length}/{maxAttachments}
                </ThemedText>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {attachments.map((attachment, index) => (
                    <View key={index} style={[styles.attachmentItem, { borderColor }]}>
                        {attachment.type === 'image' ? (
                            <Image source={{ uri: attachment.uri }} style={styles.thumbnail} />
                        ) : (
                            <View style={[styles.pdfThumbnail, { backgroundColor: cardColor }]}>
                                <IconSymbol name="doc.fill" size={24} color={primaryColor} />
                                <ThemedText style={styles.pdfName} numberOfLines={1}>
                                    {attachment.name}
                                </ThemedText>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.removeBtn, { backgroundColor: dangerColor }]}
                            onPress={() => removeAttachment(index)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <IconSymbol name="xmark" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                ))}

                {attachments.length < maxAttachments && (
                    <TouchableOpacity
                        style={[styles.addButton, { borderColor, backgroundColor: cardColor }]}
                        onPress={showActionSheet}
                        disabled={isLoading}
                        accessibilityLabel={i18n.t('addAttachment')}
                    >
                        <IconSymbol
                            name={isLoading ? 'hourglass' : 'plus.circle.fill'}
                            size={28}
                            color={primaryColor}
                        />
                        <ThemedText style={[styles.addText, { color: primaryColor }]}>
                            {i18n.t('addAttachment')}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    count: {
        fontSize: 13,
        opacity: 0.6,
    },
    scrollContent: {
        gap: 12,
        paddingRight: 16,
    },
    attachmentItem: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    pdfThumbnail: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    pdfName: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },
    removeBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    addText: {
        fontSize: 11,
        textAlign: 'center',
    },
});
