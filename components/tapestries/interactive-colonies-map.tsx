'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Map, {
  Source,
  Layer,
  NavigationControl,
  Popup,
  MapRef,
  LayerProps,
  MapLayerMouseEvent,
} from 'react-map-gl/mapbox';
import type { TapestryEntry, TapestryStatus } from '@/lib/tapestries';
import { SectionHeader } from '@/components/ui/section-header';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAP_BOUNDS,
} from '@/lib/mapbox-config';

// Status color mapping
const statusColors = {
  'Not Started': '#102542', // colonial-navy
  Designed: '#5a67d8', // indigo-500
  'In Production': '#711322', // colonial-burgundy
  Finished: '#e8b903', // colonial-gold (updated)
};

// Define layer styles
const fillLayer: LayerProps = {
  id: 'colonies-fill',
  type: 'fill',
  paint: {
    'fill-opacity': 0.6,
    'fill-color': [
      'match',
      ['get', 'status'],
      'Finished',
      statusColors.Finished,
      'In Production',
      statusColors['In Production'],
      'Designed',
      statusColors.Designed,
      statusColors['Not Started'], // default
    ],
  },
};

const lineLayer: LayerProps = {
  id: 'colonies-outline',
  type: 'line',
  paint: {
    'line-color': '#f3e9d2',
    'line-width': 1,
  },
};

const hoverLineLayer: LayerProps = {
  id: 'colonies-hover-outline',
  type: 'line',
  source: 'hover',
  paint: {
    'line-color': '#e8b903',
    'line-width': 2,
  },
};

interface InteractiveColoniesMapProps {
  tapestries: TapestryEntry[];
}

