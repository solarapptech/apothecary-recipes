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
function parseInputFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  const ingredients = [];
  let currentName = null;
  
  for (const line of lines) {
    // Match lines like "1- water" or "2- boiling water"
    const nameMatch = line.match(/^\d+-\s*(.+)$/);
    if (nameMatch) {
      currentName = nameMatch[1].trim();
      continue;
    }
    
    // Match Wikimedia URLs
    if (line.startsWith('https://commons.wikimedia.org/wiki/File:') && currentName) {
      ingredients.push({
        name: currentName,
        slug: slugify(currentName),
        wikimediaUrl: line,
      });
      currentName = null;
    }
  }
  
  return ingredients;
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
          
          resolve({
            title: filename,
            creator: meta.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'Unknown',
            source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
            license: meta.LicenseShortName?.value || 'Unknown',
            licenseUrl: meta.LicenseUrl?.value || '',
            changes: 'Resized to 512x512',
            downloadUrl: thumbUrl,
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
    execSync(`curl -L -o "${destPath}" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`, {
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
  const ingredients = parseInputFile(INPUT_FILE);
  console.log(`Found ${ingredients.length} ingredients to process.\n`);
  
  const attributions = [];
  const tempDir = path.join(OUTPUT_DIR, 'temp');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  for (const ingredient of ingredients) {
    console.log(`Processing: ${ingredient.name} (${ingredient.slug})`);
    
    try {
      const filename = extractFilename(ingredient.wikimediaUrl);
      if (!filename) {
        console.log(`  ⚠ Could not extract filename from URL`);
        continue;
      }
      
      // Fetch metadata
      console.log(`  Fetching metadata...`);
      const metadata = await fetchWikimediaMetadata(filename);
      if (!metadata || !metadata.downloadUrl) {
        console.log(`  ⚠ Could not fetch metadata`);
        continue;
      }
      
      // Download original
      const ext = path.extname(filename).toLowerCase() || '.jpg';
      const tempPath = path.join(tempDir, `${ingredient.slug}${ext}`);
      console.log(`  Downloading...`);
      await downloadFile(metadata.downloadUrl, tempPath);
      
      // Resize to 512x512
      const outputPath = path.join(OUTPUT_DIR, `${ingredient.slug}.jpg`);
      console.log(`  Resizing to 512x512...`);
      await resizeImage(tempPath, outputPath);
      
      // Clean up temp file
      fs.unlinkSync(tempPath);
      
      // Add attribution
      attributions.push({
        slug: ingredient.slug,
        name: ingredient.name,
        imageId: `etc:${ingredient.slug}`,
        title: metadata.title,
        creator: metadata.creator,
        source: metadata.source,
        license: metadata.license,
        licenseUrl: metadata.licenseUrl,
        changes: metadata.changes,
      });
      
      console.log(`  ✓ Done\n`);
      
      // Small delay to be nice to Wikimedia servers
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}\n`);
    }
  }
  
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
  
  // Write attribution file
  console.log(`\nWriting attribution file...`);
  fs.writeFileSync(ATTRIBUTION_FILE, JSON.stringify({ ingredients: attributions }, null, 2));
  
  console.log(`\n=== Summary ===`);
  console.log(`Processed: ${attributions.length}/${ingredients.length} ingredients`);
  console.log(`Attribution file: ${ATTRIBUTION_FILE}`);
  console.log(`\nImages saved to: ${OUTPUT_DIR}`);
  
  // Generate manifest entries
  console.log(`\n=== Manifest entries (copy to commonIngredientImageManifest.ts) ===\n`);
  for (const attr of attributions) {
    console.log(`  '${attr.imageId}': { source: require('../../assets/etc/${attr.slug}.jpg'), imageId: '${attr.imageId}' },`);
  }
}

main().catch(console.error);
