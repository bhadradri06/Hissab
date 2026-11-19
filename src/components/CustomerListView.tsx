import { Download, Search, UserPlus, Users } from 'lucide-react';
import type { CustomerSummary } from '../types';
import type { TranslationDict } from '../i18n/translations';
import type { CustomerFilter } from './DashboardView';
import { CustomerCard } from './CustomerCard';

interface CustomerListViewProps {
  summaries: CustomerSummary[];
  searchQuery: string;
  filter: CustomerFilter;
  t: TranslationDict;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: CustomerFilter) => void;
  onAddCustomer: () => void;
  onSelectCustomer: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
  onExportAllCsv: () => void;
}

export function CustomerListView({
  summaries,
  searchQuery,
  filter,
  t,
  onSearchChange,
  onFilterChange,
  onAddCustomer,
  onSelectCustomer,
  onSendReminder,
  onExportAllCsv,
}: CustomerListViewProps) {
  const filterOptions: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: t.filterAll },
    { key: 'outstanding', label: t.filterOutstanding },
    { key: 'settled', label: t.filterSettled },
    { key: 'overdue', label: t.filterOverdue },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">
          {t.navCustomers} ({summaries.length})
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportAllCsv}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={onAddCustomer}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-xs sm:text-sm font-semibold text-white inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        />
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

      {summaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900">{t.noCustomersFound}</h3>
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
    </div>
  );
}
