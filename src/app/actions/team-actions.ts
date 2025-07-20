"use server";

import { getTeamGroup, getTeamMembersByGroup, getTeamMember } from '@/lib/team';
import { remark } from 'remark';
import html from 'remark-html';

export async function getGroup(slug: string) {
  return await getTeamGroup(slug);
}

export async function getMembers(groupSlug: string) {
  return await getTeamMembersByGroup(groupSlug);
}

export async function getMember(groupSlug: string, memberSlug: string) {
  return await getTeamMember(groupSlug, memberSlug);
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

export async function getFormattedGroupName(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getTeamData(groupSlug: string) {
  const group = await getGroup(groupSlug);
  const members = await getMembers(groupSlug);
  
  return {
    group,
    members
  };
}

export async function getTeamMemberData(groupSlug: string, memberSlug: string) {
  const member = await getMember(groupSlug, memberSlug);
  const group = await getGroup(groupSlug);
  const formattedGroupName = await getFormattedGroupName(groupSlug);
  
  let contentHtml = '';
  if (member) {
    contentHtml = await getMarkdownHtml(member.content);
  }
  
  return {
    member,
    group,
    formattedGroupName,
    contentHtml
  };
}