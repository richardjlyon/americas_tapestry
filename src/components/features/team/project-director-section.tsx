import { MemberCard } from '@/components/features/team/member-card';
import { getProjectDirector } from '@/lib/team';
import { getMarkdownHtml } from '@/app/actions/team-actions';

export async function ProjectDirectorSection() {
  const projectDirector = await getProjectDirector();

  if (!projectDirector) return null;

  const contentHtml = await getMarkdownHtml(projectDirector.content);

  return (
    <MemberCard
      member={projectDirector}
      variant="full"
      width="two-thirds"
      contentHtml={contentHtml}
    />
  );
}
