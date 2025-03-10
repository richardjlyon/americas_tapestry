import { getTeamGroups, getTeamMembersByGroup } from '@/lib/team';
import { getTeamMemberData } from '@/app/actions/team-actions';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

  // Render the member content with the data
  return (
    <PageSection background="colonial-parchment">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
        >
          <Link href={`/team/${params.group}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {formattedGroupName}
          </Link>
        </Button>
      </div>
      <h1 className="page-heading md:mb-16">State Director</h1>

      <PersonCard
        personImageSrc={imageSrc}
        person={member}
        personBioHtml={directorBioHtml}
      />
    </PageSection>
  );
}
