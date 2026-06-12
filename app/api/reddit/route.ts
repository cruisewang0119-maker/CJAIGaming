import { NextResponse } from 'next/server';
import { SEATTLE_EVENTS } from '@/lib/mock-data';
import { fetchLocalPosts } from '@/lib/reddit-client';
import { classifyPosts } from '@/lib/classify-events';
import { CityEvent } from '@/lib/types';

export const revalidate = 300; // 5-minute cache

export async function GET(): Promise<NextResponse> {
  // Mock events are always included — demo must never show empty state
  const mockEvents: CityEvent[] = [...SEATTLE_EVENTS];

  try {
    // 3-second timeout for the entire Reddit pipeline
    const redditEvents = await Promise.race<CityEvent[]>([
      (async () => {
        const posts = await fetchLocalPosts(['Seattle', 'SeattleWA'], 25);
        return classifyPosts(posts);
      })(),
      new Promise<CityEvent[]>((resolve) => setTimeout(() => resolve([]), 3000)),
    ]);

    // Merge: mock events first, then unique Reddit events
    const existingIds = new Set(mockEvents.map((e) => e.id));
    const newEvents = redditEvents.filter((e) => !existingIds.has(e.id));
    const merged = [...mockEvents, ...newEvents];

    return NextResponse.json(merged, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    // Any error → return mock only (fault-injection safe)
    return NextResponse.json(mockEvents, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  }
}
