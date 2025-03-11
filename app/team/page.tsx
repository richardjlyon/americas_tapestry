import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProjectDirector, getTeamGroups } from '@/lib/team';
import { remark } from 'remark';
import html from 'remark-html';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';
import PersonCard from '@/components/team/person-card';
import React from 'react';

export default async function TeamPage() {
  const projectDirector = getProjectDirector();
  const teamGroups = getTeamGroups();

  // Convert markdown to HTML for project director bio
  let directorBioHtml = '';
  if (projectDirector) {
    const processedContent = await remark()
      .use(html)
      .process(projectDirector.content);
    directorBioHtml = processedContent.toString();
  }

  // Default placeholder image if no image is found
  const directorImageSrc =
    projectDirector?.imagePath ||
    `/placeholder.svg?height=800&width=600&text=${encodeURIComponent(projectDirector?.name || 'Project Director')}`;

  return (
    <div className="content-spacing-sm">
      <h1 className="page-heading">Our Team</h1>

      <div className="lead-text mb-content-md">
        America's Tapestry is a collaboration between visual artists, historical
        advisors, and embroidery artisans drawn from each of the original 13
        states.
      </div>

      {/* Project Director */}
      <PageSection hasPin={true}>
        {projectDirector && (
          <PersonCard
            personImageSrc={directorImageSrc}
            person={projectDirector}
            personBioHtml={directorBioHtml}
          />
        )}
      </PageSection>

      {/* Team Groups */}
      <PageSection hasPin={false} paddingBottom="large">
        <div className="content-spacing-md">
          <h2 className="section-title text-center">Meet Our Team Groups</h2>

          <div className="lead-text mb-content-md">
            Meet the talented people and prestigious institutions who are
            working together to create <em>America's Tapestry</em>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {teamGroups
              .filter((group) => group.slug !== 'project-director')
              .map((group) => (
                <ContentCard
                  key={group.slug}
                  className="transition-all hover:shadow-lg p-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold text-colonial-navy mb-2">
                    {group.name}
                  </h3>
                  <p className="font-serif text-colonial-navy/80 mb-4">
                    {group.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy hover:text-colonial-parchment"
                  >
                    <Link href={`/team/${group.slug}`}>
                      View {group.name} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </ContentCard>
              ))}
          </div>
        </div>
      </PageSection>
    </div>
  );
}
