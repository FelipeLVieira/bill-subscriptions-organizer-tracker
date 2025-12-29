import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface ExpensesChartProps {
    subscriptions: Subscription[];
}

export function ExpensesChart({ subscriptions }: ExpensesChartProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    if (!subscriptions || subscriptions.length === 0) return null;

    const total = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    // Group by category
    const byCategory = subscriptions.reduce((acc, sub) => {
        const category = sub.categoryGroup || 'Uncategorized';
        acc[category] = (acc[category] || 0) + sub.amount;
        return acc;
    }, {} as Record<string, number>);

    const colors = [
        primaryColor,
        '#FFB300', // Amber
        '#FF5722', // Deep Orange
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#E91E63', // Pink
        '#795548', // Brown
    ];

    const data = Object.keys(byCategory).map((category, index) => ({
        value: byCategory[category],
        text: `${((byCategory[category] / total) * 100).toFixed(0)}%`,
        color: colors[index % colors.length],
        label: category,
    }));

    if (total === 0) return null;

    return (
        <ThemedView style={{ padding: 16, alignItems: 'center', backgroundColor: 'transparent' }}>
            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Spend by Category</ThemedText>
            <PieChart
                data={data}
                donut
                showGradient
                sectionAutoFocus
                radius={70}
                innerRadius={50}
                innerCircleColor={'transparent'}
                centerLabelComponent={() => {
                    return (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <ThemedText style={{ fontSize: 22, color: textColor, fontWeight: 'bold' }}>
                                {total.toFixed(0)}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 10, color: textColor }}>Total</ThemedText>
                        </View>
                    );
                }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                {data.map((d, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                        <ThemedText style={{ fontSize: 12 }}>{d.label} ({d.value.toFixed(2)})</ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
}
