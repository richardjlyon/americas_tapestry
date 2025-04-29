#!/usr/bin/env node

/**
 * Ultra-simple content copy script for Vercel deployment
 * Bypasses all symlinks and complex operations to just copy files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log(`Current directory: ${process.cwd()}`);
console.log(`Root directory: ${rootDir}`);

// Directory paths
const contentDir = path.join(rootDir, 'content');
const publicDir = path.join(rootDir, 'public');
const publicContentDir = path.join(publicDir, 'content');

// Debug function
function debugDir(dirPath, label) {
  console.log(`[DEBUG] ${label}: ${dirPath}`);
  console.log(`[DEBUG] ${label} exists: ${fs.existsSync(dirPath)}`);
  
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      console.log(`[DEBUG] Contents of ${label}:`, files.length > 0 ? files.join(', ') : '(empty)');
    } catch (err) {
      console.log(`[DEBUG] Error reading ${label}:`, err.message);
    }
  }
}

// Simple function to copy a file
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}: ${err.message}`);
    return false;
  }
}

// Simple function to create a directory
function createDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch (err) {
    console.error(`Error creating directory ${dir}: ${err.message}`);
    return false;
  }
}

// Simple recursive copy
function copyDirRecursive(src, dest) {
  // Create the destination directory
  createDir(dest);
  
  // Get all items in the source directory
  let items;
  try {
    items = fs.readdirSync(src, { withFileTypes: true });
  } catch (err) {
    console.error(`Error reading directory ${src}: ${err.message}`);
    return false;
  }
  
  // Copy each item
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    
    if (item.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
  
  return true;
}

// Main process
console.log('Starting simplified content copy process...');

// Debug the starting directory state
debugDir(rootDir, 'Root directory');
debugDir(contentDir, 'Content directory');
debugDir(publicDir, 'Public directory');

// Step 1: Make sure public directory exists
console.log('Creating public directory...');
if (!createDir(publicDir)) {
  console.error('Failed to create public directory, exiting');
  process.exit(1);
}

// Step 2: Attempt direct copy of content to public/content
console.log('Creating public/content directory...');
if (!createDir(publicContentDir)) {
  console.error('Failed to create public/content directory, exiting');
  process.exit(1);
}

// Step 3: Copy content files
if (!fs.existsSync(contentDir)) {
  console.error('Content directory does not exist, cannot copy files');
  process.exit(1);
}

console.log('Copying content files...');
if (copyDirRecursive(contentDir, publicContentDir)) {
  console.log('Content copied successfully');
} else {
  console.error('Failed to copy content files');
  process.exit(1);
}

// Final debug check
debugDir(publicContentDir, 'Public content directory (after copy)');
console.log('Content copy process completed');