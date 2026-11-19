import {
  ArrowLeft,
  Download,
  Edit2,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react';
import type { CustomerSummary, EntryType, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, sortEntriesNewestFirst } from '../utils/ledger';

interface CustomerDetailViewProps {
  summary: CustomerSummary;
  entries: LedgerEntry[];
  t: TranslationDict;
  onBack: () => void;
  onEditCustomer: () => void;
  onDeleteCustomer: () => void;
  onAddEntry: (type: EntryType) => void;
  onEditEntry: (entry: LedgerEntry) => void;
  onDeleteEntry: (entry: LedgerEntry) => void;
  onSendReminder: () => void;
  onExportCsv: () => void;
  onPreviewImage: (dataUrl: string) => void;
}

export function CustomerDetailView({
  summary,
  entries,
  t,
  onBack,
  onEditCustomer,
  onDeleteCustomer,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onSendReminder,
  onExportCsv,
  onPreviewImage,
}: CustomerDetailViewProps) {
  const { customer, totalCredit, totalPayments, balance, status, lastPaymentDate, daysSinceLastPayment } =
    summary;
  const sortedEntries = sortEntriesNewestFirst(entries);

  const balanceTitle = balance < 0 ? t.advanceBalance : t.outstanding;
  const balanceColor =
    status === 'overdue'
      ? 'text-amber-700'
      : status === 'due'
        ? 'text-red-600'
        : 'text-emerald-700';

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200/60 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportCsv}
            className="min-h-[44px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            type="button"
            onClick={onEditCustomer}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center"
            aria-label={t.editCustomer}
            title={t.editCustomer}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDeleteCustomer}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 inline-flex items-center justify-center"
            aria-label={t.deleteCustomer}
            title={t.deleteCustomer}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Identity & Balance Summary Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {customer.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 font-num">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 {customer.phone}
              </span>
              {customer.address && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{customer.address}</span>
                </>
              )}
            </div>
            {customer.notes && (
              <p className="mt-1.5 text-xs text-slate-500">{customer.notes}</p>
            )}
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-xs font-medium text-slate-500">{balanceTitle}</div>
            <div className={`text-2xl sm:text-3xl font-bold font-num ${balanceColor}`}>
              {formatINR(Math.abs(balance))}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              {status === 'overdue' && t.statusOverdue}
              {status === 'due' && t.statusDue}
              {status === 'settled' && t.statusSettled}
              {status === 'advance' && t.statusAdvance}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">{t.totalCredit}</div>
            <div className="mt-0.5 text-base font-bold font-num text-slate-900">
              {formatINR(totalCredit)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">{t.totalPayments}</div>
            <div className="mt-0.5 text-base font-bold font-num text-emerald-700">
              {formatINR(totalPayments)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">{t.lastPaymentDate}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-slate-900">
              {lastPaymentDate ? formatIndianDate(lastPaymentDate) : t.noPaymentYet}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">{t.daysSinceLastPayment}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-slate-900">
              {daysSinceLastPayment !== null
                ? `${daysSinceLastPayment} ${daysSinceLastPayment === 1 ? t.daySingle : t.daysAgo}`
                : '—'}
            </div>
          </div>
        </div>

        {/* Prominent Ledger & WhatsApp Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onAddEntry('credit')}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addCredit.replace(/^\+\s*/, '')}</span>
          </button>

          <button
            type="button"
            onClick={() => onAddEntry('payment')}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.receivePayment.replace(/^\+\s*/, '')}</span>
          </button>

          <button
            type="button"
            onClick={onSendReminder}
            disabled={balance <= 0}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-45 disabled:cursor-not-allowed text-sm font-semibold text-emerald-800 inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.sendReminder}</span>
          </button>
        </div>
      </section>

      {/* Ledger History (Newest First) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{t.ledgerHistory}</h2>
          <span className="text-xs font-num text-slate-500">{sortedEntries.length}</span>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-7 text-center">
            <h3 className="text-sm font-semibold text-slate-900">{t.noLedgerEntries}</h3>
            <p className="mt-1 text-xs text-slate-500">{t.noLedgerEntriesHint}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {sortedEntries.map((entry) => {
              const isCredit = entry.type === 'credit';
              return (
                <div key={entry.id} className="p-3.5 sm:p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isCredit ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {isCredit ? t.credit : t.payment}
                      </span>
                      <span
                        className={`text-base font-bold font-num shrink-0 ${
                          isCredit ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {isCredit ? '+' : '-'} {formatINR(entry.amount)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-500 font-num">
                      {formatIndianDate(entry.date)}
                      {entry.note && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-sans text-slate-700">{entry.note}</span>
                        </>
                      )}
                    </div>

                    {entry.screenshotDataUrl && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => onPreviewImage(entry.screenshotDataUrl!)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 transition-colors"
                        >
                          <img
                            src={entry.screenshotDataUrl}
                            alt="Payment receipt"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="text-xs font-medium text-slate-700 inline-flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                            {t.previewScreenshot}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditEntry(entry)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label={t.edit}
                      title={t.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={t.delete}
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
