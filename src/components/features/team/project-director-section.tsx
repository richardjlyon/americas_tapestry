import React from 'react';
import { MemberCard } from '@/components/features/team/member-card';
import { getProjectDirector } from '@/lib/team';

export async function ProjectDirectorSection() {
  const projectDirector = getProjectDirector();

  return (
    projectDirector && (
      <MemberCard
        member={projectDirector}
        variant="full"
        width="two-thirds"
      />
    )
  );
}
