const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_PATH = path.join(ROOT_DIR, 'apothecary-recipes', 'src', 'data', 'free-recipes.json');
const OUTPUT_DIR = path.join(ROOT_DIR, 'new images');
const ATTRIBUTION_PATH = path.join(OUTPUT_DIR, 'ingredient-image-attribution.md');

const DEFAULT_LIMIT = 25;
const REQUEST_DELAY_MS = 1200;
const MAX_RETRIES = 4;
const BACKOFF_MS = 2000;

const ACCEPTED_LICENSES = new Set([
  'CC0',
  'PDM',
  'Public Domain',
  'CC-BY',
  'CC-BY-SA'
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(argv) {
  const args = { limit: DEFAULT_LIMIT, from: 1, to: null };

  for (const raw of argv) {
    if (raw.startsWith('--limit=')) {
      const value = parseInt(raw.replace('--limit=', ''), 10);
      if (Number.isFinite(value) && value > 0) args.limit = value;
    } else if (raw.startsWith('--from=')) {
      const value = parseInt(raw.replace('--from=', ''), 10);
      if (Number.isFinite(value) && value > 0) args.from = value;
    } else if (raw.startsWith('--to=')) {
      const value = parseInt(raw.replace('--to=', ''), 10);
      if (Number.isFinite(value) && value > 0) args.to = value;
    }
  }

  return args;
}

function normalizeIngredient(ingredient) {
  if (!ingredient) return '';
  return ingredient
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(or|and)\b/gi, '')
    .replace(/\b(Fresh|Dried|Dry|Ground|Powdered|Crushed|Chopped|Whole|Roasted)\b/gi, '')
    .replace(/\b(Roots?|Leaves?|Leaf|Flower|Flowers|Bark|Seeds?|Seed|Fruit|Berries?|Berry|Aerial parts|Stem|Stems|Oil|Resin|Peel)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitIngredients(ingredients) {
  if (!ingredients) return [];
  return ingredients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ApothecaryRecipesIngredientImageDownloader/1.0'
    }
  });

  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ApothecaryRecipesIngredientImageDownloader/1.0'
    }
  });

  if (!response.ok) {
    const error = new Error(`Download failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function withRetries(fn) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const status = error?.status || 0;
      if (attempt === MAX_RETRIES || (status && status < 429)) {
        throw error;
      }
      await sleep(BACKOFF_MS * attempt);
    }
  }
  return null;
}

async function searchWikimedia(term) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=8&format=json&srnamespace=6`;
  const searchRes = await withRetries(() => fetchJson(searchUrl));
  const results = searchRes?.query?.search || [];

  for (const result of results) {
    const fileTitle = result.title;
    if (!fileTitle || fileTitle.match(/\.(pdf|djvu)$/i)) continue;
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|extmetadata|mime&format=json`;
    const infoRes = await withRetries(() => fetchJson(infoUrl));
    const pages = infoRes?.query?.pages || {};
    const page = pages[Object.keys(pages)[0]] || {};
    const info = page.imageinfo?.[0];
    if (!info || !info.mime || !info.mime.startsWith('image/')) continue;

    const license = String(info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value || '').replace(/<[^>]*>/g, '').trim();
    const licenseKey = license.replace(/\s+/g, ' ').trim();
    if (licenseKey && !ACCEPTED_LICENSES.has(licenseKey)) continue;

    return {
      source: 'Wikimedia Commons',
      imageUrl: info.url,
      sourceUrl: info.descriptionurl || info.url,
      license: licenseKey || 'Unknown',
      licenseUrl: String(info.extmetadata?.LicenseUrl?.value || '').replace(/<[^>]*>/g, '').trim(),
      creator: String(info.extmetadata?.Artist?.value || '').replace(/<[^>]*>/g, '').trim(),
      searchTerm: term,
      fileTitle
    };
  }

  return null;
}

async function searchOpenverse(term) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(term)}&page_size=10&license_type=all`;
  const data = await withRetries(() => fetchJson(url));
  const results = data?.results || [];

  for (const result of results) {
    const license = (result.license || '').toUpperCase();
    const licenseKey = license === 'CC0' ? 'CC0' : license;
    if (licenseKey && !ACCEPTED_LICENSES.has(licenseKey)) continue;
    if (!result.url && !result.fullsize) continue;

    return {
      source: 'Openverse',
      imageUrl: result.fullsize || result.url,
      sourceUrl: result.foreign_landing_url || result.url,
      license: licenseKey || 'Unknown',
      licenseUrl: result.license_url || '',
      creator: result.creator || '',
      searchTerm: term,
      fileTitle: result.title || ''
    };
  }

  return null;
}

async function findImageForIngredient(term) {
  const sources = [searchWikimedia, searchOpenverse];
  for (const searchFn of sources) {
    try {
      const match = await searchFn(term);
      if (match) return match;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function saveResizedImage(buffer, outputPath) {
  await sharp(buffer)
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

async function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function buildOutputName(recipeId, ingredientIndex) {
  if (ingredientIndex === 1) return `${recipeId}.jpg`;
  return `${recipeId}_${ingredientIndex}.jpg`;
}

function markdownTableRow(columns) {
  return `| ${columns.map((col) => String(col || '').replace(/\|/g, '\\|')).join(' | ')} |`;
}

async function main() {
  const { limit, from, to } = parseArgs(process.argv.slice(2));
  await ensureOutputDir();

  const recipes = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const startIndex = Math.max(1, from);
  const endIndex = Math.min(to || recipes.length, startIndex + limit - 1);

  const attributionRows = [];

  for (let i = startIndex; i <= endIndex; i += 1) {
    const recipe = recipes[i - 1];
    if (!recipe) continue;

    const ingredients = splitIngredients(recipe.ingredients);
    const normalizedIngredients = ingredients.map(normalizeIngredient);
    const displayTitle = recipe.title;

    for (let j = 0; j < ingredients.length; j += 1) {
      const ingredientRaw = ingredients[j];
      const ingredientTerm = normalizedIngredients[j] || ingredientRaw;
      const ingredientIndex = j + 1;
      const outputName = buildOutputName(i, ingredientIndex);
      const outputPath = path.join(OUTPUT_DIR, outputName);

      if (fs.existsSync(outputPath)) {
        attributionRows.push({
          recipeId: i,
          recipeTitle: displayTitle,
          ingredient: ingredientRaw,
          imageFile: outputName,
          status: 'skipped (exists)'
        });
        continue;
      }

      const match = await findImageForIngredient(ingredientTerm);
      if (!match) {
        attributionRows.push({
          recipeId: i,
          recipeTitle: displayTitle,
          ingredient: ingredientRaw,
          imageFile: outputName,
          status: 'missing'
        });
        continue;
      }

      try {
        const buffer = await withRetries(() => fetchBuffer(match.imageUrl));
        await saveResizedImage(buffer, outputPath);
      } catch (error) {
        attributionRows.push({
          recipeId: i,
          recipeTitle: displayTitle,
          ingredient: ingredientRaw,
          imageFile: outputName,
          status: `download failed (${match.source})`,
          searchTerm: match.searchTerm,
          sourceUrl: match.sourceUrl,
          license: match.license,
          licenseUrl: match.licenseUrl,
          creator: match.creator
        });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      attributionRows.push({
        recipeId: i,
        recipeTitle: displayTitle,
        ingredient: ingredientRaw,
        imageFile: outputName,
        status: 'downloaded',
        searchTerm: match.searchTerm,
        source: match.source,
        sourceUrl: match.sourceUrl,
        license: match.license,
        licenseUrl: match.licenseUrl,
        creator: match.creator
      });

      await sleep(REQUEST_DELAY_MS);
    }
  }

  const header = [
    '# Ingredient Image Attribution',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    markdownTableRow([
      'Recipe ID',
      'Recipe Title',
      'Ingredient',
      'Image File',
      'Status',
      'Search Term',
      'Source',
      'Source URL',
      'License',
      'License URL',
      'Creator'
    ]),
    markdownTableRow([
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---'
    ])
  ];

  const rows = attributionRows.map((row) =>
    markdownTableRow([
      row.recipeId,
      row.recipeTitle,
      row.ingredient,
      row.imageFile,
      row.status,
      row.searchTerm || '',
      row.source || '',
      row.sourceUrl || '',
      row.license || '',
      row.licenseUrl || '',
      row.creator || ''
    ])
  );

  fs.writeFileSync(ATTRIBUTION_PATH, header.concat(rows).join('\n'), 'utf8');
  console.log(`Saved attribution log to ${ATTRIBUTION_PATH}`);
}

main().catch((error) => {
  console.error('Ingredient image download failed:', error.message);
  process.exit(1);
});
