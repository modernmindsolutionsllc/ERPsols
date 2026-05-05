import { useState, useEffect, useCallback } from 'react';

export function usePoll<T>(
  fetcher: () => Promise<T>,
  interval: number = 3000,
  enabled: boolean = true
): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [refresh, interval, enabled]);

  return { data, loading, error, refresh };
}
