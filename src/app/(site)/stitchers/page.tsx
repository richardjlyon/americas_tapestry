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
    <>
      <h1 className="page-heading">All Stitchers</h1>
      <PageSection spacing="normal">
        <ReadingContainer width="content" background="paper">
          <StitcherSections {...sections} />
        </ReadingContainer>
      </PageSection>
    </>
  );
}
