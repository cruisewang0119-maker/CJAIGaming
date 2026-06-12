'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EventFeed from '@/components/EventFeed';
import ChatPanel from '@/components/ChatPanel';
import EventDetailDrawer from '@/components/EventDetailDrawer';
import { CityEvent, POI } from '@/lib/types';

// MapView uses browser-only Mapbox APIs; disable SSR
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function PulseCityPage() {
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [highlightedPois, setHighlightedPois] = useState<POI[]>([]);

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
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left 60%: Map ── */}
        <div className="w-[60%] h-full relative">
          <MapView
            selectedEvent={selectedEvent}
            onEventSelect={handleEventSelect}
            highlightedPois={highlightedPois}
          />

          {/* City Heat Index bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0f]/90 border-t border-[#1e2030] px-3 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="text-[10px] text-[#6b7280] font-semibold whitespace-nowrap">City Heat</span>
            {[
              { name: 'Capitol Hill', score: 88, trend: 'rising' },
              { name: 'Pioneer Sq', score: 75, trend: 'rising' },
              { name: 'Downtown', score: 62, trend: 'stable' },
              { name: 'Ballard', score: 55, trend: 'rising' },
              { name: 'SLU', score: 45, trend: 'stable' },
              { name: 'Fremont', score: 38, trend: 'cooling' },
            ].map((n) => (
              <div key={n.name} className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-[10px] text-[#9ca3af]">{n.name}</span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{
                    color:
                      n.score >= 75
                        ? '#ef4444'
                        : n.score >= 55
                        ? '#f59e0b'
                        : '#22c55e',
                  }}
                >
                  {n.score}
                </span>
                <span
                  className="text-[9px]"
                  style={{
                    color:
                      n.trend === 'rising'
                        ? '#22c55e'
                        : n.trend === 'cooling'
                        ? '#6b7280'
                        : '#f59e0b',
                  }}
                >
                  {n.trend === 'rising' ? '↑' : n.trend === 'cooling' ? '↓' : '→'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right 40%: Feed + Chat ── */}
        <div className="w-[40%] h-full flex flex-col border-l border-[#1e2030]">

          {/* Top 50%: Event Feed — feed → page → drawer+map */}
          <div className="h-1/2 overflow-hidden border-b border-[#1e2030]">
            <EventFeed
              selectedEventId={selectedEvent?.id}
              onEventSelect={handleEventSelect}
            />
          </div>

          {/* Bottom 50%: Chat — chat → page → map */}
          <div className="h-1/2 overflow-hidden">
            <ChatPanel onPoisHighlight={handlePoisHighlight} />
          </div>
        </div>
      </div>

      {/* ── Event Detail Drawer — feed → page → drawer ── */}
      {selectedEvent && (
        <EventDetailDrawer event={selectedEvent} onClose={handleDrawerClose} />
      )}
    </div>
  );
}
