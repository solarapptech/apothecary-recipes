import type { Recipe } from '../types/recipe';

import { computeDeterministicRandomKey } from './hash';
import { SCHEMA_SQL } from './schema';

const FREE_RECIPES_BASE: Recipe[] = require('../data/free-recipes.json');

export const TARGET_FREE_RECIPE_COUNT = 250;
export const CURRENT_SEED_VERSION = 'free-placeholder-250-v5';

type GetFirstResult<T> = T | null | undefined;

export type DbLike = {
  execAsync: (source: string) => Promise<void>;
  runAsync: (source: string, ...params: any[]) => Promise<unknown>;
  getFirstAsync: <T>(source: string, ...params: any[]) => Promise<GetFirstResult<T>>;
  withTransactionAsync?: (task: () => Promise<void>) => Promise<void>;
};

export async function ensureSchemaAsync(db: DbLike): Promise<void> {
  await db.execAsync(SCHEMA_SQL);

  const migrations: Array<{ sql: string }> = [
    { sql: 'ALTER TABLE recipes ADD COLUMN isPremium INTEGER NOT NULL DEFAULT 0' },
    { sql: 'ALTER TABLE recipes ADD COLUMN imageLocalPath TEXT' },
    { sql: 'ALTER TABLE recipes ADD COLUMN usedFor TEXT NOT NULL DEFAULT ""' },
    { sql: 'ALTER TABLE recipes ADD COLUMN alternativeNames TEXT NOT NULL DEFAULT ""' },
    { sql: 'ALTER TABLE recipes ADD COLUMN ingredients TEXT NOT NULL DEFAULT ""' },
    { sql: 'ALTER TABLE recipes ADD COLUMN detailedMeasurements TEXT NOT NULL DEFAULT ""' },
    { sql: 'ALTER TABLE recipes ADD COLUMN preparationSteps TEXT NOT NULL DEFAULT ""' },
    { sql: 'ALTER TABLE recipes ADD COLUMN usage TEXT NOT NULL DEFAULT ""' },
  ];

  for (const migration of migrations) {
    try {
      await db.runAsync(migration.sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const normalized = message.toLowerCase();
      const isDuplicateColumn = normalized.includes('duplicate column') || normalized.includes('already exists');
      if (!isDuplicateColumn) {
        throw error;
      }
    }
  }
}

function buildFreeRecipesForSeeding(): Recipe[] {
  const base = FREE_RECIPES_BASE;
  if (base.length === 0) {
    return [];
  }

  if (base.length >= TARGET_FREE_RECIPE_COUNT) {
    return base;
  }

  const result: Recipe[] = [];
  let i = 0;
  while (result.length < TARGET_FREE_RECIPE_COUNT) {
    const recipe = base[i % base.length];
    const index = result.length + 1;

    result.push({
      ...recipe,
      title: `${recipe.title} #${String(index).padStart(3, '0')}`,
    });

    i += 1;
  }

  return result;
}

async function getMetaValueAsync(db: DbLike, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM seed_meta WHERE key = ?', key);
  return row?.value ?? null;
}

async function setMetaValueAsync(db: DbLike, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO seed_meta (key, value) VALUES (?, ?)', key, value);
}

export async function getPremiumBundleVersionAsync(db: DbLike): Promise<string | null> {
  const value = await getMetaValueAsync(db, 'premiumBundleVersion');
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export async function setPremiumBundleVersionAsync(db: DbLike, version: string | null): Promise<void> {
  await setMetaValueAsync(db, 'premiumBundleVersion', version?.trim() ?? '');
}

async function getRecipeCountAsync(db: DbLike): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
  return row?.count ?? 0;
}

async function clearRecipesAsync(db: DbLike): Promise<void> {
  await db.runAsync('DELETE FROM recipes');
  try {
    await db.runAsync("DELETE FROM sqlite_sequence WHERE name='recipes'");
  } catch (e) {
    // Ignore error if sqlite_sequence doesn't exist
    console.warn('Failed to reset sqlite_sequence for recipes:', e);
  }
}

async function insertRecipeAsync(db: DbLike, recipe: Recipe): Promise<void> {
  const randomKey = computeDeterministicRandomKey(recipe);

  await db.runAsync(
    `INSERT INTO recipes (
      title,
      difficultyScore,
      preparationTime,
      description,
      timePeriod,
      warning,
      region,
      alternativeNames,
      usedFor,
      ingredients,
      detailedMeasurements,
      preparationSteps,
      usage,
      historicalContext,
      scientificEvidence,
      randomKey
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    recipe.title,
    recipe.difficultyScore,
    recipe.preparationTime,
    recipe.description,
    recipe.timePeriod,
    recipe.warning,
    recipe.region,
    recipe.alternativeNames ?? '',
    recipe.usedFor ?? '',
    recipe.ingredients,
    recipe.detailedMeasurements,
    recipe.preparationSteps,
    recipe.usage,
    recipe.historicalContext,
    recipe.scientificEvidence,
    randomKey
  );
}

export async function seedDatabaseIfNeededAsync(db: DbLike): Promise<{ didSeed: boolean; recipeCount: number }> {
  await ensureSchemaAsync(db);

  const existingSeedVersion = await getMetaValueAsync(db, 'seedVersion');
  const freeRecipes = buildFreeRecipesForSeeding();
  const expectedCount = freeRecipes.length;

  if (existingSeedVersion === CURRENT_SEED_VERSION) {
    const recipeCount = await getRecipeCountAsync(db);
    return { didSeed: false, recipeCount };
  }

  const existingCount = await getRecipeCountAsync(db);
  if (!existingSeedVersion && existingCount >= expectedCount) {
    return { didSeed: false, recipeCount: existingCount };
  }

  const runInTransaction = db.withTransactionAsync
    ? db.withTransactionAsync.bind(db)
    : async (task: () => Promise<void>) => {
        await task();
      };

  await runInTransaction(async () => {
    await clearRecipesAsync(db);

    for (const recipe of freeRecipes) {
      await insertRecipeAsync(db, recipe);
    }

    await setMetaValueAsync(db, 'seedVersion', CURRENT_SEED_VERSION);
    await setMetaValueAsync(db, 'seedCount', String(expectedCount));
  });

  const recipeCount = await getRecipeCountAsync(db);
  return { didSeed: true, recipeCount };
}

export function getBundledFreeRecipesCount(): number {
  return buildFreeRecipesForSeeding().length;
}
