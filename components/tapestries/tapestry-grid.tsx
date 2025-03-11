'use client';

import { TapestryCard } from '@/components/tapestry-card';
import { SectionHeader } from '@/components/ui/section-header';
import type { TapestryEntry } from '@/lib/tapestries';

interface TapestryGridProps {
  tapestries: TapestryEntry[];
}

export function TapestryGrid({ tapestries }: TapestryGridProps) {
  return (
    <>
      <SectionHeader
        title="The Tapestries"
        description="Explore the stories behind the tapestries, and the people who designed and made them."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
        {tapestries.map((tapestry) => (
          <TapestryCard key={tapestry.slug} tapestry={tapestry} />
        ))}
      </div>
    </>
  );
}
