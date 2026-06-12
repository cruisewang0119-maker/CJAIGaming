/**
 * AC-4 + AC-3: Test the /api/chat SSE streaming endpoint.
 *
 * Test 1: Capitol Hill query — tool calls + text stream
 * Test 2: Dinner away from chaos — referencedPois non-empty
 * Test 3 (AC-3): referencedPois entries have lat/lng matching SEATTLE_POIS
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';
import { SEATTLE_POIS, SEATTLE_BOUNDS } from './poi-data.mjs';

const BASE_URL = 'http://localhost:3000';

function startDevServer() {
  console.log('  Spawning: npm run dev');
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' },
    detached: false,
  });

  proc.stdout.on('data', (d) => process.stdout.write(`[dev] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[dev] ${d}`));

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Dev server spawn timed out'));
    }, 5000);

    proc.on('spawn', () => { clearTimeout(timer); resolve(proc); });
    proc.on('error', (err) => { clearTimeout(timer); reject(err); });
  });
}

async function waitForServer(maxMs = 60_000) {
  const deadline = Date.now() + maxMs;
  let lastErr = '';
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      if (r.status < 500) return;
    } catch (e) {
      lastErr = e.message;
    }
    await sleep(1500);
  }
  throw new Error(`Server not reachable after ${maxMs}ms. Last error: ${lastErr}`);
}

async function parseSSE(response) {
  const events = [];
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (!json) continue;
        try { events.push(JSON.parse(json)); } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return events;
}

async function sendChat(messages) {
  const resp = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return parseSSE(resp);
}

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERT FAILED: ${message}`);
  console.log(`  ✓ ${message}`);
}

let devServer;
let exitCode = 0;
const results = { test1: null, test2: null, test3: null };

try {
  console.log('\n=== Chat API SSE Test (AC-3 + AC-4) ===\n');

  devServer = await startDevServer();
  console.log('Waiting for dev server to be ready (up to 60s)...');
  await waitForServer(60_000);
  console.log('Dev server ready.\n');

  // ── Test 1: Capitol Hill query ──────────────────────────────────────────────
  console.log('Test 1: "What\'s happening near Capitol Hill right now?"');
  const msg1 = [{
    id: '1', role: 'user',
    content: "What's happening near Capitol Hill right now?",
    timestamp: new Date().toISOString(),
  }];

  const events1 = await sendChat(msg1);
  console.log(`  Received ${events1.length} SSE events`);
  console.log('  Types:', events1.map(e => e.type).join(', '));

  const toolCalls1   = events1.filter(e => e.type === 'tool_call');
  const textDeltas1  = events1.filter(e => e.type === 'text_delta');
  const doneEvents1  = events1.filter(e => e.type === 'done');
  const errorEvents1 = events1.filter(e => e.type === 'error');

  if (errorEvents1.length > 0) console.error('  Errors:', JSON.stringify(errorEvents1));

  assert(toolCalls1.length  >= 1, `>=1 tool_call event (found ${toolCalls1.length})`);
  assert(textDeltas1.length >= 1, `>=1 text_delta event (found ${textDeltas1.length})`);
  assert(doneEvents1.length === 1, `exactly 1 done event (found ${doneEvents1.length})`);
  assert(errorEvents1.length === 0, `0 error events (found ${errorEvents1.length})`);
  results.test1 = 'PASSED';
  console.log('\nTest 1 PASSED\n');

  // ── Test 2: Dinner away from chaos ─────────────────────────────────────────
  console.log('Test 2: "Find me dinner not near any events"');
  const msg2 = [{
    id: '2', role: 'user',
    content: 'Find me dinner not near any events',
    timestamp: new Date().toISOString(),
  }];

  const events2 = await sendChat(msg2);
  console.log(`  Received ${events2.length} SSE events`);
  console.log('  Types:', events2.map(e => e.type).join(', '));

  const doneEvent2   = events2.find(e => e.type === 'done');
  const errorEvents2 = events2.filter(e => e.type === 'error');

  if (errorEvents2.length > 0) console.error('  Errors:', JSON.stringify(errorEvents2));

  assert(doneEvent2 !== undefined, 'done event received');
  assert(errorEvents2.length === 0, `0 error events (found ${errorEvents2.length})`);

  const referencedPois = doneEvent2?.referencedPois ?? [];
  console.log(`  Referenced POIs (${referencedPois.length}):`, referencedPois.map(p => p.name).join(', ') || '(none)');
  assert(referencedPois.length > 0, `referencedPois is non-empty (found ${referencedPois.length})`);

  results.test2 = 'PASSED';
  console.log('\nTest 2 PASSED\n');

  // ── Test 3 (AC-3): referencedPois lat/lng match SEATTLE_POIS ───────────────
  console.log('Test 3 (AC-3): referencedPois entries have lat/lng matching SEATTLE_POIS');
  const poiLookup = new Map(SEATTLE_POIS.map(p => [p.id, p]));

  for (const poi of referencedPois) {
    assert(typeof poi.id === 'string' && poi.id.startsWith('poi-'), `POI has valid id (got: ${poi.id})`);
    assert(typeof poi.lat === 'number', `POI "${poi.name}" has numeric lat (got: ${typeof poi.lat})`);
    assert(typeof poi.lng === 'number', `POI "${poi.name}" has numeric lng (got: ${typeof poi.lng})`);

    // Lat/lng must be within Seattle bounding box
    assert(
      poi.lat >= SEATTLE_BOUNDS.minLat && poi.lat <= SEATTLE_BOUNDS.maxLat,
      `POI "${poi.name}" lat ${poi.lat} is within Seattle bounds [${SEATTLE_BOUNDS.minLat}, ${SEATTLE_BOUNDS.maxLat}]`,
    );
    assert(
      poi.lng >= SEATTLE_BOUNDS.minLng && poi.lng <= SEATTLE_BOUNDS.maxLng,
      `POI "${poi.name}" lng ${poi.lng} is within Seattle bounds [${SEATTLE_BOUNDS.minLng}, ${SEATTLE_BOUNDS.maxLng}]`,
    );

    // Cross-reference: lat/lng must match the entry in SEATTLE_POIS by id
    const canonical = poiLookup.get(poi.id);
    assert(canonical !== undefined, `POI id "${poi.id}" exists in SEATTLE_POIS`);
    if (canonical) {
      assert(
        Math.abs(poi.lat - canonical.lat) < 0.0001,
        `POI "${poi.name}" lat matches SEATTLE_POIS (expected ${canonical.lat}, got ${poi.lat})`,
      );
      assert(
        Math.abs(poi.lng - canonical.lng) < 0.0001,
        `POI "${poi.name}" lng matches SEATTLE_POIS (expected ${canonical.lng}, got ${poi.lng})`,
      );
    }
  }

  results.test3 = 'PASSED';
  console.log('\nTest 3 PASSED\n');

  console.log('=== All tests PASSED ===');
  console.log(JSON.stringify(results));

} catch (err) {
  console.error('\n✗ TEST FAILED:', err.message);
  exitCode = 1;
} finally {
  if (devServer) {
    console.log('\nKilling dev server...');
    devServer.kill('SIGTERM');
    await sleep(2000);
    if (!devServer.killed) devServer.kill('SIGKILL');
    console.log('Dev server stopped.');
  }
  process.exit(exitCode);
}
