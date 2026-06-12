import { Tool } from '@anthropic-ai/sdk/resources/messages';
import {
  EventCategory,
  CityEvent,
  SearchEventsInput,
  QueryPoiInput,
  GetPredictionsInput,
  GetAreaStatusInput,
} from './types';
import { SEATTLE_EVENTS, SEATTLE_POIS, CITY_STATS } from './mock-data';

function haversineDistanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Compact event shape to keep token use low
interface CompactEvent {
  id: string;
  title: string;
  category: EventCategory;
  severity: string;
  distance?: string;
  heatScore: number;
  status: string;
  neighborhood?: string;
  predictedPeakAt?: string;
  confidence?: number;
}

function toCompact(event: CityEvent, distanceMiles?: number): CompactEvent {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    severity: event.severity,
    distance: distanceMiles !== undefined ? `${distanceMiles.toFixed(1)} mi` : undefined,
    heatScore: event.heatScore,
    status: event.status,
    predictedPeakAt: event.predictedPeakAt,
    confidence: event.confidence,
  };
}

function searchEvents(input: SearchEventsInput, liveEvents: CityEvent[] = []): string {
  const allEvents = [...SEATTLE_EVENTS, ...liveEvents];
  const {
    category,
    neighborhood,
    near,
    radius_miles = 5,
    include_predicted = true,
    max_results = 10,
  } = input;

  let filtered = allEvents.filter((e) => {
    if (!include_predicted && e.status === 'predicted') return false;
    if (category && e.category !== category) return false;
    return true;
  });

  if (neighborhood) {
    const q = neighborhood.toLowerCase();
    filtered = filtered.filter((e) => {
      const poiNeighborhoods = e.pois.map((pid) =>
        SEATTLE_POIS.find((p) => p.id === pid)?.neighborhood ?? '',
      );
      return (
        poiNeighborhoods.some((n) => n.toLowerCase().includes(q)) ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q)
      );
    });
  }

  let withDistance: { event: CityEvent; dist?: number }[] = filtered.map((e) => ({ event: e }));

  if (near) {
    withDistance = withDistance
      .map((item) => ({
        ...item,
        dist: haversineDistanceMiles(near.lat, near.lng, item.event.lat, item.event.lng),
      }))
      .filter((item) => (item.dist ?? 0) <= radius_miles);
  }

  withDistance.sort((a, b) => {
    if (a.dist !== undefined && b.dist !== undefined) return a.dist - b.dist;
    return b.event.heatScore - a.event.heatScore;
  });

  const results = withDistance.slice(0, max_results).map((item) =>
    toCompact(item.event, item.dist),
  );

  return JSON.stringify({ count: results.length, events: results });
}

function queryPoi(input: QueryPoiInput): string {
  const { query, category, neighborhood, near, exclude_near_events = false, max_results = 8 } = input;

  let pois = [...SEATTLE_POIS];

  if (neighborhood) {
    const q = neighborhood.toLowerCase();
    pois = pois.filter((p) => p.neighborhood.toLowerCase().includes(q));
  }

  if (category) {
    const q = category.toLowerCase();
    pois = pois.filter((p) => p.category.toLowerCase().includes(q));
  }

  if (query) {
    const q = query.toLowerCase();
    pois = pois.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    );
  }

  if (exclude_near_events) {
    const activeHighSeverityEvents = SEATTLE_EVENTS.filter(
      (e) => e.status === 'ongoing' && (e.severity === 'high' || e.severity === 'critical'),
    );
    pois = pois.filter((poi) => {
      return !activeHighSeverityEvents.some(
        (e) => haversineDistanceMiles(poi.lat, poi.lng, e.lat, e.lng) < 0.3,
      );
    });
  }

  if (near) {
    pois = pois
      .map((p) => ({ poi: p, dist: haversineDistanceMiles(near.lat, near.lng, p.lat, p.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .map(({ poi }) => poi);
  } else {
    pois = pois.sort((a, b) => (b.dynamic?.heatScore ?? 0) - (a.dynamic?.heatScore ?? 0));
  }

  const results = pois.slice(0, max_results).map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    category: p.category,
    neighborhood: p.neighborhood,
    heatScore: p.dynamic?.heatScore,
    trend: p.dynamic?.trend,
  }));

  return JSON.stringify({ count: results.length, pois: results });
}

