/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof Omit<typeof Colors.light & typeof Colors.dark, 'gradients'>
) {
  const { colorScheme } = useTheme();
  const theme = colorScheme ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
