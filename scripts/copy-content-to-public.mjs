#!/usr/bin/env node

/**
 * This script is a simplified version of prepare-content-for-vercel.mjs
 * It copies files from /content to /public/content without symlinks
 * Specifically designed to run in restricted environments like Vercel
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

// Function to recursively copy files, with extra error checking
function copyFiles(sourceDir, targetDir) {
  // Create target directory
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  } catch (err) {
    console.error(`Error creating directory ${targetDir}: ${err.message}`);
    throw err;
  }

  // Check if source exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  // Get all entries
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy sub-directories
      copyFiles(srcPath, destPath);
    } else {
      // Copy files
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.error(`Error copying file ${srcPath}: ${err.message}`);
      }
    }
  }
}

// Main process
console.log('Starting content copy process...');

try {
  // Check if content directory exists
  if (!fs.existsSync(contentDir)) {
    console.error(`Content directory does not exist: ${contentDir}`);
    process.exit(1);
  }
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Created public directory: ${publicDir}`);
    } catch (err) {
      console.error(`Failed to create public directory: ${err.message}`);
      process.exit(1);
    }
  }
  
  // Remove existing content directory if it exists
  if (fs.existsSync(publicContentDir)) {
    try {
      console.log(`Removing existing public/content directory`);
      fs.rmSync(publicContentDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to remove existing content directory: ${err.message}`);
      // Try to continue anyway
    }
  }
  
  // Create public/content directory
  try {
    fs.mkdirSync(publicContentDir, { recursive: true });
    console.log(`Created public/content directory`);
  } catch (err) {
    console.error(`Failed to create public/content directory: ${err.message}`);
    process.exit(1);
  }
  
  // Copy content to public
  console.log(`Copying content from ${contentDir} to ${publicContentDir}`);
  
  // Get the top-level content directories
  const contentEntries = fs.readdirSync(contentDir, { withFileTypes: true });
  
  // Copy each top-level directory
  for (const entry of contentEntries) {
    const srcPath = path.join(contentDir, entry.name);
    const destPath = path.join(publicContentDir, entry.name);
    
    if (entry.isDirectory()) {
      console.log(`Copying directory: ${entry.name}`);
      copyFiles(srcPath, destPath);
    } else {
      console.log(`Copying file: ${entry.name}`);
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  console.log('Content copy completed successfully!');
} catch (err) {
  console.error('Error during content copy:', err);
  process.exit(1);
}