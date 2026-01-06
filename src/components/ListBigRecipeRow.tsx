import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolate,
  FadeIn,
  FadeOut,
  FadeInDown,
  Layout,
  interpolateColor,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { motionDurationMs } from '../app/motionPolicy';

import { getRecipeImageSource } from '../assets/getRecipeImageSource';

import { theme } from '../ui/theme';

import { DescriptionInline } from './DescriptionInline';
import { DifficultyField } from './DifficultyField';
import { FieldRow } from './FieldRow';
import { PreparationStepsValue } from './PreparationStepsValue';
import { PrepTimeField } from './PrepTimeField';
import { SecondaryFieldRow } from './SecondaryFieldRow';
import { TimePeriodRegionRow } from './TimePeriodRegionRow';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedPath = Animated.createAnimatedComponent(Path);

 const ACCENT_WIDTH = 8;

type ListBigRecipeRowProps = {
  recipeId: number;
  title: string;
  difficultyScore: number;
  preparationTime: string;
  description: string;
  timePeriod: string;
  warning: string;
  region: string;
  alternativeNames?: string;
  usedFor: string;
  ingredients: string;
  detailedMeasurements: string;
  preparationSteps: string;
  usage: string;
  historicalContext: string;
  scientificEvidence: string;
  isFavorite?: boolean;
  onPressFavorite?: () => void;
  reduceMotionEnabled?: boolean;
  dimmed?: boolean;
  tinted?: boolean;
  expanded?: boolean;
  onRequestSetExpanded?: (expanded: boolean) => void;
  onPress?: () => void;
  allowDetailsToggle?: boolean;
  showDetailsButton?: boolean;
  onShowLess?: () => void;
  onShowDetails?: () => void;
  showMinimizeButton?: boolean;
  onPressMinimize?: () => void;
};

