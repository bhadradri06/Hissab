import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Check,
  Database,
  Download,
  FileSpreadsheet,
  FileUp,
  Info,
  Trash2,
} from 'lucide-react';
import type { AppSettings, Customer, CustomerSummary, LanguageCode, LedgerEntry } from '../types';
import type { TranslationDict } from '../i18n/translations';
import { exportAllCustomersCsv, exportOutstandingCustomersCsv } from '../utils/csv';
import { getTodayISO } from '../utils/ledger';
import {
  buildExportBackupJson,
  validateAndParseImportJson,
  type ImportValidationResult,
} from '../utils/importJson';

interface SettingsViewProps {
  settings: AppSettings;
  customers: Customer[];
  entries: LedgerEntry[];
  summaries: CustomerSummary[];
  t: TranslationDict;
  onSaveSettings: (next: AppSettings) => Promise<void> | void;
  onImportConfirmed: (
    result: ImportValidationResult,
    mergeDuplicates: boolean
  ) => Promise<void>;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
}

export function SettingsView({
  settings,
  customers,
  entries,
  summaries,
  t,
  onSaveSettings,
  onImportConfirmed,
  onLoadSampleData,
  onClearAllData,
}: SettingsViewProps) {
  const [shopName, setShopName] = useState(settings.shopName);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [savedNotice, setSavedNotice] = useState(false);

  const [importPreview, setImportPreview] = useState<ImportValidationResult | null>(null);
  const [mergeDuplicates, setMergeDuplicates] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShopName(settings.shopName);
    setUpiId(settings.upiId);
  }, [settings]);

  const handleLanguageSelect = async (lang: LanguageCode) => {
    await onSaveSettings({ ...settings, language: lang });
  };

  const handleShopSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      ...settings,
      shopName: shopName.trim() || 'My Kirana Store',
      upiId: upiId.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDownloadJsonBackup = () => {
    const json = buildExportBackupJson(customers, entries, settings.shopName);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaab-backup-${getTodayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportSuccessMsg(null);
    try {
      const text = await file.text();
      const parsed = validateAndParseImportJson(text, customers);
      setImportPreview(parsed);
      setMergeDuplicates(false);
    } catch {
      setImportPreview({
        valid: false,
        customers: [],
        totalValidEntries: 0,
        duplicateCount: 0,
        errors: ['Unable to read selected file.'],
        warnings: [],
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || !importPreview.valid) return;
    await onImportConfirmed(importPreview, mergeDuplicates);
    setImportPreview(null);
    setImportSuccessMsg(t.importSuccess);
  };

  const handleLoadAttachedSample = async () => {
    setImportSuccessMsg(null);
    try {
      const res = await fetch('/assets/aistudio/sample-data_633eb33f.json');
      if (!res.ok) throw new Error('Failed to fetch sample file');
      const text = await res.text();
      const parsed = validateAndParseImportJson(text, customers);
      setImportPreview(parsed);
      setMergeDuplicates(false);
    } catch {
      setImportPreview({
        valid: false,
        customers: [],
        totalValidEntries: 0,
        duplicateCount: 0,
        errors: ['Unable to load attached sample JSON file.'],
        warnings: [],
      });
    }
  };

  const languages: Array<{ code: LanguageCode; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{t.settingsTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Language Switcher */}
        <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">{t.languageLabel}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {languages.map((lang) => {
              const active = settings.language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`min-h-[46px] px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'bg-white dark:bg-[#0B1411] border-stone-300 dark:border-emerald-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-emerald-950'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Shop & UPI Settings */}
        <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">{t.shopDetailsTitle}</h2>
          <form onSubmit={handleShopSubmit} className="space-y-3">
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t.shopNameLabel}
              </label>
              <input
                id="shop-name"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label htmlFor="shop-upi" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t.upiIdLabel}
              </label>
              <input
                id="shop-upi"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder={t.upiIdPlaceholder}
                className="w-full min-h-[44px] rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] px-3.5 py-2 text-sm font-num text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {t.upiVerificationWarning}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white transition-colors"
              >
                {t.saveSettings}
              </button>
              {savedNotice && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                  {t.settingsSaved}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Export CSV & Backup */}
        <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">{t.exportSectionTitle}</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => exportAllCustomersCsv(summaries, entries)}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-medium text-stone-800 dark:text-stone-200 inline-flex items-center justify-start gap-2.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{t.exportAllCsv}</span>
            </button>

            <button
              type="button"
              onClick={() => exportOutstandingCustomersCsv(summaries)}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-medium text-stone-800 dark:text-stone-200 inline-flex items-center justify-start gap-2.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{t.exportOutstandingCsv}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJsonBackup}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-medium text-stone-800 dark:text-stone-200 inline-flex items-center justify-start gap-2.5"
            >
              <Download className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>{t.exportBackupJson}</span>
            </button>
          </div>
        </section>

        {/* JSON Import */}
        <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">{t.importSectionTitle}</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelected}
            id="json-import-input"
            className="hidden"
          />

          <div className="flex flex-wrap gap-2.5">
            <label
              htmlFor="json-import-input"
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-emerald-700 hover:bg-stone-800 dark:hover:bg-emerald-800 text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileUp className="w-4 h-4" />
              <span>{t.importJsonButton}</span>
            </label>

            <button
              type="button"
              onClick={handleLoadAttachedSample}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-sm font-semibold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-2 transition-colors"
            >
              <FileUp className="w-4 h-4" />
              <span>{t.importAttachedSample}</span>
            </button>

            <a
              href="/sample-hisaab-import.json"
              download="sample-hisaab-import.json"
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-medium text-stone-700 dark:text-stone-200 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadSampleJson}</span>
            </a>
          </div>

          {importSuccessMsg && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {importSuccessMsg}
            </div>
          )}

          {importPreview && (
            <div className="rounded-2xl border border-stone-200 dark:border-emerald-800 bg-stone-50 dark:bg-[#0B1411] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{t.importPreviewTitle}</h3>
                <button
                  type="button"
                  onClick={() => setImportPreview(null)}
                  className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  {t.cancel}
                </button>
              </div>

              {importPreview.errors.length > 0 && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-3 space-y-1">
                  {importPreview.errors.slice(0, 6).map((err, i) => (
                    <p key={i} className="text-xs text-red-700 dark:text-red-300">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

              {importPreview.warnings.length > 0 && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-3 space-y-1">
                  {importPreview.warnings.slice(0, 4).map((w, i) => (
                    <p key={i} className="text-xs text-amber-800 dark:text-amber-300">
                      • {w}
                    </p>
                  ))}
                </div>
              )}

              {importPreview.customers.length > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center bg-white dark:bg-[#13201B] rounded-xl border border-stone-200 dark:border-emerald-900 p-2.5">
                  <div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{t.importCustomersFound}</div>
                    <div className="text-base font-bold font-num text-stone-900 dark:text-stone-100">
                      {importPreview.customers.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{t.importEntriesFound}</div>
                    <div className="text-base font-bold font-num text-stone-900 dark:text-stone-100">
                      {importPreview.totalValidEntries}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{t.importDuplicatesFound}</div>
                    <div className="text-base font-bold font-num text-amber-700 dark:text-amber-400">
                      {importPreview.duplicateCount}
                    </div>
                  </div>
                </div>
              )}

              {importPreview.valid && importPreview.duplicateCount > 0 && (
                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dup-mode"
                      checked={!mergeDuplicates}
                      onChange={() => setMergeDuplicates(false)}
                      className="mt-0.5"
                    />
                    <span>{t.importModeSkip}</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dup-mode"
                      checked={mergeDuplicates}
                      onChange={() => setMergeDuplicates(true)}
                      className="mt-0.5"
                    />
                    <span>{t.importModeMerge}</span>
                  </label>
                </div>
              )}

              {importPreview.valid && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white"
                >
                  {t.confirmImport}
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Local Storage Limitation Notice + Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-amber-200 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/35 p-4 sm:p-5 flex gap-3">
          <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-200">{t.localStorageNoticeTitle}</h2>
            <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-300/90">
              {t.localStorageNoticeBody}
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-[#13201B] rounded-2xl border border-stone-200/90 dark:border-emerald-950 p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            {t.dataManagementTitle}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200"
            >
              {t.loadSampleData}
            </button>
            <button
              type="button"
              onClick={onClearAllData}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300 inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.clearAllData}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
