'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { TeamMember } from '@/lib/team';
import { useState, useEffect } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import { StitchingGroupPlaceholder } from './stitching-group-placeholder';
import { ContentCard } from '@/components/ui/content-card';

interface MemberCardProps {
  member: TeamMember;
  variant?: 'grid' | 'full' | 'simple';
  width?: 'full' | 'two-thirds' | 'half';
  className?: string;
}

export function MemberCard({ 
  member, 
  variant = 'grid', 
  width = 'two-thirds',
  className 
}: MemberCardProps) {
  const placeholderPath = `/placeholder-state-director.svg?height=600&width=450&text=${encodeURIComponent(member.name)}`;
  
  // State management for image loading and content processing
  const [imgSrc, setImgSrc] = useState<string>(
    member['imagePath']?.trim() ? getImagePath(member['imagePath']) : placeholderPath,
  );
  const [imgError, setImgError] = useState(false);
  const [contentHtml, setContentHtml] = useState('');

  // Handle image load error
  const handleImageError = () => {
    console.error(
      `Failed to load image: ${member['imagePath']} for ${member.name}`,
    );
    setImgError(true);
    setImgSrc(placeholderPath);
  };

  // Process markdown content
  useEffect(() => {
    const processContent = async () => {
      const contentToProcess = variant === 'full' ? member.content : member.content.split('\n\n')[0];

      try {
        const processedContent = await remark()
          .use(html)
          .process(contentToProcess);
        setContentHtml(processedContent.toString());
      } catch (error) {
        console.error('Error processing markdown:', error);
        setContentHtml(`<p>${contentToProcess}</p>`);
      }
    };

    processContent();
  }, [member.content, variant]);

  // Grid variant (similar to TeamMemberCard)
  if (variant === 'grid') {
    return (
      <div
        className={cn(
          'bg-white rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 h-full flex flex-col',
          className,
        )}
      >
        <div className="aspect-[3/4] relative overflow-hidden">
          {member.groupSlug === 'stitching-groups' ? (
            <StitchingGroupPlaceholder name={member.name} />
          ) : !imgError ? (
            <Image
              src={imgSrc}
              alt={member.name}
              fill
              sizes={getImageSizes('thumbnail')}
              className="object-cover transition-transform duration-500 hover:scale-105"
              style={{
                objectPosition: member.imagePosition || 'center',
              }}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-colonial-navy/40 text-center p-4">
                {member.name}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-colonial-navy">{member.name}</h3>
          <p className="font-serif text-colonial-burgundy mb-3">
            {member.role}
            {member.state ? `, ${member.state}` : ''}
          </p>

          {member.groupSlug === 'stitching-groups' && member['more_info'] && (
            <div className="mt-auto pt-4">
              <a href={`${member['more_info']}`} className="inline-block text-link">
                More info →
              </a>
            </div>
          )}
          {member['specialization'] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Specialization: {member['specialization']}
            </p>
          )}
          {member['members'] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Members: {member['members']}
            </p>
          )}
          {member['established'] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Established: {member['established']}
            </p>
          )}
          {member['partnership_year'] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Partnership since: {member['partnership_year']}
            </p>
          )}

          <div
            className="mt-3 font-serif text-colonial-navy/80 line-clamp-6 content-typography"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {member.groupSlug !== 'stitching-groups' && (
            <div className="mt-auto pt-4">
              <a
                href={`/team/${member.groupSlug}/${member.slug}`}
                className="inline-block text-link"
              >
                Read full bio →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant (similar to PersonCard)
  if (variant === 'full') {
    const widthClass = {
      full: 'w-full',
      'two-thirds': 'w-full lg:w-2/3 mx-auto',
      half: 'w-full lg:w-1/2 mx-auto',
    }[width];

    return (
      <div className={cn(`mb-4 md:mb-8 ${widthClass}`, className)}>
        <ContentCard className="overflow-hidden p-0">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="h-80 md:h-full relative">
                {imgSrc && !imgError ? (
                  <Image
                    src={imgSrc}
                    alt={member.name}
                    fill
                    sizes={getImageSizes('thumbnail')}
                    className="object-cover"
                    style={{
                      objectPosition: member.imagePosition || 'center',
                    }}
                    priority
                          onError={handleImageError}
                  />
                ) : (
                  <Image
                    src="/placeholder-user.jpg"
                    alt={`${member.name} - placeholder`}
                    fill
                    sizes={getImageSizes('thumbnail')}
                    className="object-cover"
                        />
                )}
              </div>
            </div>
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
              <div className="border-b border-colonial-gold pb-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy">
                  {member.name}
                </h2>
                <p className="font-serif text-xl text-colonial-burgundy mt-1">
                  {member.role}
                  {member.state ? `, ${member.state}` : ''}
                </p>
              </div>
              <div
                className="prose prose-lg max-w-none font-serif text-colonial-navy prose-headings:font-sans prose-a:text-colonial-burgundy"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              {member.moreInformation && (
                <div className="mt-auto pt-4">
                  <a
                    href={`${member.moreInformation}`}
                    className="inline-block text-link"
                  >
                    More information →
                  </a>
                </div>
              )}
            </div>
          </div>
        </ContentCard>
      </div>
    );
  }

  // Simple variant (compact version)
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-colonial-navy/10 p-4', className)}>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
          {!imgError ? (
            <Image
              src={imgSrc}
              alt={member.name}
              fill
              sizes="64px"
              className="object-cover"
              style={{
                objectPosition: member.imagePosition || 'center',
              }}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-colonial-navy/40 text-xs text-center">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h4 className="text-lg font-semibold text-colonial-navy">{member.name}</h4>
          <p className="font-serif text-colonial-burgundy text-sm">
            {member.role}
            {member.state ? `, ${member.state}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}