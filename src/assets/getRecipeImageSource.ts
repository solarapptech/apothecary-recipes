import type { RecipeImageEntry } from './recipeImageManifest';

import { recipeImageManifest } from './recipeImageManifest';

export function getRecipeImageSource(recipeId: number): RecipeImageEntry[] | null {
  const entries = recipeImageManifest[recipeId];
  if (!entries || entries.length === 0) {
    return null;
  }

  const herbEntries = entries.filter((entry) => entry.kind !== 'ai');
  const aiEntries = entries.filter((entry) => entry.kind === 'ai');
  return [...herbEntries, ...aiEntries];
}
