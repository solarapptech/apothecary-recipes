export const DATABASE_NAME = 'apothecary.db';

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  difficultyScore INTEGER NOT NULL,
  preparationTime TEXT NOT NULL,
  description TEXT NOT NULL,
  timePeriod TEXT NOT NULL,
  warning TEXT NOT NULL,
  region TEXT NOT NULL,
  alternativeNames TEXT NOT NULL,
  usedFor TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  detailedMeasurements TEXT NOT NULL,
  preparationSteps TEXT NOT NULL,
  usage TEXT NOT NULL,
  storage TEXT NOT NULL,
  equipmentNeeded TEXT NOT NULL,
  historicalContext TEXT NOT NULL,
  scientificEvidence TEXT NOT NULL,
  searchTextNormalized TEXT NOT NULL,
  randomKey INTEGER NOT NULL,
  isPremium INTEGER NOT NULL DEFAULT 0,
  imageLocalPath TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
CREATE INDEX IF NOT EXISTS idx_recipes_title_nocase ON recipes(title COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS user_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seed_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_favorites (
  recipeId INTEGER PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);
`;
