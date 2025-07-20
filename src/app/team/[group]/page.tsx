import { getTeamGroups } from '@/lib/team';
import { getTeamData } from '@/app/actions/team-actions';
import { GroupContent } from '@/components/features/team/group-content';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  const groups = await getTeamGroups();
  return groups.map((group) => ({
    group: group.slug,
  }));
}

export default async function TeamGroupPage({
  params,
}: { params: Promise<{ group: string }> }) {
  // Use a server action to fetch the data
  const { group: groupSlug } = await params;
  const { group, members } = await getTeamData(groupSlug);

  if (!group) {
    notFound();
  }

  // Render the content wrapped in a page section (consistent with main team page)
  return (
    <PageSection paddingTop="none" background="colonial-parchment">
      <GroupContent group={group} members={members} />
    </PageSection>
  );
}
