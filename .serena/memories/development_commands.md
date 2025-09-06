# Development Commands

## Development Server
- `npm run dev` - Start development server
- `npm run dev:linux` - Start with Chromium for debugging (Linux)
- `npm run dev:mac` - Standard dev command for Mac

## Build and Deploy
- `npm run build` - Build for production
- `npm run build:clean` - Clean build (removes .next directory first)
- `npm run start` - Start production server
- `npm run start:clean` - Clean build and start

## Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Biome

## Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:components` - Run component tests
- `npm run test:quick` - Run quick smoke tests

## Content Management
- `node scripts/copy-to-public.mjs` - Copy content images to public directory

## Analysis
- `npm run analyze` - Bundle analyzer
- `npm run perf` - Performance testing