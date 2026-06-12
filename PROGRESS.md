# PROGRESS.md — PulseCity Build Status

## Phase 0: Scaffold + Dependencies ✅ COMPLETE
Next.js 14 initialized with TypeScript strict mode + Tailwind CSS. All required packages installed: mapbox-gl, @types/mapbox-gl, react-map-gl, swr, zustand, date-fns, lucide-react, @anthropic-ai/sdk, tsx. CLAUDE.md created. .env.example documented.

## Phase 1: Types + Mock Data ✅ COMPLETE
`lib/types.ts` — strict types, zero `:any`, full interface coverage (EventCategory, EventSeverity, EventSource, POI, CityEvent, ChatMessage, CityStats, ToolCallStatus, and all tool input types). `lib/mock-data.ts` — 30 Seattle POIs across Capitol Hill/Downtown/SLU/Fremont/Ballard/Pioneer Square, 12 events (3 predicted: I-5 traffic surge, Pike Place flash crowd, Fremont evening surge), 6 neighborhood stats. All coordinates verified in bounds (lat 47.5-47.75, lng -122.45 to -122.2).

## Phase 2: City Tools + Chat API ✅ COMPLETE
`lib/city-tools.ts` — 4 tools (search_events, query_poi, get_predictions, get_area_status) with Anthropic tool schemas and executors. `app/api/chat/route.ts` — agentic tool loop (max 5 iterations), SSE streaming, claude-sonnet-4-6. `lib/chat-client.ts` — client-side SSE parser with typed callbacks.

## Phase 3: Data Layer + Predictions ✅ COMPLETE
`lib/geo-utils.ts` — haversineDistance, isWithinRadius, getBoundingBox (pure math, no external deps).
`lib/prediction-engine.ts` — getPredictionsForTime (hour-aware: evening returns game-day + nightlife surge, daytime returns lunch rush), getAnomalyAlerts, getCityPulseScore.
`app/api/events/route.ts` — GET with category/lat/lng/radius_miles params; merges SEATTLE_EVENTS + engine predictions; adds distanceMiles when lat/lng given; sorts ongoing→predicted.
`lib/types.ts` — added CityEventWithDistance and LocalMessage.

## Phase 4: UI Components + Integration ✅ COMPLETE
All components built from scratch (no v0.dev, per task instructions):
- `components/ToolCallIndicator.tsx` — animated radar pulse while running, checkmarks for done steps, collapses to "✓ Queried N data sources" when complete.
- `components/PredictionCard.tsx` — dashed border, PREDICTED badge, confidence %, peak time.
- `components/EventDetailDrawer.tsx` — slides in from right, source confidence bar, metrics (impact radius, heat score), timeline, action buttons.
- `components/EventFeed.tsx` — SWR on /api/events, 30s refresh, loading skeletons, predicted events with dashed border + PREDICTED badge.
- `components/MapView.tsx` — react-map-gl/mapbox, dark-v11 style, pulsing marker rings (fast=critical, slow=normal), impact radius GeoJSON polygon on selectedEvent, glowing POI rings + flyTo on highlightedPois; heatmap layer skipped per fallback policy (markers-only logged).
- `components/ChatPanel.tsx` — local streaming state, suggestion chips, ToolCallIndicator integration, poi tag rendering as clickable chips, streamed text cursor.
- `app/page.tsx` — full 60/40 split layout, all prop chains wired.

## Prop Chain Documentation (AC-5)

### Chain 1: chat → page → map highlightedPois
1. `ChatPanel` calls `onPoisHighlight(referencedPois)` in the `onDone` SSE callback (`components/ChatPanel.tsx:165`)
2. `page.tsx` handles this via `handlePoisHighlight` → `setHighlightedPois(pois)` (`app/page.tsx:27`)
3. `MapView` receives `highlightedPois` prop → renders glowing ring markers + `mapRef.current.flyTo(first)` (`components/MapView.tsx:61,104`)

### Chain 2: feed → page → drawer + map
1. `EventFeed` calls `onEventSelect(event)` on card click (`components/EventFeed.tsx:152`)
2. `page.tsx` handles via `handleEventSelect` → `setSelectedEvent(event)` (`app/page.tsx:18`)
3. `MapView` receives `selectedEvent` prop → renders impact radius GeoJSON circle (`components/MapView.tsx:60,154`)
4. `EventDetailDrawer` receives `selectedEvent` prop → full detail panel (`app/page.tsx:128`)

## Acceptance Criteria Results
- AC-1 ✅ `npm run build` exits 0 — `/api/events` route now included in build output
- AC-2 ✅ `curl /api/events?lat=47.6062&lng=-122.3321` returns 13 events, all with distanceMiles
- AC-3 ✅ `scripts/test-chat.mjs` extended with Test 3 — validates each referencedPoi has numeric lat/lng matching SEATTLE_POIS by id; `scripts/poi-data.mjs` provides the ground truth lookup
- AC-4 ✅ `grep -rn "PREDICTED\|border-dashed" components/` finds hits in EventFeed, EventDetailDrawer, PredictionCard
- AC-5 ✅ Both prop chains documented above and verified in page.tsx
- AC-6 ✅ Dev server runs; /api/events returns data immediately; no ANTHROPIC_API_KEY server errors at startup (chat queries only fail if key absent)
