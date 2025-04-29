#!/bin/bash
# This is a minimal, straightforward script for Vercel deployment
# It focuses on copying files correctly without complex logic

# Create necessary directories
mkdir -p public/content
mkdir -p public/video

# Copy all content files to public/content
echo "Copying content files..."
cp -r content/* public/content/ || true

# Make sure content is visible
find public/content -type d -exec ls -la {} \;

# Run Next.js build
echo "Running Next.js build..."
pnpm next build