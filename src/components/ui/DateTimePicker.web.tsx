// Web fallback for DateTimePicker using HTML inputs
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  onChange?: (event: any, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  style?: any;
  themeVariant?: 'light' | 'dark';
  accentColor?: string;
}

function DateTimePicker({
  value,
  mode = 'date',
  onChange,
  minimumDate,
  maximumDate,
  style,
  themeVariant,
  accentColor,
}: DateTimePickerProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!newValue) return;

    const newDate = new Date(value);

    if (mode === 'date' || mode === 'datetime') {
      const [year, month, day] = newValue.split('-').map(Number);
      newDate.setFullYear(year);
      newDate.setMonth(month - 1);
      newDate.setDate(day);
    }

    onChange?.({ type: 'set', nativeEvent: { timestamp: newDate.getTime() } }, newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!newValue) return;

    const newDate = new Date(value);
    const [hours, minutes] = newValue.split(':').map(Number);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    onChange?.({ type: 'set', nativeEvent: { timestamp: newDate.getTime() } }, newDate);
  };

  const inputStyle = {
    backgroundColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 16,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    outline: 'none',
    cursor: 'pointer',
    minWidth: 140,
    accentColor: accentColor || primaryColor,
  };

  return (
    <View style={[styles.container, style]}>
      {(mode === 'date' || mode === 'datetime') && (
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          min={minimumDate ? formatDateForInput(minimumDate) : undefined}
          max={maximumDate ? formatDateForInput(maximumDate) : undefined}
          style={inputStyle as React.CSSProperties}
        />
      )}
      {(mode === 'time' || mode === 'datetime') && (
        <input
          type="time"
          value={formatTimeForInput(value)}
          onChange={handleTimeChange}
          style={inputStyle as React.CSSProperties}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default DateTimePicker;
