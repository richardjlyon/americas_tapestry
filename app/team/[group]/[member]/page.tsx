import { getTeamGroups, getTeamMembersByGroup } from '@/lib/team';
import { getTeamMemberData } from '@/app/actions/team-actions';
import { MemberContent } from '@/components/team/member-content';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  const groups = getTeamGroups();
  const params = [];

  for (const group of groups) {
    const members = getTeamMembersByGroup(group.slug);

    for (const member of members) {
      params.push({
        group: group.slug,
        member: member.slug,
      });
    }
  }

  return params;
}

export default async function TeamMemberPage({ params }: { params: { group: string; member: string } }) {
  // Use a server action to fetch all the data we need
  const { member, contentHtml, formattedGroupName, group } = await getTeamMemberData(
    params.group,
    params.member
  );
  
  if (!member || !group) {
    notFound();
  }
  
  // Render the member content with the data
  return (
    <PageSection background="colonial-parchment">
      <MemberContent 
        member={member} 
        contentHtml={contentHtml}
        groupSlug={params.group}
        groupName={formattedGroupName}
      />
    </PageSection>
  );
}
