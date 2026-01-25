const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const freePath = path.join(repoRoot, 'src', 'data', 'free-recipes.json');
const premiumPath = path.join(repoRoot, 'src', 'data', 'recipes.json');
const ingredientMetadataPath = path.join(repoRoot, 'src', 'data', 'ingredient-metadata.json');

const ADJECTIVES = new Set([
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

const FORMS = new Set([
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

const EMPTY_USAGE = {
  summary: '',
  dosage: '',
  frequency: '',
  maxDuration: '',
  applicationAreas: '',
  bestPractices: '',
};

const EMPTY_STORAGE = {
  yield: '',
  shelfLife: '',
  costEstimate: '',
  storageTemp: '',
  spoilageIndicators: '',
};

const INGREDIENT_DEFAULTS = {
  description: '',
  ml: '',
  family: '',
  scientificName: '',
  usages: '',
  activeConstituents: '',
  safetyClassification: '',
  dosageGuidelines: '',
};

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeUsage(usage) {
  if (!usage || typeof usage === 'string') {
    return { ...EMPTY_USAGE, summary: usage ?? '' };
  }

  return {
    ...EMPTY_USAGE,
    ...usage,
    summary: typeof usage.summary === 'string' ? usage.summary : '',
  };
}

function normalizeStorage(storage) {
  if (!storage || typeof storage === 'string') {
    return { ...EMPTY_STORAGE };
  }

  return {
    ...EMPTY_STORAGE,
    ...storage,
  };
}

function normalizeEquipmentNeeded(equipmentNeeded) {
  if (Array.isArray(equipmentNeeded)) {
    return equipmentNeeded.filter((item) => typeof item === 'string');
  }

  return [];
}

function normalizeIngredientName(raw) {
  const tokens = String(raw)
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
    if (ADJECTIVES.has(cleaned) || FORMS.has(cleaned)) {
      return false;
    }
    return true;
  });

  const normalized = kept.join(' ').replace(/\s+/g, ' ').trim();
  return normalized || String(raw).trim();
}

function splitIngredients(ingredients) {
  if (!ingredients || typeof ingredients !== 'string') {
    return [];
  }

  return ingredients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildIngredientUsageMap(recipes) {
  const usageMap = new Map();

  for (const recipe of recipes) {
    const ingredientItems = splitIngredients(recipe.ingredients);

    for (const ingredient of ingredientItems) {
      const normalized = normalizeIngredientName(ingredient);
      const key = normalized.toLowerCase();

      if (!key) {
        continue;
      }

      if (!usageMap.has(key)) {
        usageMap.set(key, { ids: new Set(), titles: new Set(), displayName: normalized });
      }

      const entry = usageMap.get(key);
      entry.ids.add(recipe.id);
      entry.titles.add(recipe.title);
    }
  }

  return usageMap;
}

function buildIngredientMetadata(recipes) {
  const usageMap = buildIngredientUsageMap(recipes);
  const ingredientKeys = Array.from(usageMap.keys()).sort();
  const ingredientIndexByKey = new Map();
  ingredientKeys.forEach((key, index) => {
    ingredientIndexByKey.set(key, index);
  });

  const ingredients = ingredientKeys.map((key) => {
    const entry = usageMap.get(key);
    return {
      title: entry.displayName,
    };
  });

  const recipeMetadata = {};
  for (const recipe of recipes) {
    const ingredientItems = splitIngredients(recipe.ingredients);
    const normalizedKeys = Array.from(
      new Set(
        ingredientItems
          .map((ingredient) => normalizeIngredientName(ingredient))
          .map((normalized) => normalized.toLowerCase())
          .filter(Boolean)
      )
    );

    const ingredientIndexes = normalizedKeys
      .map((key) => ingredientIndexByKey.get(key))
      .filter((value) => typeof value === 'number')
      .sort((a, b) => a - b);

    recipeMetadata[String(recipe.id)] = {
      ingredientIndexes,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    ingredientDefaults: INGREDIENT_DEFAULTS,
    ingredientKeys,
    ingredients,
    recipes: recipeMetadata,
  };
}

function normalizeRecipes(recipes) {
  return recipes.map((recipe) => ({
    ...recipe,
    usage: normalizeUsage(recipe.usage),
    storage: normalizeStorage(recipe.storage),
    equipmentNeeded: normalizeEquipmentNeeded(recipe.equipmentNeeded),
  }));
}

function assignRecipeIds(free, premium) {
  free.forEach((recipe, index) => {
    const expectedId = index + 1;
    if (recipe.id != null && recipe.id !== expectedId) {
      throw new Error(`Free recipe ID mismatch at index ${index}: expected ${expectedId}, found ${recipe.id}`);
    }
  });

  const freeWithIds = free.map((recipe, index) => ({
    ...recipe,
    id: index + 1,
  }));

  premium.forEach((recipe, index) => {
    const expectedId = index + 1 + freeWithIds.length;
    if (recipe.id != null && recipe.id !== expectedId) {
      throw new Error(`Premium recipe ID mismatch at index ${index}: expected ${expectedId}, found ${recipe.id}`);
    }
  });

  const premiumWithIds = premium.map((recipe, index) => ({
    ...recipe,
    id: index + 1 + freeWithIds.length,
  }));

  return freeWithIds.concat(premiumWithIds);
}

function main() {
  const freeRecipes = normalizeRecipes(readJson(freePath));
  const premiumRecipes = normalizeRecipes(readJson(premiumPath));

  writeJson(freePath, freeRecipes);
  writeJson(premiumPath, premiumRecipes);

  const recipesWithIds = assignRecipeIds(freeRecipes, premiumRecipes);
  const ingredientMetadata = buildIngredientMetadata(recipesWithIds);
  writeJson(ingredientMetadataPath, ingredientMetadata);

  console.log('Updated recipe JSON files and generated ingredient metadata.');
  console.log(`- Free recipes: ${freeRecipes.length}`);
  console.log(`- Premium recipes: ${premiumRecipes.length}`);
  console.log(`- Ingredient metadata: ${ingredientMetadataPath}`);
}

main();
