import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Clock,
  Download,
  IndianRupee,
  Mic,
  Plus,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Customer, CustomerSummary, DashboardMetrics, EntryType, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO, sortEntriesNewestFirst } from '../utils/ledger';
import { parseQuickEntry } from '../utils/quickEntry';
import { CustomerCard } from './CustomerCard';

export type CustomerFilter = 'all' | 'outstanding' | 'settled' | 'overdue';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstanceLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface DashboardViewProps {
  shopName: string;
  metrics: DashboardMetrics;
  customers: Customer[];
  entries: LedgerEntry[];
  summaries: CustomerSummary[];
  searchQuery: string;
  filter: CustomerFilter;
  t: TranslationDict;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: CustomerFilter) => void;
  onAddCustomer: () => void;
  onOpenRecordEntry: (prefill?: {
    customerId?: string | null;
    type?: EntryType;
    amount?: number | null;
    note?: string;
  }) => void;
  onQuickSaveEntry: (data: {
    customerId: string;
    type: EntryType;
    amount: number;
    note: string;
  }) => Promise<void> | void;
  onSelectCustomer: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
  onOpenCustomersTab: (initialFilter?: CustomerFilter) => void;
  onOpenTodaysCollections: () => void;
  onOpenOverdueTab: () => void;
  onExportAllCsv: () => void;
}

