import { Image, StyleSheet, Text, View } from 'react-native';
 
import { getRecipeImageSource } from '../assets/getRecipeImageSource';
import { theme } from '../ui/theme';

 const ACCENT_WIDTH = 8;

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
      <View pointerEvents="none" style={styles.accent} />
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingLeft: theme.spacing.md + ACCENT_WIDTH,
    backgroundColor: theme.colors.surface.paper,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  thumbnail: {
    height: 48,
    width: 48,
    borderRadius: 10,
    backgroundColor: theme.colors.surface.popover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    color: theme.colors.ink.subtle,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.medium,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaText: {
    color: theme.colors.ink.muted,
    fontSize: 11,
    flexShrink: 1,
  },
});
