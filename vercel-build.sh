#!/bin/bash

# This script runs custom build steps for the Vercel deployment
set -e

echo "Starting Vercel custom build script..."

# Debug current directory structure
echo "Current directory: $(pwd)"
echo "Root directory contents:"
ls -la

# Create required directories
echo "Creating public directories..."
mkdir -p public
mkdir -p public/content
mkdir -p public/video

# Copy content to public
echo "Copying content to public/content..."
if [ -d "content" ]; then
  cp -r content/* public/content/
  echo "Content copied successfully"
else
  echo "Warning: content directory not found"
fi

# Copy video files
echo "Copying video files to public/video..."
if [ -d "content/video" ]; then
  cp -r content/video/* public/video/
  echo "Video files copied successfully"
else
  echo "Warning: content/video directory not found"
fi

# Check results
echo "Public directory contents after copy:"
ls -la public
echo "Public/content directory contents after copy:"
ls -la public/content

# Run the Next.js build
echo "Running Next.js build..."
next build