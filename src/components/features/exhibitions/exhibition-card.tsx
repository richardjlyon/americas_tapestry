import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg flex h-[224px]">
      {/* Image - 1:1 aspect ratio, fills full height with zero margins */}
      <div className="relative w-[224px] h-[224px] flex-shrink-0">
        <Image
          src={getImagePath(exhibition.imagePath)}
          alt={`${exhibition.name} venue`}
          fill
          sizes={getImageSizes('thumbnail')}
          className="object-cover"
        />
      </div>

      {/* Information Section - with padding */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Date Range - Dark blue text, sans-serif, bold, larger */}
        <div className="mb-2">
          <span className="text-blue-800 font-sans font-bold text-base">
            {formatDateRange(exhibition.startDate, exhibition.endDate)}
          </span>
        </div>

        {/* State - Smaller text, bold */}
        <p className="text-base text-colonial-navy/70 font-bold mb-1">
          {exhibition.state}
        </p>

        {/* Venue Name - Large black text */}
        <h3 className="text-2xl font-bold text-colonial-navy mb-2">
          {exhibition.name}
        </h3>

        {/* Address */}
        <p className="text-sm text-colonial-navy/60 mb-4">
          {exhibition.address}
        </p>

        {/* More Information Link - Burgundy color */}
        {exhibition.moreInfo && (
          <div className="mt-auto">
            <a
              href={exhibition.moreInfo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-colonial-burgundy hover:underline font-medium"
            >
              More information
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
