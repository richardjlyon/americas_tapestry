/**
 * Characterization tests: pin the CURRENT observable behavior of the
 * tapestries and team content loaders before the Phase 1 refactor
 * (docs/superpowers/plans/2026-07-06-phase1-foundation-cleanup.md).
 * They run against the real content/ directory. If one of these fails
 * after a refactor task, the refactor changed behavior — fix the code,
 * not the test (except where a task explicitly strengthens a test).
 */
// team.ts transitively imports markdown.ts, which pulls in ESM-only packages
// Jest can't transform. None of the functions under test here call
// markdownToHtml, so stub it (same pattern as exhibitions-date-range.test.ts).
jest.mock('@/lib/markdown', () => ({ markdownToHtml: () => '' }));

import { getAllTapestries, getTapestryBySlug } from '@/lib/tapestries';
import {
  getTeamGroups,
  getTeamMembersByGroup,
  getTeamMembersByState,
} from '@/lib/team';

describe('tapestries loader (characterization)', () => {
  it('loads all 13 colonies sorted by title, finished, with images', async () => {
    const all = await getAllTapestries();
    expect(all.map((t) => t.slug).sort()).toMatchSnapshot('tapestry-slugs');
    expect(all).toHaveLength(13);
    const titles = all.map((t) => t.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    for (const t of all) {
      expect(t.status).toBe('Finished');
      expect(t.title).toBeTruthy();
      expect(t.summary).toBeTruthy();
      expect(t.thumbnail).toBeTruthy();
      expect(t.imagePath).toBeTruthy();
      expect(t.content.length).toBeGreaterThan(100);
    }
  });

  it('resolves stable image paths per slug', async () => {
    const all = await getAllTapestries();
    const paths = Object.fromEntries(
      all.map((t) => [
        t.slug,
        {
          thumbnail: t.thumbnail,
          imagePath: t.imagePath,
          artworkPath: t.artworkPath,
          audioPath: t.audioPath,
        },
      ]),
    );
    expect(paths).toMatchSnapshot('tapestry-image-paths');
  });

  it('getTapestryBySlug agrees with getAllTapestries entry field-by-field', async () => {
    const all = await getAllTapestries();
    for (const entry of all) {
      const single = await getTapestryBySlug(entry.slug);
      expect(single).not.toBeNull();
      // NOTE: `thumbnail` deliberately excluded — the two code paths
      // currently disagree on thumbnail selection. Task 5 unifies them
      // and adds the thumbnail assertion.
      const fields = [
        'slug',
        'title',
        'summary',
        'status',
        'background_color',
        'imagePath',
        'artworkPath',
        'audioPath',
        'audioDescription',
        'colony',
        'content',
      ] as const;
      for (const f of fields) {
        expect(single![f]).toEqual(entry[f]);
      }
      expect(single!.timelineEvents).toEqual(entry.timelineEvents);
      expect(single!.resources).toEqual(entry.resources);
    }
  });
});

describe('team loader (characterization)', () => {
  it('returns groups in order with required fields', async () => {
    const groups = await getTeamGroups();
    expect(groups.map((g) => g.slug).sort()).toMatchSnapshot('team-group-slugs');
    for (const g of groups) {
      expect(g.name).toBeTruthy();
      expect(g.description).toBeTruthy();
    }
    const orders = groups.map((g) => g.order || 999);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('returns members per group with name/role/groupSlug, excluding group indexes', async () => {
    const groups = await getTeamGroups();
    const counts: Record<string, number> = {};
    for (const g of groups) {
      const members = await getTeamMembersByGroup(g.slug);
      counts[g.slug] = members.length;
      for (const m of members) {
        expect(m.name).toBeTruthy();
        expect(m.role).toBeTruthy();
        expect(m.groupSlug).toBe(g.slug);
        expect(m.slug).not.toBe(g.slug); // group index never leaks in as a member
      }
    }
    expect(counts).toMatchSnapshot('team-member-counts');
  });

  it('resolves state rosters (Virginia)', async () => {
    const virginia = await getTeamMembersByState('Virginia');
    expect(virginia.stateDirectors.length).toBeGreaterThan(0);
    expect(virginia.stitchers.length).toBeGreaterThan(0);
    expect({
      stateDirectors: virginia.stateDirectors.length,
      historicalPartners: virginia.historicalPartners.length,
      illustrators: virginia.illustrators.length,
      stitchingGroups: virginia.stitchingGroups.length,
      stitchers: virginia.stitchers.length,
      commissionPartners: virginia.commissionPartners.length,
      stitchingVenues: virginia.stitchingVenues.length,
    }).toMatchSnapshot('virginia-roster-counts');
  });
});
