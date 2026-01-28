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
  'etc:water': { source: require('../../assets/etc/water.jpg'), imageId: 'etc:water' },
  'etc:boiling-water': { source: require('../../assets/etc/boiling-water.jpg'), imageId: 'etc:boiling-water' },
  'etc:brandy-spirit': { source: require('../../assets/etc/brandy-spirit.jpg'), imageId: 'etc:brandy-spirit' },
  'etc:cane-sugar': { source: require('../../assets/etc/cane-sugar.jpg'), imageId: 'etc:cane-sugar' },
  'etc:coarse-sea-salt': { source: require('../../assets/etc/coarse-sea-salt.jpg'), imageId: 'etc:coarse-sea-salt' },
  'etc:distilled-water': { source: require('../../assets/etc/distilled-water.jpg'), imageId: 'etc:distilled-water' },
  'etc:egg-white': { source: require('../../assets/etc/egg-white.jpg'), imageId: 'etc:egg-white' },
  'etc:grain-spirit': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:grain-spirit' },
  'etc:red-wine': { source: require('../../assets/etc/red-wine.jpg'), imageId: 'etc:red-wine' },
  'etc:dry-red-wine': { source: require('../../assets/etc/dry-red-wine.jpg'), imageId: 'etc:dry-red-wine' },
  'etc:sugar-syrup': { source: require('../../assets/etc/sugar-syrup.jpg'), imageId: 'etc:sugar-syrup' },
  'etc:vodka-brandy': { source: require('../../assets/etc/vodka-brandy.jpg'), imageId: 'etc:vodka-brandy' },
  'etc:white-wine': { source: require('../../assets/etc/white-wine.jpg'), imageId: 'etc:white-wine' },
  'etc:dry-white-wine': { source: require('../../assets/etc/dry-white-wine.jpg'), imageId: 'etc:dry-white-wine' },
  'etc:yeast': { source: require('../../assets/etc/yeast.jpg'), imageId: 'etc:yeast' },
};
