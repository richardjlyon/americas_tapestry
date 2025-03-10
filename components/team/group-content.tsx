"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMemberCard } from '@/components/team-member-card';
import type { TeamGroup, TeamMember } from '@/lib/team';

export interface GroupContentProps {
  group: TeamGroup;
  members: TeamMember[];
}

export function GroupContent({ group, members }: GroupContentProps) {
  return (
    <>
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
        >
          <Link href="/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>

      <h1 className="page-heading">{group.name}</h1>
      <p className="lead-text">{group.longDescription || group.description}</p>

      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <TeamMemberCard key={member.slug} member={member} />
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