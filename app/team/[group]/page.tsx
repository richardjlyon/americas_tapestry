import { getTeamGroups } from '@/lib/team';
import { getTeamData } from '@/app/actions/team-actions';
import { GroupContent } from '@/components/team/group-content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const groups = getTeamGroups();
  return groups.map((group) => ({
    group: group.slug,
  }));
}

export default async function TeamGroupPage({ params }: { params: { group: string } }) {
  // Use a server action to fetch the data
  const { group, members } = await getTeamData(params.group);
  
  if (!group) {
    notFound();
  }
  
  // Render the content directly
  return <GroupContent group={group} members={members} />;
}
