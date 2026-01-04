import type { SQLiteDatabase } from 'expo-sqlite';

import type { Plan } from '../types/plan';
import type { FilterMode } from '../types/filterMode';
import type { SortMode } from '../types/sortMode';
import type { ViewMode } from '../types/viewMode';

type DbLike = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync'>;

const KEY_SORT_MODE = 'sortMode';
const KEY_INFINITE_SCROLL = 'infiniteScrollEnabled';
const KEY_VIEW_MODE = 'viewMode';
const KEY_REDUCE_MOTION = 'reduceMotionEnabled';
const KEY_CLOSE_AS_YOU_TAP = 'closeAsYouTapEnabled';
const KEY_AUTO_SCROLL = 'autoScrollEnabled';
const KEY_PLAN = 'plan';
const KEY_PREMIUM_CODE = 'premiumCode';
const KEY_PREMIUM_BUNDLE_URL = 'premiumBundleUrl';
const KEY_PREMIUM_BUNDLE_VERSION = 'premiumBundleVersion';
const KEY_PREMIUM_BUNDLE_SHA256 = 'premiumBundleSha256';
const KEY_PREMIUM_DOWNLOAD_STATUS = 'premiumDownloadStatus';
const KEY_PREMIUM_DOWNLOAD_PROGRESS = 'premiumDownloadProgress';
const KEY_PREMIUM_DOWNLOAD_ERROR = 'premiumDownloadError';
const KEY_PAGE_SIZE = 'pageSize';
const KEY_FILTER_MODE = 'filterMode';

export type PremiumDownloadStatus = 'not-downloaded' | 'downloading' | 'paused' | 'failed' | 'ready';

async function getValueAsync(db: DbLike, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', key);
  return row?.value ?? null;
}

async function setValueAsync(db: DbLike, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)', key, value);
}

export function maskPremiumCode(code: string | null): string | null {
  if (!code) {
    return null;
  }

  const trimmed = code.trim();
  if (trimmed.length <= 4) {
    return '••••';
  }

  const suffix = trimmed.slice(-4);
  return `••••-${suffix}`;
}

export async function getPlanAsync(db: DbLike): Promise<Plan> {
  const value = await getValueAsync(db, KEY_PLAN);
  if (value === 'free' || value === 'premium') {
    return value;
  }

  return 'free';
}

export async function setPlanAsync(db: DbLike, plan: Plan): Promise<void> {
  await setValueAsync(db, KEY_PLAN, plan);
}

export async function getPremiumCodeAsync(db: DbLike): Promise<string | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_CODE);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export async function setPremiumCodeAsync(db: DbLike, code: string | null): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_CODE, code?.trim() ?? '');
}

export async function getPremiumBundleUrlAsync(db: DbLike): Promise<string | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_BUNDLE_URL);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export async function setPremiumBundleUrlAsync(db: DbLike, url: string | null): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_BUNDLE_URL, url?.trim() ?? '');
}

export async function getPremiumBundleVersionAsync(db: DbLike): Promise<string | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_BUNDLE_VERSION);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export async function setPremiumBundleVersionAsync(db: DbLike, version: string | null): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_BUNDLE_VERSION, version?.trim() ?? '');
}

export async function getPremiumBundleSha256Async(db: DbLike): Promise<string | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_BUNDLE_SHA256);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export async function setPremiumBundleSha256Async(db: DbLike, sha256: string | null): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_BUNDLE_SHA256, sha256?.trim() ?? '');
}

export async function getPremiumDownloadStatusAsync(db: DbLike): Promise<PremiumDownloadStatus> {
  const value = await getValueAsync(db, KEY_PREMIUM_DOWNLOAD_STATUS);
  if (
    value === 'not-downloaded' ||
    value === 'downloading' ||
    value === 'paused' ||
    value === 'failed' ||
    value === 'ready'
  ) {
    return value;
  }

  return 'not-downloaded';
}

export async function setPremiumDownloadStatusAsync(
  db: DbLike,
  status: PremiumDownloadStatus
): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_DOWNLOAD_STATUS, status);
}

export async function getPremiumDownloadProgressAsync(db: DbLike): Promise<number | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_DOWNLOAD_PROGRESS);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const clamped = Math.max(0, Math.min(100, parsed));
  return clamped;
}

