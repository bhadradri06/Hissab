import { useState } from 'react';
import { CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import type { CustomerSummary, LanguageCode } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO } from '../utils/ledger';
import { getLocalizedCustomerName } from '../utils/transliterate';

type OverdueDaysFilter = 0 | 7 | 15 | 30 | 60;

interface OverdueViewProps {
  summaries: CustomerSummary[];
  language: LanguageCode;
  t: TranslationDict;
  onSelectCustomer: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
}

export function OverdueView({
  summaries,
  language,
  t,
  onSelectCustomer,
  onSendReminder,
}: OverdueViewProps) {
  const [minDays, setMinDays] = useState<OverdueDaysFilter>(7);

  // Strict business rule: Never classify zero or negative balances as overdue
  const dueCustomers = summaries
    .filter((s) => s.balance > 0)
    .filter((s) => {
      if (minDays === 0) return true;
      return (s.daysSinceLastPayment ?? 0) >= minDays;
    })
    .sort((a, b) => {
      const daysDiff = (b.daysSinceLastPayment ?? 0) - (a.daysSinceLastPayment ?? 0);
      if (daysDiff !== 0) return daysDiff;
      return b.balance - a.balance;
    });

  const filters: Array<{ days: OverdueDaysFilter; label: string }> = [
    { days: 0, label: t.allDue },
    { days: 7, label: t.days7Plus },
    { days: 15, label: t.days15Plus },
    { days: 30, label: t.days30Plus },
    { days: 60, label: t.days60Plus },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{t.overdueTitle}</h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">{t.overdueSubtitle}</p>
        </div>
        <span className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 font-num whitespace-nowrap">
          {t.todayLabel}: {formatIndianDate(getTodayISO())}
        </span>
      </div>

      {/* Days Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-[#13201B] border border-transparent dark:border-emerald-950 rounded-xl overflow-x-auto">
        {filters.map((f) => {
          const active = minDays === f.days;
          return (
            <button
              key={f.days}
              type="button"
              onClick={() => setMinDays(f.days)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-white dark:bg-emerald-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {dueCustomers.length === 0 ? (
        <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-8 text-center">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">{t.noOverdueTitle}</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t.noOverdueHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {dueCustomers.map((s) => {
            const days = s.daysSinceLastPayment ?? 0;
            const isSevere = days >= 30;
            return (
              <div
                key={s.customer.id}
                className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 flex flex-col justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onSelectCustomer(s.customer.id)}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {s.customer.name}
                      </span>
                      {(() => {
                        const localized = getLocalizedCustomerName(s.customer.name, language);
                        return localized ? (
                          <span
                            dir={language === 'ur' ? 'rtl' : 'ltr'}
                            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate"
                          >
                            ({localized})
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <span className="text-lg font-bold font-num text-red-600 dark:text-red-400 shrink-0">
                      {formatINR(s.balance)}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-num">+91 {s.customer.phone}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold font-num ${
                        isSevere ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {days} {days === 1 ? t.daySingle : t.daysAgo}
                    </span>
                  </div>

                  <div className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 font-num">
                    {s.lastPaymentDate
                      ? `${t.lastPaymentDate}: ${formatIndianDate(s.lastPaymentDate)}`
                      : `${t.noPaymentYet} · ${t.basedOnFirstCredit}: ${formatIndianDate(
                          s.earliestCreditDate
                        )}`}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSendReminder(s)}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.sendReminder}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
