const fs = require('fs');
const path = require('path');

function usageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.error('Usage: node scripts/backfill-usedFor-from-ailments.js [--csv=<path>] [--free=<path>] [--premium=<path>]');
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith('--')) {
      usageAndExit(`Unexpected argument: ${raw}`);
    }
    const [k, ...rest] = raw.slice(2).split('=');
    const v = rest.join('=');
    if (!k || !v) {
      usageAndExit(`Invalid argument: ${raw}`);
    }
    out[k] = v;
  }
  return out;
}

function normalizeKey(input) {
  return String(input ?? '')
    .trim()
    .replace(/\uFEFF/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function stripSeedSuffix(title) {
  return String(title).replace(/\s+#\d{3}\s*$/g, '').trim();
}

function parseCsvLine(line) {
  // RFC4180-ish CSV parsing for a single line.
  const out = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          cur += '"';
          i += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      cur += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      out.push(cur);
      cur = '';
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function readCsvAilmentsMap(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error(`CSV appears empty: ${csvPath}`);
  }

  const header = parseCsvLine(lines[0]);
  const idxName = header.findIndex((h) => normalizeKey(h) === 'name');
  const idxAilments = header.findIndex((h) => normalizeKey(h) === 'ailments');

  if (idxName < 0) {
    throw new Error('CSV missing required header: Name');
  }
  if (idxAilments < 0) {
    throw new Error('CSV missing required header: Ailments');
  }

  const map = new Map();

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const name = row[idxName];
    const ailments = row[idxAilments];
    if (!name) {
      continue;
    }

    const key = normalizeKey(name);
    if (!key) {
      continue;
    }

    // If duplicates exist, keep the first non-empty ailments, otherwise last one.
    const prev = map.get(key);
    if (prev && prev.trim() && (!ailments || !ailments.trim())) {
      continue;
    }

    map.set(key, String(ailments ?? '').trim());
  }

  return map;
}

function updateDatasetJson({ jsonPath, ailmentsMap, label }) {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const arr = JSON.parse(raw);

  if (!Array.isArray(arr)) {
    throw new Error(`${label} JSON is not an array: ${jsonPath}`);
  }

  const missing = [];

  const updated = arr.map((recipe, idx) => {
    const title = recipe?.title;
    if (!title) {
      missing.push({ index: idx, title: null });
      return recipe;
    }

    const directKey = normalizeKey(title);
    const strippedKey = normalizeKey(stripSeedSuffix(title));

    const ailments = ailmentsMap.get(directKey) ?? ailmentsMap.get(strippedKey);

    if (typeof ailments !== 'string') {
      missing.push({ index: idx, title });
      return recipe;
    }

    return {
      ...recipe,
      usedFor: ailments,
    };
  });

  if (missing.length > 0) {
    const sample = missing.slice(0, 25).map((m) => `#${m.index}: ${m.title ?? '<missing title>'}`).join('\n');
    throw new Error(
      `${label}: failed to map Ailments -> usedFor for ${missing.length} recipes. Sample:\n${sample}`
    );
  }

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  return { count: updated.length };
}

function main() {
  const args = parseArgs(process.argv);

  const defaultCsv = path.resolve(__dirname, '../../1000 remedies/Copy 1000 remedies.csv');
  const csvPath = path.resolve(process.cwd(), args.csv ?? defaultCsv);

  const defaultFree = path.resolve(__dirname, '../src/data/free-recipes.json');
  const defaultPremium = path.resolve(__dirname, '../src/data/recipes.json');

  const freePath = path.resolve(process.cwd(), args.free ?? defaultFree);
  const premiumPath = path.resolve(process.cwd(), args.premium ?? defaultPremium);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }
  if (!fs.existsSync(freePath)) {
    throw new Error(`Free recipes JSON not found: ${freePath}`);
  }
  if (!fs.existsSync(premiumPath)) {
    throw new Error(`Premium recipes JSON not found: ${premiumPath}`);
  }

  const ailmentsMap = readCsvAilmentsMap(csvPath);

  const freeRes = updateDatasetJson({ jsonPath: freePath, ailmentsMap, label: 'free-recipes.json' });
  const premiumRes = updateDatasetJson({ jsonPath: premiumPath, ailmentsMap, label: 'recipes.json' });

  console.log('Backfill complete.');
  console.log(`- free-recipes.json updated: ${freeRes.count}`);
  console.log(`- recipes.json updated: ${premiumRes.count}`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
