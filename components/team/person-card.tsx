import React from 'react';
import { ContentCard } from '../ui/content-card';

interface PersonDetails {
  name: string;
  role: string;
  imagePosition?: string;
}

interface PersonCardProps {
  personImageSrc?: string;
  person: PersonDetails;
  personBioHtml: string;
}

const PersonCard: React.FC<PersonCardProps> = ({
  personImageSrc: imageSrc,
  person: personDetails,
  personBioHtml,
}) => {
  return (
    <div className="mb-16 md:mb-24">
      <ContentCard className="overflow-hidden p-0">
        <div className="md:flex">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="h-80 md:h-full relative">
              {/* image */}
              <img
                src={
                  imageSrc ||
                  '/team/project-director/stefan-romero/stefan-romero.jpg'
                }
                alt={personDetails.name}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: personDetails.imagePosition || 'center',
                }}
              />
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
              </p>
            </div>
            <div
              className="prose prose-lg max-w-none font-serif text-colonial-navy prose-headings:font-sans prose-a:text-colonial-burgundy"
              dangerouslySetInnerHTML={{ __html: personBioHtml }}
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

export default PersonCard;
