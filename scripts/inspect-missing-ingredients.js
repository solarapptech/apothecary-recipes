const recipes = require('../src/data/free-recipes.json');
const scraped = require('../src/data/ingredient-metadata-scraped.json');

// Simplified versions of the repository functions for this script
const SKIPPED = new Set([
  'water', 'honey', 'sugar', 'salt', 'milk', 'butter', 'eggs', 'egg', 'flour',
  'oil', 'vinegar', 'lemon', 'lime', 'orange', 'apple', 'wine', 'beer', 'cream',
  'yogurt', 'cheese', 'bread', 'rice', 'oats', 'wheat', 'corn', 'potato', 'onion',
  'garlic', 'pepper', 'ghee', 'lard', 'beeswax', 'lanolin', 'glycerin', 'glycerine',
  'aquavit', 'claret', 'riesling', 'sherry', 'port', 'mead', 'cider',
  'tallow',
  'brandy vodka', 'brandy wine', 'ghee butter', 'honey sugar', 'lard tallow', 'water milk',
]);

const STOPWORDS = new Set(['and', 'or']);
const ADJECTIVES = new Set(['fresh', 'dried', 'dry', 'powdered', 'ground', 'crushed', 'chopped', 'sliced', 'whole', 'raw', 'wild', 'organic', 'warm', 'hot', 'cold', 'minced', 'ripe']);
const FORMS = new Set(['root', 'roots', 'leaf', 'leaves', 'flower', 'flowers', 'stem', 'stems', 'bark', 'berry', 'berries', 'seed', 'seeds', 'peel', 'fruit', 'fruits', 'pod', 'pods', 'resin', 'bud', 'buds', 'oil', 'juice', 'gel', 'extract', 'tincture', 'aerial', 'parts', 'tuber', 'heads', 'tops']);

function normalize(raw) {
  let cleaned = raw.replace(/\([^)]*\)/g, '').replace(/[^a-zA-Z\s'-]/g, ' ').toLowerCase().trim();
  const tokens = cleaned.split(/\s+/).filter(t => {
    const n = t.replace(/[^a-z]/g, '');
    return n && !STOPWORDS.has(n) && !ADJECTIVES.has(n) && !FORMS.has(n);
  });
  return tokens.join(' ').trim() || raw.toLowerCase().trim();
}

function singularize(word) {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('s') && word.length > 2 && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function isSkipped(raw) {
  const norm = normalize(raw);
  const lower = raw.toLowerCase().trim();
  return SKIPPED.has(norm) || SKIPPED.has(lower);
}

function hasMetadata(raw) {
  const norm = normalize(raw);
  const ingredients = scraped.ingredients;
  
  if (ingredients[norm]) return true;
  
  // Try with st. period
  const withSt = norm.replace(/\bst\s+/gi, 'st. ');
  if (withSt !== norm && ingredients[withSt]) return true;
  
  // Try singular
  const singular = singularize(norm);
  if (singular !== norm && ingredients[singular]) return true;
  
  // Try partial match
  for (const key of Object.keys(ingredients)) {
    if (norm.includes(key) || key.includes(norm)) return true;
    if (singular !== norm && (singular.includes(key) || key.includes(singular))) return true;
    if (withSt !== norm && (withSt.includes(key) || key.includes(withSt))) return true;
  }
  
  return false;
}

const normalizeIngredientKey = normalize;
const isSkippedIngredient = isSkipped;
const hasIngredientMetadata = hasMetadata;

// Extract all unique ingredients from recipes
const allIngredients = new Set();
recipes.forEach(r => {
  if (r.ingredients) {
    r.ingredients.split(',').map(i => i.trim()).filter(Boolean).forEach(i => allIngredients.add(i));
  }
});

// Categorize ingredients
const missing = [];
const found = [];
const skipped = [];

allIngredients.forEach(raw => {
  if (isSkippedIngredient(raw)) {
    skipped.push(raw);
    return;
  }
  if (hasIngredientMetadata(raw)) {
    found.push(raw);
  } else {
    missing.push({ raw, normalized: normalizeIngredientKey(raw) });
  }
});

console.log('=== MISSING INGREDIENTS (' + missing.length + ') ===');
missing.sort((a, b) => a.normalized.localeCompare(b.normalized));
missing.forEach(m => console.log('  "' + m.raw + '" -> normalized: "' + m.normalized + '"'));

console.log('\n=== SKIPPED INGREDIENTS (' + skipped.length + ') ===');
skipped.sort().forEach(s => console.log('  ' + s));

console.log('\n=== FOUND INGREDIENTS (' + found.length + ') ===');

// Also show what keys exist in scraped data
console.log('\n=== SCRAPED DATA KEYS (sample) ===');
const scrapedKeys = Object.keys(scraped.ingredients).sort();
console.log('Total keys in scraped data: ' + scrapedKeys.length);
console.log('First 20:', scrapedKeys.slice(0, 20).join(', '));
