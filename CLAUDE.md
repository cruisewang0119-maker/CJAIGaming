# PulseCity — Project Context

## What this is
A high-fidelity demo of a real-time city intelligence platform for Seattle, WA.
Core loop: multi-source local events → AI structuring → POI linking → 
conversational city queries → map visualization.

## Tech stack
- Next.js 14 (App Router), TypeScript strict mode, Tailwind CSS
- Mapbox GL JS via react-map-gl (dark-v11 style, centered on Seattle)
- Anthropic API: claude-sonnet-4-6 for chat (with tool use + streaming),
  claude-haiku-4-5 for event classification
- SWR for data fetching, Zustand if global state is needed
- Mock data + live Reddit data (r/Seattle, r/SeattleWA)

## Architecture rules
- All Anthropic API calls happen server-side only (app/api routes)
- The chat API uses TOOL USE: Claude calls search_events / query_poi / 
  get_predictions tools defined in lib/city-tools.ts. Never inject the full
  event database into the system prompt.
- Chat responses stream via Server-Sent Events
- All types live in lib/types.ts — no `any`, no inline type definitions
- All coordinates are real Seattle coordinates (lat ~47.6, lng ~-122.3)
- Reddit fetch failures must silently fall back to mock data — the demo
  must never show an error state from a flaky external API

## Design system
- Dark theme: bg #0a0a0f, surface #12131a, border #1e2030
- Category colors: Safety #ef4444, Events #3b82f6, Traffic #f59e0b, Civic #22c55e
- Predicted events: dashed border, PREDICTED badge, confidence %
- Font: Inter. Flat design, no gradients.

## Demo priorities (in order)
1. Conversational city query with visible tool calls — the wow moment
2. Map with pulsing event bubbles + chat-to-map POI highlighting
3. Event feed with predicted events
4. Everything else is polish
