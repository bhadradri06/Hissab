import { useEffect, useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  Edit2,
  FileText,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  Phone,
  Plus,
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
  onSaveUpiId: (upiId: string) => Promise<void> | void;
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
  onSaveUpiId,
  onExportCsv,
  onPreviewImage,
}: CustomerDetailViewProps) {
  const { customer, totalCredit, totalPayments, balance, status, lastPaymentDate, daysSinceLastPayment } =
    summary;
  const sortedEntries = sortEntriesNewestFirst(entries);

  const [showQr, setShowQr] = useState(false);
  const [showUpiPrompt, setShowUpiPrompt] = useState(false);
  const [inlineUpi, setInlineUpi] = useState(settings.upiId);
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');

  useEffect(() => {
    setInlineUpi(settings.upiId);
  }, [settings.upiId]);

  const collectibleAmount = Math.max(0, balance);
  const upiLink = buildUpiPaymentLink(settings.upiId, settings.shopName, collectibleAmount);

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

  const handleSaveInlineUpi = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = inlineUpi.trim();
    if (!cleaned || !cleaned.includes('@')) return;
    await onSaveUpiId(cleaned);
    setShowUpiPrompt(false);
    setShowQr(true);
  };

  const balanceTitle = balance < 0 ? t.advanceBalance : t.outstanding;
  const heroBalanceColor =
    status === 'overdue'
      ? 'text-[#F7C870]'
      : status === 'due'
        ? 'text-white'
        : 'text-emerald-200';

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

      {/* Customer Identity & Balance Hero Card (Matching Reference Emerald Hero + Action Strip) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0E5C45] dark:bg-[#0D3D2E] text-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Subtle geometric gold motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/4 -bottom-28 w-64 h-64 rounded-full border-[32px] border-[#F2B544]/12 no-print"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
              {customer.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-emerald-100/90">
              <span className="inline-flex items-center gap-1.5 font-num">
                <Phone className="w-3.5 h-3.5 text-emerald-200/80" />
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
              <p className="mt-1.5 text-xs text-emerald-100/75">{customer.notes}</p>
            )}
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-xs font-medium text-emerald-100/85">{balanceTitle}</div>
            <div className={`text-3xl sm:text-4xl font-bold font-num tracking-tight ${heroBalanceColor}`}>
              {formatINR(Math.abs(balance))}
            </div>
            <div className="text-xs font-semibold text-emerald-100/90 mt-0.5">
              {status === 'overdue' && t.statusOverdue}
              {status === 'due' && t.statusDue}
              {status === 'settled' && t.statusSettled}
              {status === 'advance' && t.statusAdvance}
            </div>
          </div>
        </div>

        {/* 4-Button Hero Action Bar (matching attached reference snip) */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 no-print">
          <button
            type="button"
            onClick={onSendReminder}
            disabled={balance <= 0}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F7A3F] hover:bg-[#138c49] border border-emerald-400/25 disabled:opacity-45 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{t.sendReminder}</span>
          </button>

          {upiLink && collectibleAmount > 0 ? (
            <a
              href={upiLink}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 text-xs sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              <Link2 className="w-4 h-4 shrink-0" />
              <span>{t.upiPayLinkLabel}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (collectibleAmount > 0) setShowUpiPrompt((p) => !p);
              }}
              disabled={collectibleAmount <= 0}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 disabled:opacity-45 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              <Link2 className="w-4 h-4 shrink-0" />
              <span>{t.upiPayLinkLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!upiLink && collectibleAmount > 0) {
                setShowUpiPrompt((p) => !p);
                return;
              }
              setShowQr((prev) => !prev);
              setShowUpiPrompt(false);
            }}
            disabled={collectibleAmount <= 0}
            aria-expanded={showQr}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 disabled:opacity-45 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{t.upiQrCodeLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 text-xs sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{t.printStatement}</span>
          </button>
        </div>

        {/* Ledger Stats Strip inside Hero */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5 border-t border-white/15">
          <div>
            <div className="text-xs text-emerald-100/75">{t.totalCredit}</div>
            <div className="mt-0.5 text-base font-bold font-num text-white">
              {formatINR(totalCredit)}
            </div>
          </div>

          <div>
            <div className="text-xs text-emerald-100/75">{t.totalPayments}</div>
            <div className="mt-0.5 text-base font-bold font-num text-[#F7C870]">
              {formatINR(totalPayments)}
            </div>
          </div>

          <div>
            <div className="text-xs text-emerald-100/75">{t.lastPaymentDate}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-white">
              {lastPaymentDate ? formatIndianDate(lastPaymentDate) : t.noPaymentYet}
            </div>
          </div>

          <div>
            <div className="text-xs text-emerald-100/75">{t.daysSinceLastPayment}</div>
            <div className="mt-0.5 text-sm font-semibold font-num text-white">
              {daysSinceLastPayment !== null
                ? `${daysSinceLastPayment} ${daysSinceLastPayment === 1 ? t.daySingle : t.daysAgo}`
                : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Inline UPI Configuration Prompt if UPI ID is missing */}
      {showUpiPrompt && !upiLink && collectibleAmount > 0 && (
        <form
          onSubmit={handleSaveInlineUpi}
          className="no-print bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200 dark:border-emerald-900 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <label
              htmlFor="detail-inline-upi"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {t.configureUpiInline}
            </label>
            <input
              id="detail-inline-upi"
              type="text"
              value={inlineUpi}
              onChange={(e) => setInlineUpi(e.target.value)}
              placeholder={t.upiIdPlaceholder}
              className="w-full min-h-[42px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] px-3 py-1.5 text-sm font-num text-stone-900 dark:text-stone-100 focus:border-emerald-700 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs sm:text-sm font-semibold text-white whitespace-nowrap shrink-0"
          >
            {t.saveUpiBtn}
          </button>
        </form>
      )}

      {/* Scannable Counter UPI QR Drawer */}
      {showQr && upiLink && qrSvgMarkup && (
        <div className="no-print rounded-2xl border border-stone-200 dark:border-emerald-800 bg-white dark:bg-[#13201B] p-4 flex flex-col sm:flex-row items-center gap-4">
          <div
            className="bg-white p-2.5 rounded-xl border border-stone-200 shrink-0"
            dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
          />
          <div className="text-center sm:text-left">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t.upiQrCodeLabel} ·{' '}
              <span className="font-num text-emerald-700 dark:text-emerald-400">
                {formatINR(collectibleAmount)}
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{t.scanToPayUpi}</p>
            <p className="mt-1 text-xs font-num text-stone-500">{settings.upiId}</p>
          </div>
        </div>
      )}

      {/* Primary Add Credit & Receive Payment Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        <button
          type="button"
          onClick={() => onAddEntry('credit')}
          className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCredit.replace(/^\+\s*/, '')}</span>
        </button>

        <button
          type="button"
          onClick={() => onAddEntry('payment')}
          className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.receivePayment.replace(/^\+\s*/, '')}</span>
        </button>
      </div>

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
