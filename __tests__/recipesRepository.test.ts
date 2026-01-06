import { buildCountRecipesQuery, buildCountRecipesQueryWithFilter, buildListRecipesQuery } from '../src/repositories/recipesRepository';

test('buildListRecipesQuery builds A–Z query with search + pagination', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 2,
    pageSize: 50,
    searchQuery: 'ginger',
    sortMode: 'az',
  });

  expect(sql).toContain('WHERE title LIKE ? COLLATE NOCASE');
  expect(sql).toContain('ORDER BY title COLLATE NOCASE ASC');
  expect(sql).toContain('LIMIT ? OFFSET ?');
  expect(params).toEqual(['%ginger%', 50, 50]);
});

test('buildListRecipesQuery requires launchSeed for random sort', () => {
  expect(() =>
    buildListRecipesQuery({
      page: 1,
      pageSize: 25,
      sortMode: 'random',
    })
  ).toThrow('launchSeed is required');
});

test('buildListRecipesQuery builds Random query with seed param before paging params', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 1,
    pageSize: 25,
    sortMode: 'random',
    launchSeed: 123,
  });

  expect(sql).toContain('ORDER BY abs((randomKey * 1103515245 + ?) % 2147483647) ASC');
  expect(params).toEqual([123, 25, 0]);
});

test('buildListRecipesQuery adds Free plan filter (id <= limit)', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 1,
    pageSize: 25,
    sortMode: 'az',
    plan: 'free',
  });

  expect(sql).toContain('FROM recipes');
  expect(sql).toContain('WHERE isPremium = 0');
  expect(params).toEqual([25, 0]);
});

test('buildCountRecipesQuery includes WHERE when search is present', () => {
  const { sql, params } = buildCountRecipesQuery({ searchQuery: 'peppermint' });

  expect(sql).toContain('FROM recipes');
  expect(sql).toContain('WHERE title LIKE ? COLLATE NOCASE');
  expect(params).toEqual(['%peppermint%']);
});

test('buildCountRecipesQuery adds Free plan filter', () => {
  const { sql, params } = buildCountRecipesQuery({ plan: 'free' });

  expect(sql).toContain('FROM recipes');
  expect(sql).toContain('WHERE isPremium = 0');
  expect(params).toEqual([]);
});

test('buildListRecipesQuery adds favorites filter clause and join', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 1,
    pageSize: 25,
    sortMode: 'az',
    filterMode: 'favorites',
  });

  expect(sql).toContain('LEFT JOIN recipe_favorites');
  expect(sql).toContain('recipe_favorites.recipeId IS NOT NULL');
  expect(params).toEqual([25, 0]);
});

test('buildCountRecipesQueryWithFilter uses INNER JOIN for favorites-only', () => {
  const { sql, params } = buildCountRecipesQueryWithFilter({
    filterMode: 'favorites',
  });

  expect(sql).toContain('INNER JOIN recipe_favorites');
  expect(params).toEqual([]);
});

test('buildListRecipesQuery adds advancedFilters with strict AND semantics', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 1,
    pageSize: 25,
    sortMode: 'az',
    advancedFilters: {
      productTypes: ['Tincture', 'Tea'],
      conditions: ['Cold'],
      ingredients: ['Ginger'],
    },
  });

  expect(sql).toContain('title LIKE ? ESCAPE');
  expect(sql).toContain('usedFor LIKE ? ESCAPE');
  expect(sql).toContain('ingredients LIKE ? ESCAPE');
  expect(sql).toContain('WHERE');
  expect(params).toEqual(['%tincture%', '%tea%', '%Cold%', '%Ginger%', 25, 0]);
});

test('buildListRecipesQuery keeps random seed param before advanced filters and paging params', () => {
  const { sql, params } = buildListRecipesQuery({
    page: 2,
    pageSize: 10,
    sortMode: 'random',
    launchSeed: 123,
    advancedFilters: {
      productTypes: ['Salve'],
      conditions: [],
      ingredients: ['Honey'],
    },
  });

  expect(sql).toContain('ORDER BY abs((randomKey * 1103515245 + ?) % 2147483647) ASC');
  expect(params).toEqual(['%salve%', '%Honey%', 123, 10, 10]);
});

test('buildCountRecipesQueryWithFilter includes advancedFilters clauses', () => {
  const { sql, params } = buildCountRecipesQueryWithFilter({
    filterMode: 'favorites',
    advancedFilters: {
      productTypes: ['Elixir'],
      conditions: ['Sleep'],
      ingredients: [],
    },
  });

  expect(sql).toContain('INNER JOIN recipe_favorites');
  expect(sql).toContain('title LIKE ? ESCAPE');
  expect(sql).toContain('usedFor LIKE ? ESCAPE');
  expect(params).toEqual(['%elixir%', '%Sleep%']);
});
