interface ProgressBarPulseProps {
  value: number;
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
}

const statusColors: Record<string, string> = {
  idle: '#CBD5E1',
  pending: '#CBD5E1',
  running: '#BA7517',
  completed: '#0F6E56',
  failed: '#993C1D'
};

export function ProgressBarPulse({ value, status }: ProgressBarPulseProps) {
  const color = statusColors[status] || '#CBD5E1';
  const showShimmer = status === 'running';

  return (
    <div className="w-full">
      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(4, Math.min(100, value))}%`, backgroundColor: color }}
        />
        {showShimmer && (
          <div
            className="absolute top-0 left-0 h-full w-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear'
            }}
          />
        )}
      </div>
      <span className="text-xs text-[#64748B] mt-1 inline-block">{value}%</span>
    </div>
  );
}
