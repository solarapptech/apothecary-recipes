import { Image, StyleSheet, Text, View } from 'react-native';
 
import { getRecipeImageSource } from '../assets/getRecipeImageSource';
import { theme } from '../ui/theme';

type CompactRecipeRowProps = {
  recipeId: number;
  title: string;
  difficultyScore: number;
  preparationTime: string;
};

export function CompactRecipeRow({
  recipeId,
  title,
  difficultyScore,
  preparationTime,
}: CompactRecipeRowProps) {
  const imageSource = getRecipeImageSource(recipeId);
  const displayTitle = title.replace(/\s*\n\s*/g, ' ');

  return (
    <View style={styles.container} testID={`compact-recipe-row-${recipeId}`}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.thumbnail}
          resizeMode="cover"
          testID={`compact-recipe-row-thumb-${recipeId}`}
          accessibilityLabel="Recipe image"
        />
      ) : (
        <View style={styles.thumbnail} testID={`compact-recipe-row-thumb-${recipeId}`}>
          <Text style={styles.thumbnailText} accessibilityLabel="Recipe image placeholder">
            IMG
          </Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
          testID={`compact-recipe-row-title-${recipeId}`}
        >
          {displayTitle}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText} numberOfLines={1} testID={`compact-recipe-row-difficulty-${recipeId}`}>
            Difficulty {difficultyScore}
          </Text>
          <Text style={styles.metaText} numberOfLines={1} testID={`compact-recipe-row-time-${recipeId}`}>
            {preparationTime}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface.paper,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  thumbnail: {
    height: 48,
    width: 48,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaText: {
    color: '#666',
    fontSize: 11,
    flexShrink: 1,
  },
});
