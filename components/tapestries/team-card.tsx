'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { TeamMember } from '@/lib/team';
import { PageSection } from '@/components/ui/page-section';
import { SectionHeader } from '@/components/ui/section-header';
import { useState, useEffect } from 'react';

interface TeamCardProps {
  stateName: string;
  historicalPartners?: TeamMember[] | null;
  illustrators?: TeamMember[] | null;
  stateDirectors?: TeamMember[] | null;
  stitchingGroups?: TeamMember[] | null;
}

export function TeamCard({
  stateName,
  historicalPartners,
  illustrators,
  stateDirectors,
  stitchingGroups,
}: TeamCardProps) {
  // State to track which images failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Flatten all team members into a single array
  const teamMembers = [
    ...(historicalPartners || []),
    ...(illustrators || []),
    ...(stateDirectors || []),
    ...(stitchingGroups || []),
  ].filter(Boolean);

  // Function to handle image loading errors
  const handleImageError = (memberId: string) => {
    setFailedImages((prev) => ({
      ...prev,
      [memberId]: true,
    }));
  };

  return (
    <PageSection paddingTop="small" paddingBottom="none">
      <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
        The Team Behind the Tapestry
      </h2>

      <div className="flex flex-wrap justify-center gap-6 mx-auto">
        {teamMembers.map(
          (member, index) =>
            member && (
              <Link
                href={`/team/${member.groupSlug}/${member.slug}`}
                key={member.slug}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[300px]"
              >
                <Card className="border border-colonial-parchment/60 overflow-hidden hover:shadow-md transition-shadow h-full">
                  <CardContent className="pb-0 mb-0 h-full">
                    <div className="flex flex-col items-center p-4 h-full">
                      {/* image */}
                      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-colonial-burgundy">
                        {/* For debugging */}
                        {member.groupSlug === 'historical-partners' && (
                          <div className="hidden">
                            Debug: {member.groupSlug} / {member.slug} /{' '}
                            {member.imagePath}
                          </div>
                        )}
                        <Image
                          src={
                            member.groupSlug === 'historical-partners'
                              ? `/images/team/historical-partners/${member.slug}/${member.slug}.jpg`
                              : member.groupSlug === 'stitching-groups'
                                ? '/placeholder-user.jpg'
                                : member.groupSlug === 'state-directors'
                                  ? // For state directors, use the face image if available, otherwise use regular image
                                    member.hasFaceImage &&
                                    !failedImages[`${member.slug}-face`]
                                    ? `/images/team/${member.groupSlug}/${member.slug}/${member.slug}-face.jpg`
                                    : `/images/team/${member.groupSlug}/${member.slug}/${member.slug}.jpg`
                                  : member.groupSlug === 'illustrators'
                                    ? `/images/team/${member.groupSlug}/${member.slug}/${member.slug}.jpg`
                                    : member.faceImagePath ||
                                      member.imagePath ||
                                      '/placeholder-user.jpg'
                          }
                          alt={`${member.name}`}
                          fill
                          className="object-cover"
                          style={{
                            objectPosition: member.imagePosition || 'center',
                          }}
                          onError={() => {
                            if (member.groupSlug === 'state-directors') {
                              // If face image fails, mark it for fallback
                              handleImageError(`${member.slug}-face`);
                            }
                          }}
                        />
                      </div>

                      {/* details */}
                      <div className="text-center w-full">
                        <h3 className="font-sans text-lg font-bold text-colonial-burgundy">
                          {member.role}
                        </h3>
                        <p className="font-normal text-colonial-navy mb-1 pb-0">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-0 pt-0">
                          {member.description || member.summary || ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ),
        )}
      </div>
    </PageSection>
  );
}
