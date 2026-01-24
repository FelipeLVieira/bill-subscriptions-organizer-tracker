import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { HapticTab } from '@/components/haptic-tab';
import { MainHeader } from '@/components/MainHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePro } from '@/contexts/ProContext';
import { useTheme } from '@/contexts/ThemeContext';
import i18n from '@/i18n';
import { Colors } from '@/theme';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { locale } = useLanguage();
  const { shouldShowBannerAd } = usePro();

  // Memoize translations based on locale to ensure they update
  const translations = useMemo(
    () => ({
      dashboard: i18n.t('dashboard'),
      myBills: i18n.t('myBills'),
      history: i18n.t('history'),
      calendar: i18n.t('calendar'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale triggers i18n updates
    [locale]
  );

  // Adjust tab bar style based on whether banner ad is shown
  const tabBarStyle = useMemo(() => ({
    backgroundColor: Colors[colorScheme ?? 'light'].card,
    borderTopColor: Colors[colorScheme ?? 'light'].border,
    height: 75,
    paddingTop: 8,
    // Add extra padding at bottom for ad banner when showing ads
    ...(shouldShowBannerAd ? { marginBottom: 0 } : {}),
  }), [colorScheme, shouldShowBannerAd]);

  return (
    <View style={styles.container}>
      <Tabs
        key={`tabs-${locale}`}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          header: (props) => <MainHeader title={props.options.title || ''} />,
          tabBarButton: HapticTab,
          tabBarStyle,
          tabBarIconStyle: {
            width: 32,
            height: 32,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: translations.dashboard,
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="chart.bar.fill" color={color} weight="semibold" />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: translations.myBills,
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="list.bullet.rectangle.fill" color={color} weight="semibold" />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: translations.history,
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="clock.arrow.circlepath" color={color} weight="semibold" />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: translations.calendar,
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} weight="semibold" />,
          }}
        />
      </Tabs>
      {/* Fixed banner ad at the very bottom */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
