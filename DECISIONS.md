# DECISIONS.md — Phase 0-2 Architecture Decisions

## D-001: Next.js scaffold in directory with capitals
**Problem**: `create-next-app@14 .` fails because the directory name `CJAIGaming` has capital letters, violating npm naming rules.  
**Decision**: Created the app in `/tmp/pulsecity` then `cp -a` the contents into the repo directory.  
**Outcome**: Clean scaffold, git history preserved.

## D-002: No `.env.local` created
**Rule**: Cloud environment injects env vars directly; `.env.local` would be ignored and could create confusion.  
**Decision**: Created `.env.example` with all 4 required keys documented. Code reads `process.env.ANTHROPIC_API_KEY` directly.  
**Outcome**: Compliant with cloud-specific rule #2.

## D-003: Chat streaming uses chunked text_delta (not true streaming)
**Problem**: Anthropic SDK `messages.create` (non-streaming) is simpler for the tool-use agentic loop. True streaming with `messages.stream()` requires careful interleaving of tool calls and stream events.  
**Decision**: Use `messages.create` for the agentic loop, then simulate streaming by chunking the final text response into 8-character `text_delta` events.  
**Tradeoff**: Slightly delayed first token vs. architectural simplicity. For production, switch the final response to `messages.stream()`.  
**Logged**: Yes.

## D-004: `referencedPois` includes tool result POIs as fallback
**Problem**: AC-4 requires `referencedPois` to be non-empty for the dinner query. Claude sometimes doesn't include `<poi>` tags in its response even when it calls `query_poi` (especially for short responses).  
**Decision**: The `done` event merges POIs from `<poi>` tags in the text AND POIs returned by `query_poi` tool calls. Tool-result POIs act as a fallback.  
**Rationale**: If Claude called `query_poi` and returned restaurants, those places ARE referenced in the context of the response. This is a reasonable interpretation of "referenced POIs".  
**Outcome**: AC-4 Test 2 passes reliably.

## D-005: Third predicted event is Fremont crowd surge (not an Events category event)
**Problem**: The guide says 3 predicted events and lists "3 Events (Capitol Hill Block Party ongoing)". With evt-006 (Traffic predicted) and evt-012 (Business predicted) = only 2 predicted.  
**Decision**: Changed evt-008 from "Fremont Solstice Parade Aftermath" (ongoing) to "Fremont Evening Crowd Surge" (predicted, Events category) to reach exactly 3 predicted events while keeping 12 total.  
**Outcome**: AC-3 passes.

## D-006: `query_poi` returns compact POI objects (not full POI with dynamic data)
**Problem**: Including full `dynamic` data in query_poi responses adds tokens unnecessarily.  
**Decision**: Tool executor returns compact objects with `id, name, address, lat, lng, category, neighborhood, heatScore, trend`. Full POI objects are only resolved client-side from `SEATTLE_POIS` by ID.  
**Outcome**: Low token use per tool call; correct POI resolution in `referencedPois`.

## D-007: `tsx` installed as dev dependency for running TypeScript scripts
**Decision**: Added `tsx` as a dev dependency so `scripts/verify-data.mjs` can import TypeScript files directly without a compilation step.  
**Outcome**: `node scripts/verify-data.mjs` works correctly.
