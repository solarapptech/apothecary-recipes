import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  Layout,
  LayoutAnimationConfig,
} from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';
import { CompactRecipeRow } from '../components/CompactRecipeRow';
import { ListBigRecipeRow } from '../components/ListBigRecipeRow';
import { WavePressable } from '../components/WavePressable';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RecipeRow } from '../repositories/recipesRepository';
import type { FilterMode } from '../types/filterMode';
import type { ViewMode } from '../types/viewMode';

type DashboardScreenProps = {
  title: string;
  headerRight: ReactNode;
  controls: ReactNode;
  footer?: ReactNode;
  recipes: RecipeRow[];
  totalCount: number;
  viewMode: ViewMode;
  filterMode: FilterMode;
  hasAnyFavorites?: boolean;
  onPressShowAllRecipes?: () => void;
  onToggleFavorite?: (recipeId: number, nextIsFavorite: boolean) => void;
  focusResetNonce?: number;
  onEndReached?: () => void;
  reduceMotionEnabled?: boolean;
  closeAsYouTapEnabled?: boolean;
  autoScrollEnabled?: boolean;
};

export function DashboardScreen({
  title,
  headerRight,
  controls,
  footer,
  recipes,
  totalCount,
  viewMode,
  filterMode,
  hasAnyFavorites = false,
  onPressShowAllRecipes,
  onToggleFavorite,
  focusResetNonce = 0,
  onEndReached,
  reduceMotionEnabled = false,
  closeAsYouTapEnabled = false,
  autoScrollEnabled = true,
}: DashboardScreenProps) {
  const [didMount, setDidMount] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [listDetailsIds, setListDetailsIds] = useState<Set<number>>(() => new Set());
  const [listBigExpandedIds, setListBigExpandedIds] = useState<Set<number>>(() => new Set());
  const listRef = useRef<FlashList<RecipeRow>>(null);
  const pendingScrollToRecipeId = useRef<number | null>(null);
  const pendingScrollTimeouts = useRef<{ initial?: ReturnType<typeof setTimeout>; correction?: ReturnType<typeof setTimeout> }>({});
  const isUserScrolling = useRef(false);
  const didUserDragSinceLastMomentum = useRef(false);
  const currentScrollY = useRef(0);
  const collapseAnimDuration = motionDurationMs(reduceMotionEnabled, 300);

  const cancelPendingAutoScroll = () => {
    pendingScrollToRecipeId.current = null;
    const { initial, correction } = pendingScrollTimeouts.current;
    if (initial) {
      clearTimeout(initial);
    }
    if (correction) {
      clearTimeout(correction);
    }
    pendingScrollTimeouts.current = {};
  };

  useEffect(() => {
    setDidMount(true);

    return () => {
      const { initial, correction } = pendingScrollTimeouts.current;
      if (initial) {
        clearTimeout(initial);
      }
      if (correction) {
        clearTimeout(correction);
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'list') {
      setExpandedIds(new Set());
    }
    if (viewMode !== 'list') {
      setListDetailsIds(new Set());
    }
    if (viewMode !== 'list-big') {
      setListBigExpandedIds(new Set());
    }
  }, [viewMode]);

  useEffect(() => {
    setExpandedIds(new Set());
    setListDetailsIds(new Set());
    setListBigExpandedIds(new Set());
    pendingScrollToRecipeId.current = null;
  }, [focusResetNonce]);

  useEffect(() => {
    if (!autoScrollEnabled) {
      return;
    }

    if (isUserScrolling.current) {
      return;
    }

    const recipeId = pendingScrollToRecipeId.current;
    if (typeof recipeId !== 'number') {
      return;
    }

    if (viewMode !== 'list' && viewMode !== 'list-big') {
      pendingScrollToRecipeId.current = null;
      return;
    }

    if (viewMode === 'list' && !expandedIds.has(recipeId)) {
      return;
    }

    const index = recipes.findIndex((recipe) => recipe.id === recipeId);
    if (index < 0) {
      pendingScrollToRecipeId.current = null;
      return;
    }

    pendingScrollToRecipeId.current = null;

    const { initial: existingInitial, correction: existingCorrection } = pendingScrollTimeouts.current;
    if (existingInitial) {
      clearTimeout(existingInitial);
    }
    if (existingCorrection) {
      clearTimeout(existingCorrection);
    }

    // The list reflows with a Layout animation when items expand/collapse. If we scroll too early
    // (mid-animation), the continued reflow can shift content after the scroll and make the target
    // item appear mispositioned. We do a quick scroll, then a correction scroll after layout settles.
    const isListBig = viewMode === 'list-big';
    const viewPosition = isListBig ? 0 : 0.1;
    const listBigViewOffset = 12;
    const scrollArgs = isListBig
      ? { index, viewPosition, viewOffset: listBigViewOffset }
      : { index, viewPosition };
    const initialDelayMs = isListBig ? 120 : 0;
    const listBigCorrectionDelayMs = (reduceMotionEnabled ? 0 : collapseAnimDuration) + 220;
    // Compact list: aim to scroll promptly, but still wait a bit for the layout animation so
    // FlashList measurements have a chance to settle.
    const compactScrollDelayMs = (reduceMotionEnabled ? 0 : Math.min(collapseAnimDuration, 80)) + 10;

    // List-big: keep the two-stage scroll. Large height changes can temporarily confuse FlashList
    // measurements, so the correction helps keep the focused card in a stable spot.
    if (isListBig) {
      pendingScrollTimeouts.current.initial = setTimeout(() => {
        listRef.current?.scrollToIndex?.({ ...scrollArgs, animated: !reduceMotionEnabled });
      }, initialDelayMs);

      pendingScrollTimeouts.current.correction = setTimeout(() => {
        listRef.current?.scrollToIndex?.({ ...scrollArgs, animated: false });
      }, listBigCorrectionDelayMs);
      return;
    }

    // Compact list: do a single scroll after the layout animation settles.
    // This avoids the visible "jump" caused by an initial scroll followed by a correction.
    pendingScrollTimeouts.current.initial = setTimeout(() => {
      listRef.current?.scrollToIndex?.({ ...scrollArgs, animated: !reduceMotionEnabled });
    }, compactScrollDelayMs);
  }, [
    autoScrollEnabled,
    collapseAnimDuration,
    expandedIds,
    listBigExpandedIds,
    listDetailsIds,
    recipes,
    reduceMotionEnabled,
    viewMode,
  ]);

  const estimatedItemSize = viewMode === 'list-big' ? 220 : 100;

  const toggleExpanded = (recipeId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
        setListDetailsIds((prevDetails) => {
          if (!prevDetails.has(recipeId)) {
            return prevDetails;
          }
          const updated = new Set(prevDetails);
          updated.delete(recipeId);
          return updated;
        });
      } else {
        if (closeAsYouTapEnabled) {
          if (next.size > 0) {
            pendingScrollToRecipeId.current = recipeId;
          }
          next.clear();
          setListDetailsIds(new Set());
        }

        if (autoScrollEnabled) {
          pendingScrollToRecipeId.current = recipeId;
        }
        next.add(recipeId);
      }
      return next;
    });
  };

  const handleScroll = (event: any) => {
    currentScrollY.current = event.nativeEvent.contentOffset.y;
  };

  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
    didUserDragSinceLastMomentum.current = true;
    cancelPendingAutoScroll();
  };

  const handleScrollEnd = () => {
    isUserScrolling.current = false;
  };

  const handleMomentumScrollBegin = () => {
    // Momentum can be triggered by programmatic scrollToIndex (animated). Only treat it as
    // user scrolling if it follows an actual user drag.
    if (!didUserDragSinceLastMomentum.current) {
      return;
    }
    isUserScrolling.current = true;
    cancelPendingAutoScroll();
  };

  const handleMomentumScrollEnd = () => {
    if (!didUserDragSinceLastMomentum.current) {
      return;
    }
    didUserDragSinceLastMomentum.current = false;
    isUserScrolling.current = false;
  };

  const handleListDetailsExpandedChange = (
    recipeId: number,
    nextDetailsMode: boolean,
    shouldRestoreScrollOnCollapse = true
  ) => {
    if (nextDetailsMode) {
      setListDetailsIds((prev) => {
        const updated = new Set(prev);
        updated.add(recipeId);
        return updated;
      });
      return;
    }

    setListDetailsIds((prev) => {
      if (!prev.has(recipeId)) {
        return prev;
      }
      const updated = new Set(prev);
      updated.delete(recipeId);
      return updated;
    });
    if (autoScrollEnabled) {
      pendingScrollToRecipeId.current = recipeId;
    }
  };

  const handleListBigDetailsExpandedChange = (recipeId: number, nextDetailsMode: boolean) => {
    setListBigExpandedIds((prev) => {
      const updated = new Set(prev);
      if (!nextDetailsMode) {
        updated.delete(recipeId);

        if (autoScrollEnabled) {
          pendingScrollToRecipeId.current = recipeId;
        }

        return updated;
      }

      if (closeAsYouTapEnabled) {
        if (autoScrollEnabled) {
          pendingScrollToRecipeId.current = recipeId;
        }
        return new Set([recipeId]);
      }

      if (autoScrollEnabled) {
        pendingScrollToRecipeId.current = recipeId;
      }

      updated.add(recipeId);
      return updated;
    });
  };

  const listKey = viewMode;

  const showFavoritesEmptyState = filterMode === 'favorites' && !hasAnyFavorites;

  return (
    <ScreenFrame title={title} headerRight={headerRight} controls={controls} footer={footer}>
      <LayoutAnimationConfig skipEntering={!didMount} skipExiting={viewMode !== 'list'}>
      <FlashList
        ref={listRef}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        key={listKey}
        data={recipes}
        contentContainerStyle={
          viewMode === 'list-big'
            ? styles.listBigContentContainer
            : viewMode === 'list' && expandedIds.size > 0
              ? styles.listContentContainerWithExpanded
              : undefined
        }
        estimatedItemSize={estimatedItemSize}
        numColumns={1}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        keyExtractor={(item: RecipeRow) => String(item.id)}
        extraData={
          viewMode === 'list-big'
            ? listBigExpandedIds
            : { expandedIds, listDetailsIds }
        }
        ListEmptyComponent={
          showFavoritesEmptyState
            ? () => (
                <View style={styles.emptyState} testID="favorites-empty-state">
                  <Text style={styles.emptyStateTitle}>No favorites yet</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Show all recipes"
                    onPress={() => onPressShowAllRecipes?.()}
                    testID="favorites-empty-state-show-all"
                  >
                    <Text style={styles.emptyStateLink}>Show all recipes</Text>
                  </Pressable>
                </View>
              )
            : null
        }
        renderItem={({ item }: { item: RecipeRow }) => {
          if (viewMode === 'list-big') {
            const isExpanded = listBigExpandedIds.has(item.id);
            const hasAnyExpandedBig = listBigExpandedIds.size > 0;
            const isGrayedOutBig = hasAnyExpandedBig && !isExpanded;
            return (
              <Animated.View
                key={`list-big-cell-${item.id}`}
                layout={reduceMotionEnabled ? undefined : Layout.duration(collapseAnimDuration)}
              >
              <ListBigRecipeRow
                recipeId={item.id}
                title={item.title}
                difficultyScore={item.difficultyScore}
                preparationTime={item.preparationTime}
                description={item.description}
                timePeriod={item.timePeriod}
                warning={item.warning}
                region={item.region}
                alternativeNames={item.alternativeNames}
                usedFor={item.usedFor}
                ingredients={item.ingredients}
                detailedMeasurements={item.detailedMeasurements}
                preparationSteps={item.preparationSteps}
                usage={item.usage}
                historicalContext={item.historicalContext}
                scientificEvidence={item.scientificEvidence}
                isFavorite={item.isFavorite === 1}
                onPressFavorite={() => onToggleFavorite?.(item.id, item.isFavorite !== 1)}
                reduceMotionEnabled={reduceMotionEnabled}
                dimmed={isGrayedOutBig}
                expanded={isExpanded}
                showDetailsButton={true}
                allowDetailsToggle={false}
                onPress={() => {
                  handleListBigDetailsExpandedChange(item.id, !isExpanded);
                }}
                onRequestSetExpanded={(next) => handleListBigDetailsExpandedChange(item.id, next)}
              />
              </Animated.View>
            );
          }

          const isExpanded = expandedIds.has(item.id);
          const isDetailsMode = listDetailsIds.has(item.id);
          const hasAnyExpanded = expandedIds.size > 0;
          const isGrayedOut = hasAnyExpanded && !isExpanded;

          return (
            <Animated.View
              key={`list-cell-${item.id}`}
              layout={reduceMotionEnabled ? undefined : Layout.duration(collapseAnimDuration)}
              style={isGrayedOut ? { opacity: 0.4 } : undefined}
            >
              {isExpanded ? (
                <Animated.View
                  key={`list-expanded-${item.id}`}
                >
                  <ListBigRecipeRow
                    recipeId={item.id}
                    title={item.title}
                    difficultyScore={item.difficultyScore}
                    preparationTime={item.preparationTime}
                    description={item.description}
                    timePeriod={item.timePeriod}
                    warning={item.warning}
                    region={item.region}
                    alternativeNames={item.alternativeNames}
                    usedFor={item.usedFor}
                    ingredients={item.ingredients}
                    detailedMeasurements={item.detailedMeasurements}
                    preparationSteps={item.preparationSteps}
                    usage={item.usage}
                    historicalContext={item.historicalContext}
                    scientificEvidence={item.scientificEvidence}
                    isFavorite={item.isFavorite === 1}
                    onPressFavorite={() => onToggleFavorite?.(item.id, item.isFavorite !== 1)}
                    reduceMotionEnabled={reduceMotionEnabled}
                    dimmed={isGrayedOut}
                    expanded={isDetailsMode}
                    onRequestSetExpanded={(next) => handleListDetailsExpandedChange(item.id, next)}
                    allowDetailsToggle={false}
                    onPress={() => {
                      // In list (compact) view, tapping the expanded card should open details.
                      // Once details are already visible, ListBigRecipeRow ignores card-body presses.
                      if (!isDetailsMode) {
                        handleListDetailsExpandedChange(item.id, true, false);
                      }
                    }}
                    showDetailsButton={true}
                    showMinimizeButton={true}
                    onPressMinimize={() => {
                      const collapseToCompactNow = () => {
                        setExpandedIds((prev) => {
                          if (!prev.has(item.id)) {
                            return prev;
                          }
                          const updated = new Set(prev);
                          updated.delete(item.id);
                          return updated;
                        });
                        setListDetailsIds((prev) => {
                          if (!prev.has(item.id)) {
                            return prev;
                          }
                          const updated = new Set(prev);
                          updated.delete(item.id);
                          return updated;
                        });
                      };

                      // Two-stage behavior:
                      // - If details are open, first tap folds back to summary only.
                      // - If already in summary, second tap collapses to compact.
                      if (isDetailsMode) {
                        handleListDetailsExpandedChange(item.id, false);
                        return;
                      }

                      collapseToCompactNow();
                    }}
                  />
                </Animated.View>
              ) : (
                <Animated.View
                  key={`list-compact-${item.id}`}
                >
                  <WavePressable
                    accessibilityRole="button"
                    accessibilityLabel="Expand recipe"
                    onPress={() => toggleExpanded(item.id)}
                    testID={`dashboard-recipe-toggle-${item.id}`}
                    reduceMotionEnabled={reduceMotionEnabled}
                  >
                    <CompactRecipeRow
                      recipeId={item.id}
                      title={item.title}
                      difficultyScore={item.difficultyScore}
                      preparationTime={item.preparationTime}
                      isFavorite={item.isFavorite === 1}
                      onPressFavorite={() => onToggleFavorite?.(item.id, item.isFavorite !== 1)}
                      dimmed={isGrayedOut}
                    />
                  </WavePressable>
                </Animated.View>
              )}
            </Animated.View>
          );
        }}
      />
      </LayoutAnimationConfig>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  listBigContentContainer: {
    paddingTop: 14,
  },
  listContentContainerWithExpanded: {
    paddingTop: 14,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#111',
  },
  emptyStateLink: {
    fontSize: 14,
    color: '#111',
    textDecorationLine: 'underline',
  },
});
