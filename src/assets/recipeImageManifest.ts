import type { ImageSourcePropType } from 'react-native';

export type RecipeImageEntry = {
  source: ImageSourcePropType;
  kind: 'ai' | 'herb';
  imageNumber?: number;
};

export const recipeImageManifest: Record<number, RecipeImageEntry[]> = {
  1: [
    { source: require('../../assets/aiRecipes/1.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/1.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/1-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  2: [
    { source: require('../../assets/aiRecipes/2.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/2.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  3: [
    { source: require('../../assets/aiRecipes/3.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/3.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  4: [
    { source: require('../../assets/aiRecipes/4.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/4.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  5: [
    { source: require('../../assets/aiRecipes/5.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/5.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  6: [
    { source: require('../../assets/aiRecipes/6.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/6.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  7: [
    { source: require('../../assets/aiRecipes/7.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/7.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  8: [
    { source: require('../../assets/aiRecipes/8.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/8.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  9: [
    { source: require('../../assets/aiRecipes/9.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/9.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  10: [
    { source: require('../../assets/aiRecipes/10.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/10.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/10-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  11: [
    { source: require('../../assets/aiRecipes/11.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/11.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/11-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  12: [
    { source: require('../../assets/aiRecipes/12.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/12.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  13: [
    { source: require('../../assets/aiRecipes/13.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/13.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/13-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/13-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  14: [
    { source: require('../../assets/aiRecipes/14.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/14.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  15: [
    { source: require('../../assets/aiRecipes/15.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/15.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  16: [
    { source: require('../../assets/aiRecipes/16.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/16.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/16-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  17: [
    { source: require('../../assets/aiRecipes/17.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/17.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  18: [
    { source: require('../../assets/aiRecipes/18.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/18.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  19: [
    { source: require('../../assets/aiRecipes/19.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/19.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  20: [
    { source: require('../../assets/aiRecipes/20.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/20.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  21: [
    { source: require('../../assets/aiRecipes/21.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/21.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  22: [
    { source: require('../../assets/aiRecipes/22.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/22.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  23: [
    { source: require('../../assets/aiRecipes/23.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/23.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/23-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  24: [
    { source: require('../../assets/aiRecipes/24.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/24.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  25: [
    { source: require('../../assets/aiRecipes/25.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/25.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  26: [
    { source: require('../../assets/aiRecipes/26.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/26.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  27: [
    { source: require('../../assets/aiRecipes/27.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/27.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  28: [
    { source: require('../../assets/aiRecipes/28.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/28.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  29: [
    { source: require('../../assets/aiRecipes/29.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/29.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  30: [
    { source: require('../../assets/aiRecipes/30.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/30.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  31: [
    { source: require('../../assets/aiRecipes/31.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/31.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  32: [
    { source: require('../../assets/aiRecipes/32.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/32.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  33: [
    { source: require('../../assets/aiRecipes/33.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/33.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  34: [
    { source: require('../../assets/aiRecipes/34.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/34.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  35: [
    { source: require('../../assets/aiRecipes/35.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/35.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  36: [
    { source: require('../../assets/aiRecipes/36.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/36.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  37: [
    { source: require('../../assets/aiRecipes/37.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/37.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  38: [
    { source: require('../../assets/aiRecipes/38.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/38.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  39: [
    { source: require('../../assets/aiRecipes/39.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/39.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/39-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  40: [
    { source: require('../../assets/aiRecipes/40.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/40.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  41: [
    { source: require('../../assets/aiRecipes/41.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/41.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/41-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  42: [
    { source: require('../../assets/aiRecipes/42.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/42.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  43: [
    { source: require('../../assets/aiRecipes/43.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/43.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  44: [
    { source: require('../../assets/aiRecipes/44.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/44.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  45: [
    { source: require('../../assets/aiRecipes/45.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/45.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  46: [
    { source: require('../../assets/aiRecipes/46.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/46.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  47: [
    { source: require('../../assets/aiRecipes/47.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/47.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  48: [
    { source: require('../../assets/aiRecipes/48.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/48.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  49: [
    { source: require('../../assets/aiRecipes/49.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/49.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  50: [
    { source: require('../../assets/aiRecipes/50.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/50.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/50-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  51: [
    { source: require('../../assets/aiRecipes/51.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/51.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  52: [
    { source: require('../../assets/aiRecipes/52.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/52.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  53: [
    { source: require('../../assets/aiRecipes/53.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/53.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/53-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  54: [
    { source: require('../../assets/aiRecipes/54.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/54.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  55: [
    { source: require('../../assets/aiRecipes/55.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/55.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  56: [
    { source: require('../../assets/aiRecipes/56.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/56.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  57: [
    { source: require('../../assets/aiRecipes/57.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/57.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  58: [
    { source: require('../../assets/aiRecipes/58.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/58.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  59: [
    { source: require('../../assets/aiRecipes/59.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/59.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  60: [
    { source: require('../../assets/aiRecipes/60.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/60.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  61: [
    { source: require('../../assets/aiRecipes/61.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/61.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  62: [
    { source: require('../../assets/aiRecipes/62.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/62.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  63: [
    { source: require('../../assets/aiRecipes/63.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/63.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  64: [
    { source: require('../../assets/aiRecipes/64.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/64.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  65: [
    { source: require('../../assets/aiRecipes/65.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/65.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/65-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  66: [
    { source: require('../../assets/aiRecipes/66.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/66.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  67: [
    { source: require('../../assets/aiRecipes/67.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/67.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  68: [
    { source: require('../../assets/aiRecipes/68.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/68.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  69: [
    { source: require('../../assets/aiRecipes/69.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/69.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  70: [
    { source: require('../../assets/aiRecipes/70.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/70.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  71: [
    { source: require('../../assets/aiRecipes/71.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/71.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  72: [
    { source: require('../../assets/aiRecipes/72.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/72.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  73: [
    { source: require('../../assets/aiRecipes/73.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/73.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  74: [
    { source: require('../../assets/aiRecipes/74.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/74.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  75: [
    { source: require('../../assets/aiRecipes/75.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/75.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  76: [
    { source: require('../../assets/aiRecipes/76.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/76.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  77: [
    { source: require('../../assets/aiRecipes/77.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/77.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/77-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  78: [
    { source: require('../../assets/aiRecipes/78.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/78.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  79: [
    { source: require('../../assets/aiRecipes/79.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/79.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  80: [
    { source: require('../../assets/aiRecipes/80.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/80.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  81: [
    { source: require('../../assets/aiRecipes/81.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/81.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  82: [
    { source: require('../../assets/aiRecipes/82.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/82.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  83: [
    { source: require('../../assets/aiRecipes/83.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/83.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  84: [
    { source: require('../../assets/aiRecipes/84.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/84.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  85: [
    { source: require('../../assets/aiRecipes/85.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/85.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  86: [
    { source: require('../../assets/aiRecipes/86.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/86.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/86-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  87: [
    { source: require('../../assets/aiRecipes/87.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/87.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  88: [
    { source: require('../../assets/aiRecipes/88.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/88.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  89: [
    { source: require('../../assets/aiRecipes/89.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/89.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/89-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  90: [
    { source: require('../../assets/aiRecipes/90.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/90.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  91: [
    { source: require('../../assets/aiRecipes/91.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/91.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  92: [
    { source: require('../../assets/aiRecipes/92.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/92.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  93: [
    { source: require('../../assets/aiRecipes/93.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/93.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  94: [
    { source: require('../../assets/aiRecipes/94.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/94.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  95: [
    { source: require('../../assets/aiRecipes/95.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/95.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  96: [
    { source: require('../../assets/aiRecipes/96.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/96.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/96-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  97: [
    { source: require('../../assets/aiRecipes/97.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/97.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/97-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  98: [
    { source: require('../../assets/aiRecipes/98.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/98.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  99: [
    { source: require('../../assets/aiRecipes/99.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/99.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  100: [
    { source: require('../../assets/aiRecipes/100.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/100.jpg'), kind: 'herb', imageNumber: 1 },
  ],
};
