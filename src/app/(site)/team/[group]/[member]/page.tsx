import {
  getTeamGroups,
  getTeamMembersByGroup,
  getTeamMemberData,
} from '@/lib/team';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';
import { MemberCard } from '@/components/features/team/member-card';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const groups = await getTeamGroups();
  const params = [];

  for (const group of groups) {
    const members = await getTeamMembersByGroup(group.slug);

    for (const member of members) {
      params.push({
        group: group.slug,
        member: member.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; member: string }>;
}): Promise<Metadata> {
  const { group: groupSlug, member: memberSlug } = await params;
  const { member, group } = await getTeamMemberData(groupSlug, memberSlug);

  if (!member || !group) {
    return { title: "Team Member Not Found | America's Tapestry" };
  }

  return pageMetadata({
    title: member.name,
    description: `${member.name} — ${member.role}, ${group.name} for America's Tapestry.`,
    path: `/team/${groupSlug}/${memberSlug}`,
  });
}

export default async function TeamMemberPage({
  params,
}: { params: Promise<{ group: string; member: string }> }) {
  // Fetch all the data we need for this member
  const { group: groupSlug, member: memberSlug } = await params;
  const { member, group, contentHtml } = await getTeamMemberData(
    groupSlug,
    memberSlug,
  );

  if (!member || !group) {
    notFound();
  }

  // Render the member content with the data
  return (
    <PageSection paddingTop="none" paddingBottom="large">
      <h1 className="page-heading ">{group.name}</h1>

      <MemberCard
        member={member}
        variant="full"
        width="two-thirds"
        contentHtml={contentHtml}
      />
    </PageSection>
  );
}
