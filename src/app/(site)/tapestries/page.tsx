import { TapestryCard } from '@/components/features/tapestries/tapestry-card';
import { getAllTapestries } from '@/lib/tapestries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Tapestry Collection',
  description:
    "Explore all thirteen embroidered panels of America's Tapestry — one for each original colony, photographed as fine art.",
  path: '/tapestries',
});

export default async function TapestriesPage() {
  const tapestries = await getAllTapestries();

  return (
    <div className="bg-colonial-navy">
      <div className="container mx-auto py-16 md:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Collection</span>
          <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
            America&rsquo;s Tapestry Collection
          </h1>
          <p className="gallery-lead mx-auto mt-3">
            Thirteen panels, one for each original colony — each telling a
            lesser-known story of our nation&rsquo;s journey towards
            independence.
          </p>
          <div className="gold-threshold mx-auto mt-5" />
        </header>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {tapestries.map((tapestry) => (
            <TapestryCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </div>
    </div>
  );
}
