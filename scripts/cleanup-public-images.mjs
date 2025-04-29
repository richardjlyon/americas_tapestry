#!/usr/bin/env node

/**
 * This script safely removes the duplicate images from public/images directory
 * It creates a backup first in case you need to restore them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Public images directory
const publicImagesDir = path.join(rootDir, 'public', 'images');

// Create backup directory with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(rootDir, `public-images-backup-${timestamp}`);

// Function to recursively copy a directory
function copyDirectoryRecursively(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  }

  // Get all entries in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDirectoryRecursively(sourcePath, targetPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Backed up: ${sourcePath} -> ${targetPath}`);
    }
  }
}

// Function to recursively delete a directory
function removeDirectoryRecursively(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively delete subdirectories
      removeDirectoryRecursively(fullPath);
    } else {
      // Delete files
      fs.unlinkSync(fullPath);
      console.log(`Removed: ${fullPath}`);
    }
  }

  // Remove the empty directory
  fs.rmdirSync(directory);
  console.log(`Removed directory: ${directory}`);
}

// Main process
console.log('Starting cleanup of public/images directory...');

try {
  // 1. Check if the public/images directory exists
  if (!fs.existsSync(publicImagesDir)) {
    console.log('Public images directory does not exist. Nothing to clean up.');
    process.exit(0);
  }

  // 2. Create backup
  console.log(`Creating backup in ${backupDir}...`);
  copyDirectoryRecursively(publicImagesDir, backupDir);
  console.log(`Backup completed successfully in ${backupDir}`);

  // 3. Remove the public/images directory
  console.log('Removing public/images directory...');
  removeDirectoryRecursively(publicImagesDir);
  
  console.log('Cleanup completed successfully!');
  console.log(`If you need to restore the images, copy files from ${backupDir} back to ${publicImagesDir}`);

} catch (err) {
  console.error('Error during cleanup:', err);
  process.exit(1);
}