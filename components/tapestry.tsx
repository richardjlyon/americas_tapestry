import { TapestryCard } from '@/components/tapestry-card';
import type { TapestryEntry } from '@/lib/tapestries';

interface TapestryProps {
  tapestries: TapestryEntry[];
}

export function Tapestry({ tapestries }: TapestryProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <p className="lead-text">
          <em>America’s Tapestry</em> is composed of 13 individual embroidered
          panels, each 35" × 45". They tell the story of lesser known, often
          overlooked contributions to our nation’s journey towards Independence.
          Together, they honor the traditions, struggles, and triumphs that have
          shaped our collective identity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {tapestries.map((tapestry) => (
          <TapestryCard key={tapestry.slug} tapestry={tapestry} />
        ))}
      </div>
    </div>
  );
}
