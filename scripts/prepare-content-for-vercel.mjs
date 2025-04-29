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
      console.log(`Copied: ${sourcePath} -> ${targetPath}`);
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

  // Check if public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created public directory: ${publicDir}`);
  }
  
  // Remove existing content directory in public if it exists
  if (fs.existsSync(publicContentDir)) {
    console.log(`Removing existing content in public: ${publicContentDir}`);
    fs.rmSync(publicContentDir, { recursive: true, force: true });
  }

  // Create a symbolic link from public/content to content
  console.log(`Creating symbolic link from ${contentDir} to ${publicContentDir}`);

  // Try to create a symlink first (works on most environments)
  try {
    fs.symlinkSync(contentDir, publicContentDir, 'junction');
    console.log(`Created symbolic link successfully`);
  } catch (err) {
    console.warn(`Failed to create symbolic link: ${err.message}`);
    console.log(`Falling back to copying content directory`);
    
    // If symlink fails, copy the content directory instead
    copyDirectoryRecursively(contentDir, publicContentDir);
    console.log(`Copied content directory successfully`);
  }

  console.log('Content preparation for Vercel completed successfully!');
} catch (err) {
  console.error('Error during content preparation:', err);
  process.exit(1);
}