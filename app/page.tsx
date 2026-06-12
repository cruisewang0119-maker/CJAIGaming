'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EventFeed from '@/components/EventFeed';
import ChatPanel from '@/components/ChatPanel';
import EventDetailDrawer from '@/components/EventDetailDrawer';
import { CityEvent, POI } from '@/lib/types';
import { useRealtimeEvents, useCityPulse, useBreakingAlert } from '@/lib/hooks';

// MapView uses browser-only Mapbox APIs; disable SSR
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#ef4444',
  Traffic: '#f59e0b',
  Events: '#3b82f6',
  Civic: '#22c55e',
  Business: '#8b5cf6',
  Hazard: '#f97316',
  Community: '#06b6d4',
};

export default function PulseCityPage() {
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [highlightedPois, setHighlightedPois] = useState<POI[]>([]);

  // Realtime data hooks (AC-4: useRealtimeEvents consumed in page.tsx)
  const { events: liveEvents } = useRealtimeEvents(30_000);
  const { pulseScore, stats } = useCityPulse(liveEvents);
  const { alert: breakingAlert, dismiss: dismissAlert } = useBreakingAlert(liveEvents);

  // feed → page → drawer + map
  const handleEventSelect = useCallback((event: CityEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // chat → page → map
  const handlePoisHighlight = useCallback((pois: POI[]) => {
    setHighlightedPois(pois);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-[#e8eaf0] overflow-hidden">
      {/* ── Breaking Alert Banner ── */}
      {breakingAlert && (
        <div
          className="animate-fade-in-up flex items-center justify-between px-4 py-2 text-xs font-medium z-20 flex-shrink-0"
          style={{
            backgroundColor: (CATEGORY_COLORS[breakingAlert.category] ?? '#ef4444') + '22',
            borderBottom: `1px solid ${(CATEGORY_COLORS[breakingAlert.category] ?? '#ef4444')}66`,
            color: CATEGORY_COLORS[breakingAlert.category] ?? '#ef4444',
          }}
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: CATEGORY_COLORS[breakingAlert.category] ?? '#ef4444' }} />
            <span className="font-bold">BREAKING</span>
            <span className="text-[#e8eaf0]">{breakingAlert.title}</span>
          </span>
          <button
            onClick={dismissAlert}
            className="text-[#6b7280] hover:text-[#e8eaf0] transition-colors ml-4 flex-shrink-0"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2030] bg-[#0a0a0f] flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e8eaf0] tracking-tight">
            <span className="text-[#3b82f6]">Pulse</span>City
          </span>
          <span className="text-xs px-2 py-0.5 rounded border border-[#1e2030] text-[#6b7280]">
            Seattle, WA
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Pulse score */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b7280]">City Pulse</span>
            <span
              className="text-[10px] font-mono font-semibold"
              style={{ color: pulseScore >= 70 ? '#ef4444' : pulseScore >= 50 ? '#f59e0b' : '#22c55e' }}
            >
              {pulseScore}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-[#6b7280] font-medium">LIVE</span>
          </div>
          <div className="text-[10px] text-[#6b7280] font-mono">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </nav>

      {/* ── Main 60/40 split ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left 60%: Map ── */}
        <div className="w-[60%] h-full relative min-w-0">
          <MapView
            selectedEvent={selectedEvent}
            onEventSelect={handleEventSelect}
            highlightedPois={highlightedPois}
          />

          {/* City Heat Index bar — driven by useCityPulse stats */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0f]/90 border-t border-[#1e2030] px-3 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="text-[10px] text-[#6b7280] font-semibold whitespace-nowrap">City Heat</span>
            {stats.map((n) => (
              <div key={n.neighborhood} className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-[10px] text-[#9ca3af]">{n.neighborhood}</span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{
                    color: n.heatScore >= 75 ? '#ef4444' : n.heatScore >= 55 ? '#f59e0b' : '#22c55e',
                  }}
                >
                  {n.heatScore}
                </span>
                <span
                  className="text-[9px]"
                  style={{
                    color:
                      n.trend === 'rising' ? '#22c55e' : n.trend === 'cooling' ? '#6b7280' : '#f59e0b',
                  }}
                >
                  {n.trend === 'rising' ? '↑' : n.trend === 'cooling' ? '↓' : '→'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right 40%: Feed + Chat ── */}
        <div className="w-[40%] h-full flex flex-col border-l border-[#1e2030] min-w-0">

          {/* Top 50%: Event Feed */}
          <div className="h-1/2 overflow-hidden border-b border-[#1e2030]">
            <EventFeed
              selectedEventId={selectedEvent?.id}
              onEventSelect={handleEventSelect}
            />
          </div>

          {/* Bottom 50%: Chat */}
          <div className="h-1/2 overflow-hidden">
            <ChatPanel onPoisHighlight={handlePoisHighlight} />
          </div>
        </div>
      </div>

      {/* ── Event Detail Drawer ── */}
      {selectedEvent && (
        <EventDetailDrawer event={selectedEvent} onClose={handleDrawerClose} />
      )}
    </div>
  );
}
