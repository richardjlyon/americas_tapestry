#!/usr/bin/env node

/**
 * This script copies only video files from content directories to the public/video directory
 * It excludes images which are now directly served by Next.js Image optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define content source directories and their corresponding public destinations
const contentMappings = [
  { source: 'content/video', destination: 'public/video' }
];

// List of video file extensions to copy
const videoExtensions = [
  '.mp4', '.webm', '.mov', '.avi'
];

// Function to check if a file is a valid video file based on its extension
function isVideoFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

// Function to safely empty a directory without deleting it
function safelyEmptyDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively empty subdirectories
      safelyEmptyDirectory(fullPath);
      
      // Delete empty directories
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else if (isVideoFile(entry.name)) {
      // Only delete video files that we would have copied here
      fs.unlinkSync(fullPath);
      console.log(`Removed stale file: ${fullPath}`);
    }
  }
}

// Function to copy a directory recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
    console.log(`Created directory: ${destination}`);
  }
  
  // Read all files/directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy sub-directories
      copyDirectory(srcPath, destPath);
    } else if (isVideoFile(entry.name)) {
      // Copy only video files
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      } catch (err) {
        console.error(`Error copying ${srcPath}:`, err);
      }
    }
  }
}

// Main process
console.log('Starting video file copy process...');

try {
  // Process each content mapping
  for (const mapping of contentMappings) {
    const sourcePath = path.join(rootDir, mapping.source);
    const destPath = path.join(rootDir, mapping.destination);
    
    // Skip if source doesn't exist
    if (!fs.existsSync(sourcePath)) {
      console.log(`Source directory does not exist, skipping: ${sourcePath}`);
      continue;
    }
    
    // First, clear out any stale content
    console.log(`Removing stale content from: ${destPath}`);
    safelyEmptyDirectory(destPath);
    
    // Then copy new content
    console.log(`Copying from ${sourcePath} to ${destPath}`);
    copyDirectory(sourcePath, destPath);
  }
  
  console.log('Video copy process completed successfully!');
} catch (err) {
  console.error('Error during copy process:', err);
}