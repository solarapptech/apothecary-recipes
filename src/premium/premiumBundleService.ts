import type { SQLiteDatabase } from 'expo-sqlite';

import {
  setPremiumDownloadErrorAsync,
  setPremiumDownloadProgressAsync,
  setPremiumDownloadStatusAsync,
} from '../repositories/preferencesRepository';
import type { PremiumDownloadStatus } from '../repositories/preferencesRepository';
import { createLoadGuard } from '../repositories/fetchGuard';
import { setPremiumBundleVersionAsync } from '../db/seed';

export type PremiumBundleInstallResult = {
  version: string;
  recipeCount: number;
};

export type PremiumBundleJob = {
  runAsync: () => Promise<PremiumBundleInstallResult>;
  pauseAsync?: () => Promise<void>;
  resumeAsync?: () => Promise<void>;
};

export type PremiumBundleInstaller = {
  cleanupAsync?: () => Promise<void>;
  createJob: (input: { onProgress: (progress01: number) => void }) => PremiumBundleJob;
};

export type PremiumBundleService = {
  startAsync: () => Promise<boolean>;
  pauseAsync: () => Promise<void>;
  resumeAsync: () => Promise<void>;
  retryAsync: () => Promise<boolean>;
};

type SleepAsync = (ms: number) => Promise<void>;

export type CreatePremiumBundleServiceDeps = {
  setStatusAsync: (db: SQLiteDatabase, status: PremiumDownloadStatus) => Promise<void>;
  setProgressAsync: (db: SQLiteDatabase, progress: number | null) => Promise<void>;
  setErrorAsync: (db: SQLiteDatabase, message: string | null) => Promise<void>;
  setInstalledVersionAsync: (db: SQLiteDatabase, version: string) => Promise<void>;
  sleepAsync: SleepAsync;
  createLoadGuard: typeof createLoadGuard;
};

const defaultSleepAsync: SleepAsync = async (ms) => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

export function createPremiumBundleService(
  db: SQLiteDatabase,
  installer: PremiumBundleInstaller,
  deps: Partial<CreatePremiumBundleServiceDeps>
): PremiumBundleService {
  const resolved: CreatePremiumBundleServiceDeps = {
    ...deps,
    sleepAsync: deps.sleepAsync ?? defaultSleepAsync,
    createLoadGuard: deps.createLoadGuard ?? createLoadGuard,
    setStatusAsync: deps.setStatusAsync ?? setPremiumDownloadStatusAsync,
    setProgressAsync: deps.setProgressAsync ?? setPremiumDownloadProgressAsync,
    setErrorAsync: deps.setErrorAsync ?? setPremiumDownloadErrorAsync,
    setInstalledVersionAsync:
      deps.setInstalledVersionAsync ?? (async (dbInstance, version) => setPremiumBundleVersionAsync(dbInstance as any, version)),
  };

  const runIfIdle = resolved.createLoadGuard();

  let currentJob: PremiumBundleJob | null = null;

  const updateProgressAsync = async (progress01: number): Promise<void> => {
    const percent = Math.max(0, Math.min(100, Math.round(progress01 * 100)));
    await resolved.setProgressAsync(db, percent);
  };

  const runOnceAsync = async (): Promise<PremiumBundleInstallResult> => {
    if (currentJob) {
      throw new Error('premium bundle job already exists');
    }

    await resolved.setErrorAsync(db, null);
    await resolved.setStatusAsync(db, 'downloading');
    await resolved.setProgressAsync(db, 0);

    await installer.cleanupAsync?.();

    currentJob = installer.createJob({
      onProgress: (progress01) => {
        void updateProgressAsync(progress01);
      },
    });

    try {
      const result = await currentJob.runAsync();
      await resolved.setInstalledVersionAsync(db, result.version);
      await resolved.setProgressAsync(db, 100);
      await resolved.setStatusAsync(db, 'ready');
      await resolved.setErrorAsync(db, null);
      console.log('[premium] install success', { version: result.version, recipeCount: result.recipeCount });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[premium] install failed', message);
      await resolved.setErrorAsync(db, message);
      await resolved.setStatusAsync(db, 'failed');
      throw error;
    } finally {
      currentJob = null;
    }
  };

  const attemptWithBackoffAsync = async (): Promise<PremiumBundleInstallResult> => {
    const delaysMs = [500, 1000, 2000];
    let lastError: unknown;

    for (let attempt = 0; attempt < delaysMs.length + 1; attempt += 1) {
      try {
        return await runOnceAsync();
      } catch (error) {
        lastError = error;
        if (attempt < delaysMs.length) {
          await resolved.sleepAsync(delaysMs[attempt]);
        }
      }
    }

    throw lastError;
  };

  const startAsync = async (): Promise<boolean> => {
    const result = await runIfIdle(async () => {
      await runOnceAsync();
      return true;
    });

    return result ?? false;
  };

  const retryAsync = async (): Promise<boolean> => {
    const result = await runIfIdle(async () => {
      await attemptWithBackoffAsync();
      return true;
    });

    return result ?? false;
  };

  const pauseAsync = async (): Promise<void> => {
    if (!currentJob?.pauseAsync) {
      return;
    }

    await currentJob.pauseAsync();
    await resolved.setStatusAsync(db, 'paused');
  };

  const resumeAsync = async (): Promise<void> => {
    if (!currentJob?.resumeAsync) {
      return;
    }

    await currentJob.resumeAsync();
    await resolved.setStatusAsync(db, 'downloading');
  };

  return {
    startAsync,
    pauseAsync,
    resumeAsync,
    retryAsync,
  };
}
