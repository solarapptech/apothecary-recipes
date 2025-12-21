import { createLoadGuard } from '../src/repositories/fetchGuard';

test('createLoadGuard prevents concurrent tasks', async () => {
  const guard = createLoadGuard();

  let firstResolve: (() => void) | undefined;
  const first = guard(
    () =>
      new Promise<string>((resolve) => {
        firstResolve = () => resolve('first');
      })
  );

  const second = await guard(async () => 'second');
  expect(second).toBeUndefined();

  firstResolve?.();
  await expect(first).resolves.toBe('first');

  const third = await guard(async () => 'third');
  expect(third).toBe('third');
});
