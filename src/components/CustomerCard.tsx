import { ChevronRight, MessageCircle } from 'lucide-react';
import type { CustomerSummary } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR } from '../utils/ledger';

interface CustomerCardProps {
  summary: CustomerSummary;
  t: TranslationDict;
  onSelect: (customerId: string) => void;
  onSendReminder: (summary: CustomerSummary) => void;
}

export function CustomerCard({
  summary,
  t,
  onSelect,
  onSendReminder,
}: CustomerCardProps) {
  const { customer, balance, status, lastPaymentDate, daysSinceLastPayment } = summary;

  const statusMeta = {
    overdue: {
      label:
        daysSinceLastPayment !== null
          ? `${t.statusOverdue} · ${daysSinceLastPayment}${t.daysAgo.charAt(0)}`
          : t.statusOverdue,
      amountColor: 'text-amber-700',
      labelColor: 'text-amber-700',
      avatarBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    due: {
      label: t.statusDue,
      amountColor: 'text-red-600',
      labelColor: 'text-red-600',
      avatarBg: 'bg-red-50 text-red-700 border-red-200',
    },
    settled: {
      label: t.statusSettled,
      amountColor: 'text-emerald-700',
      labelColor: 'text-emerald-700',
      avatarBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    advance: {
      label: t.statusAdvance,
      amountColor: 'text-emerald-700',
      labelColor: 'text-emerald-700',
      avatarBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden">
      <div className="flex items-center gap-3 p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() => onSelect(customer.id)}
          className="flex-1 min-w-0 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 ${statusMeta.avatarBg}`}
            aria-hidden="true"
          >
            {initials || 'C'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-semibold text-slate-900 truncate">
                {customer.name}
              </span>
              <span className={`text-base font-bold font-num shrink-0 ${statusMeta.amountColor}`}>
                {formattedBalance}
              </span>
            </div>

            <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-slate-500">
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

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
        </button>

        {balance > 0 && (
          <button
            type="button"
            onClick={() => onSendReminder(summary)}
            className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            title={t.sendReminder}
            aria-label={`${t.sendReminder} - ${customer.name}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-semibold whitespace-nowrap">
              {t.sendReminder}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
