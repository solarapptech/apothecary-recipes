import type { SQLiteDatabase } from 'expo-sqlite';

import type { AdvancedFilters } from '../types/advancedFilters';
import type { Plan } from '../types/plan';
import type { Recipe } from '../types/recipe';
import type { FilterMode } from '../types/filterMode';
import type { SortMode } from '../types/sortMode';

import { normalizeSearchText, parseSearchQueryParts } from '../db/searchText';

export type RecipeRow = Recipe & {
  id: number;
  randomKey: number;
  isPremium: number;
  imageLocalPath: string | null;
  isFavorite: number;
};

export type ListRecipesInput = {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortMode: SortMode;
  filterMode?: FilterMode;
  advancedFilters?: AdvancedFilters;
  category?: string;
  launchSeed?: number;
  plan?: Plan;
};

export type ListRecipesResult = {
  rows: RecipeRow[];
  totalCount: number;
};

function escapeLikeValue(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function pushRegionClause(input: { label: string; clauses: string[]; params: any[] }) {
  const lowered = input.label.toLowerCase();

  type Pattern = { like: string; notLike?: string[] };

  const patterns: Pattern[] = [];

  if (lowered === 'north america') {
    patterns.push({ like: '%North America%' });
    patterns.push({ like: '%USA%' });
    patterns.push({ like: '%United States%' });
    patterns.push({ like: '%California%' });
    patterns.push({ like: '%Great Plains%' });
    patterns.push({ like: '%Pacific Northwest%' });
    patterns.push({ like: '%Southwest%' });
    patterns.push({ like: '%Eastern US%' });
  } else if (lowered === 'central america & caribbean') {
    // Caribbean-first: if region mentions Caribbean, it should match this bucket.
    patterns.push({ like: '%Caribbean%' });
    patterns.push({ like: '%Central America%' });
    patterns.push({ like: '%North/Central America%' });
    patterns.push({ like: '%Caribbean/Central America%' });
  } else if (lowered === 'south america') {
    patterns.push({ like: '%South America%' });
    patterns.push({ like: '%Amazonia%' });
    patterns.push({ like: '%Andes%' });
    patterns.push({ like: '%Paraguay%' });
    patterns.push({ like: '%Argentina%' });
    patterns.push({ like: '%Brazil%' });
  } else if (lowered === 'western & southern europe') {
    patterns.push({ like: '%Western Europe%' });
    patterns.push({ like: '%Southern Europe%' });
    patterns.push({ like: '%Europe%' });

    // Mediterranean tweak: treat Mediterranean as Europe unless explicitly MENA.
    patterns.push({
      like: '%Mediterranean%'
      ,
      notLike: ['%Middle East%', '%North Africa%', '%MENA%', '%Levant%'],
    });
  } else if (lowered === 'northern & eastern europe') {
    patterns.push({ like: '%Eastern Europe%' });
    patterns.push({ like: '%Central Europe%' });
    patterns.push({ like: '%Northern Europe%' });
    patterns.push({ like: '%Scandinavia%' });
    patterns.push({ like: '%Russia%' });
    patterns.push({ like: '%Siberia%' });
    patterns.push({ like: '%Ukraine%' });
    patterns.push({ like: '%Viking%' });
  } else if (lowered === 'north africa & middle east (mena)') {
    patterns.push({ like: '%MENA%' });
    patterns.push({ like: '%Middle East%' });
    patterns.push({ like: '%Levant%' });
    patterns.push({ like: '%North Africa%' });
  } else if (lowered === 'west africa') {
    patterns.push({ like: '%West Africa%' });
  } else if (lowered === 'sub-saharan africa (general)') {
    patterns.push({ like: '%Sub-Saharan%' });
  } else if (lowered === 'southern africa') {
    patterns.push({ like: '%Southern Africa%' });
    patterns.push({ like: '%Cape%' });
    patterns.push({ like: '%Kalahari%' });
  } else if (lowered === 'east asia') {
    patterns.push({ like: '%East Asia%' });
    patterns.push({ like: '%China%' });
    patterns.push({ like: '%Japan%' });
    patterns.push({ like: '%Korea%' });
  } else if (lowered === 'south asia (india/subcontinent)') {
    patterns.push({ like: '%South Asia%' });
    patterns.push({ like: '%India%' });
    patterns.push({ like: '%Subcontinent%' });
    patterns.push({ like: '%Ayurveda%' });
  } else if (lowered === 'oceania (australia & pacific islands)') {
    patterns.push({ like: '%Australia%' });
    patterns.push({ like: '%Tasmania%' });
    patterns.push({ like: '%Pacific Islands%' });
    patterns.push({ like: '%Polynesia%' });
    patterns.push({ like: '%Hawaii%' });
    patterns.push({ like: '%Fiji%' });
    patterns.push({ like: '%Tonga%' });
    patterns.push({ like: '%Vanuatu%' });
  } else if (lowered === 'other / global') {
    patterns.push({ like: '%Global%' });
    patterns.push({ like: '%Trade%' });
  }

  if (patterns.length === 0) {
    return;
  }

  const orClauses: string[] = [];
  for (const pattern of patterns) {
    const inner: string[] = [];
    inner.push("region LIKE ? ESCAPE '\\' COLLATE NOCASE");
    input.params.push(pattern.like);

    for (const notLike of pattern.notLike ?? []) {
      inner.push("region NOT LIKE ? ESCAPE '\\' COLLATE NOCASE");
      input.params.push(notLike);
    }

    orClauses.push(`(${inner.join(' AND ')})`);
  }

  input.clauses.push(`(${orClauses.join(' OR ')})`);
}

function buildSearchQueryClauses(input: { searchQuery?: string; params: any[] }): string[] {
  const raw = input.searchQuery?.trim();
  if (!raw) {
    return [];
  }

  const parts = parseSearchQueryParts(raw);
  if (parts.length === 0) {
    return [];
  }

  const clauses: string[] = [];
  for (const part of parts) {
    const normalized = normalizeSearchText(part);
    if (!normalized) {
      continue;
    }
    clauses.push("searchTextNormalized LIKE ? ESCAPE '\\'");
    input.params.push(`%${escapeLikeValue(normalized)}%`);
  }

  return clauses;
}

function buildCategoryClauses(input: { category?: string; params: any[] }): string[] {
  const category = input.category?.trim();
  if (!category) {
    return [];
  }

  const clauses: string[] = [];
  const like = "usedFor LIKE ? ESCAPE '\\' COLLATE NOCASE";

  const pushLike = (token: string) => {
    clauses.push(like);
    input.params.push(`%${escapeLikeValue(token)}%`);
  };

  if (category === 'respiratory') {
    pushLike('Respiratory System');
    return clauses;
  }
  if (category === 'digestive') {
    pushLike('Digestive System');
    return clauses;
  }
  if (category === 'immune') {
    pushLike('Immune System');
    return clauses;
  }
  if (category === 'skin') {
    pushLike('Skin & Wounds');
    return clauses;
  }
  if (category === 'sleep') {
    pushLike('Nervous System & Sleep');
    return clauses;
  }
  if (category === 'women') {
    pushLike("Women's Health");
    return clauses;
  }
  if (category === 'heart') {
    pushLike('Cardiovascular System');
    return clauses;
  }
  if (category === 'urinary') {
    pushLike('Urinary System');
    return clauses;
  }
  if (category === 'tonics') {
    pushLike('General Wellness/Tonics');
    return clauses;
  }

  if (category === 'pain') {
    // Broad category with OR semantics.
    clauses.push(`(${like} OR ${like})`);
    input.params.push(`%${escapeLikeValue('Musculoskeletal System')}%`);
    input.params.push(`%${escapeLikeValue('Pain & Headache')}%`);
    return clauses;
  }

  return [];
}

function buildAdvancedFilterClauses(input: {
  advancedFilters?: AdvancedFilters;
  params: any[];
}): string[] {
  const filters = input.advancedFilters;
  if (!filters) {
    return [];
  }

  const clauses: string[] = [];

  const productTypeMap: Record<string, string> = {
    Tincture: 'tincture',
    Elixir: 'elixir',
    Salve: 'salve',
    Balm: 'balm',
    Oil: 'oil',
    Syrup: 'syrup',
    Tea: 'tea',
    Infusion: 'infusion',
    Decoction: 'decoction',
    Tonic: 'tonic',
    Poultice: 'poultice',
    Liniment: 'liniment',
    Compress: 'compress',
    Steam: 'steam',
    Gargle: 'gargle',
    Bath: 'bath',
  };

  for (const label of filters.productTypes) {
    const token = productTypeMap[label];
    if (!token) {
      continue;
    }
    clauses.push("title LIKE ? ESCAPE '\\' COLLATE NOCASE");
    input.params.push(`%${escapeLikeValue(token)}%`);
  }

  for (const token of filters.conditions) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }
    clauses.push("usedFor LIKE ? ESCAPE '\\' COLLATE NOCASE");
    input.params.push(`%${escapeLikeValue(trimmed)}%`);
  }

  for (const token of filters.ingredients) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }
    clauses.push("ingredients LIKE ? ESCAPE '\\' COLLATE NOCASE");
    input.params.push(`%${escapeLikeValue(trimmed)}%`);
  }

  for (const label of filters.regions ?? []) {
    const trimmed = label.trim();
    if (!trimmed) {
      continue;
    }
    pushRegionClause({ label: trimmed, clauses, params: input.params });
  }

  return clauses;
}

