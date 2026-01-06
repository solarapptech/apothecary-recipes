import type { ReactElement } from 'react';
import { act, create } from 'react-test-renderer';

import { AppShell } from '../src/app/AppShell';
import type { LibraryBootstrap } from '../src/app/initializeLibrary';
import type { ListRecipesInput } from '../src/repositories/recipesRepository';

type RenderedTree = ReturnType<typeof create>;

const mountedTrees: RenderedTree[] = [];

const originalConsoleWarn = console.warn;

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('SafeAreaView has been deprecated')) {
      return;
    }
    originalConsoleWarn(...args);
  });
});

afterAll(() => {
  (console.warn as unknown as jest.Mock).mockRestore();
});

afterEach(() => {
  for (const tree of mountedTrees) {
    act(() => {
      tree.unmount();
    });
  }
  mountedTrees.length = 0;
  jest.clearAllMocks();
  jest.useRealTimers();
});

async function flushMicrotasks(times: number) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      try {
        jest.runOnlyPendingTimers();
      } catch {
        // ignore when not using fake timers
      }
    });
  }
}

function renderAppShell(element: ReactElement) {
  let tree: RenderedTree | null = null;
  act(() => {
    tree = create(element);
  });
  mountedTrees.push(tree as RenderedTree);
  return tree as RenderedTree;
}

function createBootstrap(reduceMotionEnabled = false): LibraryBootstrap {
  return {
    db: {} as any,
    didSeed: false,
    seededRecipeCount: 250,
    launchSeed: 123,
    preferences: {
      plan: 'free',
      premiumCode: null,
      premiumBundleUrl: null,
      premiumBundleVersion: null,
      premiumBundleSha256: null,
      premiumDownloadStatus: 'not-downloaded',
      premiumDownloadProgress: null,
      premiumDownloadError: null,
      sortMode: 'random',
      filterMode: 'all',
      advancedFilters: { productTypes: [], conditions: [], ingredients: [] },
      infiniteScrollEnabled: false,
      pageSize: 50,
      viewMode: 'list',
      reduceMotionEnabled,
      closeAsYouTapEnabled: true,
      autoScrollEnabled: true,
    },
  };
}

function createAppShellDeps(bootstrap: LibraryBootstrap) {
  const service = {
    startAsync: jest.fn(async () => true),
    pauseAsync: jest.fn(async () => undefined),
    resumeAsync: jest.fn(async () => undefined),
    retryAsync: jest.fn(async () => true),
  };

  return {
    deps: {
      initializeLibraryAsync: async () => bootstrap,
      createPremiumBundleInstaller: () => ({
        createJob: () => ({
          runAsync: async () => ({ version: 'test', recipeCount: 0 }),
        }),
      }),
      createPremiumBundleService: () => service as any,
      getPremiumDownloadStatusAsync: async () => bootstrap.preferences.premiumDownloadStatus,
      getPremiumDownloadProgressAsync: async () => bootstrap.preferences.premiumDownloadProgress,
      getPremiumDownloadErrorAsync: async () => bootstrap.preferences.premiumDownloadError,
    },
    service,
  };
}

test('pagination changes pages correctly (page 1 -> page 2)', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
      }}
    />
  );

  await flushMicrotasks(6);

  act(() => {
    tree.root.findByProps({ testID: 'pagination-next' }).props.onPress();
  });

  await flushMicrotasks(4);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1];
  const input = (lastCall as unknown as [any, ListRecipesInput])[1];
  expect(input.page).toBe(2);
});

test('pagination page selection works correctly', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      initialPage={1}
      deps={{
        ...deps,
        listRecipesAsync,
      }}
    />
  );

  await flushMicrotasks(6);

  act(() => {
    tree.root.findByProps({ testID: 'pagination-page-3' }).props.onPress();
  });

  await flushMicrotasks(4);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1];
  const input = (lastCall as unknown as [any, ListRecipesInput])[1];
  expect(input.page).toBe(3);
});

test('pagination works with Reduce Motion enabled', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap(true);
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
      }}
    />
  );

  await flushMicrotasks(6);

  act(() => {
    tree.root.findByProps({ testID: 'pagination-next' }).props.onPress();
  });

  await flushMicrotasks(4);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1];
  const input = (lastCall as unknown as [any, ListRecipesInput])[1];
  expect(input.page).toBe(2);
});
