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
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">The Hands</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          {data.name} Stitchers
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          The volunteers who stitched the {data.name} panel of America's
          Tapestry.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <PageSection spacing="normal" background="colonial-oxblood">
        <ReadingContainer width="content" background="paper">
          <StitcherSections
            stateDirectors={data.stateDirectors}
            coreVolunteers={data.coreVolunteers}
            guestVolunteers={data.guestVolunteers}
          />
        </ReadingContainer>
      </PageSection>
    </div>
  );
}
