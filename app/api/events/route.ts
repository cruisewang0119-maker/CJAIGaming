import { NextRequest, NextResponse } from 'next/server';
import { SEATTLE_EVENTS } from '@/lib/mock-data';
import { haversineDistance } from '@/lib/geo-utils';
import { getPredictionsForTime } from '@/lib/prediction-engine';
import { CityEventWithDistance, EventCategory } from '@/lib/types';

export const revalidate = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const categoryParam = searchParams.get('category') ?? 'all';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const radiusParam = searchParams.get('radius_miles');

  const userLat = latParam ? parseFloat(latParam) : null;
  const userLng = lngParam ? parseFloat(lngParam) : null;
  const radiusMiles = radiusParam ? parseFloat(radiusParam) : null;

  const now = new Date();
  const currentHour = now.getHours();

  const enginePredictions = getPredictionsForTime(currentHour);
  // Merge mock events with engine predictions, deduplicating by id
  const existingIds = new Set(SEATTLE_EVENTS.map((e) => e.id));
  const newPredictions = enginePredictions.filter((e) => !existingIds.has(e.id));
  const allEvents = [...SEATTLE_EVENTS, ...newPredictions];

  // Filter: non-expired only
  let filtered = allEvents.filter((evt) => new Date(evt.expiresAt) > now);

  // Filter by category
  if (categoryParam !== 'all') {
    filtered = filtered.filter((evt) => evt.category === (categoryParam as EventCategory));
  }

  // Add distanceMiles and filter by radius
  let events: CityEventWithDistance[] = filtered.map((evt) => {
    if (userLat !== null && userLng !== null) {
      const distanceMiles = haversineDistance(userLat, userLng, evt.lat, evt.lng);
      return { ...evt, distanceMiles };
    }
    return { ...evt };
  });

  if (userLat !== null && userLng !== null && radiusMiles !== null) {
    events = events.filter(
      (evt) => evt.distanceMiles !== undefined && evt.distanceMiles <= radiusMiles,
    );
  }

  // Sort: ongoing/resolved by heatScore desc, predicted last
  events.sort((a, b) => {
    const aIsPred = a.status === 'predicted';
    const bIsPred = b.status === 'predicted';
    if (aIsPred && !bIsPred) return 1;
    if (!aIsPred && bIsPred) return -1;
    return b.heatScore - a.heatScore;
  });

  return NextResponse.json(events, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
