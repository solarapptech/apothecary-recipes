const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/recipes');
const MANIFEST_PATH = path.join(__dirname, '../src/assets/recipeImageManifest.ts');

const files = fs.readdirSync(ASSETS_DIR)
  .filter(file => file.endsWith('.jpg'))
  .sort((a, b) => {
    // Sort numerically: 1.jpg, 2.jpg, ... 10.jpg instead of 1.jpg, 10.jpg, 2.jpg
    const numA = parseInt(a.replace('.jpg', ''), 10);
    const numB = parseInt(b.replace('.jpg', ''), 10);
    return numA - numB;
  });

let content = `import type { ImageSourcePropType } from 'react-native';

export const recipeImageManifest: Record<number, ImageSourcePropType> = {
`;

files.forEach(file => {
  const id = parseInt(file.replace('.jpg', ''), 10);
  // Using relative path from src/assets/recipeImageManifest.ts to assets/recipes/
  // src/assets/ -> ../../assets/recipes/
  content += `  ${id}: require('../../assets/recipes/${file}'),\n`;
});

content += `};\n`;

fs.writeFileSync(MANIFEST_PATH, content);

console.log(`Generated manifest with ${files.length} images at ${MANIFEST_PATH}`);
