#!/usr/bin/env node

/**
 * This script copies all media files from content directories to the public/images directory
 * It handles content from tapestries, sponsors, team, and video folders
 * Removes stale content from the public directories before copying new files
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
  { source: 'content/tapestries', destination: 'public/images/tapestries' },
  { source: 'content/sponsors', destination: 'public/images/sponsors' },
  { source: 'content/team', destination: 'public/images/team' },
  { source: 'content/video', destination: 'public/video' },
  { source: 'content/news/images', destination: 'public/images/news' }
];

// List of media file extensions to copy
const mediaExtensions = [
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', 
  // Audio
  '.mp3', '.wav', '.ogg', '.m4a',
  // Video
  '.mp4', '.webm', '.mov', '.avi'
];

// Function to check if a file is a valid media file based on its extension
function isMediaFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return mediaExtensions.includes(ext);
}

// Function to safely empty a directory without deleting it
// Only removes content that matches our content mapping pattern
function safelyEmptyDirectory(directory, contentType) {
  if (!fs.existsSync(directory)) {
    return;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively empty subdirectories
      safelyEmptyDirectory(fullPath, contentType);
      
      // Delete empty directories
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else if (isMediaFile(entry.name)) {
      // Only delete media files that we would have copied here
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
    } else if (isMediaFile(entry.name)) {
      // Copy all media files, including those with underscores
      try {
        const stats = fs.statSync(srcPath);
        // For audio/video files, copy even if they're small
        const isAudioOrVideo = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.webm', '.mov', '.avi'].includes(
          path.extname(entry.name).toLowerCase()
        );
        
        if (stats.size > 1000 || isAudioOrVideo) { 
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied: ${srcPath} -> ${destPath}`);
        } else {
          console.log(`Skipped small file: ${srcPath} (${stats.size} bytes)`);
        }
      } catch (err) {
        console.error(`Error copying ${srcPath}:`, err);
      }
    }
  }
}

// Main process
console.log('Starting media copy process...');

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
    safelyEmptyDirectory(destPath, path.basename(mapping.source));
    
    // Then copy new content
    console.log(`Copying from ${sourcePath} to ${destPath}`);
    copyDirectory(sourcePath, destPath);
  }
  
  console.log('Media copy process completed successfully!');
} catch (err) {
  console.error('Error during copy process:', err);
}