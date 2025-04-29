#!/usr/bin/env node

/**
 * This script prepares the content directory for Vercel deployment
 * It creates a symlink to the content directory in the public directory
 * This ensures that the content is available in the Vercel deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Content directory
const contentDir = path.join(rootDir, 'content');
// Public directory
const publicDir = path.join(rootDir, 'public');
// Public content directory
const publicContentDir = path.join(publicDir, 'content');

// Function to recursively copy a directory
function copyDirectoryRecursively(source, target) {
  // Create target directory
  fs.mkdirSync(target, { recursive: true });
  console.log(`Created directory: ${target}`);

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
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`Error copying ${sourcePath} to ${targetPath}: ${err.message}`);
      }
    }
  }
}

// Main process
console.log('Starting content preparation for Vercel...');

try {
  // Check if the content directory exists
  if (!fs.existsSync(contentDir)) {
    console.error('Content directory does not exist');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created public directory: ${publicDir}`);
  }

  // Remove existing content directory in public if it exists
  if (fs.existsSync(publicContentDir)) {
    console.log(`Removing existing content in public: ${publicContentDir}`);
    try {
      fs.rmSync(publicContentDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`Failed to remove existing content: ${err.message}`);
      // Continue anyway
    }
  }

  // Try different approaches to make content available in the public directory
  const isVercel = process.env.VERCEL === '1';
  console.log(`Running in ${isVercel ? 'Vercel' : 'local'} environment`);

  if (isVercel) {
    // On Vercel, just copy the content directory
    console.log(`Copying content directory to ${publicContentDir}`);
    try {
      // Ensure the target directory exists
      fs.mkdirSync(publicContentDir, { recursive: true });
      copyDirectoryRecursively(contentDir, publicContentDir);
      console.log(`Copied content directory successfully`);
    } catch (err) {
      console.error(`Error during content copy: ${err.message}`);
      process.exit(1);
    }
  } else {
    // In local environment, try to create a symlink first
    console.log(`Creating symbolic link from ${contentDir} to ${publicContentDir}`);
    try {
      fs.symlinkSync(contentDir, publicContentDir, 'junction');
      console.log(`Created symbolic link successfully`);
    } catch (err) {
      console.warn(`Failed to create symbolic link: ${err.message}`);
      console.log(`Falling back to copying content directory`);
      
      // If symlink fails, copy the content directory instead
      try {
        // Ensure the target directory exists
        fs.mkdirSync(publicContentDir, { recursive: true });
        copyDirectoryRecursively(contentDir, publicContentDir);
        console.log(`Copied content directory successfully`);
      } catch (err) {
        console.error(`Error during content copy fallback: ${err.message}`);
        process.exit(1);
      }
    }
  }

  console.log('Content preparation completed successfully!');
} catch (err) {
  console.error('Error during content preparation:', err);
  process.exit(1);
}