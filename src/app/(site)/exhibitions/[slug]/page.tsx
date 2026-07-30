import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ExternalLink, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import {
  getAllExhibitions,
  getExhibitionBySlug,
  formatDateRange,
  getExhibitionStatus,
  type ExhibitionStatus,
} from '@/lib/exhibitions';
import { ExhibitionGallery } from '@/components/features/exhibitions/exhibition-gallery';
import { getImagePath } from '@/lib/image-utils';
import { markdownToHtml } from '@/lib/markdown';
import { pageMetadata } from '@/lib/seo';

// Re-render daily so the on-view / upcoming / past label tracks the calendar.
export const revalidate = 86400;

export async function generateStaticParams() {
  const exhibitions = await getAllExhibitions();
  return exhibitions.map((exhibition) => ({ slug: exhibition.slug }));
}

/** Placeholder bodies ("Lorum Ipsum") shouldn't render as prose. */
function hasRealBody(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.length > 0 && !/^lor[ue]m ipsum\.?$/i.test(trimmed);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await getExhibitionBySlug(slug);

  if (!exhibition) {
    return { title: "Venue Not Found | America's Tapestry" };
  }

  const description = hasRealBody(exhibition.content)
    ? exhibition.excerpt
    : `See America's Tapestry at the ${exhibition.name} in ${exhibition.state} — ${formatDateRange(exhibition.startDate, exhibition.endDate)}.`;

  return pageMetadata({
    title: exhibition.name,
    description,
    path: `/exhibitions/${slug}`,
    image: exhibition.imagePath,
  });
}

const STATUS_LABEL: Record<ExhibitionStatus, string> = {
  current: 'On view now',
  upcoming: 'Upcoming',
  past: 'Past exhibition',
};

const STATUS_CLASS: Record<ExhibitionStatus, string> = {
  current: 'bg-colonial-gold/15 text-colonial-gold ring-colonial-gold/30',
  upcoming: 'text-colonial-parchment/70 ring-white/15',
  past: 'text-colonial-parchment/50 ring-white/10',
};

export default async function ExhibitionVenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibition = await getExhibitionBySlug(slug);

  if (!exhibition) {
    notFound();
  }

  const status = getExhibitionStatus(exhibition);
  const showBody = hasRealBody(exhibition.content);
  const contentHtml = showBody ? await markdownToHtml(exhibition.content) : '';

  return (
    <div className="bg-colonial-navy">
      <div className="container mx-auto space-y-14 py-16 md:space-y-20 md:py-24">
        <Link
          href="/exhibitions"
          className="inline-flex items-center gap-2 text-sm font-medium text-colonial-parchment/70 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          The Exhibition Tour
        </Link>

        {/* Venue identity */}
        <header className="grid items-start gap-10 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-14">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate-lg">
            <Image
              src={getImagePath(exhibition.imagePath)}
              alt={`${exhibition.name}`}
              fill
              sizes="(min-width: 768px) 26rem, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="eyebrow eyebrow-gold">
                {formatDateRange(exhibition.startDate, exhibition.endDate)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ${STATUS_CLASS[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium uppercase tracking-wide text-colonial-parchment/60">
              {exhibition.state}
            </p>
            <h1 className="gallery-heading mt-1 text-4xl md:text-5xl">
              {exhibition.name}
            </h1>

            <p className="mt-4 flex items-start gap-2 text-colonial-parchment/70">
              <MapPin
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-colonial-gold"
                aria-hidden="true"
              />
              {exhibition.address}
            </p>

            {exhibition.hours.length > 0 && (
              <div className="mt-5 flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-colonial-gold"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-colonial-parchment/60">
                    Gallery hours
                  </p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-colonial-parchment/70">
                    {exhibition.hours.map((slot) => (
                      <div key={slot.days} className="contents">
                        <dt>{slot.days}</dt>
                        <dd className="tabular-nums">{slot.time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            <div className="gold-threshold mt-6" />

            {exhibition.moreInfo && (
              <a
                href={exhibition.moreInfo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
              >
                Plan your visit
                <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </header>

        {/* Narrative */}
        {showBody && (
          <section className="mx-auto w-full max-w-3xl">
            <div
              className="prose prose-lg prose-invert max-w-none prose-p:font-serif prose-p:leading-relaxed prose-p:text-colonial-parchment/80"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </section>
        )}

        {/* On-view photographs */}
        {exhibition.gallery.length > 0 && (
          <section className="mx-auto w-full max-w-5xl">
            <span className="eyebrow eyebrow-gold">On view</span>
            <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
              Inside the exhibition
            </h2>
            <div className="gold-threshold mt-3" />
            <div className="mt-8">
              <ExhibitionGallery images={exhibition.gallery} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
