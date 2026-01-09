import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
 
import { getRecipeImageSource } from '../assets/getRecipeImageSource';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

 const ACCENT_WIDTH = 8;

type CompactRecipeRowProps = {
  recipeId: number;
  title: string;
  usedFor: string;
  isFavorite?: boolean;
  onPressFavorite?: () => void;
  dimmed?: boolean;
};

export function CompactRecipeRow({
  recipeId,
  title,
  usedFor,
  isFavorite = false,
  onPressFavorite,
  dimmed = false,
}: CompactRecipeRowProps) {
  const imageSource = getRecipeImageSource(recipeId);
  const displayTitle = title.replace(/\s*[\r\n]+\s*/g, ' ');

  const usedForValue = usedFor
    .replace(/\s*[\r\n]+\s*/g, ' ')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');

  return (
    <View
      style={[styles.container, dimmed && styles.containerDimmed]}
      testID={`compact-recipe-row-${recipeId}`}
    >
      <View style={styles.contentClip}>
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
            <View style={styles.usedForRow} testID={`compact-recipe-row-used-for-${recipeId}`}>
              <FieldIcon name="info" size={12} color={theme.colors.ink.muted} />
              <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                {usedForValue}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        onPress={(e) => {
          (e as any)?.stopPropagation?.();
          onPressFavorite?.();
        }}
        style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : styles.favoriteButtonInactive]}
        testID={`compact-recipe-row-favorite-${recipeId}`}
      >
        <Text style={[styles.favoriteIcon, isFavorite ? styles.favoriteIconActive : styles.favoriteIconInactive]}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface.paper,
    borderRadius: theme.radii.lg,
    overflow: 'visible',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  containerDimmed: {
    borderColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
  contentClip: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingLeft: theme.spacing.md + ACCENT_WIDTH,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 26,
    minWidth: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
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
    fontSize: 16,
  },
  favoriteIconInactive: {
    color: theme.colors.ink.primary,
  },
  favoriteIconActive: {
    color: theme.colors.ink.primary,
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
    justifyContent: 'flex-start',
    gap: 12,
  },
  usedForRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    color: theme.colors.ink.muted,
    fontSize: 11,
    flexShrink: 1,
  },
});
