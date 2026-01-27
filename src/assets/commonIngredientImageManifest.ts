import type { ImageSourcePropType } from 'react-native';

export type CommonIngredientImageEntry = {
  source: ImageSourcePropType;
  imageId: string;
};

/**
 * Common ingredient image manifest mapping slug IDs to their require() sources.
 *
 * Naming convention:
 * - Store images in assets/etc/ as kebab-case filenames (e.g., honey.jpg, distilled-water.jpg).
 * - Use the slug as the imageId (e.g., "etc:honey").
 * - Add entries below when you add images.
 */
export const commonIngredientImageManifest: Record<string, CommonIngredientImageEntry> = {
  // Example:
  // 'etc:honey': { source: require('../../assets/etc/honey.jpg'), imageId: 'etc:honey' },
};