export function ListBigRecipeRow({
  recipeId,
  title,
  difficultyScore,
  preparationTime,
  description,
  timePeriod: _timePeriod,
  warning,
  region,
  alternativeNames,
  usedFor,
  ingredients,
  detailedMeasurements,
  preparationSteps,
  usage,
  historicalContext,
  scientificEvidence,
  isFavorite = false,
  onPressFavorite,
  reduceMotionEnabled = false,
  dimmed = false,
  tinted = false,
  expanded,
  onRequestSetExpanded,
  onPress,
  allowDetailsToggle = true,
  showDetailsButton = false,
  onShowLess,
  onShowDetails,
  showMinimizeButton = false,
  onPressMinimize,
}: ListBigRecipeRowProps) {
  const [detailsModeInternal, setDetailsModeInternal] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const imageSource = getRecipeImageSource(recipeId);

  const containerRef = useRef<any>(null);

  const minimizeFeedback = useSharedValue(0);

  const layoutRef = useRef({ width: 0, height: 0 });
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const diameter = useSharedValue(0);
  const waveProgress = useSharedValue(0);

  const detailsMode = expanded ?? detailsModeInternal;
  const displayTitle = detailsMode ? title : title.replace(/\s*\n\s*/g, ' ');
  const titleKey = detailsMode ? 'title-expanded' : 'title-collapsed';

  useEffect(() => {
    if (!detailsMode) {
      setImageModalVisible(false);
    }
  }, [detailsMode]);

  const setDetailsMode = (next: boolean) => {
    if (onRequestSetExpanded) {
      onRequestSetExpanded(next);
      return;
    }
    setDetailsModeInternal(next);
  };

  const animDuration = motionDurationMs(reduceMotionEnabled, 150);
  const enableExitAnimations = !reduceMotionEnabled && Platform.OS !== 'android';

  const minimizeIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${minimizeFeedback.value * 180}deg` }],
    };
  });

  const minimizePathProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        minimizeFeedback.value,
        [0, 1],
        [theme.colors.ink.subtle, theme.colors.brand.primaryStrong]
      ),
    } as any;
  });

  const triggerWave = (event?: any) => {
    if (reduceMotionEnabled) {
      return;
    }

    const { width: fallbackWidth, height: fallbackHeight } = layoutRef.current;

    const startWave = (width: number, height: number, x: number, y: number) => {
      if (width <= 0 || height <= 0) {
        return;
      }

      const distTL = Math.hypot(x - 0, y - 0);
      const distTR = Math.hypot(x - width, y - 0);
      const distBL = Math.hypot(x - 0, y - height);
      const distBR = Math.hypot(x - width, y - height);
      const radius = Math.max(distTL, distTR, distBL, distBR);

      originX.value = x;
      originY.value = y;
      diameter.value = radius * 2;

      waveProgress.value = 0;
      waveProgress.value = withTiming(1, { duration: motionDurationMs(reduceMotionEnabled, 320) }, () => {
        waveProgress.value = 0;
      });
    };

    const pageX = event?.nativeEvent?.pageX;
    const pageY = event?.nativeEvent?.pageY;

    if (typeof pageX === 'number' && typeof pageY === 'number' && containerRef.current?.measureInWindow) {
      containerRef.current.measureInWindow((left: number, top: number, measuredWidth: number, measuredHeight: number) => {
        const width = typeof measuredWidth === 'number' && measuredWidth > 0 ? measuredWidth : fallbackWidth;
        const height = typeof measuredHeight === 'number' && measuredHeight > 0 ? measuredHeight : fallbackHeight;

        const x = pageX - left;
        const y = pageY - top;

        startWave(width, height, x, y);
      });
      return;
    }

    const width = fallbackWidth;
    const height = fallbackHeight;

    const x = typeof event?.nativeEvent?.locationX === 'number' ? event.nativeEvent.locationX : width / 2;
    const y = typeof event?.nativeEvent?.locationY === 'number' ? event.nativeEvent.locationY : height / 2;

    startWave(width, height, x, y);
  };

  const waveStyle = useAnimatedStyle(() => {
    if (waveProgress.value <= 0 || diameter.value <= 0) {
      return {
        opacity: 0,
      };
    }

    const scale = interpolate(waveProgress.value, [0, 1], [0.15, 1], Extrapolate.CLAMP);
    const opacity = interpolate(waveProgress.value, [0, 0.2, 1], [0.32, 0.22, 0], Extrapolate.CLAMP);

    const size = diameter.value;
    const radius = size / 2;

    return {
      opacity,
      transform: [{ scale }],
      width: size,
      height: size,
      borderRadius: radius,
      left: originX.value - radius,
      top: originY.value - radius,
    };
  });

  const handleContainerPress = () => {
    if (showDetailsButton && detailsMode) {
      return;
    }

    if (!allowDetailsToggle && onPress) {
      onPress();
      return;
    }

    if (showDetailsButton && detailsMode) {
      return;
    }

    if (!showDetailsButton) {
      setDetailsMode(!detailsMode);
    }
  };

  const handleHeaderZonePress = (e: any) => {
    e.stopPropagation();
    triggerWave(e);

    // When details are visible, the header zone behaves like the chevron: collapse.
    if (detailsMode) {
      setDetailsMode(false);
      if (onShowLess) {
        onShowLess();
      }
      return;
    }

    if (!allowDetailsToggle && onPress) {
      onPress();
      return;
    }

    // When details are hidden, header zone toggles only if we're in "tap to toggle" mode.
    if (!showDetailsButton) {
      setDetailsMode(true);
    }
  };

  const handleShowDetailsPress = (e: any) => {
    e.stopPropagation();
    triggerWave(e);
    setDetailsMode(true);
    if (onShowDetails) {
      onShowDetails();
    }
  };

  const handleShowLessPress = (e: any) => {
    e.stopPropagation();
    triggerWave(e);
    setDetailsMode(false);
    if (onShowLess) {
      onShowLess();
    }
  };

  const handleTitleZonePress = (e: any) => {
    // Title is part of the header zone.
    handleHeaderZonePress(e);
  };

  const handleHeaderChevronPress = (e: any) => {
    e.stopPropagation();
    triggerWave(e);

    if (!allowDetailsToggle && onPress) {
      onPress();
      return;
    }

    setDetailsMode(!detailsMode);
  };

  const headerContent = (
    <Animated.View
      style={styles.headerRow}
    >
      {imageSource ? (
        <Pressable
          testID={`list-big-recipe-row-thumb-pressable-${recipeId}`}
          onPress={(e) => {
            e.stopPropagation();

            if (!detailsMode) {
              onPress?.();
              return;
            }

            setImageModalVisible(true);
          }}
        >
          <Image
            source={imageSource}
            style={styles.thumbnail}
            resizeMode="cover"
            testID={`list-big-recipe-row-thumb-${recipeId}`}
            accessibilityLabel="Recipe image"
          />
        </Pressable>
      ) : (
        <View style={styles.thumbnail} testID={`list-big-recipe-row-thumb-${recipeId}`}>
          <Text style={styles.thumbnailText} accessibilityLabel="Recipe image placeholder">
            IMG
          </Text>
        </View>
      )}

      <Animated.View
        style={styles.headerContent}
      >
        <Animated.View style={styles.titleRow}>
          <Pressable
            testID={`list-big-recipe-row-title-pressable-${recipeId}`}
            onPress={handleTitleZonePress}
            style={styles.titlePressable}
            accessibilityRole="button"
            accessibilityLabel={detailsMode ? 'Collapse recipe details' : 'Expand recipe details'}
          >
            <Animated.Text
              key={titleKey}
              style={styles.title}
              numberOfLines={detailsMode ? undefined : 1}
              ellipsizeMode="tail"
              testID={`list-big-recipe-row-title-${recipeId}`}
            >
              {displayTitle}
            </Animated.Text>
          </Pressable>

          {showMinimizeButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Minimize recipe"
              onPress={(e) => {
                e.stopPropagation();
                triggerWave(e);

                if (!reduceMotionEnabled) {
                  minimizeFeedback.value = 0;
                  minimizeFeedback.value = withTiming(1, { duration: animDuration });
                }

                onPressMinimize?.();
              }}
              style={styles.minimizeButton}
              testID={`list-big-recipe-row-minimize-${recipeId}`}
            >
              <Animated.View style={minimizeIconStyle}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <AnimatedPath
                    d="M7 14l5-5 5 5"
                    fill="none"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animatedProps={minimizePathProps}
                  />
                </Svg>
              </Animated.View>
            </Pressable>
          ) : null}

          {!showMinimizeButton && showDetailsButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={detailsMode ? 'Collapse recipe details' : 'Expand recipe details'}
              onPress={handleHeaderChevronPress}
              style={styles.headerChevronButton}
              testID={`list-big-recipe-row-header-chevron-${recipeId}`}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d={detailsMode ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                  fill="none"
                  stroke={theme.colors.brand.primaryStrong}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          ) : null}
        </Animated.View>

        <Animated.View
          entering={reduceMotionEnabled ? undefined : FadeIn.duration(animDuration)}
          exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
          style={styles.collapsedFieldsRow}
        >
          <View testID={`list-big-recipe-row-field-difficulty-${recipeId}`}>
            <DifficultyField score={difficultyScore} />
          </View>
          <View testID={`list-big-recipe-row-field-prep-time-${recipeId}`}>
            <PrepTimeField value={preparationTime} />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );

  return (
    <>
      <AnimatedPressable 
        ref={containerRef}
        style={styles.container} 
        testID={`list-big-recipe-row-${recipeId}`}
        onLayout={(e) => {
          layoutRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
        onPress={
          // When details are visible, the card body becomes inert (no collapse, no wave).
          detailsMode
            ? undefined
            : (e) => {
                triggerWave(e);
                handleContainerPress();
              }
        }
        accessibilityRole="button"
        accessibilityLabel={detailsMode ? "Collapse recipe details" : "Expand recipe details"}
        layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
      >
        <View pointerEvents="none" style={styles.accent} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={(e) => {
            e.stopPropagation();
            onPressFavorite?.();
          }}
          style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : styles.favoriteButtonInactive]}
          testID={`list-big-recipe-row-favorite-${recipeId}`}
        >
          <Text style={[styles.favoriteIcon, isFavorite ? styles.favoriteIconActive : styles.favoriteIconInactive]}>
            {isFavorite ? '★' : '☆'}
          </Text>
        </Pressable>

        <View style={styles.decorativeLeavesContainer} pointerEvents="none">
          <Image source={require('../assets/leaves.png')} style={styles.leavesImage} />
        </View>

        <View style={[styles.contentWrapper, dimmed && styles.dimmedContent]}>
          <Pressable
            testID={`list-big-recipe-row-header-zone-${recipeId}`}
            onPress={handleHeaderZonePress}
            accessibilityRole="button"
            accessibilityLabel={detailsMode ? 'Collapse recipe details' : 'Expand recipe details'}
          >
            {headerContent}

            <Animated.View
              style={styles.descriptionBlock}
              testID={`list-big-recipe-row-description-block-${recipeId}`}
            >
              <DescriptionInline
                value={description}
                numberOfLines={detailsMode ? undefined : 3}
              />
            </Animated.View>
          </Pressable>

          {detailsMode ? (
            <View
              // In details mode, the metadata area should not be tappable (no wave) except for
              // explicit controls (Warning dropdown, Show Less).
              pointerEvents="box-none"
            >
              <Animated.View
                style={[styles.detailsMode, styles.detailsModeClip]}
                testID={`list-big-recipe-row-details-mode-${recipeId}`}
              >
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(0)}
                exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
                style={[styles.detailsField, styles.detailsFieldCentered, styles.ingredientsField]}
              >
                <View style={styles.centeredNarrowField}>
                  <FieldRow
                    icon="ingredients"
                    label="Ingredients"
                    value={ingredients}
                    align="center"
                    hideIcon
                    hideLabelChip
                  />
                </View>
              </Animated.View>
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(50)}
                exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
                style={[styles.detailsField, styles.detailsFieldCentered]}
              >
                <View style={styles.centeredNarrowField}>
                  <FieldRow
                    icon="preparationSteps"
                    label="Preparation Steps"
                    value={preparationSteps}
                    valueNode={<PreparationStepsValue value={preparationSteps} />}
                    headerAlign="center"
                    valueAlign="left"
                    hideIcon
                    hideLabelChip
                  />
                </View>
              </Animated.View>

            <Animated.View
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(100)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              style={styles.secondaryFieldsGroup}
            >
              <SecondaryFieldRow icon="usage" label="Usage" value={usage} variant="grouped" />
              <SecondaryFieldRow
                icon="historical"
                label="Historical"
                value={historicalContext}
                variant="grouped"
              />
              <SecondaryFieldRow
                icon="historical"
                label="Alternative names"
                value={alternativeNames?.trim() ? alternativeNames : '—'}
                variant="grouped"
              />
              <SecondaryFieldRow
                icon="evidence"
                label="Evidence"
                value={scientificEvidence}
                variant="grouped"
              />
              <SecondaryFieldRow
                icon="warning"
                label="Warning"
                value={warning}
                variant="grouped"
                collapsible
                defaultCollapsed
                chevronColor={theme.colors.brand.primaryStrong}
                toggleTestID={`list-big-recipe-row-warning-toggle-${recipeId}`}
                valueTestID={`list-big-recipe-row-warning-value-${recipeId}`}
                onTogglePress={(e) => {
                  triggerWave(e);
                }}
              />
            </Animated.View>
            <Animated.View
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(300)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              style={[styles.detailsField, styles.timePeriodRegionBlock]}
            >
              <TimePeriodRegionRow usedFor={usedFor} region={region} />
            </Animated.View>
            {showDetailsButton && (
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(350)}
                exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Show less details"
                  onPress={handleShowLessPress}
                  style={styles.showLessButton}
                  testID={`list-big-recipe-row-show-less-${recipeId}`}
                >
                  <Text style={styles.showLessText}>Show Less</Text>
                </Pressable>
              </Animated.View>
            )}
              </Animated.View>
            </View>
        ) : null}

        {!detailsMode && showDetailsButton && (
          <Animated.View
            entering={reduceMotionEnabled ? undefined : FadeIn.duration(animDuration)}
            exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
            style={styles.moreInfoRow}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show more details"
              onPress={handleShowDetailsPress}
              style={styles.moreInfoButton}
              testID={`list-big-recipe-row-more-info-${recipeId}`}
            >
              <Text style={styles.moreInfoText}>+ more info</Text>
            </Pressable>
          </Animated.View>
        )}

          <View style={styles.waveOverlay} pointerEvents="none">
            <Animated.View style={[styles.wave, waveStyle]} />
          </View>
        </View>
      </AnimatedPressable>
    
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType={reduceMotionEnabled ? "none" : "fade"}
      onRequestClose={() => setImageModalVisible(false)}
    >
      <Pressable
        testID={`list-big-recipe-row-image-modal-overlay-${recipeId}`}
        style={styles.modalOverlay}
        onPress={() => setImageModalVisible(false)}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.modalImage}
            resizeMode="contain"
            testID={`list-big-recipe-row-image-modal-image-${recipeId}`}
          />
        ) : null}
      </Pressable>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingLeft: theme.spacing.sm + ACCENT_WIDTH,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface.paperStrong,
    borderRadius: theme.radii.lg,
    overflow: 'visible',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 5,
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
  dimmedContent: {
    opacity: 0.4,
  },
  containerOpened: {
    backgroundColor: theme.colors.surface.recipeOpened,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: ACCENT_WIDTH,
    backgroundColor: theme.colors.brand.primary,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomLeftRadius: theme.radii.lg,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 30,
    minWidth: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  favoriteButtonInactive: {
    backgroundColor: 'transparent',
    opacity: 0.45,
  },
  favoriteButtonActive: {
    backgroundColor: 'transparent',
    opacity: 1,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  favoriteIconInactive: {
    color: theme.colors.ink.primary,
  },
  favoriteIconActive: {
    color: theme.colors.ink.primary,
  },
  decorativeLeavesContainer: {
    position: 'absolute',
    top: -8,
    left: -8,
    zIndex: 2,
    opacity: 1,
  },
  leavesImage: {
    width: 24,
    height: 24,
  },
  waveOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: theme.radii.lg,
  },
  wave: {
    position: 'absolute',
    backgroundColor: theme.colors.surface.wave,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  thumbnail: {
    height: 128,
    width: 128,
    borderRadius: 16,
    backgroundColor: theme.colors.surface.popover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    color: theme.colors.ink.subtle,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  minimizeButton: {
    padding: 6,
    marginRight: -6,
    marginTop: -2,
  },
  headerChevronButton: {
    padding: 6,
    marginRight: -6,
    marginTop: -2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titlePressable: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.primary,
    flex: 1,
  },
  collapseButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  collapseButtonText: {
    fontSize: 16,
    color: theme.colors.ink.subtle,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  collapsedFieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 8,
  },
  detailsMode: {
    gap: 8,
    width: '100%',
  },
  detailsModeClip: {
    overflow: 'hidden',
  },
  detailsField: {
    gap: 2,
  },
  detailsFieldCentered: {
    alignItems: 'center',
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 10,
    marginBottom: 12,
  },
  ingredientsField: {
    marginBottom: 12,
  },
  centeredNarrowField: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  secondaryFieldsGroup: {
    backgroundColor: theme.colors.surface.secondaryField,
    borderRadius: 10,
    overflow: 'hidden',
  },
  timePeriodRegionBlock: {
    marginTop: 16,
  },
  field: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
    justifyContent: 'flex-end',
  },
  descriptionBlock: {
    marginTop: 10,
    marginBottom: 6,
    gap: 4,
    width: '100%',
  },
  readMore: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  readMoreText: {
    fontSize: 13,
    color: theme.colors.brand.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  showDetailsButton: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
    justifyContent: 'flex-end',
  },
  showDetailsText: {
    fontSize: 13,
    color: theme.colors.brand.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  showLessButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: 12,
  },
  showLessText: {
    fontSize: 13,
    color: theme.colors.brand.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  moreInfoRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  moreInfoButton: {
    backgroundColor: theme.colors.brand.moreInfoGreen,
    borderRadius: theme.radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.brand.moreInfoGreen,
  },
  moreInfoText: {
    fontSize: 11,
    color: theme.colors.brand.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.backdrop.imageZoom,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
});
