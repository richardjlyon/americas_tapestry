import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/components/ui/page-section';
import { getAllSponsors } from '@/lib/sponsors';
import { getSponsorData } from '@/app/actions/sponsor-actions';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const sponsors = getAllSponsors();

  return sponsors.map((sponsor) => ({
    slug: sponsor.slug,
  }));
}

export async function generateMetadata({
  params,
}: { params: { slug: string } }) {
  const { sponsor } = await getSponsorData(params.slug);

  if (!sponsor) {
    return {
      title: "Sponsor Not Found | America's Tapestry",
      description: 'The requested sponsor could not be found.',
    };
  }

  return {
    title: `${sponsor.name} | Our Sponsors | America's Tapestry`,
    description: sponsor.excerpt,
  };
}

export default async function SponsorPage({
  params,
}: { params: { slug: string } }) {
  const { sponsor, contentHtml } = await getSponsorData(params.slug);

  if (!sponsor) {
    notFound();
  }

  // Define tier colors with fallback
  const tierColors: Record<string, string> = {
    Platinum: 'bg-slate-300 text-slate-900',
    Gold: 'bg-amber-300 text-amber-900',
    Silver: 'bg-gray-300 text-gray-900',
    Bronze: 'bg-amber-700 text-amber-50',
    Supporter: 'bg-blue-100 text-blue-800',
  };

  // Get tier color or default
  const tierColor =
    sponsor.tier && tierColors[sponsor.tier]
      ? tierColors[sponsor.tier]
      : 'bg-gray-100 text-gray-800';

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-colonial-navy/10 overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-colonial-navy/10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-colonial-navy">
                  {sponsor.name}
                </h1>
                {sponsor.tier && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${tierColor}`}
                  >
                    {sponsor.tier}
                  </span>
                )}
              </div>

              {/* Show metadata if available */}
              {(sponsor.location || sponsor.partnership_year) && (
                <p className="text-colonial-navy/70">
                  {sponsor.location}
                  {sponsor.location && sponsor.partnership_year && ' • '}
                  {sponsor.partnership_year &&
                    `Partner since ${sponsor.partnership_year}`}
                </p>
              )}
            </div>

            <div className="h-16 md:h-20">
              <img
                src={sponsor.logoPath}
                alt={`${sponsor.name} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div
            className="content-typography"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-8 pt-6 border-t border-colonial-navy/10 flex justify-between items-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy/10"
            >
              <Link href="/contact?subject=Regarding%20Sponsorship">
                Contact About Sponsorship
              </Link>
            </Button>

            {sponsor.website && sponsor.website !== '#' && (
              <Button
                asChild
                variant="ghost"
                className="text-colonial-navy/70 hover:text-colonial-navy"
              >
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
