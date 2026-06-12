'use client';

interface ToolStep {
  tool: string;
  label: string;
  done: boolean;
}

interface ToolCallIndicatorProps {
  steps: ToolStep[];
  collapsed: boolean;
}

export default function ToolCallIndicator({ steps, collapsed }: ToolCallIndicatorProps) {
  const doneCount = steps.filter((s) => s.done).length;
  const current = steps.find((s) => !s.done);

  if (collapsed || (steps.length > 0 && doneCount === steps.length && !current)) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-2 px-1">
        <span className="text-[#22c55e]">✓</span>
        <span className="font-mono">Queried {doneCount} data source{doneCount !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="mb-2 rounded-lg border border-[#1e2030] bg-[#12131a] px-3 py-2 text-xs">
      {/* Completed steps */}
      {steps
        .filter((s) => s.done)
        .map((step) => (
          <div key={step.tool} className="flex items-center gap-2 text-[#6b7280] mb-1">
            <span className="text-[#22c55e] flex-shrink-0">✓</span>
            <span className="font-mono">{step.label}</span>
          </div>
        ))}

      {/* Current running step */}
      {current && (
        <div className="flex items-center gap-2 text-[#e8eaf0]">
          <span className="flex-shrink-0 relative w-3 h-3">
            <span className="absolute inset-0 rounded-full border border-[#3b82f6] animate-ping opacity-75" />
            <span className="absolute inset-[2px] rounded-full bg-[#3b82f6]" />
          </span>
          <span
            className="font-mono text-[#93c5fd]"
            style={{ textShadow: '0 0 8px rgba(59,130,246,0.6)' }}
          >
            {current.label}
          </span>
        </div>
      )}
    </div>
  );
}
