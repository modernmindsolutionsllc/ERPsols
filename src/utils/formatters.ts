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
