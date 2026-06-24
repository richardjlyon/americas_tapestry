import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getAllTapestries } from '@/lib/tapestries';
import { getTeamGroups, getTeamMembersByGroup } from '@/lib/team';
import { getAllBlogPosts, blogCategories } from '@/lib/blog';
import { getAllSponsors } from '@/lib/sponsors';
import { getAllStateSlugs } from '@/lib/stitchers';

// Top-level routes without dynamic params.
const STATIC_PATHS = [
  '',
  '/about',
  '/tapestries',
  '/team',
  '/news',
  '/exhibitions',
  '/sponsors',
  '/contact',
  '/resources',
  '/resources/glossary',
  '/resources/educational',
  '/resources/artefacts',
  '/stitchers',
  '/gallery',
  '/privacy-policy',
];

const url = (p: string) => `${SITE_URL}${p}`;

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tapestries, groups, posts, sponsors] = await Promise.all([
    getAllTapestries(),
    getTeamGroups(),
    getAllBlogPosts(),
    getAllSponsors(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: url(p),
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : 0.7,
  }));

  const tapestryEntries: MetadataRoute.Sitemap = tapestries.map((t) => ({
    url: url(`/tapestries/${t.slug}`),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const teamEntries: MetadataRoute.Sitemap = [];
  for (const group of groups) {
    teamEntries.push({
      url: url(`/team/${group.slug}`),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    const members = await getTeamMembersByGroup(group.slug);
    for (const member of members) {
      teamEntries.push({
        url: url(`/team/${group.slug}/${member.slug}`),
        changeFrequency: 'yearly',
        priority: 0.4,
      });
    }
  }

  const newsEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: url(`/news/${post.slug}`),
    lastModified: validDate(post.date),
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = blogCategories.map((c) => ({
    url: url(`/news/category/${c.slug}`),
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  const sponsorEntries: MetadataRoute.Sitemap = sponsors.map((s) => ({
    url: url(`/sponsors/${s.slug}`),
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  const stitcherEntries: MetadataRoute.Sitemap = getAllStateSlugs().map(({ state }) => ({
    url: url(`/stitchers/${state}`),
    changeFrequency: 'monthly',
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...tapestryEntries,
    ...teamEntries,
    ...newsEntries,
    ...categoryEntries,
    ...sponsorEntries,
    ...stitcherEntries,
  ];
}
