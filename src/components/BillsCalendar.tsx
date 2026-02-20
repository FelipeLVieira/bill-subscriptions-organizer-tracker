import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Subscription } from '@/db/actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import i18n from '@/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface BillsCalendarProps {
    subscriptions: Subscription[];
    onDayPress?: (date: string, subscriptions: Subscription[]) => void;
}

interface DaySubscriptions {
    [date: string]: Subscription[];
}

// Get a date's local YYYY-MM-DD string (avoids timezone drift from toISOString)
function toLocalDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get today's date string in YYYY-MM-DD format (local timezone)
const getTodayString = () => {
    return toLocalDateString(new Date());
};

export function BillsCalendar({ subscriptions, onDayPress }: BillsCalendarProps) {
    const { colorScheme } = useTheme();
    const { locale } = useLanguage();
    const { formatAmount } = useCurrency();
    // Auto-select today's date by default
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

    // Theme colors
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');

    // Group subscriptions by their next billing date
    const subscriptionsByDate = useMemo(() => {
        const grouped: DaySubscriptions = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        subscriptions.forEach(sub => {
            const date = new Date(sub.nextBillingDate);
            const dateStr = toLocalDateString(date);

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
            {/* Legend - enhanced with pill style */}
            <View style={styles.legend}>
                <View style={[styles.legendItem, { backgroundColor: dangerColor + '15' }]}>
                    <View style={[styles.legendDot, { backgroundColor: dangerColor }]} />
                    <ThemedText style={[styles.legendText, { color: dangerColor }]}>{i18n.t('overdue')}</ThemedText>
                </View>
                <View style={[styles.legendItem, { backgroundColor: warningColor + '15' }]}>
                    <View style={[styles.legendDot, { backgroundColor: warningColor }]} />
                    <ThemedText style={[styles.legendText, { color: warningColor }]}>{i18n.t('billDue')}</ThemedText>
                </View>
                <View style={[styles.legendItem, { backgroundColor: buttonPrimaryColor + '15' }]}>
                    <View style={[styles.legendDot, { backgroundColor: buttonPrimaryColor }]} />
                    <ThemedText style={[styles.legendText, { color: buttonPrimaryColor }]}>{i18n.t('upcomingWeek')}</ThemedText>
                </View>
                <View style={[styles.legendItem, { backgroundColor: successColor + '15' }]}>
                    <View style={[styles.legendDot, { backgroundColor: successColor }]} />
                    <ThemedText style={[styles.legendText, { color: successColor }]}>{i18n.t('later')}</ThemedText>
                </View>
            </View>

            {/* Calendar */}
            <Card style={styles.calendarCard}>
                <Calendar
                    key={`calendar-${colorScheme}-${textColor}`}
                    markedDates={markedDates}
                    onDayPress={handleDayPress}
                    enableSwipeMonths={true}
                    firstDay={0} // Sunday
                    theme={{
                        // Background colors - explicit for dark mode
                        backgroundColor: cardColor,
                        calendarBackground: cardColor,
                        reservationsBackgroundColor: cardColor,

                        // Text colors - explicit for dark mode
                        textSectionTitleColor: textSecondaryColor,
                        textSectionTitleDisabledColor: textSecondaryColor + '40',
                        dayTextColor: textColor,
                        monthTextColor: textColor,
                        textDisabledColor: colorScheme === 'dark' ? '#48484A' : textSecondaryColor + '60',

                        // Selected day
                        selectedDayBackgroundColor: buttonPrimaryColor,
                        selectedDayTextColor: '#FFFFFF',

                        // Today
                        todayTextColor: buttonPrimaryColor,
                        todayBackgroundColor: buttonPrimaryColor + '15',

                        // Dots and arrows
                        dotColor: buttonPrimaryColor,
                        selectedDotColor: '#FFFFFF',
                        arrowColor: buttonPrimaryColor,
                        indicatorColor: buttonPrimaryColor,

                        // Agenda-specific (if used)
                        agendaDayTextColor: textColor,
                        agendaDayNumColor: textColor,
                        agendaTodayColor: buttonPrimaryColor,
                        agendaKnobColor: textSecondaryColor,

                        // Typography
                        textDayFontWeight: '500',
                        textMonthFontWeight: '600',
                        textDayHeaderFontWeight: '600',
                        textDayFontSize: 15,
                        textMonthFontSize: 17,
                        textDayHeaderFontSize: 13,

                        // Week day names (Mon, Tue, etc.)
                        weekVerticalMargin: 4,
                    }}
                />
            </Card>

            {/* Selected date info */}
            <View style={styles.selectedDateSection}>
                <ThemedText type="subtitle" style={styles.selectedDateTitle}>
                    {formatSelectedDate(selectedDate)}
                </ThemedText>

                {selectedDateSubscriptions.length > 0 ? (
                    <View style={styles.selectedDateBills}>
                        {selectedDateSubscriptions.map((sub) => {
                            const statusColor = getStatusColor(sub);
                            return (
                                <Card key={sub.id} style={styles.billCard}>
                                    {/* Subtle gradient overlay based on status */}
                                    <LinearGradient
                                        colors={[statusColor + '08', 'transparent']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.billGradient}
                                    />
                                    <View style={styles.billCardContent}>
                                        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                                        <View style={styles.billInfo}>
                                            <ThemedText type="defaultSemiBold" style={styles.billName}>{sub.name}</ThemedText>
                                            <ThemedText style={styles.billCategory}>
                                                {sub.categoryGroup || i18n.t('cat_uncategorized')}
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="defaultSemiBold" style={[styles.billAmount, { color: statusColor }]}>
                                            {formatAmount(sub.amount, sub.currency)}
                                        </ThemedText>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                ) : (
                    <Card style={styles.noBillsCard}>
                        <View style={styles.noBillsContainer}>
                            <IconSymbol name="checkmark.circle" size={40} color={successColor} />
                            <ThemedText type="defaultSemiBold" style={styles.noBillsTitle}>
                                {i18n.t('noBillsDue') || 'No Bills Due'}
                            </ThemedText>
                            <ThemedText style={styles.noBillsText}>
                                {i18n.t('noBillsOnDate') || 'No bills scheduled for this date'}
                            </ThemedText>
                        </View>
                    </Card>
                )}
            </View>
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
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '600',
    },
    calendarCard: {
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    selectedDateSection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    selectedDateTitle: {
        marginBottom: 12,
        fontSize: 17,
        fontWeight: '600',
    },
    selectedDateBills: {
        gap: 12,
    },
    billCard: {
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    billGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    billCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 4,
        height: 36,
        borderRadius: 2,
        marginRight: 12,
    },
    billInfo: {
        flex: 1,
    },
    billName: {
        fontSize: 15,
    },
    billCategory: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    billAmount: {
        fontSize: 17,
        fontWeight: '700',
    },
    noBillsCard: {
        marginTop: 8,
    },
    noBillsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
        gap: 8,
    },
    noBillsTitle: {
        marginTop: 12,
        fontSize: 17,
    },
    noBillsText: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 20,
    },
});
