// Mapbox configuration
export const MAPBOX_ACCESS_TOKEN = process.env['NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN'] || '';

// Map style - using a colonial-themed style
// You can replace this with your own custom style from Mapbox Studio
export const MAPBOX_STYLE = process.env['NEXT_PUBLIC_DEFAULT_MAPBOX_STYLE'] || 'mapbox://styles/mapbox/light-v11';

// Default map center for the 13 colonies region (roughly centered on Pennsylvania)
export const DEFAULT_CENTER = {
  longitude: -77.5,
  latitude: 39.8,
};

export const DEFAULT_ZOOM = 4.5;

// Map bounds for the 13 colonies (to ensure the map stays focused on this region)
export const MAP_BOUNDS = [
  [-85.7, 29.8], // Southwest coordinates [lng, lat]
  [-69.7, 45.5], // Northeast coordinates [lng, lat]
] as [number, number][];