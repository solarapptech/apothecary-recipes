export type AdvancedFilters = {
  productTypes: string[];
  conditions: string[];
  ingredients: string[];
  regions: string[];
};

export const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  productTypes: [],
  conditions: [],
  ingredients: [],
  regions: [],
};
