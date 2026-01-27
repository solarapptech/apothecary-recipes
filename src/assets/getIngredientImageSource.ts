import type { ImageSourcePropType } from 'react-native';

import {
  ingredientImageManifest,
  INGREDIENT_IMAGE_PLACEHOLDER,
} from './ingredientImageManifest';

/**
 * Retrieves the image source for a given ingredient image ID.
 *
 * @param imageId - The image ID to look up (e.g., "1", "2", "placeholder")
 * @returns The image source if found, or the placeholder/null if not available
 */
export function getIngredientImageSource(imageId: string | null | undefined): ImageSourcePropType | null {
  if (!imageId) {
    return INGREDIENT_IMAGE_PLACEHOLDER;
  }

  const entry = ingredientImageManifest[imageId];
  if (entry) {
    return entry.source;
  }

  return INGREDIENT_IMAGE_PLACEHOLDER;
}

/**
 * Checks if an ingredient image exists in the manifest.
 *
 * @param imageId - The image ID to check
 * @returns true if the image exists in the manifest
 */
export function hasIngredientImage(imageId: string | null | undefined): boolean {
  if (!imageId) {
    return false;
  }

  return imageId in ingredientImageManifest;
}
