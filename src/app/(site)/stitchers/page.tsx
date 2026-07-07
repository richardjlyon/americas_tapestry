import { getAggregatedStitchers } from '@/lib/stitchers';
import { StitcherSections } from '@/components/features/stitchers/stitcher-sections';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';

export const metadata = {
  title: 'All Stitchers',
};

export default function AllStitchersPage() {
  const sections = getAggregatedStitchers();

  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">The Hands</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          All Stitchers
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          The volunteers who stitched America's Tapestry, from every one of the
          thirteen colonies.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <PageSection spacing="normal" background="colonial-oxblood">
        <ReadingContainer width="content" background="paper">
          <StitcherSections {...sections} />
        </ReadingContainer>
      </PageSection>
    </div>
  );
}
