import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { bipReportingApi, type OracleStatus, type OracleSessionResponse } from '@/services/api';

function isApiError(v: unknown): v is { error: { message: string } } {
  return typeof v === 'object' && v !== null && 'error' in v;
}

export function useOracleSessions(onSuccess?: (newEnvName: string) => void | Promise<void>) {
  const [oracleStatus, setOracleStatus] = useState<OracleStatus | null>(null);
  const [savedSessions, setSavedSessions] = useState<OracleSessionResponse[]>([]);
  const [activeEnv, setActiveEnv] = useState<OracleSessionResponse | null>(null);

  const fetchOracleStatus = useCallback(async () => {
    const res = await bipReportingApi.getOracleStatus();
    if (!isApiError(res)) setOracleStatus(res);
  }, []);

  const fetchSessions = useCallback(async () => {
    const res = await bipReportingApi.getOracleSessions();
    if (!isApiError(res)) {
      setSavedSessions(res);
      if (res.length > 0 && !activeEnv) {
        // Prefer the environment matching the most-recently-used status
        const statusEnv = oracleStatus?.env_name;
        const preferred = statusEnv
          ? res.find(s => s.env_name === statusEnv)
          : undefined;
        setActiveEnv(preferred || res[0]);
      }
    }
  }, [activeEnv, oracleStatus]);

  const handleSessionRefresh = useCallback(async (newActiveEnvName?: string) => {
    await fetchOracleStatus();
    const res = await bipReportingApi.getOracleSessions();
    if (!isApiError(res)) {
      setSavedSessions(res);
      if (res.length === 0) {
        setActiveEnv(null);
      } else if (newActiveEnvName) {
        const target = res.find(s => s.env_name === newActiveEnvName);
        setActiveEnv(target || res[0]);
      } else {
        setActiveEnv(prev => {
          if (!prev) return res[0];
          const updated = res.find(s => s.id === prev.id);
          return updated || res[0];
        });
      }
      if (newActiveEnvName && onSuccess) {
        void onSuccess(newActiveEnvName);
      }
    }
  }, [fetchOracleStatus, onSuccess]);

  const handleDeleteAll = useCallback(async () => {
    try {
      const res = await bipReportingApi.deleteAllOracleSessions();
      if (isApiError(res)) {
        toast.error(res.error.message);
        return;
      }
      setSavedSessions([]);
      setActiveEnv(null);
      setOracleStatus(null);
      toast.success('All Oracle credentials purged from the vault.');
      await fetchOracleStatus();
    } catch {
      toast.error('Failed to delete credentials.');
    }
  }, [fetchOracleStatus]);

  const handleSwitchEnv = useCallback((s: OracleSessionResponse) => {
    setActiveEnv(s);
    toast.success(`Switched to "${s.env_name}" (${s.oracle_username})`);
  }, []);

  useEffect(() => {
    void fetchOracleStatus();
  }, [fetchOracleStatus]);

  useEffect(() => {
    if (oracleStatus) void fetchSessions();
  }, [oracleStatus]);

  return {
    oracleStatus,
    savedSessions,
    activeEnv,
    setActiveEnv,
    fetchOracleStatus,
    fetchSessions,
    handleSessionRefresh,
    handleDeleteAll,
    handleSwitchEnv,
  };
}
