import React from 'react';
import { ProjectDirectorSection } from '@/components/features/team/project-director-section';
import { TeamGroupsSection } from '@/components/features/team/team-groups-section';
import { PageSection } from '@/components/ui/page-section';

export default async function TeamPage() {
  return (
    <>
      <h1 className="page-heading">Our Team</h1>

      <div className="lead-text mb-content-md">
        America's Tapestry is a collaboration between visual artists, historical
        advisors, and embroidery artisans drawn from each of the original 13
        states.
      </div>

      {/* Project Director */}
      <PageSection paddingTop="none" paddingBottom="small">
        <ProjectDirectorSection />
      </PageSection>

      {/* Team Groups */}
      <PageSection hasPin={false} background="vintage-paper">
        <TeamGroupsSection />
      </PageSection>
    </>
  );
}
