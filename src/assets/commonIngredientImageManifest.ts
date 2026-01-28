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
  'etc:alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:alcohol' },
  'etc:40-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:40-alcohol' },
  'etc:50-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:50-alcohol' },
  'etc:70-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:70-alcohol' },
  'etc:95-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:95-alcohol' },
  'etc:angelic-root': { source: require('../../assets/etc/angelic-root.jpg'), imageId: 'etc:angelic-root' },
  'etc:anise-seed': { source: require('../../assets/etc/anise-seed.jpg'), imageId: 'etc:anise-seed' },
  'etc:any-of-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:any-of-alcohol' },
  'etc:any-type-of-brandy-or-spirit': {
    source: require('../../assets/etc/grain-spirit.jpg'),
    imageId: 'etc:any-type-of-brandy-or-spirit',
  },
  'etc:apple-cider-vinegar': {
    source: require('../../assets/etc/apple-cider-vinegar.jpg'),
    imageId: 'etc:apple-cider-vinegar',
  },
  'etc:aquavit': { source: require('../../assets/etc/aquavit.jpg'), imageId: 'etc:aquavit' },
  'etc:beeswax': { source: require('../../assets/etc/beewax.jpg'), imageId: 'etc:beeswax' },
  'etc:beewax': { source: require('../../assets/etc/beewax.jpg'), imageId: 'etc:beewax' },
  'etc:boiling-water': { source: require('../../assets/etc/boiling-water.jpg'), imageId: 'etc:boiling-water' },
  'etc:brandy': { source: require('../../assets/etc/brandy-spirit.jpg'), imageId: 'etc:brandy' },
  'etc:brandy-spirit': { source: require('../../assets/etc/brandy-spirit.jpg'), imageId: 'etc:brandy-spirit' },
  'etc:brandy-or-spirit': { source: require('../../assets/etc/brandy-spirit.jpg'), imageId: 'etc:brandy-or-spirit' },
  'etc:cane-sugar': { source: require('../../assets/etc/cane-sugar.jpg'), imageId: 'etc:cane-sugar' },
  'etc:castor-oil': { source: require('../../assets/etc/castor-oil.jpg'), imageId: 'etc:castor-oil' },
  'etc:chamomille-flowers': {
    source: require('../../assets/etc/chamomille-flowers.jpg'),
    imageId: 'etc:chamomille-flowers',
  },
  'etc:coarse-sea-salt': {
    source: require('../../assets/etc/coarse-sea-salt.jpg'),
    imageId: 'etc:coarse-sea-salt',
  },
  'etc:comfrey-root': { source: require('../../assets/etc/comfrey-root.jpg'), imageId: 'etc:comfrey-root' },
  'etc:crushed-oak-galls': {
    source: require('../../assets/etc/crushed-oak-galls.jpg'),
    imageId: 'etc:crushed-oak-galls',
  },
  'etc:distilled-water': { source: require('../../assets/etc/distilled-water.jpg'), imageId: 'etc:distilled-water' },
  'etc:dried-hops-cones': {
    source: require('../../assets/etc/dried-hops-cones.jpg'),
    imageId: 'etc:dried-hops-cones',
  },
  'etc:dried-lavender': { source: require('../../assets/etc/dried-lavender.jpg'), imageId: 'etc:dried-lavender' },
  'etc:dried-lemon-peels': {
    source: require('../../assets/etc/dried-lemon-peels.jpg'),
    imageId: 'etc:dried-lemon-peels',
  },
  'etc:dried-reindeer-moss': {
    source: require('../../assets/etc/dried-reindeer-moss.jpg'),
    imageId: 'etc:dried-reindeer-moss',
  },
  'etc:dried-sage-leaf': {
    source: require('../../assets/etc/dried-sage-leaf.jpg'),
    imageId: 'etc:dried-sage-leaf',
  },
  'etc:dry-red-wine': { source: require('../../assets/etc/dry-red-wine.jpg'), imageId: 'etc:dry-red-wine' },
  'etc:dry-white-wine': { source: require('../../assets/etc/dry-white-wine.jpg'), imageId: 'etc:dry-white-wine' },
  'etc:egg-white': { source: require('../../assets/etc/egg-white.jpg'), imageId: 'etc:egg-white' },
  'etc:frankincense-resin': {
    source: require('../../assets/etc/frankincense-resin.jpg'),
    imageId: 'etc:frankincense-resin',
  },
  'etc:fresh-red-poppy-petals': {
    source: require('../../assets/etc/fresh-red-poppy-petals.jpg'),
    imageId: 'etc:fresh-red-poppy-petals',
  },
  'etc:fresh-rosemary': { source: require('../../assets/etc/fresh-rosemary.jpg'), imageId: 'etc:fresh-rosemary' },
  'etc:fresh-water-mint-leaf': {
    source: require('../../assets/etc/fresh-water-mint-leaf.jpg'),
    imageId: 'etc:fresh-water-mint-leaf',
  },
  'etc:garlic-cloves': { source: require('../../assets/etc/garlic-cloves.jpg'), imageId: 'etc:garlic-cloves' },
  'etc:ghee-butter': { source: require('../../assets/etc/ghee-butter.jpg'), imageId: 'etc:ghee-butter' },
  'etc:ghee': { source: require('../../assets/etc/ghee-butter.jpg'), imageId: 'etc:ghee' },
  'etc:gin': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:gin' },
  'etc:gin-or-strong-vodka': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:gin-or-strong-vodka' },
  'etc:glycerin': { source: require('../../assets/etc/honey.jpg'), imageId: 'etc:glycerin' },
  'etc:glycerin-or-sugar': { source: require('../../assets/etc/honey.jpg'), imageId: 'etc:glycerin-or-sugar' },
  'etc:grain-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:grain-alcohol' },
  'etc:grain-spirit': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:grain-spirit' },
  'etc:gum-arabic': { source: require('../../assets/etc/gum-arabic.jpg'), imageId: 'etc:gum-arabic' },
  'etc:honey': { source: require('../../assets/etc/honey.jpg'), imageId: 'etc:honey' },
  'etc:honey-or-sugar': { source: require('../../assets/etc/honey.jpg'), imageId: 'etc:honey-or-sugar' },
  'etc:honey-sugar': { source: require('../../assets/etc/honey-sugar.jpg'), imageId: 'etc:honey-sugar' },
  'etc:icelandic-moss-powder': {
    source: require('../../assets/etc/icelandic-moss-powder.jpg'),
    imageId: 'etc:icelandic-moss-powder',
  },
  'etc:lard': { source: require('../../assets/etc/lard.jpg'), imageId: 'etc:lard' },
  'etc:lard-olive-oil': { source: require('../../assets/etc/lard-olive-oil.jpg'), imageId: 'etc:lard-olive-oil' },
  'etc:lard-or-olive-oil': { source: require('../../assets/etc/lard-olive-oil.jpg'), imageId: 'etc:lard-or-olive-oil' },
  'etc:lard-tallow': { source: require('../../assets/etc/lard-tallow.jpg'), imageId: 'etc:lard-tallow' },
  'etc:lard-tallow-or-shea-butter': { source: require('../../assets/etc/lard-tallow.jpg'), imageId: 'etc:lard-tallow-or-shea-butter' },
  'etc:licorice-root': { source: require('../../assets/etc/licorice-root.jpg'), imageId: 'etc:licorice-root' },
  'etc:licorice-root-powder': {
    source: require('../../assets/etc/licorice-root-powder.jpg'),
    imageId: 'etc:licorice-root-powder',
  },
  'etc:meadowsweet-flower-tops': {
    source: require('../../assets/etc/meadowsweet-flower-tops.jpg'),
    imageId: 'etc:meadowsweet-flower-tops',
  },
  'etc:meadowsweet-flowers-leaves': {
    source: require('../../assets/etc/meadowsweet-flowers-leaves.jpg'),
    imageId: 'etc:meadowsweet-flowers-leaves',
  },
  'etc:milk-or-water': { source: require('../../assets/etc/milk-or-water.jpg'), imageId: 'etc:milk-or-water' },
  'etc:mullein-flower-oil': {
    source: require('../../assets/etc/mullein-flower-oil.jpg'),
    imageId: 'etc:mullein-flower-oil',
  },
  'etc:neutral-grain-spirit': {
    source: require('../../assets/etc/neutral-grain-spirit.jpg'),
    imageId: 'etc:neutral-grain-spirit',
  },
  'etc:oatmeal': { source: require('../../assets/etc/oatmeal.jpg'), imageId: 'etc:oatmeal' },
  'etc:olive-oil': { source: require('../../assets/etc/olive-oil.jpg'), imageId: 'etc:olive-oil' },
  'etc:olive-oil-or-sunflower-oil': { source: require('../../assets/etc/olive-oil.jpg'), imageId: 'etc:olive-oil-or-sunflower-oil' },
  'etc:pimpinella-anisum': { source: require('../../assets/etc/pimpinella-anisum.jpg'), imageId: 'etc:pimpinella-anisum' },
  'etc:pine-resin': { source: require('../../assets/etc/pine-resin.jpg'), imageId: 'etc:pine-resin' },
  'etc:pine-spruce-resin': { source: require('../../assets/etc/pine-resin.jpg'), imageId: 'etc:pine-spruce-resin' },
  'etc:quality-red-wine': { source: require('../../assets/etc/quality-red-wine.jpg'), imageId: 'etc:quality-red-wine' },
  'etc:raw-honey': { source: require('../../assets/etc/raw-honey.jpg'), imageId: 'etc:raw-honey' },
  'etc:red-wine': { source: require('../../assets/etc/red-wine.jpg'), imageId: 'etc:red-wine' },
  'etc:riesling': { source: require('../../assets/etc/riesling.jpg'), imageId: 'etc:riesling' },
  'etc:rose-hips': { source: require('../../assets/etc/rose-hips.jpg'), imageId: 'etc:rose-hips' },
  'etc:rose-petals': { source: require('../../assets/etc/rose-petals.jpg'), imageId: 'etc:rose-petals' },
  'etc:rue-leaf': { source: require('../../assets/etc/rue-leaf.jpg'), imageId: 'etc:rue-leaf' },
  'etc:strong-alcohol': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:strong-alcohol' },
  'etc:sugar': { source: require('../../assets/etc/cane-sugar.jpg'), imageId: 'etc:sugar' },
  'etc:sugar-syrup': { source: require('../../assets/etc/sugar-syrup.jpg'), imageId: 'etc:sugar-syrup' },
  'etc:sugar-or-honey': { source: require('../../assets/etc/cane-sugar.jpg'), imageId: 'etc:sugar-or-honey' },
  'etc:usnea-barbata': { source: require('../../assets/etc/usnea-barbata.jpg'), imageId: 'etc:usnea-barbata' },
  'etc:usnea-lichen': { source: require('../../assets/etc/usnea-barbata.jpg'), imageId: 'etc:usnea-lichen' },
  'etc:vodka-brandy': { source: require('../../assets/etc/vodka-brandy.jpg'), imageId: 'etc:vodka-brandy' },
  'etc:water': { source: require('../../assets/etc/water.jpg'), imageId: 'etc:water' },
  'etc:white-wine': { source: require('../../assets/etc/white-wine.jpg'), imageId: 'etc:white-wine' },
  'etc:vodka': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:vodka' },
  'etc:vodka-or-grain-spirit': { source: require('../../assets/etc/grain-spirit.jpg'), imageId: 'etc:vodka-or-grain-spirit' },
  'etc:wormwood': { source: require('../../assets/etc/wormwood.jpg'), imageId: 'etc:wormwood' },
  'etc:yeast': { source: require('../../assets/etc/yeast.jpg'), imageId: 'etc:yeast' },
  'etc:yeast-or-rye-bread-starter': { source: require('../../assets/etc/yeast.jpg'), imageId: 'etc:yeast-or-rye-bread-starter' },
};
