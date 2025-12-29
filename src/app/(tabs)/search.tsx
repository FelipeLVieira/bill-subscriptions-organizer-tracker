import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Subscription, getSubscriptions } from '@/db/actions';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const data = await getSubscriptions();
        setSubscriptions(data);
    };

    const filteredData = useMemo(() => {
        if (!query) return subscriptions;
        const lower = query.toLowerCase();
        return subscriptions.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.notes?.toLowerCase().includes(lower) ||
            s.amount.toString().includes(lower)
        );
    }, [query, subscriptions]);

    const renderItem = ({ item }: { item: Subscription }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <ThemedText type="defaultSemiBold">{item.currency} {item.amount.toFixed(2)}</ThemedText>
            </View>
            <ThemedText style={styles.interval}>{item.billingInterval} • Next: {new Date(item.nextBillingDate).toLocaleDateString()}</ThemedText>
        </Card>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <Input
                    placeholder="Search subscriptions..."
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                />
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText>{query ? 'No matches found' : 'Type to search'}</ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingBottom: 0,
    },
    input: {
        marginBottom: 0,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {},
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    interval: {
        fontSize: 14,
        opacity: 0.7,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
});
