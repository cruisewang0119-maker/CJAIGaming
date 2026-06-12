// AC-3: Verify mock data counts and coordinate bounds
import { createRequire } from 'module';
import { execSync } from 'child_process';

// Compile and import via tsx or ts-node
// Since we're in a Next.js project, use a simpler approach: require the compiled output
// We'll use a direct approach by reading the TypeScript and evaluating relevant parts

// Reimplement the data check inline to avoid module resolution issues
const LAT_MIN = 47.5;
const LAT_MAX = 47.75;
const LNG_MIN = -122.45;
const LNG_MAX = -122.2;

// Run ts-node or tsx to get the data
let poisJson, eventsJson;
try {
  poisJson = execSync(
    'node -e "const { SEATTLE_POIS } = require(\'./dist-check/mock-data.js\'); console.log(JSON.stringify(SEATTLE_POIS))"',
    { encoding: 'utf8', cwd: process.cwd() }
  );
} catch {
  // Fallback: parse the TypeScript file directly with basic regex extraction
}

// Use tsx to evaluate TypeScript
try {
  const result = execSync(
    'npx tsx --eval "import { SEATTLE_POIS, SEATTLE_EVENTS } from \'./lib/mock-data.ts\'; console.log(JSON.stringify({ pois: SEATTLE_POIS, events: SEATTLE_EVENTS }))"',
    { encoding: 'utf8', cwd: process.cwd(), timeout: 30000 }
  );
  const data = JSON.parse(result.trim());
  poisJson = data.pois;
  eventsJson = data.events;
} catch (err) {
  // Try with ts-node
  try {
    const result = execSync(
      'npx ts-node --project tsconfig.json -e "const { SEATTLE_POIS, SEATTLE_EVENTS } = require(\'./lib/mock-data\'); process.stdout.write(JSON.stringify({ pois: SEATTLE_POIS, events: SEATTLE_EVENTS }))"',
      { encoding: 'utf8', cwd: process.cwd(), timeout: 30000 }
    );
    const data = JSON.parse(result.trim());
    poisJson = data.pois;
    eventsJson = data.events;
  } catch (err2) {
    console.error('Could not load data via tsx or ts-node:', err2.message);
    process.exit(1);
  }
}

const pois = poisJson;
const events = eventsJson;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n=== AC-3: Mock Data Verification ===\n');

// POI count
assert(pois.length === 30, `SEATTLE_POIS has exactly 30 entries (found ${pois.length})`);

// Event count
assert(events.length === 12, `SEATTLE_EVENTS has exactly 12 entries (found ${events.length})`);

// Predicted count
const predicted = events.filter(e => e.status === 'predicted');
assert(predicted.length === 3, `SEATTLE_EVENTS has exactly 3 predicted events (found ${predicted.length})`);

// POI coordinate bounds
const poisOutOfBounds = pois.filter(p =>
  p.lat < LAT_MIN || p.lat > LAT_MAX || p.lng < LNG_MIN || p.lng > LNG_MAX
);
assert(
  poisOutOfBounds.length === 0,
  `All POI coords within lat ${LAT_MIN}-${LAT_MAX}, lng ${LNG_MIN}-${LNG_MAX} (${poisOutOfBounds.length} violations)`
);
if (poisOutOfBounds.length > 0) {
  poisOutOfBounds.forEach(p => console.error(`    Out-of-bounds POI: ${p.name} lat=${p.lat} lng=${p.lng}`));
}

// Event coordinate bounds
const eventsOutOfBounds = events.filter(e =>
  e.lat < LAT_MIN || e.lat > LAT_MAX || e.lng < LNG_MIN || e.lng > LNG_MAX
);
assert(
  eventsOutOfBounds.length === 0,
  `All Event coords within lat ${LAT_MIN}-${LAT_MAX}, lng ${LNG_MIN}-${LNG_MAX} (${eventsOutOfBounds.length} violations)`
);
if (eventsOutOfBounds.length > 0) {
  eventsOutOfBounds.forEach(e => console.error(`    Out-of-bounds Event: ${e.title} lat=${e.lat} lng=${e.lng}`));
}

// Check POI IDs are unique
const poiIds = pois.map(p => p.id);
const uniquePoiIds = new Set(poiIds);
assert(uniquePoiIds.size === pois.length, `All POI IDs are unique`);

// Check event IDs are unique
const eventIds = events.map(e => e.id);
const uniqueEventIds = new Set(eventIds);
assert(uniqueEventIds.size === events.length, `All Event IDs are unique`);

// Check predicted events have confidence + predictionReason
const predictedWithData = predicted.filter(e => e.confidence != null && e.predictionReason);
assert(
  predictedWithData.length === predicted.length,
  `All predicted events have confidence + predictionReason`
);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
