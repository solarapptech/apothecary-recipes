import type { RecipeImageEntry } from './recipeImageManifest';

import { recipeImageManifest } from './recipeImageManifest';

export function getRecipeImageSource(recipeId: number): RecipeImageEntry[] | null {
  return recipeImageManifest[recipeId] ?? null;
}
