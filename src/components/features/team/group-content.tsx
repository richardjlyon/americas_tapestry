'use client';

import { MemberCard } from '@/components/features/team/member-card';
import type { TeamGroup, TeamMember } from '@/lib/team';

export interface GroupContentProps {
  group: TeamGroup;
  members: TeamMember[];
}

export function GroupContent({ group, members }: GroupContentProps) {
  // Filter out members with visible set to false
  const visibleMembers = members.filter((member) => member['visible'] !== false);

  return (
    <>
      <h1 className="page-heading">{group.name}</h1>

      <div className="lead-text mb-content-md">
        {group.longDescription || group.description}
      </div>

      {visibleMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleMembers.map((member) => (
            <MemberCard key={`${member.groupSlug}-${member.slug}`} member={member} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="font-serif text-colonial-navy/70 text-lg">
            No team members found in this group.
          </p>
        </div>
      )}
    </>
  );
}
