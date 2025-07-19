"use server";

import { /* getSponsorTier, getSponsorTiers, getSponsorsByTier, */ getSponsorBySlug, getAllSponsors } from '@/lib/sponsors';
import { markdownToHtml } from '@/lib/markdown';

// export async function getTier(slug: string) {
//   return getSponsorTier(slug);
// }

// export async function getSponsors(tierSlug: string) {
//   return getSponsorsByTier(tierSlug);
// }

export async function getSponsor(slug: string) {
  return getSponsorBySlug(slug);
}

export async function getMarkdownHtml(content: string) {
  return markdownToHtml(content);
}

export async function getFormattedTierName(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// export async function getSponsorTierData(tierSlug: string) {
//   const tier = await getTier(tierSlug);
//   const sponsors = await getSponsors(tierSlug);
//   
//   return {
//     tier,
//     sponsors
//   };
// }

export async function getSponsorData(slug: string) {
  const sponsor = await getSponsor(slug);
  let contentHtml = '';
  
  if (sponsor) {
    contentHtml = await getMarkdownHtml(sponsor.content);
  }
  
  return {
    sponsor,
    contentHtml
  };
}

export async function getAllSponsorsData() {
  return getAllSponsors();
}