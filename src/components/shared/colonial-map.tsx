'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getTapestryBySlug } from '@/lib/tapestries';

// Define the colony data with state names and positions for labels
const colonies = [
  {
    id: 'massachusetts',
    name: 'Massachusetts',
    path: 'M830,180 L860,170 L865,190 L840,200 L830,180',
    labelX: 845,
    labelY: 185,
  },
  // I'll let you complete the rest of the colonies
];

export function ColonialMap() {
  const [hoveredColony, setHoveredColony] = useState<string | null>(null);

  // Check which colonies have tapestries
  const hasTapestry = (colonyId: string) => {
    try {
      const tapestry = getTapestryBySlug(colonyId);
      return !!tapestry;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-colonial-navy mb-6 text-center">
        The Original Thirteen Colonies
      </h2>
      <p className="font-serif text-colonial-navy/80 mb-8 text-center">
        Explore the tapestries representing the original thirteen colonies.
        Click on a colony to view its tapestry.
      </p>

      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <svg
          viewBox="700 140 180 280"
          className="absolute inset-0 w-full h-full"
          aria-labelledby="colonial-map-title"
          role="img"
        >
          <title id="colonial-map-title">
            Map of the Original Thirteen Colonies
          </title>
          <desc>
            Interactive map of the original thirteen American colonies. Click on
            a colony to view its tapestry.
          </desc>

          {/* Background */}
          <rect x="700" y="140" width="180" height="280" fill="#f3e9d2" />

          {/* Ocean */}
          <path
            d="M880,140 L880,420 L700,420 L700,140 L880,140 Z M830,180 L860,170 L865,190 L870,200 L860,210 L830,210 L840,230 L830,250 L835,270 L825,275 L805,280 L790,310 L780,340 L770,370 L760,410 L730,390 L740,350 L750,320 L760,290 L770,240 L790,210 L800,180 L830,160 L860,150 L865,170 L830,180"
            fill="#d8e4f1"
          />

          {/* Colonies */}
          {colonies.map((colony) => {
            const hasColonyTapestry = hasTapestry(colony.id);
            const isHovered = hoveredColony === colony.id;

            return (
              <g key={colony.id}>
                <path
                  d={colony.path}
                  fill={
                    isHovered
                      ? '#c3a343'
                      : hasColonyTapestry
                        ? '#851e3e'
                        : '#102542'
                  }
                  stroke="#f3e9d2"
                  strokeWidth="1"
                  opacity={hasColonyTapestry ? 1 : 0.7}
                  className={cn(
                    'transition-all duration-300',
                    hasColonyTapestry
                      ? 'cursor-pointer hover:fill-colonial-gold'
                      : 'cursor-not-allowed',
                  )}
                  onMouseEnter={() => setHoveredColony(colony.id)}
                  onMouseLeave={() => setHoveredColony(null)}
                  aria-label={`${colony.name}${hasColonyTapestry ? '' : ' (tapestry not available)'}`}
                  role="button"
                  tabIndex={hasColonyTapestry ? 0 : -1}
                  onClick={() => {
                    if (hasColonyTapestry) {
                      window.location.href = `/tapestry/${colony.id}`;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      hasColonyTapestry &&
                      (e.key === 'Enter' || e.key === ' ')
                    ) {
                      e.preventDefault();
                      window.location.href = `/tapestry/${colony.id}`;
                    }
                  }}
                />

                {/* Labels for larger screens */}
                <text
                  x={colony.labelX}
                  y={colony.labelY}
                  textAnchor="middle"
                  fill="#f3e9d2"
                  fontSize="6"
                  fontWeight="bold"
                  className="hidden sm:block pointer-events-none"
                  style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
                >
                  {colony.name}
                </text>
              </g>
            );
          })}

          {/* Map title */}
          <text
            x="790"
            y="155"
            textAnchor="middle"
            fill="#102542"
            fontSize="8"
            fontWeight="bold"
            className="pointer-events-none"
          >
            The Thirteen Colonies
          </text>

          {/* Compass rose */}
          <g transform="translate(720, 160) scale(0.5)">
            <circle cx="0" cy="0" r="10" fill="#102542" opacity="0.7" />
            <path
              d="M0,-10 L0,10 M-10,0 L10,0"
              stroke="#f3e9d2"
              strokeWidth="1"
            />
            <text x="0" y="-12" textAnchor="middle" fill="#102542" fontSize="6">
              N
            </text>
            <text x="12" y="0" textAnchor="start" fill="#102542" fontSize="6">
              E
            </text>
            <text x="0" y="16" textAnchor="middle" fill="#102542" fontSize="6">
              S
            </text>
            <text x="-12" y="0" textAnchor="end" fill="#102542" fontSize="6">
              W
            </text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-colonial-burgundy rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">Available Tapestry</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-colonial-navy opacity-70 rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">Coming Soon</span>
        </div>
      </div>

      {/* Colony list for accessibility and mobile */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
        {colonies.map((colony) => {
          const hasColonyTapestry = hasTapestry(colony.id);

          return hasColonyTapestry ? (
            <Link
              key={colony.id}
              href={`/tapestry/${colony.id}`}
              className="px-3 py-2 bg-colonial-burgundy text-colonial-parchment rounded-md text-center text-sm hover:bg-colonial-gold hover:text-colonial-navy transition-colors"
            >
              {colony.name}
            </Link>
          ) : (
            <div
              key={colony.id}
              className="px-3 py-2 bg-colonial-navy/30 text-colonial-navy rounded-md text-center text-sm cursor-not-allowed"
            >
              {colony.name} (Coming Soon)
            </div>
          );
        })}
      </div>
    </div>
  );
}
