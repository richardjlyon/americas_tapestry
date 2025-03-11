'use client';

import { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className={isFullView ? 'w-full' : 'aspect-[16/9] w-full relative'}>
        <img
          src={imageSrc}
          alt={altText}
          className={`w-full ${isFullView ? 'h-auto' : 'h-full object-cover'}`}
        />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <div
            className={`${statusColor} ${statusTextColor} px-3 py-1 rounded-full shadow-md font-medium`}
          >
            Status: {status}
          </div>
        </div>

        {/* Toggle view button */}
        <div className="absolute bottom-4 right-4">
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
