import type { SQLiteDatabase } from 'expo-sqlite';

import type { AdvancedFilters } from '../types/advancedFilters';
import type { Plan } from '../types/plan';

export type FilterCatalog = AdvancedFilters;

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

type RecipeTagRow = {
  title: string;
  usedFor: string | null;
  ingredients: string;
};

function normalizeToken(value: string): string {
  return value
    .replace(/^[\s\-•*]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitToTokens(value: string | null | undefined): string[] {
  const trimmed = value?.trim();
  if (!trimmed) {
    return [];
  }

  const normalized = trimmed.replace(/\r\n/g, '\n');

  const parts = normalized
    .split(/[\n,;|]+/g)
    .map((part) => normalizeToken(part))
    .filter((part) => part.length > 0);

  return Array.from(new Set(parts));
}

function deriveProductTypeFromTitle(title: string): string | null {
  const lowered = title.toLowerCase();

  const pairs: Array<[RegExp, string]> = [
    [/\btincture\b/i, 'Tincture'],
    [/\belixir\b/i, 'Elixir'],
    [/\bsalve\b/i, 'Salve'],
    [/\bbalm\b/i, 'Balm'],
    [/\boil\b/i, 'Oil'],
    [/\bsyrup\b/i, 'Syrup'],
    [/\btea\b/i, 'Tea'],
    [/\binfusion\b/i, 'Infusion'],
    [/\bdecoction\b/i, 'Decoction'],
    [/\btonic\b/i, 'Tonic'],
    [/\bpoultice\b/i, 'Poultice'],
    [/\bliniment\b/i, 'Liniment'],
    [/\bcompress\b/i, 'Compress'],
    [/\bsteam\b/i, 'Steam'],
    [/\bgargle\b/i, 'Gargle'],
    [/\bbath\b/i, 'Bath'],
  ];

  for (const [pattern, label] of pairs) {
    if (pattern.test(lowered)) {
      return label;
    }
  }

  return null;
}

function sortStrings(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export async function listFilterCatalogAsync(
  db: SQLiteDatabase,
  input: {
    plan: Plan;
  }
): Promise<FilterCatalog> {
  if (typeof (db as any)?.getAllAsync !== 'function') {
    return { productTypes: [], conditions: [], ingredients: [], regions: REGION_OPTIONS };
  }

  const params: any[] = [];
  const where = input.plan === 'free' ? 'WHERE isPremium = 0' : '';

  const rows = await db.getAllAsync<RecipeTagRow>(
    `SELECT title, usedFor, ingredients FROM recipes ${where}`,
    ...params
  );

  const productTypes: string[] = [];
  const conditions: string[] = [];
  const ingredients: string[] = [];

  for (const row of rows) {
    const type = deriveProductTypeFromTitle(row.title);
    if (type) {
      productTypes.push(type);
    }

    for (const token of splitToTokens(row.usedFor)) {
      conditions.push(token);
    }

    for (const token of splitToTokens(row.ingredients)) {
      ingredients.push(token);
    }
  }

  return {
    productTypes: sortStrings(productTypes),
    conditions: sortStrings(conditions),
    ingredients: sortStrings(ingredients),
    regions: REGION_OPTIONS,
  };
}
