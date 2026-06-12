'use client';

import { useRef, useEffect, useCallback } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, LayerProps } from 'react-map-gl/mapbox';
import useSWR from 'swr';
import { CityEvent, POI } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#ef4444',
  Traffic: '#f59e0b',
  Events: '#3b82f6',
  Civic: '#22c55e',
  Business: '#8b5cf6',
  Hazard: '#f97316',
  Community: '#06b6d4',
};

// Approximate a geographic circle as a GeoJSON polygon
function makeCircleCoords(
  lat: number,
  lng: number,
  radiusMeters: number,
): number[][] {
  const steps = 64;
  const coords: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    coords.push([
      lng + dx / (111_320 * Math.cos((lat * Math.PI) / 180)),
      lat + dy / 111_320,
    ]);
  }
  return coords;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MapViewProps {
  selectedEvent: CityEvent | null;
  onEventSelect: (event: CityEvent) => void;
  highlightedPois: POI[];
}

export default function MapView({ selectedEvent, onEventSelect, highlightedPois }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const { data: events = [] } = useSWR<CityEvent[]>('/api/events', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  // flyTo first highlighted POI when it changes
  useEffect(() => {
    if (highlightedPois.length > 0 && mapRef.current) {
      const first = highlightedPois[0];
      mapRef.current.flyTo({
        center: [first.lng, first.lat],
        zoom: 14,
        duration: 1500,
        essential: true,
      });
    }
  }, [highlightedPois]);

  const handleLoad = useCallback(() => {
    // Heatmap layer skipped: react-map-gl Source typing prevents clean integration
    // Markers-only mode active per fallback policy
    console.info('[MapView] Map loaded; heatmap layer skipped, using markers only.');
  }, []);

  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f1117] gap-3">
        <div className="text-2xl">🗺️</div>
        <p className="text-[#6b7280] text-sm text-center px-4">
          Map requires <code className="font-mono text-[#3b82f6]">NEXT_PUBLIC_MAPBOX_TOKEN</code>
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm px-4">
          {events.slice(0, 6).map((evt) => (
            <button
              key={evt.id}
              onClick={() => onEventSelect(evt)}
              className="text-xs px-2 py-1 rounded border border-[#1e2030] hover:bg-[#12131a] transition-colors"
              style={{ color: CATEGORY_COLORS[evt.category] ?? '#6b7280', borderColor: (CATEGORY_COLORS[evt.category] ?? '#6b7280') + '44' }}
            >
              {evt.category}: {evt.title.slice(0, 28)}…
            </button>
          ))}
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS[selectedEvent?.category ?? 'Events'] ?? '#3b82f6';

  const impactData = selectedEvent
    ? {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [makeCircleCoords(selectedEvent.lat, selectedEvent.lng, selectedEvent.impactRadiusMeters)],
        },
        properties: {},
      }
    : null;

  const fillLayer: LayerProps = {
    id: 'impact-fill',
    type: 'fill',
    paint: {
      'fill-color': color,
      'fill-opacity': 0.15,
    },
  };

  const strokeLayer: LayerProps = {
    id: 'impact-stroke',
    type: 'line',
    paint: {
      'line-color': color,
      'line-width': 2,
      'line-opacity': 0.6,
    },
  };

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: -122.3321, latitude: 47.6062, zoom: 12 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onLoad={handleLoad}
    >
      {/* Event markers — staggered bubble-enter entrance */}
      {events.map((evt, idx) => {
        const evtColor = CATEGORY_COLORS[evt.category] ?? '#6b7280';
        const isCritical = evt.severity === 'critical';
        const isSelected = selectedEvent?.id === evt.id;
        const isPredicted = evt.status === 'predicted';
        return (
          <Marker key={evt.id} longitude={evt.lng} latitude={evt.lat} anchor="center">
            <button
              onClick={(e) => { e.stopPropagation(); onEventSelect(evt); }}
              style={{
                width: 36, height: 36, position: 'relative', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0,
                animation: 'bubble-enter 0.4s ease-out both',
                animationDelay: `${idx * 60}ms`,
              }}
              aria-label={evt.title}
            >
              {/* Outer pulse ring */}
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: evtColor,
                  opacity: 0.25,
                  animation: isCritical ? 'pulse-ring 1s ease-out infinite' : 'pulse-ring 2.5s ease-out infinite',
                }}
              />
              {/* Core dot */}
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isSelected ? 20 : 16,
                  height: isSelected ? 20 : 16,
                  borderRadius: '50%',
                  backgroundColor: evtColor,
                  border: isSelected ? '2px solid white' : isPredicted ? `2px dashed ${evtColor}aa` : 'none',
                  boxShadow: isSelected ? `0 0 0 3px ${evtColor}44` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </button>
          </Marker>
        );
      })}

      {/* Highlighted POI markers */}
      {highlightedPois.map((poi) => (
        <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="center">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#3b82f622',
              border: '2px solid #3b82f6',
              boxShadow: '0 0 0 4px rgba(59,130,246,0.3)',
              animation: 'poi-glow 1.5s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
              }}
            />
          </div>
        </Marker>
      ))}

      {/* Impact radius */}
      {impactData && selectedEvent && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Source id="impact-radius" type="geojson" data={impactData as any}>
          <Layer {...fillLayer} />
          <Layer {...strokeLayer} />
        </Source>
      )}
    </Map>
  );
}
