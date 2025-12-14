#!/usr/bin/env node

/**
 * Optimize images and upload to Cloudflare R2
 *
 * This script:
 * 1. Scans public/images/ for all images
 * 2. Converts to WebP format at multiple sizes
 * 3. Uploads optimized images to R2
 * 4. Generates a manifest mapping original paths to R2 URLs
 *
 * Usage:
 *   node scripts/optimize-and-upload.mjs [options]
 *
 * Options:
 *   --dry-run     Preview what would be uploaded without uploading
 *   --path=X      Process specific subdirectory (e.g., --path=carousel)
 *   --skip-upload Optimize locally but don't upload (for testing)
 *   --force       Re-process even if already in manifest
 */

import sharp from 'sharp';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  // Sizes to generate (width in pixels)
  sizes: [640, 1024, 1920],
  // WebP quality (0-100)
  quality: 80,
  // Directories to exclude
  excludeDirs: ['placeholders'],
  // File extensions to process
  imageExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  // Skip SVGs (they don't need optimization)
  skipExtensions: ['.svg'],
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipUpload = args.includes('--skip-upload');
const forceReprocess = args.includes('--force');
const pathArg = args.find(arg => arg.startsWith('--path='))?.split('=')[1];

// Load environment variables from .env.local
async function loadEnv() {
  try {
    const envPath = path.join(PROJECT_ROOT, '.env.local');
    const envContent = await fs.readFile(envPath, 'utf-8');

    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.error('Warning: Could not load .env.local');
  }
}

// Initialize S3 client for R2
function createR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    if (!isDryRun && !skipUpload) {
      console.error('❌ Missing R2 credentials in .env.local');
      console.error('   Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
      process.exit(1);
    }
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Recursively get all image files from a directory
 */
async function getImageFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Check if directory should be excluded
    if (entry.isDirectory()) {
      const shouldExclude = CONFIG.excludeDirs.some(exclude =>
        entry.name === exclude || relativePath.includes(`/${exclude}/`)
      );

      if (!shouldExclude) {
        const subFiles = await getImageFiles(fullPath, baseDir);
        files.push(...subFiles);
      }
      continue;
    }

    // Check file extension
    const ext = path.extname(entry.name).toLowerCase();

    if (CONFIG.skipExtensions.includes(ext)) {
      continue; // Skip SVGs etc
    }

    if (CONFIG.imageExtensions.includes(ext)) {
      const stats = await fs.stat(fullPath);
      files.push({
        fullPath,
        relativePath,
        name: entry.name,
        ext,
        size: stats.size,
      });
    }
  }

  return files;
}

/**
 * Generate a hash for cache busting
 */
function generateHash(buffer) {
  return createHash('md5').update(buffer).digest('hex').slice(0, 8);
}

/**
 * Optimize a single image to WebP at specified width
 */
async function optimizeImage(inputPath, width, quality) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Don't upscale - if image is smaller than target, use original width
  const targetWidth = Math.min(width, metadata.width || width);

  const optimized = await image
    .resize(targetWidth, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality })
    .toBuffer();

  return {
    buffer: optimized,
    width: targetWidth,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
  };
}

/**
 * Upload buffer to R2
 */
async function uploadToR2(client, bucket, key, buffer, contentType = 'image/webp') {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await client.send(command);
}

/**
 * Check if object exists in R2
 */
