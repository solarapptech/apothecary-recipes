import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInDown, Layout } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';

import { getRecipeImageSource } from '../assets/getRecipeImageSource';

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
};

type FieldProps = {
  label: string;
  value: string;
  testID: string;
};

function Field({ label, value, testID }: FieldProps) {
  return (
    <View style={styles.field} testID={testID}>
      <Text style={styles.fieldLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.fieldValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

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
}: ListBigRecipeRowProps) {
  const [detailsModeInternal, setDetailsModeInternal] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const imageSource = getRecipeImageSource(recipeId);

  const detailsMode = expanded ?? detailsModeInternal;
  const setDetailsMode = (next: boolean) => {
    if (onRequestSetExpanded) {
      onRequestSetExpanded(next);
      return;
    }
    setDetailsModeInternal(next);
  };

  const animDuration = motionDurationMs(reduceMotionEnabled, 150);

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
            style={[styles.title, detailsMode && styles.titleWrap]} 
            numberOfLines={detailsMode ? undefined : 1} 
            ellipsizeMode="tail" 
            testID={`list-big-recipe-row-title-${recipeId}`}
            layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
          >
            {title}
          </Animated.Text>
        </Animated.View>

        {detailsMode ? (
          <Animated.View
            layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
            style={[styles.detailsMode, styles.detailsModeClip]}
            testID={`list-big-recipe-row-details-mode-${recipeId}`}
          >
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(0)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Difficulty</Text>
              <Text style={styles.detailsValue}>{String(difficultyScore)}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(50)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Prep time</Text>
              <Text style={styles.detailsValue}>{preparationTime}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(100)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Time period</Text>
              <Text style={styles.detailsValue}>{timePeriod}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(150)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Region</Text>
              <Text style={styles.detailsValue}>{region}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(200)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Ingredients</Text>
              <Text style={styles.detailsValue}>{ingredients}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(250)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Detailed Measurements</Text>
              <Text style={styles.detailsValue}>{detailedMeasurements}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(300)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Preparation Steps</Text>
              <Text style={styles.detailsValue}>{preparationSteps}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(350)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Usage</Text>
              <Text style={styles.detailsValue}>{usage}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(400)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Warning</Text>
              <Text style={styles.detailsValue}>{warning}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(450)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Historical</Text>
              <Text style={styles.detailsValue}>{historicalContext}</Text>
            </Animated.View>
            <Animated.View 
              entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(500)}
              exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
              layout={reduceMotionEnabled ? undefined : Layout.duration(animDuration)}
              style={styles.detailsField}
            >
              <Text style={styles.detailsLabel}>Evidence</Text>
              <Text style={styles.detailsValue}>{scientificEvidence}</Text>
            </Animated.View>
            {showDetailsButton && (
              <Animated.View
                entering={reduceMotionEnabled ? undefined : FadeInDown.duration(animDuration).delay(550)}
                exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
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
            exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
            style={styles.fieldsGrid}
          >
            <Field
              label="Difficulty"
              value={String(difficultyScore)}
              testID={`list-big-recipe-row-field-difficulty-${recipeId}`}
            />
            <Field
              label="Prep time"
              value={preparationTime}
              testID={`list-big-recipe-row-field-prep-time-${recipeId}`}
            />
            <Field
              label="Time period"
              value={timePeriod}
              testID={`list-big-recipe-row-field-time-period-${recipeId}`}
            />
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
              <Field
                label="Region"
                value={region}
                testID={`list-big-recipe-row-field-region-${recipeId}`}
              />
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
          <Text style={styles.fieldLabel} numberOfLines={1}>
            Description
          </Text>
          <Text
            style={styles.descriptionText}
            testID={`list-big-recipe-row-description-${recipeId}`}
          >
            {description}
          </Text>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
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
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  titleWrap: {
    flex: undefined,
  },
  collapseButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  collapseButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
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
  detailsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  detailsValue: {
    fontSize: 13,
    color: '#111',
  },
  field: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
    justifyContent: 'flex-end',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  fieldValue: {
    fontSize: 13,
    color: '#111',
  },
  descriptionBlock: {
    gap: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#111',
  },
  readMore: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  readMoreText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
  },
  showDetailsButton: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
    justifyContent: 'flex-end',
  },
  showDetailsText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  showLessButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  showLessText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
});
