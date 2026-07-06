import { getTeamGroups, getTeamData } from "@/lib/team";
import { GroupContent } from "@/components/features/team/group-content";
import { notFound } from "next/navigation";
import { PageSection } from "@/components/ui/page-section";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const groups = await getTeamGroups();
  return groups.map((group) => ({
    group: group.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: groupSlug } = await params;
  const groups = await getTeamGroups();
  const group = groups.find((g) => g.slug === groupSlug);

  if (!group) {
    return { title: "Team | America's Tapestry" };
  }

  return pageMetadata({
    title: group.name,
    description: `Meet the ${group.name} behind America's Tapestry.`,
    path: `/team/${groupSlug}`,
  });
}

export default async function TeamGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  // Use a server action to fetch the data
  const { group: groupSlug } = await params;
  const { group, members } = await getTeamData(groupSlug);

  if (!group) {
    notFound();
  }

  // Render the content wrapped in a page section (consistent with main team page)
  return (
    <PageSection paddingTop="none" background="colonial-oxblood">
      <GroupContent group={group} members={members} />
    </PageSection>
  );
}
