import { POI, CityEvent, CityStats } from './types';

const now = new Date();
const ts = (offsetMinutes: number) =>
  new Date(now.getTime() + offsetMinutes * 60 * 1000).toISOString();

export const SEATTLE_POIS: POI[] = [
  // Capitol Hill (10 POIs) — lat ~47.614-47.625, lng ~-122.32 to -122.31
  {
    id: 'poi-001', name: 'Cal Anderson Park', address: '1635 11th Ave, Seattle, WA 98122',
    lat: 47.6162, lng: -122.3191, category: 'Park', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 45, trend: 'stable', lastEventAt: ts(-120) },
  },
  {
    id: 'poi-002', name: 'Cafe Vita Capitol Hill', address: '1005 E Pike St, Seattle, WA 98122',
    lat: 47.6146, lng: -122.3198, category: 'Coffee', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 52, trend: 'rising', lastEventAt: ts(-45) },
  },
  {
    id: 'poi-003', name: 'Pike Street Bar & Grill', address: '1518 E Pike St, Seattle, WA 98122',
    lat: 47.6155, lng: -122.3157, category: 'Restaurant', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 60, trend: 'rising', lastEventAt: ts(-30) },
  },
  {
    id: 'poi-004', name: 'Volunteer Park', address: '1247 15th Ave E, Seattle, WA 98112',
    lat: 47.6306, lng: -122.3155, category: 'Park', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 35, trend: 'stable', lastEventAt: ts(-180) },
  },
  {
    id: 'poi-005', name: 'Rhein Haus Seattle', address: '912 12th Ave, Seattle, WA 98122',
    lat: 47.6131, lng: -122.3178, category: 'Bar', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 70, trend: 'rising', lastEventAt: ts(-15) },
  },
  {
    id: 'poi-006', name: 'Linda\'s Tavern', address: '707 E Pine St, Seattle, WA 98122',
    lat: 47.6152, lng: -122.3226, category: 'Bar', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 65, trend: 'rising', lastEventAt: ts(-20) },
  },
  {
    id: 'poi-007', name: 'Rancho Bravo Tacos', address: '1001 E Pike St, Seattle, WA 98122',
    lat: 47.6147, lng: -122.3199, category: 'Restaurant', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 55, trend: 'stable', lastEventAt: ts(-60) },
  },
  {
    id: 'poi-008', name: 'Neumos Music Venue', address: '925 E Pike St, Seattle, WA 98122',
    lat: 47.6143, lng: -122.3213, category: 'Venue', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: ['evt-003'], heatScore: 88, trend: 'rising', lastEventAt: ts(-5) },
  },
  {
    id: 'poi-009', name: 'Elliott Bay Book Company', address: '1521 10th Ave, Seattle, WA 98122',
    lat: 47.6153, lng: -122.3186, category: 'Retail', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 40, trend: 'stable', lastEventAt: ts(-90) },
  },
  {
    id: 'poi-010', name: 'Capitol Hill Light Rail Station', address: '200 Broadway E, Seattle, WA 98102',
    lat: 47.6196, lng: -122.3200, category: 'Transit', neighborhood: 'Capitol Hill',
    dynamic: { activeEvents: [], heatScore: 50, trend: 'stable', lastEventAt: ts(-10) },
  },

  // Downtown Seattle (7 POIs) — lat ~47.60-47.61, lng ~-122.34 to -122.32
  {
    id: 'poi-011', name: 'Pike Place Market', address: '85 Pike St, Seattle, WA 98101',
    lat: 47.6097, lng: -122.3416, category: 'Market', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 78, trend: 'rising', lastEventAt: ts(-25) },
  },
  {
    id: 'poi-012', name: 'Seattle Art Museum', address: '1300 1st Ave, Seattle, WA 98101',
    lat: 47.6073, lng: -122.3384, category: 'Museum', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 42, trend: 'stable', lastEventAt: ts(-150) },
  },
  {
    id: 'poi-013', name: 'Pacific Place Mall', address: '600 Pine St, Seattle, WA 98101',
    lat: 47.6118, lng: -122.3345, category: 'Retail', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 55, trend: 'stable', lastEventAt: ts(-80) },
  },
  {
    id: 'poi-014', name: 'Westlake Center', address: '400 Pine St, Seattle, WA 98101',
    lat: 47.6108, lng: -122.3374, category: 'Retail', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 48, trend: 'stable', lastEventAt: ts(-70) },
  },
  {
    id: 'poi-015', name: 'Seattle Central Library', address: '1000 4th Ave, Seattle, WA 98104',
    lat: 47.6067, lng: -122.3324, category: 'Library', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 30, trend: 'cooling', lastEventAt: ts(-200) },
  },
  {
    id: 'poi-016', name: 'Il Bistro', address: '93 Pike St, Seattle, WA 98101',
    lat: 47.6094, lng: -122.3412, category: 'Restaurant', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 62, trend: 'rising', lastEventAt: ts(-35) },
  },
  {
    id: 'poi-017', name: 'The Edgewater Hotel', address: '2411 Alaskan Way, Seattle, WA 98121',
    lat: 47.6075, lng: -122.3474, category: 'Hotel', neighborhood: 'Downtown',
    dynamic: { activeEvents: [], heatScore: 38, trend: 'stable', lastEventAt: ts(-240) },
  },

  // South Lake Union (SLU) — lat ~47.62-47.64, lng ~-122.34 to -122.33
  {
    id: 'poi-018', name: 'Amazon Spheres', address: '2111 7th Ave, Seattle, WA 98121',
    lat: 47.6155, lng: -122.3395, category: 'Landmark', neighborhood: 'South Lake Union',
    dynamic: { activeEvents: [], heatScore: 58, trend: 'stable', lastEventAt: ts(-60) },
  },
  {
    id: 'poi-019', name: 'Lake Union Park', address: '860 Terry Ave N, Seattle, WA 98109',
    lat: 47.6244, lng: -122.3369, category: 'Park', neighborhood: 'South Lake Union',
    dynamic: { activeEvents: [], heatScore: 44, trend: 'stable', lastEventAt: ts(-120) },
  },
  {
    id: 'poi-020', name: 'Cinerama Theater', address: '2100 4th Ave, Seattle, WA 98121',
    lat: 47.6160, lng: -122.3423, category: 'Venue', neighborhood: 'South Lake Union',
    dynamic: { activeEvents: [], heatScore: 47, trend: 'stable', lastEventAt: ts(-90) },
  },

  // Fremont — lat ~47.65-47.66, lng ~-122.36 to -122.34
  {
    id: 'poi-021', name: 'Fremont Troll', address: 'N 36th St & Troll Ave N, Seattle, WA 98103',
    lat: 47.6508, lng: -122.3471, category: 'Landmark', neighborhood: 'Fremont',
    dynamic: { activeEvents: [], heatScore: 42, trend: 'stable', lastEventAt: ts(-180) },
  },
  {
    id: 'poi-022', name: 'Fremont Sunday Market', address: '3401 Evanston Ave N, Seattle, WA 98103',
    lat: 47.6509, lng: -122.3490, category: 'Market', neighborhood: 'Fremont',
    dynamic: { activeEvents: [], heatScore: 55, trend: 'rising', lastEventAt: ts(-40) },
  },
  {
    id: 'poi-023', name: 'Brouwer\'s Cafe', address: '400 N 35th St, Seattle, WA 98103',
    lat: 47.6503, lng: -122.3501, category: 'Restaurant', neighborhood: 'Fremont',
    dynamic: { activeEvents: [], heatScore: 58, trend: 'stable', lastEventAt: ts(-55) },
  },

  // Ballard — lat ~47.66-47.68, lng ~-122.39 to -122.37
  {
    id: 'poi-024', name: 'Ballard Locks (Hiram M. Chittenden)', address: '3015 NW 54th St, Seattle, WA 98107',
    lat: 47.6655, lng: -122.3950, category: 'Landmark', neighborhood: 'Ballard',
    dynamic: { activeEvents: [], heatScore: 35, trend: 'stable', lastEventAt: ts(-300) },
  },
  {
    id: 'poi-025', name: 'Ballard Farmers Market', address: '5345 Ballard Ave NW, Seattle, WA 98107',
    lat: 47.6668, lng: -122.3831, category: 'Market', neighborhood: 'Ballard',
    dynamic: { activeEvents: [], heatScore: 62, trend: 'rising', lastEventAt: ts(-30) },
  },
  {
    id: 'poi-026', name: 'The Walrus and the Carpenter', address: '4743 Ballard Ave NW, Seattle, WA 98107',
    lat: 47.6658, lng: -122.3825, category: 'Restaurant', neighborhood: 'Ballard',
    dynamic: { activeEvents: [], heatScore: 72, trend: 'rising', lastEventAt: ts(-20) },
  },
  {
    id: 'poi-027', name: 'Stoup Brewing Ballard', address: '1108 NW 52nd St, Seattle, WA 98107',
    lat: 47.6661, lng: -122.3788, category: 'Bar', neighborhood: 'Ballard',
    dynamic: { activeEvents: [], heatScore: 66, trend: 'rising', lastEventAt: ts(-15) },
  },

  // Pioneer Square — lat ~47.60-47.61, lng ~-122.34 to -122.32
  {
    id: 'poi-028', name: 'Occidental Square', address: '117 S Washington St, Seattle, WA 98104',
    lat: 47.6003, lng: -122.3326, category: 'Park', neighborhood: 'Pioneer Square',
    dynamic: { activeEvents: ['evt-001'], heatScore: 82, trend: 'rising', lastEventAt: ts(-10) },
  },
  {
    id: 'poi-029', name: 'Underground Tour', address: '614 1st Ave, Seattle, WA 98104',
    lat: 47.6013, lng: -122.3348, category: 'Attraction', neighborhood: 'Pioneer Square',
    dynamic: { activeEvents: [], heatScore: 40, trend: 'stable', lastEventAt: ts(-120) },
  },
  {
    id: 'poi-030', name: 'Zeitgeist Coffee', address: '171 S Jackson St, Seattle, WA 98104',
    lat: 47.6001, lng: -122.3318, category: 'Coffee', neighborhood: 'Pioneer Square',
    dynamic: { activeEvents: [], heatScore: 45, trend: 'stable', lastEventAt: ts(-60) },
  },
];

