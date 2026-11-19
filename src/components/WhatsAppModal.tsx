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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="min-w-0">
            <h2 id="wa-modal-title" className="text-lg font-semibold text-slate-900 truncate">
              {t.whatsappPreviewTitle}
            </h2>
            <p className="text-xs text-slate-500 font-num truncate">
              {customer.name} · +91 {customer.phone} · {formatINR(Math.max(0, outstandingBalance))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 shrink-0"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 leading-relaxed focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div
            className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
              hasUpiLink
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {hasUpiLink ? t.upiIncludedNote : t.upiNotConfiguredHint}
          </div>

          {hasUpiLink && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 leading-relaxed">
              {t.upiVerificationWarning}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 inline-flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
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
