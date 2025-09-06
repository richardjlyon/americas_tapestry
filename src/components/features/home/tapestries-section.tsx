import { TapestryCard } from '@/components/features/tapestries/tapestry-card';
import { SectionHeader } from '@/components/ui/section-header';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { TapestryEntry } from '@/lib/tapestries';
import { Button } from '@/components/ui/button';
interface TapestriesSectionProps {
  randomTapestries: Array<TapestryEntry>;
}

export function TapestriesSection({
  randomTapestries,
}: TapestriesSectionProps) {
  return (
    <>
      <SectionHeader
        title="The Tapestry Collection"
        description={
          <>
            <em>America's Tapestry</em> is composed of 13 individual embroidered
            panels, each 35" × 45". They tell the story of lesser known, often
            overlooked contributions to our nation's journey towards
            independence. Together, they honor the traditions, struggles, and
            triumphs that have shaped our collective identity.
          </>
        }
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {randomTapestries.map((tapestry) => (
            <TapestryCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </div>

      <div className="text-center mt-10 md:mt-12">
        <Button
          asChild
          variant="colonial-primary"
          size="lg"
          className="text-base"
        >
          <Link href="/tapestries">
            Explore All Thirteen Colonies{' '}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </>
  );
}
