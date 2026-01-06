import type { SQLiteDatabase } from 'expo-sqlite';

import { createPremiumBundleService } from '../src/premium/premiumBundleService';

function createFakeDb(): SQLiteDatabase {
  return {} as any;
}

test('startAsync is single-flight guarded', async () => {
  const db = createFakeDb();
  const calls: string[] = [];

  let resolveInstall!: () => void;
  const installPromise = new Promise<void>((resolve) => {
    resolveInstall = resolve;
  });

  const installer = {
    createJob: () => ({
      runAsync: async () => {
        calls.push('run');
        await installPromise;
        return { version: 'v1', recipeCount: 1 };
      },
    }),
  };

  const service = createPremiumBundleService(db, installer as any, {
    setStatusAsync: async (_db, status) => {
      calls.push(`status:${status}`);
    },
    setProgressAsync: async (_db, progress) => {
      calls.push(`progress:${String(progress)}`);
    },
    setErrorAsync: async (_db, message) => {
      calls.push(`error:${String(message)}`);
    },
    setInstalledVersionAsync: async (_db, version) => {
      calls.push(`version:${version}`);
    },
  });

  const first = service.startAsync();
  const second = service.startAsync();

  await Promise.resolve();

  expect(await second).toBe(false);

  resolveInstall();
  expect(await first).toBe(true);

  expect(calls.filter((value) => value === 'run')).toHaveLength(1);
});

test('progress updates and completion persists ready state', async () => {
  const db = createFakeDb();
  const calls: string[] = [];

  const installer = {
    cleanupAsync: async () => {
      calls.push('cleanup');
    },
    createJob: ({ onProgress }: { onProgress: (progress01: number) => void }) => ({
      runAsync: async () => {
        onProgress(0.25);
        onProgress(0.5);
        return { version: 'bundle-v2', recipeCount: 2 };
      },
    }),
  };

  const service = createPremiumBundleService(db, installer as any, {
    setStatusAsync: async (_db, status) => {
      calls.push(`status:${status}`);
    },
    setProgressAsync: async (_db, progress) => {
      calls.push(`progress:${String(progress)}`);
    },
    setErrorAsync: async (_db, message) => {
      calls.push(`error:${String(message)}`);
    },
    setInstalledVersionAsync: async (_db, version) => {
      calls.push(`version:${version}`);
    },
  });

  await expect(service.startAsync()).resolves.toBe(true);

  expect(calls).toEqual([
    'error:null',
    'status:downloading',
    'progress:0',
    'cleanup',
    'progress:25',
    'progress:50',
    'version:bundle-v2',
    'progress:100',
    'status:ready',
    'error:null',
  ]);
});

test('pause/resume updates status when supported by job', async () => {
  const db = createFakeDb();
  const calls: string[] = [];

  let pauseCalled = false;
  let resumeCalled = false;

  let resolveInstall!: () => void;
  const installPromise = new Promise<void>((resolve) => {
    resolveInstall = resolve;
  });

  let jobCreated!: () => void;
  const jobCreatedPromise = new Promise<void>((resolve) => {
    jobCreated = resolve;
  });

  const installer = {
    createJob: () => {
      jobCreated();

      return {
      runAsync: async () => {
        await installPromise;
        return { version: 'v1', recipeCount: 1 };
      },
      pauseAsync: async () => {
        pauseCalled = true;
      },
      resumeAsync: async () => {
        resumeCalled = true;
      },
      };
    },
  };

  const service = createPremiumBundleService(db, installer as any, {
    setStatusAsync: async (_db, status) => {
      calls.push(`status:${status}`);
    },
    setProgressAsync: async (_db, progress) => {
      calls.push(`progress:${String(progress)}`);
    },
    setErrorAsync: async (_db, message) => {
      calls.push(`error:${String(message)}`);
    },
    setInstalledVersionAsync: async (_db, version) => {
      calls.push(`version:${version}`);
    },
  });

  const startPromise = service.startAsync();
  await jobCreatedPromise;

  await service.pauseAsync();
  await service.resumeAsync();

  expect(pauseCalled).toBe(true);
  expect(resumeCalled).toBe(true);

  resolveInstall();
  await startPromise;

  expect(calls).toContain('status:paused');
  expect(calls).toContain('status:downloading');
});

test('retryAsync does not auto-retry after failure', async () => {
  const db = createFakeDb();
  const calls: string[] = [];

  let attempt = 0;

  const installer = {
    createJob: () => ({
      runAsync: async () => {
        attempt += 1;
        throw new Error('fail');
      },
    }),
  };

  const service = createPremiumBundleService(db, installer as any, {
    setStatusAsync: async (_db, status) => {
      calls.push(`status:${status}`);
    },
    setProgressAsync: async (_db, progress) => {
      calls.push(`progress:${String(progress)}`);
    },
    setErrorAsync: async (_db, message) => {
      calls.push(`error:${String(message)}`);
    },
    setInstalledVersionAsync: async (_db, version) => {
      calls.push(`version:${version}`);
    },
  });

  await expect(service.retryAsync()).rejects.toThrow('fail');

  expect(attempt).toBe(1);
  expect(calls).toContain('status:failed');
});
