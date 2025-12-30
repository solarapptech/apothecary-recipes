import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';
 
import { getRecipeImageSource } from '../assets/getRecipeImageSource';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

import { FieldRow } from './FieldRow';

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
      style={[
        styles.container,
        expanded ? styles.containerOpened : null,
        expanded ? styles.containerExpanded : null,
      ]}
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
        <View style={styles.metaItem} testID={`recipe-grid-tile-difficulty-${recipeId}`}>
          <FieldIcon name="difficulty" size={14} color={theme.colors.brand.primary} />
          <Text style={styles.metaText} numberOfLines={1}>
            Difficulty {difficultyScore}
          </Text>
        </View>
        <View style={styles.metaItem} testID={`recipe-grid-tile-time-${recipeId}`}>
          <FieldIcon name="prepTime" size={14} color={theme.colors.brand.primary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {preparationTime}
          </Text>
        </View>
      </View>

      {expanded ? (
        <Animated.View
          entering={reduceMotionEnabled ? undefined : FadeIn.duration(animDuration)}
          exiting={reduceMotionEnabled ? undefined : FadeOut.duration(animDuration)}
          style={styles.expandedFields}
          testID={`recipe-grid-tile-expanded-fields-${recipeId}`}
        >
          <FieldRow icon="description" label="Description" value={description} />
          <FieldRow icon="timePeriod" label="Time period" value={timePeriod} />
          <FieldRow icon="region" label="Region" value={region} />
          <FieldRow icon="ingredients" label="Ingredients" value={ingredients} />
          <FieldRow icon="detailedMeasurements" label="Detailed Measurements" value={detailedMeasurements} />
          <FieldRow icon="preparationSteps" label="Preparation Steps" value={preparationSteps} />
          <FieldRow icon="usage" label="Usage" value={usage} />
          <FieldRow icon="warning" label="Warning" value={warning} />
          <FieldRow icon="historical" label="Historical" value={historicalContext} />
          <FieldRow icon="evidence" label="Evidence" value={scientificEvidence} />
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
  containerOpened: {
    backgroundColor: theme.colors.surface.recipeOpened,
    borderRadius: 14,
  },
  containerExpanded: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderRadius: 14,
  },
  thumbnail: {
    height: 128,
    width: '100%',
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
  title: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  metaText: {
    color: theme.colors.ink.muted,
    fontSize: 13,
    flexShrink: 1,
    fontFamily: theme.typography.fontFamily.sans.regular,
  },
  expandedFields: {
    marginTop: 8,
    gap: 6,
  },
});
