import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/shared/MetricCard';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { dashboardApi } from '@/services/api';
import type { DashboardMetrics } from '@/types';
import {
  Camera, ArrowRightLeft, BarChart3, Wallet, TrendingUp, Activity, CheckCircle, DollarSign
} from 'lucide-react';

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMetrics().then(res => {
      setMetrics(res.data);
      setLoading(false);
    });
  }, []);

  const tools = [
    {
      path: '/config',
      title: 'Config Snapshot',
      description: 'Capture and compare system configurations',
      icon: Camera,
      color: '#185FA5',
      bg: '#185FA51A'
    },
    {
      path: '/data-conversion',
      title: 'Data Conversion',
      description: 'ETL pipelines: Extract → Transform → Load',
      icon: ArrowRightLeft,
      color: '#0F6E56',
      bg: '#0F6E561A'
    },
    {
      path: '/bip-reporting',
      title: 'BIP Reporting',
      description: 'Performance reports and data quality audits',
      icon: BarChart3,
      color: '#BA7517',
      bg: '#BA75171A'
    },
    {
      path: '/payroll',
      title: 'Payroll Reconciliation',
      description: 'Compare pre/post payroll records',
      icon: Wallet,
      color: '#993C1D',
      bg: '#993C1D1A'
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-250">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0F172A] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Overview of your migration environment.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-lg p-6">
              <SkeletonTable columns={1} rows={2} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Records Migrated"
            value={new Intl.NumberFormat('en-US').format(metrics?.recordsMigrated.value || 0)}
            change={metrics?.recordsMigrated.change}
            icon={<TrendingUp size={18} />}
            accentColor="#185FA5"
          />
          <MetricCard
            label="Validation Pass Rate"
            value={`${metrics?.validationPassRate.value || 0}%`}
            change={metrics?.validationPassRate.change}
            icon={<CheckCircle size={18} />}
            accentColor="#0F6E56"
          />
          <MetricCard
            label="ETL Jobs Run"
            value={new Intl.NumberFormat('en-US').format(metrics?.etlJobsRun.value || 0)}
            change={metrics?.etlJobsRun.change}
            icon={<Activity size={18} />}
            accentColor="#BA7517"
          />
          <MetricCard
            label="Payroll Match Rate"
            value={`${metrics?.payrollMatchRate.value || 0}%`}
            change={metrics?.payrollMatchRate.change}
            icon={<DollarSign size={18} />}
            accentColor="#993C1D"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group bg-white border border-[#E2E8F0] rounded-lg p-6 flex items-start gap-4 hover:shadow-lg transition-all duration-200"
              style={{ borderColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = tool.color + '4D')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: tool.bg, color: tool.color }}
              >
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#185FA5] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-[#64748B] mt-0.5">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
