'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { TeamMember } from '@/lib/team';
import { PageSection } from '@/components/ui/page-section';
import { useState } from 'react';
import { getImagePath } from '@/lib/image-utils';

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
  // Track image load failures
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // SVG fallback for missing face images
  const personSvgFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23e0e0e0'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0a0a0'/%3E%3Cpath d='M100 120 C60 120 40 160 40 200 L160 200 C160 160 140 120 100 120' fill='%23a0a0a0'/%3E%3C/svg%3E`;

  // Simple helper to handle image errors
  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Updated function to get the appropriate image source using public directory paths
  const getImageSrc = (member: TeamMember) => {
    // If image already failed, use placeholder
    if (failedImages[member.slug]) {
      return personSvgFallback;
    }

    // For state directors, try face image first if available
    if (member.groupSlug === 'state-directors') {
      // Check if this director has a face image and it hasn't failed to load
      if (member.hasFaceImage && !failedImages[`${member.slug}-face`]) {
        // Use public images directory path for face images
        return `/images/team/state-directors/${member.slug}/${member.slug}-face.jpg`;
      }
      // If face image has failed but regular image hasn't been tried yet
      if (
        failedImages[`${member.slug}-face`] &&
        !failedImages[`${member.slug}`]
      ) {
        return `/images/team/state-directors/${member.slug}/${member.slug}.jpg`;
      }
      // If both failed, use SVG fallback
      return personSvgFallback;
    }

    // For historical partners - use the public images directory
    if (member.groupSlug === 'historical-partners') {
      return failedImages[`${member.slug}`]
        ? personSvgFallback
        : `/images/team/historical-partners/${member.slug}/${member.slug}.jpg`;
    }

    // For stitching groups use SVG fallback
    if (member.groupSlug === 'stitching-groups') {
      return personSvgFallback;
    }

    // Default image path for other groups (using public images directory)
    return failedImages[`${member.slug}`]
      ? personSvgFallback
      : `/images/team/${member.groupSlug}/${member.slug}/${member.slug}.jpg`;
  };

  // Flatten all team members into a single array - keep it simple
  const teamMembers = [
    ...(Array.isArray(historicalPartners) ? historicalPartners : []),
    ...(Array.isArray(illustrators) ? illustrators : []),
    ...(Array.isArray(stateDirectors) ? stateDirectors : []),
    ...(Array.isArray(stitchingGroups) ? stitchingGroups : []),
  ].filter(Boolean);

  // If no team members, don't render anything
  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <PageSection paddingTop="small" paddingBottom="none">
      <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
        The Team Behind the Tapestry
      </h2>

      <div className="flex flex-wrap justify-center gap-6 mx-auto">
        {teamMembers.map((member) => (
          <Link
            href={`/team/${member.groupSlug}/${member.slug}`}
            key={member.slug}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[300px]"
          >
            <Card className="border border-colonial-parchment/60 overflow-hidden hover:shadow-md transition-shadow h-full">
              <CardContent className="pb-0 mb-0 h-full">
                <div className="flex flex-col items-center p-4 h-full">
                  {/* Simple image with basic fallback */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-colonial-burgundy">
                    <Image
                      src={getImageSrc(member)}
                      alt={member.name || 'Team member'}
                      fill
                      sizes="(max-width: 768px) 128px, 128px"
                      className="object-cover"
                      style={{
                        objectPosition: member.imagePosition || 'center',
                      }}
                      unoptimized
                      onError={() => {
                        // For state directors with face images, we need to track face failures separately
                        if (
                          member.groupSlug === 'state-directors' &&
                          member.hasFaceImage &&
                          !failedImages[`${member.slug}-face`]
                        ) {
                          handleImageError(`${member.slug}-face`);
                        } else {
                          // For all other failures, mark the entire image as failed
                          handleImageError(member.slug);
                        }
                      }}
                    />
                  </div>

                  {/* details */}
                  <div className="text-center w-full">
                    <h3 className="font-sans text-lg font-bold text-colonial-burgundy">
                      {member.role || 'Team Member'}
                    </h3>
                    <p className="font-normal text-colonial-navy mb-1 pb-0">
                      {member.name || member.slug}
                    </p>
                    {(member.description || member.summary) && (
                      <p className="text-sm text-gray-700 mt-0 pt-0">
                        {member.description || member.summary}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}