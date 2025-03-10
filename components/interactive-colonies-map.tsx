'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { TapestryEntry, TapestryStatus } from '@/lib/tapestries';

// Original 13 colonies with their current state abbreviations, names, and tapestry slugs
const originalColonies = [
  {
    id: 'DE',
    name: 'Delaware',
    slug: 'delaware',
    details: 'First state to ratify the Constitution (1787)',
    path: 'M825,240 L830,230 L835,240 L830,250 L825,240',
    labelX: 830,
    labelY: 240,
  },
  {
    id: 'PA',
    name: 'Pennsylvania',
    slug: 'pennsylvania',
    details:
      'Home to Independence Hall where the Declaration of Independence was signed',
    path: 'M780,210 L825,200 L820,220 L775,230 L780,210',
    labelX: 800,
    labelY: 215,
  },
  {
    id: 'NJ',
    name: 'New Jersey',
    slug: 'new-jersey',
    details: 'Third state to ratify the Constitution',
    path: 'M835,220 L840,210 L845,220 L840,235 L835,220',
    labelX: 840,
    labelY: 220,
  },
  {
    id: 'GA',
    name: 'Georgia',
    slug: 'georgia',
    details: 'Southernmost of the original 13 colonies',
    path: 'M800,320 L820,310 L825,330 L805,340 L800,320',
    labelX: 810,
    labelY: 325,
  },
  {
    id: 'CT',
    name: 'Connecticut',
    slug: 'connecticut',
    details: "Known as the 'Constitution State'",
    path: 'M840,195 L850,190 L855,200 L845,205 L840,195',
    labelX: 847,
    labelY: 197,
  },
  {
    id: 'MA',
    name: 'Massachusetts',
    slug: 'massachusetts',
    details: 'Site of the Boston Tea Party',
    path: 'M830,180 L860,170 L865,190 L840,200 L830,180',
    labelX: 845,
    labelY: 185,
  },
  {
    id: 'MD',
    name: 'Maryland',
    slug: 'maryland',
    details: 'Named after Queen Henrietta Maria',
    path: 'M810,240 L825,235 L830,245 L815,250 L810,240',
    labelX: 820,
    labelY: 242,
  },
  {
    id: 'SC',
    name: 'South Carolina',
    slug: 'south-carolina',
    details: 'Originally part of a single colony with North Carolina',
    path: 'M810,290 L830,280 L835,300 L815,310 L810,290',
    labelX: 820,
    labelY: 295,
  },
  {
    id: 'NH',
    name: 'New Hampshire',
    slug: 'new-hampshire',
    details: 'Named after Hampshire, England',
    path: 'M840,165 L855,160 L860,175 L845,180 L840,165',
    labelX: 850,
    labelY: 170,
  },
  {
    id: 'VA',
    name: 'Virginia',
    slug: 'virginia',
    details: 'Birthplace of eight U.S. presidents',
    path: 'M790,250 L820,240 L825,260 L795,270 L790,250',
    labelX: 805,
    labelY: 255,
  },
  {
    id: 'NY',
    name: 'New York',
    slug: 'new-york',
    details: 'Originally a Dutch colony called New Netherland',
    path: 'M810,180 L840,170 L845,190 L815,200 L810,180',
    labelX: 825,
    labelY: 185,
  },
  {
    id: 'NC',
    name: 'North Carolina',
    slug: 'north-carolina',
    details: 'Site of the first English attempts at colonization',
    path: 'M800,270 L825,260 L830,280 L805,290 L800,270',
    labelX: 815,
    labelY: 275,
  },
  {
    id: 'RI',
    name: 'Rhode Island',
    slug: 'rhode-island',
    details:
      'Founded by Roger Williams after being banished from Massachusetts',
    path: 'M855,195 L860,190 L865,195 L860,200 L855,195',
    labelX: 860,
    labelY: 195,
  },
];

// Status color mapping
const statusColors = {
  'Not Started': '#102542', // colonial-navy
  Designed: '#5a67d8', // indigo-500
  'In Production': '#851e3e', // colonial-burgundy
  Finished: '#c3a343', // colonial-gold
};

interface InteractiveColoniesMapProps {
  tapestries: TapestryEntry[];
}

