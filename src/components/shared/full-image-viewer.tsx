'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImagePath } from '@/lib/image-utils';

interface FullImageViewerProps {
  imageSrc: string;
  altText: string;
  status: string;
  statusColor: string;
  statusTextColor: string;
}

export function FullImageViewer({
  imageSrc,
  altText,
  status,
  statusColor,
  statusTextColor,
}: FullImageViewerProps) {
  const [isFullView, setIsFullView] = useState(false);

  const toggleView = () => {
    setIsFullView(!isFullView);
  };

  return (
    <div className="relative">
      {/* Image container with conditional aspect ratio */}
      <div 
        className={isFullView ? 'w-full relative' : 'aspect-[16/9] w-full relative'} 
        style={{ height: isFullView ? 'auto' : undefined }}
      >
        {isFullView ? (
          <div className="relative w-full">
            <Image
              src={getImagePath(imageSrc)}
              alt={altText}
              width={1920}
              height={1080}
              className="w-full h-auto"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
        ) : (
          <Image
            src={getImagePath(imageSrc)}
            alt={altText}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized
          />
        )}

        {/* Status badge */}
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`${statusColor} ${statusTextColor} px-3 py-1 rounded-full shadow-md font-medium`}
          >
            Status: {status}
          </div>
        </div>

        {/* Toggle view button */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={toggleView}
            variant="secondary"
            size="sm"
            className="bg-white/80 hover:bg-white text-colonial-navy rounded-full shadow-md"
            aria-label={isFullView ? 'Show cropped view' : 'Show full image'}
          >
            {isFullView ? (
              <Minimize2 className="h-4 w-4 mr-1" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-1" />
            )}
            {isFullView ? 'Crop' : 'Full Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}