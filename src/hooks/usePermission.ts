import { useMemo } from 'react';
import { ROLE_PERMISSIONS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

export function usePermission(action: string): boolean {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] || [];
    return perms.includes(action);
  }, [user, action]);
}
