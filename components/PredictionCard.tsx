'use client';

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

interface PredictionCardProps {
  event: CityEvent;
  onClick?: () => void;
}

export default function PredictionCard({ event, onClick }: PredictionCardProps) {
  const color = CATEGORY_COLORS[event.category] ?? '#6b7280';
  const confidence = event.confidence ? Math.round(event.confidence * 100) : null;

  const peakTime = event.predictedPeakAt
    ? new Date(event.predictedPeakAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      onClick={onClick}
      className="rounded-lg border-2 border-dashed bg-[#12131a] p-3 cursor-pointer hover:bg-[#1a1b26] transition-colors"
      style={{ borderColor: color + '66' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ backgroundColor: color + '22', color }}
          >
            PREDICTED
          </span>
          <span className="text-xs font-semibold text-[#e8eaf0] truncate">{event.title.replace('Predicted: ', '')}</span>
        </div>
        {confidence !== null && (
          <span className="text-[10px] text-[#6b7280] flex-shrink-0 font-mono">{confidence}%</span>
        )}
      </div>

      <p className="text-xs text-[#6b7280] line-clamp-2 mb-2">{event.summary}</p>

      <div className="flex items-center justify-between text-[10px] text-[#6b7280]">
        <span
          className="px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: color + '22', color }}
        >
          {event.category}
        </span>
        {peakTime && <span>Peak ~{peakTime}</span>}
        {event.predictionReason && (
          <span className="flex items-center gap-1">
            <span style={{ color }}>⚡</span>
            AI
          </span>
        )}
      </div>
    </div>
  );
}