export function InteractiveColoniesMap({
  tapestries,
}: InteractiveColoniesMapProps) {
  const router = useRouter();
  const [hoveredColony, setHoveredColony] = useState<string | null>(null);
  const [selectedColony, setSelectedColony] = useState<
    (typeof originalColonies)[0] | null
  >(null);
  const [colonyTapestries, setColonyTapestries] = useState<
    Record<string, { slug: string; status: TapestryStatus }>
  >({});
  const [isClient, setIsClient] = useState(false);

  // Load tapestries and map them to colonies
  useEffect(() => {
    setIsClient(true);

    const loadTapestries = () => {
      try {
        console.log('Mapping tapestries to colonies:', tapestries);

        // Directly map each colony to its status based on the slug
        const tapestryMap: Record<
          string,
          { slug: string; status: TapestryStatus }
        > = {};

        // First, set default statuses for all colonies
        originalColonies.forEach((colony) => {
          // Find matching tapestry by slug
          const tapestry = tapestries.find((t) => t.slug === colony.slug);

          if (tapestry) {
            console.log(`Found tapestry for ${colony.name}:`, tapestry);
            tapestryMap[colony.id] = {
              slug: colony.slug,
              status: tapestry.status,
            };
          } else {
            // Default status if no tapestry found
            tapestryMap[colony.id] = {
              slug: colony.slug,
              status: 'Not Started',
            };
          }
        });

        console.log('Final colony tapestry map:', tapestryMap);
        setColonyTapestries(tapestryMap);
      } catch (error) {
        console.error('Error mapping tapestries:', error);
      }
    };

    loadTapestries();
  }, [tapestries]);

  // Check which colonies have tapestries
  const hasTapestry = (colonyId: string) => {
    try {
      return !!colonyTapestries[colonyId];
    } catch (error) {
      return false;
    }
  };

  // Don't render the map on the server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-colonial-parchment/50 flex items-center justify-center rounded-lg">
        <p className="text-colonial-navy/70">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
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
          {originalColonies.map((colony) => {
            const tapestryInfo = colonyTapestries[colony.id];
            const status = tapestryInfo?.status || 'Not Started';
            const isHovered = hoveredColony === colony.id;

            return (
              <g key={colony.id}>
                <path
                  d={colony.path}
                  fill={isHovered ? '#c3a343' : statusColors[status]}
                  stroke="#f3e9d2"
                  strokeWidth="1"
                  className="transition-all duration-300 cursor-pointer hover:fill-colonial-gold"
                  onMouseEnter={() => setHoveredColony(colony.id)}
                  onMouseLeave={() => setHoveredColony(null)}
                  onClick={() => {
                    setSelectedColony(colony);
                    if (hasTapestry(colony.id)) {
                      router.push(`/tapestry/${colony.slug}`);
                    }
                  }}
                  aria-label={`${colony.name} - ${status}`}
                  role="button"
                  tabIndex={0}
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

      {/* Selected Colony Info */}
      {selectedColony && (
        <div className="colony-info mt-4 p-4 border border-colonial-navy/20 rounded-md shadow-sm bg-white">
          <h3 className="text-xl font-bold text-colonial-navy">
            {selectedColony.name}
          </h3>
          <p className="font-serif text-colonial-navy/80 mt-2">
            {selectedColony.details}
          </p>
          {colonyTapestries[selectedColony.id] ? (
            <div>
              <p className="mt-2 text-sm">
                <span className="font-medium">Status:</span>{' '}
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                  style={{
                    backgroundColor:
                      statusColors[colonyTapestries[selectedColony.id].status],
                  }}
                >
                  {colonyTapestries[selectedColony.id].status}
                </span>
              </p>
              <p className="mt-2 text-sm text-colonial-burgundy">
                <a
                  href={`/tapestry/${colonyTapestries[selectedColony.id].slug}`}
                  className="underline hover:text-colonial-gold transition-colors"
                >
                  View {selectedColony.name} Tapestry
                </a>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-colonial-navy/60 italic">
              Tapestry not available
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-colonial-navy rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">Not Started</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">Designed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-colonial-burgundy rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">In Production</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-colonial-gold rounded-sm mr-2"></div>
          <span className="text-sm text-colonial-navy">Finished</span>
        </div>
      </div>
    </div>
  );
}
