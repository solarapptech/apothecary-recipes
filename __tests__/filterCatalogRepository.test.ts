import { listFilterCatalogAsync } from '../src/repositories/filterCatalogRepository';

const REGION_OPTIONS: string[] = [
  'North America',
  'Central America & Caribbean',
  'South America',
  'Western & Southern Europe',
  'Northern & Eastern Europe',
  'North Africa & Middle East (MENA)',
  'West Africa',
  'Sub-Saharan Africa (General)',
  'Southern Africa',
  'East Asia',
  'South Asia (India/Subcontinent)',
  'Oceania (Australia & Pacific Islands)',
  'Other / Global',
];

function createFakeDb(rows: Array<{ title: string; usedFor: string | null; ingredients: string; isPremium: number }>) {
  const db = {
    getAllAsync: async <T>(sql: string) => {
      const filtered = sql.includes('WHERE isPremium = 0') ? rows.filter((row) => row.isPremium === 0) : rows;
      return filtered.map(({ title, usedFor, ingredients }) => ({ title, usedFor, ingredients } as any)) as T[];
    },
  };

  return db as any;
}

test('listFilterCatalogAsync returns empty arrays when db lacks getAllAsync', async () => {
  const db = {} as any;
  await expect(listFilterCatalogAsync(db, { plan: 'free' })).resolves.toEqual({
    productTypes: [],
    conditions: [],
    ingredients: [],
    regions: REGION_OPTIONS,
  });
});

test('listFilterCatalogAsync derives productTypes, conditions, and ingredients from local rows', async () => {
  const db = createFakeDb([
    {
      title: 'Lavender Sleep Tincture',
      usedFor: 'Sleep, Anxiety',
      ingredients: 'Lavender\nHoney',
      isPremium: 0,
    },
    {
      title: 'Ginger Tea',
      usedFor: 'Nausea; Digestion',
      ingredients: 'Ginger, Lemon',
      isPremium: 0,
    },
  ]);

  await expect(listFilterCatalogAsync(db, { plan: 'free' })).resolves.toEqual({
    productTypes: ['Tea', 'Tincture'],
    conditions: ['Anxiety', 'Digestion', 'Nausea', 'Sleep'],
    ingredients: ['Ginger', 'Honey', 'Lavender', 'Lemon'],
    regions: REGION_OPTIONS,
  });
});

test('listFilterCatalogAsync includes premium rows when plan is premium', async () => {
  const db = createFakeDb([
    {
      title: 'Lavender Sleep Tincture',
      usedFor: 'Sleep',
      ingredients: 'Lavender',
      isPremium: 0,
    },
    {
      title: 'Elderberry Syrup',
      usedFor: 'Cold',
      ingredients: 'Elderberry',
      isPremium: 1,
    },
  ]);

  await expect(listFilterCatalogAsync(db, { plan: 'premium' })).resolves.toEqual({
    productTypes: ['Syrup', 'Tincture'],
    conditions: ['Cold', 'Sleep'],
    ingredients: ['Elderberry', 'Lavender'],
    regions: REGION_OPTIONS,
  });
});
