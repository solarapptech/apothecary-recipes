import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { RecipeImageEntry } from '../assets/recipeImageManifest';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

import type { RecipeUsage, RecipeStorage } from '../types/recipe';

import { DescriptionInline } from './DescriptionInline';
import { FieldRow } from './FieldRow';
import { ModalBackdrop } from './ModalBackdrop';
import { ModalCardBackground } from './ModalCardBackground';
import { PreparationStepsValue } from './PreparationStepsValue';
import { SecondaryFieldRow } from './SecondaryFieldRow';
import { WavePressable } from './WavePressable';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedPath = Animated.createAnimatedComponent(Path);

 const ACCENT_WIDTH = 8;

type AttributionImage = {
  imageNumber: number;
  title?: string;
  creator?: string;
  source?: string;
  license?: string;
  licenseUrl?: string;
  changes?: string;
};

type AttributionRecipe = {
  recipeNumber: number;
  name: string;
  images: AttributionImage[];
};

type AttributionData = {
  recipes: AttributionRecipe[];
};

const attributionData = require('../../assets/herbs/image-attributions.json') as AttributionData;

const EMPTY_TEXT = '—';

type IngredientDefaults = {
  description: string;
  ml: string;
  family: string;
  scientificName: string;
  usages: string;
  activeConstituents: string;
  safetyClassification: string;
  dosageGuidelines: string;
};

type IngredientDetail = IngredientDefaults & {
  title: string;
};

type IngredientMetadata = {
  ingredientDefaults: IngredientDefaults;
  ingredientKeys: string[];
  ingredients: Array<Partial<IngredientDetail> & { title: string }>;
  recipes: Record<string, { ingredientIndexes: number[] }>;
};

type IngredientRow = {
  id: string;
  raw: string;
  normalizedKey: string;
  detail: IngredientDetail;
};

const ingredientMetadata = require('../data/ingredient-metadata.json') as IngredientMetadata;
const ingredientKeyIndex = new Map(ingredientMetadata.ingredientKeys.map((key, index) => [key, index]));

const INGREDIENT_ADJECTIVES = new Set([
  'fresh',
  'dried',
  'dry',
  'powdered',
  'powder',
  'ground',
  'crushed',
  'chopped',
  'sliced',
  'finely',
  'coarsely',
  'whole',
  'raw',
  'wild',
  'organic',
  'clean',
  'purified',
  'filtered',
  'distilled',
  'warm',
  'hot',
  'cold',
]);

const INGREDIENT_FORMS = new Set([
  'root',
  'roots',
  'leaf',
  'leaves',
  'flower',
  'flowers',
  'stem',
  'stems',
  'bark',
  'berry',
  'berries',
  'seed',
  'seeds',
  'rhizome',
  'bulb',
  'bulbs',
  'peel',
  'rind',
  'zest',
  'fruit',
  'fruits',
  'pod',
  'pods',
  'resin',
  'sap',
  'gum',
  'bud',
  'buds',
  'cone',
  'cones',
  'needle',
  'needles',
  'sclerotium',
  'clove',
  'cloves',
  'wood',
  'frond',
  'fronds',
]);

const normalizeIngredientKey = (raw: string): string => {
  const tokens = raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const kept = tokens.filter((token) => {
    if (token.includes('(') || token.includes(')')) {
      return true;
    }
    const cleaned = token.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned) {
      return false;
    }
    if (INGREDIENT_ADJECTIVES.has(cleaned) || INGREDIENT_FORMS.has(cleaned)) {
      return false;
    }
    return true;
  });

  const normalized = kept.join(' ').replace(/\s+/g, ' ').trim();
  return (normalized || raw).toLowerCase();
};