function getPredictions(input: GetPredictionsInput): string {
  const { hours_ahead = 4, category } = input;
  let predicted = SEATTLE_EVENTS.filter((e) => e.status === 'predicted');
  if (category) {
    predicted = predicted.filter((e) => e.category === category);
  }
  const now = Date.now();
  predicted = predicted.filter((e) => {
    if (!e.predictedPeakAt) return true;
    const peakMs = new Date(e.predictedPeakAt).getTime();
    return peakMs <= now + hours_ahead * 60 * 60 * 1000;
  });

  const results = predicted.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    severity: e.severity,
    confidence: e.confidence,
    predictedPeakAt: e.predictedPeakAt,
    predictionReason: e.predictionReason,
    heatScore: e.heatScore,
  }));

  return JSON.stringify({ count: results.length, predictions: results });
}

function getAreaStatus(input: GetAreaStatusInput): string {
  const { neighborhood } = input;
  const q = neighborhood.toLowerCase();
  const stats = CITY_STATS.find((s) => s.neighborhood.toLowerCase().includes(q));
  const activeEvents = SEATTLE_EVENTS.filter((e) => {
    if (e.status !== 'ongoing') return false;
    const poiNeighborhoods = e.pois.map(
      (pid) => SEATTLE_POIS.find((p) => p.id === pid)?.neighborhood ?? '',
    );
    return (
      poiNeighborhoods.some((n) => n.toLowerCase().includes(q)) ||
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q)
    );
  });

  if (!stats) {
    return JSON.stringify({
      neighborhood,
      found: false,
      message: 'Neighborhood not found in city database',
    });
  }

  return JSON.stringify({
    neighborhood: stats.neighborhood,
    heatScore: stats.heatScore,
    trend: stats.trend,
    activeEventCount: activeEvents.length,
    events: activeEvents.slice(0, 5).map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      severity: e.severity,
      heatScore: e.heatScore,
    })),
  });
}

export const CITY_TOOLS: Tool[] = [
  {
    name: 'search_events',
    description:
      'Search currently active and predicted events in the city. Use this whenever the user asks what\'s happening, about safety, traffic, or any specific area.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['Safety', 'Traffic', 'Hazard', 'Events', 'Business', 'Civic', 'Community'],
          description: 'Filter by event category',
        },
        neighborhood: {
          type: 'string',
          description: 'Filter events near this neighborhood name',
        },
        near: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
          required: ['lat', 'lng'],
          description: 'GPS coordinates to search near',
        },
        radius_miles: {
          type: 'number',
          description: 'Search radius in miles (default 5)',
        },
        include_predicted: {
          type: 'boolean',
          description: 'Include predicted/future events (default true)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results (default 10)',
        },
      },
    },
  },
  {
    name: 'query_poi',
    description:
      'Look up places (restaurants, venues, parks, landmarks) from the POI database. Use for any recommendation or "where is" question.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Text search query for POI name or type',
        },
        category: {
          type: 'string',
          description: 'POI category filter (e.g. Restaurant, Bar, Park)',
        },
        neighborhood: {
          type: 'string',
          description: 'Filter by neighborhood name',
        },
        near: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
          required: ['lat', 'lng'],
          description: 'GPS coordinates to sort by proximity',
        },
        exclude_near_events: {
          type: 'boolean',
          description: 'If true, exclude POIs within 0.3mi of active high-severity events',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results (default 8)',
        },
      },
    },
  },
  {
    name: 'get_predictions',
    description:
      'Get AI predictions about what will happen in the next few hours: traffic surges, crowd buildups, event peaks.',
    input_schema: {
      type: 'object' as const,
      properties: {
        hours_ahead: {
          type: 'number',
          description: 'How many hours ahead to look (default 4)',
        },
        category: {
          type: 'string',
          enum: ['Safety', 'Traffic', 'Hazard', 'Events', 'Business', 'Civic', 'Community'],
          description: 'Filter predictions by category',
        },
      },
    },
  },
  {
    name: 'get_area_status',
    description:
      'Get the overall pulse of a neighborhood: heat score, trend, active event count.',
    input_schema: {
      type: 'object' as const,
      properties: {
        neighborhood: {
          type: 'string',
          description: 'Neighborhood name to look up',
        },
      },
      required: ['neighborhood'],
    },
  },
];

export const TOOL_LABELS: Record<string, string> = {
  search_events: 'Searching active events...',
  query_poi: 'Querying POI database...',
  get_predictions: 'Checking prediction models...',
  get_area_status: 'Analyzing neighborhood pulse...',
};

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  liveEvents?: CityEvent[],
): Promise<string> {
  try {
    switch (name) {
      case 'search_events':
        return searchEvents(input as SearchEventsInput, liveEvents);
      case 'query_poi':
        return queryPoi(input as QueryPoiInput);
      case 'get_predictions':
        return getPredictions(input as GetPredictionsInput);
      case 'get_area_status':
        return getAreaStatus(input as unknown as GetAreaStatusInput);
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}