export const SEATTLE_EVENTS: CityEvent[] = [
  // Safety events (3, including 1 critical)
  {
    id: 'evt-001',
    title: 'Structure Fire — Pioneer Square Warehouse',
    summary: 'A 3-alarm fire broke out in a historic warehouse on 1st Ave S. Fire crews on scene, road closures in effect. Multiple nearby businesses evacuated.',
    category: 'Safety',
    severity: 'critical',
    sources: [
      { platform: 'Seattle Fire Dept', url: 'https://seattle.gov/fire', credibility: 0.98, timestamp: ts(-65) },
      { platform: 'Reddit r/Seattle', url: 'https://reddit.com/r/Seattle', credibility: 0.72, timestamp: ts(-58) },
      { platform: 'King5 News', url: 'https://king5.com', credibility: 0.91, timestamp: ts(-45) },
    ],
    pois: ['poi-028', 'poi-029'],
    lat: 47.5993, lng: -122.3341,
    impactRadiusMeters: 400,
    heatScore: 95,
    trend: 'rising',
    createdAt: ts(-65),
    expiresAt: ts(180),
    status: 'ongoing',
    actionLinks: ['https://seattle.gov/fire/alerts'],
  },
  {
    id: 'evt-002',
    title: 'Assault Reported Near Broadway & Pike',
    summary: 'SPD investigating an assault on Broadway near Pike St. Suspect fled on foot. Officers canvassing the area.',
    category: 'Safety',
    severity: 'high',
    sources: [
      { platform: 'SPD Blotter', url: 'https://spdblotter.seattle.gov', credibility: 0.95, timestamp: ts(-30) },
      { platform: 'Citizen App', url: 'https://citizen.com', credibility: 0.68, timestamp: ts(-28) },
    ],
    pois: ['poi-010'],
    lat: 47.6148, lng: -122.3204,
    impactRadiusMeters: 200,
    heatScore: 74,
    trend: 'stable',
    createdAt: ts(-30),
    expiresAt: ts(120),
    status: 'ongoing',
  },
  {
    id: 'evt-003',
    title: 'Noise Complaint — Late Night Block Party',
    summary: 'Multiple noise complaints from residents near E Pike St. Large gathering with amplified music outside Neumos.',
    category: 'Safety',
    severity: 'low',
    sources: [
      { platform: 'SPD Blotter', url: 'https://spdblotter.seattle.gov', credibility: 0.88, timestamp: ts(-20) },
      { platform: 'Nextdoor', url: 'https://nextdoor.com', credibility: 0.60, timestamp: ts(-18) },
    ],
    pois: ['poi-008'],
    lat: 47.6143, lng: -122.3213,
    impactRadiusMeters: 150,
    heatScore: 48,
    trend: 'stable',
    createdAt: ts(-20),
    expiresAt: ts(60),
    status: 'ongoing',
  },

  // Traffic events (3, including 1 predicted)
  {
    id: 'evt-004',
    title: 'I-5 Southbound Slowdown — Rush Hour Backup',
    summary: 'Heavy traffic on I-5 southbound from the Ship Canal Bridge to downtown. Average speeds below 15 mph. Caused by fender-bender near exit 168.',
    category: 'Traffic',
    severity: 'medium',
    sources: [
      { platform: 'WSDOT', url: 'https://wsdot.wa.gov/traffic', credibility: 0.96, timestamp: ts(-50) },
      { platform: 'Google Maps', url: 'https://maps.google.com', credibility: 0.85, timestamp: ts(-45) },
    ],
    pois: [],
    lat: 47.6500, lng: -122.3181,
    impactRadiusMeters: 800,
    heatScore: 66,
    trend: 'stable',
    createdAt: ts(-50),
    expiresAt: ts(90),
    status: 'ongoing',
  },
  {
    id: 'evt-005',
    title: 'Mercer St Construction — Lane Closures',
    summary: 'Scheduled construction work on Mercer St closing 2 of 4 lanes westbound between Fairview Ave and Queen Anne Ave. Expect 10-15 min delays.',
    category: 'Traffic',
    severity: 'medium',
    sources: [
      { platform: 'Seattle DOT', url: 'https://seattle.gov/transportation', credibility: 0.97, timestamp: ts(-480) },
    ],
    pois: [],
    lat: 47.6248, lng: -122.3364,
    impactRadiusMeters: 600,
    heatScore: 52,
    trend: 'cooling',
    createdAt: ts(-480),
    expiresAt: ts(240),
    status: 'ongoing',
  },
  {
    id: 'evt-006',
    title: 'Predicted: I-5 North Post-Seahawks Game Surge',
    summary: 'High confidence prediction of significant I-5 northbound traffic surge following tonight\'s Seahawks home game. Expect 45-60 min delays starting ~10:30 PM.',
    category: 'Traffic',
    severity: 'high',
    sources: [
      { platform: 'PulseCity AI', url: 'https://pulsecity.app', credibility: 0.82, timestamp: ts(0) },
    ],
    pois: [],
    lat: 47.6400, lng: -122.3150,
    impactRadiusMeters: 1200,
    heatScore: 78,
    trend: 'rising',
    createdAt: ts(0),
    expiresAt: ts(300),
    status: 'predicted',
    predictedPeakAt: ts(210),
    confidence: 0.82,
    predictionReason: '3 years of Seahawks home game traffic patterns combined with current I-5 sensor baselines and tonight\'s 8 PM kickoff at Lumen Field.',
  },

  // Events (Capitol Hill Block Party + 2 others)
  {
    id: 'evt-007',
    title: 'Capitol Hill Block Party — Main Stage',
    summary: 'Annual Capitol Hill Block Party in full swing. Main stage on E Pine St between 10th and 11th Ave. Headliners performing through midnight. Estimated 8,000 attendees.',
    category: 'Events',
    severity: 'medium',
    sources: [
      { platform: 'CHBP Official', url: 'https://capitolhillblockparty.com', credibility: 0.99, timestamp: ts(-360) },
      { platform: 'Reddit r/Seattle', url: 'https://reddit.com/r/Seattle', credibility: 0.74, timestamp: ts(-120) },
      { platform: 'Seattle Times', url: 'https://seattletimes.com', credibility: 0.93, timestamp: ts(-180) },
    ],
    pois: ['poi-002', 'poi-005', 'poi-006', 'poi-008'],
    lat: 47.6150, lng: -122.3196,
    impactRadiusMeters: 600,
    heatScore: 92,
    trend: 'rising',
    createdAt: ts(-480),
    expiresAt: ts(240),
    status: 'ongoing',
  },
  {
    id: 'evt-008',
    title: 'Predicted: Fremont Evening Crowd Surge — Post-Market',
    summary: 'Pattern analysis predicts a significant crowd buildup in Fremont as the Sunday Market wraps up and evening diners arrive. Peak expected around 6-8 PM.',
    category: 'Events',
    severity: 'low',
    sources: [
      { platform: 'PulseCity AI', url: 'https://pulsecity.app', credibility: 0.75, timestamp: ts(0) },
    ],
    pois: ['poi-021', 'poi-022', 'poi-023'],
    lat: 47.6508, lng: -122.3485,
    impactRadiusMeters: 400,
    heatScore: 55,
    trend: 'rising',
    createdAt: ts(0),
    expiresAt: ts(180),
    status: 'predicted',
    predictedPeakAt: ts(120),
    confidence: 0.75,
    predictionReason: 'Historical Sunday market foot traffic data shows consistent crowd transition from market attendees to evening diners in a 2-hour window. Current market attendance indicators are elevated.',
  },
  {
    id: 'evt-009',
    title: 'Ballard Farmers Market — Weekend Edition',
    summary: 'The beloved Ballard Farmers Market is operating at full capacity this weekend. Over 100 vendors. Expect heavy pedestrian traffic on Ballard Ave NW.',
    category: 'Events',
    severity: 'low',
    sources: [
      { platform: 'Ballard Farmers Market', url: 'https://ballardfarmersmarket.org', credibility: 0.98, timestamp: ts(-180) },
    ],
    pois: ['poi-025', 'poi-026', 'poi-027'],
    lat: 47.6660, lng: -122.3828,
    impactRadiusMeters: 350,
    heatScore: 58,
    trend: 'stable',
    createdAt: ts(-300),
    expiresAt: ts(120),
    status: 'ongoing',
  },

  // Civic events (2)
  {
    id: 'evt-010',
    title: 'Seattle City Council Special Session — Tech Regulation',
    summary: 'Emergency council session at City Hall to vote on new tech company employee housing ordinance. Protesters gathered outside. Council chamber at capacity.',
    category: 'Civic',
    severity: 'low',
    sources: [
      { platform: 'Seattle City Council', url: 'https://seattle.gov/council', credibility: 0.99, timestamp: ts(-90) },
      { platform: 'The Stranger', url: 'https://thestranger.com', credibility: 0.82, timestamp: ts(-75) },
    ],
    pois: ['poi-015'],
    lat: 47.6038, lng: -122.3300,
    impactRadiusMeters: 250,
    heatScore: 45,
    trend: 'stable',
    createdAt: ts(-120),
    expiresAt: ts(180),
    status: 'ongoing',
  },
  {
    id: 'evt-011',
    title: 'Community Clean-Up Day — Pioneer Square',
    summary: 'City-organized volunteer clean-up in Pioneer Square. 200 volunteers participating. Focus on historic district sidewalks and Occidental Park.',
    category: 'Civic',
    severity: 'low',
    sources: [
      { platform: 'Seattle Public Utilities', url: 'https://seattle.gov/utilities', credibility: 0.97, timestamp: ts(-300) },
    ],
    pois: ['poi-028', 'poi-030'],
    lat: 47.6005, lng: -122.3325,
    impactRadiusMeters: 400,
    heatScore: 32,
    trend: 'cooling',
    createdAt: ts(-360),
    expiresAt: ts(60),
    status: 'ongoing',
  },

  // Business event (1 predicted) + a second predicted event
  {
    id: 'evt-012',
    title: 'Predicted: Pike Place Market Flash Crowd',
    summary: 'AI pattern analysis detects 340% above-baseline review velocity and social media activity at Pike Place Market. Likely undisclosed food festival or media event.',
    category: 'Business',
    severity: 'medium',
    sources: [
      { platform: 'PulseCity AI', url: 'https://pulsecity.app', credibility: 0.79, timestamp: ts(0) },
    ],
    pois: ['poi-011', 'poi-016'],
    lat: 47.6097, lng: -122.3416,
    impactRadiusMeters: 300,
    heatScore: 68,
    trend: 'rising',
    createdAt: ts(0),
    expiresAt: ts(180),
    status: 'predicted',
    predictedPeakAt: ts(90),
    confidence: 0.79,
    predictionReason: 'Unusual Yelp review velocity (340% above 30-day baseline) combined with Instagram geo-tag cluster and Reddit post pattern matching historical pre-event signatures.',
  },
];

export const CITY_STATS: CityStats[] = [
  { neighborhood: 'Capitol Hill', heatScore: 88, trend: 'rising', activeEvents: 3 },
  { neighborhood: 'Downtown', heatScore: 62, trend: 'stable', activeEvents: 2 },
  { neighborhood: 'South Lake Union', heatScore: 45, trend: 'stable', activeEvents: 1 },
  { neighborhood: 'Fremont', heatScore: 38, trend: 'cooling', activeEvents: 1 },
  { neighborhood: 'Ballard', heatScore: 55, trend: 'rising', activeEvents: 1 },
  { neighborhood: 'Pioneer Square', heatScore: 75, trend: 'rising', activeEvents: 2 },
];
