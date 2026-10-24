/**
 * The tour ends in 2030 (Richard, 24 Oct 2026: "2030").
 *
 * Real bug this catches: the live home page said "now touring the nation
 * through 2028" in the hero and "a three-year exhibition through to 2030"
 * further down. Every place that states when the whole tour ends must say
 * 2030. One venue's own dates (for example "November 2027 through February
 * 2028") are not the tour end and are not checked here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DESCRIPTION } from '@/lib/seo';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\s+/g, ' ');

// Each file and the tour-end phrase it must carry.
const cases: Array<[string, string]> = [
  ['src/components/features/home/gallery-hero.tsx', 'now touring the nation through 2030.'],
  ['src/components/features/home/hero-spotlight.tsx', "'The Exhibition Tour · 2026–2030'"],
  ['src/components/features/home/project-strip.tsx', 'three-year exhibition through to 2030.'],
  ['src/app/(site)/page.tsx', 'three-year exhibition through to 2030.'],
  ['src/app/(site)/about/page.tsx', 'exhibition, running through 2030.'],
  ['src/app/(site)/about/page.tsx', 'to historic venues through 2030.'],
  ['src/app/(site)/exhibitions/page.tsx', 'stop on the 2026–2030 exhibition tour.'],
  ['src/app/(site)/exhibitions/page.tsx', 'touring the original colonies through 2030.'],
  ['content/exhibitions/passaic-county/index.md', 'original thirteen colonies through 2030.'],
];

// Tour-end wording with 2028 that must be gone from these files.
const OLD_TOUR_END = /(through|until)( to)? 2028\b|2026–2028/;

describe('tour end year is 2030 everywhere', () => {
  it.each(cases)('%s says "%s"', (file, phrase) => {
    expect(read(file)).toContain(phrase);
  });

  it.each(Array.from(new Set(cases.map(([f]) => f))))('%s has no 2028 tour end left', (file) => {
    expect(read(file)).not.toMatch(OLD_TOUR_END);
  });

  it('the site-wide description ends the tour in 2030', () => {
    expect(SITE_DESCRIPTION).toMatch(/through 2030\.$/);
    expect(SITE_DESCRIPTION).not.toMatch(OLD_TOUR_END);
  });
});
