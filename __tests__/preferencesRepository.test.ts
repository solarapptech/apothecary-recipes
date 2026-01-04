import {
  getAutoScrollEnabledAsync,
  getCloseAsYouTapEnabledAsync,
  getFilterModeAsync,
  getInfiniteScrollEnabledAsync,
  getPageSizeAsync,
  getPlanAsync,
  getReduceMotionEnabledAsync,
  getPremiumBundleSha256Async,
  getPremiumBundleUrlAsync,
  getPremiumBundleVersionAsync,
  getPremiumCodeAsync,
  getPremiumDownloadErrorAsync,
  getPremiumDownloadProgressAsync,
  getPremiumDownloadStatusAsync,
  getSortModeAsync,
  getViewModeAsync,
  maskPremiumCode,
  setAutoScrollEnabledAsync,
  setCloseAsYouTapEnabledAsync,
  setFilterModeAsync,
  setInfiniteScrollEnabledAsync,
  setPageSizeAsync,
  setPlanAsync,
  setReduceMotionEnabledAsync,
  setPremiumBundleSha256Async,
  setPremiumBundleUrlAsync,
  setPremiumBundleVersionAsync,
  setPremiumCodeAsync,
  setPremiumDownloadErrorAsync,
  setPremiumDownloadProgressAsync,
  setPremiumDownloadStatusAsync,
  setSortModeAsync,
  setViewModeAsync,
} from '../src/repositories/preferencesRepository';

function createFakePreferencesDb(initial?: Record<string, string>) {
  const store = new Map<string, string>(Object.entries(initial ?? {}));

  const db = {
    runAsync: async (_source: string, ...params: any[]) => {
      const [key, value] = params;
      store.set(String(key), String(value));
      return {} as any;
    },
    getFirstAsync: async <T>(_source: string, ...params: any[]) => {
      const [key] = params;
      const value = store.get(String(key));
      return (value ? ({ value } as any) : null) as T;
    },
    __store: store,
  };

  return db;
}

test('defaults: sortMode=random, filterMode=all, infiniteScroll=false, viewMode=list, reduceMotion=false, behavior=true, autoScroll=true', async () => {
  const db = createFakePreferencesDb();

  await expect(getPlanAsync(db)).resolves.toBe('free');
  await expect(getPremiumBundleUrlAsync(db)).resolves.toBeNull();
  await expect(getPremiumBundleVersionAsync(db)).resolves.toBeNull();
  await expect(getPremiumBundleSha256Async(db)).resolves.toBeNull();
  await expect(getPremiumDownloadStatusAsync(db)).resolves.toBe('not-downloaded');
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBeNull();
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBeNull();
  await expect(getSortModeAsync(db)).resolves.toBe('random');
  await expect(getFilterModeAsync(db)).resolves.toBe('all');
  await expect(getInfiniteScrollEnabledAsync(db)).resolves.toBe(false);
  await expect(getPageSizeAsync(db)).resolves.toBe(25);
  await expect(getViewModeAsync(db)).resolves.toBe('list');
  await expect(getReduceMotionEnabledAsync(db)).resolves.toBe(false);
  await expect(getCloseAsYouTapEnabledAsync(db)).resolves.toBe(true);
  await expect(getAutoScrollEnabledAsync(db)).resolves.toBe(true);
});

