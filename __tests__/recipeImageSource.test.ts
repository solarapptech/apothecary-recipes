afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

test('returns image source when recipeId exists in manifest', () => {
  jest.doMock('../src/assets/recipeImageManifest', () => ({
    recipeImageManifest: {
      1: { uri: 'test://recipe-1' },
    },
  }));

  const { getRecipeImageSource } = require('../src/assets/getRecipeImageSource') as typeof import('../src/assets/getRecipeImageSource');

  expect(getRecipeImageSource(1)).toEqual({ uri: 'test://recipe-1' });
});

test('returns null when recipeId does not exist in manifest', () => {
  jest.doMock('../src/assets/recipeImageManifest', () => ({
    recipeImageManifest: {},
  }));

  const { getRecipeImageSource } = require('../src/assets/getRecipeImageSource') as typeof import('../src/assets/getRecipeImageSource');

  expect(getRecipeImageSource(999)).toBeNull();
});
