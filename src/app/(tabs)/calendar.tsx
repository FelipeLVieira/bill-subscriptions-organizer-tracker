import { BillsCalendar } from '@/components/BillsCalendar';
import { GoProButton } from '@/components/GoProButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/contexts/ProContext';
import { getSubscriptions, Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import i18n from '@/i18n';
import { isTablet } from '@/utils/responsive';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function CalendarScreen() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { isPro } = usePro();
  const insets = useSafeAreaInsets();
    const primaryColor = useThemeColor({}, 'primary');

    const loadData = useCallback(async () => {
        const data = await getSubscriptions();
        setSubscriptions(data);
    }, []);

    // Load data on initial mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleDayPress = (date: string, subs: Subscription[]) => {
        // If there's only one subscription on that day, navigate directly to it
        if (subs.length === 1) {
            router.push(`/subscription/${subs[0].id}`);
        }
        // If multiple or none, the calendar component shows the list below
    };

    // Check if we're on a tablet for adaptive layout
    const tablet = isTablet();

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }, tablet && styles.tabletScrollContent]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={primaryColor}
                    />
                }
            >
                <View style={tablet && styles.tabletContent}>
                    {/* Go Pro Banner */}
                    {!isPro && <GoProButton variant="banner" style={styles.proBanner} />}

                    {subscriptions.length > 0 ? (
                        <BillsCalendar
                            subscriptions={subscriptions}
                            onDayPress={handleDayPress}
                        />
                    ) : (
                        <ThemedView style={styles.empty}>
                            <IconSymbol name="calendar" size={60} color={primaryColor} style={{ opacity: 0.6 }} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                {i18n.t('noSubscriptions')}
                            </ThemedText>
                            <ThemedText style={styles.emptyHint}>
                                {i18n.t('addFirstSubscription')}
                            </ThemedText>
                        </ThemedView>
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
        // paddingBottom: dynamic via contentContainerStyle
    },
    proBanner: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 16,
    },
    emptyTitle: {
        marginTop: 16,
        textAlign: 'center',
    },
    emptyHint: {
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.6,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    // iPad-specific styles for better readability
    tabletScrollContent: {
        alignItems: 'center',
    },
    tabletContent: {
        maxWidth: 600,
        width: '100%',
    },
});
