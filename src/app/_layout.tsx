import { CopilotStepNumber, CopilotTooltip } from '@/components/CopilotTooltip';
import { ToastProvider } from '@/components/Toast';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ProProvider } from '@/contexts/ProContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { db } from '@/db';
import { shadows } from '@/utils/shadow';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { CopilotProvider } from 'react-native-copilot';
import 'react-native-reanimated';
import migrations from '../../drizzle/migrations';

// Mock migrations hook for web (SQLite doesn't work on web)
const useMockMigrations = () => ({ success: true, error: null });

export const unstable_settings = {
  anchor: '(tabs)',
};

// Tooltip margin for iOS-style positioning
const TOOLTIP_MARGIN = 16;
const SCREEN_WIDTH = Dimensions.get('window').width;

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const { locale } = useLanguage();
  // Always call hooks unconditionally, then use platform check for the result
  const nativeMigrations = useMigrations(db, migrations);
  const mockMigrations = useMockMigrations();
  const { success, error } = Platform.OS === 'web' ? mockMigrations : nativeMigrations;

  const bgColor = colorScheme === 'dark' ? '#000' : '#fff';
  const textColorValue = colorScheme === 'dark' ? '#fff' : '#000';
  const primaryColor = '#3B82F6';

  // iOS-style tooltip styling with theme support
  const tooltipStyle = useMemo(() => ({
    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    width: SCREEN_WIDTH - TOOLTIP_MARGIN * 2,
    maxWidth: SCREEN_WIDTH - TOOLTIP_MARGIN * 2,
    ...shadows.medium,
  }), [colorScheme]);

  // Labels not needed since we use custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _locale = locale; // Keep locale reference for potential future use

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: textColorValue }]}>
          Migration Error: {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <CopilotProvider
          stopOnOutsideClick
          androidStatusBarVisible
          tooltipStyle={tooltipStyle}
          tooltipComponent={CopilotTooltip}
          stepNumberComponent={CopilotStepNumber}
          arrowColor={colorScheme === 'dark' ? '#2C2C2E' : '#FFFFFF'}
          backdropColor="rgba(0, 0, 0, 0.6)"
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="subscription/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </CopilotProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ProProvider>
            <RootLayoutContent />
          </ProProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
