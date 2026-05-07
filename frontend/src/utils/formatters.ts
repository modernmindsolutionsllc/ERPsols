import { format, formatDistanceToNow } from 'date-fns';

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.floor((minutes - m) * 60);
  return `${m}m ${s}s`;
}

/**
 * Converts raw seconds into a human-readable active-time string.
 *   < 60s        → "45s"
 *   >= 60s < 1h  → "12m 30s"
 *   >= 1h        → "2h 15m 10s"
 */
export function formatActiveTime(totalSeconds: number): string {
  if (totalSeconds < 0) return '0s';

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Formats an ISO datetime string into a human-readable "Last Active" timestamp.
 *   Null         → "Never"
 *   Today        → "Today at 02:30 PM"
 *   Other days   → "May 06, 02:30 PM"
 */
export function formatLastActive(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Never";

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Today at ${timeString}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${dateStr}, ${timeString}`;
}
