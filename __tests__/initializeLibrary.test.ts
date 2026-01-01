import { initializeLibraryAsync } from '../src/app/initializeLibrary';

test('initializeLibraryAsync seeds, loads preferences, and returns launchSeed', async () => {
  const calls: string[] = [];

  const fakeDb = {} as any;

  const result = await initializeLibraryAsync({
    getDbAsync: async () => {
      calls.push('getDb');
      return fakeDb;
    },
    seedAsync: async () => {
      calls.push('seed');
      return { didSeed: true, recipeCount: 250 };
    },
    getPlanAsync: async () => {
      calls.push('getPlan');
      return 'free';
    },
    getPremiumCodeAsync: async () => {
      calls.push('getPremiumCode');
      return null;
    },
    getPremiumBundleUrlAsync: async () => {
      calls.push('getPremiumBundleUrl');
      return null;
    },
    getPremiumBundleVersionAsync: async () => {
      calls.push('getPremiumBundleVersion');
      return null;
    },
    getPremiumBundleSha256Async: async () => {
      calls.push('getPremiumBundleSha256');
      return null;
    },
    getPremiumDownloadStatusAsync: async () => {
      calls.push('getPremiumDownloadStatus');
      return 'not-downloaded';
    },
    getPremiumDownloadProgressAsync: async () => {
      calls.push('getPremiumDownloadProgress');
      return null;
    },
    getSortModeAsync: async () => {
      calls.push('getSortMode');
      return 'random';
    },
    getInfiniteScrollEnabledAsync: async () => {
      calls.push('getInfiniteScrollEnabled');
      return false;
    },
    getPageSizeAsync: async () => {
      calls.push('getPageSize');
      return 50;
    },
    getViewModeAsync: async () => {
      calls.push('getViewMode');
      return 'list';
    },
    getReduceMotionEnabledAsync: async () => {
      calls.push('getReduceMotionEnabled');
      return false;
    },
    getCloseAsYouTapEnabledAsync: async () => {
      calls.push('getCloseAsYouTapEnabled');
      return true;
    },
    getAutoScrollEnabledAsync: async () => {
      calls.push('getAutoScrollEnabled');
      return true;
    },
    createLaunchSeed: () => {
      calls.push('createLaunchSeed');
      return 123;
    },
  });

  expect(result.db).toBe(fakeDb);
  expect(result.didSeed).toBe(true);
  expect(result.seededRecipeCount).toBe(250);
  expect(result.launchSeed).toBe(123);
  expect(result.preferences).toEqual({
    plan: 'free',
    premiumCode: null,
    premiumBundleUrl: null,
    premiumBundleVersion: null,
    premiumBundleSha256: null,
    premiumDownloadStatus: 'not-downloaded',
    premiumDownloadProgress: null,
    sortMode: 'random',
    infiniteScrollEnabled: false,
    pageSize: 50,
    viewMode: 'list',
    reduceMotionEnabled: false,
    closeAsYouTapEnabled: true,
    autoScrollEnabled: true,
  });

  expect(calls).toEqual([
    'getDb',
    'seed',
    'getPlan',
    'getPremiumCode',
    'getPremiumBundleUrl',
    'getPremiumBundleVersion',
    'getPremiumBundleSha256',
    'getPremiumDownloadStatus',
    'getPremiumDownloadProgress',
    'getSortMode',
    'getInfiniteScrollEnabled',
    'getPageSize',
    'getViewMode',
    'getReduceMotionEnabled',
    'getCloseAsYouTapEnabled',
    'getAutoScrollEnabled',
    'createLaunchSeed',
  ]);
});
