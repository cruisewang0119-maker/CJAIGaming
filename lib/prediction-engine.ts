import { CityEvent } from './types';

function ts(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

export function getPredictionsForTime(currentHour: number): CityEvent[] {
  const isEvening = currentHour >= 17 && currentHour <= 22;

  if (isEvening) {
    return [
      {
        id: 'pred-evt-001',
        title: 'Predicted: I-5 North Post-Game Traffic Surge',
        summary:
          'High-confidence prediction: I-5 northbound will experience severe congestion following the Seahawks game. Delays of 45-60 minutes expected from I-90 interchange to 520.',
        category: 'Traffic',
        severity: 'high',
        sources: [
          {
            platform: 'PulseCity AI',
            url: 'https://pulsecity.app',
            credibility: 0.82,
            timestamp: ts(0),
          },
        ],
        pois: [],
        lat: 47.64, lng: -122.315,
        impactRadiusMeters: 1200,
        heatScore: 78,
        trend: 'rising',
        createdAt: ts(0),
        expiresAt: ts(240),
        status: 'predicted',
        predictedPeakAt: ts(180),
        confidence: 0.82,
        predictionReason:
          '3 years of Seahawks home game traffic patterns + current I-5 sensor baselines + tonight\'s 8 PM kickoff.',
      },
      {
        id: 'pred-evt-002',
        title: 'Predicted: Capitol Hill Late-Night Surge',
        summary:
          'Pattern analysis predicts significant crowd buildup on the Pike/Pine corridor as post-game attendees move into the nightlife district.',
        category: 'Events',
        severity: 'medium',
        sources: [
          {
            platform: 'PulseCity AI',
            url: 'https://pulsecity.app',
            credibility: 0.75,
            timestamp: ts(0),
          },
        ],
        pois: ['poi-005', 'poi-006'],
        lat: 47.6152, lng: -122.3204,
        impactRadiusMeters: 500,
        heatScore: 72,
        trend: 'rising',
        createdAt: ts(0),
        expiresAt: ts(300),
        status: 'predicted',
        predictedPeakAt: ts(120),
        confidence: 0.75,
        predictionReason:
          'Friday/Saturday nightlife data shows consistent 2× normal foot traffic on Pike/Pine after 9 PM combined with incoming game-day crowd.',
      },
    ];
  }

  return [
    {
      id: 'pred-evt-003',
      title: 'Predicted: Pike Place Market Lunch Rush',
      summary:
        'Peak foot traffic expected at Pike Place Market during midday hours, driven by elevated social media activity and tour group bookings.',
      category: 'Events',
      severity: 'low',
      sources: [
        {
          platform: 'PulseCity AI',
          url: 'https://pulsecity.app',
          credibility: 0.7,
          timestamp: ts(0),
        },
      ],
      pois: ['poi-011'],
      lat: 47.6097, lng: -122.3416,
      impactRadiusMeters: 300,
      heatScore: 60,
      trend: 'rising',
      createdAt: ts(0),
      expiresAt: ts(120),
      status: 'predicted',
      predictedPeakAt: ts(60),
      confidence: 0.7,
      predictionReason:
        'Weekday lunch patterns show 40% capacity increase from 11:30 AM–1:30 PM based on 6-month foot-traffic data.',
    },
  ];
}

export function getAnomalyAlerts(): Array<{ message: string; confidence: number }> {
  return [
    {
      message:
        'Unusual Yelp review velocity at Pike Place Market — 340% above baseline. Possible undisclosed event.',
      confidence: 0.87,
    },
    {
      message:
        'Reddit post cluster in Pioneer Square matches historical pre-gathering patterns (87% similarity).',
      confidence: 0.84,
    },
  ];
}

export function getCityPulseScore(): {
  score: number;
  components: Array<{ label: string; score: number }>;
} {
  return {
    score: 72,
    components: [
      { label: 'Safety', score: 61 },
      { label: 'Traffic', score: 68 },
      { label: 'Events', score: 85 },
      { label: 'Civic', score: 74 },
    ],
  };
}
