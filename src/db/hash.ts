import type { Recipe } from '../types/recipe';

export function computeDeterministicRandomKey(recipe: Recipe): number {
  const input = `${recipe.title}|${recipe.timePeriod}|${recipe.region}`;

  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}
