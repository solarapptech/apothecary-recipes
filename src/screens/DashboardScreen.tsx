import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';

import { CompactRecipeRow } from '../components/CompactRecipeRow';
import { ListBigRecipeRow } from '../components/ListBigRecipeRow';
import { RecipeGridTile } from '../components/RecipeGridTile';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RecipeRow } from '../repositories/recipesRepository';
import type { ViewMode } from '../types/viewMode';

type DashboardScreenProps = {
  title: string;
  headerRight: ReactNode;
  controls: ReactNode;
  footer?: ReactNode;
  recipes: RecipeRow[];
  totalCount: number;
  viewMode: ViewMode;
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
  onEndReached,
  reduceMotionEnabled = false,
  closeAsYouTapEnabled = false,
  autoScrollEnabled = true,
}: DashboardScreenProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [listDetailsIds, setListDetailsIds] = useState<Set<number>>(() => new Set());
  const [listBigExpandedIds, setListBigExpandedIds] = useState<Set<number>>(() => new Set());
  const { width } = useWindowDimensions();
  const listRef = useRef<FlashList<RecipeRow>>(null);
  const currentScrollY = useRef(0);
  const restoreScrollY = useRef(0);
  const listBigRestoreScrollYById = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (viewMode !== 'list' && viewMode !== 'grid') {
      setExpandedIds(new Set());
    }
    if (viewMode !== 'list') {
      setListDetailsIds(new Set());
    }
    if (viewMode !== 'list-big') {
      setListBigExpandedIds(new Set());
      listBigRestoreScrollYById.current.clear();
    }
  }, [viewMode]);

  const minTileWidth = 180;
  const gridNumColumns = Math.max(2, Math.floor(width / minTileWidth));

  const estimatedItemSize = viewMode === 'grid' ? 200 : viewMode === 'list-big' ? 220 : 100;

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
          next.clear();
          setListDetailsIds(new Set());
        }
        next.add(recipeId);
      }
      return next;
    });
  };

  const handleScroll = (event: any) => {
    currentScrollY.current = event.nativeEvent.contentOffset.y;
  };

  const handleShowDetails = () => {
    restoreScrollY.current = currentScrollY.current;
  };

  const handleShowLess = () => {
    if (!autoScrollEnabled) {
      return;
    }
    // Small timeout to allow layout animation to start/finish collapsing before scrolling
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: restoreScrollY.current, animated: true });
    }, 50);
  };

  const handleListDetailsExpandedChange = (recipeId: number, nextDetailsMode: boolean) => {
    if (nextDetailsMode) {
      handleShowDetails();
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
    handleShowLess();
  };

  const listKey = viewMode === 'grid' ? `grid-${gridNumColumns}` : viewMode;

  const animDuration = motionDurationMs(reduceMotionEnabled, 200);

  return (
    <ScreenFrame title={title} headerRight={headerRight} controls={controls} footer={footer}>
      <LayoutAnimationConfig skipEntering skipExiting>
      <FlashList
        ref={listRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        key={listKey}
        data={recipes}
        estimatedItemSize={estimatedItemSize}
        numColumns={viewMode === 'grid' ? gridNumColumns : 1}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        keyExtractor={(item: RecipeRow) => String(item.id)}
        extraData={viewMode === 'list-big' ? listBigExpandedIds : { expandedIds, listDetailsIds }}
        renderItem={({ item }: { item: RecipeRow }) => {
          if (viewMode === 'grid') {
            const isExpanded = expandedIds.has(item.id);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle recipe"
                style={styles.gridItem}
                onPress={() => toggleExpanded(item.id)}
                testID={`dashboard-grid-recipe-toggle-${item.id}`}
              >
                <RecipeGridTile
                  recipeId={item.id}
                  title={item.title}
                  difficultyScore={item.difficultyScore}
                  preparationTime={item.preparationTime}
                  description={item.description}
                  timePeriod={item.timePeriod}
                  warning={item.warning}
                  region={item.region}
                  ingredients={item.ingredients}
                  detailedMeasurements={item.detailedMeasurements}
                  preparationSteps={item.preparationSteps}
                  usage={item.usage}
                  historicalContext={item.historicalContext}
                  scientificEvidence={item.scientificEvidence}
                  expanded={isExpanded}
                  reduceMotionEnabled={reduceMotionEnabled}
                />
              </Pressable>
            );
          }

          if (viewMode === 'list-big') {
            const isExpanded = listBigExpandedIds.has(item.id);
            return (
              <ListBigRecipeRow
                recipeId={item.id}
                title={item.title}
                difficultyScore={item.difficultyScore}
                preparationTime={item.preparationTime}
                description={item.description}
                timePeriod={item.timePeriod}
                warning={item.warning}
                region={item.region}
                ingredients={item.ingredients}
                detailedMeasurements={item.detailedMeasurements}
                preparationSteps={item.preparationSteps}
                usage={item.usage}
                historicalContext={item.historicalContext}
                scientificEvidence={item.scientificEvidence}
                reduceMotionEnabled={reduceMotionEnabled}
                expanded={isExpanded}
                onRequestSetExpanded={(next) => {
                  setListBigExpandedIds((prev) => {
                    const updated = new Set(prev);
                    if (!next) {
                      updated.delete(item.id);

                      const restoreY = listBigRestoreScrollYById.current.get(item.id);
                      listBigRestoreScrollYById.current.delete(item.id);
                      if (autoScrollEnabled && typeof restoreY === 'number') {
                        setTimeout(() => {
                          listRef.current?.scrollToOffset({ offset: restoreY, animated: true });
                        }, 50);
                      }

                      return updated;
                    }

                    if (autoScrollEnabled) {
                      listBigRestoreScrollYById.current.set(item.id, currentScrollY.current);
                    }

                    if (closeAsYouTapEnabled) {
                      return new Set([item.id]);
                    }

                    updated.add(item.id);
                    return updated;
                  });
                }}
              />
            );
          }

          const isExpanded = expandedIds.has(item.id);
          const isDetailsMode = listDetailsIds.has(item.id);

          if (isExpanded) {
            return (
              <ListBigRecipeRow
                recipeId={item.id}
                title={item.title}
                difficultyScore={item.difficultyScore}
                preparationTime={item.preparationTime}
                description={item.description}
                timePeriod={item.timePeriod}
                warning={item.warning}
                region={item.region}
                ingredients={item.ingredients}
                detailedMeasurements={item.detailedMeasurements}
                preparationSteps={item.preparationSteps}
                usage={item.usage}
                historicalContext={item.historicalContext}
                scientificEvidence={item.scientificEvidence}
                reduceMotionEnabled={reduceMotionEnabled}
                expanded={isDetailsMode}
                onRequestSetExpanded={(next) => handleListDetailsExpandedChange(item.id, next)}
                showMinimizeButton={true}
                onPressMinimize={() => {
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
                }}
              />
            );
          }

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Expand recipe"
              onPress={() => toggleExpanded(item.id)}
              testID={`dashboard-recipe-toggle-${item.id}`}
            >
              <CompactRecipeRow
                recipeId={item.id}
                title={item.title}
                difficultyScore={item.difficultyScore}
                preparationTime={item.preparationTime}
              />
            </Pressable>
          );
        }}
      />
      </LayoutAnimationConfig>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
  },
});
