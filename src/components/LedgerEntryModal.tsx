import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Check, Eye, Loader2, Trash2, X } from 'lucide-react';
import type { Customer, EntryType, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { formatIndianDate, formatINR, getTodayISO, isValidISODate, roundCurrency } from '../utils/ledger';
import { processScreenshotFile } from '../utils/image';

interface LedgerEntryModalProps {
  open: boolean;
  customerName?: string;
  customers?: Customer[];
  initialCustomerId?: string | null;
  initialType: EntryType;
  initialAmount?: number | null;
  initialNote?: string;
  editingEntry: LedgerEntry | null;
  t: TranslationDict;
  onSave: (data: {
    id?: string;
    customerId?: string;
    type: EntryType;
    amount: number;
    date: string;
    note: string;
    screenshotDataUrl?: string;
  }) => Promise<void> | void;
  onClose: () => void;
  onPreviewImage: (dataUrl: string) => void;
}

interface OcrResultState {
  status: 'idle' | 'loading' | 'success' | 'unavailable';
  detectedAmount: number | null;
  detectedDate: string | null;
  message: string;
}

export function LedgerEntryModal({
  open,
  customerName,
  customers,
  initialCustomerId,
  initialType,
  initialAmount,
  initialNote,
  editingEntry,
  t,
  onSave,
  onClose,
  onPreviewImage,
}: LedgerEntryModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [entryType, setEntryType] = useState<EntryType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | undefined>(undefined);
  const [ocrState, setOcrState] = useState<OcrResultState>({
    status: 'idle',
    detectedAmount: null,
    detectedDate: null,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showCustomerSelector = Boolean(customers && customers.length > 0 && !customerName && !editingEntry);

  useEffect(() => {
    if (!open) return;
    if (editingEntry) {
      setSelectedCustomerId(editingEntry.customerId);
      setEntryType(editingEntry.type);
      setAmountStr(String(editingEntry.amount));
      setDate(editingEntry.date);
      setNote(editingEntry.note);
      setScreenshotDataUrl(editingEntry.screenshotDataUrl);
    } else {
      const fallbackCustomerId =
        initialCustomerId || (customers && customers.length > 0 ? customers[0].id : '');
      setSelectedCustomerId(fallbackCustomerId);
      setEntryType(initialType);
      setAmountStr(initialAmount && initialAmount > 0 ? String(initialAmount) : '');
      setDate(getTodayISO());
      setNote(initialNote ?? '');
      setScreenshotDataUrl(undefined);
    }
    setOcrState({ status: 'idle', detectedAmount: null, detectedDate: null, message: '' });
    setError(null);
    setSubmitting(false);
  }, [open, initialType, initialAmount, initialNote, initialCustomerId, editingEntry, customers]);

  if (!open) return null;

  const activeCustomerLabel =
    customerName ||
    customers?.find((c) => c.id === selectedCustomerId)?.name ||
    '';

  const runOcr = async (dataUrl: string) => {
    setOcrState({
      status: 'loading',
      detectedAmount: null,
      detectedDate: null,
      message: t.readingScreenshot,
    });
    try {
      const response = await fetch('/api/ocr/read-amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const payload = (await response.json()) as {
        detectedAmount?: number | null;
        detectedDate?: string | null;
        reason?: string;
        error?: string;
      };

      if (!response.ok) {
        setOcrState({
          status: 'unavailable',
          detectedAmount: null,
          detectedDate: null,
          message: payload.error || t.ocrUnavailable,
        });
        return;
      }

      if (typeof payload.detectedAmount === 'number' && payload.detectedAmount > 0) {
        setOcrState({
          status: 'success',
          detectedAmount: payload.detectedAmount,
          detectedDate: payload.detectedDate ?? null,
          message: payload.reason || '',
        });
      } else {
        setOcrState({
          status: 'unavailable',
          detectedAmount: null,
          detectedDate: null,
          message: payload.reason || t.ocrUnavailable,
        });
      }
    } catch {
      setOcrState({
        status: 'unavailable',
        detectedAmount: null,
        detectedDate: null,
        message: t.ocrUnavailable,
      });
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const compressed = await processScreenshotFile(file);
      setScreenshotDataUrl(compressed);
      await runOcr(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process screenshot.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyDetectedAmount = () => {
    if (ocrState.detectedAmount !== null) {
      setAmountStr(String(ocrState.detectedAmount));
    }
    if (ocrState.detectedDate && isValidISODate(ocrState.detectedDate)) {
      setDate(ocrState.detectedDate);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (showCustomerSelector && !selectedCustomerId) {
      setError(t.errCustomerRequired);
      return;
    }
    const parsedAmount = Number(amountStr);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t.errAmountInvalid);
      return;
    }
    if (!isValidISODate(date)) {
      setError(t.errDateRequired);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        id: editingEntry?.id,
        customerId: selectedCustomerId || undefined,
        type: entryType,
        amount: roundCurrency(parsedAmount),
        date,
        note: note.trim(),
        screenshotDataUrl: entryType === 'payment' ? screenshotDataUrl : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = editingEntry
    ? t.editEntryTitle
    : entryType === 'credit'
      ? t.addEntryTitleCredit
      : t.addEntryTitlePayment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#13201B] rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-emerald-900/70 shadow-xl">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-stone-300 dark:bg-emerald-800 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100 dark:border-emerald-950">
          <div className="min-w-0">
            <h2 id="entry-modal-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
              {modalTitle}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {activeCustomerLabel ? `${activeCustomerLabel} · ` : ''}
              {entryType === 'credit' ? t.creditDescription : t.paymentDescription}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300 font-medium"
            >
              {error}
            </div>
          )}

          {showCustomerSelector && customers && (
            <div>
              <label htmlFor="entry-customer-select" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {t.selectCustomerLabel} <span className="text-red-600">*</span>
              </label>
              <select
                id="entry-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-sm font-medium text-stone-900 dark:text-stone-100 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (+91 {c.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Segmented Type Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 dark:bg-[#0B1411] rounded-xl">
            <button
              type="button"
              onClick={() => setEntryType('credit')}
              className={`min-h-[42px] rounded-lg text-sm font-semibold transition-colors ${
                entryType === 'credit'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {t.credit}
            </button>
            <button
              type="button"
              onClick={() => setEntryType('payment')}
              className={`min-h-[42px] rounded-lg text-sm font-semibold transition-colors ${
                entryType === 'payment'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {t.payment}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="entry-amount" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {t.amount} <span className="text-red-600">*</span>
              </label>
              <input
                id="entry-amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-lg font-semibold font-num text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label htmlFor="entry-date" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {t.date} <span className="text-red-600">*</span>
              </label>
              <input
                id="entry-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-sm font-num text-stone-900 dark:text-stone-100 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-num">{formatIndianDate(date)}</p>
            </div>
          </div>

          <div>
            <label htmlFor="entry-note" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {t.note}
            </label>
            <input
              id="entry-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={entryType === 'credit' ? 'e.g. Rice 10kg, Dal 2kg' : 'e.g. Cash or GPay'}
              className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          {/* Payment Screenshot + OCR (Payment entries only) */}
          {entryType === 'payment' && (
            <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/70 bg-stone-50 dark:bg-[#0B1411] p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{t.paymentScreenshot}</span>
                {screenshotDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotDataUrl(undefined);
                      setOcrState({ status: 'idle', detectedAmount: null, detectedDate: null, message: '' });
                    }}
                    className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.removeScreenshot}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />

              {!screenshotDataUrl ? (
                <label
                  htmlFor="screenshot-upload"
                  className="flex items-center justify-center gap-2 min-h-[48px] w-full rounded-xl border border-dashed border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13201B] px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>{t.uploadScreenshot}</span>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white dark:bg-[#13201B] rounded-xl border border-stone-200 dark:border-emerald-900 p-2.5">
                    <img
                      src={screenshotDataUrl}
                      alt="Payment screenshot thumbnail"
                      className="w-16 h-16 rounded-lg object-cover border border-stone-200 dark:border-emerald-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewImage(screenshotDataUrl)}
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-stone-100 dark:bg-emerald-950 hover:bg-stone-200 dark:hover:bg-emerald-900 text-xs font-medium text-stone-800 dark:text-stone-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t.previewScreenshot}
                      </button>
                      <label
                        htmlFor="screenshot-upload"
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-stone-200 dark:border-emerald-800 hover:bg-stone-50 dark:hover:bg-emerald-950 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Change
                      </label>
                    </div>
                  </div>

                  {ocrState.status === 'loading' && (
                    <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-2.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{ocrState.message}</span>
                    </div>
                  )}

                  {ocrState.status === 'success' && ocrState.detectedAmount !== null && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                            {t.ocrDetectedAmount}
                          </div>
                          <div className="text-lg font-bold font-num text-emerald-900 dark:text-emerald-200">
                            {formatINR(ocrState.detectedAmount)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyDetectedAmount}
                          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t.useDetectedAmount}
                        </button>
                      </div>
                      <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                        {t.ocrNotice}
                      </p>
                    </div>
                  )}

                  {ocrState.status === 'unavailable' && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {ocrState.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-transparent text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-emerald-950"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`min-h-[46px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                entryType === 'credit'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
