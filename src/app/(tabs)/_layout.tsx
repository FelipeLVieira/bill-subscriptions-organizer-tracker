import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { MainHeader } from '@/components/MainHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import i18n from '@/i18n';
import { Colors } from '@/theme';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { locale } = useLanguage(); // This triggers re-render when locale changes

  // Memoize translations based on locale to ensure they update
  const translations = useMemo(
    () => ({
      dashboard: i18n.t('dashboard'),
      myBills: i18n.t('myBills'),
      history: i18n.t('history'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale triggers i18n updates
    [locale]
  );

  return (
    <Tabs
      key={`tabs-${locale}`} // Force re-mount when locale changes to update tab titles
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        header: (props) => <MainHeader title={props.options.title || ''} />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: translations.dashboard,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: translations.myBills,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: translations.history,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />,
        }}
      />
    </Tabs>
  );
}
