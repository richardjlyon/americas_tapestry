#!/bin/bash

# This script runs custom build steps for the Vercel deployment
# It handles the creation and population of content directories
set -e

echo "Starting Vercel custom build script..."

# Debug current directory structure
echo "Current directory: $(pwd)"
echo "Listing directories:"
ls -la

# Handle public content directories with safety checks
echo "Setting up content directories..."

# First, ensure public directory exists
if [ ! -d "public" ]; then
  mkdir -p public
  echo "Created public directory"
else
  echo "Public directory already exists"
fi

# Check if content exists before attempting to copy
if [ -d "content" ]; then
  echo "Content directory found, proceeding with content copy"
  
  # Check if public/content exists and clean it if needed
  if [ -d "public/content" ]; then
    echo "public/content already exists, cleaning..."
    rm -rf public/content/*
  else
    echo "Creating public/content directory"
    mkdir -p public/content
  fi
  
  # Copy content directory to public/content
  echo "Copying content to public/content..."
  cp -r content/* public/content/ || echo "Warning: Issue during content copy"
  echo "Content directory copy completed"
  
  # Handle video specifically
  if [ -d "content/video" ]; then
    echo "Video content found, copying to public/video"
    mkdir -p public/video
    cp -r content/video/* public/video/ || echo "Warning: Issue during video copy"
  fi
  
  # Verify the copy operation
  echo "Verifying public directory contents:"
  ls -la public
  if [ -d "public/content" ]; then
    echo "Verifying public/content directory contents:"
    ls -la public/content
  fi
else
  echo "Warning: content directory not found, skipping content copy"
fi

# Run Next.js build with production settings
echo "Running Next.js build..."
NODE_ENV=production pnpm next build

echo "Build process completed"