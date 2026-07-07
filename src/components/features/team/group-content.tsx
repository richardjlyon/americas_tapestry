"use client";

import { MemberCard } from "@/components/features/team/member-card";
import { StitcherLinkCard } from "@/components/features/stitchers/stitcher-link-card";
import type { TeamGroup, TeamMember } from "@/lib/team";

export interface GroupContentProps {
  group: TeamGroup;
  members: TeamMember[];
}

export function GroupContent({ group, members }: GroupContentProps) {
  // Filter out members with visible set to false
  const visibleMembers = members.filter(
    (member) => member["visible"] !== false,
  );

  return (
    <>
      {/* Sponsors-style header — eyebrow, cream heading, gold threshold —
          on the oxblood room shared by the people-and-story wing. */}
      <header className="mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">The People</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          {group.name}
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          {group.longDescription || group.description}
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      {visibleMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleMembers.map((member) => (
            <MemberCard
              key={`${member.groupSlug}-${member.slug}`}
              member={member}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="font-serif text-colonial-parchment/70 text-lg">
            No team members found in this group.
          </p>
        </div>
      )}

      {/* Link to the full aggregated stitcher list (stitchers group only) */}
      {group.slug === "stitchers" && (
        <div className="flex justify-center mt-8">
          <StitcherLinkCard
            href="/stitchers"
            label="Meet all of the stitchers"
          />
        </div>
      )}
    </>
  );
}
