/**
 * Script to download common ingredient images from Wikimedia Commons,
 * resize them to 512x512, and generate attribution data.
 *
 * Usage: node scripts/download-common-ingredient-images.js
 *
 * Requires: sharp (already in package.json)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

const INPUT_FILE = path.join(__dirname, '..', 'assets', 'etc', 'common ingredients.txt');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'etc');
const ATTRIBUTION_FILE = path.join(OUTPUT_DIR, 'common-ingredient-attributions.json');

/**
 * Slugify ingredient name to kebab-case filename
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Parse the input file to extract ingredient names and URLs
 */
function splitNames(raw) {
  return raw
    .split(',')
    .map((value) => value.replace(/[.]+$/g, '').trim())
    .map((value) => value.replace(/^including\s+/i, '').trim())
    .filter(Boolean);
}

function extractReuseFilename(value) {
  const match = value.match(/use(?:s)?\s+(?:the\s+image\s+)?'([^']+)'/i);
  return match ? match[1].trim() : null;
}

function stripReuseClause(value) {
  return value.replace(/\.?\s*should\s+use.*$/i, '').trim();
}

function parseInputFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map((line) => line.trim());

  const entries = [];
  let currentNames = null;
  let currentReuse = null;

  for (const line of lines) {
    if (!line) {
      continue;
    }

    const nameMatch = line.match(/^\d+-\s*(.+)$/);
    if (nameMatch) {
      const rawLine = nameMatch[1].trim();
      const reuseFilename = extractReuseFilename(rawLine);
      currentReuse = reuseFilename;
      const namesPart = stripReuseClause(rawLine);
      currentNames = splitNames(namesPart);

      if (currentReuse) {
        entries.push({
          names: currentNames,
          reuseFilename: currentReuse,
        });
        currentNames = null;
        currentReuse = null;
      }
      continue;
    }

    if (line.startsWith('https://commons.wikimedia.org/wiki/File:') && currentNames) {
      entries.push({
        names: currentNames,
        wikimediaUrl: line,
      });
      currentNames = null;
      currentReuse = null;
    }
  }

  return entries;
}

function buildExpectedImageIds(entries) {
  const expected = new Set();
  entries.forEach((entry) => {
    (entry.names || []).forEach((name) => {
      const slug = slugify(name);
      expected.add(`etc:${slug}`);
    });
  });
  return expected;
}

function buildReuseMap(entries) {
  const reuseMap = new Map();
  entries.forEach((entry) => {
    if (!entry.reuseFilename) {
      return;
    }
    (entry.names || []).forEach((name) => {
      const slug = slugify(name);
      reuseMap.set(`etc:${slug}`, entry.reuseFilename);
    });
  });
  return reuseMap;
}

/**
 * Extract the filename from a Wikimedia Commons URL
 */
function extractFilename(wikimediaUrl) {
  const match = wikimediaUrl.match(/File:(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fetch Wikimedia API metadata for a file
 */
async function fetchWikimediaMetadata(filename) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=extmetadata|url&format=json`;
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'ApothecaryRecipesApp/1.0 (https://github.com/; contact@example.com) Node.js',
      },
    };
    
    https.get(apiUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (!pages) {
            resolve(null);
            return;
          }
          
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          const imageinfo = page?.imageinfo?.[0];
          
          if (!imageinfo) {
            resolve(null);
            return;
          }
          
          const meta = imageinfo.extmetadata || {};
          // Use thumbnail URL at 512px width for reliable download
          const thumbUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=512`;
          const thumbUrlSmall = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=256`;
          
          resolve({
            title: filename,
            creator: meta.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'Unknown',
            source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
            license: meta.LicenseShortName?.value || 'Unknown',
            licenseUrl: meta.LicenseUrl?.value || '',
            changes: 'Resized to 512x512',
            downloadUrl: thumbUrl,
            downloadUrlSmall: thumbUrlSmall,
            originalUrl: imageinfo.url,
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download a file from a URL using curl (more reliable for Wikimedia)
 */
async function downloadFile(url, destPath) {
  const { execSync } = require('child_process');
  
  try {
    // Use curl with proper headers
    execSync(`curl -L --fail --retry 3 --retry-delay 2 --max-time 60 -o "${destPath}" -H "Accept: image/*" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return destPath;
    }
    throw new Error('Download failed - empty file');
  } catch (e) {
    throw new Error(`curl failed: ${e.message}`);
  }
}

/**
 * Resize an image to 512x512 using sharp
 */
