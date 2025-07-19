import Link from 'next/link';
import { TapestryCard } from '@/components/features/tapestries/tapestry-card';
import { InteractiveColoniesMap } from '@/components/features/tapestries/interactive-colonies-map';
import { InteractiveTimeline } from '@/components/features/tapestries/interactive-timeline';
import { TapestryGrid } from '@/components/features/tapestries/tapestry-grid';
import { ColonialDataExplorer } from '@/components/shared/colonial-data-explorer';
import { getAllTapestries } from '@/lib/tapestries';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';
export default function TapestriesPage() {
  const tapestries = getAllTapestries();

  return (
    <>
      <h1 className="page-heading">America's Tapestry Collection</h1>

      <div className="lead-text">
        Explore our complete collection of tapestries, each telling a lesser
        known, often overlooked contribution to our nation's journey towards
        independence. These meticulously crafted panels represent the threads
        that, when woven together, form the rich tapestry of our nation's
        history and identity.
      </div>

      {/* Colonial Map Section */}
      <PageSection background="vintage-paper" paddingTop="medium">
        <InteractiveColoniesMap tapestries={tapestries} />
      </PageSection>

      {/* Timeline Section */}
      {/* <PageSection paddingTop="small" background="colonial-parchment">
        <InteractiveTimeline tapestries={tapestries} />
      </PageSection> */}

      {/* Data Explorer Section */}
      {/* <ContentCard className="mt-12 p-6 md:p-8">
      <h2 className="section-title text-center">Colonial Data Explorer</h2>
      <p className="lead-text text-colonial-navy/80 text-center">
          Analyze and compare data across all colonies through different
          visualization methods.
      </p>
      <div className="mt-8">
          <ColonialDataExplorer tapestries={tapestries} />
      </div>
      </ContentCard> */}

      {/* All Tapestries Grid */}
      <PageSection paddingTop="small">
        <TapestryGrid tapestries={tapestries} />
      </PageSection>
    </>
  );
}
