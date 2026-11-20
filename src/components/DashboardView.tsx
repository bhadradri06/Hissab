import {
  Clock,
  Download,
  IndianRupee,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import type { CustomerSummary, DashboardMetrics } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO } from '../utils/ledger';
import { CustomerCard } from './CustomerCard';

export type CustomerFilter = 'all' | 'outstanding' | 'settled' | 'overdue';

interface DashboardViewProps {
  shopName: string;
  metrics: DashboardMetrics;
  summaries: CustomerSummary[];
  searchQuery: string;
  filter: CustomerFilter;
  t: TranslationDict;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: CustomerFilter) => void;
  onAddCustomer: () => void;
  onSelectCustomer: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
  onOpenOverdueTab: () => void;
  onExportAllCsv: () => void;
}

export function DashboardView({
  shopName,
  metrics,
  summaries,
  searchQuery,
  filter,
  t,
  onSearchChange,
  onFilterChange,
  onAddCustomer,
  onSelectCustomer,
  onSendReminder,
  onOpenOverdueTab,
  onExportAllCsv,
}: DashboardViewProps) {
  const filterOptions: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: t.filterAll },
    { key: 'outstanding', label: t.filterOutstanding },
    { key: 'settled', label: t.filterSettled },
    { key: 'overdue', label: t.filterOverdue },
  ];

  const todayFormatted = formatIndianDate(getTodayISO());

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Pill Search Input (adapted from reference header search bar) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-h-[48px] rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        />
      </div>

      {/* Warm Spotlight Hero Banner (adapted from reference spotlight banner) */}
      <section
        aria-label={t.dashboard}
        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#FBF7F2] via-white to-[#ECF7F1] p-4 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-slate-500">
              <span className="truncate">{shopName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-num whitespace-nowrap">
                {t.todayLabel}: {todayFormatted}
              </span>
            </div>

            <div className="mt-2 text-xs font-semibold text-slate-600">{t.totalOutstanding}</div>
            <div className="mt-0.5 text-3xl sm:text-4xl font-bold font-num text-red-600 tracking-tight">
              {formatINR(metrics.totalOutstanding)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onAddCustomer}
              className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 shadow-xs whitespace-nowrap transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addCustomer}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3-Column KPI Strip (Customers, Today's Collections, Overdue) */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3" aria-label="Summary metrics">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-bold font-num text-slate-900">
            {metrics.totalCustomers}
          </div>
          <div className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">
            {t.totalCustomers}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-bold font-num text-emerald-700 truncate">
            {formatINR(metrics.todaysCollections)}
          </div>
          <div className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">
            {t.todaysCollections}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenOverdueTab}
          className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 p-3 sm:p-4 text-center sm:text-left transition-colors"
        >
          <div className="mx-auto sm:mx-0 w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-bold font-num text-amber-700">
            {metrics.overdueCustomersCount}
          </div>
          <div className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">
            {t.overdueCustomers}
          </div>
        </button>
      </section>

      {/* 3-Column Quick Action Tiles (adapted from reference 3-column grid) */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3" aria-label="Quick actions">
        <button
          type="button"
          onClick={onAddCustomer}
          className="min-h-[68px] rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
        >
          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
            {t.addCustomer}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenOverdueTab}
          className="min-h-[68px] rounded-2xl bg-white border border-slate-200 hover:border-amber-300 p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
            {t.navOverdue}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportAllCsv}
          className="min-h-[68px] rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
        >
          <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
            {t.exportCsv}
          </span>
        </button>
      </section>

      {/* Filter Segmented Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
        {filterOptions.map((opt) => {
          const active = filter === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onFilterChange(opt.key)}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Customer List */}
      <section aria-label={t.navCustomers}>
        {summaries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="mx-auto w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">
              {t.noCustomersFound}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.noCustomersHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {summaries.map((summary) => (
              <CustomerCard
                key={summary.customer.id}
                summary={summary}
                t={t}
                onSelect={onSelectCustomer}
                onSendReminder={onSendReminder}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
