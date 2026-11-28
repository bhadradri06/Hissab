import { ChevronRight, MessageCircle } from 'lucide-react';
import type { CustomerSummary, LanguageCode } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR } from '../utils/ledger';
import { getLocalizedCustomerName } from '../utils/transliterate';

interface CustomerCardProps {
  summary: CustomerSummary;
  language: LanguageCode;
  t: TranslationDict;
  onSelect: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
}

export function CustomerCard({
  summary,
  language,
  t,
  onSelect,
  onSendReminder,
}: CustomerCardProps) {
  const { customer, balance, status, lastPaymentDate, daysSinceLastPayment } = summary;
  const localizedName = getLocalizedCustomerName(customer.name, language);

  const statusMeta = {
    overdue: {
      label:
        daysSinceLastPayment !== null
          ? `${t.statusOverdue} · ${daysSinceLastPayment}${t.daysAgo.charAt(0)}`
          : t.statusOverdue,
      amountColor: 'text-amber-700 dark:text-amber-400',
      labelColor: 'text-amber-700 dark:text-amber-400',
      avatarBg:
        'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
    },
    due: {
      label: t.statusDue,
      amountColor: 'text-red-600 dark:text-red-400',
      labelColor: 'text-red-600 dark:text-red-400',
      avatarBg:
        'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/70',
    },
    settled: {
      label: t.statusSettled,
      amountColor: 'text-emerald-700 dark:text-emerald-400',
      labelColor: 'text-emerald-700 dark:text-emerald-400',
      avatarBg:
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
    },
    advance: {
      label: t.statusAdvance,
      amountColor: 'text-emerald-700 dark:text-emerald-400',
      labelColor: 'text-emerald-700 dark:text-emerald-400',
      avatarBg:
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
    },
  }[status];

  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const formattedBalance =
    balance < 0 ? formatINR(Math.abs(balance)) : formatINR(balance);

  return (
    <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950/90 hover:border-stone-300 dark:hover:border-emerald-800 transition-colors overflow-hidden">
      <div className="flex items-center gap-3 p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() => onSelect(customer.id)}
          className="flex-1 min-w-0 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-xl"
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 ${statusMeta.avatarBg}`}
            aria-hidden="true"
          >
            {initials || 'C'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {customer.name}
                </span>
                {localizedName && (
                  <span
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate"
                  >
                    ({localizedName})
                  </span>
                )}
              </div>
              <span className={`text-base font-bold font-num shrink-0 ${statusMeta.amountColor}`}>
                {formattedBalance}
              </span>
            </div>

            <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="truncate font-num">
                {customer.phone}
                <span aria-hidden="true"> · </span>
                {lastPaymentDate
                  ? `${t.lastPaymentDate}: ${formatIndianDate(lastPaymentDate)}`
                  : t.noPaymentYet}
              </span>
              <span className={`font-semibold shrink-0 whitespace-nowrap ${statusMeta.labelColor}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 hidden sm:block" />
        </button>

        {balance > 0 && (
          <button
            type="button"
            onClick={() => onSendReminder(summary)}
            className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            title={t.sendReminder}
            aria-label={`${t.sendReminder} - ${customer.name}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-semibold whitespace-nowrap">
              {t.sendReminder}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
