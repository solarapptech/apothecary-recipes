import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, interpolateColor } from 'react-native-reanimated';

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
  const [jumpMounted, setJumpMounted] = useState(false);
  const jumpCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keyboardHeight = useSharedValue(0);
  const jumpOpenProgress = useSharedValue(0);

  useEffect(() => {
    setJumpVisible(false);
    setJumpMounted(false);
    setJumpError(null);
    setJumpInput('');
  }, [mode, totalPages]);

  useEffect(() => {
    return () => {
      if (jumpCloseTimeoutRef.current) {
        clearTimeout(jumpCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      const height = event.endCoordinates?.height ?? 0;
      const duration = reduceMotionEnabled ? 0 : 250;
      keyboardHeight.value = withTiming(height, { duration });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      const duration = reduceMotionEnabled ? 0 : 250;
      keyboardHeight.value = withTiming(0, { duration });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight, reduceMotionEnabled]);

  useEffect(() => {
    const duration = reduceMotionEnabled ? 0 : 500;

    if (jumpCloseTimeoutRef.current) {
      clearTimeout(jumpCloseTimeoutRef.current);
      jumpCloseTimeoutRef.current = null;
    }

    if (jumpVisible) {
      setJumpMounted(true);
      jumpOpenProgress.value = withTiming(1, { duration });
      return;
    }

    jumpOpenProgress.value = withTiming(0, { duration });
    jumpCloseTimeoutRef.current = setTimeout(() => {
      setJumpMounted(false);
      jumpCloseTimeoutRef.current = null;
    }, duration);
  }, [jumpOpenProgress, jumpVisible, reduceMotionEnabled]);

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

  const closeJump = () => {
    Keyboard.dismiss();
    setJumpError(null);
    setJumpInput('');
    setJumpVisible(false);
  };

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

    Keyboard.dismiss();
    setJumpError(null);
    setJumpInput('');
    setJumpVisible(false);
    onSelectPage?.(value);
  };

  const showEllipsisToggle = mode === 'paged' && totalPages > 6 && !jumpVisible;

  const fullBleedPadding = 16;
  const footerBottomPadding = 0;

  const barLiftStyle = useAnimatedStyle(() => {
    const lift = jumpMounted && keyboardHeight.value > 0 ? -(keyboardHeight.value + footerBottomPadding) : 0;
    return {
      transform: [{ translateY: lift }],
    };
  });

  const barChromeStyle = useAnimatedStyle(() => {
    const keyboardProgress = Math.min(1, Math.max(0, keyboardHeight.value / 260));
    const active = jumpMounted ? keyboardProgress : 0;
    const bleed = interpolate(active, [0, 1], [0, -fullBleedPadding]);
    const chromePadding = interpolate(active, [0, 1], [0, fullBleedPadding]);
    const extraTopPadding = interpolate(active, [0, 1], [0, 10]);
    const extraBottomPadding = interpolate(active, [0, 1], [0, 10]);
    const bottomMargin = interpolate(active, [0, 1], [styles.container.marginBottom ?? 0, 0]);
    return {
      marginLeft: bleed,
      marginRight: bleed,
      paddingLeft: chromePadding,
      paddingRight: chromePadding,
      paddingTop: extraTopPadding,
      paddingBottom: extraBottomPadding,
      marginBottom: bottomMargin,
    };
  }, [jumpMounted]);

  const keyboardBackgroundProgress = useAnimatedStyle(() => {
    const keyboardProgress = Math.min(1, Math.max(0, keyboardHeight.value / 260));
    const active = jumpMounted ? keyboardProgress : 0;
    return {
      opacity: active,
    };
  }, [jumpMounted]);

  const normalBackgroundProgress = useAnimatedStyle(() => {
    const keyboardProgress = Math.min(1, Math.max(0, keyboardHeight.value / 260));
    const active = jumpMounted ? keyboardProgress : 0;
    return {
      opacity: 1 - active,
    };
  }, [jumpMounted]);

  const jumpAnimatedStyle = useAnimatedStyle(() => {
    const openOffsetY = (1 - jumpOpenProgress.value) * 14;
    return {
      opacity: jumpOpenProgress.value,
      transform: [{ translateY: openOffsetY }],
    };
  });

  const parchment = require('../../assets/apothecary-recipe-ref-img2.jpeg');

  return (
    <Animated.View style={[styles.container, barLiftStyle, barChromeStyle]} testID="pagination-bar">
      <Animated.View style={[styles.backgroundWrap, normalBackgroundProgress]} pointerEvents="none">
        <ImageBackground source={parchment} resizeMode="cover" style={styles.backgroundFill} imageStyle={styles.backgroundImage}>
          <View style={styles.backgroundOverlay} />
        </ImageBackground>
      </Animated.View>

      <Animated.View style={[styles.backgroundWrap, keyboardBackgroundProgress]} pointerEvents="none">
        <ImageBackground
          source={parchment}
          resizeMode="cover"
          style={styles.backgroundFill}
          imageStyle={styles.keyboardBackgroundImage}
        >
          <View style={styles.keyboardBackgroundOverlay} />
        </ImageBackground>
      </Animated.View>

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

      {mode === 'paged' && jumpMounted ? (
        <Animated.View style={[styles.jumpAnimatedWrap, jumpAnimatedStyle]}>
          <View style={styles.jumpRow}>
            <View style={styles.jumpControlsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close jump to page"
                onPress={closeJump}
                style={styles.closeButton}
                testID="pagination-jump-close"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>

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
            </View>

            {jumpError ? (
              <Text style={styles.errorText} testID="pagination-jump-error">
                {jumpError}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 14,
  },
  backgroundWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundFill: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.8,
  },
  keyboardBackgroundImage: {
    opacity: 1,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240,240,239,0.50)',
  },
  keyboardBackgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240,240,239,0.20)',
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
  jumpAnimatedWrap: {
    alignSelf: 'stretch',
  },
  jumpRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  jumpControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  closeButton: {
    minHeight: 36,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    lineHeight: 18,
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
    textAlign: 'center',
  },
  errorText: {
    color: '#b00020',
    fontSize: 12,
    textAlign: 'center',
  },
});
