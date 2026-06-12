'use client';

import { formatDistanceToNow } from 'date-fns';
import useSWR from 'swr';
import { CityEvent } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#ef4444',
  Traffic: '#f59e0b',
  Events: '#3b82f6',
  Civic: '#22c55e',
  Business: '#8b5cf6',
  Hazard: '#f97316',
  Community: '#06b6d4',
};

const CATEGORY_ICONS: Record<string, string> = {
  Safety: '🚨',
  Traffic: '🚦',
  Events: '🎉',
  Civic: '🏛',
  Business: '📊',
  Hazard: '⚠️',
  Community: '👥',
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface EventFeedProps {
  selectedEventId?: string;
  onEventSelect: (event: CityEvent) => void;
}

function EventCardSkeleton() {
  return (
    <div className="px-3 py-2.5 border-b border-[#1e2030] animate-pulse">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded bg-[#1e2030] flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-[#1e2030] rounded w-3/4" />
          <div className="h-2.5 bg-[#1e2030] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: CityEvent;
  selected: boolean;
  onClick: () => void;
}

function EventCard({ event, selected, onClick }: EventCardProps) {
  const color = CATEGORY_COLORS[event.category] ?? '#6b7280';
  const icon = CATEGORY_ICONS[event.category] ?? '📌';
  const isPredicted = event.status === 'predicted';
  const confidence = isPredicted && event.confidence ? Math.round(event.confidence * 100) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b border-[#1e2030] hover:bg-[#1a1b26] transition-colors ${
        selected ? 'bg-[#1a1b26]' : ''
      } ${isPredicted ? 'border-l-2 border-dashed' : ''}`}
      style={isPredicted ? { borderLeftColor: color + '88' } : {}}
    >
      <div className="flex items-start gap-2">
        {/* Category icon dot */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
          style={{ backgroundColor: color + '22' }}
        >
          <span>{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-[#e8eaf0] leading-tight line-clamp-2">
              {event.title}
            </span>
            {isPredicted && (
              <span
                className="text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 border border-dashed"
                style={{ color, borderColor: color + '88' }}
              >
                PREDICTED
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-medium"
              style={{ color }}
            >
              {event.category}
            </span>
            <span className="text-[10px] text-[#6b7280]">
              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
            </span>
            {confidence !== null && (
              <span className="text-[10px] text-[#6b7280] font-mono ml-auto">{confidence}% conf.</span>
            )}
            {!isPredicted && (
              <span
                className="text-[10px] ml-auto font-mono"
                style={{ color: event.trend === 'rising' ? '#22c55e' : event.trend === 'cooling' ? '#6b7280' : '#f59e0b' }}
              >
                {event.heatScore}
                {event.trend === 'rising' ? '↑' : event.trend === 'cooling' ? '↓' : '→'}
              </span>
            )}
          </div>
        </div>

        <span className="text-[#6b7280] flex-shrink-0 mt-1 text-xs">→</span>
      </div>
    </button>
  );
}

export default function EventFeed({ selectedEventId, onEventSelect }: EventFeedProps) {
  const { data: events, isLoading } = useSWR<CityEvent[]>('/api/events', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const ongoingEvents = (events ?? []).filter((e) => e.status !== 'predicted');
  const predictedEvents = (events ?? []).filter((e) => e.status === 'predicted');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2030] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#e8eaf0]">Live Events</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-[#6b7280]">Live</span>
          </span>
        </div>
        {events && (
          <span className="text-[10px] text-[#6b7280]">{events.length} active</span>
        )}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : (
          <>
            {ongoingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                selected={event.id === selectedEventId}
                onClick={() => onEventSelect(event)}
              />
            ))}

            {predictedEvents.length > 0 && (
              <div className="px-3 pt-2 pb-1">
                <div className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider mb-2">
                  AI Predictions
                </div>
                {predictedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    selected={event.id === selectedEventId}
                    onClick={() => onEventSelect(event)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
