import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react';
import type { AppSettings, Customer } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { buildReminderMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { formatINR } from '../utils/ledger';

interface WhatsAppModalProps {
  open: boolean;
  customer: Customer | null;
  outstandingBalance: number;
  settings: AppSettings;
  t: TranslationDict;
  onClose: () => void;
}

export function WhatsAppModal({
  open,
  customer,
  outstandingBalance,
  settings,
  t,
  onClose,
}: WhatsAppModalProps) {
  const [messageText, setMessageText] = useState('');
  const [hasUpiLink, setHasUpiLink] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !customer) return;
    const { message, upiLink } = buildReminderMessage(customer, outstandingBalance, settings);
    setMessageText(message);
    setHasUpiLink(Boolean(upiLink));
    setCopied(false);
  }, [open, customer, outstandingBalance, settings]);

  if (!open || !customer) return null;

  const whatsappUrl = buildWhatsAppUrl(customer.phone, messageText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#13201B] rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-emerald-900/70 shadow-xl">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-stone-300 dark:bg-emerald-800 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100 dark:border-emerald-950">
          <div className="min-w-0">
            <h2 id="wa-modal-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
              {t.whatsappPreviewTitle}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-num truncate">
              {customer.name} · +91 {customer.phone} · {formatINR(Math.max(0, outstandingBalance))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-emerald-950 hover:text-stone-800 dark:hover:text-stone-100 shrink-0"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <textarea
              rows={7}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] px-3.5 py-3 text-sm text-stone-900 dark:text-stone-100 leading-relaxed focus:bg-white dark:focus:bg-[#0B1411] focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <div
            className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
              hasUpiLink
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-stone-50 dark:bg-[#0B1411] border-stone-200 dark:border-emerald-900 text-stone-600 dark:text-stone-400'
            }`}
          >
            {hasUpiLink ? t.upiIncludedNote : t.upiNotConfiguredHint}
          </div>

          {hasUpiLink && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {t.upiVerificationWarning}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-transparent hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-medium text-stone-700 dark:text-stone-200 inline-flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copied : t.copyMessage}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.openInWhatsapp}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
