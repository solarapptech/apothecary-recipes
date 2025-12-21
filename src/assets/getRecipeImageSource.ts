import type { ImageSourcePropType } from 'react-native';

import { recipeImageManifest } from './recipeImageManifest';

export function getRecipeImageSource(recipeId: number): ImageSourcePropType | null {
  return recipeImageManifest[recipeId] ?? null;
}
