const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function backupFile(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dir, `${base}.bak.${stamp}`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function asArray(data, label) {
  if (Array.isArray(data)) return data;
  throw new Error(`${label} must be a JSON array at the root.`);
}

function detectIdKey(items) {
  if (!items.length) return null;
  const candidateKeys = ['id', 'recipeId', 'recipe_id', 'uuid'];
  for (const k of candidateKeys) {
    if (Object.prototype.hasOwnProperty.call(items[0], k)) return k;
  }
  return null;
}

function assertNoDuplicatesByKey(items, key, label) {
  if (!key) return;
  const seen = new Set();
  for (const it of items) {
    const v = it?.[key];
    if (v === undefined || v === null) continue;
    if (seen.has(v)) {
      throw new Error(`${label} contains duplicate ${key}: ${String(v)}`);
    }
    seen.add(v);
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const freePath = path.join(repoRoot, 'src', 'data', 'free-recipes.json');
  const premiumPath = path.join(repoRoot, 'src', 'data', 'recipes.json');

  const freeRaw = readJson(freePath);
  const premiumRaw = readJson(premiumPath);

  const free = asArray(freeRaw, 'free-recipes.json');
  const premium = asArray(premiumRaw, 'recipes.json');

  const expectedFreeBefore = 250;
  const expectedPremiumBefore = 750;

  if (free.length !== expectedFreeBefore) {
    throw new Error(`Expected free-recipes.json to have ${expectedFreeBefore} items, found ${free.length}. Aborting.`);
  }
  if (premium.length !== expectedPremiumBefore) {
    throw new Error(`Expected recipes.json to have ${expectedPremiumBefore} items, found ${premium.length}. Aborting.`);
  }

  const freeKeepCount = 100;
  const moveCount = free.length - freeKeepCount; // 150

  if (moveCount !== 150) {
    throw new Error(`Expected moveCount to be 150, got ${moveCount}. Aborting.`);
  }

  const freeKept = free.slice(0, freeKeepCount);
  const moved = free.slice(freeKeepCount);

  const mergedPremium = premium.concat(moved);

  if (freeKept.length !== 100) throw new Error(`Post-split free count is ${freeKept.length}, expected 100.`);
  if (mergedPremium.length !== 900) throw new Error(`Post-merge premium count is ${mergedPremium.length}, expected 900.`);

  const idKey = detectIdKey(freeKept) || detectIdKey(premium) || detectIdKey(moved);

  assertNoDuplicatesByKey(freeKept, idKey, 'free-recipes.json (after)');
  assertNoDuplicatesByKey(mergedPremium, idKey, 'recipes.json (after)');

  if (idKey) {
    const freeIds = new Set(freeKept.map((r) => r?.[idKey]).filter((v) => v !== undefined && v !== null));
    for (const r of mergedPremium) {
      const id = r?.[idKey];
      if (id !== undefined && id !== null && freeIds.has(id)) {
        throw new Error(`Duplicate across free/premium after split for ${idKey}=${String(id)}. Aborting.`);
      }
    }
  }

  const freeBackup = backupFile(freePath);
  const premiumBackup = backupFile(premiumPath);

  writeJsonAtomic(freePath, freeKept);
  writeJsonAtomic(premiumPath, mergedPremium);

  console.log('Split complete.');
  console.log(`- free-recipes.json: ${expectedFreeBefore} -> ${freeKept.length}`);
  console.log(`- recipes.json: ${expectedPremiumBefore} -> ${mergedPremium.length}`);
  console.log(`Backups created:`);
  console.log(`- ${freeBackup}`);
  console.log(`- ${premiumBackup}`);
}

main();
