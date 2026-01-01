import { ToastProvider } from '@/components/Toast';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { db } from '@/db';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CopilotProvider } from 'react-native-copilot';
import 'react-native-reanimated';
import migrations from '../../drizzle/migrations';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const { success, error } = useMigrations(db, migrations);

  const bgColor = colorScheme === 'dark' ? '#000' : '#fff';
  const textColorValue = colorScheme === 'dark' ? '#fff' : '#000';
  const primaryColor = '#3B82F6';

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
        <CopilotProvider stopOnOutsideClick androidStatusBarVisible>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
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
          <RootLayoutContent />
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
