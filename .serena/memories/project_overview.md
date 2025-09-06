# America's Tapestry Project Overview

## Purpose
A visual exploration of America's diverse cultural heritage through meticulously crafted tapestries representing each original colony. This is a Next.js website showcasing the tapestries project.

## Tech Stack
- **Frontend Framework**: Next.js 15.4.2 with App Router
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Tailwind Typography Plugin
- **UI Components**: Radix UI components
- **Maps**: Mapbox GL for interactive colony maps
- **Form Management**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Playwright for E2E
- **Linting/Formatting**: ESLint, Biome

## Project Structure
```
src/
├── app/              # Next.js App Router pages and layouts
├── components/
│   ├── features/     # Feature-specific components
│   ├── layout/       # Layout components (header, footer, etc.)
│   ├── shared/       # Shared reusable components
│   └── ui/          # Base UI components (Radix UI based)
├── hooks/           # Custom React hooks
└── lib/             # Utilities and configuration

content/             # Markdown content and media files
public/              # Static assets including copied images
scripts/             # Utility scripts (e.g., copy-to-public.mjs)
```