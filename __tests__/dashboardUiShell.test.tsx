import type { ReactElement } from 'react';
import { act, create } from 'react-test-renderer';

import { AppShell } from '../src/app/AppShell';
import type { LibraryBootstrap } from '../src/app/initializeLibrary';
import type { ListRecipesInput, ListRecipesResult } from '../src/repositories/recipesRepository';
import type { SortMode } from '../src/types/sortMode';
import type { ViewMode } from '../src/types/viewMode';

type RenderedTree = ReturnType<typeof create>;

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

function flattenText(node: any): string {
  if (node == null) {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(flattenText).join('');
  }
  if (typeof node === 'object' && 'props' in node) {
    return flattenText((node as any).props?.children);
  }
  return String(node);
}

const mountedTrees: RenderedTree[] = [];

function renderAppShell(element: ReactElement) {
  let tree: RenderedTree | null = null;
  act(() => {
    tree = create(element);
  });
  mountedTrees.push(tree as RenderedTree);
  return tree as ReturnType<typeof create>;
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

function createBootstrapWith(overrides: Partial<LibraryBootstrap['preferences']>): LibraryBootstrap {
  const base = createBootstrap();
  return {
    ...base,
    preferences: {
      ...base.preferences,
      ...overrides,
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
      createPremiumBundleService: () => service,
      getPremiumDownloadStatusAsync: async () => bootstrap.preferences.premiumDownloadStatus,
      getPremiumDownloadProgressAsync: async () => bootstrap.preferences.premiumDownloadProgress,
      getPremiumDownloadErrorAsync: async () => bootstrap.preferences.premiumDownloadError,
      redeemCodeAsync: async () => ({
        bundleUrl: 'https://example.com/premium.zip',
        bundleVersion: 'v1',
        bundleSha256: null,
      }),
      setPremiumBundleUrlAsync: async () => undefined,
      setPremiumBundleVersionAsync: async () => undefined,
      setPremiumBundleSha256Async: async () => undefined,
    },
    service,
  };
}

test('renders dashboard header with overflow trigger', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell deps={{ ...deps, listRecipesAsync }} />
  );

  await flushMicrotasks(3);

  expect(tree.root.findByProps({ testID: 'header-overflow-button' })).toBeTruthy();

  const footerLabels = tree.root.findAll(
    (node: any) => typeof node?.props?.children === 'string' && node.props.children.includes('Footer')
  );
  expect(footerLabels).toHaveLength(0);
});

test('uses pageSize from preferences when listing recipes', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrapWith({ pageSize: 25 });
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  renderAppShell(<AppShell deps={{ ...deps, listRecipesAsync }} />);

  await flushMicrotasks(3);

  const first = listRecipesAsync.mock.calls[0];
  expect(first).toBeTruthy();
  const firstCall = (first as unknown as [any, ListRecipesInput])[1];
  expect(firstCall.pageSize).toBe(25);
});

test('navigates to settings from overflow menu and back', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync: async () => ({ rows: [], totalCount: 250 }),
      }}
    />
  );

  await flushMicrotasks(3);

  act(() => {
    tree.root.findByProps({ testID: 'header-overflow-button' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'overflow-menu-settings' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findByProps({ testID: 'header-back-button' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'header-back-button' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findByProps({ testID: 'header-overflow-button' })).toBeTruthy();
});

test('closes overflow menu when tapping the backdrop', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync: async () => ({ rows: [], totalCount: 250 }),
      }}
    />
  );

  await flushMicrotasks(3);

  act(() => {
    tree.root.findByProps({ testID: 'header-overflow-button' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'overflow-menu-backdrop' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'overflow-menu-backdrop' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findAllByProps({ testID: 'overflow-menu-backdrop' })).toHaveLength(0);
});

test('sort change resets page to 1', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async (_db: any, _input: ListRecipesInput): Promise<ListRecipesResult> => {
    return { rows: [], totalCount: 250 };
  });
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      initialPage={3}
      deps={{
        ...deps,
        listRecipesAsync,
        setSortModeAsync: async () => undefined,
      }}
    />
  );

  await flushMicrotasks(4);

  const firstCall = listRecipesAsync.mock.calls[0]?.[1] as ListRecipesInput;
  expect(firstCall.page).toBe(3);

  act(() => {
    tree.root.findByProps({ testID: 'controls-sort' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'sort-menu-item-az' }).props.onPress();
  });

  await flushMicrotasks(4);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(lastCall.page).toBe(1);
  expect(lastCall.sortMode).toBe('az');
});

test('randomize resets page to 1 and changes random seed', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async (_db: any, _input: ListRecipesInput): Promise<ListRecipesResult> => {
    return { rows: [], totalCount: 250 };
  });
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      initialPage={3}
      deps={{
        ...deps,
        listRecipesAsync,
        setSortModeAsync: async (_db: any, _sortMode: SortMode) => undefined,
        createRandomSeed: () => 999,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-randomize' }).props.onPress();
  });

  await flushMicrotasks(5);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(lastCall.page).toBe(1);
  expect(lastCall.sortMode).toBe('random');
  expect(lastCall.launchSeed).toBe(999);
});

