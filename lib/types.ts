export type EventCategory =
  | 'Safety'
  | 'Traffic'
  | 'Hazard'
  | 'Events'
  | 'Business'
  | 'Civic'
  | 'Community';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EventSource {
  platform: string;
  url: string;
  credibility: number;
  timestamp: string;
}

export interface POIDynamic {
  activeEvents: string[];
  heatScore: number;
  trend: 'rising' | 'stable' | 'cooling';
  lastEventAt: string;
}

export interface POI {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  neighborhood: string;
  dynamic?: POIDynamic;
}

export interface CityEvent {
  id: string;
  title: string;
  summary: string;
  category: EventCategory;
  severity: EventSeverity;
  sources: EventSource[];
  pois: string[];
  lat: number;
  lng: number;
  impactRadiusMeters: number;
  heatScore: number;
  trend: 'rising' | 'stable' | 'cooling';
  createdAt: string;
  expiresAt: string;
  status: 'ongoing' | 'resolved' | 'predicted';
  predictedPeakAt?: string;
  confidence?: number;
  predictionReason?: string;
  actionLinks?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedPois?: POI[];
}

export interface CityStats {
  neighborhood: string;
  heatScore: number;
  trend: 'rising' | 'stable' | 'cooling';
  activeEvents: number;
}

export interface ToolCallStatus {
  tool: string;
  label: string;
  status: 'running' | 'done';
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;
  created_utc: number;
  permalink: string;
  subreddit: string;
}

export interface ClassifiedPost {
  is_local_event: boolean;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  summary: string;
  location_mention: string | null;
  confidence: number;
}

export interface SearchEventsInput {
  category?: EventCategory;
  neighborhood?: string;
  near?: { lat: number; lng: number };
  radius_miles?: number;
  include_predicted?: boolean;
  max_results?: number;
}

export interface QueryPoiInput {
  query?: string;
  category?: string;
  neighborhood?: string;
  near?: { lat: number; lng: number };
  exclude_near_events?: boolean;
  max_results?: number;
}

export interface GetPredictionsInput {
  hours_ahead?: number;
  category?: EventCategory;
}

export interface GetAreaStatusInput {
  neighborhood: string;
}

export type ToolInput =
  | SearchEventsInput
  | QueryPoiInput
  | GetPredictionsInput
  | GetAreaStatusInput;
