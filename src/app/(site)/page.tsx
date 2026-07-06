import Link from 'next/link';
import { GalleryHero } from '@/components/features/home/gallery-hero';
import { ProjectStrip } from '@/components/features/home/project-strip';
import { ShopStrip } from '@/components/features/home/shop-strip';
import { TapestryPlate } from '@/components/features/home/tapestry-plate';
import { LatestNewsSection } from '@/components/features/home/latest-news-section';
import { GetInTouchSection } from '@/components/features/home/get-in-touch-section';
import { getAllTapestries } from '@/lib/tapestries';
import {
  getAllExhibitions,
  getExhibitionSpotlight,
} from '@/lib/exhibitions';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Story of the 13 Colonies in Embroidery — Now on Exhibition',
  description:
    "America's Tapestry tells the stories of the original thirteen colonies through embroidery. Created for America's 250th anniversary, the completed panels are now touring on a two-year exhibition through 2028.",
  path: '/',
});

// Re-render daily so the exhibition spotlight tracks the calendar without a deploy.
export const revalidate = 86400;

export default async function Home() {
  const [tapestries, exhibitions] = await Promise.all([
    getAllTapestries(),
    getAllExhibitions(),
  ]);
  const spotlight = getExhibitionSpotlight(exhibitions);

  const withImages = tapestries.filter((t) => t.imagePath || t.thumbnail);
  const shuffled = [...withImages].sort(() => 0.5 - Math.random());
  const heroTapestry = shuffled[0];
  const plateTapestries = shuffled.slice(1, 4);

  return (
    <div className="bg-colonial-navy">
      <GalleryHero
        spotlight={spotlight}
        backdrop={
          heroTapestry
            ? {
                src: heroTapestry.imagePath || heroTapestry.thumbnail,
                alt: heroTapestry.title,
              }
            : null
        }
      />

      <section className="container mx-auto py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Collection</span>
          <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
            Thirteen colonies, thirteen panels
          </h2>
          <p className="gallery-lead mx-auto mt-4">
            Each panel is 35&Prime; × 45&Prime; of hand embroidery, telling a
            lesser-known story of its colony&rsquo;s road to independence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {plateTapestries.map((tapestry) => (
            <TapestryPlate key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/tapestries"
            className="inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
          >
            Explore all thirteen colonies →
          </Link>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <ProjectStrip />
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <LatestNewsSection />
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <ShopStrip />
      </section>

      <section className="container mx-auto pb-24 pt-8">
        <GetInTouchSection />
      </section>
    </div>
  );
}
