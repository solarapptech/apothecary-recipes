const fs = require('fs');
const path = require('path');

const AI_DIR = path.join(__dirname, '../assets/aiRecipes');
const HERB_DIR = path.join(__dirname, '../assets/herbs');
const MANIFEST_PATH = path.join(__dirname, '../src/assets/recipeImageManifest.ts');

const imagePattern = /^(\d+)(?:-(\d+))?\.jpg$/i;

function loadImages(dir, kind, priority) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => imagePattern.test(file))
    .map(file => {
      const match = file.match(imagePattern);
      const recipeId = parseInt(match[1], 10);
      const imageNumber = match[2] ? parseInt(match[2], 10) : 1;
      return {
        recipeId,
        imageNumber,
        file,
        kind,
        priority,
      };
    });
}

const aiImages = loadImages(AI_DIR, 'ai', 0);
const herbImages = loadImages(HERB_DIR, 'herb', 1);
const allImages = [...aiImages, ...herbImages];

const grouped = new Map();
allImages.forEach(entry => {
  if (!grouped.has(entry.recipeId)) {
    grouped.set(entry.recipeId, []);
  }
  grouped.get(entry.recipeId).push(entry);
});

const recipeIds = Array.from(grouped.keys()).sort((a, b) => a - b);

let content = `import type { ImageSourcePropType } from 'react-native';

export type RecipeImageEntry = {
  source: ImageSourcePropType;
  kind: 'ai' | 'herb';
  imageNumber?: number;
};

export const recipeImageManifest: Record<number, RecipeImageEntry[]> = {
`;

recipeIds.forEach(recipeId => {
  const entries = grouped.get(recipeId)
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.imageNumber - b.imageNumber;
    });

  content += `  ${recipeId}: [\n`;
  entries.forEach(entry => {
    const relativePath = entry.kind === 'ai'
      ? `../../assets/aiRecipes/${entry.file}`
      : `../../assets/herbs/${entry.file}`;
    const imageNumberPart = entry.kind === 'herb' ? `, imageNumber: ${entry.imageNumber}` : '';
    content += `    { source: require('${relativePath}'), kind: '${entry.kind}'${imageNumberPart} },\n`;
  });
  content += `  ],\n`;
});

content += `};\n`;

fs.writeFileSync(MANIFEST_PATH, content);

console.log(`Generated manifest with ${allImages.length} images across ${recipeIds.length} recipes at ${MANIFEST_PATH}`);
