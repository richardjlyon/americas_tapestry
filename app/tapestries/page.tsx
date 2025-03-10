import Link from 'next/link';
import { TapestryCard } from '@/components/tapestry-card';
import { InteractiveColoniesMap } from '@/components/interactive-colonies-map';
import { InteractiveTimeline } from '@/components/interactive-timeline';
import { ColonialDataExplorer } from '@/components/colonial-data-explorer';
import { getAllTapestries } from '@/lib/tapestries';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export default function TapestriesPage() {
  const tapestries = getAllTapestries();

  return (
    <>
      <PageSection background="colonial-parchment">
        <h1 className="page-heading">America's Tapestry Collection</h1>

        <p className="lead-text text-center">
          Explore our complete collection of tapestries, each telling a lesser
          known, often overlooked contribution to our nation's journey towards
          Independence. These meticulously crafted panels represent the threads
          that, when woven together, form the rich tapestry of our nation's
          history and identity.
        </p>
      </PageSection>

      {/* Colonial Map Section */}
      <PageSection background="colonial-stone">
        <h2 className="section-title text-center">
          The Original Thirteen Colonies
        </h2>
        <p className="lead-text text-colonial-navy/80 text-center">
          Explore the tapestries representing the original thirteen colonies.
          Click on a colony to view its tapestry.
        </p>
        <div className="mt-8">
          <InteractiveColoniesMap tapestries={tapestries} />
        </div>
      </PageSection>

      {/* Timeline Section */}
      <PageSection background="colonial-parchment">
        <h2 className="section-title text-center">Colonial America Timeline</h2>
        <p className="lead-text text-colonial-navy/80 text-center">
          Explore key events in colonial American history and see how they
          connect to our tapestry collection.
        </p>
        <div className="mt-8">
          <InteractiveTimeline tapestries={tapestries} />
        </div>
      </PageSection>

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
      <PageSection background="colonial-stone">
        <h2 className="section-title text-center">All Available Tapestries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          {tapestries.map((tapestry) => (
            <TapestryCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </PageSection>
    </>
  );
}
