import { StyleSheet, Text, View } from 'react-native';

/**
 * Web-specific layout
 * Shows a message that the app is mobile-only since it relies on SQLite
 */
export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📱</Text>
      <Text style={styles.title}>Bills Tracker</Text>
      <Text style={styles.message}>
        This app is designed for iOS and Android devices.
      </Text>
      <Text style={styles.hint}>
        Please download the app on your mobile device to get started.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  message: {
    fontSize: 17,
    color: '#86868B',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    color: '#86868B',
    textAlign: 'center',
  },
});
