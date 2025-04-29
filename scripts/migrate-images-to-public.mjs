#!/usr/bin/env node

/**
 * This script migrates images from the content directory structure to the public directory
 * for direct referencing. It maintains the same structure but eliminates the content indirection.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define content and public directories
const contentDir = path.join(rootDir, 'content');
const publicDir = path.join(rootDir, 'public');

// Define the mapping of content directories to public directories
const directoryMappings = [
  { source: 'content/tapestries', destination: 'public/images/tapestries' },
  { source: 'content/sponsors', destination: 'public/images/sponsors' },
  { source: 'content/team', destination: 'public/images/team' },
  { source: 'content/news/images', destination: 'public/images/news' },
  { source: 'content/video', destination: 'public/video' }
];

// Helper function to copy image files
function copyImageFiles(sourceDir, destDir) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created directory: ${destDir}`);
  }

  // Get all files and directories in the source
  try {
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        copyImageFiles(sourcePath, destPath);
      } else {
        // Check if it's an image/media file by extension
        const ext = path.extname(entry.name).toLowerCase();
        
        // List of extensions to copy
        const mediaExts = [
          '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', 
          '.mp3', '.mp4', '.webm', '.ogg', '.m4a'
        ];
        
        if (mediaExts.includes(ext)) {
          // Copy the file
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied: ${sourcePath} -> ${destPath}`);
        } else {
          // Skip non-media files
          console.log(`Skipping non-media file: ${sourcePath}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error processing ${sourceDir}: ${err.message}`);
  }
}

// Main function to process all directory mappings
function migrateImages() {
  console.log('Starting image migration to public directory...');
  
  for (const mapping of directoryMappings) {
    const sourcePath = path.join(rootDir, mapping.source);
    const destPath = path.join(rootDir, mapping.destination);
    
    console.log(`\nProcessing: ${mapping.source} -> ${mapping.destination}`);
    
    if (!fs.existsSync(sourcePath)) {
      console.log(`Source directory does not exist: ${sourcePath}`);
      continue;
    }
    
    copyImageFiles(sourcePath, destPath);
  }
  
  console.log('\nImage migration completed!');
}

// Run the migration
migrateImages();