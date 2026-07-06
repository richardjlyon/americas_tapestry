import { ProjectDirectorSection } from '@/components/features/team/project-director-section';
import { TeamGroupsSection } from '@/components/features/team/team-groups-section';
import { PageSection } from '@/components/ui/page-section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Our Team',
  description:
    "Meet the project directors, state directors, illustrators, historical partners, and stitchers behind America's Tapestry.",
  path: '/team',
});

export default async function TeamPage() {
  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-10 pb-8 text-center">
        <span className="eyebrow eyebrow-gold">The People</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">Our Team</h1>
        <p className="gallery-lead mx-auto mt-3">
          America's Tapestry is a collaboration between visual artists,
          historical advisors, and embroidery artisans drawn from each of the
          original 13 states.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      {/* Project Director */}
      <PageSection paddingTop="none" paddingBottom="small" background="colonial-oxblood">
        <ProjectDirectorSection />
      </PageSection>

      {/* Team Groups */}
      <PageSection hasPin={false} background="colonial-oxblood">
        <TeamGroupsSection />
      </PageSection>
    </div>
  );
}
