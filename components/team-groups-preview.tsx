import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTeamGroups } from '@/lib/team';
import { ContentCard } from '@/components/ui/content-card';

export function TeamGroupsPreview() {
  const teamGroups = getTeamGroups().filter(
    (group) => group.slug !== 'project-director',
  );

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="section-title text-center">Our Team</h2>
        <p className="lead-text">
          America's Tapestry is brought to life by dedicated teams of
          historians, artists, and craftspeople working together to capture
          stories from our nation’s journey towards Independence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {teamGroups.map((group) => (
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
                Meet Our {group.name} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </ContentCard>
        ))}
      </div>

      <div className="text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
        >
          <Link href="/team">
            View Full Team <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
