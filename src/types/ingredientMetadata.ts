/**
 * Metadata fields for a single ingredient from the scraped data.
 */
export type IngredientMetadataEntry = {
  description: string;
  ml: string;
  family: string;
  scientificName: string;
  usages: string;
  activeConstituents: string;
  safetyClassification: string;
  dosageGuidelines: string;
};

/**
 * Shape of the scraped ingredient metadata JSON file.
 */
export type ScrapedIngredientMetadata = {
  generatedAt: string;
  source: string;
  note: string;
  ingredients: Record<string, IngredientMetadataEntry>;
};
