const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const HERB_LIST_PATH = path.join(ROOT_DIR, '1-100 Herbs.txt');
const ATTRIBUTION_PATH = path.join(ROOT_DIR, 'apothecary-recipes', 'assets', 'herbs', 'image-attributions.md');
const OUTPUT_DIR = path.join(ROOT_DIR, 'apothecary-recipes', 'assets', 'herbs');

const REQUEST_DELAY_MS = 1200;
const MAX_RETRIES = 3;
const USER_AGENT = 'ApothecaryRecipesHerbImageUpdater/1.0';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanMetadata(value) {
  return decodeHtml(String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

function getFileTitle(sourceUrl) {
  const match = sourceUrl.match(/\/File:(.+)$/);
  if (!match) {
    throw new Error(`Unable to parse file title from ${sourceUrl}`);
  }
  return decodeURIComponent(match[1]);
}

async function fetchJson(url) {
  if (!globalThis.fetch) {
    throw new Error('Node fetch API is unavailable. Please run with Node 18+ or add a fetch polyfill.');
  }
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!response.ok) {
    const error = new Error(`Request failed (${response.status}) for ${url}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function fetchBuffer(url) {
  if (!globalThis.fetch) {
    throw new Error('Node fetch API is unavailable. Please run with Node 18+ or add a fetch polyfill.');
  }
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!response.ok) {
    const error = new Error(`Download failed (${response.status}) for ${url}`);
    error.status = response.status;
    throw error;
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function withRetries(fn, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const status = error?.status || 0;
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      if (status && status !== 429 && status < 500) {
        throw error;
      }
      console.log(`Retrying ${label} (attempt ${attempt + 1}/${MAX_RETRIES})...`);
      await sleep(REQUEST_DELAY_MS * Math.pow(2, attempt));
    }
  }
  return null;
}

function parseStarredLinks() {
  const lines = fs.readFileSync(HERB_LIST_PATH, 'utf8').split(/\r?\n/);
  const starred = new Map();
  let currentRecipeId = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const recipeMatch = line.match(/^(\d+)-\s+/);
    if (recipeMatch) {
      currentRecipeId = Number(recipeMatch[1]);
      if (!starred.has(currentRecipeId)) {
        starred.set(currentRecipeId, []);
      }
      continue;
    }

    if (line.startsWith('*')) {
      const url = line.replace(/^\*\s*/, '');
      if (currentRecipeId && url) {
        starred.get(currentRecipeId).push(url);
      }
    }
  }

  return starred;
}

function parseExistingImageData(lines) {
  const data = new Map();
  let currentRecipeId = null;
  let maxImage = 0;
  let sources = new Set();

  for (const line of lines) {
    const recipeMatch = line.match(/^## Recipe (\d+) /);
    if (recipeMatch) {
      if (currentRecipeId !== null) {
        data.set(currentRecipeId, { maxImage, sources });
      }
      currentRecipeId = Number(recipeMatch[1]);
      maxImage = 0;
      sources = new Set();
      continue;
    }

    const imageMatch = line.match(/^### Image (\d+)/);
    if (imageMatch) {
      const imageNumber = Number(imageMatch[1]);
      if (imageNumber > maxImage) {
        maxImage = imageNumber;
      }
    }

    const sourceMatch = line.match(/^- Source: (.+)$/);
    if (sourceMatch && currentRecipeId !== null) {
      sources.add(sourceMatch[1].trim());
    }
  }

  if (currentRecipeId !== null) {
    data.set(currentRecipeId, { maxImage, sources });
  }

  return data;
}

async function fetchWikimediaMetadata(sourceUrl) {
  const fileTitle = getFileTitle(sourceUrl);
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${fileTitle}`)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  const data = await withRetries(() => fetchJson(apiUrl), `metadata for ${fileTitle}`);
  const pages = data?.query?.pages || {};
  const page = pages[Object.keys(pages)[0]] || {};
  const info = page.imageinfo?.[0];
  if (!info) {
    throw new Error(`No image info returned for ${fileTitle}`);
  }

  const metadata = info.extmetadata || {};
  const creatorRaw = metadata.Artist?.value || metadata.Creator?.value || metadata.Credit?.value || metadata.User?.value || '';
  const licenseRaw = metadata.LicenseShortName?.value || metadata.License?.value || '';
  const licenseUrl = cleanMetadata(metadata.LicenseUrl?.value || '');

  return {
    title: cleanMetadata(fileTitle),
    creator: cleanMetadata(creatorRaw) || 'Unknown',
    source: sourceUrl,
    license: cleanMetadata(licenseRaw) || 'Unknown',
    licenseUrl,
    downloadUrl: info.url
  };
}

async function downloadAndResizeImage(downloadUrl, outputPath) {
  const buffer = await withRetries(() => fetchBuffer(downloadUrl), `download ${downloadUrl}`);
  try {
    await sharp(buffer)
      .resize(512, 512, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
  } catch (error) {
    if (!String(error?.message || '').includes('VipsJpeg')) {
      throw error;
    }
    await sharp(buffer, { failOn: 'none' })
      .resize(512, 512, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
  }
}

function buildAttributionBlocks(entries) {
  const lines = [];
  for (const entry of entries) {
    lines.push('');
    lines.push(`### Image ${entry.imageNumber}`);
    lines.push(`- Title: ${entry.title}`);
    lines.push(`- Creator: ${entry.creator}`);
    lines.push(`- Source: ${entry.source}`);
    lines.push(`- License: ${entry.license}`);
    lines.push(`- License URL: ${entry.licenseUrl || 'Unknown'}`);
    lines.push('- Changes: None');
    lines.push('');
  }
  return lines;
}

async function main() {
  if (!fs.existsSync(HERB_LIST_PATH)) {
    throw new Error(`Missing herb list: ${HERB_LIST_PATH}`);
  }
  if (!fs.existsSync(ATTRIBUTION_PATH)) {
    throw new Error(`Missing attribution file: ${ATTRIBUTION_PATH}`);
  }

  const starredLinks = parseStarredLinks();
  const attributionLines = fs.readFileSync(ATTRIBUTION_PATH, 'utf8').split(/\r?\n/);
  const existingData = parseExistingImageData(attributionLines);

  const newEntriesByRecipe = new Map();

  for (const [recipeId, urls] of starredLinks.entries()) {
    if (!urls.length) continue;
    const existing = existingData.get(recipeId) || { maxImage: 0, sources: new Set() };
    let nextImageNumber = existing.maxImage + 1;
    const entries = [];

    for (const sourceUrl of urls) {
      if (existing.sources.has(sourceUrl)) {
        console.log(`Skipping recipe ${recipeId} (already attributed): ${sourceUrl}`);
        continue;
      }
      console.log(`Processing recipe ${recipeId} image ${nextImageNumber}: ${sourceUrl}`);
      try {
        const metadata = await fetchWikimediaMetadata(sourceUrl);
        const outputName = nextImageNumber === 1 ? `${recipeId}.jpg` : `${recipeId}-${nextImageNumber}.jpg`;
        const outputPath = path.join(OUTPUT_DIR, outputName);

        if (!fs.existsSync(outputPath)) {
          await downloadAndResizeImage(metadata.downloadUrl, outputPath);
          console.log(`Saved ${outputName}`);
        } else {
          console.log(`File exists, skipping download: ${outputName}`);
        }

        entries.push({
          imageNumber: nextImageNumber,
          title: metadata.title,
          creator: metadata.creator,
          source: metadata.source,
          license: metadata.license,
          licenseUrl: metadata.licenseUrl
        });

        existing.sources.add(sourceUrl);
        nextImageNumber += 1;
        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        console.error(`Failed recipe ${recipeId} image ${nextImageNumber}: ${error.message}`);
        break;
      }
    }

    newEntriesByRecipe.set(recipeId, entries);
  }

  if (newEntriesByRecipe.size === 0) {
    console.log('No starred links found.');
    return;
  }

  const updatedLines = [];
  let currentRecipeId = null;

  for (const line of attributionLines) {
    const recipeMatch = line.match(/^## Recipe (\d+) /);
    if (recipeMatch) {
      if (currentRecipeId && newEntriesByRecipe.has(currentRecipeId)) {
        updatedLines.push(...buildAttributionBlocks(newEntriesByRecipe.get(currentRecipeId)));
      }
      currentRecipeId = Number(recipeMatch[1]);
    }
    updatedLines.push(line);
  }

  if (currentRecipeId && newEntriesByRecipe.has(currentRecipeId)) {
    updatedLines.push(...buildAttributionBlocks(newEntriesByRecipe.get(currentRecipeId)));
  }

  fs.writeFileSync(ATTRIBUTION_PATH, updatedLines.join('\n'), 'utf8');
  console.log(`Updated attribution file at ${ATTRIBUTION_PATH}`);
}

main().catch((error) => {
  console.error('Herb image update failed:', error.message);
  process.exit(1);
});