test('switching from A–Z to Random still yields results and always provides launchSeed', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrapWith({ sortMode: 'az' });
  const listRecipesAsync = jest.fn(async (_db: any, input: ListRecipesInput): Promise<ListRecipesResult> => {
    return {
      rows: [
        {
          id: 1,
          randomKey: 1,
          isPremium: 0,
          imageLocalPath: null,
          isFavorite: 0,
          title: `Recipe sort=${input.sortMode}`,
          difficultyScore: 1,
          preparationTime: '1 min',
          description: '',
          timePeriod: '',
          warning: '',
          region: '',
          alternativeNames: '',
          usedFor: '',
          ingredients: '',
          detailedMeasurements: '',
          preparationSteps: '',
          usage: '',
          historicalContext: '',
          scientificEvidence: '',
        },
      ],
      totalCount: 1,
    };
  });
  const setSortModeAsync = jest.fn(async () => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
        setSortModeAsync,
      }}
    />
  );

  await flushMicrotasks(6);

  expect(listRecipesAsync).toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'header-overflow-button' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'controls-sort' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'sort-menu-item-random' }).props.onPress();
  });

  await flushMicrotasks(6);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(lastCall.sortMode).toBe('random');
  expect(typeof lastCall.launchSeed).toBe('number');
  expect(Number.isFinite(lastCall.launchSeed as number)).toBe(true);

  expect(tree.root.findByProps({ testID: 'header-overflow-button' })).toBeTruthy();
});

test('renders two view toggles (list, list-big)', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync: async () => ({ rows: [], totalCount: 250 }),
      }}
    />
  );

  await flushMicrotasks(3);

  expect(tree.root.findByProps({ testID: 'controls-view-list' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'controls-view-list-big' })).toBeTruthy();
});

test('inline search clear is hidden when search is empty and appears when search has text', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync: async () => ({ rows: [], totalCount: 250 }),
      }}
    />
  );

  await flushMicrotasks(4);

  expect(tree.root.findAllByProps({ testID: 'controls-search-clear' })).toHaveLength(0);

  act(() => {
    tree.root.findByProps({ testID: 'controls-search-input' }).props.onChangeText('mint');
  });

  expect(tree.root.findByProps({ testID: 'controls-search-clear' })).toBeTruthy();
});

test('search is debounced and clearable, view toggle persists', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async (_db: any, _input: ListRecipesInput): Promise<ListRecipesResult> => {
    return { rows: [], totalCount: 250 };
  });
  const setViewModeAsync = jest.fn(async (_db: any, _viewMode: ViewMode) => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      initialPage={3}
      deps={{
        ...deps,
        listRecipesAsync,
        setViewModeAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-search-input' }).props.onChangeText('mint');
  });

  act(() => {
    jest.advanceTimersByTime(250);
  });

  await flushMicrotasks(5);

  const afterSearch = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(afterSearch.searchQuery).toBe('mint');
  expect(afterSearch.page).toBe(1);

  act(() => {
    tree.root.findByProps({ testID: 'controls-search-clear' }).props.onPress();
  });

  await flushMicrotasks(5);

  const afterClear = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(afterClear.searchQuery).toBeUndefined();
  expect(afterClear.page).toBe(1);

  act(() => {
    tree.root.findByProps({ testID: 'controls-view-list-big' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(setViewModeAsync).toHaveBeenCalledWith(bootstrap.db, 'list-big');
});

test('sort dropdown stays open after selection and closes only when tapping outside', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async (_db: any, _input: ListRecipesInput): Promise<ListRecipesResult> => {
    return { rows: [], totalCount: 250 };
  });
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
        setSortModeAsync: async () => undefined,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-sort' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'sort-menu-item-random' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'sort-menu-item-az' }).props.onPress();
  });

  await flushMicrotasks(4);

  expect(tree.root.findByProps({ testID: 'sort-menu-item-za' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'sort-menu-backdrop' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findAllByProps({ testID: 'sort-menu-item-az' })).toHaveLength(0);
});

test('tapping the selected sort option does nothing', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const setSortModeAsync = jest.fn(async () => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
        setSortModeAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'controls-sort' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'sort-menu-item-random' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(setSortModeAsync).toHaveBeenCalledTimes(0);
});

test('pagination next button advances page when in paged mode', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell deps={{ ...deps, listRecipesAsync }} />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'pagination-next' }).props.onPress();
  });

  await flushMicrotasks(4);

  const last = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1];
  expect(last).toBeTruthy();
  const lastCall = (last as unknown as [any, ListRecipesInput])[1];
  expect(lastCall.page).toBe(2);
});

