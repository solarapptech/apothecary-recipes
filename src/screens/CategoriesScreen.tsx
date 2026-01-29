import { useEffect } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../ui/theme';

const HEADER_HEIGHT = 56;

type CategoryItem = {
  id: string;
  name: string;
  count: number;
  icon: 'leaf' | 'flower' | 'root' | 'berry' | 'herb' | 'potion';
};

type CategoriesScreenProps = {
  onBackPress: () => void;
  categories: CategoryItem[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId?: string | null;
};

function CategoryIcon({ name, size = 28, color }: { name: CategoryItem['icon']; size?: number; color: string }) {
  switch (name) {
    case 'leaf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 4C14 4 9.5 6.5 7.2 9.9C5.7 12.1 5 14.7 5 17.5V20H7.5C10.3 20 12.9 19.3 15.1 17.8C18.5 15.5 21 11 21 5V4H20Z"
            fill={color}
          />
        </Svg>
      );
    case 'flower':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C12 2 9 5 9 8C9 9.66 10.34 11 12 11C13.66 11 15 9.66 15 8C15 5 12 2 12 2Z"
            fill={color}
          />
          <Path
            d="M19.07 7.93C19.07 7.93 15 7 13.5 9.5C12.67 10.94 13.34 12.66 14.78 13.5C16.22 14.34 19.07 12.07 19.07 12.07C19.07 12.07 19.07 7.93 19.07 7.93Z"
            fill={color}
          />
          <Path
            d="M4.93 7.93C4.93 7.93 9 7 10.5 9.5C11.33 10.94 10.66 12.66 9.22 13.5C7.78 14.34 4.93 12.07 4.93 12.07C4.93 12.07 4.93 7.93 4.93 7.93Z"
            fill={color}
          />
          <Path
            d="M12 22C12 22 15 19 15 16C15 14.34 13.66 13 12 13C10.34 13 9 14.34 9 16C9 19 12 22 12 22Z"
            fill={color}
          />
        </Svg>
      );
    case 'root':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2V8M12 8C12 8 8 10 8 14C8 16.21 9.79 18 12 18C14.21 18 16 16.21 16 14C16 10 12 8 12 8Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path d="M8 18L6 22" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M16 18L18 22" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 18V22" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'berry':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6Z"
            fill={color}
          />
          <Path d="M12 2V6" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M9 3L12 6L15 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'herb':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 20C7 20 7 12 12 8C17 12 17 20 17 20"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M12 8V4" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M9 5L12 8L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'potion':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 3H15V7L19 14V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V14L9 7V3Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M9 3H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M7 14H17" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
  }
}

const CATEGORY_ICONS: CategoryItem['icon'][] = ['leaf', 'flower', 'root', 'berry', 'herb', 'potion'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedCategoryCard({
  category,
  index,
  cardWidth,
  onSelect,
  isSelected,
}: {
  category: CategoryItem;
  index: number;
  cardWidth: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 40;
    opacity.value = withDelay(delay, withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }));
  }, [index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const iconType = CATEGORY_ICONS[index % CATEGORY_ICONS.length];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${category.name} - ${category.count} recipes`}
      onPress={onSelect}
      style={[styles.categoryCard, isSelected ? styles.categoryCardSelected : null, { width: cardWidth }, animatedStyle]}
      testID={`category-card-${category.id}`}
    >
      <View style={[styles.iconContainer, isSelected ? styles.iconContainerSelected : null]}>
        <CategoryIcon
          name={iconType}
          color={isSelected ? theme.colors.ink.onBrand : theme.colors.brand.primary}
        />
      </View>
      <Text style={[styles.categoryName, isSelected ? styles.categoryNameSelected : null]} numberOfLines={2}>
        {category.name}
      </Text>
      <Text style={[styles.categoryCount, isSelected ? styles.categoryCountSelected : null]}>
        {category.count} {category.count === 1 ? 'recipe' : 'recipes'}
      </Text>
    </AnimatedPressable>
  );
}

export function CategoriesScreen({
  onBackPress,
  categories,
  onSelectCategory,
  selectedCategoryId,
}: CategoriesScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  const horizontalPadding = 20;
  const gap = 12;
  const numColumns = windowWidth > 600 ? 3 : 2;
  const cardWidth = (windowWidth - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns;

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.header,
          androidTopInset > 0 ? { paddingTop: androidTopInset, height: HEADER_HEIGHT + androidTopInset } : null,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBackPress}
          style={styles.backButton}
          testID="categories-back-button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Browse recipes by category</Text>

        <View style={[styles.grid, { gap }]}>
          {categories.map((category, index) => (
            <AnimatedCategoryCard
              key={category.id}
              category={category}
              index={index}
              cardWidth={cardWidth}
              onSelect={() => onSelectCategory(category.id)}
              isSelected={category.id === (selectedCategoryId ?? null)}
            />
          ))}
        </View>

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No categories available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: theme.colors.ink.primary,
  },
  headerTitle: {
    ...theme.typography.headerTitle,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 14,
    color: theme.colors.ink.muted,
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryCard: {
    backgroundColor: theme.colors.surface.paperStrong,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryCardSelected: {
    borderColor: theme.colors.brand.primaryStrong,
    backgroundColor: theme.colors.brand.primaryStrong,
  },
  categoryCardPressed: {
    backgroundColor: theme.colors.surface.secondaryField,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brand.moreInfoGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  categoryName: {
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.ink.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryNameSelected: {
    color: theme.colors.ink.onBrand,
  },
  categoryCount: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 12,
    color: theme.colors.ink.muted,
  },
  categoryCountSelected: {
    color: theme.colors.ink.onBrand,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 14,
    color: theme.colors.ink.muted,
  },
});
