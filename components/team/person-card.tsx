import type { FC } from 'react';
import Image from 'next/image';
import { ContentCard } from '../ui/content-card';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

interface PersonDetails {
  name: string;
  role: string;
  state?: string;
  imagePosition?: string;
  moreInformation?: string;
}

type CardWidth = 'full' | 'two-thirds' | 'half';

interface PersonCardProps {
  personImageSrc?: string;
  person: PersonDetails;
  personBioHtml: string;
  width?: CardWidth;
}

const PersonCard: FC<PersonCardProps> = ({
  personImageSrc: imageSrc,
  person: personDetails,
  personBioHtml,
  width = 'two-thirds',
}) => {
  // Determine width class based on the width prop
  const widthClass = {
    full: 'w-full',
    'two-thirds': 'w-full lg:w-2/3 mx-auto',
    half: 'w-full lg:w-1/2 mx-auto',
  }[width];

  return (
    <div className={`mb-4 md:mb-8 ${widthClass}`}>
      <ContentCard className="overflow-hidden p-0">
        <div className="md:flex">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="h-80 md:h-full relative">
              {/* image */}
              {imageSrc ? (
                <Image
                  src={getImagePath(imageSrc)}
                  alt={personDetails.name}
                  fill
                  sizes={getImageSizes('thumbnail')}
                  className="object-cover"
                  style={{
                    objectPosition: personDetails.imagePosition || 'center',
                  }}
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-colonial-navy/40 text-center p-4">
                    {personDetails.name}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* content */}
          <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
            <div className="border-b border-colonial-gold pb-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy">
                {personDetails.name}
              </h2>
              <p className="font-serif text-xl text-colonial-burgundy mt-1">
                {personDetails.role}
                {personDetails.state ? `, ${personDetails.state}` : ''}
              </p>
            </div>
            <div
              className="prose prose-lg max-w-none font-serif text-colonial-navy prose-headings:font-sans prose-a:text-colonial-burgundy"
              dangerouslySetInnerHTML={{ __html: personBioHtml }}
            />
            {personDetails.moreInformation && (
              <div className="mt-auto pt-4">
                <a
                  href={`${personDetails.moreInformation}`}
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
};

export default PersonCard;