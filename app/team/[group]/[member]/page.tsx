import { getTeamGroups, getTeamMembersByGroup } from '@/lib/team';
import { getTeamMemberData } from '@/app/actions/team-actions';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';
import PersonCard from '@/components/team/person-card';
import html from 'remark-html';
import { remark } from 'remark';

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

export default async function TeamMemberPage({
  params,
}: { params: { group: string; member: string } }) {
  // Use a server action to fetch all the data we need
  const { member, contentHtml, formattedGroupName, group } =
    await getTeamMemberData(params.group, params.member);

  if (!member || !group) {
    notFound();
  }

  // Convert markdown to HTML for project director bio
  let directorBioHtml = '';
  if (member) {
    const processedContent = await remark().use(html).process(member.content);
    directorBioHtml = processedContent.toString();
  }

  const imageSrc =
    member.imagePath ||
    `/placeholder.svg?height=800&width=600&text=${encodeURIComponent(member.name)}`;

  // Extract only the properties we need, excluding 'state'
  const personDetails = {
    name: member.name,
    role: member.role,
    imagePosition: member.imagePosition,
  };

  // Render the member content with the data
  return (
    <PageSection paddingTop="none" paddingBottom="large">
      <h1 className="page-heading ">{group.name}</h1>

      <PersonCard
        personImageSrc={imageSrc}
        person={personDetails}
        personBioHtml={directorBioHtml}
      />
    </PageSection>
  );
}
