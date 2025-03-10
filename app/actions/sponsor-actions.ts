"use server";

import { getSponsorTier, getSponsorTiers, getSponsorsByTier, getSponsorBySlug } from '@/lib/sponsors';
import { remark } from 'remark';
import html from 'remark-html';

export async function getTier(slug: string) {
  return getSponsorTier(slug);
}

export async function getSponsors(tierSlug: string) {
  return getSponsorsByTier(tierSlug);
}

export async function getSponsor(slug: string) {
  return getSponsorBySlug(slug);
}

export async function getMarkdownHtml(content: string) {
  try {
    const processedContent = await remark().use(html).process(content);
    return processedContent.toString();
  } catch (error) {
    console.error('Error processing markdown:', error);
    return `<p>${content}</p>`;
  }
}

export async function getFormattedTierName(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getSponsorTierData(tierSlug: string) {
  const tier = await getTier(tierSlug);
  const sponsors = await getSponsors(tierSlug);
  
  return {
    tier,
    sponsors
  };
}

export async function getSponsorData(slug: string) {
  const sponsor = await getSponsor(slug);
  let tierInfo = null;
  let formattedTierName = '';
  let contentHtml = '';
  
  if (sponsor) {
    contentHtml = await getMarkdownHtml(sponsor.content);
    if (sponsor.tierSlug) {
      tierInfo = await getTier(sponsor.tierSlug);
      formattedTierName = await getFormattedTierName(sponsor.tierSlug);
    }
  }
  
  return {
    sponsor,
    tierInfo,
    formattedTierName,
    contentHtml
  };
}