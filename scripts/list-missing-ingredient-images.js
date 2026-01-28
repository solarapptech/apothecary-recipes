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

const missing = new Set();

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

const list = Array.from(missing).sort((a, b) => a.localeCompare(b));
console.log(list.join('\n'));
