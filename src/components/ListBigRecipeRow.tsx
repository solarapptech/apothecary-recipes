import { useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInDown, Layout } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { motionDurationMs } from '../app/motionPolicy';

import { getRecipeImageSource } from '../assets/getRecipeImageSource';

import { theme } from '../ui/theme';

import { FieldRow } from './FieldRow';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    setDetailsMode(true);
    if (onShowDetails) {
      onShowDetails();
    }
  };

  const handleShowLessPress = (e: any) => {
    e.stopPropagation();
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
                onPressMinimize?.();
              }}
              style={styles.minimizeButton}
              testID={`list-big-recipe-row-minimize-${recipeId}`}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M7 14l5-5 5 5"
                  fill="none"
                  stroke={theme.colors.ink.subtle}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
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
              <FieldRow icon="difficulty" label="Difficulty" value={String(difficultyScore)} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(50)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="prepTime" label="Prep time" value={preparationTime} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(100)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="timePeriod" label="Time period" value={timePeriod} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(150)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="region" label="Region" value={region} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(200)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="ingredients" label="Ingredients" value={ingredients} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(250)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="detailedMeasurements" label="Detailed Measurements" value={detailedMeasurements} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(300)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="preparationSteps" label="Preparation Steps" value={preparationSteps} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(350)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="usage" label="Usage" value={usage} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(400)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="warning" label="Warning" value={warning} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(450)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="historical" label="Historical" value={historicalContext} />
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(500)}
              exiting={enableExitAnimations ? FadeOut.duration(animDuration) : undefined}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <FieldRow icon="evidence" label="Evidence" value={scientificEvidence} />
            </Animated.View>
            {showDetailsButton && (
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(550)}
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
            style={styles.fieldsGrid}
          >
            <View style={styles.field} testID={`list-big-recipe-row-field-difficulty-${recipeId}`}>
              <FieldRow icon="difficulty" label="Difficulty" value={String(difficultyScore)} numberOfLines={1} variant="collapsed" />
            </View>
            <View style={styles.field} testID={`list-big-recipe-row-field-prep-time-${recipeId}`}>
              <FieldRow icon="prepTime" label="Prep time" value={preparationTime} numberOfLines={1} variant="collapsed" />
            </View>
            <View style={styles.field} testID={`list-big-recipe-row-field-time-period-${recipeId}`}>
              <FieldRow icon="timePeriod" label="Time period" value={timePeriod} numberOfLines={1} variant="collapsed" />
            </View>
            {showDetailsButton ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Show more details"
                onPress={handleShowDetailsPress}
                style={styles.showDetailsButton}
                testID={`list-big-recipe-row-show-details-${recipeId}`}
              >
                <Text style={styles.showDetailsText}>Show Details</Text>
              </Pressable>
            ) : (
              <View style={styles.field} testID={`list-big-recipe-row-field-region-${recipeId}`}>
                <FieldRow icon="region" label="Region" value={region} numberOfLines={1} variant="collapsed" />
              </View>
            )}
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
        onPress={handleContainerPress}
        accessibilityRole="button"
        accessibilityLabel={detailsMode ? "Collapse recipe details" : "Expand recipe details"}
        layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
      >
        {headerContent}

        <Animated.View
          layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
          style={styles.descriptionBlock}
          testID={`list-big-recipe-row-description-block-${recipeId}`}
        >
          <FieldRow
            icon="description"
            label="Description"
            value={description}
            testID={`list-big-recipe-row-description-${recipeId}`}
            variant={detailsMode ? 'default' : 'collapsed'}
          />
        </Animated.View>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: theme.colors.surface.paper,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
    gap: 10,
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
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...theme.typography.sectionTitle,
    flex: 1,
  },
  minimizeButton: {
    height: theme.typography.sectionTitle.lineHeight,
    width: theme.typography.sectionTitle.lineHeight,
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
