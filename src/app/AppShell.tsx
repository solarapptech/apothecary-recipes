import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Modal, Platform, Pressable, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';

import { motionDurationMs } from './motionPolicy';
import { AppBackground } from '../components/AppBackground';
import { DashboardControlsRow } from '../components/DashboardControlsRow';
import { PaginationBar } from '../components/PaginationBar';
import { OverflowMenu } from '../components/OverflowMenu';
import { ModalCardBackground } from '../components/ModalCardBackground';
import { ModalBackdrop } from '../components/ModalBackdrop';
import { PremiumCodeEntryModal } from '../components/PremiumCodeEntryModal';
import { PremiumDownloadModal } from '../components/PremiumDownloadModal';
import { PremiumPaywallModal } from '../components/PremiumPaywallModal';
import { MAX_NUMERIC_PAGE_BUTTONS, PAGE_SIZE } from '../config/pagination';
import { BACKEND_BASE_URL } from '../config/backend';
import { ENABLE_DEV_RESET } from '../config/devFlags';
import { PREMIUM_BUNDLE_URL } from '../config/premiumBundle';
import { initializeLibraryAsync, type LibraryBootstrap } from './initializeLibrary';
import { createQueuedLoadGuard } from '../repositories/fetchGuard';
import {
  setAdvancedFiltersAsync as setAdvancedFiltersDefaultAsync,
  getPremiumDownloadErrorAsync as getPremiumDownloadErrorDefaultAsync,
  getPremiumDownloadProgressAsync as getPremiumDownloadProgressDefaultAsync,
  getPremiumDownloadStatusAsync as getPremiumDownloadStatusDefaultAsync,
  setPremiumDownloadProgressAsync as setPremiumDownloadProgressDefaultAsync,
  setPremiumDownloadStatusAsync as setPremiumDownloadStatusDefaultAsync,
  setAutoScrollEnabledAsync as setAutoScrollEnabledDefaultAsync,
  setCloseAsYouTapEnabledAsync as setCloseAsYouTapEnabledDefaultAsync,
  setFilterModeAsync as setFilterModeDefaultAsync,
  setPageSizeAsync as setPageSizeDefaultAsync,
  setPlanAsync as setPlanDefaultAsync,
  setPremiumBundleSha256Async as setPremiumBundleSha256DefaultAsync,
  setPremiumBundleUrlAsync as setPremiumBundleUrlDefaultAsync,
  setPremiumBundleVersionAsync as setPremiumBundleVersionDefaultAsync,
  setPremiumCodeAsync as setPremiumCodeDefaultAsync,
  setReduceMotionEnabledAsync as setReduceMotionEnabledDefaultAsync,
  setSortModeAsync as setSortModeDefaultAsync,
  setViewModeAsync as setViewModeDefaultAsync,
} from '../repositories/preferencesRepository';
import type { PremiumDownloadStatus } from '../repositories/preferencesRepository';
import {
  listRecipesAsync as listRecipesDefaultAsync,
  type ListRecipesInput,
  type ListRecipesResult,
} from '../repositories/recipesRepository';
import {
  listFilterCatalogAsync as listFilterCatalogDefaultAsync,
  type FilterCatalog,
} from '../repositories/filterCatalogRepository';
import {
  listFavoriteIdsAsync as listFavoriteIdsDefaultAsync,
  setFavoriteAsync as setFavoriteDefaultAsync,
} from '../repositories/favoritesRepository';
import { createExpoPremiumBundleInstaller, deleteLocalPremiumBundleFilesAsync } from '../premium/expoPremiumBundleInstaller';
import {
  createPremiumBundleService,
  type PremiumBundleInstaller,
  type PremiumBundleService,
} from '../premium/premiumBundleService';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EMPTY_ADVANCED_FILTERS, type AdvancedFilters } from '../types/advancedFilters';
import type { FilterMode } from '../types/filterMode';
import type { Plan } from '../types/plan';
import type { SortMode } from '../types/sortMode';
import type { ViewMode } from '../types/viewMode';
import { theme } from '../ui/theme';

type RouteName = 'dashboard' | 'settings';

