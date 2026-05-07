import { Link } from 'react-router-dom';
import {
  Camera, ArrowRightLeft, BarChart3, Wallet
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export function DashboardPage() {
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
      description: 'ETL pipelines: Extract -> Transform -> Load',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="block group outline-none"
            >
              <Card className="h-full flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer border-[#E2E8F0] group-hover:border-[#185FA5]/30">
                <CardHeader className="pb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: tool.bg, color: tool.color }}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#0F172A] group-hover:text-[#185FA5] transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-sm text-[#64748B]">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
