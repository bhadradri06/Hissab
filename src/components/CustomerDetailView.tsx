import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Plus,
  Printer,
  QrCode,
  Trash2,
} from 'lucide-react';
import type { AppSettings, CustomerSummary, EntryType, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO, sortEntriesNewestFirst } from '../utils/ledger';
import { buildUpiPaymentLink } from '../utils/whatsapp';

interface CustomerDetailViewProps {
  summary: CustomerSummary;
  entries: LedgerEntry[];
  settings: AppSettings;
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
  settings,
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

  const [showQr, setShowQr] = useState(false);
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');

  const upiLink = buildUpiPaymentLink(settings.upiId, settings.shopName, Math.max(0, balance));

  useEffect(() => {
    let active = true;
    if (!showQr || !upiLink) {
      setQrSvgMarkup('');
      return;
    }
    QRCode.toString(upiLink, {
      type: 'svg',
      width: 176,
      margin: 1,
      color: { dark: '#0B1411', light: '#FFFFFF' },
    })
      .then((svg) => {
        if (active) setQrSvgMarkup(svg);
      })
      .catch(() => {
        if (active) setQrSvgMarkup('');
      });

    return () => {
      active = false;
    };
  }, [showQr, upiLink]);

  const balanceTitle = balance < 0 ? t.advanceBalance : t.outstanding;
  const balanceColor =
    status === 'overdue'
      ? 'text-amber-700 dark:text-amber-400'
      : status === 'due'
        ? 'text-red-600 dark:text-red-400'
        : 'text-emerald-700 dark:text-emerald-400';

  return (
    <div className="space-y-5">
      {/* Print-Only Statement Header */}
      <div className="print-only border-b border-slate-300 pb-4 mb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{settings.shopName}</h1>
            <p className="text-sm text-slate-600">{t.statementHeading}</p>
          </div>
          <div className="text-right text-xs font-num text-slate-600">
            <div>{t.todayLabel}: {formatIndianDate(getTodayISO())}</div>
          </div>
        </div>
      </div>

      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-emerald-950 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] px-3 rounded-xl border border-stone-200 dark:border-emerald-900 bg-white dark:bg-[#13201B] hover:bg-stone-50 dark:hover:bg-emerald-950 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t.printStatement}</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="min-h-[44px] px-3 rounded-xl border border-stone-200 dark:border-emerald-900 bg-white dark:bg-[#13201B] hover:bg-stone-50 dark:hover:bg-emerald-950 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            type="button"
            onClick={onEditCustomer}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-stone-200 dark:border-emerald-900 bg-white dark:bg-[#13201B] hover:bg-stone-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-200 inline-flex items-center justify-center"
            aria-label={t.editCustomer}
            title={t.editCustomer}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDeleteCustomer}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#13201B] hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 inline-flex items-center justify-center"
            aria-label={t.deleteCustomer}
            title={t.deleteCustomer}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Identity & Balance Summary Card */}
      <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950/90 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 break-words">
              {customer.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1 font-num">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
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
              <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">{customer.notes}</p>
            )}
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">{balanceTitle}</div>
            <div className={`text-2xl sm:text-3xl font-bold font-num ${balanceColor}`}>
              {formatINR(Math.abs(balance))}
            </div>
            <div className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
              {status === 'overdue' && t.statusOverdue}
              {status === 'due' && t.statusDue}
              {status === 'settled' && t.statusSettled}
              {status === 'advance' && t.statusAdvance}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100 dark:border-emerald-950">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t.totalCredit}</div>
            <div className="mt-0.5 text-base font-bold font-num text-stone-900 dark:text-stone-100">
              {formatINR(totalCredit)}
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t.totalPayments}</div>
            <div className="mt-0.5 text-base font-bold font-num text-emerald-700 dark:text-emerald-400">
              {formatINR(totalPayments)}
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t.lastPaymentDate}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-stone-900 dark:text-stone-100">
              {lastPaymentDate ? formatIndianDate(lastPaymentDate) : t.noPaymentYet}
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t.daysSinceLastPayment}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-stone-900 dark:text-stone-100">
              {daysSinceLastPayment !== null
                ? `${daysSinceLastPayment} ${daysSinceLastPayment === 1 ? t.daySingle : t.daysAgo}`
                : '—'}
            </div>
          </div>
        </div>

        {/* Prominent Ledger, WhatsApp & UPI Payment Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 no-print">
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
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 disabled:opacity-45 disabled:cursor-not-allowed text-sm font-semibold text-emerald-800 dark:text-emerald-200 inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.sendReminder}</span>
          </button>
        </div>

        {/* Direct UPI Pay Link + Scannable Counter QR */}
        {upiLink && balance > 0 && (
          <div className="pt-2 border-t border-stone-100 dark:border-emerald-950 flex flex-wrap items-center gap-2.5 no-print">
            <a
              href={upiLink}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] hover:bg-stone-100 dark:hover:bg-emerald-950 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 inline-flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.upiPayLinkLabel}</span>
            </a>

            <button
              type="button"
              onClick={() => setShowQr((prev) => !prev)}
              aria-expanded={showQr}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] hover:bg-stone-100 dark:hover:bg-emerald-950 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 inline-flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.upiQrCodeLabel}</span>
            </button>
          </div>
        )}

        {showQr && upiLink && qrSvgMarkup && (
          <div className="rounded-2xl border border-stone-200 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] p-4 flex flex-col sm:flex-row items-center gap-4 no-print">
            <div
              className="bg-white p-2.5 rounded-xl border border-stone-200 shrink-0"
              // QR SVG generated directly via qrcode library from safe upi:// URL
              dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
            />
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {t.upiQrCodeLabel} · <span className="font-num text-emerald-700 dark:text-emerald-400">{formatINR(balance)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{t.scanToPayUpi}</p>
              <p className="mt-1 text-xs font-num text-stone-500 dark:text-stone-500">{settings.upiId}</p>
            </div>
          </div>
        )}
      </section>

      {/* Ledger History (Newest First) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">{t.ledgerHistory}</h2>
          <span className="text-xs font-num text-stone-500 dark:text-stone-400">{sortedEntries.length}</span>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-7 text-center">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{t.noLedgerEntries}</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{t.noLedgerEntriesHint}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 divide-y divide-stone-100 dark:divide-emerald-950 overflow-hidden">
            {sortedEntries.map((entry) => {
              const isCredit = entry.type === 'credit';
              return (
                <div key={entry.id} className="p-3.5 sm:p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isCredit ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {isCredit ? t.credit : t.payment}
                      </span>
                      <span
                        className={`text-base font-bold font-num shrink-0 ${
                          isCredit ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'} {formatINR(entry.amount)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-num">
                      {formatIndianDate(entry.date)}
                      {entry.note && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-sans text-stone-700 dark:text-stone-300">{entry.note}</span>
                        </>
                      )}
                    </div>

                    {entry.screenshotDataUrl && (
                      <div className="mt-2.5 no-print">
                        <button
                          type="button"
                          onClick={() => onPreviewImage(entry.screenshotDataUrl!)}
                          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] hover:bg-stone-100 dark:hover:bg-emerald-950 p-1.5 pr-3 transition-colors"
                        >
                          <img
                            src={entry.screenshotDataUrl}
                            alt="Payment receipt"
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-emerald-800"
                          />
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300 inline-flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                            {t.previewScreenshot}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 no-print">
                    <button
                      type="button"
                      onClick={() => onEditEntry(entry)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-emerald-950 hover:text-stone-900 dark:hover:text-stone-100"
                      aria-label={t.edit}
                      title={t.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400"
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
