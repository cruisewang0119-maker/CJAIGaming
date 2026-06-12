import Anthropic from '@anthropic-ai/sdk';
import { RedditPost, CityEvent, EventCategory, EventSeverity, ClassifiedPost } from './types';

const client = new Anthropic();

// Seattle place name → real coordinates lookup
const SEATTLE_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Capitol Hill': { lat: 47.6162, lng: -122.3191 },
  'Pioneer Square': { lat: 47.6003, lng: -122.3326 },
  'Downtown': { lat: 47.6062, lng: -122.3321 },
  'Pike Place Market': { lat: 47.6097, lng: -122.3416 },
  'Pike Place': { lat: 47.6097, lng: -122.3416 },
  'Fremont': { lat: 47.6508, lng: -122.3471 },
  'Ballard': { lat: 47.6658, lng: -122.3825 },
  'South Lake Union': { lat: 47.6244, lng: -122.3369 },
  'SLU': { lat: 47.6244, lng: -122.3369 },
  'Queen Anne': { lat: 47.6373, lng: -122.3573 },
  'Belltown': { lat: 47.6140, lng: -122.3467 },
  'First Hill': { lat: 47.6082, lng: -122.3195 },
  'Central District': { lat: 47.6062, lng: -122.2960 },
  'Columbia City': { lat: 47.5597, lng: -122.2897 },
  'Beacon Hill': { lat: 47.5697, lng: -122.3063 },
  'University District': { lat: 47.6614, lng: -122.3140 },
  'U District': { lat: 47.6614, lng: -122.3140 },
  'Wallingford': { lat: 47.6606, lng: -122.3379 },
  'Green Lake': { lat: 47.6804, lng: -122.3295 },
  'Northgate': { lat: 47.7057, lng: -122.3262 },
  'Rainier Valley': { lat: 47.5530, lng: -122.2844 },
  'Georgetown': { lat: 47.5565, lng: -122.3254 },
  'SODO': { lat: 47.5770, lng: -122.3318 },
  'Seattle Center': { lat: 47.6218, lng: -122.3517 },
  'Waterfront': { lat: 47.6075, lng: -122.3474 },
};

function resolveLocation(mention: string | null): { lat: number; lng: number } | null {
  if (!mention) return null;
  const key = Object.keys(SEATTLE_LOCATIONS).find((k) =>
    mention.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? SEATTLE_LOCATIONS[key] : null;
}

interface BatchItem {
  index: number;
  title: string;
  snippet: string;
}

interface ClassifiedBatchItem extends ClassifiedPost {
  index: number;
}

export async function classifyPosts(posts: RedditPost[]): Promise<CityEvent[]> {
  if (posts.length === 0) return [];

  const batch = posts.slice(0, 15);
  const items: BatchItem[] = batch.map((p, i) => ({
    index: i,
    title: p.title.slice(0, 200),
    snippet: (p.selftext ?? '').slice(0, 300),
  }));

  const prompt = `You are a city intelligence classifier for Seattle, WA. Classify each Reddit post.
Return ONLY a JSON array — no prose, no markdown fences, no explanation.
Each element must have: { "index": number, "is_local_event": boolean, "category": "Safety"|"Traffic"|"Hazard"|"Events"|"Business"|"Civic"|"Community", "severity": "low"|"medium"|"high"|"critical", "title": string (cleaned up, max 100 chars), "summary": string (1 sentence, max 120 chars), "location_mention": string|null (Seattle neighborhood/place or null), "confidence": number (0.0-1.0) }

Posts to classify:
${JSON.stringify(items)}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (response.content[0] as { type: string; text: string }).text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const classified: ClassifiedBatchItem[] = JSON.parse(rawText);
    const now = new Date();
    const events: CityEvent[] = [];

    for (const item of classified) {
      if (!item.is_local_event || item.confidence < 0.6) continue;
      const post = batch[item.index];
      if (!post) continue;
      const coords = resolveLocation(item.location_mention);
      if (!coords) continue;

      const createdAt = new Date(post.created_utc * 1000).toISOString();
      const expiresAt = new Date(post.created_utc * 1000 + 12 * 60 * 60 * 1000).toISOString();
      if (new Date(expiresAt) <= now) continue;

      events.push({
        id: `reddit-${post.id}`,
        title: item.title.slice(0, 100),
        summary: item.summary,
        category: item.category as EventCategory,
        severity: item.severity as EventSeverity,
        sources: [
          {
            platform: `Reddit r/${post.subreddit}`,
            url: `https://reddit.com${post.permalink}`,
            credibility: 0.65,
            timestamp: createdAt,
          },
        ],
        pois: [],
        lat: coords.lat,
        lng: coords.lng,
        impactRadiusMeters: 300,
        heatScore: Math.min(100, Math.round(Math.log2(Math.max(1, post.score) + 1) * 10)),
        trend: 'stable',
        createdAt,
        expiresAt,
        status: 'ongoing',
      });
    }

    return events;
  } catch (err) {
    console.error('[classify-events] Haiku classification failed:', err);
    return [];
  }
}