const splitIngredientList = (value: string): string[] => {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveIngredientDetail = (index: number | undefined, fallbackTitle: string): IngredientDetail => {
  const base = ingredientMetadata.ingredientDefaults;
  const detail = typeof index === 'number' ? ingredientMetadata.ingredients[index] : undefined;

  return {
    ...base,
    ...detail,
    title: detail?.title ?? fallbackTitle,
  };
};

const formatIngredientValue = (value?: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_TEXT;
};

function formatUsage(usage: RecipeUsage): string {
  const summary = usage.summary?.trim();
  if (summary) {
    return summary;
  }

  const lines = [
    usage.dosage ? `Dosage: ${usage.dosage}` : '',
    usage.frequency ? `Frequency: ${usage.frequency}` : '',
    usage.maxDuration ? `Max Duration: ${usage.maxDuration}` : '',
    usage.applicationAreas ? `Application Areas: ${usage.applicationAreas}` : '',
    usage.bestPractices ? `Best Practices: ${usage.bestPractices}` : '',
  ].filter((line) => line.trim());

  return lines.length > 0 ? lines.join('\n') : EMPTY_TEXT;
}

type ListBigRecipeRowProps = {
  recipeId: number;
  title: string;
  description: string;
  timePeriod: string;
  warning: string;
  region: string;
  alternativeNames?: string;
  usedFor: string;
  ingredients: string;
  detailedMeasurements: string;
  preparationSteps: string;
  usage: RecipeUsage;
  storage: RecipeStorage;
  equipmentNeeded: string[];
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
  showDecorativeLeaves?: boolean;
};

export function ListBigRecipeRow({
  recipeId,
  title,
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
  storage,
  equipmentNeeded,
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
  showDecorativeLeaves = false,
}: ListBigRecipeRowProps) {
  const [detailsModeInternal, setDetailsModeInternal] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [attributionVisible, setAttributionVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null);
  const [usageExpanded, setUsageExpanded] = useState(false);
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [equipmentExpanded, setEquipmentExpanded] = useState(false);
  const imageEntries = getRecipeImageSource(recipeId);
  const imageCount = imageEntries?.length ?? 0;
  const activeImageEntry = imageEntries?.[Math.min(imageIndex, Math.max(imageCount - 1, 0))] ?? null;
  const activeImageSource = activeImageEntry?.source ?? null;

  const containerRef = useRef<any>(null);
  const carouselRef = useRef<ScrollView>(null);

  const minimizeFeedback = useSharedValue(0);

  const layoutRef = useRef({ width: 0, height: 0 });
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const diameter = useSharedValue(0);
  const waveProgress = useSharedValue(0);

  const detailsMode = expanded ?? detailsModeInternal;
  const summaryAllowsTitleWrap = showMinimizeButton && !detailsMode;
  const displayTitle = detailsMode || summaryAllowsTitleWrap ? title : title.replace(/\s*[\r\n]+\s*/g, ' ');
  const titleKey = detailsMode ? 'title-expanded' : 'title-collapsed';

  const usedForValue = usedFor
    .replace(/\s*[\r\n]+\s*/g, ' ')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');

  const ingredientsSummary = ingredients?.trim() ? ingredients.trim() : EMPTY_TEXT;

  const ingredientRows = useMemo<IngredientRow[]>(() => {
    const items = splitIngredientList(ingredients);

    return items.map((raw, index) => {
      const trimmed = raw.trim();
      const normalizedKey = normalizeIngredientKey(trimmed);
      const fallbackKey = trimmed.toLowerCase();
      const lookupKey = normalizedKey || fallbackKey;
      const metadataIndex = ingredientKeyIndex.get(lookupKey) ?? ingredientKeyIndex.get(fallbackKey);

      return {
        id: `${lookupKey || 'ingredient'}-${index}`,
        raw: trimmed,
        normalizedKey: lookupKey,
        detail: resolveIngredientDetail(metadataIndex, trimmed),
      };
    });
  }, [ingredients]);

  useEffect(() => {
    if (!detailsMode) {
      setImageModalVisible(false);
      setAttributionVisible(false);
      setIngredientsExpanded(false);
      setActiveIngredientId(null);
    }
  }, [detailsMode]);

  useEffect(() => {
    setImageIndex(0);
    setIngredientsExpanded(false);
    setActiveIngredientId(null);
  }, [recipeId]);

  const handleIngredientsToggle = () => {
    setIngredientsExpanded((prev) => {
      const next = !prev;
      if (!next) {
        setActiveIngredientId(null);
      }
      return next;
    });
  };

  const handleIngredientPress = (rowId: string) => {
    setActiveIngredientId((prev) => (prev === rowId ? null : rowId));
  };

  useEffect(() => {
    if (!imageEntries || imageEntries.length === 0) {
      setImageIndex(0);
      return;
    }

    if (imageIndex >= imageEntries.length) {
      setImageIndex(0);
    }
  }, [imageEntries, imageIndex]);

  useEffect(() => {
    if (!imageModalVisible || !carouselWidth) {
      return;
    }

    carouselRef.current?.scrollTo({ x: carouselWidth * imageIndex, animated: false });
  }, [carouselWidth, imageIndex, imageModalVisible]);

  const setDetailsMode = (next: boolean) => {
    if (onRequestSetExpanded) {
      onRequestSetExpanded(next);
      return;
    }
    setDetailsModeInternal(next);
  };

  const animDuration = motionDurationMs(reduceMotionEnabled, 150);
  const ingredientAnimDuration = motionDurationMs(reduceMotionEnabled, 300);
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

  const attributionEntry = useMemo(() => {
    if (!activeImageEntry || activeImageEntry.kind !== 'herb') {
      return null;
    }

    const recipeAttribution = attributionData.recipes.find((recipe) => recipe.recipeNumber === recipeId);
    if (!recipeAttribution) {
      return null;
    }

    const targetImageNumber = activeImageEntry.imageNumber ?? 1;
    return recipeAttribution.images.find((image) => image.imageNumber === targetImageNumber) ?? null;
  }, [activeImageEntry, recipeId]);

  const handleCarouselNav = (direction: -1 | 1) => {
    if (!imageEntries || imageEntries.length === 0) {
      return;
    }

    const nextIndex = (imageIndex + direction + imageEntries.length) % imageEntries.length;
    setImageIndex(nextIndex);

    if (carouselWidth > 0) {
      carouselRef.current?.scrollTo({ x: carouselWidth * nextIndex, animated: true });
    }
  };

  const isLinkValue = (value?: string) => Boolean(value?.trim() && /^https?:\/\//i.test(value.trim()));

  const handleOpenLink = async (url?: string) => {
    const trimmedUrl = url?.trim();
    if (!trimmedUrl) {
      return;
    }

    const canOpen = await Linking.canOpenURL(trimmedUrl);
    if (canOpen) {
      await Linking.openURL(trimmedUrl);
    }
  };

  const renderAttributionRow = (label: string, value?: string, link?: string) => {
    const trimmedValue = value?.trim();
    const linkValue = link?.trim();

    return (
      <View key={label} style={styles.attributionRow}>
        <Text style={styles.attributionLabel}>{label}</Text>
        {trimmedValue ? (
          linkValue ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                void handleOpenLink(linkValue);
              }}
            >
              <Text style={styles.attributionLink}>{trimmedValue}</Text>
            </Pressable>
          ) : (
            <Text style={styles.attributionValue}>{trimmedValue}</Text>
          )
        ) : (
          <Text style={styles.attributionValue}>—</Text>
        )}
      </View>
    );
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
      {activeImageSource ? (
        <Pressable
          testID={`list-big-recipe-row-thumb-pressable-${recipeId}`}
          onPress={(e) => {
            e.stopPropagation();

            if (!detailsMode) {
              onPress?.();
              return;
            }

            setAttributionVisible(false);
            setImageModalVisible(true);
          }}
        >
          <Image
            source={activeImageSource}
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
              numberOfLines={undefined}
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
          <View testID={`list-big-recipe-row-field-used-for-${recipeId}`}>
            <View style={styles.usedForField}>
              <Text style={styles.usedForLabel}>USED FOR</Text>
              <View style={styles.usedForValueRow}>
                <Text style={styles.usedForValue}>
                  {usedForValue || '—'}
                </Text>
              </View>
            </View>
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

        {showDecorativeLeaves ? (
          <View style={styles.decorativeLeavesContainer} pointerEvents="none">
            <Image source={require('../assets/leaves.png')} style={styles.leavesImage} />
          </View>
        ) : null}

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
              <Animated.View
                layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                style={styles.ingredientsGroupRow}
              >
                {!ingredientsExpanded ? (
                  <WavePressable
                    accessibilityRole="button"
                    accessibilityLabel="Show ingredients"
                    onPress={handleIngredientsToggle}
                    style={styles.ingredientsTogglePressable}
                    testID={`list-big-recipe-row-ingredients-toggle-${recipeId}`}
                    reduceMotionEnabled={reduceMotionEnabled}
                  >
                    <View style={styles.ingredientsHeader}>
                      <View style={styles.ingredientsHeaderLeft}>
                        <FieldIcon name="ingredients" size={18} />
                        <Text style={styles.ingredientsHeaderLabel}>Ingredients</Text>
                      </View>
                      <View style={styles.ingredientsHeaderRight}>
                        <Text style={styles.ingredientsHeaderCount}>
                          {ingredientRows.length ? `${ingredientRows.length} items` : '0 items'}
                        </Text>
                        <Svg width={18} height={18} viewBox="0 0 24 24">
                          <Path
                            d="M7 10l5 5 5-5"
                            fill="none"
                            stroke={theme.colors.brand.primaryStrong}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.ingredientsSummaryText}>{ingredientsSummary}</Text>
                  </WavePressable>
                ) : (
                  <>
                    <WavePressable
                      accessibilityRole="button"
                      accessibilityLabel="Hide ingredients"
                      onPress={handleIngredientsToggle}
                      style={styles.ingredientsTogglePressable}
                      testID={`list-big-recipe-row-ingredients-toggle-${recipeId}`}
                      reduceMotionEnabled={reduceMotionEnabled}
                    >
                      <View style={styles.ingredientsHeader}>
                        <View style={styles.ingredientsHeaderLeft}>
                          <FieldIcon name="ingredients" size={18} />
                          <Text style={styles.ingredientsHeaderLabel}>Ingredients</Text>
                        </View>
                        <View style={styles.ingredientsHeaderRight}>
                          <Text style={styles.ingredientsHeaderCount}>
                            {ingredientRows.length ? `${ingredientRows.length} items` : '0 items'}
                          </Text>
                          <Svg width={18} height={18} viewBox="0 0 24 24">
                            <Path
                              d="M7 14l5-5 5 5"
                              fill="none"
                              stroke={theme.colors.brand.primaryStrong}
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        </View>
                      </View>
                    </WavePressable>
                    <Animated.View
                      layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                      style={styles.ingredientsList}
                    >
                      {ingredientRows.length === 0 ? (
                        <Text style={styles.ingredientsEmptyText}>No ingredients listed.</Text>
                      ) : (
                        ingredientRows.map((row) => {
                          const isActive = activeIngredientId === row.id;

                          return (
                            <Animated.View
                              key={row.id}
                              layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                              style={styles.ingredientRow}
                            >
                              <WavePressable
                                accessibilityRole="button"
                                accessibilityLabel={isActive ? `Hide ${row.raw} details` : `Show ${row.raw} details`}
                                onPress={() => handleIngredientPress(row.id)}
                                style={[
                                  styles.ingredientRowHeader,
                                  styles.ingredientRowPressable,
                                  isActive && styles.ingredientRowHeaderActive,
                                ]}
                                testID={`list-big-recipe-row-ingredient-${recipeId}-${row.id}`}
                                reduceMotionEnabled={reduceMotionEnabled}
                              >
                                <View style={styles.ingredientRowText}>
                                  <Text style={styles.ingredientRowTitle}>{row.raw}</Text>
                                  {row.detail.scientificName?.trim() ? (
                                    <Text style={styles.ingredientRowSubtitle}>{row.detail.scientificName}</Text>
                                  ) : null}
                                  {!isActive && row.detail.description?.trim() ? (
                                    <Text style={styles.ingredientRowDescription}>{row.detail.description}</Text>
                                  ) : null}
                                  {!isActive ? (
                                    <Text style={styles.ingredientRowHint}>Tap to view herb details →</Text>
                                  ) : null}
                                </View>
                                <Svg width={18} height={18} viewBox="0 0 24 24">
                                  <Path
                                    d={isActive ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                                    fill="none"
                                    stroke={theme.colors.brand.primaryStrong}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Svg>
                              </WavePressable>

                              {isActive ? (
                                <Animated.View
                                  entering={reduceMotionEnabled ? undefined : FadeInDown.duration(ingredientAnimDuration)}
                                  exiting={enableExitAnimations ? FadeOut.duration(ingredientAnimDuration) : undefined}
                                  layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                                  style={styles.ingredientDetailPanel}
                                >
                                  <SecondaryFieldRow
                                    icon="description"
                                    label="Profile"
                                    value={formatIngredientValue(row.detail.description)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed={false}
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="usage"
                                    label="Medicinal language"
                                    value={formatIngredientValue(row.detail.ml)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="leaf"
                                    label="Family"
                                    value={formatIngredientValue(row.detail.family)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="historical"
                                    label="Scientific name"
                                    value={formatIngredientValue(row.detail.scientificName)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="usage"
                                    label="Therapeutic actions"
                                    value={formatIngredientValue(row.detail.usages)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="evidence"
                                    label="Active constituents"
                                    value={formatIngredientValue(row.detail.activeConstituents)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="warning"
                                    label="Safety classification"
                                    value={formatIngredientValue(row.detail.safetyClassification)}
                                    variant="grouped"
                                    showDivider
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                  <SecondaryFieldRow
                                    icon="usage"
                                    label="Dosage guidelines"
                                    value={formatIngredientValue(row.detail.dosageGuidelines)}
                                    variant="grouped"
                                    collapsible
                                    defaultCollapsed
                                    reduceMotionEnabled={reduceMotionEnabled}
                                  />
                                </Animated.View>
                              ) : null}
                            </Animated.View>
                          );
                        })
                      )}
                    </Animated.View>
                  </>
                )}
              </Animated.View>
              {/* Usage Instructions Section */}
              <Animated.View
                layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                style={styles.usageGroupRow}
              >
                <WavePressable
                  accessibilityRole="button"
                  accessibilityLabel={usageExpanded ? 'Hide usage instructions' : 'Show usage instructions'}
                  onPress={() => setUsageExpanded((prev) => !prev)}
                  style={styles.usageTogglePressable}
                  testID={`list-big-recipe-row-usage-toggle-${recipeId}`}
                  reduceMotionEnabled={reduceMotionEnabled}
                >
                  <View style={styles.usageHeader}>
                    <View style={styles.usageHeaderLeft}>
                      <FieldIcon name="usage" size={18} />
                      <Text style={styles.usageHeaderLabel}>Usage Instructions</Text>
                    </View>
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path
                        d={usageExpanded ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                        fill="none"
                        stroke={theme.colors.brand.primaryStrong}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  {!usageExpanded && usage.summary?.trim() ? (
                    <Text style={styles.usageSummaryText} numberOfLines={2}>{usage.summary}</Text>
                  ) : null}
                </WavePressable>
                {usageExpanded ? (
                  <Animated.View
                    entering={reduceMotionEnabled ? undefined : FadeInDown.duration(ingredientAnimDuration)}
                    exiting={enableExitAnimations ? FadeOut.duration(ingredientAnimDuration) : undefined}
                    layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                    style={styles.usageDetailPanel}
                  >
                    {usage.summary?.trim() ? (
                      <Text style={styles.usageFullSummary}>{usage.summary}</Text>
                    ) : null}
                    <View style={styles.usageGrid}>
                      {usage.dosage?.trim() ? (
                        <View style={styles.usageGridItem}>
                          <Text style={styles.usageGridLabel}>Dosage</Text>
                          <Text style={styles.usageGridValue}>{usage.dosage}</Text>
                        </View>
                      ) : null}
                      {usage.frequency?.trim() ? (
                        <View style={styles.usageGridItem}>
                          <Text style={styles.usageGridLabel}>Frequency</Text>
                          <Text style={styles.usageGridValue}>{usage.frequency}</Text>
                        </View>
                      ) : null}
                      {usage.maxDuration?.trim() ? (
                        <View style={styles.usageGridItem}>
                          <Text style={styles.usageGridLabel}>Max Duration</Text>
                          <Text style={styles.usageGridValue}>{usage.maxDuration}</Text>
                        </View>
                      ) : null}
                      {usage.applicationAreas?.trim() ? (
                        <View style={styles.usageGridItem}>
                          <Text style={styles.usageGridLabel}>Application Areas</Text>
                          <Text style={styles.usageGridValue}>{usage.applicationAreas}</Text>
                        </View>
                      ) : null}
                    </View>
                    {usage.bestPractices?.trim() ? (
                      <View style={styles.usageBestPractices}>
                        <Text style={styles.usageBestPracticesLabel}>Best Practices</Text>
                        {usage.bestPractices.split('\n').filter(Boolean).map((line, idx) => (
                          <Text key={idx} style={styles.usageBestPracticesItem}>• {line.replace(/^[-•]\s*/, '')}</Text>
                        ))}
                      </View>
                    ) : null}
                  </Animated.View>
                ) : null}
              </Animated.View>

              {/* Yield & Storage Section */}
              <Animated.View
                layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                style={styles.storageGroupRow}
              >
                <WavePressable
                  accessibilityRole="button"
                  accessibilityLabel={storageExpanded ? 'Hide yield and storage' : 'Show yield and storage'}
                  onPress={() => setStorageExpanded((prev) => !prev)}
                  style={styles.storageTogglePressable}
                  testID={`list-big-recipe-row-storage-toggle-${recipeId}`}
                  reduceMotionEnabled={reduceMotionEnabled}
                >
                  <View style={styles.storageHeader}>
                    <View style={styles.storageHeaderLeft}>
                      <FieldIcon name="storage" size={18} />
                      <Text style={styles.storageHeaderLabel}>Yield & Storage</Text>
                    </View>
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path
                        d={storageExpanded ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                        fill="none"
                        stroke={theme.colors.brand.primaryStrong}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                </WavePressable>
                {storageExpanded ? (
                  <Animated.View
                    entering={reduceMotionEnabled ? undefined : FadeInDown.duration(ingredientAnimDuration)}
                    exiting={enableExitAnimations ? FadeOut.duration(ingredientAnimDuration) : undefined}
                    layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                    style={styles.storageDetailPanel}
                  >
                    <View style={styles.storageGrid}>
                      {storage.yield?.trim() ? (
                        <View style={styles.storageGridItem}>
                          <Text style={styles.storageGridLabel}>Yield</Text>
                          <Text style={styles.storageGridValue}>{storage.yield}</Text>
                        </View>
                      ) : null}
                      {storage.shelfLife?.trim() ? (
                        <View style={styles.storageGridItem}>
                          <Text style={styles.storageGridLabel}>Shelf Life</Text>
                          <Text style={styles.storageGridValue}>{storage.shelfLife}</Text>
                        </View>
                      ) : null}
                      {storage.costEstimate?.trim() ? (
                        <View style={styles.storageGridItem}>
                          <Text style={styles.storageGridLabel}>Cost Estimate</Text>
                          <Text style={styles.storageGridValue}>{storage.costEstimate}</Text>
                        </View>
                      ) : null}
                      {storage.storageTemp?.trim() ? (
                        <View style={styles.storageGridItem}>
                          <Text style={styles.storageGridLabel}>Storage Temp</Text>
                          <Text style={styles.storageGridValue}>{storage.storageTemp}</Text>
                        </View>
                      ) : null}
                    </View>
                    {storage.spoilageIndicators?.trim() ? (
                      <View style={styles.storageSpoilage}>
                        <Text style={styles.storageSpoilageLabel}>Spoilage Indicators</Text>
                        <Text style={styles.storageSpoilageValue}>{storage.spoilageIndicators}</Text>
                      </View>
                    ) : null}
                  </Animated.View>
                ) : null}
              </Animated.View>

              {/* Equipment Needed Section */}
              {equipmentNeeded && equipmentNeeded.length > 0 ? (
                <Animated.View
                  layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                  style={styles.equipmentGroupRow}
                >
                  <WavePressable
                    accessibilityRole="button"
                    accessibilityLabel={equipmentExpanded ? 'Hide equipment needed' : 'Show equipment needed'}
                    onPress={() => setEquipmentExpanded((prev) => !prev)}
                    style={styles.equipmentTogglePressable}
                    testID={`list-big-recipe-row-equipment-toggle-${recipeId}`}
                    reduceMotionEnabled={reduceMotionEnabled}
                  >
                    <View style={styles.equipmentHeader}>
                      <View style={styles.equipmentHeaderLeft}>
                        <FieldIcon name="equipment" size={18} />
                        <Text style={styles.equipmentHeaderLabel}>Equipment Needed</Text>
                      </View>
                      <Svg width={18} height={18} viewBox="0 0 24 24">
                        <Path
                          d={equipmentExpanded ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                          fill="none"
                          stroke={theme.colors.brand.primaryStrong}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </WavePressable>
                  {equipmentExpanded ? (
                    <Animated.View
                      entering={reduceMotionEnabled ? undefined : FadeInDown.duration(ingredientAnimDuration)}
                      exiting={enableExitAnimations ? FadeOut.duration(ingredientAnimDuration) : undefined}
                      layout={reduceMotionEnabled ? undefined : Layout.duration(ingredientAnimDuration)}
                      style={styles.equipmentDetailPanel}
                    >
                      <View style={styles.equipmentChips}>
                        {equipmentNeeded.map((item, idx) => (
                          <View key={idx} style={styles.equipmentChip}>
                            <Text style={styles.equipmentChipText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </Animated.View>
                  ) : null}
                </Animated.View>
              ) : null}

              <SecondaryFieldRow
                icon="historical"
                label="Historical"
                value={historicalContext}
                variant="grouped"
              />
              <SecondaryFieldRow
                icon="region"
                label="Region"
                value={region}
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
                reduceMotionEnabled={reduceMotionEnabled}
              />
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
      onRequestClose={() => {
        setImageModalVisible(false);
        setAttributionVisible(false);
      }}
    >
      <ModalBackdrop
        testID={`list-big-recipe-row-image-modal-overlay-${recipeId}`}
        onPress={() => {
          setImageModalVisible(false);
          setAttributionVisible(false);
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={styles.modalCardWrapper}
        >
          <ModalCardBackground style={styles.modalCard}>
            <View
              style={styles.modalContent}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                if (width > 0 && width !== carouselWidth) {
                  setCarouselWidth(width);
                  carouselRef.current?.scrollTo({ x: width * imageIndex, animated: false });
                }
              }}
            >
              <View style={styles.carouselContainer}>
                {imageEntries ? (
                  <ScrollView
                    ref={carouselRef}
                    horizontal
                    pagingEnabled
                    decelerationRate="fast"
                    snapToInterval={carouselWidth || 1}
                    snapToAlignment="start"
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(event) => {
                      if (!carouselWidth) {
                        return;
                      }
                      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
                      setImageIndex(nextIndex);
                    }}
                  >
                    {imageEntries.map((entry: RecipeImageEntry, entryIndex: number) => (
                      <View
                        key={`${recipeId}-image-${entry.kind}-${entryIndex}`}
                        style={[styles.carouselSlide, { width: Math.max(carouselWidth, 1) }]}
                      >
                        <Image
                          source={entry.source}
                          style={styles.modalImage}
                          resizeMode="contain"
                          testID={`list-big-recipe-row-image-modal-image-${recipeId}-${entryIndex}`}
                        />
                      </View>
                    ))}
                  </ScrollView>
                ) : null}

                {imageCount > 1 ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Previous image"
                      style={[styles.carouselNavButton, styles.carouselNavLeft]}
                      onPress={() => handleCarouselNav(-1)}
                    >
                      <Text style={styles.carouselNavText}>‹</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Next image"
                      style={[styles.carouselNavButton, styles.carouselNavRight]}
                      onPress={() => handleCarouselNav(1)}
                    >
                      <Text style={styles.carouselNavText}>›</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>

              <View style={styles.modalActionsRow}>
                {imageCount > 0 ? (
                  <Text style={styles.imageCounter}>{`${Math.min(imageIndex + 1, imageCount)}/${imageCount}`}</Text>
                ) : null}
                {activeImageEntry?.kind === 'ai' ? (
                  <Text style={styles.aiAttributionText}>AI Representation</Text>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Show image attribution"
                    style={styles.attributionButton}
                    onPress={() => setAttributionVisible(true)}
                  >
                    <Text style={styles.attributionButtonText}>Attribution</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ModalCardBackground>
        </Pressable>
      </ModalBackdrop>
    </Modal>

    <Modal
      visible={attributionVisible}
      transparent={true}
      animationType={reduceMotionEnabled ? "none" : "fade"}
      onRequestClose={() => setAttributionVisible(false)}
    >
      <ModalBackdrop
        onPress={() => setAttributionVisible(false)}
        testID={`list-big-recipe-row-attribution-modal-overlay-${recipeId}`}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={styles.attributionCardWrapper}
        >
          <ModalCardBackground style={styles.attributionCard}>
            <View style={styles.attributionContent}
              testID={`list-big-recipe-row-attribution-modal-${recipeId}`}
            >
              <Text style={styles.attributionTitle}>Image Attribution</Text>
              {activeImageEntry?.kind === 'ai' ? (
                <Text style={styles.attributionValue}>AI-generated image (no attribution required).</Text>
              ) : (
                <>
                  {renderAttributionRow('Title', attributionEntry?.title)}
                  {renderAttributionRow('Creator', attributionEntry?.creator)}
                  {renderAttributionRow(
                    'Source',
                    attributionEntry?.source,
                    isLinkValue(attributionEntry?.source) ? attributionEntry?.source : undefined
                  )}
                  {renderAttributionRow('License', attributionEntry?.license)}
                  {renderAttributionRow(
                    'License URL',
                    attributionEntry?.licenseUrl,
                    isLinkValue(attributionEntry?.licenseUrl) ? attributionEntry?.licenseUrl : undefined
                  )}
                  {renderAttributionRow('Changes', attributionEntry?.changes)}
                </>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close attribution"
                onPress={() => setAttributionVisible(false)}
                style={styles.attributionCloseButton}
              >
                <Text style={styles.attributionCloseText}>Close</Text>
              </Pressable>
            </View>
          </ModalCardBackground>
        </Pressable>
      </ModalBackdrop>
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
    paddingTop: 24,
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
    paddingVertical: 2,
    paddingHorizontal: 0,
    marginRight: 0,
    marginTop: -5,
    alignSelf: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  titlePressable: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
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
  usedForField: {
    alignItems: 'flex-start',
    gap: 4,
    marginLeft: 0,
    maxWidth: '100%',
  },
  usedForLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: theme.colors.ink.onBrand,
    textTransform: 'uppercase',
    backgroundColor: theme.colors.brand.prepTimeGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  usedForValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  usedForValue: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.brand.primary,
    flexShrink: 1,
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
  ingredientsCard: {
    backgroundColor: theme.colors.surface.secondaryField,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
  },
  ingredientsGroupRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
  },
  ingredientsTogglePressable: {
    gap: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  ingredientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  ingredientsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ingredientsHeaderLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.brand.primaryStrong,
    textTransform: 'uppercase',
  },
  ingredientsHeaderCount: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.subtle,
  },
  ingredientsSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  ingredientsList: {
    gap: 10,
    paddingTop: 4,
  },
  ingredientsEmptyText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.subtle,
  },
  ingredientRow: {
    gap: 8,
  },
  ingredientRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.paper,
  },
  ingredientRowPressable: {
    overflow: 'hidden',
  },
  ingredientRowHeaderActive: {
    backgroundColor: theme.colors.surface.dropdownHighlight,
    borderColor: theme.colors.brand.primaryStrong,
  },
  ingredientRowText: {
    flex: 1,
    gap: 4,
  },
  ingredientRowTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  ingredientRowSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.subtle,
  },
  ingredientRowDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
  },
  ingredientRowHint: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.brand.primary,
  },
  ingredientDetailPanel: {
    backgroundColor: theme.colors.surface.paper,
    borderRadius: 12,
    overflow: 'hidden',
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
  modalCardWrapper: {
    width: '90%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  modalCard: {
    borderRadius: 20,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  modalContent: {
    gap: 8,
  },
  carouselContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  modalImage: {
    width: '100%',
    height: 360,
    borderRadius: 12,
  },
  carouselNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 18, 10, 0.35)',
    opacity: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselNavLeft: {
    left: 8,
  },
  carouselNavRight: {
    right: 8,
  },
  carouselNavText: {
    fontSize: 20,
    color: theme.colors.ink.onBrand,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  imageCounter: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.subtle,
  },
  attributionButton: {
    borderRadius: theme.radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.brand.primaryStrong,
  },
  attributionButtonText: {
    color: theme.colors.ink.onBrand,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    letterSpacing: 0.3,
  },
  aiAttributionText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  attributionCardWrapper: {
    width: '92%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  attributionCard: {
    borderRadius: 18,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  attributionContent: {
    gap: 8,
  },
  attributionTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  attributionRow: {
    gap: 2,
  },
  attributionLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  attributionValue: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.primary,
  },
  attributionLink: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.brand.primary,
    textDecorationLine: 'underline',
  },
  attributionCloseButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  attributionCloseText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.brand.primary,
  },
  // Usage section styles
  usageGroupRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
  },
  usageTogglePressable: {
    gap: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
  },
  usageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usageHeaderLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.brand.primaryStrong,
    textTransform: 'uppercase',
  },
  usageSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
    paddingHorizontal: 0,
  },
  usageDetailPanel: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  usageFullSummary: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  usageGridItem: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface.paper,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  usageGridLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.muted,
  },
  usageGridValue: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  usageBestPractices: {
    gap: 6,
  },
  usageBestPracticesLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.muted,
  },
  usageBestPracticesItem: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
    paddingLeft: 4,
  },
  // Storage section styles
  storageGroupRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
  },
  storageTogglePressable: {
    gap: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
  },
  storageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageHeaderLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.brand.primaryStrong,
    textTransform: 'uppercase',
  },
  storageDetailPanel: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  storageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storageGridItem: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface.paper,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  storageGridLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.muted,
  },
  storageGridValue: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  storageSpoilage: {
    gap: 4,
  },
  storageSpoilageLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.muted,
  },
  storageSpoilageValue: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
  },
  // Equipment section styles
  equipmentGroupRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
  },
  equipmentTogglePressable: {
    gap: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
  },
  equipmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentHeaderLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.brand.primaryStrong,
    textTransform: 'uppercase',
  },
  equipmentDetailPanel: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
  },
  equipmentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    backgroundColor: theme.colors.surface.paper,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
  },
  equipmentChipText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.primary,
  },
});
