import { X } from 'lucide-react';

interface ScreenshotModalProps {
  imageUrl: string | null;
  closeLabel: string;
  onClose: () => void;
}

export function ScreenshotModal({ imageUrl, closeLabel, onClose }: ScreenshotModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white dark:bg-[#13201B] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-emerald-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 dark:border-emerald-950">
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Payment Receipt</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950"
            aria-label={closeLabel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-slate-950 flex items-center justify-center max-h-[78vh] overflow-auto p-2">
          <img
            src={imageUrl}
            alt="Payment screenshot preview"
            className="max-w-full max-h-[72vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
