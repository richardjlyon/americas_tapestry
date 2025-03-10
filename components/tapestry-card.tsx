import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TapestryEntry } from '@/lib/tapestries';

// Status color mapping
const statusColors = {
  'Not Started': 'bg-colonial-navy/70',
  Designed: 'bg-indigo-500',
  'In Production': 'bg-colonial-burgundy',
  Finished: 'bg-colonial-gold',
};

const statusTextColors = {
  'Not Started': 'text-colonial-parchment',
  Designed: 'text-colonial-parchment',
  'In Production': 'text-colonial-parchment',
  Finished: 'text-colonial-navy',
};

interface TapestryCardProps {
  tapestry: TapestryEntry;
}

export function TapestryCard({ tapestry }: TapestryCardProps) {
  const hasAudio = !!tapestry.audioPath;
  const statusColor = statusColors[tapestry.status] || 'bg-colonial-navy/70';
  const statusTextColor =
    statusTextColors[tapestry.status] || 'text-colonial-parchment';

  return (
    <Link
      href={`/tapestry/${tapestry.slug}`}
      className="group cursor-pointer overflow-hidden rounded-lg bg-colonial-parchment shadow-md transition-all hover:shadow-lg border border-colonial-navy/10 relative"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity',
            tapestry.background_color || 'bg-colonial-navy',
          )}
        />
        <img
          src={tapestry.thumbnail || '/placeholder.svg?height=600&width=800'}
          alt={tapestry.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {hasAudio && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-colonial-navy/80 text-colonial-parchment rounded-full p-1.5 shadow-md">
              <Headphones className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Audio description available</span>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <div
            className={`${statusColor} ${statusTextColor} text-xs font-medium px-2 py-1 rounded-full shadow-md`}
          >
            {tapestry.status}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-sans font-medium text-lg text-colonial-navy group-hover:text-colonial-burgundy transition-colors">
            {tapestry.title}
          </h3>
          <ArrowUpRight className="h-4 w-4 text-colonial-navy/50 group-hover:text-colonial-burgundy transition-colors" />
        </div>
        <p className="font-serif text-sm text-colonial-navy/70 mt-1 line-clamp-2">
          {tapestry.summary}
        </p>
      </div>
    </Link>
  );
}