test('set/get roundtrip for all preferences', async () => {
  const db = createFakePreferencesDb();

  await setPlanAsync(db, 'premium');
  await setPremiumBundleUrlAsync(db, 'https://example.com/bundle.zip');
  await setPremiumBundleVersionAsync(db, 'v1');
  await setPremiumBundleSha256Async(db, 'deadbeef');
  await setSortModeAsync(db, 'za');
  await setFilterModeAsync(db, 'favorites');
  await setInfiniteScrollEnabledAsync(db, true);
  await setPageSizeAsync(db, 25);
  await setViewModeAsync(db, 'list-big');
  await setReduceMotionEnabledAsync(db, true);
  await setCloseAsYouTapEnabledAsync(db, false);
  await setAutoScrollEnabledAsync(db, false);
  await setPremiumDownloadStatusAsync(db, 'downloading');
  await setPremiumDownloadProgressAsync(db, 42);
  await setPremiumDownloadErrorAsync(db, 'something went wrong');

  await expect(getPlanAsync(db)).resolves.toBe('premium');
  await expect(getPremiumBundleUrlAsync(db)).resolves.toBe('https://example.com/bundle.zip');
  await expect(getPremiumBundleVersionAsync(db)).resolves.toBe('v1');
  await expect(getPremiumBundleSha256Async(db)).resolves.toBe('deadbeef');
  await expect(getPremiumDownloadStatusAsync(db)).resolves.toBe('downloading');
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBe(42);
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBe('something went wrong');
  await expect(getSortModeAsync(db)).resolves.toBe('za');
  await expect(getFilterModeAsync(db)).resolves.toBe('favorites');
  await expect(getInfiniteScrollEnabledAsync(db)).resolves.toBe(true);
  await expect(getPageSizeAsync(db)).resolves.toBe(25);
  await expect(getViewModeAsync(db)).resolves.toBe('list-big');
  await expect(getReduceMotionEnabledAsync(db)).resolves.toBe(true);
  await expect(getCloseAsYouTapEnabledAsync(db)).resolves.toBe(false);
  await expect(getAutoScrollEnabledAsync(db)).resolves.toBe(false);
});

test('persistence simulated: values are read from stored key/value table', async () => {
  const db = createFakePreferencesDb({
    plan: 'premium',
    premiumCode: 'PREMIUM2025',
    premiumDownloadStatus: 'ready',
    premiumDownloadProgress: '100',
    premiumDownloadError: 'zip failed',
    sortMode: 'az',
    filterMode: 'favorites',
    infiniteScrollEnabled: 'false',
    pageSize: '25',
    viewMode: 'list-big',
    reduceMotionEnabled: 'true',
    closeAsYouTapEnabled: 'false',
    autoScrollEnabled: 'false',
  });

  await expect(getPlanAsync(db)).resolves.toBe('premium');
  await expect(getPremiumCodeAsync(db)).resolves.toBe('PREMIUM2025');
  await expect(getPremiumDownloadStatusAsync(db)).resolves.toBe('ready');
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBe('zip failed');
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBe(100);
  await expect(getSortModeAsync(db)).resolves.toBe('az');
  await expect(getFilterModeAsync(db)).resolves.toBe('favorites');
  await expect(getInfiniteScrollEnabledAsync(db)).resolves.toBe(false);
  await expect(getPageSizeAsync(db)).resolves.toBe(25);
  await expect(getViewModeAsync(db)).resolves.toBe('list-big');
  await expect(getReduceMotionEnabledAsync(db)).resolves.toBe(true);
  await expect(getCloseAsYouTapEnabledAsync(db)).resolves.toBe(false);
  await expect(getAutoScrollEnabledAsync(db)).resolves.toBe(false);
});

test('premium download error supports clearing and trimming', async () => {
  const db = createFakePreferencesDb();

  await setPremiumDownloadErrorAsync(db, '  hello  ');
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBe('hello');

  await setPremiumDownloadErrorAsync(db, '   ');
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBeNull();

  await setPremiumDownloadErrorAsync(db, null);
  await expect(getPremiumDownloadErrorAsync(db)).resolves.toBeNull();
});

test('premium download progress clamps to [0, 100] and supports clearing', async () => {
  const db = createFakePreferencesDb();

  await setPremiumDownloadProgressAsync(db, 123);
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBe(100);

  await setPremiumDownloadProgressAsync(db, -10);
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBe(0);

  await setPremiumDownloadProgressAsync(db, null);
  await expect(getPremiumDownloadProgressAsync(db)).resolves.toBeNull();
});

test('maskPremiumCode returns masked suffix with last 4 chars', () => {
  expect(maskPremiumCode(null)).toBeNull();
  expect(maskPremiumCode('  PREMIUM2025  ')).toBe('••••-2025');
  expect(maskPremiumCode('ABCD')).toBe('••••');
});

test('setPremiumCodeAsync + getPremiumCodeAsync roundtrip supports clearing', async () => {
  const db = createFakePreferencesDb();

  await setPremiumCodeAsync(db, 'PREMIUM2025');
  await expect(getPremiumCodeAsync(db)).resolves.toBe('PREMIUM2025');

  await setPremiumCodeAsync(db, null);
  await expect(getPremiumCodeAsync(db)).resolves.toBeNull();
});
