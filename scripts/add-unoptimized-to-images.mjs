#!/usr/bin/env node

/**
 * This script adds the unoptimized prop to all Next.js Image components
 * in the codebase to ensure direct file serving without optimization.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Components directory
const componentsDir = path.join(rootDir, 'components');

// Helper function to find all files recursively
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Regular expression for finding Image component opening tags
const imageComponentRegex = /<Image\s+[^/>]*(?:\s+\/?>|\s*>)/gs;

// Function to check if a component already has unoptimized
function hasUnoptimized(imageTag) {
  return imageTag.includes('unoptimized');
}

// Function to add unoptimized prop to Image component
function addUnoptimizedProp(imageTag) {
  // If the component already has unoptimized, return as is
  if (hasUnoptimized(imageTag)) {
    return imageTag;
  }
  
  // Handle self-closing tags
  if (imageTag.includes('/>')) {
    return imageTag.replace(/(\s*)\/>/, ' unoptimized$1/>');
  }
  
  // Handle regular closing tags
  if (imageTag.includes('>')) {
    return imageTag.replace(/>/, ' unoptimized>');
  }
  
  return imageTag;
}

// Process a file to add unoptimized to Image components
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Find all Image components
    let newContent = content.replace(imageComponentRegex, (match) => {
      // Only modify if it doesn't already have unoptimized
      if (!hasUnoptimized(match)) {
        modified = true;
        return addUnoptimizedProp(match);
      }
      return match;
    });
    
    // If content was modified, write back to file
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Main function
function main() {
  console.log('Finding all component files...');
  const allFiles = findAllFiles(componentsDir);
  console.log(`Found ${allFiles.length} component files`);
  
  let modifiedCount = 0;
  
  // Process each file
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Only process files that import Image from next/image
      if (content.includes("import") && content.includes("Image") && content.includes("next/image")) {
        processFile(filePath);
        modifiedCount++;
      }
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
  });
  
  console.log(`Processed ${modifiedCount} files containing Next.js Image components`);
}

// Run the script
main();