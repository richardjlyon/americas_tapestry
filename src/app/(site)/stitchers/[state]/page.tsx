import { notFound } from 'next/navigation';
import {
  getAllStateSlugs,
  getStateStitchers,
} from '@/lib/stitchers';
import { StitcherSections } from '@/components/features/stitchers/stitcher-sections';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllStateSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const data = getStateStitchers(state);

  if (!data) {
    return { title: "Stitchers | America's Tapestry" };
  }

  return pageMetadata({
    title: `${data.name} Stitchers`,
    description: `The volunteers who stitched the ${data.name} panel of America's Tapestry.`,
    path: `/stitchers/${state}`,
  });
}

export default async function StateStitchersPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const data = getStateStitchers(state);

  if (!data) {
    notFound();
  }

  return (
    <>
      <h1 className="page-heading">{data.name} Stitchers</h1>
      <PageSection spacing="normal">
        <ReadingContainer width="content" background="paper">
          <StitcherSections
            stateDirectors={data.stateDirectors}
            coreVolunteers={data.coreVolunteers}
            guestVolunteers={data.guestVolunteers}
          />
        </ReadingContainer>
      </PageSection>
    </>
  );
}