export function InteractiveColoniesMap({
  tapestries,
}: InteractiveColoniesMapProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [hoveredColony, setHoveredColony] = useState<any>(null);
  const [selectedColony, setSelectedColony] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Load GeoJSON data for colonies
  useEffect(() => {
    setIsClient(true);

    const fetchColoniesData = async () => {
      try {
        const response = await fetch('/data/gz_2010_us_040_00_500k.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Map of state FIPS or abbreviations to slugs for the 13 colonies
        const colonyMapping: { [key: string]: string } = {
          Delaware: 'delaware',
          Pennsylvania: 'pennsylvania',
          'New Jersey': 'new-jersey',
          Georgia: 'georgia',
          Connecticut: 'connecticut',
          Massachusetts: 'massachusetts',
          Maryland: 'maryland',
          'South Carolina': 'south-carolina',
          'New Hampshire': 'new-hampshire',
          Virginia: 'virginia',
          'New York': 'new-york',
          'North Carolina': 'north-carolina',
          'Rhode Island': 'rhode-island',
        };

        // Filter to only include the 13 original colonies
        const originalColonies = data.features.filter((feature: any) => {
          // Check if this is one of the 13 original colonies by name
          return colonyMapping[feature.properties.NAME] !== undefined;
        });

        // Add tapestry status to each feature
        const enhancedData = {
          type: 'FeatureCollection',
          features: originalColonies.map((feature: any) => {
            const stateName = feature.properties.NAME;
            const slug = colonyMapping[stateName];
            const tapestry = tapestries.find((t) => t.slug === slug);

            return {
              ...feature,
              properties: {
                ...feature.properties,
                name: stateName,
                slug: slug,
                status: tapestry?.status || 'Not Started',
                details: getColonyDetails(stateName),
              },
            };
          }),
        };

        setGeoJsonData(enhancedData);
      } catch (error) {
        console.error('Error loading colonies GeoJSON:', error);
      }
    };

    // Helper function to provide colony details
    const getColonyDetails = (stateName: string): string => {
      const details: { [key: string]: string } = {
        Delaware: 'First state to ratify the Constitution (1787)',
        Pennsylvania:
          'Home to Independence Hall where the Declaration of Independence was signed',
        'New Jersey': 'Third state to ratify the Constitution',
        Georgia: 'Southernmost of the original 13 colonies',
        Connecticut: "Known as the 'Constitution State'",
        Massachusetts: 'Site of the Boston Tea Party',
        Maryland: 'Named after Queen Henrietta Maria',
        'South Carolina':
          'Originally part of a single colony with North Carolina',
        'New Hampshire': 'Named after Hampshire, England',
        Virginia: 'Birthplace of eight U.S. presidents',
        'New York': 'Originally a Dutch colony called New Netherland',
        'North Carolina': 'Site of the first English attempts at colonization',
        'Rhode Island':
          'Founded by Roger Williams after being banished from Massachusetts',
      };

      return details[stateName] || '';
    };

    fetchColoniesData();
  }, [tapestries]);

  // Create a GeoJSON source for the hovered colony
  const hoverData = useMemo(() => {
    if (!hoveredColony) return null;
    return {
      type: 'FeatureCollection',
      features: [hoveredColony],
    };
  }, [hoveredColony]);

  // State for popup coordinates
  const [popupCoords, setPopupCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // Handle mouse move over the map
  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    if (!event.features || event.features.length === 0) {
      setHoveredColony(null);
      setPopupCoords(null);
      return;
    }

    const hoveredFeature = event.features[0];
    if (hoveredFeature.layer.id === 'colonies-fill') {
      setHoveredColony(hoveredFeature);
      setPopupCoords({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    }
  }, []);

  // Handle mouse leave
  const onMouseLeave = useCallback(() => {
    setHoveredColony(null);
    setPopupCoords(null);
  }, []);

  // Handle click on colony
  const onColonyClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!event.features || event.features.length === 0) return;

      const clickedFeature = event.features[0];
      if (clickedFeature.layer.id === 'colonies-fill') {
        const colony = clickedFeature.properties;
        setSelectedColony(colony);

        // Only navigate if the colony's status is not "Not Started"
        if (colony.slug && colony.status !== 'Not Started') {
          const tapestry = tapestries.find((t) => t.slug === colony.slug);
          if (tapestry) {
            router.push(`/tapestries/${colony.slug}`);
          }
        }
      }
    },
    [router, tapestries],
  );

  // Reset map view
  const resetView = useCallback(() => {
    mapRef.current?.fitBounds(
      MAP_BOUNDS as [[number, number], [number, number]],
      {
        padding: 40,
        duration: 1000,
      },
    );
  }, []);

  // Don't render the map on the server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-colonial-parchment/50">
        <p className="text-colonial-navy/70">Loading map...</p>
      </div>
    );
  }

  // Map component ready to render

  return (
    <>
      <SectionHeader
        title="The Original Thirteen Colonies"
        description="Explore the tapestries representing the original thirteen colonies. Click on a colony to view its tapestry."
      />

      <div className="mx-auto mt-8 w-full max-w-4xl">
        <div
          className="relative w-full rounded-lg overflow-hidden shadow-md"
          style={{ height: '500px' }}
        >
          {geoJsonData ? (
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
              initialViewState={{
                longitude: DEFAULT_CENTER.longitude,
                latitude: DEFAULT_CENTER.latitude,
                zoom: DEFAULT_ZOOM,
              }}
              mapStyle={MAPBOX_STYLE}
              interactiveLayerIds={['colonies-fill']}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              onClick={onColonyClick}
              onLoad={resetView}
            >
              <NavigationControl position="top-right" />

              <Source id="colonies" type="geojson" data={geoJsonData}>
                <Layer {...fillLayer} />
                <Layer {...lineLayer} />
              </Source>

              {hoverData && (
                <Source id="hover" type="geojson" data={hoverData}>
                  <Layer {...hoverLineLayer} />
                </Source>
              )}

              {hoveredColony && popupCoords && (
                <Popup
                  longitude={popupCoords.lng}
                  latitude={popupCoords.lat}
                  closeButton={false}
                  closeOnClick={false}
                  className="z-10"
                >
                  <div className="px-2 py-1">
                    <h3 className="font-bold text-sm text-colonial-navy">
                      {hoveredColony.properties.name}
                    </h3>
                    <p className="text-xs mt-1 text-colonial-navy/80">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-white text-[10px]"
                        style={{
                          backgroundColor:
                            statusColors[
                              hoveredColony.properties.status as TapestryStatus
                            ],
                        }}
                      >
                        {hoveredColony.properties.status}
                      </span>
                    </p>
                  </div>
                </Popup>
              )}
            </Map>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-colonial-navy/70">Loading map data...</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-colonial-navy/10">
          <h3 className="text-sm font-bold text-colonial-navy mb-2">
            Tapestry Status
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center">
                <div
                  className="mr-2 h-4 w-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-colonial-navy">{status}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-colonial-navy/80 italic">
              Click on a colony to view its tapestry details
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
