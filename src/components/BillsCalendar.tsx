import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import i18n from '@/i18n';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface BillsCalendarProps {
    subscriptions: Subscription[];
    onDayPress?: (date: string, subscriptions: Subscription[]) => void;
}

interface DaySubscriptions {
    [date: string]: Subscription[];
}

export function BillsCalendar({ subscriptions, onDayPress }: BillsCalendarProps) {
    const { colorScheme } = useTheme();
    const { locale } = useLanguage();
    const { formatAmount } = useCurrency();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');
    const borderColor = useThemeColor({}, 'border');

    // Group subscriptions by their next billing date
    const subscriptionsByDate = useMemo(() => {
        const grouped: DaySubscriptions = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        subscriptions.forEach(sub => {
            const date = new Date(sub.nextBillingDate);
            const dateStr = date.toISOString().split('T')[0];

            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(sub);
        });

        return grouped;
    }, [subscriptions]);

    // Create marked dates for the calendar
    const markedDates = useMemo(() => {
        const marks: { [key: string]: any } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.entries(subscriptionsByDate).forEach(([dateStr, subs]) => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);

            // Determine dot color based on status
            const isOverdue = date < today;
            const isToday = date.getTime() === today.getTime();
            const isUpcoming = date > today && date <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            let dotColor = successColor; // Default: future bills (green)
            if (isOverdue) {
                dotColor = dangerColor; // Overdue (red)
            } else if (isToday) {
                dotColor = warningColor; // Due today (orange/yellow)
            } else if (isUpcoming) {
                dotColor = buttonPrimaryColor; // Upcoming within 7 days (blue)
            }

            marks[dateStr] = {
                marked: true,
                dotColor,
                // If this is the selected date, add selected styling
                ...(selectedDate === dateStr && {
                    selected: true,
                    selectedColor: buttonPrimaryColor + '30', // Light blue background
                    selectedTextColor: textColor,
                }),
            };
        });

        // Add selected date styling even if no subscription
        if (selectedDate && !marks[selectedDate]) {
            marks[selectedDate] = {
                selected: true,
                selectedColor: buttonPrimaryColor + '30',
                selectedTextColor: textColor,
            };
        }

        return marks;
    }, [subscriptionsByDate, selectedDate, dangerColor, successColor, warningColor, buttonPrimaryColor, textColor]);

    // Get subscriptions for selected date
    const selectedDateSubscriptions = useMemo(() => {
        if (!selectedDate) return [];
        return subscriptionsByDate[selectedDate] || [];
    }, [selectedDate, subscriptionsByDate]);

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        const subs = subscriptionsByDate[day.dateString] || [];
        onDayPress?.(day.dateString, subs);
    };

    const formatSelectedDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (sub: Subscription) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(sub.nextBillingDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) return dangerColor;
        if (dueDate.getTime() === today.getTime()) return warningColor;
        return successColor;
    };

    return (
        <View style={styles.container}>
            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: dangerColor }]} />
                    <ThemedText style={styles.legendText}>{i18n.t('overdue')}</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: warningColor }]} />
                    <ThemedText style={styles.legendText}>{i18n.t('billDue')}</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: buttonPrimaryColor }]} />
                    <ThemedText style={styles.legendText}>{i18n.t('upcomingWeek')}</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: successColor }]} />
                    <ThemedText style={styles.legendText}>{i18n.t('later')}</ThemedText>
                </View>
            </View>

            {/* Calendar */}
            <Card style={styles.calendarCard}>
                <Calendar
                    markedDates={markedDates}
                    onDayPress={handleDayPress}
                    enableSwipeMonths={true}
                    firstDay={0} // Sunday
                    theme={{
                        backgroundColor: cardColor,
                        calendarBackground: cardColor,
                        textSectionTitleColor: textSecondaryColor,
                        selectedDayBackgroundColor: buttonPrimaryColor,
                        selectedDayTextColor: '#FFFFFF',
                        todayTextColor: buttonPrimaryColor,
                        todayBackgroundColor: buttonPrimaryColor + '15',
                        dayTextColor: textColor,
                        textDisabledColor: textSecondaryColor + '60',
                        dotColor: buttonPrimaryColor,
                        selectedDotColor: '#FFFFFF',
                        arrowColor: buttonPrimaryColor,
                        monthTextColor: textColor,
                        indicatorColor: buttonPrimaryColor,
                        textDayFontWeight: '500',
                        textMonthFontWeight: '600',
                        textDayHeaderFontWeight: '600',
                        textDayFontSize: 15,
                        textMonthFontSize: 17,
                        textDayHeaderFontSize: 13,
                    }}
                />
            </Card>

            {/* Selected date info */}
            {selectedDate && (
                <View style={styles.selectedDateSection}>
                    <ThemedText type="subtitle" style={styles.selectedDateTitle}>
                        {formatSelectedDate(selectedDate)}
                    </ThemedText>

                    {selectedDateSubscriptions.length > 0 ? (
                        <View style={styles.selectedDateBills}>
                            {selectedDateSubscriptions.map((sub) => (
                                <Card key={sub.id} style={styles.billCard}>
                                    <View style={styles.billCardContent}>
                                        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(sub) }]} />
                                        <View style={styles.billInfo}>
                                            <ThemedText type="defaultSemiBold">{sub.name}</ThemedText>
                                            <ThemedText style={styles.billCategory}>
                                                {sub.categoryGroup || i18n.t('cat_uncategorized')}
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="defaultSemiBold" style={styles.billAmount}>
                                            {formatAmount(sub.amount, sub.currency)}
                                        </ThemedText>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noBillsContainer}>
                            <IconSymbol name="checkmark.circle" size={32} color={successColor} />
                            <ThemedText style={styles.noBillsText}>
                                {i18n.t('noBillsInCategory') || 'No bills due on this date'}
                            </ThemedText>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        opacity: 0.7,
    },
    calendarCard: {
        marginHorizontal: 16,
        padding: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    selectedDateSection: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    selectedDateTitle: {
        marginBottom: 12,
    },
    selectedDateBills: {
        gap: 8,
    },
    billCard: {
        padding: 12,
    },
    billCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: 12,
    },
    billInfo: {
        flex: 1,
    },
    billCategory: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
    },
    billAmount: {
        fontSize: 16,
    },
    noBillsContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    noBillsText: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
});