export function buildListRecipesQuery(input: ListRecipesInput): { sql: string; params: any[] } {
  const page = Math.max(1, input.page);
  const pageSize = Math.max(1, input.pageSize);
  const offset = (page - 1) * pageSize;

  const params: any[] = [];

  const clauses: string[] = [];

  clauses.push(...buildSearchQueryClauses({ searchQuery: input.searchQuery, params }));

  clauses.push(...buildAdvancedFilterClauses({ advancedFilters: input.advancedFilters, params }));

  clauses.push(...buildCategoryClauses({ category: input.category, params }));

  if (input.plan === 'free') {
    clauses.push('isPremium = 0');
  }

  const filterMode = input.filterMode ?? 'all';
  if (filterMode === 'favorites') {
    clauses.push('recipe_favorites.recipeId IS NOT NULL');
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  let orderClause = 'ORDER BY title COLLATE NOCASE ASC';

  if (input.sortMode === 'za') {
    orderClause = 'ORDER BY title COLLATE NOCASE DESC';
  }

  if (input.sortMode === 'random') {
    if (typeof input.launchSeed !== 'number') {
      throw new Error('launchSeed is required for random sort');
    }

    orderClause = 'ORDER BY abs((randomKey * 1103515245 + ?) % 2147483647) ASC';
    params.push(input.launchSeed);
  }

  const sql = `SELECT recipes.id, title, difficultyScore, preparationTime, description, timePeriod, warning, region, alternativeNames, usedFor, ingredients, detailedMeasurements, preparationSteps, usage, historicalContext, scientificEvidence, randomKey, isPremium, imageLocalPath,
CASE WHEN recipe_favorites.recipeId IS NULL THEN 0 ELSE 1 END AS isFavorite
FROM recipes
LEFT JOIN recipe_favorites ON recipe_favorites.recipeId = recipes.id
${whereClause}
${orderClause}
LIMIT ? OFFSET ?`;

  params.push(pageSize, offset);

  return { sql, params };
}

export function buildCountRecipesQuery(input?: { searchQuery?: string; plan?: Plan }): { sql: string; params: any[] } {
  const params: any[] = [];
  const clauses: string[] = [];

  clauses.push(...buildSearchQueryClauses({ searchQuery: input?.searchQuery, params }));

  if (input?.plan === 'free') {
    clauses.push('isPremium = 0');
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*) as count
FROM recipes
${whereClause}`;
  return { sql, params };
}

export function buildCountRecipesQueryWithFilter(input?: {
  searchQuery?: string;
  plan?: Plan;
  filterMode?: FilterMode;
  advancedFilters?: AdvancedFilters;
  category?: string;
}): { sql: string; params: any[] } {
  const params: any[] = [];
  const clauses: string[] = [];

  clauses.push(...buildSearchQueryClauses({ searchQuery: input?.searchQuery, params }));

  if (input?.plan === 'free') {
    clauses.push('isPremium = 0');
  }

  clauses.push(...buildAdvancedFilterClauses({ advancedFilters: input?.advancedFilters, params }));

  clauses.push(...buildCategoryClauses({ category: input?.category, params }));

  const filterMode = input?.filterMode ?? 'all';
  const fromClause =
    filterMode === 'favorites'
      ? 'FROM recipes INNER JOIN recipe_favorites ON recipe_favorites.recipeId = recipes.id'
      : 'FROM recipes';

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*) as count
${fromClause}
${whereClause}`;
  return { sql, params };
}

export async function listRecipesAsync(
  db: SQLiteDatabase,
  input: ListRecipesInput
): Promise<ListRecipesResult> {
  const { sql, params } = buildListRecipesQuery(input);
  const { sql: countSql, params: countParams } = buildCountRecipesQueryWithFilter({
    searchQuery: input.searchQuery,
    plan: input.plan,
    filterMode: input.filterMode,
    advancedFilters: input.advancedFilters,
    category: input.category,
  });

  const [rows, countRow] = await Promise.all([
    db.getAllAsync<RecipeRow>(sql, ...params),
    db.getFirstAsync<{ count: number }>(countSql, ...countParams),
  ]);

  return {
    rows,
    totalCount: countRow?.count ?? 0,
  };
}
