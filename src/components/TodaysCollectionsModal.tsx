import { ChevronRight, IndianRupee, Image as ImageIcon, Users, X } from 'lucide-react';
import type { Customer, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO, roundCurrency } from '../utils/ledger';

interface TodaysCollectionsModalProps {
  open: boolean;
  customers: Customer[];
  entries: LedgerEntry[];
  t: TranslationDict;
  onSelectCustomer: (customerId: string) => void;
  onViewCustomers: () => void;
  onClose: () => void;
}

export function TodaysCollectionsModal({
  open,
  customers,
  entries,
  t,
  onSelectCustomer,
  onViewCustomers,
  onClose,
}: TodaysCollectionsModalProps) {
  if (!open) return null;

  const todayISO = getTodayISO();
  const customerById = new Map(customers.map((c) => [c.id, c]));

  const todaysPayments = entries
    .filter((e) => e.type === 'payment' && e.date === todayISO)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalCollected = roundCurrency(
    todaysPayments.reduce((sum, e) => sum + e.amount, 0)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="todays-collections-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-[#13201B] rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-emerald-900/70 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-stone-300 dark:bg-emerald-800 sm:hidden" />

        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-stone-100 dark:border-emerald-950">
          <div className="min-w-0">
            <h2
              id="todays-collections-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate"
            >
              {t.todaysCollectionsTitle}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-num">
              {t.todayLabel}: {formatIndianDate(todayISO)}
              <span aria-hidden="true"> · </span>
              {todaysPayments.length}{' '}
              {todaysPayments.length === 1 ? t.paymentReceivedSingle : t.paymentsReceivedCount}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-emerald-950 hover:text-stone-800 dark:hover:text-stone-100 shrink-0"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Total Strip */}
        <div className="px-5 py-3.5 bg-emerald-50/70 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{t.todaysCollections}</span>
          <span className="text-xl font-bold font-num text-emerald-700 dark:text-emerald-400">
            {formatINR(totalCollected)}
          </span>
        </div>

        {/* Breakup List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {todaysPayments.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-11 h-11 rounded-2xl bg-stone-100 dark:bg-emerald-950 text-stone-500 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">
                {t.noCollectionsToday}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                {t.noCollectionsTodayHint}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewCustomers();
                }}
                className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white inline-flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>{t.navCustomers}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-emerald-950 border border-stone-200 dark:border-emerald-900 rounded-2xl overflow-hidden bg-white dark:bg-[#0B1411]">
              {todaysPayments.map((entry) => {
                const customer = customerById.get(entry.customerId);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectCustomer(entry.customerId);
                    }}
                    className="w-full min-h-[60px] px-3.5 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50 dark:hover:bg-emerald-950/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {customer?.name ?? 'Customer'}
                        </span>
                        {entry.screenshotDataUrl && (
                          <ImageIcon
                            className="w-3.5 h-3.5 text-stone-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 truncate">
                        <span className="font-num">
                          {customer ? `+91 ${customer.phone}` : ''}
                        </span>
                        {entry.note && (
                          <>
                            {customer && <span aria-hidden="true"> · </span>}
                            <span>{entry.note}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-base font-bold font-num text-emerald-700 dark:text-emerald-400">
                        + {formatINR(entry.amount)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