export function DashboardView({
  shopName,
  metrics,
  customers,
  entries,
  summaries,
  searchQuery,
  filter,
  t,
  onSearchChange,
  onFilterChange,
  onAddCustomer,
  onOpenRecordEntry,
  onQuickSaveEntry,
  onSelectCustomer,
  onSendReminder,
  onOpenCustomersTab,
  onOpenTodaysCollections,
  onOpenOverdueTab,
  onExportAllCsv,
}: DashboardViewProps) {
  const [quickText, setQuickText] = useState('');
  const [quickHint, setQuickHint] = useState<string | null>(null);
  const [disambiguateCandidates, setDisambiguateCandidates] = useState<Customer[]>([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);

  const speechSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    );

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!speechSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechCtor =
      (window as unknown as Record<string, new () => SpeechRecognitionInstanceLike>)
        .SpeechRecognition ||
      (window as unknown as Record<string, new () => SpeechRecognitionInstanceLike>)
        .webkitSpeechRecognition;

    if (!SpeechCtor) return;
    const rec = new SpeechCtor();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript ?? '';
      if (spoken) {
        setQuickText(spoken);
        setQuickHint(null);
        setDisambiguateCandidates([]);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setQuickHint(null);
    setDisambiguateCandidates([]);

    const parsed = parseQuickEntry(quickText, customers);
    if (!parsed.rawText) {
      onOpenRecordEntry();
      return;
    }

    if (parsed.selectedCustomer && parsed.amount && parsed.amount > 0) {
      await onQuickSaveEntry({
        customerId: parsed.selectedCustomer.id,
        type: parsed.type,
        amount: parsed.amount,
        note: parsed.note,
      });
      setQuickText('');
      return;
    }

    if (parsed.matchedCustomers.length > 1 && parsed.amount && parsed.amount > 0) {
      setDisambiguateCandidates(parsed.matchedCustomers);
      setQuickHint(t.quickEntryPickCustomer);
      return;
    }

    if (!parsed.amount) {
      setQuickHint(t.quickEntryNeedAmount);
      return;
    }

    onOpenRecordEntry({
      customerId: parsed.matchedCustomers[0]?.id ?? null,
      type: parsed.type,
      amount: parsed.amount,
      note: parsed.note,
    });
    setQuickText('');
  };

  const handleSelectQuickCandidate = async (customer: Customer) => {
    const parsed = parseQuickEntry(quickText, customers);
    if (parsed.amount && parsed.amount > 0) {
      await onQuickSaveEntry({
        customerId: customer.id,
        type: parsed.type,
        amount: parsed.amount,
        note: parsed.note,
      });
      setQuickText('');
      setQuickHint(null);
      setDisambiguateCandidates([]);
    }
  };

  const filterOptions: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: t.filterAll },
    { key: 'outstanding', label: t.filterOutstanding },
    { key: 'settled', label: t.filterSettled },
    { key: 'overdue', label: t.filterOverdue },
  ];

  const todayISO = getTodayISO();
  const todayFormatted = formatIndianDate(todayISO);

  const customerById = new Map(customers.map((c) => [c.id, c]));
  const recentEntries = sortEntriesNewestFirst(entries).slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search Pill */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-h-[48px] rounded-2xl border border-stone-200 dark:border-emerald-900/90 bg-white dark:bg-[#13201B] pl-11 pr-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-xs focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        />
      </div>

      {/* Authoritative Forest Emerald Hero Block (inspired by hisaab-hazel.vercel.app) */}
      <section
        aria-label={t.dashboard}
        className="relative overflow-hidden rounded-3xl bg-[#0E5C45] dark:bg-[#0D3D2E] text-white p-5 sm:p-6 shadow-sm"
      >
        {/* Subtle geometric gold motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -bottom-24 w-56 h-56 rounded-full border-[28px] border-[#F2B544]/15"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-emerald-100/90">
              <span className="truncate font-semibold text-white">{shopName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-num whitespace-nowrap">
                {t.todayLabel}: {todayFormatted}
              </span>
            </div>

            <div className="mt-2.5 text-xs font-medium text-emerald-100/85">
              {t.totalOutstanding}
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl sm:text-4xl font-bold font-num tracking-tight text-white">
                {formatINR(metrics.totalOutstanding)}
              </span>
              <button
                type="button"
                onClick={() => onOpenCustomersTab('outstanding')}
                className="text-xs sm:text-sm font-medium text-[#F7C870] hover:underline whitespace-nowrap"
              >
                <span className="font-num font-bold">{metrics.customersWithBalance}</span>{' '}
                {t.customersOweLabel}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenRecordEntry()}
              className="flex-1 sm:flex-none min-h-[46px] px-4 py-2.5 rounded-xl bg-[#F2B544] hover:bg-[#e5a835] text-sm font-bold text-[#2A1A00] inline-flex items-center justify-center gap-2 shadow-xs whitespace-nowrap transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.recordEntryCta}</span>
            </button>

            <button
              type="button"
              onClick={onAddCustomer}
              className="flex-1 sm:flex-none min-h-[46px] px-4 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 border border-white/20 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addCustomer}</span>
            </button>
          </div>
        </div>

        {/* 4-Column Interactive Hero KPI Strip */}
        <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenCustomersTab('all')}
            className="rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 p-3 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-emerald-100/85">
              <span className="truncate">{t.totalCustomers}</span>
              <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold font-num text-white">
              {metrics.totalCustomers}
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenTodaysCollections}
            className="rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 p-3 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-emerald-100/85">
              <span className="truncate">{t.todaysCollections}</span>
              <IndianRupee className="w-3.5 h-3.5 shrink-0 opacity-80" />
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold font-num text-[#F7C870] truncate">
              {formatINR(metrics.todaysCollections)}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (metrics.topDebtor) {
                onSelectCustomer(metrics.topDebtor.customer.id);
              } else {
                onOpenCustomersTab('outstanding');
              }
            }}
            className="rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 p-3 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-emerald-100/85 truncate">{t.owesMost}</div>
            {metrics.topDebtor ? (
              <div className="mt-1 flex items-baseline justify-between gap-1.5 min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {metrics.topDebtor.customer.name}
                </span>
                <span className="text-sm font-bold font-num text-[#F7C870] shrink-0">
                  {formatINR(metrics.topDebtor.balance)}
                </span>
              </div>
            ) : (
              <div className="mt-1 text-lg font-bold font-num text-white">—</div>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenOverdueTab}
            className="rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 p-3 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-emerald-100/85">
              <span className="truncate">{t.overdueCustomers}</span>
              <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold font-num text-white">
              {metrics.overdueCustomersCount}
            </div>
          </button>
        </div>

        {/* Quiet 30-day Cashflow Strip */}
        <div className="relative z-10 mt-3 pt-3 border-t border-white/12 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-emerald-100/90">
          <span>
            {t.collected30d}:{' '}
            <strong className="font-num text-white">{formatINR(metrics.collectedLast30Days)}</strong>
          </span>
          <span aria-hidden="true" className="hidden sm:inline opacity-40">
            ·
          </span>
          <span>
            {t.given30d}:{' '}
            <strong className="font-num text-white">{formatINR(metrics.givenLast30Days)}</strong>
          </span>
          {metrics.oldestDue && metrics.oldestDue.daysSinceLastPayment !== null && (
            <>
              <span aria-hidden="true" className="hidden sm:inline opacity-40">
                ·
              </span>
              <button
                type="button"
                onClick={() => onSelectCustomer(metrics.oldestDue!.customer.id)}
                className="hover:underline text-left"
              >
                {t.longestUnpaid}:{' '}
                <strong className="font-semibold text-white">
                  {metrics.oldestDue.customer.name}
                </strong>{' '}
                <span className="font-num text-[#F7C870]">
                  ({metrics.oldestDue.daysSinceLastPayment}
                  {t.daysAgo.charAt(0)})
                </span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Quick Entry Natural-Language Bar */}
      <section
        aria-label={t.quickEntryTitle}
        className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950/90 p-3.5 sm:p-4"
      >
        <form onSubmit={handleQuickSubmit} className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="quick-entry-input"
              className="text-xs font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{t.quickEntryTitle}</span>
            </label>
            <button
              type="button"
              onClick={onExportAllCsv}
              className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="quick-entry-input"
              type="text"
              value={quickText}
              onChange={(e) => {
                setQuickText(e.target.value);
                setQuickHint(null);
                setDisambiguateCandidates([]);
              }}
              placeholder={t.quickEntryPlaceholder}
              className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50/70 dark:bg-[#0B1411] px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-[#0B1411] focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />

            {speechSupported && (
              <button
                type="button"
                onClick={handleToggleSpeech}
                aria-pressed={listening}
                aria-label={t.quickEntrySpeak}
                title={listening ? t.quickEntryListening : t.quickEntrySpeak}
                className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  listening
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-stone-50 dark:bg-[#0B1411] border-stone-300 dark:border-emerald-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              {t.quickEntryRecordBtn}
            </button>
          </div>

          {quickHint && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{quickHint}</p>
          )}

          {disambiguateCandidates.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-0.5">
              {disambiguateCandidates.map((cand) => (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => void handleSelectQuickCandidate(cand)}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                >
                  {cand.name} (+91 {cand.phone.slice(-4)})
                </button>
              ))}
            </div>
          )}
        </form>
      </section>

      {/* Main 12-Column Responsive Workspace: Customers Directory + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-3.5">
          {/* Filter Segmented Bar */}
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

          {/* Customer List */}
          <section aria-label={t.navCustomers}>
            {summaries.length === 0 ? (
              <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-8 text-center">
                <div className="mx-auto w-11 h-11 rounded-2xl bg-stone-100 dark:bg-emerald-950 text-stone-500 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">
                  {t.noCustomersFound}
                </h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t.noCustomersHint}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
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

        {/* Right Rail: Recent Activity Feed */}
        <aside className="lg:col-span-4 space-y-3">
          <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {t.recentActivityTitle}
              </h2>
              <button
                type="button"
                onClick={() => onOpenCustomersTab('all')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{t.viewAllCustomers}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentEntries.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500 dark:text-stone-400">
                {t.noRecentActivity}
              </p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-emerald-950">
                {recentEntries.map((entry) => {
                  const cust = customerById.get(entry.customerId);
                  const isCredit = entry.type === 'credit';
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onSelectCustomer(entry.customerId)}
                      className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50 dark:hover:bg-emerald-950/60 -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {cust?.name ?? 'Customer'}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate font-num">
                          {formatIndianDate(entry.date)}
                          {entry.note && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="font-sans">{entry.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-bold font-num ${
                            isCredit
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'} {formatINR(entry.amount)}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {isCredit ? t.credit : t.payment}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
