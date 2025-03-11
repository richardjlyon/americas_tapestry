'use client';

import { cn } from '@/lib/utils';
import type { TeamMember } from '@/lib/team';
import { useState, useEffect } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

interface TeamMemberCardProps {
  member: TeamMember;
  className?: string;
}

export function TeamMemberCard({ member, className }: TeamMemberCardProps) {
  // Use the imagePath from the TeamMember object
  const placeholderPath = `/placeholder.svg?height=600&width=450&text=${encodeURIComponent(member.name)}`;

  // Use state to track image loading errors and processed content
  const [imgSrc, setImgSrc] = useState(member.imagePath || placeholderPath);
  const [contentHtml, setContentHtml] = useState('');

  // Handle image load error
  const handleImageError = () => {
    console.error(
      `Failed to load image: ${member.imagePath} for ${member.name}`,
    );
    setImgSrc(placeholderPath);
  };

  // Process markdown content on component mount
  useEffect(() => {
    const processContent = async () => {
      // Get first paragraph of content
      const firstParagraph = member.content.split('\n\n')[0];

      // Convert markdown to HTML
      try {
        const processedContent = await remark()
          .use(html)
          .process(firstParagraph);
        setContentHtml(processedContent.toString());
      } catch (error) {
        console.error('Error processing markdown:', error);
        setContentHtml(`<p>${firstParagraph}</p>`);
      }
    };

    processContent();
  }, [member.content]);

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 h-full flex flex-col',
        className,
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={imgSrc}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          style={{
            objectPosition: member.imagePosition || 'center', // Use imagePosition if available, otherwise default to center
          }}
          onError={handleImageError}
        />
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-colonial-navy">{member.name}</h3>
        <p className="font-serif text-colonial-burgundy mb-3">{member.role}</p>

        {/* Additional metadata fields if they exist */}
        {member.state && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            State: {member.state}
          </p>
        )}
        {member.location && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            Location: {member.location}
          </p>
        )}
        {member.specialization && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            Specialization: {member.specialization}
          </p>
        )}
        {member.members && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            Members: {member.members}
          </p>
        )}
        {member.established && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            Established: {member.established}
          </p>
        )}
        {member.partnership_year && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">
            Partnership since: {member.partnership_year}
          </p>
        )}

        <div
          className="mt-3 font-serif text-colonial-navy/80 line-clamp-6 content-typography"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="mt-auto pt-4">
          <a
            href={`/team/${member.groupSlug}/${member.slug}`}
            className="inline-block text-link"
          >
            Read full bio →
          </a>
        </div>
      </div>
    </div>
  );
}
