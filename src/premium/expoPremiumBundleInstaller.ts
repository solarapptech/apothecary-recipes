import type { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { Platform } from 'react-native';

import { computeDeterministicRandomKey } from '../db/hash';
import type { Recipe } from '../types/recipe';

import type { PremiumBundleInstaller, PremiumBundleJob, PremiumBundleInstallResult } from './premiumBundleService';

type InstallRecipeInput = Recipe & {
  imageFileName?: string | null;
};

type PremiumZipMetadata = {
  version?: string;
};

async function ensureDirAsync(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists && info.isDirectory) {
    return;
  }

  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
}

async function deleteIfExistsAsync(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    return;
  }

  await FileSystem.deleteAsync(path, { idempotent: true });
}

async function loadZipArrayBufferAsync(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`premium bundle fetch failed (${response.status})`);
  }
  return await response.arrayBuffer();
}

function stripFileScheme(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

async function writePremiumRecipesToDbAsync(db: SQLiteDatabase, recipes: InstallRecipeInput[], imagesDir: string): Promise<void> {
  const runInTransaction = db.withTransactionAsync
    ? db.withTransactionAsync.bind(db)
    : async (task: () => Promise<void>) => {
        await task();
      };

  await runInTransaction(async () => {
    await db.runAsync('DELETE FROM recipes WHERE isPremium = 1');

    for (const recipe of recipes) {
      const randomKey = computeDeterministicRandomKey(recipe);
      const imageLocalPath = recipe.imageFileName ? `${imagesDir}${recipe.imageFileName}` : null;

      await db.runAsync(
        `INSERT INTO recipes (
          title,
          difficultyScore,
          preparationTime,
          description,
          timePeriod,
          warning,
          region,
          usedFor,
          ingredients,
          detailedMeasurements,
          preparationSteps,
          usage,
          historicalContext,
          scientificEvidence,
          randomKey,
          isPremium,
          imageLocalPath
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        recipe.title,
        recipe.difficultyScore,
        recipe.preparationTime,
        recipe.description,
        recipe.timePeriod,
        recipe.warning,
        recipe.region,
        recipe.usedFor ?? '',
        recipe.ingredients,
        recipe.detailedMeasurements,
        recipe.preparationSteps,
        recipe.usage,
        recipe.historicalContext,
        recipe.scientificEvidence,
        randomKey,
        1,
        imageLocalPath
      );
    }
  });
}

export async function deleteLocalPremiumBundleFilesAsync(): Promise<void> {
  const baseDir = `${FileSystem.documentDirectory ?? ''}premium/`;
  if (!FileSystem.documentDirectory) {
    return;
  }

  await deleteIfExistsAsync(baseDir);
}

export function createExpoPremiumBundleInstaller(input: {
  db: SQLiteDatabase;
  bundleUrl: string;
}): PremiumBundleInstaller {
  const baseDir = `${FileSystem.documentDirectory ?? ''}premium/`;
  const zipPath = `${baseDir}bundle.zip`;
  const imagesDir = `${baseDir}images/`;

  if (!FileSystem.documentDirectory) {
    throw new Error('expo FileSystem.documentDirectory is unavailable');
  }

  const cleanupAsync = async (): Promise<void> => {
    await deleteIfExistsAsync(baseDir);
    await ensureDirAsync(baseDir);
    await ensureDirAsync(imagesDir);
  };

  const createJob = (jobInput: { onProgress: (progress01: number) => void }): PremiumBundleJob => {
    let downloadResumable: FileSystem.DownloadResumable | null = null;

    const ensureDownloadResumable = (): FileSystem.DownloadResumable => {
      if (downloadResumable) {
        return downloadResumable;
      }

      downloadResumable = FileSystem.createDownloadResumable(
        input.bundleUrl,
        zipPath,
        {},
        (progress) => {
          const expected = progress.totalBytesExpectedToWrite;
          if (!expected || expected <= 0) {
            return;
          }
          jobInput.onProgress(progress.totalBytesWritten / expected);
        }
      );

      return downloadResumable;
    };

    const runAsync = async (): Promise<PremiumBundleInstallResult> => {
      console.log('[premium] installer start', { bundleUrl: input.bundleUrl });
      await ensureDirAsync(baseDir);
      await ensureDirAsync(imagesDir);

      const resumable = ensureDownloadResumable();
      const downloaded = await resumable.downloadAsync();

      if (!downloaded?.uri) {
        throw new Error('premium bundle download failed');
      }

      console.log('[premium] installer downloaded', { uri: downloaded.uri });

      jobInput.onProgress(1);

      if (Platform.OS === 'android') {
        let unzip: ((source: string, target: string, charset?: string) => Promise<string>) | null = null;
        try {
          const zipArchive = require('react-native-zip-archive') as { unzip?: unknown };
          unzip = typeof zipArchive.unzip === 'function' ? (zipArchive.unzip as any) : null;
        } catch (error) {
          unzip = null;
        }

        if (!unzip) {
          throw new Error('premium install requires native unzip support (react-native-zip-archive). rebuild the app to include it.');
        }

        console.log('[premium] installer unzip native start');
        await unzip(stripFileScheme(zipPath), stripFileScheme(baseDir), 'UTF-8');
        console.log('[premium] installer unzip native complete');

        const recipesJson = await FileSystem.readAsStringAsync(`${baseDir}recipes.json`);
        const parsed = JSON.parse(recipesJson);
        const recipes: InstallRecipeInput[] = Array.isArray(parsed) ? parsed : [];
        console.log('[premium] installer parsed recipes', { count: recipes.length });

        const metadataText = await FileSystem.getInfoAsync(`${baseDir}metadata.json`).then((info) =>
          info.exists ? FileSystem.readAsStringAsync(`${baseDir}metadata.json`) : ''
        );
        const versionText = await FileSystem.getInfoAsync(`${baseDir}version.txt`).then((info) =>
          info.exists ? FileSystem.readAsStringAsync(`${baseDir}version.txt`) : ''
        );
        const metadata = (metadataText ? (JSON.parse(metadataText) as PremiumZipMetadata) : null) as PremiumZipMetadata | null;
        const version = (metadata?.version ?? versionText ?? '').trim() || 'unknown';
        console.log('[premium] installer version', { version });

        console.log('[premium] installer writing db', { recipeCount: recipes.length });
        await writePremiumRecipesToDbAsync(input.db, recipes, imagesDir);
        console.log('[premium] installer db write complete');

        return {
          version,
          recipeCount: recipes.length,
        };
      }

      // Avoid loading the entire zip into a base64 string (memory heavy / can truncate on device).
      // Prefer reading the downloaded file as an ArrayBuffer.
      let zip: JSZip;
      try {
        console.log('[premium] installer zip load: arrayBuffer');
        const buffer = await loadZipArrayBufferAsync(downloaded.uri);
        zip = await JSZip.loadAsync(buffer);
      } catch (error) {
        try {
          console.log('[premium] installer zip load: content uri fallback');
          const contentUri = await FileSystem.getContentUriAsync(downloaded.uri);
          const buffer = await loadZipArrayBufferAsync(contentUri);
          zip = await JSZip.loadAsync(buffer);
        } catch (contentError) {
          console.log('[premium] installer zip load: base64 fallback');
          const base64Zip = await FileSystem.readAsStringAsync(downloaded.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          zip = await JSZip.loadAsync(base64Zip, { base64: true });
        }
      }

      const recipeFile = zip.file('recipes.json');
      if (!recipeFile) {
        throw new Error('premium bundle missing recipes.json');
      }

      const recipesJson = await recipeFile.async('string');
      const parsed = JSON.parse(recipesJson);
      const recipes: InstallRecipeInput[] = Array.isArray(parsed) ? parsed : [];
      console.log('[premium] installer parsed recipes', { count: recipes.length });

      const versionText = zip.file('version.txt') ? await zip.file('version.txt')!.async('string') : '';
      const metadataText = zip.file('metadata.json') ? await zip.file('metadata.json')!.async('string') : '';
      const metadata = (metadataText ? (JSON.parse(metadataText) as PremiumZipMetadata) : null) as PremiumZipMetadata | null;

      const version = (metadata?.version ?? versionText ?? '').trim() || 'unknown';
      console.log('[premium] installer version', { version });

      const files = Object.values(zip.files);
      let extractedImageCount = 0;
      for (const file of files) {
        if (file.dir) {
          continue;
        }

        if (!file.name.startsWith('images/')) {
          continue;
        }

        const name = file.name.slice('images/'.length);
        if (!name) {
          continue;
        }

        const base64 = await file.async('base64');
        await FileSystem.writeAsStringAsync(`${imagesDir}${name}`, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        extractedImageCount += 1;
      }

      console.log('[premium] installer extracted images', { count: extractedImageCount });

      console.log('[premium] installer writing db', { recipeCount: recipes.length });
      await writePremiumRecipesToDbAsync(input.db, recipes, imagesDir);
      console.log('[premium] installer db write complete');

      return {
        version,
        recipeCount: recipes.length,
      };
    };

    const pauseAsync = async (): Promise<void> => {
      if (!downloadResumable) {
        return;
      }

      await downloadResumable.pauseAsync();
    };

    const resumeAsync = async (): Promise<void> => {
      if (!downloadResumable) {
        ensureDownloadResumable();
      }

      await downloadResumable!.resumeAsync();
    };

    return {
      runAsync,
      pauseAsync,
      resumeAsync,
    };
  };

  return {
    cleanupAsync,
    createJob,
  };
}