async function resizeImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(512, 512, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

/**
 * Main function
 */
async function main() {
  console.log('Parsing input file...');
  const entries = parseInputFile(INPUT_FILE);
  const expectedImageIds = buildExpectedImageIds(entries);
  const reuseMap = buildReuseMap(entries);
  console.log(`Found ${entries.length} entries to process.\n`);

  let existingAttributions = { ingredients: [] };
  if (fs.existsSync(ATTRIBUTION_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(ATTRIBUTION_FILE, 'utf8'));
    existingAttributions = {
      ingredients: (parsed.ingredients || []).filter((item) => expectedImageIds.has(item.imageId)),
    };
  }

  const attributionByImageId = new Map();
  existingAttributions.ingredients.forEach((item) => {
    attributionByImageId.set(item.imageId, item);
  });

  const attributions = [...existingAttributions.ingredients];
  const manifestSources = new Map();
  existingAttributions.ingredients.forEach((item) => {
    if (reuseMap.has(item.imageId)) {
      manifestSources.set(item.imageId, reuseMap.get(item.imageId));
    }
  });
  const tempDir = path.join(OUTPUT_DIR, 'temp');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (const entry of entries) {
    const names = entry.names || [];
    if (names.length === 0) {
      continue;
    }

    if (entry.reuseFilename) {
      const reusePath = path.join(OUTPUT_DIR, entry.reuseFilename);
      if (!fs.existsSync(reusePath)) {
        console.log(`⚠ Reuse image not found: ${entry.reuseFilename}`);
        continue;
      }

      const reuseSlug = path.basename(entry.reuseFilename, path.extname(entry.reuseFilename));
      const reuseImageId = `etc:${reuseSlug}`;
      const reuseAttribution = attributionByImageId.get(reuseImageId);
      if (!reuseAttribution) {
        console.log(`⚠ Attribution missing for reuse image: ${entry.reuseFilename}`);
        continue;
      }

      for (const name of names) {
        const slug = slugify(name);
        const imageId = `etc:${slug}`;
        if (attributionByImageId.has(imageId)) {
          continue;
        }

        const attribution = {
          ...reuseAttribution,
          slug,
          name,
          imageId,
        };
        attributions.push(attribution);
        attributionByImageId.set(imageId, reuseAttribution);
        manifestSources.set(imageId, entry.reuseFilename);
      }

      continue;
    }

    if (!entry.wikimediaUrl) {
      continue;
    }

    const primarySlug = slugify(names[0]);
    console.log(`Processing: ${names.join(', ')} (${primarySlug})`);

    try {
      const filename = extractFilename(entry.wikimediaUrl);
      if (!filename) {
        console.log(`  ⚠ Could not extract filename from URL`);
        continue;
      }

      console.log(`  Fetching metadata...`);
      const metadata = await fetchWikimediaMetadata(filename);
      if (!metadata || !metadata.downloadUrl) {
        console.log(`  ⚠ Could not fetch metadata`);
        continue;
      }

      const ext = path.extname(filename).toLowerCase() || '.jpg';
      const tempPath = path.join(tempDir, `${primarySlug}${ext}`);
      console.log(`  Downloading...`);
      try {
        await downloadFile(metadata.downloadUrl, tempPath);
      } catch (error) {
        if (metadata.downloadUrlSmall) {
          console.log(`  Retrying with smaller thumbnail...`);
          await downloadFile(metadata.downloadUrlSmall, tempPath);
        } else {
          throw error;
        }
      }

      for (const name of names) {
        const slug = slugify(name);
        const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
        if (!fs.existsSync(outputPath)) {
          console.log(`  Resizing for ${name}...`);
          try {
            await resizeImage(tempPath, outputPath);
          } catch (error) {
            if (metadata.originalUrl && metadata.originalUrl !== metadata.downloadUrl) {
              console.log(`  Retrying with original image for ${name}...`);
              const fallbackPath = path.join(tempDir, `${primarySlug}-original${ext}`);
              await downloadFile(metadata.originalUrl, fallbackPath);
              await resizeImage(fallbackPath, outputPath);
              fs.unlinkSync(fallbackPath);
            } else {
              throw error;
            }
          }
        }

        const imageId = `etc:${slug}`;
        if (!attributionByImageId.has(imageId)) {
          const attribution = {
            slug,
            name,
            imageId,
            title: metadata.title,
            creator: metadata.creator,
            source: metadata.source,
            license: metadata.license,
            licenseUrl: metadata.licenseUrl,
            changes: metadata.changes,
          };
          attributions.push(attribution);
          attributionByImageId.set(imageId, attribution);
          manifestSources.set(imageId, `${slug}.jpg`);
        }
      }

      fs.unlinkSync(tempPath);

      console.log(`  ✓ Done\n`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}\n`);
    }
  }

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const uniqueAttributions = Array.from(
    new Map(attributions.map((attr) => [attr.imageId, attr])).values()
  ).sort((a, b) => a.imageId.localeCompare(b.imageId));

  console.log(`\nWriting attribution file...`);
  fs.writeFileSync(ATTRIBUTION_FILE, JSON.stringify({ ingredients: uniqueAttributions }, null, 2));

  console.log(`\n=== Summary ===`);
  console.log(`Processed entries: ${entries.length}`);
  console.log(`Attribution count: ${uniqueAttributions.length}`);
  console.log(`Attribution file: ${ATTRIBUTION_FILE}`);
  console.log(`\nImages saved to: ${OUTPUT_DIR}`);

  console.log(`\n=== Manifest entries (copy to commonIngredientImageManifest.ts) ===\n`);
  uniqueAttributions.forEach((attr) => {
    const sourceFile = manifestSources.get(attr.imageId) ?? `${attr.slug}.jpg`;
    console.log(
      `  '${attr.imageId}': { source: require('../../assets/etc/${sourceFile}'), imageId: '${attr.imageId}' },`
    );
  });
}

main().catch(console.error);