export async function setPremiumDownloadProgressAsync(db: DbLike, progress: number | null): Promise<void> {
  if (progress === null) {
    await setValueAsync(db, KEY_PREMIUM_DOWNLOAD_PROGRESS, '');
    return;
  }

  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  await setValueAsync(db, KEY_PREMIUM_DOWNLOAD_PROGRESS, String(clamped));
}

export async function getPremiumDownloadErrorAsync(db: DbLike): Promise<string | null> {
  const value = await getValueAsync(db, KEY_PREMIUM_DOWNLOAD_ERROR);
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

export async function setPremiumDownloadErrorAsync(db: DbLike, message: string | null): Promise<void> {
  await setValueAsync(db, KEY_PREMIUM_DOWNLOAD_ERROR, message?.trim() ?? '');
}

export async function getPageSizeAsync(db: DbLike): Promise<number> {
  const value = await getValueAsync(db, KEY_PAGE_SIZE);
  const trimmed = value?.trim();
  const parsed = trimmed ? Number.parseInt(trimmed, 10) : Number.NaN;
  if (parsed === 25 || parsed === 50) {
    return parsed;
  }

  return 25;
}

export async function setPageSizeAsync(db: DbLike, pageSize: number): Promise<void> {
  const normalized = pageSize === 25 ? 25 : 50;
  await setValueAsync(db, KEY_PAGE_SIZE, String(normalized));
}

export async function getSortModeAsync(db: DbLike): Promise<SortMode> {
  const value = await getValueAsync(db, KEY_SORT_MODE);
  if (value === 'az' || value === 'za' || value === 'random') {
    return value;
  }

  return 'random';
}

export async function setSortModeAsync(db: DbLike, sortMode: SortMode): Promise<void> {
  await setValueAsync(db, KEY_SORT_MODE, sortMode);
}

export async function getInfiniteScrollEnabledAsync(db: DbLike): Promise<boolean> {
  const value = await getValueAsync(db, KEY_INFINITE_SCROLL);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  return false;
}

export async function setInfiniteScrollEnabledAsync(db: DbLike, enabled: boolean): Promise<void> {
  await setValueAsync(db, KEY_INFINITE_SCROLL, enabled ? 'true' : 'false');
}

export async function getReduceMotionEnabledAsync(db: DbLike): Promise<boolean> {
  const value = await getValueAsync(db, KEY_REDUCE_MOTION);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  return false;
}

export async function setReduceMotionEnabledAsync(db: DbLike, enabled: boolean): Promise<void> {
  await setValueAsync(db, KEY_REDUCE_MOTION, enabled ? 'true' : 'false');
}

export async function getViewModeAsync(db: DbLike): Promise<ViewMode> {
  const value = await getValueAsync(db, KEY_VIEW_MODE);
  if (value === 'list' || value === 'list-big') {
    return value;
  }

  return 'list';
}

export async function setViewModeAsync(db: DbLike, viewMode: ViewMode): Promise<void> {
  await setValueAsync(db, KEY_VIEW_MODE, viewMode);
}

export async function getFilterModeAsync(db: DbLike): Promise<FilterMode> {
  const value = await getValueAsync(db, KEY_FILTER_MODE);
  if (value === 'all' || value === 'favorites') {
    return value;
  }

  return 'all';
}

export async function setFilterModeAsync(db: DbLike, mode: FilterMode): Promise<void> {
  await setValueAsync(db, KEY_FILTER_MODE, mode);
}

export async function getCloseAsYouTapEnabledAsync(db: DbLike): Promise<boolean> {
  const value = await getValueAsync(db, KEY_CLOSE_AS_YOU_TAP);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  return true;
}

export async function setCloseAsYouTapEnabledAsync(db: DbLike, enabled: boolean): Promise<void> {
  await setValueAsync(db, KEY_CLOSE_AS_YOU_TAP, enabled ? 'true' : 'false');
}

export async function getAutoScrollEnabledAsync(db: DbLike): Promise<boolean> {
  const value = await getValueAsync(db, KEY_AUTO_SCROLL);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  return true;
}

export async function setAutoScrollEnabledAsync(db: DbLike, enabled: boolean): Promise<void> {
  await setValueAsync(db, KEY_AUTO_SCROLL, enabled ? 'true' : 'false');
}
