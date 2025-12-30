import { useRef, useState } from 'react';
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

import { DecorativeLeaves } from '../ui/DecorativeLeaves';
import { theme } from '../ui/theme';

import { DescriptionInline } from './DescriptionInline';
import { DifficultyField } from './DifficultyField';
import { FieldRow } from './FieldRow';
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
  ingredients: string;
  detailedMeasurements: string;
  preparationSteps: string;
  usage: string;
  historicalContext: string;
  scientificEvidence: string;
  reduceMotionEnabled?: boolean;
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
  timePeriod,
  warning,
  region,
  ingredients,
  detailedMeasurements,
  preparationSteps,
  usage,
  historicalContext,
  scientificEvidence,
  reduceMotionEnabled = false,
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

  const minimizeFeedback = useSharedValue(0);

  const layoutRef = useRef({ width: 0, height: 0 });
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const diameter = useSharedValue(0);
  const waveProgress = useSharedValue(0);

  const detailsMode = expanded ?? detailsModeInternal;
  const displayTitle = detailsMode ? title : title.replace(/\s*\n\s*/g, ' ');
  const titleKey = detailsMode ? 'title-expanded' : 'title-collapsed';
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

    const { width, height } = layoutRef.current;
    if (width <= 0 || height <= 0) {
      return;
    }

    const x = typeof event?.nativeEvent?.locationX === 'number' ? event.nativeEvent.locationX : width / 2;
    const y = typeof event?.nativeEvent?.locationY === 'number' ? event.nativeEvent.locationY : height / 2;

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
    } else if (!allowDetailsToggle && onPress) {
      onPress();
    } else if (!showDetailsButton) {
      setDetailsMode(!detailsMode);
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

  const headerContent = (
    <Animated.View
      layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
      style={styles.headerRow}
    >
      {imageSource ? (
        <Pressable 
          onPress={(e) => {
            e.stopPropagation();
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
        layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
        style={styles.headerContent}
      >
        <Animated.View
          layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
          style={styles.titleRow}
        >
          <Animated.Text 
            key={titleKey}
            style={styles.title}
            numberOfLines={detailsMode ? undefined : 1} 
            ellipsizeMode="tail" 
            testID={`list-big-recipe-row-title-${recipeId}`}
            layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
          >
            {displayTitle}
          </Animated.Text>

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
        </Animated.View>

        {detailsMode ? (
          <Animated.View
            layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
            style={[styles.detailsMode, styles.detailsModeClip]}
            testID={`list-big-recipe-row-details-mode-${recipeId}`}
          >
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(0)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="ingredients" label="Ingredients" value={ingredients} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(50)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="preparationSteps" label="Preparation Steps" value={preparationSteps} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(100)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <SecondaryFieldRow icon="usage" label="Usage" value={usage} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(150)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <SecondaryFieldRow icon="historical" label="Historical" value={historicalContext} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(200)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <SecondaryFieldRow icon="evidence" label="Evidence" value={scientificEvidence} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(250)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <SecondaryFieldRow icon="warning" label="Warning" value={warning} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(300)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <TimePeriodRegionRow timePeriod={timePeriod} region={region} />
            </Animated.View>
            {showDetailsButton && (
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(350)}
                exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
                layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
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
        ) : (
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
        )}
      </Animated.View>
    </Animated.View>
  );

  return (
    <>
      <AnimatedPressable 
        style={styles.container} 
        testID={`list-big-recipe-row-${recipeId}`}
        onLayout={(e) => {
          layoutRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
        onPress={(e) => {
          triggerWave(e);
          handleContainerPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={detailsMode ? "Collapse recipe details" : "Expand recipe details"}
        layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
      >
        <View pointerEvents="none" style={styles.accent} />
        
        <View style={styles.decorativeLeavesContainer} pointerEvents="none">
          <DecorativeLeaves size={42} />
        </View>

        {headerContent}

        <Animated.View
          layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
          style={styles.descriptionBlock}
          testID={`list-big-recipe-row-description-block-${recipeId}`}
        >
          {detailsMode ? (
            <FieldRow
              icon="description"
              label="Description"
              value={description}
              testID={`list-big-recipe-row-description-${recipeId}`}
            />
          ) : (
            <DescriptionInline
              value={description}
              numberOfLines={3}
            />
          )}
        </Animated.View>

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
      </AnimatedPressable>
    
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType={reduceMotionEnabled ? "none" : "fade"}
      onRequestClose={() => setImageModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setImageModalVisible(false)}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.modalImage}
            resizeMode="contain"
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
    paddingTop: theme.spacing.md,
    paddingBottom: 14,
    backgroundColor: theme.colors.surface.paper,
    borderRadius: theme.radii.lg,
    overflow: 'visible',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 5,
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
  decorativeLeavesContainer: {
    position: 'absolute',
    top: -12,
    left: -12,
    zIndex: 2,
    opacity: 1,
  },
  waveOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    backgroundColor: theme.colors.surface.wave,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
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
  headerContent: {
    flex: 1,
    gap: 2,
    marginTop: -8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.primary,
    flex: 1,
  },
  minimizeButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 0,
  },
  detailsMode: {
    gap: 8,
  },
  detailsModeClip: {
    overflow: 'hidden',
  },
  detailsField: {
    gap: 2,
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
    alignSelf: 'flex-start',
    paddingVertical: 4,
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
    borderColor: theme.colors.brand.primary,
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
