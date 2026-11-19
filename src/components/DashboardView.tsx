import { Search, UserPlus, Users } from 'lucide-react';
import type { CustomerSummary, DashboardMetrics } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO } from '../utils/ledger';
import { CustomerCard } from './CustomerCard';

export type CustomerFilter = 'all' | 'outstanding' | 'settled' | 'overdue';

interface DashboardViewProps {
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
}

export function DashboardView({
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
}: DashboardViewProps) {
  const filterOptions: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: t.filterAll },
    { key: 'outstanding', label: t.filterOutstanding },
    { key: 'settled', label: t.filterSettled },
    { key: 'overdue', label: t.filterOverdue },
  ];

  const todayFormatted = formatIndianDate(getTodayISO());

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">{t.dashboard}</h1>
        <span className="text-xs sm:text-sm font-medium text-slate-500 font-num whitespace-nowrap">
          {t.todayLabel}: {todayFormatted}
        </span>
      </div>

      {/* 4 Summary KPI Cards: 2x2 on mobile, 4 cols on lg */}
      <section aria-label={t.dashboard} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4">
          <div className="text-xs font-medium text-slate-500">{t.totalOutstanding}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-num text-red-600 truncate">
            {formatINR(metrics.totalOutstanding)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4">
          <div className="text-xs font-medium text-slate-500">{t.totalCustomers}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-num text-slate-900">
            {metrics.totalCustomers}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4">
          <div className="text-xs font-medium text-slate-500">{t.todaysCollections}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-num text-emerald-700 truncate">
            {formatINR(metrics.todaysCollections)}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenOverdueTab}
          className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 p-3.5 sm:p-4 text-left transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">{t.overdueCustomers}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-num text-amber-700">
            {metrics.overdueCustomersCount}
          </div>
        </button>
      </section>

      {/* Search + Filters + Add Customer CTA */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <button
            type="button"
            onClick={onAddCustomer}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>

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
      </section>

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
