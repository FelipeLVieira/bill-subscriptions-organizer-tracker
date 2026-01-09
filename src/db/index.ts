import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

// expo-sqlite only works on native platforms
const expoDb = Platform.OS !== 'web' ? openDatabaseSync('billtracker.db') : null;
export const db = expoDb ? drizzle(expoDb, { schema }) : (null as any);
