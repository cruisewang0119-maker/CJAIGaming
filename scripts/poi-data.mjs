/**
 * Mirrors the id/name/lat/lng from lib/mock-data.ts SEATTLE_POIS.
 * Used by test-chat.mjs to validate referencedPois coordinates.
 * Keep in sync with lib/mock-data.ts when POIs are added/changed.
 */
export const SEATTLE_POIS = [
  { id: 'poi-001', name: 'Cal Anderson Park',                   lat: 47.6162, lng: -122.3191 },
  { id: 'poi-002', name: 'Cafe Vita Capitol Hill',              lat: 47.6146, lng: -122.3198 },
  { id: 'poi-003', name: 'Pike Street Bar & Grill',             lat: 47.6155, lng: -122.3157 },
  { id: 'poi-004', name: 'Volunteer Park',                      lat: 47.6306, lng: -122.3155 },
  { id: 'poi-005', name: 'Rhein Haus Seattle',                  lat: 47.6131, lng: -122.3178 },
  { id: 'poi-006', name: "Linda's Tavern",                      lat: 47.6152, lng: -122.3226 },
  { id: 'poi-007', name: 'Rancho Bravo Tacos',                  lat: 47.6147, lng: -122.3199 },
  { id: 'poi-008', name: 'Neumos Music Venue',                  lat: 47.6143, lng: -122.3213 },
  { id: 'poi-009', name: 'Elliott Bay Book Company',            lat: 47.6153, lng: -122.3186 },
  { id: 'poi-010', name: 'Capitol Hill Light Rail Station',     lat: 47.6196, lng: -122.3200 },
  { id: 'poi-011', name: 'Pike Place Market',                   lat: 47.6097, lng: -122.3416 },
  { id: 'poi-012', name: 'Seattle Art Museum',                  lat: 47.6073, lng: -122.3384 },
  { id: 'poi-013', name: 'Pacific Place Mall',                  lat: 47.6118, lng: -122.3345 },
  { id: 'poi-014', name: 'Westlake Center',                     lat: 47.6108, lng: -122.3374 },
  { id: 'poi-015', name: 'Seattle Central Library',             lat: 47.6067, lng: -122.3324 },
  { id: 'poi-016', name: 'Il Bistro',                           lat: 47.6094, lng: -122.3412 },
  { id: 'poi-017', name: 'The Edgewater Hotel',                 lat: 47.6075, lng: -122.3474 },
  { id: 'poi-018', name: 'Amazon Spheres',                      lat: 47.6155, lng: -122.3395 },
  { id: 'poi-019', name: 'Lake Union Park',                     lat: 47.6244, lng: -122.3369 },
  { id: 'poi-020', name: 'Cinerama Theater',                    lat: 47.6160, lng: -122.3423 },
  { id: 'poi-021', name: 'Fremont Troll',                       lat: 47.6508, lng: -122.3471 },
  { id: 'poi-022', name: 'Fremont Sunday Market',               lat: 47.6509, lng: -122.3490 },
  { id: 'poi-023', name: "Brouwer's Cafe",                      lat: 47.6503, lng: -122.3501 },
  { id: 'poi-024', name: 'Ballard Locks (Hiram M. Chittenden)', lat: 47.6655, lng: -122.3950 },
  { id: 'poi-025', name: 'Ballard Farmers Market',              lat: 47.6668, lng: -122.3831 },
  { id: 'poi-026', name: 'The Walrus and the Carpenter',        lat: 47.6658, lng: -122.3825 },
  { id: 'poi-027', name: 'Stoup Brewing Ballard',               lat: 47.6661, lng: -122.3788 },
  { id: 'poi-028', name: 'Occidental Square',                   lat: 47.6003, lng: -122.3326 },
  { id: 'poi-029', name: 'Underground Tour',                    lat: 47.6013, lng: -122.3348 },
  { id: 'poi-030', name: 'Zeitgeist Coffee',                    lat: 47.6001, lng: -122.3318 },
];

/** Seattle bounding box for coordinate range checks */
export const SEATTLE_BOUNDS = {
  minLat: 47.50,
  maxLat: 47.75,
  minLng: -122.45,
  maxLng: -122.20,
};
