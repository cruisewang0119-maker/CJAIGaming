'use client';

import { useEffect } from 'react';
import { CityEvent } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#ef4444',
  Traffic: '#f59e0b',
  Events: '#3b82f6',
  Civic: '#22c55e',
  Business: '#8b5cf6',
  Hazard: '#f97316',
  Community: '#06b6d4',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
};

interface EventDetailDrawerProps {
  event: CityEvent;
  onClose: () => void;
}

export default function EventDetailDrawer({ event, onClose }: EventDetailDrawerProps) {
  const color = CATEGORY_COLORS[event.category] ?? '#6b7280';
  const avgCredibility =
    event.sources.length > 0
      ? Math.round((event.sources.reduce((sum, s) => sum + s.credibility, 0) / event.sources.length) * 100)
      : 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 max-w-full bg-[#12131a] border-l border-[#1e2030] z-50 overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-[#12131a] border-b border-[#1e2030] px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: color + '22', color }}
              >
                {event.category}
              </span>
              <span className="text-xs text-[#6b7280]">{SEVERITY_LABELS[event.severity]}</span>
              {event.status === 'predicted' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded border border-dashed"
                  style={{ borderColor: color + '88', color }}>
                  PREDICTED
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-[#e8eaf0] leading-tight">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#6b7280] hover:text-[#e8eaf0] transition-colors text-lg leading-none mt-0.5"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* Summary */}
          <p className="text-sm text-[#9ca3af]">{event.summary}</p>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e2030]">
              <div className="text-xs text-[#6b7280] mb-1">Impact Radius</div>
              <div className="text-lg font-semibold text-[#e8eaf0]">
                {event.impactRadiusMeters}m
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e2030]">
              <div className="text-xs text-[#6b7280] mb-1">Heat Score</div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-[#e8eaf0]">{event.heatScore}</span>
                <span className="text-xs text-[#6b7280]">/100</span>
                <span
                  className="ml-1 text-xs"
                  style={{ color: event.trend === 'rising' ? '#22c55e' : event.trend === 'cooling' ? '#6b7280' : '#f59e0b' }}
                >
                  {event.trend === 'rising' ? '↑' : event.trend === 'cooling' ? '↓' : '→'}
                </span>
              </div>
            </div>
          </div>

          {/* Prediction info */}
          {event.status === 'predicted' && event.confidence !== undefined && (
            <div className="rounded-lg border border-dashed p-3" style={{ borderColor: color + '66' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#6b7280]">Confidence</span>
                <span className="text-sm font-semibold" style={{ color }}>
                  {Math.round(event.confidence * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#1e2030] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(event.confidence * 100)}%`, backgroundColor: color }}
                />
              </div>
              {event.predictionReason && (
                <p className="text-xs text-[#6b7280] mt-2 italic">&ldquo;{event.predictionReason}&rdquo;</p>
              )}
            </div>
          )}

          {/* Source Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#e8eaf0]">Source Confidence</span>
              <span className="text-sm font-semibold" style={{ color }}>{avgCredibility}%</span>
            </div>
            <div className="h-1.5 bg-[#1e2030] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${avgCredibility}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {event.sources.map((src, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#0a0a0f] border border-[#1e2030] text-[#9ca3af]"
                >
                  {src.platform}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="text-xs font-medium text-[#e8eaf0] mb-2">Timeline</div>
            <div className="space-y-2">
              {event.sources.slice(0, 3).map((src, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? color : '#1e2030' }}
                  />
                  <div>
                    <div className="text-xs text-[#9ca3af]">
                      Reported by {src.platform}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      {formatDistanceToNow(new Date(src.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
              {event.predictedPeakAt && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 border border-dashed" style={{ borderColor: color }} />
                  <div>
                    <div className="text-xs text-[#9ca3af]">Predicted peak</div>
                    <div className="text-[10px] text-[#6b7280]">
                      {new Date(event.predictedPeakAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 text-xs py-2 rounded-lg bg-[#0a0a0f] border border-[#1e2030] text-[#9ca3af] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors">
              Navigate Around
            </button>
            <button className="flex-1 text-xs py-2 rounded-lg bg-[#0a0a0f] border border-[#1e2030] text-[#9ca3af] hover:border-[#22c55e] hover:text-[#22c55e] transition-colors">
              Find Nearby
            </button>
            <button className="flex-1 text-xs py-2 rounded-lg bg-[#0a0a0f] border border-[#1e2030] text-[#9ca3af] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors">
              Share Alert
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
