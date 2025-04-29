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
  try {
    fs.mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  } catch (err) {
    console.error(`Error creating directory ${target}: ${err.message}`);
    throw err;
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
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`Error copying ${sourcePath} to ${targetPath}: ${err.message}`);
      }
    }
  }
}

// Debug function to list directories and their existence
function debugDirectories() {
  console.log('DEBUG: Directory information:');
  console.log(`- Root directory: ${rootDir} (exists: ${fs.existsSync(rootDir)})`);
  console.log(`- Content directory: ${contentDir} (exists: ${fs.existsSync(contentDir)})`);
  console.log(`- Public directory: ${publicDir} (exists: ${fs.existsSync(publicDir)})`);
  console.log(`- Public content directory: ${publicContentDir} (exists: ${fs.existsSync(publicContentDir)})`);
  
  // List contents of the root directory
  if (fs.existsSync(rootDir)) {
    console.log('Contents of root directory:');
    fs.readdirSync(rootDir).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // List contents of the content directory
  if (fs.existsSync(contentDir)) {
    console.log('Contents of content directory:');
    fs.readdirSync(contentDir).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // List contents of the public directory if it exists
  if (fs.existsSync(publicDir)) {
    console.log('Contents of public directory:');
    fs.readdirSync(publicDir).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
}

// Main process
console.log('Starting content preparation for Vercel...');
debugDirectories();

try {
  // Check if the content directory exists
  if (!fs.existsSync(contentDir)) {
    console.error('Content directory does not exist!');
    process.exit(1);
  }

  // Check all environment variables to help debug
  console.log('Environment variables:');
  console.log(`- VERCEL: ${process.env.VERCEL}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- VERCEL_ENV: ${process.env.VERCEL_ENV}`);

  // Determine if running on Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  console.log(`Running in ${isVercel ? 'Vercel' : 'local'} environment`);

  // Force create the public directory first
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created/ensured public directory exists: ${publicDir}`);
  } catch (err) {
    console.error(`Failed to create public directory: ${err.message}`);
    // Don't exit, try to continue
  }

  // Delete existing public/content if it exists
  if (fs.existsSync(publicContentDir)) {
    try {
      console.log(`Removing existing content directory: ${publicContentDir}`);
      fs.rmSync(publicContentDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`Failed to remove existing content directory: ${err.message}`);
      // Try to continue anyway
    }
  }

  // Debug after removal
  console.log(`Public directory exists after cleanup: ${fs.existsSync(publicDir)}`);
  console.log(`Public content directory exists after cleanup: ${fs.existsSync(publicContentDir)}`);

  // Handle content based on environment
  if (isVercel) {
    console.log('In Vercel environment, directly copying files');
    
    // Create public/content directory before copying
    try {
      console.log(`Creating public/content directory at ${publicContentDir}`);
      fs.mkdirSync(publicContentDir, { recursive: true });
      console.log(`Successfully created public/content directory`);
    } catch (err) {
      console.error(`Failed to create public/content directory: ${err.message}`);
      process.exit(1);
    }

    // List directories after creation
    console.log(`Public directory now exists: ${fs.existsSync(publicDir)}`);
    console.log(`Public content directory now exists: ${fs.existsSync(publicContentDir)}`);
    
    try {
      // Copy top-level directories one at a time
      const contentEntries = fs.readdirSync(contentDir, { withFileTypes: true });
      
      for (const entry of contentEntries) {
        if (entry.isDirectory()) {
          const sourcePath = path.join(contentDir, entry.name);
          const targetPath = path.join(publicContentDir, entry.name);
          
          console.log(`Copying ${sourcePath} to ${targetPath}`);
          fs.mkdirSync(targetPath, { recursive: true });
          copyDirectoryRecursively(sourcePath, targetPath);
        } else {
          // Copy individual files
          const sourcePath = path.join(contentDir, entry.name);
          const targetPath = path.join(publicContentDir, entry.name);
          
          console.log(`Copying file ${sourcePath} to ${targetPath}`);
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
      
      console.log('Content copy completed successfully');
    } catch (err) {
      console.error(`Error during content copying: ${err.message}`);
      process.exit(1);
    }
  } else {
    // In local environment, try to create a symlink first
    console.log('In local environment, trying symlink first');
    
    try {
      fs.symlinkSync(contentDir, publicContentDir, 'junction');
      console.log(`Created symbolic link successfully`);
    } catch (err) {
      console.warn(`Failed to create symbolic link: ${err.message}`);
      console.log(`Falling back to copying content directory`);
      
      try {
        fs.mkdirSync(publicContentDir, { recursive: true });
        copyDirectoryRecursively(contentDir, publicContentDir);
        console.log(`Copied content directory successfully`);
      } catch (copyErr) {
        console.error(`Error during content copy fallback: ${copyErr.message}`);
        process.exit(1);
      }
    }
  }

  console.log('Content preparation completed successfully');
} catch (err) {
  console.error('Error during content preparation:', err);
  process.exit(1);
}