type AppShellDeps = {
  initializeLibraryAsync: () => Promise<LibraryBootstrap>;
  listRecipesAsync: (db: LibraryBootstrap['db'], input: ListRecipesInput) => Promise<ListRecipesResult>;
  listFilterCatalogAsync: (db: LibraryBootstrap['db'], input: { plan: Plan }) => Promise<FilterCatalog>;
  setFavoriteAsync: (db: LibraryBootstrap['db'], recipeId: number, isFavorite: boolean) => Promise<void>;
  listFavoriteIdsAsync: (db: LibraryBootstrap['db']) => Promise<number[]>;
  getPremiumDownloadStatusAsync: (db: LibraryBootstrap['db']) => Promise<PremiumDownloadStatus>;
  getPremiumDownloadProgressAsync: (db: LibraryBootstrap['db']) => Promise<number | null>;
  getPremiumDownloadErrorAsync: (db: LibraryBootstrap['db']) => Promise<string | null>;
  setPremiumDownloadStatusAsync: (db: LibraryBootstrap['db'], status: PremiumDownloadStatus) => Promise<void>;
  setPremiumDownloadProgressAsync: (db: LibraryBootstrap['db'], progress: number | null) => Promise<void>;
  redeemCodeAsync: (code: string) => Promise<{ bundleUrl: string; bundleVersion: string; bundleSha256: string | null }>;
  setPlanAsync: (db: LibraryBootstrap['db'], plan: Plan) => Promise<void>;
  setPremiumCodeAsync: (db: LibraryBootstrap['db'], code: string | null) => Promise<void>;
  setPremiumBundleUrlAsync: (db: LibraryBootstrap['db'], url: string | null) => Promise<void>;
  setPremiumBundleVersionAsync: (db: LibraryBootstrap['db'], version: string | null) => Promise<void>;
  setPremiumBundleSha256Async: (db: LibraryBootstrap['db'], sha256: string | null) => Promise<void>;
  setReduceMotionEnabledAsync: (db: LibraryBootstrap['db'], enabled: boolean) => Promise<void>;
  setCloseAsYouTapEnabledAsync: (db: LibraryBootstrap['db'], enabled: boolean) => Promise<void>;
  setAutoScrollEnabledAsync: (db: LibraryBootstrap['db'], enabled: boolean) => Promise<void>;
  setPageSizeAsync: (db: LibraryBootstrap['db'], pageSize: number) => Promise<void>;
  setSortModeAsync: (db: LibraryBootstrap['db'], sortMode: SortMode) => Promise<void>;
  setFilterModeAsync: (db: LibraryBootstrap['db'], mode: FilterMode) => Promise<void>;
  setAdvancedFiltersAsync: (db: LibraryBootstrap['db'], filters: AdvancedFilters) => Promise<void>;
  setViewModeAsync: (db: LibraryBootstrap['db'], viewMode: ViewMode) => Promise<void>;
  createPremiumBundleInstaller: (db: LibraryBootstrap['db'], bundleUrl: string) => PremiumBundleInstaller;
  createPremiumBundleService: (db: LibraryBootstrap['db'], installer: PremiumBundleInstaller) => PremiumBundleService;
  createRandomSeed: () => number;
};

