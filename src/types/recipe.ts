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
  usage: string;
  historicalContext: string;
  scientificEvidence: string;
  isPremium?: number;
  imageLocalPath?: string | null;
};
