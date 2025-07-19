import React from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import PersonCard from '@/components/team/person-card';
import { getProjectDirector } from '@/lib/team';

export async function ProjectDirectorSection() {
  const projectDirector = getProjectDirector();

  // Convert markdown to HTML for project director bio
  let directorBioHtml = '';
  if (projectDirector) {
    const processedContent = await remark()
      .use(html)
      .process(projectDirector.content);
    directorBioHtml = processedContent.toString();
  }

  // Default placeholder image if no image is found
  const directorImageSrc =
    projectDirector?.imagePath ||
    `/placeholder.svg?height=800&width=600&text=${encodeURIComponent(projectDirector?.name || 'Project Director')}`;

  return (
    projectDirector && (
      <PersonCard
        personImageSrc={directorImageSrc}
        person={projectDirector}
        personBioHtml={directorBioHtml}
      />
    )
  );
}
