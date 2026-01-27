import type {
  IngredientMetadataEntry,
  ScrapedIngredientMetadata,
} from '../types/ingredientMetadata';

const scrapedData = require('../data/ingredient-metadata-scraped.json') as ScrapedIngredientMetadata;

const INGREDIENT_DEFAULTS: IngredientMetadataEntry = {
  description: '',
  ml: '',
  family: '',
  scientificName: '',
  usages: '',
  activeConstituents: '',
  safetyClassification: '',
  dosageGuidelines: '',
};

const SKIPPED_INGREDIENTS = new Set([
  'water',
  'honey',
  'sugar',
  'salt',
  'milk',
  'butter',
  'eggs',
  'egg',
  'flour',
  'oil',
  'vinegar',
  'lemon',
  'lime',
  'orange',
  'apple',
  'wine',
  'beer',
  'cream',
  'yogurt',
  'cheese',
  'bread',
  'rice',
  'oats',
  'wheat',
  'corn',
  'potato',
  'onion',
  'garlic',
  'pepper',
  'black pepper',
  'white pepper',
  'sea salt',
  'table salt',
  'rock salt',
  'brown sugar',
  'white sugar',
  'cane sugar',
  'maple syrup',
  'molasses',
  'agave',
  'stevia',
  'coconut oil',
  'vegetable oil',
  'sunflower oil',
  'sesame oil',
  'ghee',
  'lard',
  'beeswax',
  'lanolin',
  'glycerin',
  'glycerine',
  'witch hazel',
  'distilled water',
  'spring water',
  'filtered water',
  'purified water',
  'tap water',
  'hot water',
  'cold water',
  'warm water',
  'boiling water',
  'ice',
  'ice water',
  'aquavit',
  'claret',
  'riesling',
  'sherry',
  'port',
  'mead',
  'cider',
  'tallow',
  'brandy vodka',
  'brandy wine',
  'ghee butter',
  'honey sugar',
  'lard tallow',
  'water milk',
]);

const INGREDIENT_STOPWORDS = new Set(['and', 'or']);

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
  'minced',
  'shredded',
  'grated',
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
  'aerial',
  'parts',
  'tuber',
  'corm',
  'gel',
  'juice',
  'oil',
  'extract',
  'tincture',
  'inner',
  'outer',
  'heads',
  'tops',
  'slices',
  'pieces',
  'chunks',
]);

/**
 * Normalizes an ingredient string by removing adjectives, forms, and parenthetical content.
 * Returns a lowercase key suitable for lookup.
 */
export function normalizeIngredientKey(raw: string): string {
  let cleaned = raw
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-zA-Z\s'-]/g, ' ')
    .toLowerCase()
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const kept = tokens.filter((token) => {
    const normalized = token.replace(/[^a-z]/g, '');
    if (!normalized) return false;
    if (INGREDIENT_STOPWORDS.has(normalized)) return false;
    if (INGREDIENT_ADJECTIVES.has(normalized)) return false;
    if (INGREDIENT_FORMS.has(normalized)) return false;
    return true;
  });

  const result = kept.join(' ').trim();
  return result || raw.toLowerCase().trim();
}

/**
 * Converts plural forms to singular (bilberries → bilberry, cloudberries → cloudberry)
 */
function singularize(word: string): string {
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && word.length > 3) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && word.length > 2 && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Normalizes apostrophes and special characters for matching
 */
function normalizeForLookup(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\bst\b\.?\s*/gi, 'st. ')
    .trim();
}

/**
 * Attempts multiple lookup strategies to find ingredient metadata.
 */
function findIngredientEntry(normalizedKey: string, originalRaw: string): IngredientMetadataEntry | null {
  const ingredients = scrapedData.ingredients;

  if (ingredients[normalizedKey]) {
    return ingredients[normalizedKey];
  }

  const rawLower = normalizeForLookup(originalRaw);
  if (ingredients[rawLower]) {
    return ingredients[rawLower];
  }

  const withoutParens = rawLower.replace(/\([^)]*\)/g, '').trim();
  if (withoutParens !== rawLower && ingredients[withoutParens]) {
    return ingredients[withoutParens];
  }

  // Try with "st." prefix normalization for St. John's Wort etc.
  const withStPeriod = normalizedKey.replace(/\bst\s+/gi, 'st. ');
  if (withStPeriod !== normalizedKey && ingredients[withStPeriod]) {
    return ingredients[withStPeriod];
  }

  const singularKey = singularize(normalizedKey);
  if (singularKey !== normalizedKey && ingredients[singularKey]) {
    return ingredients[singularKey];
  }

  const tokens = normalizedKey.split(/\s+/);
  const singularTokens = tokens.map(singularize).join(' ');
  if (singularTokens !== normalizedKey && ingredients[singularTokens]) {
    return ingredients[singularTokens];
  }

  for (const key of Object.keys(ingredients)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return ingredients[key];
    }
  }

  // Try with st. period variant
  if (withStPeriod !== normalizedKey) {
    for (const key of Object.keys(ingredients)) {
      if (withStPeriod.includes(key) || key.includes(withStPeriod)) {
        return ingredients[key];
      }
    }
  }

  if (singularKey !== normalizedKey) {
    for (const key of Object.keys(ingredients)) {
      if (singularKey.includes(key) || key.includes(singularKey)) {
        return ingredients[key];
      }
    }
  }

  const firstWord = normalizedKey.split(/\s+/)[0];
  if (firstWord && firstWord.length > 3) {
    const singularFirst = singularize(firstWord);
    for (const key of Object.keys(ingredients)) {
      if (key.startsWith(firstWord) || key.includes(firstWord) ||
          key.startsWith(singularFirst) || key.includes(singularFirst)) {
        return ingredients[key];
      }
    }
  }

  return null;
}

/**
 * Retrieves ingredient metadata for a given raw ingredient string.
 * Returns defaults if no match is found.
 */
export function getIngredientMetadata(raw: string): IngredientMetadataEntry & { title: string } {
  const normalizedKey = normalizeIngredientKey(raw);
  const entry = findIngredientEntry(normalizedKey, raw);

  if (entry) {
    return {
      ...entry,
      title: raw.trim(),
    };
  }

  return {
    ...INGREDIENT_DEFAULTS,
    title: raw.trim(),
  };
}

/**
 * Returns all available ingredient keys from the scraped data.
 */
export function getAllIngredientKeys(): string[] {
  return Object.keys(scrapedData.ingredients);
}

/**
 * Checks if scraped metadata exists for a given ingredient.
 */
export function hasIngredientMetadata(raw: string): boolean {
  const normalizedKey = normalizeIngredientKey(raw);
  return findIngredientEntry(normalizedKey, raw) !== null;
}

/**
 * Checks if an ingredient should be skipped (common non-botanical items like water, honey, etc.)
 */
export function isSkippedIngredient(raw: string): boolean {
  const normalizedKey = normalizeIngredientKey(raw);
  const rawLower = raw.toLowerCase().trim();

  if (SKIPPED_INGREDIENTS.has(normalizedKey)) {
    return true;
  }

  if (SKIPPED_INGREDIENTS.has(rawLower)) {
    return true;
  }

  return false;
}
