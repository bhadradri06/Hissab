import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Customer } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { isValidIndianPhone, normalizeIndianPhone } from '../utils/ledger';

interface CustomerModalProps {
  open: boolean;
  editingCustomer: Customer | null;
  existingCustomers: Customer[];
  t: TranslationDict;
  onSave: (data: {
    id?: string;
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) => Promise<void> | void;
  onClose: () => void;
}

export function CustomerModal({
  open,
  editingCustomer,
  existingCustomers,
  t,
  onSave,
  onClose,
}: CustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingCustomer) {
      setName(editingCustomer.name);
      setPhone(editingCustomer.phone);
      setAddress(editingCustomer.address ?? '');
      setNotes(editingCustomer.notes ?? '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
    setError(null);
    setSubmitting(false);
  }, [open, editingCustomer]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleanedPhone = normalizeIndianPhone(phone);

    if (!trimmedName) {
      setError(t.errNameRequired);
      return;
    }
    if (!isValidIndianPhone(cleanedPhone)) {
      setError(t.errPhoneInvalid);
      return;
    }

    const duplicate = existingCustomers.find(
      (c) => c.phone === cleanedPhone && c.id !== editingCustomer?.id
    );
    if (duplicate) {
      setError(`${t.errPhoneDuplicate} (${duplicate.name})`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        id: editingCustomer?.id,
        name: trimmedName,
        phone: cleanedPhone,
        address: address.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#13201B] rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-emerald-900/70 shadow-xl">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-stone-300 dark:bg-emerald-800 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100 dark:border-emerald-950">
          <h2 id="customer-modal-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {editingCustomer ? t.editCustomer : t.addCustomer}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-emerald-950 hover:text-stone-800 dark:hover:text-stone-100"
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

          <div>
            <label htmlFor="cust-name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {t.customerName} <span className="text-red-600">*</span>
            </label>
            <input
              id="cust-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              autoFocus
              className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <div>
            <label htmlFor="cust-phone" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {t.phoneNumber} <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 overflow-hidden">
              <span className="px-3 py-2.5 text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-emerald-950/70 border-r border-stone-200 dark:border-emerald-800 select-none">
                +91
              </span>
              <input
                id="cust-phone"
                type="tel"
                inputMode="numeric"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+-]/g, ''))}
                placeholder="9876543210"
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base font-num text-stone-900 dark:text-stone-100 bg-transparent placeholder:text-stone-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cust-address" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {t.addressOptional}
            </label>
            <input
              id="cust-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop / Street / Area"
              className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <div>
            <label htmlFor="cust-notes" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {t.notesOptional}
            </label>
            <textarea
              id="cust-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Monthly ration, pays on 5th..."
              className="w-full rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2.5 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

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
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
