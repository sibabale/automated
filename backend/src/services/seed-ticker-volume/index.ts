// [ BACKEND > SERVICES > SEED TICKER VOLUME ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from "node:path";
import { copyFile, mkdir, readdir } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../logger.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface SeedTickerVolumeOptions {
  seedDirectory?: string;
  targetDirectory?: string;
}
// 1.3. END ..........................................................................................

// 1.4. SERVICE ......................................................................................
/**
 * Seeds the mounted ticker directory from the repository defaults on first boot.
 *
 * Railway volumes start empty. This initializer copies the checked-in JSON batch
 * files only when the runtime ticker directory is missing or has no JSON files,
 * so existing volume contents are preserved across restarts and redeploys.
 */
export async function seedTickerVolume(
  options: SeedTickerVolumeOptions = {},
): Promise<void> {
  const seedDirectory = options.seedDirectory ?? path.resolve(process.cwd(), "data", "tickers");
  const targetDirectory = options.targetDirectory
    ? path.resolve(options.targetDirectory)
    : process.env.TICKER_SOURCE_DIRECTORY
      ? path.resolve(process.env.TICKER_SOURCE_DIRECTORY)
      : path.resolve(process.cwd(), "data", "tickers");

  if (seedDirectory === targetDirectory) {
    return;
  }

  const existingTargetFiles = await readJsonFileNames(targetDirectory);
  if (existingTargetFiles.length > 0) {
    logger.info({ targetDirectory, fileCount: existingTargetFiles.length }, "Ticker volume already populated; skipping seed copy");
    return;
  }

  const seedFiles = await readJsonFileNames(seedDirectory);
  if (seedFiles.length === 0) {
    logger.warn({ seedDirectory }, "No repository ticker seed files found");
    return;
  }

  await mkdir(targetDirectory, { recursive: true });

  await Promise.all(
    seedFiles.map(async (fileName) => {
      await copyFile(path.join(seedDirectory, fileName), path.join(targetDirectory, fileName));
    }),
  );

  logger.info(
    {
      seedDirectory,
      targetDirectory,
      fileCount: seedFiles.length,
    },
    "Seeded ticker volume from repository defaults",
  );
}

async function readJsonFileNames(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
