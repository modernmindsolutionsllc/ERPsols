import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { ROLE_COLORS } from '@/utils/constants';
import { toast } from 'sonner';
import { hasError } from '@/services/api';
import type { AdminUser, AuditLogEntry } from '@/types';
import {
  Plus, Shield, Users, CreditCard, ClipboardList, MoreHorizontal, X
} from 'lucide-react';

type AdminTab = 'users' | 'subscription' | 'audit';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [inviting, setInviting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [usersRes, auditRes] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getAuditLog()
    ]);
    setUsers(usersRes.data);
    setAuditLogs(auditRes.data);
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const res = await adminApi.inviteUser(inviteEmail, inviteRole);
    if (hasError(res)) {
      toast.error(res.error.message);
    } else {
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteModal(false);
      setInviteEmail('');
      loadData();
    }
    setInviting(false);
  }

  async function handleDeactivate(userId: string) {
    const res = await adminApi.deactivateUser(userId);
    if (hasError(res)) {
      toast.error(res.error.message);
    } else {
      toast.success('User deactivated');
      loadData();
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    const res = await adminApi.updateRole(userId, newRole);
    if (hasError(res)) {
      toast.error(res.error.message);
    } else {
      toast.success(`Role updated to ${newRole}`);
      loadData();
    }
  }

  const tabs = [
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'subscription' as AdminTab, label: 'Subscription', icon: CreditCard },
    { id: 'audit' as AdminTab, label: 'Audit Log', icon: ClipboardList }
  ];

  const tiers = [
    {
      name: 'Viewer',
      color: '#64748B',
      price: '$29/mo',
      features: ['view_dashboard', 'view_reports', 'view_snapshots']
    },
    {
      name: 'Analyst',
      color: '#185FA5',
      price: '$79/mo',
      features: ['...', 'view_payroll', 'run_bip_report']
    },
    {
      name: 'Engineer',
      color: '#0F6E56',
      price: '$149/mo',
      features: ['...', 'run_etl', 'run_reconciliation', 'create_snapshot']
    },
    {
      name: 'Admin',
      color: '#6B3FA0',
      price: '$299/mo',
      features: ['...', 'manage_users', 'view_audit_log', 'change_roles']
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-250">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] tracking-tight">Admin</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage users, subscriptions, and audit trails.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#E2E8F0]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-[#185FA5] text-[#185FA5]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B3FA0] hover:bg-[#553280] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus size={16} />
              Invite User
            </button>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-4">
                <SkeletonTable columns={5} rows={5} />
              </div>
            ) : users.length === 0 ? (
              <EmptyState icon={<Users size={48} />} title="No users found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F3F4F6]">
                      <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Status</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[#EAF2FB] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{u.name}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={e => handleChangeRole(u.id, e.target.value)}
                            className="text-xs font-medium px-2 py-1 rounded border border-transparent bg-transparent hover:bg-gray-50 cursor-pointer"
                            style={{ color: ROLE_COLORS[u.role] }}
                          >
                            {['Viewer', 'Analyst', 'Engineer', 'Admin'].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-4 py-3">
                          {u.status === 'Active' && u.id !== user?.id && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              className="p-1.5 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#993C1D] transition-colors"
                              title="Deactivate"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className="bg-white border border-[#E2E8F0] rounded-lg p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
              style={{ borderLeft: `4px solid ${tier.color}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-[#0F172A]">{tier.name}</h3>
                {user?.role === tier.name && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#0F6E561A] text-[#0F6E56]">
                    Current
                  </span>
                )}
              </div>
              <div className="text-2xl font-semibold text-[#0F172A] mb-4">{tier.price}</div>
              <ul className="space-y-2">
                {tier.features.map((feat, i) => (
                  <li key={i} className="text-sm text-[#64748B] flex items-center gap-2">
                    <Shield size={12} style={{ color: tier.color }} />
                    {feat === '...' ? 'All previous features' : feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4">
              <SkeletonTable columns={4} rows={6} />
            </div>
          ) : auditLogs.length === 0 ? (
            <EmptyState icon={<ClipboardList size={48} />} title="No audit entries" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#EAF2FB] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{log.user}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-sm font-medium"
                          style={{ borderLeft: `3px solid ${log.color}`, paddingLeft: 8 }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setInviteModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[440px] mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">Invite User</h2>
              <button onClick={() => setInviteModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} className="text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full h-10 px-3 rounded-md border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[rgba(24,95,165,0.15)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[rgba(24,95,165,0.15)] bg-white"
                >
                  <option>Viewer</option>
                  <option>Analyst</option>
                  <option>Engineer</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-4 py-2 bg-[#6B3FA0] hover:bg-[#553280] text-white text-sm font-medium rounded-md disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
