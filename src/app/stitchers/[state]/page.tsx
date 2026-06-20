import { notFound } from 'next/navigation';
import {
  getAllStateSlugs,
  getStateStitchers,
} from '@/lib/stitchers';
import { StitcherSections } from '@/components/features/stitchers/stitcher-sections';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';

export function generateStaticParams() {
  return getAllStateSlugs();
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
