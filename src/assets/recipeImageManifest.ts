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
  101: [
    { source: require('../../assets/aiRecipes/101.jpg'), kind: 'ai' },
  ],
  102: [
    { source: require('../../assets/aiRecipes/102.jpg'), kind: 'ai' },
  ],
  103: [
    { source: require('../../assets/aiRecipes/103.jpg'), kind: 'ai' },
  ],
  104: [
    { source: require('../../assets/aiRecipes/104.jpg'), kind: 'ai' },
  ],
  105: [
    { source: require('../../assets/aiRecipes/105.jpg'), kind: 'ai' },
  ],
  106: [
    { source: require('../../assets/aiRecipes/106.jpg'), kind: 'ai' },
  ],
  107: [
    { source: require('../../assets/aiRecipes/107.jpg'), kind: 'ai' },
  ],
  108: [
    { source: require('../../assets/aiRecipes/108.jpg'), kind: 'ai' },
  ],
  109: [
    { source: require('../../assets/aiRecipes/109.jpg'), kind: 'ai' },
  ],
  110: [
    { source: require('../../assets/aiRecipes/110.jpg'), kind: 'ai' },
  ],
  111: [
    { source: require('../../assets/aiRecipes/111.jpg'), kind: 'ai' },
  ],
  112: [
    { source: require('../../assets/aiRecipes/112.jpg'), kind: 'ai' },
  ],
  113: [
    { source: require('../../assets/aiRecipes/113.jpg'), kind: 'ai' },
  ],
  114: [
    { source: require('../../assets/aiRecipes/114.jpg'), kind: 'ai' },
  ],
  115: [
    { source: require('../../assets/aiRecipes/115.jpg'), kind: 'ai' },
  ],
  116: [
    { source: require('../../assets/aiRecipes/116.jpg'), kind: 'ai' },
  ],
  117: [
    { source: require('../../assets/aiRecipes/117.jpg'), kind: 'ai' },
  ],
  118: [
    { source: require('../../assets/aiRecipes/118.jpg'), kind: 'ai' },
  ],
  119: [
    { source: require('../../assets/aiRecipes/119.jpg'), kind: 'ai' },
  ],
  120: [
    { source: require('../../assets/aiRecipes/120.jpg'), kind: 'ai' },
  ],
  121: [
    { source: require('../../assets/aiRecipes/121.jpg'), kind: 'ai' },
  ],
  122: [
    { source: require('../../assets/aiRecipes/122.jpg'), kind: 'ai' },
  ],
  123: [
    { source: require('../../assets/aiRecipes/123.jpg'), kind: 'ai' },
  ],
  124: [
    { source: require('../../assets/aiRecipes/124.jpg'), kind: 'ai' },
  ],
  125: [
    { source: require('../../assets/aiRecipes/125.jpg'), kind: 'ai' },
  ],
  126: [
    { source: require('../../assets/aiRecipes/126.jpg'), kind: 'ai' },
  ],
  127: [
    { source: require('../../assets/aiRecipes/127.jpg'), kind: 'ai' },
  ],
  128: [
    { source: require('../../assets/aiRecipes/128.jpg'), kind: 'ai' },
  ],
  129: [
    { source: require('../../assets/aiRecipes/129.jpg'), kind: 'ai' },
  ],
  130: [
    { source: require('../../assets/aiRecipes/130.jpg'), kind: 'ai' },
  ],
  131: [
    { source: require('../../assets/aiRecipes/131.jpg'), kind: 'ai' },
  ],
  132: [
    { source: require('../../assets/aiRecipes/132.jpg'), kind: 'ai' },
  ],
  133: [
    { source: require('../../assets/aiRecipes/133.jpg'), kind: 'ai' },
  ],
  134: [
    { source: require('../../assets/aiRecipes/134.jpg'), kind: 'ai' },
  ],
  135: [
    { source: require('../../assets/aiRecipes/135.jpg'), kind: 'ai' },
  ],
  136: [
    { source: require('../../assets/aiRecipes/136.jpg'), kind: 'ai' },
  ],
  137: [
    { source: require('../../assets/aiRecipes/137.jpg'), kind: 'ai' },
  ],
  138: [
    { source: require('../../assets/aiRecipes/138.jpg'), kind: 'ai' },
  ],
  139: [
    { source: require('../../assets/aiRecipes/139.jpg'), kind: 'ai' },
  ],
  140: [
    { source: require('../../assets/aiRecipes/140.jpg'), kind: 'ai' },
  ],
  141: [
    { source: require('../../assets/aiRecipes/141.jpg'), kind: 'ai' },
  ],
  142: [
    { source: require('../../assets/aiRecipes/142.jpg'), kind: 'ai' },
  ],
  143: [
    { source: require('../../assets/aiRecipes/143.jpg'), kind: 'ai' },
  ],
  144: [
    { source: require('../../assets/aiRecipes/144.jpg'), kind: 'ai' },
  ],
  145: [
    { source: require('../../assets/aiRecipes/145.jpg'), kind: 'ai' },
  ],
  146: [
    { source: require('../../assets/aiRecipes/146.jpg'), kind: 'ai' },
  ],
  147: [
    { source: require('../../assets/aiRecipes/147.jpg'), kind: 'ai' },
  ],
  148: [
    { source: require('../../assets/aiRecipes/148.jpg'), kind: 'ai' },
  ],
  149: [
    { source: require('../../assets/aiRecipes/149.jpg'), kind: 'ai' },
  ],
  150: [
    { source: require('../../assets/aiRecipes/150.jpg'), kind: 'ai' },
  ],
  151: [
    { source: require('../../assets/aiRecipes/151.jpg'), kind: 'ai' },
  ],
  152: [
    { source: require('../../assets/aiRecipes/152.jpg'), kind: 'ai' },
  ],
  153: [
    { source: require('../../assets/aiRecipes/153.jpg'), kind: 'ai' },
  ],
  154: [
    { source: require('../../assets/aiRecipes/154.jpg'), kind: 'ai' },
  ],
  155: [
    { source: require('../../assets/aiRecipes/155.jpg'), kind: 'ai' },
  ],
  156: [
    { source: require('../../assets/aiRecipes/156.jpg'), kind: 'ai' },
  ],
  157: [
    { source: require('../../assets/aiRecipes/157.jpg'), kind: 'ai' },
  ],
  158: [
    { source: require('../../assets/aiRecipes/158.jpg'), kind: 'ai' },
  ],
  159: [
    { source: require('../../assets/aiRecipes/159.jpg'), kind: 'ai' },
  ],
  160: [
    { source: require('../../assets/aiRecipes/160.jpg'), kind: 'ai' },
  ],
  161: [
    { source: require('../../assets/aiRecipes/161.jpg'), kind: 'ai' },
  ],
  162: [
    { source: require('../../assets/aiRecipes/162.jpg'), kind: 'ai' },
  ],
  163: [
    { source: require('../../assets/aiRecipes/163.jpg'), kind: 'ai' },
  ],
  164: [
    { source: require('../../assets/aiRecipes/164.jpg'), kind: 'ai' },
  ],
  165: [
    { source: require('../../assets/aiRecipes/165.jpg'), kind: 'ai' },
  ],
  166: [
    { source: require('../../assets/aiRecipes/166.jpg'), kind: 'ai' },
  ],
  167: [
    { source: require('../../assets/aiRecipes/167.jpg'), kind: 'ai' },
  ],
  168: [
    { source: require('../../assets/aiRecipes/168.jpg'), kind: 'ai' },
  ],
  169: [
    { source: require('../../assets/aiRecipes/169.jpg'), kind: 'ai' },
  ],
  170: [
    { source: require('../../assets/aiRecipes/170.jpg'), kind: 'ai' },
  ],
  171: [
    { source: require('../../assets/aiRecipes/171.jpg'), kind: 'ai' },
  ],
  172: [
    { source: require('../../assets/aiRecipes/172.jpg'), kind: 'ai' },
  ],
  173: [
    { source: require('../../assets/aiRecipes/173.jpg'), kind: 'ai' },
  ],
  174: [
    { source: require('../../assets/aiRecipes/174.jpg'), kind: 'ai' },
  ],
  175: [
    { source: require('../../assets/aiRecipes/175.jpg'), kind: 'ai' },
  ],
  176: [
    { source: require('../../assets/aiRecipes/176.jpg'), kind: 'ai' },
  ],
  177: [
    { source: require('../../assets/aiRecipes/177.jpg'), kind: 'ai' },
  ],
  178: [
    { source: require('../../assets/aiRecipes/178.jpg'), kind: 'ai' },
  ],
  179: [
    { source: require('../../assets/aiRecipes/179.jpg'), kind: 'ai' },
  ],
  180: [
    { source: require('../../assets/aiRecipes/180.jpg'), kind: 'ai' },
  ],
  181: [
    { source: require('../../assets/aiRecipes/181.jpg'), kind: 'ai' },
  ],
  182: [
    { source: require('../../assets/aiRecipes/182.jpg'), kind: 'ai' },
  ],
  183: [
    { source: require('../../assets/aiRecipes/183.jpg'), kind: 'ai' },
  ],
  184: [
    { source: require('../../assets/aiRecipes/184.jpg'), kind: 'ai' },
  ],
  185: [
    { source: require('../../assets/aiRecipes/185.jpg'), kind: 'ai' },
  ],
  186: [
    { source: require('../../assets/aiRecipes/186.jpg'), kind: 'ai' },
  ],
  187: [
    { source: require('../../assets/aiRecipes/187.jpg'), kind: 'ai' },
  ],
  188: [
    { source: require('../../assets/aiRecipes/188.jpg'), kind: 'ai' },
  ],
  189: [
    { source: require('../../assets/aiRecipes/189.jpg'), kind: 'ai' },
  ],
  190: [
    { source: require('../../assets/aiRecipes/190.jpg'), kind: 'ai' },
  ],
  191: [
    { source: require('../../assets/aiRecipes/191.jpg'), kind: 'ai' },
  ],
  192: [
    { source: require('../../assets/aiRecipes/192.jpg'), kind: 'ai' },
  ],
  193: [
    { source: require('../../assets/aiRecipes/193.jpg'), kind: 'ai' },
  ],
  194: [
    { source: require('../../assets/aiRecipes/194.jpg'), kind: 'ai' },
  ],
  195: [
    { source: require('../../assets/aiRecipes/195.jpg'), kind: 'ai' },
  ],
  196: [
    { source: require('../../assets/aiRecipes/196.jpg'), kind: 'ai' },
  ],
  197: [
    { source: require('../../assets/aiRecipes/197.jpg'), kind: 'ai' },
  ],
  198: [
    { source: require('../../assets/aiRecipes/198.jpg'), kind: 'ai' },
  ],
  199: [
    { source: require('../../assets/aiRecipes/199.jpg'), kind: 'ai' },
  ],
  200: [
    { source: require('../../assets/aiRecipes/200.jpg'), kind: 'ai' },
  ],
  201: [
    { source: require('../../assets/aiRecipes/201.jpg'), kind: 'ai' },
  ],
  202: [
    { source: require('../../assets/aiRecipes/202.jpg'), kind: 'ai' },
  ],
  203: [
    { source: require('../../assets/aiRecipes/203.jpg'), kind: 'ai' },
  ],
  204: [
    { source: require('../../assets/aiRecipes/204.jpg'), kind: 'ai' },
  ],
  205: [
    { source: require('../../assets/aiRecipes/205.jpg'), kind: 'ai' },
  ],
  206: [
    { source: require('../../assets/aiRecipes/206.jpg'), kind: 'ai' },
  ],
  207: [
    { source: require('../../assets/aiRecipes/207.jpg'), kind: 'ai' },
  ],
  208: [
    { source: require('../../assets/aiRecipes/208.jpg'), kind: 'ai' },
  ],
  209: [
    { source: require('../../assets/aiRecipes/209.jpg'), kind: 'ai' },
  ],
  210: [
    { source: require('../../assets/aiRecipes/210.jpg'), kind: 'ai' },
  ],
  211: [
    { source: require('../../assets/aiRecipes/211.jpg'), kind: 'ai' },
  ],
  212: [
    { source: require('../../assets/aiRecipes/212.jpg'), kind: 'ai' },
  ],
  213: [
    { source: require('../../assets/aiRecipes/213.jpg'), kind: 'ai' },
  ],
  214: [
    { source: require('../../assets/aiRecipes/214.jpg'), kind: 'ai' },
  ],
  215: [
    { source: require('../../assets/aiRecipes/215.jpg'), kind: 'ai' },
  ],
  216: [
    { source: require('../../assets/aiRecipes/216.jpg'), kind: 'ai' },
  ],
  217: [
    { source: require('../../assets/aiRecipes/217.jpg'), kind: 'ai' },
  ],
  218: [
    { source: require('../../assets/aiRecipes/218.jpg'), kind: 'ai' },
  ],
  219: [
    { source: require('../../assets/aiRecipes/219.jpg'), kind: 'ai' },
  ],
  220: [
    { source: require('../../assets/aiRecipes/220.jpg'), kind: 'ai' },
  ],
  221: [
    { source: require('../../assets/aiRecipes/221.jpg'), kind: 'ai' },
  ],
  222: [
    { source: require('../../assets/aiRecipes/222.jpg'), kind: 'ai' },
  ],
  223: [
    { source: require('../../assets/aiRecipes/223.jpg'), kind: 'ai' },
  ],
  224: [
    { source: require('../../assets/aiRecipes/224.jpg'), kind: 'ai' },
  ],
  225: [
    { source: require('../../assets/aiRecipes/225.jpg'), kind: 'ai' },
  ],
  226: [
    { source: require('../../assets/aiRecipes/226.jpg'), kind: 'ai' },
  ],
  227: [
    { source: require('../../assets/aiRecipes/227.jpg'), kind: 'ai' },
  ],
  228: [
    { source: require('../../assets/aiRecipes/228.jpg'), kind: 'ai' },
  ],
  229: [
    { source: require('../../assets/aiRecipes/229.jpg'), kind: 'ai' },
  ],
  230: [
    { source: require('../../assets/aiRecipes/230.jpg'), kind: 'ai' },
  ],
  231: [
    { source: require('../../assets/aiRecipes/231.jpg'), kind: 'ai' },
  ],
  232: [
    { source: require('../../assets/aiRecipes/232.jpg'), kind: 'ai' },
  ],
  233: [
    { source: require('../../assets/aiRecipes/233.jpg'), kind: 'ai' },
  ],
  234: [
    { source: require('../../assets/aiRecipes/234.jpg'), kind: 'ai' },
  ],
  235: [
    { source: require('../../assets/aiRecipes/235.jpg'), kind: 'ai' },
  ],
  236: [
    { source: require('../../assets/aiRecipes/236.jpg'), kind: 'ai' },
  ],
  237: [
    { source: require('../../assets/aiRecipes/237.jpg'), kind: 'ai' },
  ],
  238: [
    { source: require('../../assets/aiRecipes/238.jpg'), kind: 'ai' },
  ],
  239: [
    { source: require('../../assets/aiRecipes/239.jpg'), kind: 'ai' },
  ],
  240: [
    { source: require('../../assets/aiRecipes/240.jpg'), kind: 'ai' },
  ],
  241: [
    { source: require('../../assets/aiRecipes/241.jpg'), kind: 'ai' },
  ],
  242: [
    { source: require('../../assets/aiRecipes/242.jpg'), kind: 'ai' },
  ],
  243: [
    { source: require('../../assets/aiRecipes/243.jpg'), kind: 'ai' },
  ],
  244: [
    { source: require('../../assets/aiRecipes/244.jpg'), kind: 'ai' },
  ],
  245: [
    { source: require('../../assets/aiRecipes/245.jpg'), kind: 'ai' },
  ],
  246: [
    { source: require('../../assets/aiRecipes/246.jpg'), kind: 'ai' },
  ],
  247: [
    { source: require('../../assets/aiRecipes/247.jpg'), kind: 'ai' },
  ],
  248: [
    { source: require('../../assets/aiRecipes/248.jpg'), kind: 'ai' },
  ],
  249: [
    { source: require('../../assets/aiRecipes/249.jpg'), kind: 'ai' },
  ],
  250: [
    { source: require('../../assets/aiRecipes/250.jpg'), kind: 'ai' },
  ],
};
