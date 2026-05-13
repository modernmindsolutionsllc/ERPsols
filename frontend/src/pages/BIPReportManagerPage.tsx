import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, LockKeyhole, PlusCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import {
  bipReportingApi,
  hasError,
  type ManagedBipReportCreate,
  type ManagedBipReportResponse,
} from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MODULE_OPTIONS = ['HCM', 'FIN', 'SCM', 'CX'];
const REPORT_NAME_OPTIONS: Record<string, string[]> = {
  HCM: [
    'Employee_Extract',
    'Worker_Assignment_Report',
    'Department_Hierarchy_Report',
    'Compensation_Snapshot',
  ],
  FIN: [
    'Invoice_Extract',
    'GL_Balance_Report',
    'AP_Payment_Register',
    'Revenue_Summary_Report',
  ],
  SCM: [
    'Inventory_Valuation_Report',
    'Purchase_Order_Extract',
    'Supplier_Performance_Report',
    'Item_Master_Extract',
  ],
  CX: [
    'Customer_Account_Extract',
    'Opportunity_Pipeline_Report',
    'Service_Request_Report',
    'Contact_Master_Extract',
  ],
};

const EMPTY_FORM: ManagedBipReportCreate = {
  module: '',
  report_name: '',
  sql_query: '',
};

export function BIPReportManagerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  const [form, setForm] = useState<ManagedBipReportCreate>(EMPTY_FORM);
  const [reports, setReports] = useState<ManagedBipReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportNameOptions = form.module ? REPORT_NAME_OPTIONS[form.module] ?? [] : [];

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setIsLoading(true);
      const res = await bipReportingApi.getManagedBipReports();
      if (!active) return;

      if (hasError(res)) {
        toast.error(res.error.message || 'Failed to load private SQL reports.');
        setReports([]);
      } else {
        setReports(res);
      }
      setIsLoading(false);
    }

    void loadReports();
    return () => {
      active = false;
    };
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const handleChange = (field: keyof ManagedBipReportCreate, value: string) => {
    setForm((prev) => {
      if (field === 'module') {
        return { ...prev, module: value, report_name: '' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.module.trim() || !form.report_name.trim() || !form.sql_query.trim()) {
      toast.error('Module, report name, and SQL query are required.');
      return;
    }

    setIsSubmitting(true);
    const res = await bipReportingApi.createManagedBipReport(form);

    if (hasError(res)) {
      toast.error(res.error.message || 'Failed to save encrypted SQL report.');
      setIsSubmitting(false);
      return;
    }

    setReports((prev) => [res, ...prev]);
    setForm(EMPTY_FORM);
    toast.success('Encrypted SQL report saved.');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-250 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck size={14} />
            Admin-only
          </div>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            <LockKeyhole className="text-[#185FA5]" size={32} />
            Private Encrypted BIP Report Manager
          </h1>
          <p className="mt-2 max-w-3xl text-gray-500 dark:text-slate-400">
            Save report SQL in the encrypted vault using the same Fernet key as Oracle credentials. Stored queries are decrypted only on this private page and during backend execution.
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="gap-2 self-start border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          onClick={() => navigate('/bip-reporting')}
        >
          <ArrowLeft size={16} />
          Back to BIP Reporting
        </Button>
      </div>

      <Card className="border dark:border-white/10 shadow-sm rounded-xl bg-white dark:bg-slate-950">
        <div className="border-b dark:border-white/10 px-6 py-5" style={{ background: 'linear-gradient(145deg, rgba(24,95,165,0.06) 0%, rgba(13,59,110,0.04) 100%)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Save a Private SQL Report</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Enter only the three fields you need. The query is encrypted before it reaches the database row.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select
                value={form.module}
                onValueChange={(value) => handleChange('module', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report_name">Report Name</Label>
              <Select
                value={form.report_name}
                onValueChange={(value) => handleChange('report_name', value)}
                disabled={isSubmitting || !form.module}
              >
                <SelectTrigger id="report_name">
                  <SelectValue placeholder={form.module ? 'Select report name' : 'Select module first'} />
                </SelectTrigger>
                <SelectContent>
                  {reportNameOptions.map((reportName) => (
                    <SelectItem key={reportName} value={reportName}>
                      {reportName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sql_query">SQL Query</Label>
            <Textarea
              id="sql_query"
              placeholder="SELECT * FROM ..."
              value={form.sql_query}
              onChange={(e) => handleChange('sql_query', e.target.value)}
              disabled={isSubmitting}
              className="min-h-[220px] font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            <span>The saved query will be stored as ciphertext in `encrypted_sql_query`, not in plain `sql_query`.</span>
            <Button
              type="submit"
              className="gap-2 bg-[#185FA5] text-white hover:bg-[#0D3B6E]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle size={16} />}
              {isSubmitting ? 'Saving...' : 'Save Encrypted Report'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border dark:border-white/10 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="border-b dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Private Reports</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">These queries are decrypted by the API for this admin-only management view.</p>
        </div>

        {isLoading ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading encrypted reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No saved private reports yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900">
                  <TableHead className="w-[140px]">Module</TableHead>
                  <TableHead className="w-[260px]">Report Name</TableHead>
                  <TableHead>Decrypted SQL Query</TableHead>
                  <TableHead className="w-[180px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="align-top">
                    <TableCell className="font-semibold text-[#185FA5]">{report.module}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-slate-100">{report.report_name}</TableCell>
                    <TableCell>
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100">
                        {report.sql_query}
                      </pre>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(report.created_at), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
