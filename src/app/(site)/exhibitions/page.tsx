import {
  getAllExhibitions,
  groupExhibitionsByStatus,
} from '@/lib/exhibitions';
import { ExhibitionCard } from '@/components/features/exhibitions/exhibition-card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Visit',
  description:
    "Where to see America's Tapestry on display — the venue on view now and every upcoming stop on the 2026–2028 exhibition tour.",
  path: '/exhibitions',
});

// Re-render daily so now/next/past grouping tracks the calendar without a deploy.
export const revalidate = 86400;

function TourSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <span className="eyebrow eyebrow-gold">{eyebrow}</span>
      <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">{title}</h2>
      <div className="gold-threshold mt-3" />
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();
  const { current, upcoming, past } = groupExhibitionsByStatus(exhibitions);

  return (
    <div className="bg-colonial-navy">
      <div className="container mx-auto space-y-16 py-16 md:space-y-20 md:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Exhibition Tour</span>
          <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
            See America&rsquo;s Tapestry
          </h1>
          <p className="gallery-lead mx-auto mt-3">
            All thirteen panels are touring the original colonies through
            2028. Find the gallery nearest you.
          </p>
        </header>

        {current.length > 0 && (
          <TourSection eyebrow="On view now" title="Now showing">
            {current.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.slug}
                exhibition={exhibition}
                featured
              />
            ))}
          </TourSection>
        )}

        {upcoming.length > 0 && (
          <TourSection eyebrow="Coming next" title="Upcoming venues">
            {upcoming.map((exhibition) => (
              <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
            ))}
          </TourSection>
        )}

        <section className="mx-auto w-full max-w-4xl">
          <p className="gallery-lead">
            Additional confirmed venues include{' '}
            <a
              href="https://www.mdhistory.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-colonial-gold hover:text-colonial-gold/80"
            >
              the Maryland Center for History and Culture
            </a>{' '}
            and{' '}
            <a
              href="https://www.atlantahistorycenter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-colonial-gold hover:text-colonial-gold/80"
            >
              the Atlanta History Center
            </a>
            . Dates will be announced here.
          </p>
        </section>

        {past.length > 0 && (
          <TourSection eyebrow="The story so far" title="Past venues">
            {past.map((exhibition) => (
              <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
            ))}
          </TourSection>
        )}
      </div>
    </div>
  );
}
