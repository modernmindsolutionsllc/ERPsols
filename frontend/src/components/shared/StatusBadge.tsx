import { STATUS_COLORS } from '@/utils/constants';

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const lower = status.toLowerCase();
  let variant: keyof typeof STATUS_COLORS = 'neutral';

  if (lower.includes('complete') || lower.includes('success') || lower.includes('pass') || lower.includes('matched') || lower.includes('resolve') || lower.includes('active') || lower.includes('online')) {
    variant = 'success';
  } else if (lower.includes('fail') || lower.includes('error') || lower.includes('exception') || lower.includes('open') || lower.includes('offline')) {
    variant = 'error';
  } else if (lower.includes('pending') || lower.includes('run') || lower.includes('process') || lower.includes('review') || lower.includes('warn')) {
    variant = 'warning';
  } else if (lower.includes('info') || lower.includes('capture')) {
    variant = 'info';
  }

  const colors = STATUS_COLORS[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${pulse ? 'animate-pulse' : ''}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        ...(pulse ? {
          animation: 'pulse-badge 2s infinite',
          boxShadow: `0 0 0 0 ${colors.text}66`
        } : {})
      }}
    >
      {status}
    </span>
  );
}
