const fs = require('fs');
const path = require('path');

const freeRecipes = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'free-recipes.json'), 'utf8')
);

const metadataSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'repositories', 'ingredientMetadataRepository.ts'),
  'utf8'
);

const skippedMatch = metadataSource.match(
  /const SKIPPED_INGREDIENTS = new Set\(\[([\s\S]*?)\]\);/
);

const skipped = new Set();
if (skippedMatch) {
  const entries = skippedMatch[1].match(/'([^']+)'/g) || [];
  entries.forEach((entry) => skipped.add(entry.slice(1, -1)));
}

const ingredientManifestSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'assets', 'ingredientImageManifest.ts'),
  'utf8'
);

const ingredientManifestKeys = new Set();
(ingredientManifestSource.match(/'([^']+)'\s*:\s*\{/g) || []).forEach((match) => {
  const key = match.match(/'([^']+)'/)[1];
  if (key !== 'placeholder') {
    ingredientManifestKeys.add(key);
  }
});

const commonIngredientManifestSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'assets', 'commonIngredientImageManifest.ts'),
  'utf8'
);

const commonIngredientManifestKeys = new Set();
(commonIngredientManifestSource.match(/'([^']+)'\s*:\s*\{/g) || []).forEach((match) => {
  const key = match.match(/'([^']+)'/)[1];
  commonIngredientManifestKeys.add(key);
});

function isSkippedIngredient(raw) {
  const lowerRaw = raw.toLowerCase();
  if (skipped.has(lowerRaw)) {
    return true;
  }
  const tokens = lowerRaw.split(/\s+/).filter(Boolean);
  for (const skippedValue of skipped) {
    const skippedTokens = skippedValue.split(/\s+/).filter(Boolean);
    if (
      skippedTokens.every((sToken) =>
        tokens.some(
          (token) => token === sToken || (token.includes(sToken) && token.length > sToken.length)
        )
      )
    ) {
      return true;
    }
  }
  return false;
}

function slugifyCommonIngredient(value) {
  const base = value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return base ? base.replace(/\s+/g, '-') : 'ingredient';
}

function normalizeIngredientLabel(raw) {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\be\.g\.?\b/g, ' ')
    .replace(/\boptional\b/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/%/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const aliasMap = new Map([
  ['chamomile', 'etc:chamomille-flowers'],
  ['chamomile flowers', 'etc:chamomille-flowers'],
  ['usnea', 'etc:usnea-barbata'],
  ['usnea lichen', 'etc:usnea-barbata'],
  ['hops', 'etc:dried-hops-cones'],
  ['hops cones', 'etc:dried-hops-cones'],
  ['dried hops', 'etc:dried-hops-cones'],
  ['lemon peel', 'etc:dried-lemon-peels'],
  ['sage leaf', 'etc:dried-sage-leaf'],
  ['lavender', 'etc:dried-lavender'],
  ['rose hips', 'etc:rose-hips'],
  ['rose petals', 'etc:rose-petals'],
  ['rue leaf', 'etc:rue-leaf'],
  ['frankincense resin', 'etc:frankincense-resin'],
  ['comfrey root', 'etc:comfrey-root'],
  ['oak galls', 'etc:crushed-oak-galls'],
  ['meadowsweet', 'etc:meadowsweet-flower-tops'],
  ['mullein flower oil', 'etc:mullein-flower-oil'],
  ['licorice root', 'etc:licorice-root'],
  ['licorice root powder', 'etc:licorice-root-powder'],
  ['icelandic moss powder', 'etc:icelandic-moss-powder'],
  ['oatmeal', 'etc:oatmeal'],
  ['pine resin', 'etc:pine-resin'],
  ['quality red wine', 'etc:quality-red-wine'],
  ['dry white wine', 'etc:dry-white-wine'],
  ['red wine', 'etc:red-wine'],
  ['white wine', 'etc:white-wine'],
  ['riesling', 'etc:riesling'],
  ['claret', 'etc:red-wine'],
  ['gin', 'etc:gin'],
  ['grain alcohol', 'etc:grain-alcohol'],
  ['grain spirit', 'etc:grain-spirit'],
  ['strong alcohol', 'etc:strong-alcohol'],
  ['alcohol', 'etc:any-of-alcohol'],
  ['brandy', 'etc:any-type-of-brandy-or-spirit'],
  ['vodka', 'etc:grain-spirit'],
  ['sugar', 'etc:sugar'],
  ['honey', 'etc:honey'],
  ['water', 'etc:water'],
  ['water milk', 'etc:water'],
  ['milk water', 'etc:water'],
]);

function resolveCommonImageId(raw) {
  const directSlug = slugifyCommonIngredient(raw);
  const directImageId = `etc:${directSlug}`;
  if (commonIngredientManifestKeys.has(directImageId)) {
    return { imageId: directImageId, normalized: directSlug };
  }

  const normalizedLabel = normalizeIngredientLabel(raw);
  const normalizedSlug = slugifyCommonIngredient(normalizedLabel);
  const normalizedImageId = `etc:${normalizedSlug}`;
  if (commonIngredientManifestKeys.has(normalizedImageId)) {
    return { imageId: normalizedImageId, normalized: normalizedSlug };
  }

  for (const [aliasKey, imageId] of aliasMap.entries()) {
    if (normalizedLabel.includes(aliasKey)) {
      return { imageId, normalized: aliasKey };
    }
  }

  return null;
}

const missing = new Set();
const mapped = new Map();

for (const recipe of freeRecipes) {
  if (recipe.isPremium) {
    continue;
  }
  const ingredients = (recipe.ingredients || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  let imageIndex = 0;
  for (const raw of ingredients) {
    const commonMatch = resolveCommonImageId(raw);
    if (commonMatch) {
      mapped.set(raw, commonMatch.imageId);
      continue;
    }

    if (isSkippedIngredient(raw)) {
      const slug = slugifyCommonIngredient(raw);
      const filePath = path.join(__dirname, '..', 'assets', 'etc', `${slug}.jpg`);
      if (!fs.existsSync(filePath)) {
        missing.add(raw);
      }
    } else {
      const imageId = (recipe.ingredientImageIds || [])[imageIndex] || null;
      imageIndex += 1;
      if (!imageId || !ingredientManifestKeys.has(imageId)) {
        missing.add(raw);
      }
    }
  }
}

const mappedList = Array.from(mapped.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([raw, imageId]) => `${raw} -> ${imageId}`);
const missingList = Array.from(missing).sort((a, b) => a.localeCompare(b));

console.log('Mapped to common images:');
console.log(mappedList.join('\n'));
console.log('\nStill missing:');
console.log(missingList.join('\n'));
