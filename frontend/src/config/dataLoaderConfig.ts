/**
 * dataLoaderConfig.ts
 * ───────────────────
 * Master configuration dictionary for the Data Conversion Tool (ETL Pipeline).
 * Maps top-level HCM modules to their respective business objects.
 *
 * DRY Principle: The UniversalETLScreen component reads this config
 * dynamically — NO separate component files per business object.
 */

import {
  Users, Building2, Wallet, UserSearch, CalendarOff, Clock4, Award,
  Contact, DollarSign, Briefcase, Landmark, CreditCard, BarChart3,
  FileText, ClipboardList, UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BusinessObject {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ModuleConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  tagColor: string;
  objects: BusinessObject[];
}

export const DATA_LOADER_CONFIG: ModuleConfig[] = [
  {
    key: 'core_hr',
    label: 'Core HR',
    icon: Users,
    description: 'Workforce structures, worker records, salaries, and personal contacts.',
    accentColor: '#0F6E56',
    gradientFrom: '#073D30',
    gradientTo: '#0F6E56',
    tagColor: '#6EE7B7',
    objects: [
      { key: 'workforce_structures', label: 'Workforce Structures', icon: Building2, description: 'Organizations, locations, jobs, positions, grades, and departments.' },
      { key: 'worker', label: 'Worker', icon: Users, description: 'Person records, employment, assignments, and work relationships.' },
      { key: 'salary', label: 'Salary', icon: DollarSign, description: 'Salary basis, components, and compensation history.' },
      { key: 'person_contact', label: 'Person Contact', icon: Contact, description: 'Emergency contacts, dependents, and beneficiaries.' },
    ],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    icon: Wallet,
    description: 'Payroll details, tax withholdings, elements, banks, timecards, and balances.',
    accentColor: '#185FA5',
    gradientFrom: '#0D3B6E',
    gradientTo: '#1E6FBA',
    tagColor: '#93C5FD',
    objects: [
      { key: 'person_payroll_detail', label: 'Person Payroll Detail', icon: FileText, description: 'Payroll assignments, frequencies, and payment methods.' },
      { key: 'tax_withholding', label: 'Tax Withholding', icon: ClipboardList, description: 'Federal, state, and local tax withholding elections.' },
      { key: 'element_definition', label: 'Element Definition', icon: Briefcase, description: 'Earnings, deductions, and information element definitions.' },
      { key: 'bank_branch', label: 'Bank & Bank Branch', icon: Landmark, description: 'Bank accounts, branch codes, and routing details.' },
      { key: 'payroll_time_card', label: 'Payroll Time Card', icon: Clock4, description: 'Time card entries for payroll processing.' },
      { key: 'payroll_balances', label: 'Payroll Balances', icon: BarChart3, description: 'Year-to-date and period balance adjustments.' },
    ],
  },
  {
    key: 'recruitment',
    label: 'Recruitment',
    icon: UserSearch,
    description: 'Candidates, job requisitions, and application tracking.',
    accentColor: '#7C3AED',
    gradientFrom: '#4C1D95',
    gradientTo: '#7C3AED',
    tagColor: '#C4B5FD',
    objects: [
      { key: 'candidate', label: 'Candidate', icon: UserCheck, description: 'Candidate profiles, qualifications, and attachments.' },
      { key: 'job_requisition', label: 'Job Requisition', icon: Briefcase, description: 'Open positions, hiring managers, and approval chains.' },
      { key: 'candidate_job_application', label: 'Candidate Job Application', icon: ClipboardList, description: 'Applications, screening, and offer management.' },
    ],
  },
  {
    key: 'benefits',
    label: 'Benefits',
    icon: CreditCard,
    description: 'Benefits plans, eligibility, enrollments, and life events.',
    accentColor: '#BA7517',
    gradientFrom: '#6B3F05',
    gradientTo: '#BA7517',
    tagColor: '#FCD34D',
    objects: [],
  },
  {
    key: 'absences',
    label: 'Absences',
    icon: CalendarOff,
    description: 'Absence types, plans, accruals, and entitlement records.',
    accentColor: '#DC2626',
    gradientFrom: '#7F1D1D',
    gradientTo: '#DC2626',
    tagColor: '#FCA5A5',
    objects: [],
  },
  {
    key: 'time_labor',
    label: 'Time & Labor',
    icon: Clock4,
    description: 'Time entry rules, work schedules, and time submission records.',
    accentColor: '#0891B2',
    gradientFrom: '#164E63',
    gradientTo: '#0891B2',
    tagColor: '#67E8F9',
    objects: [],
  },
  {
    key: 'talent_management',
    label: 'Talent Management',
    icon: Award,
    description: 'Goals, performance reviews, succession plans, and talent profiles.',
    accentColor: '#DB2777',
    gradientFrom: '#831843',
    gradientTo: '#DB2777',
    tagColor: '#F9A8D4',
    objects: [],
  },
];
