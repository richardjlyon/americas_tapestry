import { PageSection } from "@/components/ui/page-section";
import { SponsorCard } from "@/components/features/sponsors/sponsor-card";
import { getAllSponsors } from "@/lib/sponsors";
import { markdownToHtml } from "@/lib/markdown";

export const metadata = {
  title: "Our Sponsors | America's Tapestry",
  description:
    "Meet the organizations and institutions that make America's Tapestry possible through their generous support.",
};

export default async function SponsorsPage() {
  const sponsors = await getAllSponsors();

  // Process markdown excerpts for all sponsors
  const sponsorsWithHtml = await Promise.all(
    sponsors.map(async (sponsor) => ({
      ...sponsor,
      excerptHtml: sponsor.excerpt ? await markdownToHtml(sponsor.excerpt) : "",
    })),
  );

  // Group sponsors by tier if available
  const sponsorsByTier: Record<string, any[]> = {};
  sponsorsWithHtml.forEach((sponsor) => {
    if (sponsor.tier) {
      if (!sponsorsByTier[sponsor.tier]) {
        sponsorsByTier[sponsor.tier] = [];
      }
      sponsorsByTier[sponsor.tier]?.push(sponsor);
    }
  });

  // Get sponsors without tiers
  const untieredSponsors = sponsorsWithHtml.filter((s) => !s.tier);

  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">Our Supporters</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          Our Sponsors
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          America's Tapestry is made possible through the generous support of
          our sponsors. These organizations and institutions share our
          commitment to preserving and celebrating America's diverse cultural
          heritage through art, education, and community engagement.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <PageSection paddingTop="none" background="colonial-oxblood">
        {/* Display sponsors with tiers */}
        {Object.keys(sponsorsByTier).length > 0 &&
          Object.entries(sponsorsByTier)
            .sort(([tierA], [tierB]) => {
              const tierOrder: Record<string, number> = {
                Platinum: 1,
                Gold: 2,
                Silver: 3,
                Bronze: 4,
                Supporter: 5,
              };
              return (tierOrder[tierA] ?? 999) - (tierOrder[tierB] ?? 999);
            })
            .map(([tier, tierSponsors]) => (
              <div key={tier} className="mb-12">
                <h3 className="gallery-heading text-xl mb-6 text-center">
                  {tier} {tierSponsors.length === 1 ? "Sponsor" : "Sponsors"}
                </h3>

                {/* If Platinum, make it more prominent */}
                {tier === "Platinum" ? (
                  <div className="max-w-2xl mx-auto">
                    {tierSponsors.map((sponsor) => (
                      <SponsorCard
                        key={sponsor.slug}
                        sponsor={sponsor}
                        featured={true}
                        excerptHtml={sponsor.excerptHtml}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {tierSponsors.map((sponsor) => (
                      <SponsorCard
                        key={sponsor.slug}
                        sponsor={sponsor}
                        excerptHtml={sponsor.excerptHtml}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

        {/* Display all sponsors if none have tiers, or untiered sponsors if some have tiers */}
        {(Object.keys(sponsorsByTier).length === 0 ||
          untieredSponsors.length > 0) && (
          <div>
            {Object.keys(sponsorsByTier).length > 0 && (
              <h3 className="gallery-heading text-xl mb-6 text-center">
                Additional Sponsors
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {(Object.keys(sponsorsByTier).length === 0
                ? sponsorsWithHtml
                : untieredSponsors
              ).map((sponsor) => (
                <SponsorCard
                  key={sponsor.slug}
                  sponsor={sponsor}
                  excerptHtml={sponsor.excerptHtml}
                />
              ))}
            </div>
          </div>
        )}
      </PageSection>
    </div>
  );
}
