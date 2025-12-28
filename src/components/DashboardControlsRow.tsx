import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';

import { theme } from '../ui/theme';

import type { SortMode } from '../types/sortMode';
import type { ViewMode } from '../types/viewMode';

type DashboardControlsRowProps = {
  searchInput: string;
  onChangeSearchInput: (value: string) => void;
  onClearSearch: () => void;
  sortMode: SortMode;
  onChangeSortMode: (mode: SortMode) => void;
  onRandomize: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  reduceMotionEnabled?: boolean;
};

function sortLabel(mode: SortMode): string {
  if (mode === 'random') {
    return 'Random';
  }
  if (mode === 'az') {
    return 'A–Z';
  }
  return 'Z–A';
}

export function DashboardControlsRow({
  searchInput,
  onChangeSearchInput,
  onClearSearch,
  sortMode,
  onChangeSortMode,
  onRandomize,
  viewMode,
  onChangeViewMode,
  reduceMotionEnabled = false,
}: DashboardControlsRowProps) {
  const searchInputRef = useRef<TextInput | null>(null);
  const sortButtonRef = useRef<View | null>(null);

  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const hasSearchText = searchInput.trim().length > 0;

  const viewModeIndex = viewMode === 'list' ? 0 : viewMode === 'list-big' ? 1 : 2;
  const pillPosition = useSharedValue(viewModeIndex);

  useEffect(() => {
    const targetIndex = viewMode === 'list' ? 0 : viewMode === 'list-big' ? 1 : 2;
    if (reduceMotionEnabled) {
      pillPosition.value = targetIndex;
    } else {
      const duration = motionDurationMs(reduceMotionEnabled, 200);
      pillPosition.value = withTiming(targetIndex, { duration });
    }
  }, [viewMode, reduceMotionEnabled, pillPosition]);

  const pillStyle = useAnimatedStyle(() => {
    const translateX = pillPosition.value * 52;
    return {
      transform: [{ translateX }],
    };
  });

  const handleRandomize = useCallback(async () => {
    if (isRandomizing) {
      return;
    }
    setIsRandomizing(true);
    try {
      await onRandomize();
    } finally {
      setIsRandomizing(false);
    }
  }, [isRandomizing, onRandomize]);

  const handleSortPress = useCallback(() => {
    setSortMenuVisible(true);

    const node = sortButtonRef.current as any;
    setTimeout(() => {
      if (typeof node?.measureInWindow === 'function') {
        node.measureInWindow((x: number, y: number, width: number, height: number) => {
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(width) && Number.isFinite(height)) {
            setSortMenuAnchor({ x, y, width, height });
          }
        });
        return;
      }

      if (typeof node?.measure === 'function') {
        node.measure(
          (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
            if (Number.isFinite(pageX) && Number.isFinite(pageY) && Number.isFinite(width) && Number.isFinite(height)) {
              setSortMenuAnchor({ x: pageX, y: pageY, width, height });
            }
          }
        );
      }
    }, 0);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <TextInput
            ref={(node) => {
              searchInputRef.current = node;
            }}
            value={searchInput}
            onChangeText={onChangeSearchInput}
            placeholder="Search"
            accessibilityLabel="Search"
            style={styles.searchInput}
            testID="controls-search-input"
          />
          {hasSearchText ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => {
                onClearSearch();
                searchInputRef.current?.focus();
              }}
              style={styles.searchClearButton}
              testID="controls-search-clear"
            >
              <Text style={styles.searchClearText}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          ref={(node) => {
            sortButtonRef.current = node;
          }}
          accessibilityRole="button"
          accessibilityLabel="Sort"
          onPress={handleSortPress}
          style={styles.sortButton}
          testID="controls-sort"
        >
          <Text style={styles.sortButtonText}>⇅ {sortLabel(sortMode)}</Text>
          {sortMode === 'random' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Randomize"
              disabled={isRandomizing}
              onPress={(e) => {
                (e as any)?.stopPropagation?.();
                void handleRandomize();
              }}
              style={[styles.randomizeIconInline, isRandomizing ? styles.randomizeDisabled : null]}
              testID="controls-randomize"
            >
              <Text style={styles.iconButtonText}>⟳</Text>
            </Pressable>
          ) : null}
        </Pressable>

        <View style={styles.viewToggleGroup}>
          <Animated.View style={[styles.pillBackground, pillStyle]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="List view"
            onPress={() => onChangeViewMode('list')}
            style={styles.toggle}
            testID="controls-view-list"
          >
            <Text style={[styles.toggleIcon, viewMode === 'list' ? styles.toggleTextActive : null]}>☰</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Big list view"
            onPress={() => onChangeViewMode('list-big')}
            style={styles.toggle}
            testID="controls-view-list-big"
          >
            <Text style={[styles.toggleIcon, styles.toggleIconLarger, viewMode === 'list-big' ? styles.toggleTextActive : null]}>▤</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Grid view"
            onPress={() => onChangeViewMode('grid')}
            style={styles.toggle}
            testID="controls-view-grid"
          >
            <Text style={[styles.toggleIcon, styles.toggleIconLarger, viewMode === 'grid' ? styles.toggleTextActive : null]}>▦</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={sortMenuVisible}
        animationType="fade"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setSortMenuVisible(false)}
          testID="sort-menu-backdrop"
        >
          <Pressable
            style={[
              styles.menu,
              sortMenuAnchor
                ? {
                    top: sortMenuAnchor.y + sortMenuAnchor.height + 8,
                    left: sortMenuAnchor.x,
                    minWidth: sortMenuAnchor.width,
                  }
                : null,
            ]}
            onPress={() => undefined}
          >
            {(['random', 'az', 'za'] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityLabel={`Sort ${sortLabel(mode)}`}
                onPress={() => {
                  if (mode === sortMode) {
                    return;
                  }
                  onChangeSortMode(mode);
                }}
                style={[
                  styles.menuItem,
                  mode === sortMode ? styles.menuItemSelected : null
                ]}
                testID={`sort-menu-item-${mode}`}
              >
                <Text style={[
                  styles.menuItemText,
                  mode === sortMode ? styles.menuItemTextSelected : null
                ]}>{sortLabel(mode)}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    minHeight: 40,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    flexWrap: 'nowrap',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.paperStrong,
  },
  searchClearButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    fontSize: 18,
    color: theme.colors.ink.subtle,
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 10,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  iconButtonText: {
    fontSize: 16,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  sortButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  randomizeIconInline: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: theme.colors.surface.popover,
  },
  randomizeDisabled: {
    opacity: 0.4,
  },
  sortButtonText: {
    fontSize: 13,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  viewToggleGroup: {
    position: 'relative',
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.paperStrong,
  },
  pillBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 52,
    backgroundColor: theme.colors.brand.primary,
    zIndex: 0,
  },
  toggle: {
    minHeight: 40,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.medium,
  },
  toggleIcon: {
    fontSize: 16,
    color: theme.colors.ink.primary,
    width: 20,
    textAlign: 'center',
  },
  toggleIconLarger: {
    fontSize: 24,
  },
  toggleTextActive: {
    color: theme.colors.ink.onBrand,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.backdrop.dim,
  },
  menu: {
    position: 'absolute',
    top: 130,
    left: 16,
    backgroundColor: theme.colors.surface.paperStrong,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemSelected: {
    backgroundColor: theme.colors.surface.popover,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.regular,
  },
  menuItemTextSelected: {
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
});
