import Link from "next/link";
import { GalleryHero } from "@/components/features/home/gallery-hero";
import type { SlideImage } from "@/components/features/home/hero-slider";
import { ProjectStrip } from "@/components/features/home/project-strip";
import { ShopStrip } from "@/components/features/home/shop-strip";
import { TapestryPlate } from "@/components/features/home/tapestry-plate";
import { LatestNewsSection } from "@/components/features/home/latest-news-section";
import { GetInTouchSection } from "@/components/features/home/get-in-touch-section";
import { getAllTapestries } from "@/lib/tapestries";
import { getAllExhibitions, getExhibitionSpotlight } from "@/lib/exhibitions";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The Story of the 13 Colonies in Embroidery — Now on Exhibition",
  description:
    "America's Tapestry tells the stories of the original thirteen colonies through embroidery. Created for America's 250th anniversary, the completed panels are now touring on a three-year exhibition through to 2030.",
  path: "/",
});

// Keep this page fully static — prerendered at build only.
//
// Do NOT add `revalidate`/ISR here. The hero and plates resolve their panel
// images by scanning the filesystem (getAllTapestries → fs.readdirSync of
// public/images/tapestries/<slug>). On Vercel, public/ assets are served from
// the CDN and are NOT present in the serverless function bundle, so an ISR
// regeneration on that runtime finds no files and every panel falls back to the
// placeholder — which then gets cached. Static build-time rendering has the
// full filesystem, so images resolve correctly. The exhibition spotlight now
// advances on deploy rather than daily; redeploy to refresh it.

// Candid photographs — stitchers at work and public tapestry talks — served
// from R2 via the image manifest (see scripts/optimize-and-upload.mjs). These
// join every tapestry panel in the hero carousel rotation.
const HERO_CANDIDS: SlideImage[] = [
  {
    src: "/images/candids/stitching-circle-group.jpg",
    alt: "A circle of volunteer stitchers working together around a table, an embroidered fox taking shape on the linen",
  },
  {
    src: "/images/candids/stitcher-denim-hoopwork.jpg",
    alt: "A volunteer stitcher embroidering a hooped panel at a table spread with coloured threads",
  },
  {
    src: "/images/candids/stitchers-threading-needle.jpg",
    alt: "Two stitchers concentrate on their needlework, one drawing thread through the linen",
  },
  {
    src: "/images/candids/stitchers-lamplight.jpg",
    alt: "Two stitchers share a task under a work lamp, embroidering a landscape panel",
  },
  {
    src: "/images/candids/maryland-tapestry-talk.jpg",
    alt: "Stitchers at work on the Maryland panel during a public tapestry talk",
  },
  {
    src: "/images/candids/new-york-tapestry-talk.jpg",
    alt: "A stitcher works on the New York panel as visitors look on at a public event",
  },
  {
    src: "/images/candids/massachusetts-stitching-portrait.jpg",
    alt: "A stitcher embroidering a portrait on the Massachusetts panel",
  },
  {
    src: "/images/candids/connecticut-stitching-closeup.jpg",
    alt: "Close-up of a stitcher's hands embroidering a scene on the Connecticut panel",
  },
  {
    src: "/images/candids/new-hampshire-pine-tree-riot.jpg",
    alt: 'Embroidered labels reading "Pine Tree Riot" pinned to the New Hampshire panel in progress',
  },
  {
    src: "/images/candids/pennsylvania-panel-detail.jpg",
    alt: "A detail of the Pennsylvania panel — an embroidered colonial building with shuttered windows",
  },
  {
    src: "/images/candids/rhode-island-figure-detail.jpg",
    alt: "An embroidered colonial officer in a blue coat, a detail from the Rhode Island panel",
  },
];

export default async function Home() {
  const [tapestries, exhibitions] = await Promise.all([
    getAllTapestries(),
    getAllExhibitions(),
  ]);
  const spotlight = getExhibitionSpotlight(exhibitions);

  const withImages = tapestries.filter((t) => t.imagePath || t.thumbnail);
  // Deliberate: server-only shuffle re-picks order at each build.
  // Never runs on the client, so render purity is moot.
  // eslint-disable-next-line react-hooks/purity
  const shuffled = [...withImages].sort(() => 0.5 - Math.random());

  // The hero carousel rotates through EVERYTHING: every tapestry panel plus the
  // candid stitching/tapestry-talk photographs, interleaved in a fresh order at
  // each build (see HERO_CANDIDS above).
  const panelBackdrops: SlideImage[] = shuffled.map((t) => ({
    src: t.imagePath || t.thumbnail,
    alt: `The ${t.title} tapestry panel`,
  }));
  // eslint-disable-next-line react-hooks/purity
  const heroBackdrops = [...panelBackdrops, ...HERO_CANDIDS].sort(
    () => 0.5 - Math.random(),
  );

  // The "Thirteen colonies" plate grid keeps its own independent pick of three
  // panels.
  const plateTapestries = shuffled.slice(0, 3);

  return (
    <div className="bg-colonial-navy">
      <GalleryHero spotlight={spotlight} backdrops={heroBackdrops} />

      {/* What the project is — first thing after the hero, per Richard:
          a first-time visitor must immediately understand the site. */}
      <section className="container mx-auto py-16 md:py-24">
        <ProjectStrip />
      </section>

      {/* Sections alternate navy / navyLight so each reads as its own room. */}
      <section className="bg-colonial-navyLight">
        <div className="container mx-auto py-16 md:py-24">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="eyebrow eyebrow-gold">The Collection</span>
            <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
              Thirteen colonies, thirteen panels
            </h2>
            <p className="gallery-lead mx-auto mt-3">
              Each panel is 40&Prime; × 50&Prime; of hand embroidery, telling a
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
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <LatestNewsSection />
      </section>

      <section className="bg-colonial-navyLight">
        <div className="container mx-auto py-16 md:py-24">
          <ShopStrip />
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 pb-24">
        <GetInTouchSection />
      </section>
    </div>
  );
}