async function existsInR2(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Process a single image file
 */
async function processImage(file, r2Client, bucket, publicUrl, manifest, stats) {
  const baseName = path.basename(file.name, file.ext);
  const dirPath = path.dirname(file.relativePath);

  // Original path for manifest lookup (e.g., "/images/carousel/image.jpg")
  const originalPath = `/images/${file.relativePath}`;

  // Skip if already in manifest and not forcing
  if (manifest[originalPath] && !forceReprocess) {
    stats.skipped++;
    return;
  }

  const variants = {};

  try {
    // Read original file once
    const originalBuffer = await fs.readFile(file.fullPath);
    const hash = generateHash(originalBuffer);

    for (const width of CONFIG.sizes) {
      const r2Key = dirPath === '.'
        ? `${baseName}-${width}w-${hash}.webp`
        : `${dirPath}/${baseName}-${width}w-${hash}.webp`;

      if (isDryRun) {
        variants[width] = `${publicUrl}/${r2Key}`;
        continue;
      }

      // Check if already exists in R2
      if (r2Client && !forceReprocess) {
        const exists = await existsInR2(r2Client, bucket, r2Key);
        if (exists) {
          variants[width] = `${publicUrl}/${r2Key}`;
          continue;
        }
      }

      // Optimize image
      const { buffer, width: actualWidth } = await optimizeImage(
        file.fullPath,
        width,
        CONFIG.quality
      );

      // Upload to R2
      if (r2Client && !skipUpload) {
        await uploadToR2(r2Client, bucket, r2Key, buffer);
      }

      variants[width] = `${publicUrl}/${r2Key}`;
      stats.uploaded++;
    }

    // Store in manifest
    manifest[originalPath] = {
      variants,
      originalSize: file.size,
      hash,
    };

    stats.processed++;
  } catch (error) {
    console.error(`\n   ❌ Error processing ${file.relativePath}: ${error.message}`);
    stats.errors.push({ file: file.relativePath, error: error.message });
  }
}

/**
 * Load existing manifest if it exists
 */
async function loadManifest() {
  const manifestPath = path.join(PROJECT_ROOT, 'src', 'lib', 'image-manifest.json');
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Save manifest to file
 */
async function saveManifest(manifest) {
  const manifestPath = path.join(PROJECT_ROOT, 'src', 'lib', 'image-manifest.json');

  // Ensure directory exists
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });

  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  return manifestPath;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Image Optimization & R2 Upload Tool\n');

  if (isDryRun) {
    console.log('📋 DRY RUN MODE - No files will be uploaded\n');
  }
  if (skipUpload) {
    console.log('📋 SKIP UPLOAD MODE - Optimizing locally only\n');
  }

  // Load environment
  await loadEnv();

  const bucket = process.env.R2_IMAGES_BUCKET || 'americas-tapestry-images';
  const publicUrl = process.env.R2_IMAGES_PUBLIC_URL || 'https://pub-93847b5093894cc7874bdee71704b7b5.r2.dev';

  console.log(`📦 Bucket: ${bucket}`);
  console.log(`🌐 Public URL: ${publicUrl}\n`);

  // Initialize R2 client
  const r2Client = createR2Client();

  // Determine source directory
  const sourceDir = pathArg
    ? path.join(PROJECT_ROOT, 'public', 'images', pathArg)
    : path.join(PROJECT_ROOT, 'public', 'images');

  console.log(`📁 Source: ${path.relative(PROJECT_ROOT, sourceDir)}`);
  console.log(`🚫 Excluding: ${CONFIG.excludeDirs.join(', ')}`);
  console.log(`📐 Sizes: ${CONFIG.sizes.join(', ')}px\n`);

  // Get all image files
  console.log('🔍 Scanning for images...');

  let imageFiles;
  try {
    imageFiles = await getImageFiles(sourceDir);
  } catch (error) {
    console.error(`❌ Could not read directory: ${error.message}`);
    process.exit(1);
  }

  if (imageFiles.length === 0) {
    console.log('❌ No image files found');
    process.exit(0);
  }

  const totalSize = imageFiles.reduce((sum, f) => sum + f.size, 0);
  console.log(`✅ Found ${imageFiles.length} images (${formatBytes(totalSize)})\n`);

  // Load existing manifest
  const manifest = await loadManifest();
  const existingCount = Object.keys(manifest).length;
  if (existingCount > 0) {
    console.log(`📄 Loaded existing manifest with ${existingCount} entries\n`);
  }

  // Process images
  console.log('⚙️  Processing images...\n');

  const stats = {
    processed: 0,
    skipped: 0,
    uploaded: 0,
    errors: [],
  };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const progress = `[${i + 1}/${imageFiles.length}]`;

    process.stdout.write(`${progress} ${file.relativePath}...`);

    await processImage(file, r2Client, bucket, publicUrl, manifest, stats);

    if (stats.errors.length > 0 && stats.errors[stats.errors.length - 1].file === file.relativePath) {
      // Error was logged in processImage
    } else {
      process.stdout.write(' ✅\n');
    }
  }

  // Save manifest
  console.log('\n📝 Saving manifest...');
  const manifestPath = await saveManifest(manifest);
  console.log(`✅ Manifest saved to: ${path.relative(PROJECT_ROOT, manifestPath)}`);

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   ✅ Processed: ${stats.processed}`);
  console.log(`   ⏭️  Skipped (already done): ${stats.skipped}`);
  console.log(`   ☁️  Uploaded: ${stats.uploaded} variants`);

  if (stats.errors.length > 0) {
    console.log(`   ❌ Errors: ${stats.errors.length}`);
  }

  console.log(`   📄 Total manifest entries: ${Object.keys(manifest).length}`);

  if (isDryRun) {
    console.log('\n💡 This was a dry run. To execute:');
    console.log('   node scripts/optimize-and-upload.mjs');
  } else if (!skipUpload) {
    console.log('\n✅ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update next.config.mjs to use custom loader');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test that images load correctly');
  }
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
