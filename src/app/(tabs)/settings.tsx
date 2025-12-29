import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import i18n from '@/i18n';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
    return (
        <ThemedView style={styles.container}>
            <View style={styles.section}>
                <ThemedText type="subtitle">{i18n.t('language')}</ThemedText>
                <ThemedText>{i18n.locale}</ThemedText>
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle">{i18n.t('about')}</ThemedText>
                <ThemedText>{i18n.t('version')} {Constants.expoConfig?.version ?? '1.0.0'}</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 8,
    },
});
