import { TapestryCard } from '@/components/tapestry-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { TapestryEntry } from '@/lib/tapestries';

interface TapestriesSectionProps {
  randomTapestries: Array<TapestryEntry>;
}

export function TapestriesSection({
  randomTapestries,
}: TapestriesSectionProps) {
  return (
    <>
      <h2 className="section-title text-center mb-content-sm">
        The Tapestry Collection
      </h2>

      <div className="lead-text mb-content-md">
        <em>America's Tapestry</em> is composed of 13 individual embroidered
        panels, each 35" × 45". They tell the story of lesser known, often
        overlooked contributions to our nation's journey towards Independence.
        Together, they honor the traditions, struggles, and triumphs that have
        shaped our collective identity.
      </div>

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
          variant="outline"
          size="lg"
          className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
        >
          <Link href="/tapestries">
            Explore All Thirteen Colonies{' '}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}
