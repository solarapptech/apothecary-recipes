import type { ReactElement } from 'react';
import { act, create } from 'react-test-renderer';

import { AppShell } from '../src/app/AppShell';
import type { LibraryBootstrap } from '../src/app/initializeLibrary';

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
      premiumDownloadStatus: 'not-downloaded',
      premiumDownloadProgress: null,
      sortMode: 'random',
      infiniteScrollEnabled: false,
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
      listRecipesAsync: async () => ({ rows: [], totalCount: 250 }),
      createPremiumBundleInstaller: () => ({
        createJob: () => ({
          runAsync: async () => ({ version: 'test', recipeCount: 0 }),
        }),
      }),
      createPremiumBundleService: () => service as any,
      getPremiumDownloadStatusAsync: async () => bootstrap.preferences.premiumDownloadStatus,
      getPremiumDownloadProgressAsync: async () => bootstrap.preferences.premiumDownloadProgress,
    },
    service,
  };
}

test('view mode toggle changes modes correctly (list -> list-big -> grid)', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const setViewModeAsync = jest.fn(async () => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        setViewModeAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-view-list-big' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(setViewModeAsync).toHaveBeenCalledWith(bootstrap.db, 'list-big');

  act(() => {
    tree.root.findByProps({ testID: 'controls-view-grid' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(setViewModeAsync).toHaveBeenCalledWith(bootstrap.db, 'grid');
});

test('view mode toggle works with Reduce Motion enabled', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap(true);
  const setViewModeAsync = jest.fn(async () => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        setViewModeAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-view-list-big' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(setViewModeAsync).toHaveBeenCalledWith(bootstrap.db, 'list-big');
});
