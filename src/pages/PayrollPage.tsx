import { useState, useEffect } from 'react';
import { payrollApi } from '@/services/api';
import { usePermission } from '@/hooks/usePermission';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataReveal } from '@/components/shared/DataReveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { toast } from 'sonner';
import { hasError } from '@/services/api';
import type { PayrollException } from '@/types';
import {
  Play, Download, CheckCircle2, Users, AlertTriangle, TrendingUp
} from 'lucide-react';

export function PayrollPage() {
  const [exceptions, setExceptions] = useState<PayrollException[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const canRun = usePermission('run_reconciliation');
  const canResolve = usePermission('run_reconciliation');

  useEffect(() => {
    loadExceptions();
  }, []);

  async function loadExceptions() {
    setLoading(true);
    const res = await payrollApi.getExceptions();
    setExceptions(res.data);
    setLoading(false);
  }

  async function handleReconcile() {
    setReconciling(true);
    const res = await payrollApi.runReconciliation();
    if (hasError(res)) {
      toast.error(res.error.message);
    } else {
      toast.success(`Reconciliation complete: ${res.data.matchRate}% match rate`);
      loadExceptions();
    }
    setReconciling(false);
  }

  async function handleResolve(id: string) {
    const res = await payrollApi.resolveException(id);
    if (hasError(res)) {
      toast.error(res.error.message);
    } else {
      toast.success(`Exception ${id} marked as resolved`);
      loadExceptions();
    }
  }

  const openCount = exceptions.filter(e => e.status === 'Open').length;
  const reviewCount = exceptions.filter(e => e.status === 'Under Review').length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-250">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A] tracking-tight">Payroll Reconciliation</h1>
          <p className="text-sm text-[#64748B] mt-1">Compare pre/post migration payroll records.</p>
        </div>
        {canRun && (
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#993C1D] hover:bg-[#7A3017] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <Play size={16} />
            {reconciling ? 'Running...' : 'Run Reconciliation'}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Employees"
          value="4,218"
          icon={<Users size={18} />}
          accentColor="#185FA5"
        />
        <MetricCard
          label="Matched Records"
          value="4,058"
          icon={<CheckCircle2 size={18} />}
          accentColor="#0F6E56"
        />
        <MetricCard
          label="Exceptions"
          value={String(openCount + reviewCount)}
          icon={<AlertTriangle size={18} />}
          accentColor="#993C1D"
        />
        <MetricCard
          label="Match Rate"
          value="96.2%"
          change={-1.2}
          icon={<TrendingUp size={18} />}
          accentColor="#0F6E56"
        />
      </div>

      {/* Exceptions Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F172A]">Exceptions</h2>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#64748B] hover:text-[#185FA5] hover:bg-[#EAF2FB] rounded-md transition-colors">
            <Download size={14} />
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="p-4">
            <SkeletonTable columns={6} rows={5} />
          </div>
        ) : exceptions.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={48} />}
            title="No exceptions found"
            description="All payroll records matched successfully between legacy and modern systems."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Employee ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Field</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Legacy Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">New Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">Status</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {exceptions.map(exc => (
                  <tr key={exc.id} className="hover:bg-[#EAF2FB] transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-[#0F172A]">{exc.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-[#0F172A] capitalize">{exc.field.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <DataReveal value={exc.legacyValue} isSensitive={exc.isSensitive} />
                    </td>
                    <td className="px-4 py-3">
                      <DataReveal value={exc.newValue} isSensitive={exc.isSensitive} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exc.status} />
                    </td>
                    <td className="px-4 py-3">
                      {canResolve && exc.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(exc.id)}
                          className="p-1.5 hover:bg-[rgba(15,110,86,0.1)] rounded text-[#64748B] hover:text-[#0F6E56] transition-colors"
                          title="Mark as resolved"
                        >
                          <CheckCircle2 size={16} />
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
  );
}
