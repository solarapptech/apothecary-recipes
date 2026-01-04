import type { SQLiteDatabase } from 'expo-sqlite';

export type FavoriteRow = {
  recipeId: number;
  createdAt: number;
};

export async function setFavoriteAsync(db: SQLiteDatabase, recipeId: number, isFavorite: boolean): Promise<void> {
  if (typeof (db as any)?.runAsync !== 'function') {
    return;
  }

  const id = Math.floor(recipeId);
  if (!Number.isFinite(id) || id <= 0) {
    return;
  }

  if (!isFavorite) {
    await db.runAsync('DELETE FROM recipe_favorites WHERE recipeId = ?', id);
    return;
  }

  const createdAt = Date.now();
  await db.runAsync(
    'INSERT OR REPLACE INTO recipe_favorites (recipeId, createdAt) VALUES (?, ?)',
    id,
    createdAt
  );
}

export async function isFavoriteAsync(db: SQLiteDatabase, recipeId: number): Promise<boolean> {
  if (typeof (db as any)?.getFirstAsync !== 'function') {
    return false;
  }

  const id = Math.floor(recipeId);
  if (!Number.isFinite(id) || id <= 0) {
    return false;
  }

  const row = await db.getFirstAsync<{ recipeId: number }>('SELECT recipeId FROM recipe_favorites WHERE recipeId = ? LIMIT 1', id);
  return !!row;
}

export async function listFavoriteIdsAsync(db: SQLiteDatabase): Promise<number[]> {
  if (typeof (db as any)?.getAllAsync !== 'function') {
    return [];
  }

  const rows = await db.getAllAsync<{ recipeId: number }>('SELECT recipeId FROM recipe_favorites');
  return rows.map((row) => row.recipeId);
}
