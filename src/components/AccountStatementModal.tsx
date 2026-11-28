import { useEffect, useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import { FileText, Printer, X } from 'lucide-react';
import type { AppSettings, CustomerSummary, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import {
  computeCustomerTimeline,
  formatINR,
  formatShortMonthDate,
  getTodayISO,
} from '../utils/ledger';
import { getLocalizedCustomerName } from '../utils/transliterate';
import { buildShopUpiLink } from '../utils/whatsapp';

interface AccountStatementModalProps {
  open: boolean;
  summary: CustomerSummary | null;
  entries: LedgerEntry[];
  settings: AppSettings;
  t: TranslationDict;
  onSaveUpiId: (upiId: string) => Promise<void> | void;
  onClose: () => void;
}

export function AccountStatementModal({
  open,
  summary,
  entries,
  settings,
  t,
  onSaveUpiId,
  onClose,
}: AccountStatementModalProps) {
  const [qrSvgMarkup, setQrSvgMarkup] = useState('');
  const [inlineUpi, setInlineUpi] = useState(settings.upiId);

  useEffect(() => {
    setInlineUpi(settings.upiId);
  }, [settings.upiId]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('statement-modal-open');
    return () => {
      document.body.classList.remove('statement-modal-open');
    };
  }, [open]);

  const balance = summary?.balance ?? 0;
  const collectibleAmount = Math.max(0, balance);
  const upiQrPayload = buildShopUpiLink(
    settings.upiId,
    settings.shopName,
    collectibleAmount > 0 ? collectibleAmount : undefined
  );

  useEffect(() => {
    let active = true;
    if (!open || !upiQrPayload) {
      setQrSvgMarkup('');
      return;
    }

    QRCode.toString(upiQrPayload, {
      type: 'svg',
      width: 136,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' },
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
  }, [open, upiQrPayload]);

  if (!open || !summary) return null;

  const { customer, totalCredit, totalPayments } = summary;
  const timeline = computeCustomerTimeline(entries);
  const localizedName = getLocalizedCustomerName(customer.name, settings.language);
  const generatedDate = formatShortMonthDate(getTodayISO());

  const handleSaveInlineUpi = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = inlineUpi.trim();
    if (!cleaned || !cleaned.includes('@')) return;
    await onSaveUpiId(cleaned);
  };

  return (
    <div
      className="statement-modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-statement-modal-title"
    >
      <div className="statement-modal-card w-full sm:max-w-3xl max-h-[94vh] flex flex-col bg-white dark:bg-[#13201B] rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-emerald-900 shadow-2xl overflow-hidden">
        {/* Modal Toolbar (hidden in PDF/Print output) */}
        <div className="no-print flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-stone-200 dark:border-emerald-950 bg-stone-50/80 dark:bg-[#0D1915]">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h2
              id="account-statement-modal-title"
              className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 truncate"
            >
              {t.accountStatementSubtitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs sm:text-sm font-semibold text-white inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printSavePdfBtn}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-emerald-950 hover:text-stone-900 dark:hover:text-stone-100"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Account Statement Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/70 dark:bg-[#0B1411] print:p-0 print:bg-white">
          <article className="mx-auto max-w-2xl bg-white text-stone-900 rounded-2xl border border-stone-200/90 p-5 sm:p-8 shadow-xs print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none">
            {/* Shop Header */}
            <header className="flex items-center gap-3.5 pb-4 border-b-[2.5px] border-[#0E5C45]">
              <div
                aria-hidden="true"
                className="w-11 h-11 rounded-xl bg-[#10253B] flex items-center justify-center shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="#F5EDE0" />
                  <path d="M8.5 8.5H15.5" stroke="#C77A1C" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8.5 12H15.5" stroke="#5A6B7B" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8.5 15.5H13" stroke="#5A6B7B" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>

              <div className="min-w-0">
                <h1 className="font-brand text-xl sm:text-2xl font-bold text-[#0E5C45] leading-tight break-words">
                  {settings.shopName.trim() || t.appName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-0.5">
                  {t.accountStatementSubtitle}
                </p>
              </div>
            </header>

            {/* Customer & Generated Date */}
            <div className="mt-4">
              <div className="text-base sm:text-lg font-bold text-stone-950 break-words">
                {customer.name}
                {localizedName && (
                  <span
                    dir={settings.language === 'ur' ? 'rtl' : 'ltr'}
                    className="ml-1.5 font-semibold text-[#0E5C45]"
                  >
                    ({localizedName})
                  </span>
                )}
                <span className="font-normal text-stone-700 font-num"> · +91 {customer.phone}</span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-stone-600 font-num">
                {t.generatedOnLabel} {generatedDate}
              </p>
            </div>

            {/* Statement Ledger Table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-[1.5px] border-[#0E5C45] text-[#0E5C45]">
                    <th className="py-2 pr-3 text-left font-bold whitespace-nowrap">
                      {t.statementColDate}
                    </th>
                    <th className="py-2 px-3 text-left font-bold">
                      {t.statementColNote}
                    </th>
                    <th className="py-2 px-3 text-right font-bold whitespace-nowrap">
                      {t.statementColYouGave}
                    </th>
                    <th className="py-2 px-3 text-right font-bold whitespace-nowrap">
                      {t.statementColYouGot}
                    </th>
                    <th className="py-2 pl-3 text-right font-bold whitespace-nowrap">
                      {t.statementColBalance}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/90">
                  {timeline.chronological.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-500">
                        {t.noLedgerEntries}
                      </td>
                    </tr>
                  ) : (
                    timeline.chronological.map(({ entry, balanceAfter }) => {
                      const isCredit = entry.type === 'credit';
                      return (
                        <tr key={entry.id}>
                          <td className="py-2.5 pr-3 text-stone-800 font-num whitespace-nowrap">
                            {formatShortMonthDate(entry.date)}
                          </td>
                          <td className="py-2.5 px-3 text-stone-800 break-words">
                            {entry.note || (isCredit ? t.credit : t.payment)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-num text-stone-900 whitespace-nowrap">
                            {isCredit ? formatINR(entry.amount) : ''}
                          </td>
                          <td className="py-2.5 px-3 text-right font-num text-stone-900 whitespace-nowrap">
                            {!isCredit ? formatINR(entry.amount) : ''}
                          </td>
                          <td className="py-2.5 pl-3 text-right font-num text-stone-900 whitespace-nowrap">
                            {formatINR(balanceAfter)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#0E5C45] font-bold text-stone-950">
                    <td className="py-3 pr-3 text-left">{t.statementTotalsLabel}</td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3 text-right font-num whitespace-nowrap">
                      {formatINR(totalCredit)}
                    </td>
                    <td className="py-3 px-3 text-right font-num whitespace-nowrap">
                      {formatINR(totalPayments)}
                    </td>
                    <td className="py-3 pl-3 text-right font-num whitespace-nowrap">
                      {formatINR(balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Shop UPI QR Code Block */}
            {qrSvgMarkup ? (
              <div className="mt-6 flex items-center gap-4 pt-2">
                <div
                  className="w-[116px] h-[116px] sm:w-[132px] sm:h-[132px] shrink-0 bg-white [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
                />
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-bold text-stone-950 font-num">
                    {collectibleAmount > 0
                      ? `${t.scanToPayLabel} ${formatINR(collectibleAmount)}`
                      : t.upiQrCodeLabel}
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-num text-stone-700 break-all">
                    {settings.upiId.trim()}
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSaveInlineUpi}
                className="no-print mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3.5 flex flex-col sm:flex-row sm:items-end gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="statement-inline-upi"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    {t.configureUpiInline}
                  </label>
                  <input
                    id="statement-inline-upi"
                    type="text"
                    value={inlineUpi}
                    onChange={(e) => setInlineUpi(e.target.value)}
                    placeholder={t.upiIdPlaceholder}
                    className="w-full min-h-[40px] rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-num text-stone-900 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#0E5C45] hover:bg-emerald-800 text-xs font-semibold text-white whitespace-nowrap shrink-0"
                >
                  {t.saveUpiBtn}
                </button>
              </form>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
