import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_NAME } from './schema';

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function getDatabaseAsync(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME);
  }

  return dbPromise;
}
