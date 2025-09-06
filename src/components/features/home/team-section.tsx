import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { getTeamGroups } from '@/lib/team';
import { ContentCard } from '@/components/ui/content-card';
import { Button } from '@/components/ui/button';

export async function TeamSection() {
  const allTeamGroups = await getTeamGroups();
  const teamGroups = allTeamGroups.filter(
    (group) => group.slug !== 'project-director',
  );

  return (
    <>
      <SectionHeader
        title="Our Team"
        description={
          <>
            <em>America's Tapestry</em> is brought to life by dedicated teams of
            historians, artists, and craftspeople working together to capture
            stories from our nation's journey towards Independence.
          </>
        }
      />

      <div className="space-y-12">
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
              <Button asChild variant="colonial-outline" className="text-sm">
                <Link href={`/team/${group.slug}`}>
                  Meet Our {group.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </ContentCard>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button
            asChild
            variant="colonial-primary"
            className="text-base py-2 px-5"
          >
            <Link href="/team">
              View Full Team <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
