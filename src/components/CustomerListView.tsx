import { Download, Search, UserPlus, Users } from 'lucide-react';
import type { CustomerSummary, LanguageCode } from '../types';
import type { TranslationDict } from '../i18n/translations';
import type { CustomerFilter } from './DashboardView';
import { CustomerCard } from './CustomerCard';

interface CustomerListViewProps {
  summaries: CustomerSummary[];
  language: LanguageCode;
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
  language,
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
        <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
          {t.navCustomers} ({summaries.length})
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportAllCsv}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13201B] hover:bg-stone-50 dark:hover:bg-emerald-950 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={onAddCustomer}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs sm:text-sm font-semibold text-white inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-900 bg-white dark:bg-[#13201B] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        />
      </div>

      <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-[#13201B] border border-transparent dark:border-emerald-950 rounded-xl overflow-x-auto">
        {filterOptions.map((opt) => {
          const active = filter === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onFilterChange(opt.key)}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-white dark:bg-emerald-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {summaries.length === 0 ? (
        <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-8 text-center">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-stone-100 dark:bg-emerald-950 text-stone-500 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">{t.noCustomersFound}</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t.noCustomersHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {summaries.map((summary) => (
            <CustomerCard
              key={summary.customer.id}
              summary={summary}
              language={language}
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
