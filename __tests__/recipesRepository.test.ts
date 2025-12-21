import { buildCountRecipesQuery, buildListRecipesQuery } from '../src/repositories/recipesRepository';

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
