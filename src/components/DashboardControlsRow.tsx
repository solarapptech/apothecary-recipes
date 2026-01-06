import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { ModalCardBackground } from './ModalCardBackground';
import { ModalBackdrop } from './ModalBackdrop';

import { motionDurationMs } from '../app/motionPolicy';

import { theme } from '../ui/theme';

import { EMPTY_ADVANCED_FILTERS, type AdvancedFilters } from '../types/advancedFilters';
import type { FilterMode } from '../types/filterMode';
import type { SortMode } from '../types/sortMode';
import type { ViewMode } from '../types/viewMode';

import type { FilterCatalog } from '../repositories/filterCatalogRepository';

type DashboardControlsRowProps = {
  searchInput: string;
  onChangeSearchInput: (value: string) => void;
  onClearSearch: () => void;
  sortMode: SortMode;
  onChangeSortMode: (mode: SortMode) => void;
  onRandomize: () => void;
  filterMode: FilterMode;
  onChangeFilterMode: (mode: FilterMode) => void;
  filterCatalog?: FilterCatalog;
  advancedFilters?: AdvancedFilters;
  onChangeAdvancedFilters?: (filters: AdvancedFilters) => void;
  onPressClearFilters?: () => void;
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

function filterLabel(mode: FilterMode): string {
  return mode === 'favorites' ? 'Favorites' : 'All Recipes';
}

function toggleValue(values: string[], value: string): string[] {
  const exists = values.includes(value);
  if (exists) {
    return values.filter((item) => item !== value);
  }
  return [...values, value];
}

function isAnyAdvancedFilterActive(filters: AdvancedFilters | null | undefined): boolean {
  if (!filters) {
    return false;
  }
  return filters.productTypes.length > 0 || filters.conditions.length > 0 || filters.ingredients.length > 0;
}

function FilterIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M3 5h18l-7 8v6l-4 3v-9L3 5z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DashboardControlsRow({
  searchInput,
  onChangeSearchInput,
  onClearSearch,
  sortMode,
  onChangeSortMode,
  onRandomize,
  filterMode,
  onChangeFilterMode,
  filterCatalog,
  advancedFilters,
  onChangeAdvancedFilters,
  onPressClearFilters,
  viewMode,
  onChangeViewMode,
  reduceMotionEnabled = false,
}: DashboardControlsRowProps) {
  const window = useWindowDimensions();
  const searchInputRef = useRef<TextInput | null>(null);
  const sortButtonRef = useRef<View | null>(null);
  const filterButtonRef = useRef<View | null>(null);

  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const resolvedCatalog: FilterCatalog = filterCatalog ?? {
    productTypes: [],
    conditions: [],
    ingredients: [],
  };
  const resolvedAdvancedFilters: AdvancedFilters = advancedFilters ?? EMPTY_ADVANCED_FILTERS;

  const [ingredientSearch, setIngredientSearch] = useState('');
  const filteredIngredients = useMemo(() => {
    const query = ingredientSearch.trim().toLowerCase();
    if (!query) {
      return resolvedCatalog.ingredients;
    }
    return resolvedCatalog.ingredients.filter((item) => item.toLowerCase().includes(query));
  }, [ingredientSearch, resolvedCatalog.ingredients]);

  const [expandedSection, setExpandedSection] = useState<'productTypes' | 'conditions' | 'ingredients' | null>(null);
  const productTypesProgress = useSharedValue(0);
  const conditionsProgress = useSharedValue(0);
  const ingredientsProgress = useSharedValue(0);

  useEffect(() => {
    const toValue = (open: boolean) => (open ? 1 : 0);
    const duration = motionDurationMs(reduceMotionEnabled, 180);

    const product = toValue(expandedSection === 'productTypes');
    const conditions = toValue(expandedSection === 'conditions');
    const ingredients = toValue(expandedSection === 'ingredients');

    productTypesProgress.value = reduceMotionEnabled ? product : withTiming(product, { duration });
    conditionsProgress.value = reduceMotionEnabled ? conditions : withTiming(conditions, { duration });
    ingredientsProgress.value = reduceMotionEnabled ? ingredients : withTiming(ingredients, { duration });
  }, [conditionsProgress, expandedSection, ingredientsProgress, productTypesProgress, reduceMotionEnabled]);

  const productTypesStyle = useAnimatedStyle(() => {
    return {
      maxHeight: 280 * productTypesProgress.value,
      opacity: productTypesProgress.value,
    };
  });
  const conditionsStyle = useAnimatedStyle(() => {
    return {
      maxHeight: 280 * conditionsProgress.value,
      opacity: conditionsProgress.value,
    };
  });
  const ingredientsStyle = useAnimatedStyle(() => {
    return {
      maxHeight: 360 * ingredientsProgress.value,
      opacity: ingredientsProgress.value,
    };
  });

  const anyFiltersActive = filterMode === 'favorites' || isAnyAdvancedFilterActive(resolvedAdvancedFilters);

  const toggleSection = (section: 'productTypes' | 'conditions' | 'ingredients') => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const updateAdvancedFilters = (next: AdvancedFilters) => {
    onChangeAdvancedFilters?.(next);
  };

  const renderMultiSelectRow = (input: {
    label: string;
    selected: boolean;
    onPress: () => void;
    testID: string;
  }) => {
    return (
      <Pressable
        key={input.label}
        accessibilityRole="button"
        accessibilityLabel={input.label}
        onPress={input.onPress}
        style={[styles.menuItem, input.selected ? styles.menuItemSelected : null, styles.filterOptionRow]}
        testID={input.testID}
      >
        <Text style={[styles.menuItemText, input.selected ? styles.menuItemTextSelected : null, styles.filterOptionText]}>
          {input.label}
        </Text>
        <Text style={[styles.checkmark, input.selected ? styles.checkmarkSelected : null]}>{input.selected ? '✓' : ''}</Text>
      </Pressable>
    );
  };

  const getMenuLayout = useCallback(
    (anchor: { x: number; y: number; width: number; height: number } | null) => {
      if (!anchor) {
        return null;
      }

      const gutter = 8;
      const minWidth = Math.max(180, anchor.width);
      const maxWidth = Math.max(120, window.width - gutter * 2);
      const width = Math.min(minWidth, maxWidth);

      // Prefer showing below the anchor; if there's not enough space, flip above.
      const belowTop = anchor.y + anchor.height + gutter;
      const belowMaxHeight = window.height - belowTop - gutter;
      const aboveMaxHeight = anchor.y - gutter * 2;

      const canShowBelow = belowMaxHeight >= 160;
      const maxHeight = Math.max(140, canShowBelow ? belowMaxHeight : aboveMaxHeight);

      const left = Math.min(Math.max(gutter, anchor.x), window.width - width - gutter);

      return {
        top: canShowBelow ? belowTop : Math.max(gutter, anchor.y - maxHeight - gutter),
        left,
        width,
        maxHeight,
      };
    },
    [window.height, window.width]
  );

  const hasSearchText = searchInput.trim().length > 0;

  const viewModeIndex = viewMode === 'list' ? 0 : 1;
  const pillPosition = useSharedValue(viewModeIndex);

  useEffect(() => {
    const targetIndex = viewMode === 'list' ? 0 : 1;
    if (reduceMotionEnabled) {
      pillPosition.value = targetIndex;
    } else {
      const duration = motionDurationMs(reduceMotionEnabled, 200);
      pillPosition.value = withTiming(targetIndex, { duration });
    }
  }, [viewMode, reduceMotionEnabled, pillPosition]);

  const pillStyle = useAnimatedStyle(() => {
    const translateX = pillPosition.value * 44;
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

  const handleFilterPress = useCallback(() => {
    setFilterMenuVisible(true);

    const node = filterButtonRef.current as any;
    setTimeout(() => {
      if (typeof node?.measureInWindow === 'function') {
        node.measureInWindow((x: number, y: number, width: number, height: number) => {
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(width) && Number.isFinite(height)) {
            setFilterMenuAnchor({ x, y, width, height });
          }
        });
        return;
      }

      if (typeof node?.measure === 'function') {
        node.measure(
          (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
            if (Number.isFinite(pageX) && Number.isFinite(pageY) && Number.isFinite(width) && Number.isFinite(height)) {
              setFilterMenuAnchor({ x: pageX, y: pageY, width, height });
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
            ref={(node) => {
              filterButtonRef.current = node;
            }}
            accessibilityRole="button"
            accessibilityLabel="Filter"
            onPress={handleFilterPress}
            style={[styles.toggle, anyFiltersActive ? styles.filterToggleActive : null]}
            testID="controls-filter"
          >
            <FilterIcon color={anyFiltersActive ? theme.colors.brand.primaryStrong : theme.colors.ink.primary} />
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={sortMenuVisible}
        animationType="fade"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <ModalBackdrop
          onPress={() => setSortMenuVisible(false)}
          style={styles.menuBackdrop}
          testID="sort-menu-backdrop"
        >
          <Pressable
            style={[
              styles.menu,
              (() => {
                const layout = getMenuLayout(sortMenuAnchor);
                return layout
                  ? {
                      top: layout.top,
                      left: layout.left,
                      width: layout.width,
                      maxHeight: layout.maxHeight,
                    }
                  : null;
              })(),
            ]}
            onPress={() => undefined}
          >
            <ModalCardBackground style={styles.menuBackground}>
              <ScrollView bounces={false} contentContainerStyle={styles.menuContent}>
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
                    style={[styles.menuItem, mode === sortMode ? styles.menuItemSelected : null]}
                    testID={`sort-menu-item-${mode}`}
                  >
                    <Text style={[styles.menuItemText, mode === sortMode ? styles.menuItemTextSelected : null]}>
                      {sortLabel(mode)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </ModalCardBackground>
          </Pressable>
        </ModalBackdrop>
      </Modal>

      <Modal
        transparent
        visible={filterMenuVisible}
        animationType="fade"
        onRequestClose={() => setFilterMenuVisible(false)}
      >
        <ModalBackdrop
          onPress={() => setFilterMenuVisible(false)}
          style={styles.menuBackdrop}
          testID="filter-menu-backdrop"
        >
          <Pressable
            style={[
              styles.menu,
              (() => {
                const layout = getMenuLayout(filterMenuAnchor);
                return layout
                  ? {
                      top: layout.top,
                      left: layout.left,
                      width: layout.width,
                      maxHeight: layout.maxHeight,
                    }
                  : null;
              })(),
            ]}
            onPress={() => undefined}
          >
            <ModalCardBackground style={styles.menuBackground}>
              <ScrollView bounces={false} contentContainerStyle={styles.menuContent}>
                {(['all', 'favorites'] as const).map((mode) => (
                  <Pressable
                    key={mode}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${filterLabel(mode)}`}
                    onPress={() => {
                      if (mode === filterMode) {
                        return;
                      }
                      onChangeFilterMode(mode);
                    }}
                    style={[styles.menuItem, mode === filterMode ? styles.menuItemSelected : null]}
                    testID={`filter-menu-item-${mode}`}
                  >
                    <Text style={[styles.menuItemText, mode === filterMode ? styles.menuItemTextSelected : null]}>
                      {filterLabel(mode)}
                    </Text>
                  </Pressable>
                ))}

                <View style={styles.sectionDivider} />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Product Type"
                  onPress={() => toggleSection('productTypes')}
                  style={styles.accordionHeader}
                  testID="filter-accordion-productTypes"
                >
                  <Text style={styles.accordionHeaderText}>Product Type</Text>
                  <Text style={styles.accordionChevron}>{expandedSection === 'productTypes' ? '▾' : '▸'}</Text>
                </Pressable>
                <Animated.View style={[styles.accordionBody, productTypesStyle]}>
                  {resolvedCatalog.productTypes.map((label) =>
                    renderMultiSelectRow({
                      label,
                      selected: resolvedAdvancedFilters.productTypes.includes(label),
                      onPress: () => {
                        updateAdvancedFilters({
                          ...resolvedAdvancedFilters,
                          productTypes: toggleValue(resolvedAdvancedFilters.productTypes, label),
                        });
                      },
                      testID: `filter-productType-${label}`,
                    })
                  )}
                </Animated.View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Condition/Use"
                  onPress={() => toggleSection('conditions')}
                  style={styles.accordionHeader}
                  testID="filter-accordion-conditions"
                >
                  <Text style={styles.accordionHeaderText}>Condition/Use</Text>
                  <Text style={styles.accordionChevron}>{expandedSection === 'conditions' ? '▾' : '▸'}</Text>
                </Pressable>
                <Animated.View style={[styles.accordionBody, conditionsStyle]}>
                  {resolvedCatalog.conditions.map((label) =>
                    renderMultiSelectRow({
                      label,
                      selected: resolvedAdvancedFilters.conditions.includes(label),
                      onPress: () => {
                        updateAdvancedFilters({
                          ...resolvedAdvancedFilters,
                          conditions: toggleValue(resolvedAdvancedFilters.conditions, label),
                        });
                      },
                      testID: `filter-condition-${label}`,
                    })
                  )}
                </Animated.View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ingredients"
                  onPress={() => toggleSection('ingredients')}
                  style={styles.accordionHeader}
                  testID="filter-accordion-ingredients"
                >
                  <Text style={styles.accordionHeaderText}>Ingredients</Text>
                  <Text style={styles.accordionChevron}>{expandedSection === 'ingredients' ? '▾' : '▸'}</Text>
                </Pressable>
                <Animated.View style={[styles.accordionBody, ingredientsStyle]}>
                  <View style={styles.ingredientSearchContainer}>
                    <TextInput
                      value={ingredientSearch}
                      onChangeText={setIngredientSearch}
                      placeholder="Search ingredients"
                      placeholderTextColor={theme.colors.ink.subtle}
                      style={styles.ingredientSearchInput}
                      testID="filter-ingredient-search"
                    />
                  </View>
                  {filteredIngredients.map((label) =>
                    renderMultiSelectRow({
                      label,
                      selected: resolvedAdvancedFilters.ingredients.includes(label),
                      onPress: () => {
                        updateAdvancedFilters({
                          ...resolvedAdvancedFilters,
                          ingredients: toggleValue(resolvedAdvancedFilters.ingredients, label),
                        });
                      },
                      testID: `filter-ingredient-${label}`,
                    })
                  )}
                </Animated.View>

                <View style={styles.sectionDivider} />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear filters"
                  onPress={() => {
                    setIngredientSearch('');
                    setExpandedSection(null);
                    onPressClearFilters?.();
                  }}
                  style={[styles.menuItem, styles.clearFiltersRow]}
                  testID="filter-clear"
                >
                  <Text style={[styles.menuItemText, styles.clearFiltersText]}>Clear filters</Text>
                </Pressable>
              </ScrollView>
            </ModalCardBackground>
          </Pressable>
        </ModalBackdrop>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  searchInput: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 2,
    paddingVertical: 6,
    fontSize: 12,
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
    width: 32,
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
    paddingHorizontal: 8,
    gap: 4,
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
    fontSize: 12,
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
    width: 44,
    backgroundColor: theme.colors.brand.primary,
    zIndex: 0,
  },
  toggle: {
    minHeight: 40,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.medium,
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.ink.primary,
    width: 20,
    textAlign: 'center',
  },
  toggleIconLarger: {
    fontSize: 22,
  },
  filterToggleActive: {
    backgroundColor: theme.colors.surface.popover,
  },
  toggleTextActive: {
    color: theme.colors.ink.onBrand,
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  menuBackground: {
    borderRadius: 10,
  },
  menuContent: {
    paddingVertical: 4,
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
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.subtle,
    marginVertical: 6,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accordionHeaderText: {
    fontSize: 13,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  accordionChevron: {
    fontSize: 14,
    color: theme.colors.ink.subtle,
  },
  accordionBody: {
    overflow: 'hidden',
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterOptionText: {
    flex: 1,
    paddingRight: 10,
  },
  checkmark: {
    width: 18,
    textAlign: 'right',
    color: theme.colors.ink.subtle,
    fontSize: 14,
  },
  checkmarkSelected: {
    color: theme.colors.brand.primaryStrong,
  },
  ingredientSearchContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  ingredientSearchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  clearFiltersRow: {
    alignItems: 'center',
  },
  clearFiltersText: {
    color: theme.colors.brand.primaryStrong,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
});
