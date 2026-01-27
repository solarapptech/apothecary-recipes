export type RecipeUsage = {
  summary: string;
  dosage: string;
  frequency: string;
  maxDuration: string;
  applicationAreas: string;
  bestPractices: string;
};

export type RecipeStorage = {
  yield: string;
  shelfLife: string;
  costEstimate: string;
  storageTemp: string;
  spoilageIndicators: string;
};

export type Recipe = {
  title: string;
  difficultyScore: number;
  preparationTime: string;
  description: string;
  timePeriod: string;
  warning: string;
  region: string;
  alternativeNames?: string;
  usedFor: string;
  ingredients: string;
  detailedMeasurements: string;
  preparationSteps: string;
  usage: RecipeUsage;
  storage: RecipeStorage;
  equipmentNeeded: string[];
  historicalContext: string;
  scientificEvidence: string;
  isPremium?: number;
  imageLocalPath?: string | null;
  ingredientImageIds?: string[];
};
