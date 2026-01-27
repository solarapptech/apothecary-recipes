import {
  getIngredientMetadata,
  normalizeIngredientKey,
  getAllIngredientKeys,
  hasIngredientMetadata,
  isSkippedIngredient,
} from '../src/repositories/ingredientMetadataRepository';

describe('ingredientMetadataRepository', () => {
  describe('normalizeIngredientKey', () => {
    it('removes adjectives like fresh, dried, powdered', () => {
      expect(normalizeIngredientKey('fresh ginger')).toBe('ginger');
      expect(normalizeIngredientKey('dried chamomile')).toBe('chamomile');
      expect(normalizeIngredientKey('powdered turmeric')).toBe('turmeric');
    });

    it('removes plant part forms like root, leaf, flower', () => {
      expect(normalizeIngredientKey('ginger root')).toBe('ginger');
      expect(normalizeIngredientKey('peppermint leaves')).toBe('peppermint');
      expect(normalizeIngredientKey('elderflower flowers')).toBe('elderflower');
    });

    it('removes parenthetical content', () => {
      expect(normalizeIngredientKey('aloe vera (fresh)')).toBe('aloe vera');
      expect(normalizeIngredientKey('ginseng (powdered)')).toBe('ginseng');
    });

    it('handles combined modifiers', () => {
      expect(normalizeIngredientKey('fresh ginger root (chopped)')).toBe('ginger');
      expect(normalizeIngredientKey('dried chamomile flowers')).toBe('chamomile');
    });

    it('returns lowercase normalized key', () => {
      expect(normalizeIngredientKey('GINGER')).toBe('ginger');
      expect(normalizeIngredientKey('Chamomile')).toBe('chamomile');
    });

    it('falls back to original if all tokens are removed', () => {
      const result = normalizeIngredientKey('fresh dried');
      expect(result).toBeTruthy();
    });
  });

  describe('getIngredientMetadata', () => {
    it('returns metadata for known ingredients', () => {
      const result = getIngredientMetadata('chamomile');
      expect(result.title).toBe('chamomile');
      expect(result.description).toBeTruthy();
      expect(result.scientificName).toBeTruthy();
      expect(result.family).toBeTruthy();
    });

    it('returns metadata with all expected fields', () => {
      const result = getIngredientMetadata('ginger');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('ml');
      expect(result).toHaveProperty('family');
      expect(result).toHaveProperty('scientificName');
      expect(result).toHaveProperty('usages');
      expect(result).toHaveProperty('activeConstituents');
      expect(result).toHaveProperty('safetyClassification');
      expect(result).toHaveProperty('dosageGuidelines');
    });

    it('handles variant forms of ingredient names', () => {
      const fresh = getIngredientMetadata('fresh ginger root');
      const dried = getIngredientMetadata('dried ginger');
      const plain = getIngredientMetadata('ginger');

      expect(fresh.scientificName).toBe(plain.scientificName);
      expect(dried.scientificName).toBe(plain.scientificName);
    });

    it('returns defaults for unknown ingredients', () => {
      const result = getIngredientMetadata('xyznonexistent123');
      expect(result.title).toBe('xyznonexistent123');
      expect(result.description).toBe('');
      expect(result.scientificName).toBe('');
    });

    it('preserves original raw name in title', () => {
      const result = getIngredientMetadata('Fresh Ginger Root');
      expect(result.title).toBe('Fresh Ginger Root');
    });
  });

  describe('getAllIngredientKeys', () => {
    it('returns an array of ingredient keys', () => {
      const keys = getAllIngredientKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(100);
    });

    it('includes common herbs', () => {
      const keys = getAllIngredientKeys();
      expect(keys).toContain('chamomile');
      expect(keys).toContain('ginger');
      expect(keys).toContain('turmeric');
    });
  });

  describe('hasIngredientMetadata', () => {
    it('returns true for known ingredients', () => {
      expect(hasIngredientMetadata('chamomile')).toBe(true);
      expect(hasIngredientMetadata('ginger')).toBe(true);
    });

    it('returns true for variant forms', () => {
      expect(hasIngredientMetadata('fresh ginger root')).toBe(true);
      expect(hasIngredientMetadata('dried chamomile flowers')).toBe(true);
    });

    it('returns false for unknown ingredients', () => {
      expect(hasIngredientMetadata('xyznonexistent123')).toBe(false);
    });
  });

  describe('isSkippedIngredient', () => {
    it('returns true for common non-botanical items', () => {
      expect(isSkippedIngredient('water')).toBe(true);
      expect(isSkippedIngredient('honey')).toBe(true);
      expect(isSkippedIngredient('sugar')).toBe(true);
      expect(isSkippedIngredient('salt')).toBe(true);
    });

    it('returns true for water variants', () => {
      expect(isSkippedIngredient('distilled water')).toBe(true);
      expect(isSkippedIngredient('hot water')).toBe(true);
      expect(isSkippedIngredient('filtered water')).toBe(true);
    });

    it('returns false for botanical ingredients', () => {
      expect(isSkippedIngredient('chamomile')).toBe(false);
      expect(isSkippedIngredient('ginger')).toBe(false);
      expect(isSkippedIngredient('turmeric')).toBe(false);
    });

    it('handles case insensitivity', () => {
      expect(isSkippedIngredient('Water')).toBe(true);
      expect(isSkippedIngredient('HONEY')).toBe(true);
    });

    it('returns true for wines and spirits', () => {
      expect(isSkippedIngredient('aquavit')).toBe(true);
      expect(isSkippedIngredient('claret')).toBe(true);
      expect(isSkippedIngredient('riesling')).toBe(true);
    });

    it('returns false for ingredients that can appear in remedies but are not in the skip list', () => {
      expect(isSkippedIngredient('70% Alcohol')).toBe(false);
      expect(isSkippedIngredient('Olive Oil')).toBe(false);
    });
  });

  describe('plural and variant matching', () => {
    it('matches plural forms to singular entries', () => {
      expect(hasIngredientMetadata('bilberries')).toBe(true);
      expect(hasIngredientMetadata('cloudberries')).toBe(true);
    });

    it('matches St. Johns Wort variants', () => {
      expect(hasIngredientMetadata("st. john's wort")).toBe(true);
      expect(hasIngredientMetadata("Fresh St. John's Wort Flowers")).toBe(true);
    });
  });
});
