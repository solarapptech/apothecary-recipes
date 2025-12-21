import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';
 
import { getRecipeImageSource } from '../assets/getRecipeImageSource';

type RecipeGridTileProps = {
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
  expanded: boolean;
  reduceMotionEnabled?: boolean;
};

export function RecipeGridTile({
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
  expanded,
  reduceMotionEnabled = false,
}: RecipeGridTileProps) {
  const imageSource = getRecipeImageSource(recipeId);
  const animDuration = motionDurationMs(reduceMotionEnabled, 150);

  return (
    <View
      style={[styles.container, expanded ? styles.containerExpanded : null]}
      testID={expanded ? `recipe-grid-tile-expanded-${recipeId}` : `recipe-grid-tile-${recipeId}`}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.thumbnail}
          resizeMode="cover"
          testID={`recipe-grid-tile-thumb-${recipeId}`}
          accessibilityLabel="Recipe image"
        />
      ) : (
        <View style={styles.thumbnail} testID={`recipe-grid-tile-thumb-${recipeId}`}>
          <Text style={styles.thumbnailText} accessibilityLabel="Recipe image placeholder">
            IMG
          </Text>
        </View>
      )}

      <Text
        style={styles.title}
        numberOfLines={expanded ? undefined : 1}
        ellipsizeMode={expanded ? undefined : "tail"}
        testID={`recipe-grid-tile-title-${recipeId}`}
      >
        {title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText} numberOfLines={1} testID={`recipe-grid-tile-difficulty-${recipeId}`}>
          Difficulty {difficultyScore}
        </Text>
        <Text style={styles.metaText} numberOfLines={1} testID={`recipe-grid-tile-time-${recipeId}`}>
          {preparationTime}
        </Text>
      </View>

      {expanded ? (
        <Animated.View
          entering={reduceMotionEnabled ? undefined : FadeIn.duration(animDuration)}
          exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
          style={styles.expandedFields}
          testID={`recipe-grid-tile-expanded-fields-${recipeId}`}
        >
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Text style={styles.fieldValue}>{description}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Time period</Text>
            <Text style={styles.fieldValue}>{timePeriod}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Region</Text>
            <Text style={styles.fieldValue}>{region}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Ingredients</Text>
            <Text style={styles.fieldValue}>{ingredients}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Detailed Measurements</Text>
            <Text style={styles.fieldValue}>{detailedMeasurements}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Preparation Steps</Text>
            <Text style={styles.fieldValue}>{preparationSteps}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Usage</Text>
            <Text style={styles.fieldValue}>{usage}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Warning</Text>
            <Text style={styles.fieldValue}>{warning}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Historical</Text>
            <Text style={styles.fieldValue}>{historicalContext}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Evidence</Text>
            <Text style={styles.fieldValue}>{scientificEvidence}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  containerExpanded: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 14,
  },
  thumbnail: {
    height: 128,
    width: '100%',
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
  title: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaText: {
    color: '#666',
    fontSize: 13,
    flexShrink: 1,
  },
  expandedFields: {
    marginTop: 8,
    gap: 6,
  },
  fieldRow: {
    gap: 2,
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
});