test('upgrade flow: paywall -> code entry validates and updates Settings plan', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrap();
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const setPlanAsync = jest.fn(async () => undefined);
  const setPremiumCodeAsync = jest.fn(async () => undefined);
  const redeemCodeAsync = jest.fn(async () => ({
    bundleUrl: 'https://example.com/premium.zip',
    bundleVersion: 'v1',
    bundleSha256: null,
  }));
  const setPremiumBundleUrlAsync = jest.fn(async () => undefined);
  const setPremiumBundleVersionAsync = jest.fn(async () => undefined);
  const setPremiumBundleSha256Async = jest.fn(async () => undefined);
  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
        redeemCodeAsync,
        setPlanAsync,
        setPremiumCodeAsync,
        setPremiumBundleUrlAsync,
        setPremiumBundleVersionAsync,
        setPremiumBundleSha256Async,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'header-overflow-button' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'overflow-menu-settings' }).props.onPress();
  });

  await flushMicrotasks(3);

  act(() => {
    tree.root.findByProps({ testID: 'settings-upgrade-button' }).props.onPress();
  });

  await flushMicrotasks(2);

  act(() => {
    tree.root.findByProps({ testID: 'premium-code-entry-input' }).props.onChangeText('bad');
  });

  act(() => {
    tree.root.findByProps({ testID: 'premium-code-entry-submit' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findByProps({ testID: 'premium-code-entry-error' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'premium-code-entry-input' }).props.onChangeText('PREMIUM2025');
  });

  act(() => {
    tree.root.findByProps({ testID: 'premium-code-entry-submit' }).props.onPress();
  });

  await flushMicrotasks(4);

  expect(redeemCodeAsync).toHaveBeenCalledWith('PREMIUM2025');
  expect(setPlanAsync).toHaveBeenCalledWith(bootstrap.db, 'premium');
  expect(setPremiumCodeAsync).toHaveBeenCalledWith(bootstrap.db, 'PREMIUM2025');
  expect(setPremiumBundleUrlAsync).toHaveBeenCalledWith(bootstrap.db, 'https://example.com/premium.zip');
  expect(setPremiumBundleVersionAsync).toHaveBeenCalledWith(bootstrap.db, 'v1');
  expect(setPremiumBundleSha256Async).toHaveBeenCalledWith(bootstrap.db, null);

  const planText = flattenText(tree.root.findByProps({ testID: 'settings-plan-text' }).props.children);
  expect(planText).toContain('Premium');
  expect(planText).toContain('1000');

  const codeText = flattenText(tree.root.findByProps({ testID: 'settings-code-masked' }).props.children);
  expect(codeText).toContain('••••-2025');

  expect(() => tree.root.findByProps({ testID: 'settings-upgrade-button' })).toThrow();
});

test('infinite scroll mode uses incremental pages when reaching list end', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrapWith({ infiniteScrollEnabled: true });
  const listRecipesAsync = jest.fn(async (_db: any, input: ListRecipesInput): Promise<ListRecipesResult> => {
    const rows = Array.from({ length: 2 }, (_v, index) => ({
      id: input.page * 10 + index,
      randomKey: 1,
      title: `Recipe ${input.page}-${index}`,
      difficultyScore: 1,
      preparationTime: '1 min',
      description: '',
      timePeriod: '',
      warning: '',
      region: '',
      historicalContext: '',
      scientificEvidence: '',
    }));

    return { rows: rows as any, totalCount: 6 };
  });

  const { deps } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell deps={{ ...deps, listRecipesAsync }} />
  );

  await flushMicrotasks(6);

  const firstCall = listRecipesAsync.mock.calls[0]?.[1] as ListRecipesInput;
  expect(firstCall.page).toBe(1);

  act(() => {
    tree.root.findByProps({ testID: 'pagination-load-more' }).props.onPress();
  });

  await flushMicrotasks(6);

  const lastCall = listRecipesAsync.mock.calls[listRecipesAsync.mock.calls.length - 1]?.[1] as ListRecipesInput;
  expect(lastCall.page).toBe(2);
});

test('premium download: Settings shows premium section and start opens modal + calls service', async () => {
  jest.useFakeTimers();

  const bootstrap = createBootstrapWith({ plan: 'premium' });
  const listRecipesAsync = jest.fn(async () => ({ rows: [], totalCount: 250 }));
  const { deps, service } = createAppShellDeps(bootstrap);

  const tree = renderAppShell(
    <AppShell
      deps={{
        ...deps,
        listRecipesAsync,
      }}
    />
  );

  await flushMicrotasks(4);

  act(() => {
    tree.root.findByProps({ testID: 'header-overflow-button' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'overflow-menu-settings' }).props.onPress();
  });

  await flushMicrotasks(3);

  expect(tree.root.findByProps({ testID: 'settings-premium-download-status' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'settings-premium-download-start' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'settings-premium-download-start' }).props.onPress();
  });

  await flushMicrotasks(2);

  expect(tree.root.findByProps({ testID: 'premium-download-modal' })).toBeTruthy();
  expect(service.startAsync).toHaveBeenCalledTimes(1);
});
