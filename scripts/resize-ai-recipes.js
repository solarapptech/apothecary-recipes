const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const KB = 1024;
const TARGET_MIN = 150 * KB;
const TARGET_MAX = 300 * KB;
const QUALITY_STEPS = [
  82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38,
];

const argv = process.argv.slice(2);
const inputArg = argv.find((arg) => arg.startsWith("--input="));
const outputArg = argv.find((arg) => arg.startsWith("--output="));

const rootDir = path.resolve(__dirname, "..");
const inputDir = inputArg
  ? path.resolve(inputArg.split("=")[1])
  : path.join(rootDir, "assets", "aiRecipes");
const outputDir = outputArg
  ? path.resolve(outputArg.split("=")[1])
  : path.join(inputDir, "resized images");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png"]);

const pickBestBuffer = (candidates) => {
  if (candidates.length === 0) {
    return null;
  }

  const inRange = candidates.find(
    (candidate) => candidate.size >= TARGET_MIN && candidate.size <= TARGET_MAX
  );
  if (inRange) {
    return inRange;
  }

  return candidates.reduce((best, candidate) =>
    candidate.diff < best.diff ? candidate : best
  );
};

const resizeJpeg = async (inputPath) => {
  const candidates = [];

  for (const quality of QUALITY_STEPS) {
    const buffer = await sharp(inputPath)
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    const size = buffer.length;
    const diff = size > TARGET_MAX ? size - TARGET_MAX : TARGET_MIN - size;
    candidates.push({ buffer, size, quality, diff: Math.abs(diff) });

    if (size >= TARGET_MIN && size <= TARGET_MAX) {
      break;
    }
  }

  return pickBestBuffer(candidates);
};

const resizePng = async (inputPath) => {
  const buffer = await sharp(inputPath)
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  return { buffer, size: buffer.length };
};

const ensureOutputDir = async () => {
  await fs.mkdir(outputDir, { recursive: true });
};

const run = async () => {
  await ensureOutputDir();

  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log(`No images found in ${inputDir}`);
    return;
  }

  for (const filename of files) {
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename);
    const extension = path.extname(filename).toLowerCase();

    let result = null;
    if (extension === ".png") {
      result = await resizePng(inputPath);
    } else {
      result = await resizeJpeg(inputPath);
    }

    if (!result) {
      console.warn(`Skipping ${filename}: unable to process.`);
      continue;
    }

    await fs.writeFile(outputPath, result.buffer);
    const sizeKb = Math.round(result.size / KB);
    console.log(`Saved ${filename} (${sizeKb} KB) -> ${outputDir}`);
  }

  console.log("Done.");
};

run().catch((error) => {
  console.error("Resize failed:", error);
  process.exitCode = 1;
});
