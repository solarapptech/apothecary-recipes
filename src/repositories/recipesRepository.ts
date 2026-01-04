import type { SQLiteDatabase } from 'expo-sqlite';

import type { Plan } from '../types/plan';
import type { Recipe } from '../types/recipe';
import type { FilterMode } from '../types/filterMode';
import type { SortMode } from '../types/sortMode';

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
  launchSeed?: number;
  plan?: Plan;
};

export type ListRecipesResult = {
  rows: RecipeRow[];
  totalCount: number;
};

export function buildListRecipesQuery(input: ListRecipesInput): { sql: string; params: any[] } {
  const page = Math.max(1, input.page);
  const pageSize = Math.max(1, input.pageSize);
  const offset = (page - 1) * pageSize;

  const params: any[] = [];

  const clauses: string[] = [];

  const searchQuery = input.searchQuery?.trim();
  if (searchQuery) {
    clauses.push('title LIKE ? COLLATE NOCASE');
    params.push(`%${searchQuery}%`);
  }

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

  const query = input?.searchQuery?.trim();
  if (query) {
    clauses.push('title LIKE ? COLLATE NOCASE');
    params.push(`%${query}%`);
  }

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
}): { sql: string; params: any[] } {
  const params: any[] = [];
  const clauses: string[] = [];

  const query = input?.searchQuery?.trim();
  if (query) {
    clauses.push('title LIKE ? COLLATE NOCASE');
    params.push(`%${query}%`);
  }

  if (input?.plan === 'free') {
    clauses.push('isPremium = 0');
  }

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
