import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContentCard } from '@/components/ui/content-card';
import { getTeamGroups } from '@/lib/team';
import { NavyButton } from '@/components/ui/colonial-buttons';

export function TeamGroupsSection() {
  const teamGroups = getTeamGroups();

  return (
    <div className="content-spacing-md">
      <h2 className="section-title text-center">Meet Our Team Groups</h2>

      <div className="lead-text mb-content-md">
        Meet the talented people and prestigious institutions who are working
        together to create <em>America's Tapestry</em>.
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
              <NavyButton asChild variant="outline" className="text-sm">
                <Link href={`/team/${group.slug}`}>
                  View {group.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </NavyButton>
            </ContentCard>
          ))}
      </div>
    </div>
  );
}
