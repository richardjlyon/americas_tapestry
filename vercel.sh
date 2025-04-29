#!/bin/bash
mkdir -p public/content
mkdir -p public/video
cp -r content/* public/content/ || true
cp -r content/video/* public/video/ || true
pnpm next build