import {
  CURRENT_SEED_VERSION,
  getBundledFreeRecipesCount,
  getPremiumBundleVersionAsync,
  seedDatabaseIfNeededAsync,
  setPremiumBundleVersionAsync,
} from '../src/db/seed';

type DbState = {
  recipesCount: number;
  meta: Map<string, string>;
  schemaExecuted: boolean;
  insertCalls: number;
};

function createFakeDb(initial?: Partial<DbState>) {
  const state: DbState = {
    recipesCount: 0,
    meta: new Map<string, string>(),
    schemaExecuted: false,
    insertCalls: 0,
    ...initial,
  };

  const db = {
    execAsync: async () => {
      state.schemaExecuted = true;
    },
    runAsync: async (source: string, ...params: any[]) => {
      if (source.startsWith('ALTER TABLE recipes ADD COLUMN')) {
        return;
      }

      if (source.startsWith('CREATE INDEX IF NOT EXISTS idx_recipes_searchTextNormalized_nocase')) {
        return;
      }

      if (source.startsWith('UPDATE recipes')) {
        return;
      }

      if (source.startsWith('DELETE FROM recipes')) {
        state.recipesCount = 0;
        return;
      }

      if (source.startsWith('INSERT INTO recipes')) {
        state.recipesCount += 1;
        state.insertCalls += 1;
        return;
      }

      if (source.startsWith('INSERT OR REPLACE INTO seed_meta')) {
        const [key, value] = params;
        state.meta.set(String(key), String(value));
        return;
      }
    },
    getFirstAsync: async <T>(source: string, ...params: any[]) => {
      if (source.startsWith('SELECT value FROM seed_meta')) {
        const [key] = params;
        const value = state.meta.get(String(key));
        return (value ? ({ value } as any) : null) as T;
      }

      if (source.startsWith('SELECT COUNT(*) as count FROM recipes')) {
        return ({ count: state.recipesCount } as any) as T;
      }

      return null as any;
    },
    withTransactionAsync: async (task: () => Promise<void>) => {
      await task();
    },
    __state: state,
  };

  return db;
}

test('seeds database when no seed version exists and no recipes present', async () => {
  const expectedCount = getBundledFreeRecipesCount();
  const db = createFakeDb();

  const result = await seedDatabaseIfNeededAsync(db);

  expect(db.__state.schemaExecuted).toBe(true);
  expect(result.didSeed).toBe(true);
  expect(result.recipeCount).toBe(expectedCount);
  expect(db.__state.insertCalls).toBe(expectedCount);
  expect(db.__state.meta.get('seedVersion')).toBe(CURRENT_SEED_VERSION);
});

test('does not reseed when seed version matches', async () => {
  const expectedCount = getBundledFreeRecipesCount();
  const db = createFakeDb({
    recipesCount: expectedCount,
    meta: new Map<string, string>([['seedVersion', CURRENT_SEED_VERSION]]),
  });

  const result = await seedDatabaseIfNeededAsync(db);

  expect(result.didSeed).toBe(false);
  expect(db.__state.insertCalls).toBe(0);
});

test('does not reseed if no seed version but expected count already present', async () => {
  const expectedCount = getBundledFreeRecipesCount();
  const db = createFakeDb({ recipesCount: expectedCount });

  const result = await seedDatabaseIfNeededAsync(db);

  expect(result.didSeed).toBe(false);
  expect(result.recipeCount).toBe(expectedCount);
  expect(db.__state.insertCalls).toBe(0);
});

test('premium bundle version meta roundtrip supports clearing', async () => {
  const db = createFakeDb();

  await expect(getPremiumBundleVersionAsync(db)).resolves.toBeNull();

  await setPremiumBundleVersionAsync(db, 'premium-1000-v1');
  await expect(getPremiumBundleVersionAsync(db)).resolves.toBe('premium-1000-v1');

  await setPremiumBundleVersionAsync(db, null);
  await expect(getPremiumBundleVersionAsync(db)).resolves.toBeNull();
});
