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
    { source: require('../../assets/herbs/1-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  2: [
    { source: require('../../assets/aiRecipes/2.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/2.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/2-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  3: [
    { source: require('../../assets/aiRecipes/3.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/3.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/3-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  4: [
    { source: require('../../assets/aiRecipes/4.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/4.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/4-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  5: [
    { source: require('../../assets/aiRecipes/5.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/5.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/5-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  6: [
    { source: require('../../assets/aiRecipes/6.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/6.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/6-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  7: [
    { source: require('../../assets/aiRecipes/7.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/7.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/7-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  8: [
    { source: require('../../assets/aiRecipes/8.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/8.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/8-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  9: [
    { source: require('../../assets/aiRecipes/9.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/9.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/9-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  10: [
    { source: require('../../assets/aiRecipes/10.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/10.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/10-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/10-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  11: [
    { source: require('../../assets/aiRecipes/11.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/11.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/11-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/11-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  12: [
    { source: require('../../assets/aiRecipes/12.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/12.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/12-2.jpg'), kind: 'herb', imageNumber: 2 },
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
    { source: require('../../assets/herbs/14-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  15: [
    { source: require('../../assets/aiRecipes/15.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/15.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/15-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  16: [
    { source: require('../../assets/aiRecipes/16.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/16.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/16-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/16-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  17: [
    { source: require('../../assets/aiRecipes/17.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/17.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/17-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  18: [
    { source: require('../../assets/aiRecipes/18.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/18.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/18-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  19: [
    { source: require('../../assets/aiRecipes/19.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/19.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/19-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  20: [
    { source: require('../../assets/aiRecipes/20.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/20.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/20-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  21: [
    { source: require('../../assets/aiRecipes/21.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/21.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/21-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  22: [
    { source: require('../../assets/aiRecipes/22.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/22.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/22-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  23: [
    { source: require('../../assets/aiRecipes/23.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/23.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/23-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/23-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  24: [
    { source: require('../../assets/aiRecipes/24.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/24.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/24-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  25: [
    { source: require('../../assets/aiRecipes/25.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/25.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/25-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  26: [
    { source: require('../../assets/aiRecipes/26.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/26.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/26-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  27: [
    { source: require('../../assets/aiRecipes/27.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/27.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/27-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  28: [
    { source: require('../../assets/aiRecipes/28.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/28.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/28-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  29: [
    { source: require('../../assets/aiRecipes/29.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/29.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/29-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/29-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  30: [
    { source: require('../../assets/aiRecipes/30.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/30.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/30-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  31: [
    { source: require('../../assets/aiRecipes/31.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/31.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/31-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  32: [
    { source: require('../../assets/aiRecipes/32.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/32.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/32-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  33: [
    { source: require('../../assets/aiRecipes/33.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/33.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/33-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  34: [
    { source: require('../../assets/aiRecipes/34.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/34.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/34-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  35: [
    { source: require('../../assets/aiRecipes/35.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/35.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/35-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  36: [
    { source: require('../../assets/aiRecipes/36.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/36.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/36-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  37: [
    { source: require('../../assets/aiRecipes/37.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/37.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/37-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  38: [
    { source: require('../../assets/aiRecipes/38.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/38.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/38-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  39: [
    { source: require('../../assets/aiRecipes/39.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/39.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/39-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/39-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  40: [
    { source: require('../../assets/aiRecipes/40.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/40.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/40-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  41: [
    { source: require('../../assets/aiRecipes/41.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/41.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/41-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/41-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  42: [
    { source: require('../../assets/aiRecipes/42.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/42.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/42-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  43: [
    { source: require('../../assets/aiRecipes/43.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/43.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/43-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  44: [
    { source: require('../../assets/aiRecipes/44.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/44.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/44-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  45: [
    { source: require('../../assets/aiRecipes/45.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/45.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/45-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  46: [
    { source: require('../../assets/aiRecipes/46.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/46.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/46-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  47: [
    { source: require('../../assets/aiRecipes/47.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/47.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/47-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  48: [
    { source: require('../../assets/aiRecipes/48.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/48.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/48-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/48-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  49: [
    { source: require('../../assets/aiRecipes/49.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/49.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/49-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  50: [
    { source: require('../../assets/aiRecipes/50.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/50.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/50-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/50-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  51: [
    { source: require('../../assets/aiRecipes/51.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/51.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/51-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  52: [
    { source: require('../../assets/aiRecipes/52.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/52.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/52-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  53: [
    { source: require('../../assets/aiRecipes/53.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/53.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/53-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/53-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  54: [
    { source: require('../../assets/aiRecipes/54.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/54.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/54-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  55: [
    { source: require('../../assets/aiRecipes/55.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/55.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/55-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  56: [
    { source: require('../../assets/aiRecipes/56.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/56.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/56-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  57: [
    { source: require('../../assets/aiRecipes/57.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/57.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/57-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  58: [
    { source: require('../../assets/aiRecipes/58.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/58.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/58-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  59: [
    { source: require('../../assets/aiRecipes/59.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/59.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/59-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  60: [
    { source: require('../../assets/aiRecipes/60.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/60.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/60-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  61: [
    { source: require('../../assets/aiRecipes/61.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/61.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/61-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  62: [
    { source: require('../../assets/aiRecipes/62.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/62.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/62-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  63: [
    { source: require('../../assets/aiRecipes/63.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/63.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/63-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  64: [
    { source: require('../../assets/aiRecipes/64.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/64.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/64-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  65: [
    { source: require('../../assets/aiRecipes/65.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/65.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/65-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/65-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  66: [
    { source: require('../../assets/aiRecipes/66.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/66.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/66-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  67: [
    { source: require('../../assets/aiRecipes/67.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/67.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/67-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  68: [
    { source: require('../../assets/aiRecipes/68.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/68.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/68-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  69: [
    { source: require('../../assets/aiRecipes/69.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/69.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/69-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  70: [
    { source: require('../../assets/aiRecipes/70.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/70.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/70-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  71: [
    { source: require('../../assets/aiRecipes/71.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/71.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/71-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  72: [
    { source: require('../../assets/aiRecipes/72.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/72.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/72-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  73: [
    { source: require('../../assets/aiRecipes/73.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/73.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/73-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  74: [
    { source: require('../../assets/aiRecipes/74.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/74.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/74-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  75: [
    { source: require('../../assets/aiRecipes/75.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/75.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/75-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  76: [
    { source: require('../../assets/aiRecipes/76.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/76.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/76-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  77: [
    { source: require('../../assets/aiRecipes/77.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/77.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/77-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/77-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  78: [
    { source: require('../../assets/aiRecipes/78.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/78.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/78-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  79: [
    { source: require('../../assets/aiRecipes/79.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/79.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/79-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  80: [
    { source: require('../../assets/aiRecipes/80.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/80.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/80-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  81: [
    { source: require('../../assets/aiRecipes/81.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/81.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/81-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  82: [
    { source: require('../../assets/aiRecipes/82.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/82.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/82-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  83: [
    { source: require('../../assets/aiRecipes/83.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/83.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/83-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  84: [
    { source: require('../../assets/aiRecipes/84.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/84.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/84-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  85: [
    { source: require('../../assets/aiRecipes/85.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/85.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/85-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  86: [
    { source: require('../../assets/aiRecipes/86.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/86.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/86-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  87: [
    { source: require('../../assets/aiRecipes/87.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/87.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/87-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  88: [
    { source: require('../../assets/aiRecipes/88.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/88.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/88-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  89: [
    { source: require('../../assets/aiRecipes/89.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/89.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/89-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/89-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  90: [
    { source: require('../../assets/aiRecipes/90.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/90-1.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/90.jpg'), kind: 'herb', imageNumber: 1 },
  ],
  91: [
    { source: require('../../assets/aiRecipes/91.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/91.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/91-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  92: [
    { source: require('../../assets/aiRecipes/92.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/92.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/92-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  93: [
    { source: require('../../assets/aiRecipes/93.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/93.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/93-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  94: [
    { source: require('../../assets/aiRecipes/94.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/94.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/94-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  95: [
    { source: require('../../assets/aiRecipes/95.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/95.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/95-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  96: [
    { source: require('../../assets/aiRecipes/96.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/96.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/96-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/96-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  97: [
    { source: require('../../assets/aiRecipes/97.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/97.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/97-2.jpg'), kind: 'herb', imageNumber: 2 },
    { source: require('../../assets/herbs/97-3.jpg'), kind: 'herb', imageNumber: 3 },
  ],
  98: [
    { source: require('../../assets/aiRecipes/98.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/98.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/98-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  99: [
    { source: require('../../assets/aiRecipes/99.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/99.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/99-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
  100: [
    { source: require('../../assets/aiRecipes/100.jpg'), kind: 'ai' },
    { source: require('../../assets/herbs/100.jpg'), kind: 'herb', imageNumber: 1 },
    { source: require('../../assets/herbs/100-2.jpg'), kind: 'herb', imageNumber: 2 },
  ],
};
