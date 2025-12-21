import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';

export type PaginationBarMode = 'paged' | 'infinite';

function range(start: number, end: number): number[] {
  const items: number[] = [];
  for (let value = start; value <= end; value += 1) {
    items.push(value);
  }
  return items;
}

function buildPageItems(currentPage: number, totalPages: number, maxNumericButtons: number): number[] {
  const safeTotalPages = Math.max(1, totalPages);
  const safeMax = Math.max(1, maxNumericButtons);

  if (safeTotalPages <= safeMax) {
    return range(1, safeTotalPages);
  }

  if (safeMax <= 1) {
    return [Math.min(Math.max(1, currentPage), safeTotalPages)];
  }

  if (safeMax !== 5) {
    return range(1, Math.min(safeMax, safeTotalPages));
  }

  const current = Math.min(Math.max(1, currentPage), safeTotalPages);
  const first = 1;
  const last = safeTotalPages;

  if (current <= 3) {
    return [1, 2, 3, 4, last];
  }

  if (current >= last - 2) {
    return [1, last - 3, last - 2, last - 1, last];
  }

  return [1, current - 1, current, current + 1, last];
}

type PaginationBarProps = {
  mode: PaginationBarMode;
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  maxNumericButtons: number;
  loadedCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onSelectPage?: (page: number) => void;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  reduceMotionEnabled?: boolean;
};

function buildRangeText(mode: PaginationBarMode, page: number, pageSize: number, totalCount: number, loadedCount?: number) {
  if (totalCount <= 0) {
    return 'Showing results 0–0 of 0';
  }

  if (mode === 'infinite') {
    const end = Math.min(Math.max(0, loadedCount ?? 0), totalCount);
    const start = end > 0 ? 1 : 0;
    return `Showing results ${start}–${end} of ${totalCount}`;
  }

  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalCount);
  return `Showing results ${start}–${end} of ${totalCount}`;
}

function PageButton({ item, page, onSelectPage, reduceMotionEnabled }: { item: number; page: number; onSelectPage?: (page: number) => void; reduceMotionEnabled: boolean }) {
  const active = item === page;
  const animProgress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    const target = active ? 1 : 0;
    if (reduceMotionEnabled) {
      animProgress.value = target;
    } else {
      const duration = motionDurationMs(reduceMotionEnabled, 150);
      animProgress.value = withTiming(target, { duration });
    }
  }, [active, reduceMotionEnabled, animProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animProgress.value,
      [0, 1],
      ['#fff', '#111']
    );
    const borderColor = interpolateColor(
      animProgress.value,
      [0, 1],
      ['#ddd', '#111']
    );
    return {
      backgroundColor,
      borderColor,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animProgress.value,
      [0, 1],
      ['#111', '#fff']
    );
    return {
      color,
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Page ${item}`}
      onPress={() => onSelectPage?.(item)}
      testID={`pagination-page-${item}`}
    >
      <Animated.View style={[styles.pageButton, animatedStyle]}>
        <Animated.Text style={[styles.pageText, animatedTextStyle]}>{item}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function PaginationBar({
  mode,
  page,
  totalPages,
  pageSize,
  totalCount,
  maxNumericButtons,
  loadedCount,
  onPrev,
  onNext,
  onSelectPage,
  onLoadMore,
  canLoadMore,
  reduceMotionEnabled = false,
}: PaginationBarProps) {
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [jumpVisible, setJumpVisible] = useState(false);

  useEffect(() => {
    setJumpVisible(false);
    setJumpError(null);
    setJumpInput('');
  }, [mode, totalPages]);

  const pageItems = useMemo(() => {
    if (mode !== 'paged') {
      return [];
    }
    return buildPageItems(page, totalPages, maxNumericButtons);
  }, [maxNumericButtons, mode, page, totalPages]);

  const rangeText = useMemo(
    () => buildRangeText(mode, page, pageSize, totalCount, loadedCount),
    [loadedCount, mode, page, pageSize, totalCount]
  );

  const prevDisabled = mode !== 'paged' || page <= 1;
  const nextDisabled = mode !== 'paged' || page >= totalPages;

  const submitJump = () => {
    const trimmed = jumpInput.trim();
    if (trimmed.length === 0) {
      setJumpError('Enter a page number');
      return;
    }

    const value = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(value)) {
      setJumpError('Invalid page number');
      return;
    }

    if (value < 1 || value > totalPages) {
      setJumpError(`Page must be between 1 and ${totalPages}`);
      return;
    }

    setJumpError(null);
    setJumpInput('');
    setJumpVisible(false);
    onSelectPage?.(value);
  };

  const showEllipsisToggle = mode === 'paged' && totalPages > 6 && !jumpVisible;

  return (
    <View style={styles.container} testID="pagination-bar">
      <Text style={styles.rangeText} testID="pagination-range">
        {rangeText}
      </Text>

      {mode === 'paged' ? (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous page"
            disabled={prevDisabled}
            onPress={onPrev}
            style={[styles.button, prevDisabled ? styles.buttonDisabled : null]}
            testID="pagination-prev"
          >
            <Text style={styles.buttonText}>Prev</Text>
          </Pressable>

          <View style={styles.pages} testID="pagination-pages">
            {pageItems.map((item) => (
              <PageButton
                key={item}
                item={item}
                page={page}
                onSelectPage={onSelectPage}
                reduceMotionEnabled={reduceMotionEnabled}
              />
            ))}

            {showEllipsisToggle ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More pages"
                onPress={() => {
                  setJumpVisible(true);
                  setJumpError(null);
                }}
                style={styles.ellipsisButton}
                testID="pagination-ellipsis"
              >
                <Text style={styles.ellipsis}>…</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next page"
            disabled={nextDisabled}
            onPress={onNext}
            style={[styles.button, nextDisabled ? styles.buttonDisabled : null]}
            testID="pagination-next"
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Load more"
            disabled={!canLoadMore}
            onPress={onLoadMore}
            style={[styles.buttonWide, !canLoadMore ? styles.buttonDisabled : null]}
            testID="pagination-load-more"
          >
            <Text style={styles.buttonText}>{canLoadMore ? 'Load more' : 'All loaded'}</Text>
          </Pressable>
        </View>
      )}

      {mode === 'paged' && jumpVisible ? (
        <View style={styles.jumpRow}>
          <TextInput
            value={jumpInput}
            onChangeText={(value) => {
              setJumpInput(value);
              setJumpError(null);
            }}
            placeholder="Page"
            keyboardType="number-pad"
            returnKeyType="go"
            onSubmitEditing={submitJump}
            accessibilityLabel="Jump to page"
            style={styles.jumpInput}
            testID="pagination-jump-input"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to page"
            onPress={submitJump}
            style={styles.button}
            testID="pagination-jump-go"
          >
            <Text style={styles.buttonText}>Go</Text>
          </Pressable>
          {jumpError ? (
            <Text style={styles.errorText} testID="pagination-jump-error">
              {jumpError}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 14,
  },
  rangeText: {
    color: '#444',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    minHeight: 36,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  buttonWide: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  pageButton: {
    minHeight: 34,
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ellipsis: {
    color: '#444',
    fontSize: 16,
  },
  ellipsisButton: {
    minHeight: 34,
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  jumpInput: {
    minHeight: 36,
    minWidth: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#b00020',
    fontSize: 12,
  },
});
