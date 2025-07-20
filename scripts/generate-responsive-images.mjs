#!/usr/bin/env node

/**
 * Responsive Image Generation Script for America's Tapestry
 * 
 * Generates optimized responsive variants for all tapestry images
 * Part of Phase 2 Performance Optimization PRP
 * 
 * Generates:
 * - Multiple sizes: 640w, 1024w, 1920w, 2560w (hero/gallery)
 *                   400w, 640w, 1024w, 1280w (gallery)
 *                   200w, 400w, 600w (thumbnails)
 *                   300w, 600w, 900w (cards)
 * - Multiple formats: WebP, AVIF, JPG
 * 
 * Usage: node scripts/generate-responsive-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for different image roles
const SIZES = {
  hero: [640, 1024, 1920, 2560],     // Hero carousel - large sizes
  gallery: [400, 640, 1024, 1280],   // Gallery grid - medium sizes  
  thumbnail: [200, 400, 600],        // Thumbnails - small sizes
  card: [300, 600, 900]              // Cards - medium sizes
};

// Supported output formats with quality settings
const FORMATS = [
  { ext: 'webp', quality: 85, effort: 6 },
  { ext: 'avif', quality: 80, effort: 9 },
  { ext: 'jpg', quality: 80 }
];

// Base directory for tapestry images
const TAPESTRY_DIR = path.join(__dirname, '..', 'public', 'images', 'tapestries');

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in MB
 */
async function getFileSizeMB(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch {
    return 0;
  }
}

/**
 * Determine image role based on filename
 */
function determineImageRole(filename) {
  if (filename.includes('-main') || filename.includes('tapestry')) {
    return 'hero'; // Main tapestry images used in hero carousel
  } else if (filename.includes('-thumbnail')) {
    return 'thumbnail'; // Thumbnail images
  } else if (filename.includes('-card')) {
    return 'card'; // Card images
  } else {
    return 'gallery'; // Default to gallery
  }
}

/**
 * Generate responsive variants for a single image
 */
async function generateVariants(inputPath, role) {
  const sizes = SIZES[role];
  const inputDir = path.dirname(inputPath);
  const inputName = path.parse(inputPath).name;
  const inputExt = path.parse(inputPath).ext;
  
  console.log(`\n🔄 Processing: ${path.basename(inputPath)} (${role})`);
  
  const originalSize = await getFileSizeMB(inputPath);
  console.log(`   Original size: ${originalSize}MB`);
  
  let variantsGenerated = 0;
  let totalSizeReduction = 0;
  
  // Get image metadata to avoid upscaling
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width;
  
  for (const size of sizes) {
    // Skip if we would be upscaling
    if (size > originalWidth) {
      console.log(`   ⏭️  Skipping ${size}w (would upscale from ${originalWidth}w)`);
      continue;
    }
    
    for (const format of FORMATS) {
      const outputPath = path.join(
        inputDir, 
        `${inputName}-${size}w.${format.ext}`
      );
      
      // Skip if file already exists (for incremental processing)
      if (await fileExists(outputPath)) {
        console.log(`   ✓ Exists: ${path.basename(outputPath)}`);
        continue;
      }
      
      try {
        let sharpInstance = sharp(inputPath)
          .resize(size, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          });
        
        // Apply format-specific settings
        if (format.ext === 'webp') {
          sharpInstance = sharpInstance.webp({
            quality: format.quality,
            effort: format.effort
          });
        } else if (format.ext === 'avif') {
          sharpInstance = sharpInstance.avif({
            quality: format.quality,
            effort: format.effort
          });
        } else if (format.ext === 'jpg') {
          sharpInstance = sharpInstance.jpeg({
            quality: format.quality,
            progressive: true
          });
        }
        
        await sharpInstance.toFile(outputPath);
        
        const newSize = await getFileSizeMB(outputPath);
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        console.log(`   ✅ Generated: ${path.basename(outputPath)} (${newSize}MB, ${reduction}% smaller)`);
        
        variantsGenerated++;
        totalSizeReduction += parseFloat(originalSize) - parseFloat(newSize);
        
      } catch (error) {
        console.error(`   ❌ Failed to generate ${outputPath}:`, error.message);
      }
    }
  }
  
  console.log(`   📊 Generated ${variantsGenerated} variants, saved ${totalSizeReduction.toFixed(2)}MB total`);
  return variantsGenerated;
}

/**
 * Process all images in a directory
 */
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let totalVariants = 0;
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const subDirPath = path.join(dirPath, entry.name);
        const subVariants = await processDirectory(subDirPath);
        totalVariants += subVariants;
      } else if (entry.isFile()) {
        const filePath = path.join(dirPath, entry.name);
        const ext = path.extname(entry.name).toLowerCase();
        
        // Process image files (exclude already generated variants)
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && 
            !entry.name.includes('-640w') && 
            !entry.name.includes('-1024w') && 
            !entry.name.includes('-1920w') && 
            !entry.name.includes('-2560w') &&
            !entry.name.includes('-400w') &&
            !entry.name.includes('-1280w') &&
            !entry.name.includes('-200w') &&
            !entry.name.includes('-600w') &&
            !entry.name.includes('-300w') &&
            !entry.name.includes('-900w')) {
          
          const role = determineImageRole(entry.name);
          const variants = await generateVariants(filePath, role);
          totalVariants += variants;
        }
      }
    }
    
    return totalVariants;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting responsive image generation...');
  console.log('📁 Processing:', TAPESTRY_DIR);
  
  // Check if tapestry directory exists
  if (!await fileExists(TAPESTRY_DIR)) {
    console.error('❌ Tapestry directory not found:', TAPESTRY_DIR);
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  try {
    const totalVariants = await processDirectory(TAPESTRY_DIR);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('\n🎉 Image generation complete!');
    console.log(`📊 Total variants generated: ${totalVariants}`);
    console.log(`⏱️  Processing time: ${duration}s`);
    
    // Provide summary of what was generated
    console.log('\n📋 Generated image sizes:');
    console.log('   • Hero images: 640w, 1024w, 1920w, 2560w');
    console.log('   • Gallery images: 400w, 640w, 1024w, 1280w');
    console.log('   • Thumbnails: 200w, 400w, 600w');
    console.log('   • Cards: 300w, 600w, 900w');
    console.log('\n🖼️  Generated formats: WebP, AVIF, JPG');
    
    console.log('\n✅ Next steps:');
    console.log('   1. Update image utilities to use responsive srcSets');
    console.log('   2. Create ResponsivePicture component');
    console.log('   3. Update components to use optimized images');
    
  } catch (error) {
    console.error('❌ Fatal error during image generation:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);