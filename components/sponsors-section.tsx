import { SponsorCard } from '@/components/sponsor-card';
import { getAllSponsors } from '@/lib/sponsors';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Award } from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';

export function SponsorsSection() {
  const sponsors = getAllSponsors();
  const featuredSponsors = sponsors.slice(0, 3); // Top 3 sponsors

  return (
    <PageSection background="colonial-parchment">
      <h1 className="page-heading">Our Sponsors</h1>

      <p className="lead-text">
        America's Tapestry is made possible through the generous support of our
        sponsors. These organizations and institutions share our commitment to
        preserving and celebrating America's diverse cultural heritage through
        art, education, and community engagement.
      </p>

      {/* Featured Sponsor - Platinum Tier */}
      {sponsors.filter((s) => s.tier === 'Platinum').length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-colonial-navy mb-6 text-center">
            Platinum Sponsor
          </h3>
          <div className="max-w-2xl mx-auto">
            <SponsorCard
              sponsor={sponsors.filter((s) => s.tier === 'Platinum')[0]}
              featured={true}
            />
          </div>
        </div>
      )}

      {/* Gold and Silver Tier Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {sponsors
          .filter((s) => s.tier === 'Gold' || s.tier === 'Silver')
          .map((sponsor) => (
            <SponsorCard key={sponsor.slug} sponsor={sponsor} />
          ))}
      </div>

      {/* Bronze Tier Sponsors - if any */}
      {sponsors.filter((s) => s.tier === 'Bronze').length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-colonial-navy mb-6 text-center">
            Bronze Sponsors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sponsors
              .filter((s) => s.tier === 'Bronze')
              .map((sponsor) => (
                <div
                  key={sponsor.slug}
                  className="bg-white p-4 rounded-lg shadow-sm border border-colonial-navy/10 text-center"
                >
                  <div className="h-12 flex items-center justify-center mb-2">
                    <img
                      src={sponsor.logoPath || '/placeholder.svg'}
                      alt={`${sponsor.name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-colonial-navy">
                    {sponsor.name}
                  </h4>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-bold text-colonial-navy mb-4">
          Become a Sponsor
        </h3>
        <p className="font-serif text-colonial-navy/80 max-w-2xl mx-auto mb-6">
          Join these distinguished organizations in supporting America's
          Tapestry. Your sponsorship helps us preserve and celebrate our
          nation's diverse cultural heritage through art, education, and
          community engagement.
        </p>
        <Button
          asChild
          className="rounded-full bg-colonial-burgundy hover:bg-colonial-burgundy/90 text-colonial-parchment"
        >
          <Link href="/support#sponsorship">
            View Sponsorship Opportunities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </PageSection>
  );
}
