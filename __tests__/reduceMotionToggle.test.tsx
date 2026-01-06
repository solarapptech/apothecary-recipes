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

function findByTestId(tree: RenderedTree, testID: string) {
  const matches = tree.root.findAllByProps({ testID });
  return matches.length > 0 ? matches[0] : null;
}

function createBootstrap(): LibraryBootstrap {
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
      reduceMotionEnabled: false,
      closeAsYouTapEnabled: true,
      autoScrollEnabled: true,
    },
  };
}

test('Settings Reduce motion toggle persists via setReduceMotionEnabledAsync', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const setReduceMotionEnabledAsync = jest.fn(async () => undefined);

  const service = {
    startAsync: jest.fn(async () => true),
    pauseAsync: jest.fn(async () => undefined),
    resumeAsync: jest.fn(async () => undefined),
    retryAsync: jest.fn(async () => true),
  };

  const tree = renderAppShell(
    <AppShell
      deps={{
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
        getPremiumDownloadErrorAsync: async () => bootstrap.preferences.premiumDownloadError,
        setReduceMotionEnabledAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  const overflowButton = findByTestId(tree, 'header-overflow-button');
  expect(overflowButton).toBeTruthy();

  act(() => {
    (overflowButton as any).props.onPress();
  });

  await flushMicrotasks(2);

  act(() => {
    tree.root.findByProps({ testID: 'overflow-menu-settings' }).props.onPress();
  });

  await flushMicrotasks(2);

  const animationsSwitch = tree.root.findByProps({ testID: 'settings-animations-switch' });
  expect(animationsSwitch.props.value).toBe(true);

  act(() => {
    animationsSwitch.props.onValueChange(false);
  });

  await flushMicrotasks(2);

  expect(setReduceMotionEnabledAsync).toHaveBeenCalledWith(bootstrap.db, true);
  expect(tree.root.findByProps({ testID: 'settings-animations-switch' }).props.value).toBe(false);
});
