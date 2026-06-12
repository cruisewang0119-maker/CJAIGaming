# PulseCity

A high-fidelity demo of a real-time city intelligence platform for Seattle, WA.
Conversational AI queries + live event feed + interactive Mapbox map.

## Features

- **Conversational city queries** via Claude (Sonnet 4.6) with Tool Use + streaming
- **Live event feed** — mock data + optional live Reddit classification (Haiku 4.5)
- **Interactive Mapbox map** — pulsing event bubbles, impact radius, POI highlights
- **AI predictions** — traffic surges, crowd build-ups, anomaly detection
- **Realtime hooks** — auto-refreshing events, breaking alerts, city pulse score

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Anthropic API key — used server-side for chat (Sonnet 4.6) and event classification (Haiku 4.5). Get one at [console.anthropic.com](https://console.anthropic.com). |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | **Yes** | Mapbox public token for map rendering. Get one at [account.mapbox.com](https://account.mapbox.com). |
| `REDDIT_CLIENT_ID` | No | Reddit app client ID for live r/Seattle data. If empty, app runs in **mock-only mode** with no error. |
| `REDDIT_CLIENT_SECRET` | No | Reddit app client secret. Required if `REDDIT_CLIENT_ID` is set. |

### Getting Reddit credentials (optional)

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click **Create app** → choose type **script**
3. Set redirect URI to `http://localhost:3000`
4. Copy the client ID (under the app name) and secret

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from example
cp .env.example .env.local
# → Fill in ANTHROPIC_API_KEY and NEXT_PUBLIC_MAPBOX_TOKEN at minimum

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Vercel Deploy

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. In Vercel Dashboard → Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `REDDIT_CLIENT_ID` (optional)
   - `REDDIT_CLIENT_SECRET` (optional)
4. Deploy — `vercel.json` already configures 60s max duration for `/api/chat` and CORS headers

## Architecture

```
app/
├── api/
│   ├── chat/route.ts     — Claude Sonnet 4.6 with Tool Use + SSE streaming
│   ├── events/route.ts   — Event feed (mock + prediction engine)
│   └── reddit/route.ts   — Live Reddit posts → Haiku classification
lib/
├── city-tools.ts         — Tool schemas + executors (search_events, query_poi…)
├── reddit-client.ts      — Reddit OAuth2 client (mock-only if no credentials)
├── classify-events.ts    — Single batched Haiku call for event classification
├── prediction-engine.ts  — Time-aware traffic + crowd predictions
├── hooks.ts              — useRealtimeEvents, useCityPulse, useBreakingAlert
└── types.ts              — All TypeScript types (no `any`)
components/
├── ChatPanel.tsx         — Streaming chat with tool call indicators + POI chips
├── MapView.tsx           — Mapbox GL, pulsing markers, impact radius
├── EventFeed.tsx         — SWR-powered live event list
├── ToolCallIndicator.tsx — "AI is querying…" animated status
└── EventDetailDrawer.tsx — Slide-in event detail panel
```
