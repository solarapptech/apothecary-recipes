import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabaseAsync } from '../db/database';
import { seedDatabaseIfNeededAsync } from '../db/seed';
import {
  getAutoScrollEnabledAsync,
  getCloseAsYouTapEnabledAsync,
  getFilterModeAsync,
  getInfiniteScrollEnabledAsync,
  getPageSizeAsync,
  getPlanAsync,
  getPremiumBundleSha256Async,
  getPremiumBundleUrlAsync,
  getPremiumBundleVersionAsync,
  getPremiumCodeAsync,
  getPremiumDownloadErrorAsync,
  getPremiumDownloadProgressAsync,
  getPremiumDownloadStatusAsync,
  getReduceMotionEnabledAsync,
  getSortModeAsync,
  getViewModeAsync,
} from '../repositories/preferencesRepository';
import type { Plan } from '../types/plan';
import type { FilterMode } from '../types/filterMode';
import type { SortMode } from '../types/sortMode';
import type { ViewMode } from '../types/viewMode';
import type { PremiumDownloadStatus } from '../repositories/preferencesRepository';

export type LibraryBootstrap = {
  db: SQLiteDatabase;
  didSeed: boolean;
  seededRecipeCount: number;
  launchSeed: number;
  preferences: {
    plan: Plan;
    premiumCode: string | null;
    premiumBundleUrl: string | null;
    premiumBundleVersion: string | null;
    premiumBundleSha256: string | null;
    premiumDownloadStatus: PremiumDownloadStatus;
    premiumDownloadProgress: number | null;
    premiumDownloadError: string | null;
    sortMode: SortMode;
    filterMode: FilterMode;
    infiniteScrollEnabled: boolean;
    pageSize: number;
    viewMode: ViewMode;
    reduceMotionEnabled: boolean;
    closeAsYouTapEnabled: boolean;
    autoScrollEnabled: boolean;
  };
};

export function createLaunchSeed(): number {
  const max = 0x7fffffff;
  return Math.floor(Math.random() * max);
}

export type InitializeLibraryDeps = {
  getDbAsync: () => Promise<SQLiteDatabase>;
  seedAsync: (db: SQLiteDatabase) => Promise<{ didSeed: boolean; recipeCount: number }>;
  getPlanAsync: (db: SQLiteDatabase) => Promise<Plan>;
  getPremiumCodeAsync: (db: SQLiteDatabase) => Promise<string | null>;
  getPremiumBundleUrlAsync: (db: SQLiteDatabase) => Promise<string | null>;
  getPremiumBundleVersionAsync: (db: SQLiteDatabase) => Promise<string | null>;
  getPremiumBundleSha256Async: (db: SQLiteDatabase) => Promise<string | null>;
  getPremiumDownloadStatusAsync: (db: SQLiteDatabase) => Promise<PremiumDownloadStatus>;
  getPremiumDownloadProgressAsync: (db: SQLiteDatabase) => Promise<number | null>;
  getPremiumDownloadErrorAsync: (db: SQLiteDatabase) => Promise<string | null>;
  getSortModeAsync: (db: SQLiteDatabase) => Promise<SortMode>;
  getFilterModeAsync: (db: SQLiteDatabase) => Promise<FilterMode>;
  getInfiniteScrollEnabledAsync: (db: SQLiteDatabase) => Promise<boolean>;
  getPageSizeAsync: (db: SQLiteDatabase) => Promise<number>;
  getViewModeAsync: (db: SQLiteDatabase) => Promise<ViewMode>;
  getReduceMotionEnabledAsync: (db: SQLiteDatabase) => Promise<boolean>;
  getCloseAsYouTapEnabledAsync: (db: SQLiteDatabase) => Promise<boolean>;
  getAutoScrollEnabledAsync: (db: SQLiteDatabase) => Promise<boolean>;
  createLaunchSeed: () => number;
};

const defaultDeps: InitializeLibraryDeps = {
  getDbAsync: getDatabaseAsync,
  seedAsync: seedDatabaseIfNeededAsync,
  getPlanAsync,
  getPremiumCodeAsync,
  getPremiumBundleUrlAsync,
  getPremiumBundleVersionAsync,
  getPremiumBundleSha256Async,
  getPremiumDownloadStatusAsync,
  getPremiumDownloadProgressAsync,
  getPremiumDownloadErrorAsync,
  getSortModeAsync,
  getFilterModeAsync,
  getInfiniteScrollEnabledAsync,
  getPageSizeAsync,
  getViewModeAsync,
  getReduceMotionEnabledAsync,
  getCloseAsYouTapEnabledAsync,
  getAutoScrollEnabledAsync,
  createLaunchSeed,
};

export async function initializeLibraryAsync(
  deps: Partial<InitializeLibraryDeps> = {}
): Promise<LibraryBootstrap> {
  const resolved: InitializeLibraryDeps = {
    ...defaultDeps,
    ...deps,
  };

  const db = await resolved.getDbAsync();

  const seedResult = await resolved.seedAsync(db);

  const [
    plan,
    premiumCode,
    premiumBundleUrl,
    premiumBundleVersion,
    premiumBundleSha256,
    premiumDownloadStatus,
    premiumDownloadProgress,
    premiumDownloadError,
    sortMode,
    filterMode,
    infiniteScrollEnabled,
    pageSize,
    viewMode,
    reduceMotionEnabled,
    closeAsYouTapEnabled,
    autoScrollEnabled,
  ] =
    await Promise.all([
    resolved.getPlanAsync(db),
    resolved.getPremiumCodeAsync(db),
    resolved.getPremiumBundleUrlAsync(db),
    resolved.getPremiumBundleVersionAsync(db),
    resolved.getPremiumBundleSha256Async(db),
    resolved.getPremiumDownloadStatusAsync(db),
    resolved.getPremiumDownloadProgressAsync(db),
    resolved.getPremiumDownloadErrorAsync(db),
    resolved.getSortModeAsync(db),
    resolved.getFilterModeAsync(db),
    resolved.getInfiniteScrollEnabledAsync(db),
    resolved.getPageSizeAsync(db),
    resolved.getViewModeAsync(db),
    resolved.getReduceMotionEnabledAsync(db),
    resolved.getCloseAsYouTapEnabledAsync(db),
    resolved.getAutoScrollEnabledAsync(db),
  ]);

  const launchSeedValue = resolved.createLaunchSeed();

  return {
    db,
    didSeed: seedResult.didSeed,
    seededRecipeCount: seedResult.recipeCount,
    launchSeed: launchSeedValue,
    preferences: {
      plan,
      premiumCode,
      premiumBundleUrl,
      premiumBundleVersion,
      premiumBundleSha256,
      premiumDownloadStatus,
      premiumDownloadProgress,
      premiumDownloadError,
      sortMode,
      filterMode,
      infiniteScrollEnabled,
      pageSize,
      viewMode,
      reduceMotionEnabled,
      closeAsYouTapEnabled,
      autoScrollEnabled,
    },
  };
}
