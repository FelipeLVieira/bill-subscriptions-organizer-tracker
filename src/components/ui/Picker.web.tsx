// Web-specific Picker implementation with proper dark mode support
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface PickerItemProps {
  label: string;
  value: string;
  color?: string;
}

interface PickerProps {
  selectedValue: string;
  onValueChange: (value: string, index: number) => void;
  style?: object;
  dropdownIconColor?: string;
  itemStyle?: object;
  children?: React.ReactNode;
}

// Picker.Item component
function PickerItem({ label, value, color }: PickerItemProps) {
  return null; // Items are rendered by parent
}

// Main Picker component
function PickerComponent({
  selectedValue,
  onValueChange,
  style,
  children,
}: PickerProps) {
  // Use picker-specific theme colors for better contrast
  const textColor = useThemeColor({}, 'pickerText');
  const backgroundColor = useThemeColor({}, 'pickerBg');
  const borderColor = useThemeColor({}, 'border');

  // Extract items from children
  const items: { label: string; value: string; color?: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props) {
      items.push({
        label: child.props.label || '',
        value: child.props.value || '',
        color: child.props.color,
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const index = items.findIndex((item) => item.value === newValue);
    onValueChange(newValue, index);
  };

  return (
    <View style={styles.container}>
      <select
        value={selectedValue}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 16,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: textColor as string,
          backgroundColor: backgroundColor as string,
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(textColor as string)}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 36,
        }}
      >
        {items.map((item) => (
          <option
            key={item.value}
            value={item.value}
            style={{
              color: textColor as string,
              backgroundColor: backgroundColor as string,
            }}
          >
            {item.label}
          </option>
        ))}
      </select>
    </View>
  );
}

// Attach Item as a static property
export const Picker = Object.assign(PickerComponent, {
  Item: PickerItem,
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