const defaultDeps: AppShellDeps = {
  initializeLibraryAsync,
  listRecipesAsync: listRecipesDefaultAsync,
  listFilterCatalogAsync: listFilterCatalogDefaultAsync,
  setFavoriteAsync: setFavoriteDefaultAsync,
  listFavoriteIdsAsync: listFavoriteIdsDefaultAsync,
  getPremiumDownloadStatusAsync: getPremiumDownloadStatusDefaultAsync,
  getPremiumDownloadProgressAsync: getPremiumDownloadProgressDefaultAsync,
  getPremiumDownloadErrorAsync: getPremiumDownloadErrorDefaultAsync,
  setPremiumDownloadStatusAsync: setPremiumDownloadStatusDefaultAsync,
  setPremiumDownloadProgressAsync: setPremiumDownloadProgressDefaultAsync,
  redeemCodeAsync: async (code) => {
    const base = BACKEND_BASE_URL.replace(/\/$/, '');
    if (!base) {
      throw new Error('EXPO_PUBLIC_BACKEND_URL is required');
    }

    const response = await fetch(`${base}/v1/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const parsed = (await response.json().catch(() => null)) as any;

    if (!response.ok) {
      const message = parsed && typeof parsed.error === 'string' ? parsed.error : `Redeem failed (${response.status})`;
      throw new Error(message);
    }

    if (!parsed || typeof parsed.bundleUrl !== 'string' || parsed.bundleUrl.trim().length === 0) {
      throw new Error('Redeem response missing bundleUrl');
    }

    return {
      bundleUrl: String(parsed.bundleUrl),
      bundleVersion: typeof parsed.bundleVersion === 'string' ? parsed.bundleVersion : 'unknown',
      bundleSha256: typeof parsed.bundleSha256 === 'string' && parsed.bundleSha256.trim().length > 0 ? parsed.bundleSha256 : null,
    };
  },
  setPlanAsync: setPlanDefaultAsync,
  setPremiumCodeAsync: setPremiumCodeDefaultAsync,
  setPremiumBundleUrlAsync: setPremiumBundleUrlDefaultAsync,
  setPremiumBundleVersionAsync: setPremiumBundleVersionDefaultAsync,
  setPremiumBundleSha256Async: setPremiumBundleSha256DefaultAsync,
  setReduceMotionEnabledAsync: setReduceMotionEnabledDefaultAsync,
  setCloseAsYouTapEnabledAsync: setCloseAsYouTapEnabledDefaultAsync,
  setAutoScrollEnabledAsync: setAutoScrollEnabledDefaultAsync,
  setPageSizeAsync: setPageSizeDefaultAsync,
  setSortModeAsync: setSortModeDefaultAsync,
  setFilterModeAsync: setFilterModeDefaultAsync,
  setAdvancedFiltersAsync: setAdvancedFiltersDefaultAsync,
  setViewModeAsync: setViewModeDefaultAsync,
  createPremiumBundleInstaller: (db, bundleUrl) => {
    const safe = bundleUrl.trim().length > 0 ? bundleUrl : PREMIUM_BUNDLE_URL;
    return createExpoPremiumBundleInstaller({
      db,
      bundleUrl: safe,
    });
  },
  createPremiumBundleService: (db, installer) => {
    return createPremiumBundleService(db, installer, {});
  },
  createRandomSeed: () => {
    const max = 0x7fffffff;
    return Math.floor(Math.random() * max);
  },
};

type AppShellProps = {
  deps?: Partial<AppShellDeps>;
  initialPage?: number;
};

type UiState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      bootstrap: LibraryBootstrap;
    };

export function AppShell({ deps, initialPage }: AppShellProps) {
  const resolved = useMemo(() => ({ ...defaultDeps, ...deps }), [deps]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  const androidTopInset = Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0;

  const [uiState, setUiState] = useState<UiState>({ status: 'loading' });
  const [route, setRoute] = useState<RouteName>('dashboard');

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }
    if (uiState.status !== 'ready') {
      return;
    }

    void SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, uiState.status]);

  const [menuVisible, setMenuVisible] = useState(false);

  const [page, setPage] = useState(() => Math.max(1, initialPage ?? 1));
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const [infinitePage, setInfinitePage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [plan, setPlan] = useState<Plan>('free');
  const [premiumCode, setPremiumCode] = useState<string | null>(null);
  const [premiumBundleUrl, setPremiumBundleUrl] = useState<string | null>(null);
  const [premiumBundleVersion, setPremiumBundleVersion] = useState<string | null>(null);
  const [premiumBundleSha256, setPremiumBundleSha256] = useState<string | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [codeEntryVisible, setCodeEntryVisible] = useState(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  const [premiumDownloadStatus, setPremiumDownloadStatus] = useState<PremiumDownloadStatus>('not-downloaded');
  const [premiumDownloadProgress, setPremiumDownloadProgress] = useState<number | null>(null);
  const [premiumDownloadError, setPremiumDownloadError] = useState<string | null>(null);
  const [premiumDownloadModalVisible, setPremiumDownloadModalVisible] = useState(false);
  const premiumDownloadServiceRef = useRef<PremiumBundleService | null>(null);
  const previousPremiumStatusRef = useRef<PremiumDownloadStatus>('not-downloaded');

  const [sortMode, setSortMode] = useState<SortMode>('random');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hasAnyFavorites, setHasAnyFavorites] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [closeAsYouTapEnabled, setCloseAsYouTapEnabled] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [filterCatalog, setFilterCatalog] = useState<FilterCatalog>({
    productTypes: [],
    conditions: [],
    ingredients: [],
  });

  const [randomSeed, setRandomSeed] = useState<number>(1);

  const [recipes, setRecipes] = useState<ListRecipesResult['rows']>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [recipesRefreshNonce, setRecipesRefreshNonce] = useState(0);
  const [focusResetNonce, setFocusResetNonce] = useState(0);

  const [isRecipesLoading, setIsRecipesLoading] = useState(false);

  const recipesLoadGuardRef = useRef(createQueuedLoadGuard());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bootstrap = await resolved.initializeLibraryAsync();
        if (cancelled) {
          return;
        }

        setSortMode(bootstrap.preferences.sortMode);
        setFilterMode(bootstrap.preferences.filterMode);
        setAdvancedFilters(bootstrap.preferences.advancedFilters);
        setInfiniteScrollEnabled(bootstrap.preferences.infiniteScrollEnabled);
        setViewMode(bootstrap.preferences.viewMode);
        setPlan(bootstrap.preferences.plan);
        setPremiumCode(bootstrap.preferences.premiumCode);
        setPremiumBundleUrl(bootstrap.preferences.premiumBundleUrl);
        setPremiumBundleVersion(bootstrap.preferences.premiumBundleVersion);
        setPremiumBundleSha256(bootstrap.preferences.premiumBundleSha256);
        setPremiumDownloadStatus(bootstrap.preferences.premiumDownloadStatus);
        setPremiumDownloadProgress(bootstrap.preferences.premiumDownloadProgress);
        setPremiumDownloadError(bootstrap.preferences.premiumDownloadError);
        setReduceMotionEnabled(bootstrap.preferences.reduceMotionEnabled);
        setCloseAsYouTapEnabled(bootstrap.preferences.closeAsYouTapEnabled);
        setAutoScrollEnabled(bootstrap.preferences.autoScrollEnabled);
        setPageSize(bootstrap.preferences.pageSize);
        setRandomSeed(bootstrap.launchSeed);

        const installer = resolved.createPremiumBundleInstaller(
          bootstrap.db,
          bootstrap.preferences.premiumBundleUrl ?? PREMIUM_BUNDLE_URL
        );
        premiumDownloadServiceRef.current = resolved.createPremiumBundleService(bootstrap.db, installer);

        setUiState({ status: 'ready', bootstrap });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setUiState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolved]);

  useEffect(() => {
    if (uiState.status !== 'ready') {
      return;
    }

    let cancelled = false;
    (async () => {
      const catalog = await resolved.listFilterCatalogAsync(uiState.bootstrap.db, { plan });
      if (cancelled) {
        return;
      }
      setFilterCatalog(catalog);
    })();

    return () => {
      cancelled = true;
    };
  }, [plan, premiumDownloadStatus, resolved, uiState]);

  useEffect(() => {
    if (uiState.status !== 'ready') {
      return;
    }

    let cancelled = false;
    (async () => {
      const ids = await resolved.listFavoriteIdsAsync(uiState.bootstrap.db);
      if (cancelled) {
        return;
      }
      setHasAnyFavorites(ids.length > 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [resolved, uiState]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) {
      return;
    }

    const handle = setTimeout(() => {
      setPage(1);
      setInfinitePage(1);
      setRecipes([]);
      setSearchQuery(trimmed);
    }, 500);

    return () => {
      clearTimeout(handle);
    };
  }, [searchInput, searchQuery]);

  useEffect(() => {
    if (route !== 'dashboard') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuVisible) {
        setMenuVisible(false);
        return true;
      }
      if (premiumDownloadModalVisible) {
        setPremiumDownloadModalVisible(false);
        return true;
      }
      if (codeEntryVisible) {
        setCodeEntryVisible(false);
        return true;
      }
      if (paywallVisible) {
        setPaywallVisible(false);
        return true;
      }
      if (exitConfirmVisible) {
        setExitConfirmVisible(false);
        return true;
      }

      setExitConfirmVisible(true);
      return true;
    });

    return () => subscription.remove();
  }, [
    route,
    menuVisible,
    premiumDownloadModalVisible,
    codeEntryVisible,
    paywallVisible,
    exitConfirmVisible,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (infiniteScrollEnabled) {
      return;
    }

    if (totalCount <= 0) {
      return;
    }

    setPage((prev) => Math.min(prev, totalPages));
  }, [infiniteScrollEnabled, totalCount, totalPages]);

  useEffect(() => {
    if (uiState.status !== 'ready') {
      return;
    }

    let cancelled = false;

    const refreshAsync = async () => {
      const nextStatus = await resolved.getPremiumDownloadStatusAsync(uiState.bootstrap.db);
      const nextProgress = await resolved.getPremiumDownloadProgressAsync(uiState.bootstrap.db);
      const nextError = await resolved.getPremiumDownloadErrorAsync(uiState.bootstrap.db);
      if (cancelled) {
        return;
      }
      setPremiumDownloadStatus(nextStatus);
      setPremiumDownloadProgress(nextProgress);
      setPremiumDownloadError(nextError);
    };

    void refreshAsync();

    const handle = setInterval(() => {
      void refreshAsync();
    }, 750);

    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [resolved, uiState]);

  useEffect(() => {
    const previous = previousPremiumStatusRef.current;
    previousPremiumStatusRef.current = premiumDownloadStatus;

    if (previous !== 'ready' && premiumDownloadStatus === 'ready') {
      setRecipes([]);
      setPage(1);
      setInfinitePage(1);
      setRecipesRefreshNonce((value) => value + 1);
    }
  }, [premiumDownloadStatus]);

  useEffect(() => {
    if (uiState.status !== 'ready') {
      return;
    }

    let cancelled = false;

    (async () => {
      const guard = recipesLoadGuardRef.current;
      await guard(async () => {
        setIsLoadingMore(true);
        setIsRecipesLoading(true);

        try {
          const requestedPage = infiniteScrollEnabled ? infinitePage : page;

          const safeRandomSeed =
            sortMode === 'random'
              ? Number.isFinite(randomSeed)
                ? randomSeed
                : Number.isFinite(uiState.bootstrap.launchSeed)
                  ? uiState.bootstrap.launchSeed
                  : resolved.createRandomSeed()
              : undefined;

          if (sortMode === 'random' && typeof safeRandomSeed === 'number' && safeRandomSeed !== randomSeed) {
            setRandomSeed(safeRandomSeed);
          }

          const { rows, totalCount: count } = await resolved.listRecipesAsync(uiState.bootstrap.db, {
            page: requestedPage,
            pageSize,
            searchQuery: searchQuery.length > 0 ? searchQuery : undefined,
            sortMode,
            filterMode,
            advancedFilters,
            launchSeed: safeRandomSeed,
            plan,
          });

          if (cancelled) {
            return;
          }

          setRecipes((prev) => {
            if (!infiniteScrollEnabled || requestedPage <= 1) {
              return rows;
            }
            return [...prev, ...rows];
          });
          setTotalCount(count);
        } finally {
          if (isMountedRef.current) {
            setIsLoadingMore(false);
            setIsRecipesLoading(false);
          }
        }
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    infinitePage,
    infiniteScrollEnabled,
    page,
    pageSize,
    plan,
    randomSeed,
    recipesRefreshNonce,
    resolved,
    searchQuery,
    filterMode,
    advancedFilters,
    sortMode,
    uiState,
  ]);

  const isInitialRecipesLoading = recipes.length === 0 && isRecipesLoading;

  if (!fontsLoaded) {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
          <Text style={styles.subtitle}>Loading fonts…</Text>
        </View>
      </AppBackground>
    );
  }

  if (uiState.status === 'loading') {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
          <Text style={styles.subtitle}>Initializing library…</Text>
        </View>
      </AppBackground>
    );
  }

  if (uiState.status === 'error') {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <Text style={styles.title}>Apothecary Recipes</Text>
          <Text style={styles.error}>Error: {uiState.message}</Text>
        </View>
      </AppBackground>
    );
  }

  const transitionDuration = motionDurationMs(reduceMotionEnabled, 220);

  const bannerProgress = typeof premiumDownloadProgress === 'number' ? premiumDownloadProgress : 0;
  const bannerVisible = plan === 'premium' && premiumCode !== null && premiumDownloadStatus !== 'ready';
  const bannerText =
    premiumDownloadStatus === 'downloading'
      ? `Downloading ${bannerProgress}%`
      : premiumDownloadStatus === 'paused'
        ? 'Download paused'
        : premiumDownloadStatus === 'failed'
          ? 'Download failed'
          : premiumDownloadStatus === 'not-downloaded'
            ? 'Premium not downloaded'
            : 'Premium content';

  const banner = bannerVisible ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Show premium download progress"
      onPress={() => setPremiumDownloadModalVisible(true)}
      style={[styles.premiumBanner, androidTopInset > 0 ? { paddingTop: androidTopInset } : null]}
      testID="premium-download-banner"
    >
      <View style={styles.premiumBannerRow}>
        {premiumDownloadStatus === 'downloading' ? (
          <ActivityIndicator color={theme.colors.ink.onBrand} size="small" />
        ) : null}
        <Text style={styles.premiumBannerText}>{bannerText}</Text>
      </View>
      <View style={styles.premiumBannerTrack}>
        <View style={[styles.premiumBannerFill, { width: `${Math.max(0, Math.min(100, bannerProgress))}%` }]} />
      </View>
    </Pressable>
  ) : null;

  const footer = (
    <View style={styles.footerContainer}>
      <PaginationBar
        mode={infiniteScrollEnabled ? 'infinite' : 'paged'}
        page={infiniteScrollEnabled ? infinitePage : page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        loadedCount={infiniteScrollEnabled ? recipes.length : undefined}
        maxNumericButtons={MAX_NUMERIC_PAGE_BUTTONS}
        reduceMotionEnabled={reduceMotionEnabled}
        onPrev={
          infiniteScrollEnabled
            ? undefined
            : () => {
                setRecipes([]);
                setPage((prev) => Math.max(1, prev - 1));
                setFocusResetNonce((value) => value + 1);
              }
        }
        onNext={
          infiniteScrollEnabled
            ? undefined
            : () => {
                setRecipes([]);
                setPage((prev) => Math.min(totalPages, prev + 1));
                setFocusResetNonce((value) => value + 1);
              }
        }
        onSelectPage={
          infiniteScrollEnabled
            ? undefined
            : (nextPage) => {
                if (nextPage === page) {
                  return;
                }
                setRecipes([]);
                setPage(nextPage);
                setFocusResetNonce((value) => value + 1);
              }
        }
        onLoadMore={
          infiniteScrollEnabled
            ? () => {
                if (recipes.length >= totalCount) {
                  return;
                }
                if (isLoadingMore) {
                  return;
                }
                setInfinitePage((prev) => prev + 1);
              }
            : undefined
        }
        canLoadMore={infiniteScrollEnabled ? recipes.length < totalCount && !isLoadingMore : undefined}
      />
    </View>
  );

if (route === 'settings') {
  return (
    <>
      <AppBackground>
        <View style={styles.appContainer}>
          {banner}
          <Animated.View
            entering={reduceMotionEnabled ? undefined : FadeInLeft.duration(transitionDuration)}
            exiting={reduceMotionEnabled ? undefined : FadeOutLeft.duration(transitionDuration)}
            style={styles.screenContainer}
          >
            <SettingsScreen
              onBackPress={() => {
                setRoute('dashboard');
              }}
              plan={plan}
              pageSize={pageSize}
              onChangePageSize={async (nextPageSize: number) => {
                const normalized = nextPageSize === 25 ? 25 : 50;
                setPageSize(normalized);

                setRecipes([]);
                setPage(1);
                setInfinitePage(1);
                setFocusResetNonce((value) => value + 1);

                await resolved.setPageSizeAsync(uiState.bootstrap.db, normalized);
              }}
              reduceMotionEnabled={reduceMotionEnabled}
              onToggleReduceMotionEnabled={async (enabled) => {
                setReduceMotionEnabled(enabled);
                await resolved.setReduceMotionEnabledAsync(uiState.bootstrap.db, enabled);
              }}
              closeAsYouTapEnabled={closeAsYouTapEnabled}
              onToggleCloseAsYouTapEnabled={async (enabled) => {
                setCloseAsYouTapEnabled(enabled);
                await resolved.setCloseAsYouTapEnabledAsync(uiState.bootstrap.db, enabled);
              }}
              autoScrollEnabled={autoScrollEnabled}
              onToggleAutoScrollEnabled={async (enabled) => {
                setAutoScrollEnabled(enabled);
                await resolved.setAutoScrollEnabledAsync(uiState.bootstrap.db, enabled);
              }}
              premiumCode={premiumCode}
              premiumDownloadStatus={premiumDownloadStatus}
              premiumDownloadProgress={premiumDownloadProgress}
              onPressUpgrade={() => setCodeEntryVisible(true)}
              onPressStartPremiumDownload={() => {
                setPremiumDownloadModalVisible(true);
                setPremiumDownloadStatus('downloading');
                setPremiumDownloadProgress(0);
                void premiumDownloadServiceRef.current?.startAsync();
              }}
              onPressPausePremiumDownload={() => {
                setPremiumDownloadStatus('paused');
                void premiumDownloadServiceRef.current?.pauseAsync();
              }}
              onPressResumePremiumDownload={() => {
                setPremiumDownloadModalVisible(true);
                setPremiumDownloadStatus('downloading');
                void premiumDownloadServiceRef.current?.resumeAsync();
              }}
              onPressRetryPremiumDownload={() => {
                setPremiumDownloadModalVisible(true);
                setPremiumDownloadStatus('downloading');
                setPremiumDownloadProgress(0);
                void premiumDownloadServiceRef.current?.retryAsync();
              }}
              onPressShowPremiumDownload={() => {
                setPremiumDownloadModalVisible(true);
              }}
              onPressDevResetPremium={() => {
                if (!(__DEV__ || ENABLE_DEV_RESET)) {
                  Alert.alert(
                    'Reset unavailable',
                    'Reset Premium is only enabled in dev builds or when EXPO_PUBLIC_ENABLE_DEV_RESET=true.'
                  );
                  return;
                }
                if (!premiumCode) {
                  Alert.alert('Nothing to reset', 'No premium code is set on this device.');
                  return;
                }

                Alert.alert(
                  'Reset Premium?',
                  'This will remove downloaded premium recipes and switch you back to Free.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: () => {
                        void (async () => {
                          try {
                            const db = uiState.bootstrap.db;

                            premiumDownloadServiceRef.current = null;
                            await deleteLocalPremiumBundleFilesAsync();
                            await db.runAsync('DELETE FROM recipes WHERE isPremium = 1');

                            await resolved.setPremiumDownloadStatusAsync(db, 'not-downloaded');
                            await resolved.setPremiumDownloadProgressAsync(db, null);
                            await resolved.setPremiumBundleUrlAsync(db, null);
                            await resolved.setPremiumBundleVersionAsync(db, null);
                            await resolved.setPremiumBundleSha256Async(db, null);
                            await resolved.setPremiumCodeAsync(db, null);
                            await resolved.setPlanAsync(db, 'free');

                            setPremiumDownloadStatus('not-downloaded');
                            setPremiumDownloadProgress(null);
                            setPremiumBundleUrl(null);
                            setPremiumBundleVersion(null);
                            setPremiumBundleSha256(null);
                            setPremiumCode(null);
                            setPlan('free');

                            setRecipes([]);
                            setPage(1);
                            setInfinitePage(1);
                            setRecipesRefreshNonce((value) => value + 1);

                            Alert.alert('Reset complete', 'Premium has been reset and the app is back on the Free plan.');
                          } catch (error) {
                            const message = error instanceof Error ? error.message : 'Unknown error';
                            Alert.alert('Reset failed', message);
                          }
                        })();
                      },
                    },
                  ]
                );
              }}
            />
          </Animated.View>
        </View>
      </AppBackground>

      <PremiumPaywallModal
        visible={paywallVisible}
        onRequestClose={() => setPaywallVisible(false)}
        onPressEnterCode={() => {
          setPaywallVisible(false);
          setCodeEntryVisible(true);
        }}
      />

        <PremiumCodeEntryModal
          visible={codeEntryVisible}
          onRequestClose={() => setCodeEntryVisible(false)}
          onSubmitCode={async (code) => {
            if (uiState.status !== 'ready') {
              return;
            }

            const redeemed = await resolved.redeemCodeAsync(code);

            await resolved.setPlanAsync(uiState.bootstrap.db, 'premium');
            await resolved.setPremiumCodeAsync(uiState.bootstrap.db, code);
            await resolved.setPremiumBundleUrlAsync(uiState.bootstrap.db, redeemed.bundleUrl);
            await resolved.setPremiumBundleVersionAsync(uiState.bootstrap.db, redeemed.bundleVersion);
            await resolved.setPremiumBundleSha256Async(uiState.bootstrap.db, redeemed.bundleSha256);

            setPlan('premium');
            setPremiumCode(code);
            setPremiumBundleUrl(redeemed.bundleUrl);
            setPremiumBundleVersion(redeemed.bundleVersion);
            setPremiumBundleSha256(redeemed.bundleSha256);

            const installer = resolved.createPremiumBundleInstaller(uiState.bootstrap.db, redeemed.bundleUrl);
            premiumDownloadServiceRef.current = resolved.createPremiumBundleService(uiState.bootstrap.db, installer);

            setCodeEntryVisible(false);
            setRecipes([]);
            setPage(1);
            setInfinitePage(1);
            setRecipesRefreshNonce((value) => value + 1);
          }}
        />

        <PremiumDownloadModal
          visible={premiumDownloadModalVisible}
          status={premiumDownloadStatus}
          progress={premiumDownloadProgress}
          errorMessage={premiumDownloadError}
          onRequestClose={() => setPremiumDownloadModalVisible(false)}
          onPressStart={() => {
            if (uiState.status !== 'ready') {
              return;
            }
            setPremiumDownloadStatus('downloading');
            setPremiumDownloadProgress(0);
            void premiumDownloadServiceRef.current?.startAsync();
          }}
          onPressPause={() => {
            setPremiumDownloadStatus('paused');
            void premiumDownloadServiceRef.current?.pauseAsync();
          }}
          onPressResume={() => {
            setPremiumDownloadStatus('downloading');
            void premiumDownloadServiceRef.current?.resumeAsync();
          }}
          onPressRetry={() => {
            setPremiumDownloadStatus('downloading');
            setPremiumDownloadProgress(0);
            void premiumDownloadServiceRef.current?.retryAsync();
          }}
        />

        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <AppBackground>
        <View style={styles.appContainer}>
          {banner}
          <Animated.View
            entering={reduceMotionEnabled ? undefined : FadeInRight.duration(transitionDuration)}
            exiting={reduceMotionEnabled ? undefined : FadeOutLeft.duration(transitionDuration)}
            style={styles.screenContainer}
          >
            {isInitialRecipesLoading ? (
              <View style={styles.recipesLoadingOverlay} pointerEvents="none" testID="recipes-initial-loading">
                <ActivityIndicator />
                <Text style={styles.recipesLoadingText}>Loading recipes…</Text>
              </View>
            ) : null}
            <DashboardScreen
              title="Forgotten Home Apothecary"
              headerRight={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Menu"
                  onPress={() => setMenuVisible(true)}
                  style={styles.overflowButton}
                  testID="header-overflow-button"
                >
                  <Text style={styles.overflowButtonText}>⋮</Text>
                </Pressable>
              }
              controls={
                <DashboardControlsRow
                  searchInput={searchInput}
                  onChangeSearchInput={(value) => setSearchInput(value)}
                  onClearSearch={() => {
                    setSearchInput('');
                    setPage(1);
                    setInfinitePage(1);
                    setRecipes([]);
                    setSearchQuery('');
                    setFocusResetNonce((value) => value + 1);
                  }}
                  sortMode={sortMode}
                  onChangeSortMode={async (mode) => {
                    setRecipes([]);
                    setPage(1);
                    setInfinitePage(1);
                    setSortMode(mode);
                    setFocusResetNonce((value) => value + 1);
                    await resolved.setSortModeAsync(uiState.bootstrap.db, mode);
                  }}
                  onRandomize={async () => {
                    setRecipes([]);
                    setPage(1);
                    setInfinitePage(1);
                    setSortMode('random');
                    await resolved.setSortModeAsync(uiState.bootstrap.db, 'random');
                    setRandomSeed(resolved.createRandomSeed());
                    setFocusResetNonce((value) => value + 1);
                  }}
                  filterMode={filterMode}
                  onChangeFilterMode={async (mode) => {
                    setRecipes([]);
                    setPage(1);
                    setInfinitePage(1);
                    setFilterMode(mode);
                    setFocusResetNonce((value) => value + 1);
                    await resolved.setFilterModeAsync(uiState.bootstrap.db, mode);
                  }}
                  filterCatalog={filterCatalog}
                  advancedFilters={advancedFilters}
                  onChangeAdvancedFilters={async (next) => {
                    setRecipes([]);
                    setPage(1);
                    setInfinitePage(1);
                    setAdvancedFilters(next);
                    setFocusResetNonce((value) => value + 1);
                    await resolved.setAdvancedFiltersAsync(uiState.bootstrap.db, next);
                  }}
                  onPressClearFilters={async () => {
                    setRecipes([]);
                    setPage(1);
                    setInfinitePage(1);
                    setFilterMode('all');
                    setAdvancedFilters(EMPTY_ADVANCED_FILTERS);
                    setFocusResetNonce((value) => value + 1);
                    await resolved.setFilterModeAsync(uiState.bootstrap.db, 'all');
                    await resolved.setAdvancedFiltersAsync(uiState.bootstrap.db, EMPTY_ADVANCED_FILTERS);
                  }}
                  viewMode={viewMode}
                  onChangeViewMode={async (mode) => {
                    setViewMode(mode);
                    await resolved.setViewModeAsync(uiState.bootstrap.db, mode);
                  }}
                  reduceMotionEnabled={reduceMotionEnabled}
                />
              }
              footer={footer}
              recipes={recipes}
              totalCount={totalCount}
              viewMode={viewMode}
              filterMode={filterMode}
              hasAnyFavorites={hasAnyFavorites}
              onPressShowAllRecipes={async () => {
                if (uiState.status !== 'ready') {
                  return;
                }
                setRecipes([]);
                setPage(1);
                setInfinitePage(1);
                setFilterMode('all');
                setFocusResetNonce((value) => value + 1);
                await resolved.setFilterModeAsync(uiState.bootstrap.db, 'all');
              }}
              onToggleFavorite={async (recipeId, nextIsFavorite) => {
                if (uiState.status !== 'ready') {
                  return;
                }

                try {
                  await resolved.setFavoriteAsync(uiState.bootstrap.db, recipeId, nextIsFavorite);
                  setRecipes((prev) => {
                    if (filterMode === 'favorites' && !nextIsFavorite) {
                      return prev.filter((row) => row.id !== recipeId);
                    }
                    return prev.map((row) => {
                      if (row.id !== recipeId) {
                        return row;
                      }
                      return {
                        ...row,
                        isFavorite: nextIsFavorite ? 1 : 0,
                      };
                    });
                  });
                  setRecipesRefreshNonce((value) => value + 1);
                  const ids = await resolved.listFavoriteIdsAsync(uiState.bootstrap.db);
                  setHasAnyFavorites(ids.length > 0);
                } catch (error) {
                  const message = error instanceof Error ? error.message : String(error);
                  Alert.alert('Failed to update favorite', message);
                }
              }}
              focusResetNonce={focusResetNonce}
              onEndReached={() => {
                if (!infiniteScrollEnabled) {
                  return;
                }
                if (recipes.length >= totalCount) {
                  return;
                }
                if (isLoadingMore) {
                  return;
                }
                setInfinitePage((prev) => prev + 1);
              }}
              reduceMotionEnabled={reduceMotionEnabled}
              closeAsYouTapEnabled={closeAsYouTapEnabled}
              autoScrollEnabled={autoScrollEnabled}
            />
          </Animated.View>
        </View>
      </AppBackground>

      <OverflowMenu
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        onPressSettings={() => {
          setRoute('settings');
        }}
      />

      <PremiumPaywallModal
        visible={paywallVisible}
        onRequestClose={() => setPaywallVisible(false)}
        onPressEnterCode={() => {
          setPaywallVisible(false);
          setCodeEntryVisible(true);
        }}
      />

      <PremiumCodeEntryModal
        visible={codeEntryVisible}
        onRequestClose={() => setCodeEntryVisible(false)}
        onSubmitCode={async (code) => {
          if (uiState.status !== 'ready') {
            return;
          }

          const redeemed = await resolved.redeemCodeAsync(code);

          await resolved.setPlanAsync(uiState.bootstrap.db, 'premium');
          await resolved.setPremiumCodeAsync(uiState.bootstrap.db, code);
          await resolved.setPremiumBundleUrlAsync(uiState.bootstrap.db, redeemed.bundleUrl);
          await resolved.setPremiumBundleVersionAsync(uiState.bootstrap.db, redeemed.bundleVersion);
          await resolved.setPremiumBundleSha256Async(uiState.bootstrap.db, redeemed.bundleSha256);

          setPlan('premium');
          setPremiumCode(code);
          setPremiumBundleUrl(redeemed.bundleUrl);
          setPremiumBundleVersion(redeemed.bundleVersion);
          setPremiumBundleSha256(redeemed.bundleSha256);

          const installer = resolved.createPremiumBundleInstaller(uiState.bootstrap.db, redeemed.bundleUrl);
          premiumDownloadServiceRef.current = resolved.createPremiumBundleService(uiState.bootstrap.db, installer);

          setCodeEntryVisible(false);
          setRecipes([]);
          setPage(1);
          setInfinitePage(1);
          setRecipesRefreshNonce((value) => value + 1);
        }}
      />

      <PremiumDownloadModal
        visible={premiumDownloadModalVisible}
        status={premiumDownloadStatus}
        progress={premiumDownloadProgress}
        onRequestClose={() => setPremiumDownloadModalVisible(false)}
        onPressStart={() => {
          if (uiState.status !== 'ready') {
            return;
          }
          setPremiumDownloadStatus('downloading');
          setPremiumDownloadProgress(0);
          void premiumDownloadServiceRef.current?.startAsync();
        }}
        onPressPause={() => {
          setPremiumDownloadStatus('paused');
          void premiumDownloadServiceRef.current?.pauseAsync();
        }}
        onPressResume={() => {
          setPremiumDownloadStatus('downloading');
          void premiumDownloadServiceRef.current?.resumeAsync();
        }}
        onPressRetry={() => {
          setPremiumDownloadStatus('downloading');
          setPremiumDownloadProgress(0);
          void premiumDownloadServiceRef.current?.retryAsync();
        }}
      />

      <Modal
        transparent
        visible={exitConfirmVisible}
        animationType={reduceMotionEnabled ? 'none' : 'fade'}
        onRequestClose={() => setExitConfirmVisible(false)}
      >
        <ModalBackdrop
          onPress={() => setExitConfirmVisible(false)}
          style={styles.exitBackdrop}
          testID="exit-confirm-backdrop"
        >
          <Pressable style={styles.exitModal} onPress={() => undefined} testID="exit-confirm-modal">
            <ModalCardBackground style={styles.exitModalBackground}>
              <Text style={styles.exitTitle}>Exit the app?</Text>
              <Text style={styles.exitBody}>Are you sure you want to close Apothecary Recipes?</Text>
              <View style={styles.exitActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel exit"
                  onPress={() => setExitConfirmVisible(false)}
                  style={styles.exitSecondaryButton}
                  testID="exit-confirm-no"
                >
                  <Text style={styles.exitSecondaryButtonText}>No</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Exit app"
                  onPress={() => {
                    setExitConfirmVisible(false);
                    BackHandler.exitApp();
                  }}
                  style={styles.exitPrimaryButton}
                  testID="exit-confirm-yes"
                >
                  <Text style={styles.exitPrimaryButtonText}>Yes</Text>
                </Pressable>
              </View>
            </ModalCardBackground>
          </Pressable>
        </ModalBackdrop>
      </Modal>

      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  recipesLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface.paper,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recipesLoadingText: {
    ...theme.typography.bodyMuted,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  premiumBanner: {
    backgroundColor: theme.colors.ink.primary,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 0,
  },
  premiumBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumBannerText: {
    color: theme.colors.ink.onBrand,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  premiumBannerTrack: {
    marginTop: 6,
    height: 4,
    backgroundColor: theme.colors.brand.onInkTrack,
    borderRadius: 999,
    overflow: 'hidden',
  },
  premiumBannerFill: {
    height: 4,
    backgroundColor: theme.colors.brand.primaryStrong,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    gap: 10,
  },
  title: {
    ...theme.typography.title,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    marginTop: 8,
  },
  error: {
    color: theme.colors.status.danger,
  },
  overflowButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowButtonText: {
    fontSize: 20,
    color: theme.colors.ink.primary,
  },
  exitBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  exitModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  exitModalBackground: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  exitTitle: {
    ...theme.typography.sectionTitle,
  },
  exitBody: {
    ...theme.typography.bodyMuted,
  },
  exitActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  exitPrimaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  exitPrimaryButtonText: {
    color: theme.colors.ink.onBrand,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  exitSecondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  exitSecondaryButtonText: {
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
});
