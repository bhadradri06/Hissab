import { useEffect, useMemo, useState } from 'react';
import { Clock, Home, Plus, Settings, Users } from 'lucide-react';
import type {
  ActiveTab,
  AppSettings,
  Customer,
  CustomerSummary,
  EntryType,
  LanguageCode,
  LedgerEntry,
} from './types';
import { createSampleDataset, DEFAULT_SETTINGS, storageService } from './db/storage';
import { TRANSLATIONS } from './i18n/translations';
import {
  computeAllSummaries,
  computeDashboardMetrics,
  sortEntriesNewestFirst,
} from './utils/ledger';
import { exportAllCustomersCsv, exportCustomerLedgerCsv } from './utils/csv';
import type { ImportValidationResult } from './utils/importJson';
import { DashboardView, type CustomerFilter } from './components/DashboardView';
import { CustomerListView } from './components/CustomerListView';
import { CustomerDetailView } from './components/CustomerDetailView';
import { OverdueView } from './components/OverdueView';
import { SettingsView } from './components/SettingsView';
import { CustomerModal } from './components/CustomerModal';
import { LedgerEntryModal } from './components/LedgerEntryModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ScreenshotModal } from './components/ScreenshotModal';

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('all');

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [entryModalState, setEntryModalState] = useState<{
    open: boolean;
    type: EntryType;
    editingEntry: LedgerEntry | null;
  }>({ open: false, type: 'credit', editingEntry: null });

  const [whatsappTarget, setWhatsappTarget] = useState<{
    customer: Customer;
    balance: number;
  } | null>(null);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    body: string;
    destructive: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: '',
    body: '',
    destructive: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    let mounted = true;
    storageService
      .loadState()
      .then((loaded) => {
        if (!mounted) return;
        setCustomers(loaded.customers);
        setEntries(loaded.entries);
        setSettings(loaded.settings);
        setStorageWarning(loaded.storageWarning);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setStorageWarning('Storage error occurred. Data may not persist.');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const t = TRANSLATIONS[settings.language];

  const allSummaries = useMemo(
    () => computeAllSummaries(customers, entries, settings.overdueThresholdDays),
    [customers, entries, settings.overdueThresholdDays]
  );

  const dashboardMetrics = useMemo(
    () => computeDashboardMetrics(allSummaries, entries),
    [allSummaries, entries]
  );

  const filteredSummaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...allSummaries].sort((a, b) => {
      // Highest positive balance first, then alphabetical
      if (b.balance !== a.balance) return b.balance - a.balance;
      return a.customer.name.localeCompare(b.customer.name);
    });

    return sorted.filter((s) => {
      if (q) {
        const nameMatch = s.customer.name.toLowerCase().includes(q);
        const phoneMatch = s.customer.phone.includes(q.replace(/\D/g, '') || q);
        if (!nameMatch && !phoneMatch) return false;
      }
      if (customerFilter === 'outstanding') return s.balance > 0;
      if (customerFilter === 'settled') return s.balance <= 0;
      if (customerFilter === 'overdue') return s.status === 'overdue';
      return true;
    });
  }, [allSummaries, searchQuery, customerFilter]);

  const selectedSummary = useMemo(
    () => allSummaries.find((s) => s.customer.id === selectedCustomerId) ?? null,
    [allSummaries, selectedCustomerId]
  );

  const selectedCustomerEntries = useMemo(() => {
    if (!selectedCustomerId) return [];
    return sortEntriesNewestFirst(
      entries.filter((e) => e.customerId === selectedCustomerId)
    );
  }, [entries, selectedCustomerId]);

  const handleSaveSettings = async (next: AppSettings) => {
    setSettings(next);
    try {
      await storageService.saveSettings(next);
    } catch {
      setStorageWarning('Could not save settings to browser storage.');
    }
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    void handleSaveSettings({ ...settings, language: lang });
  };

  const handleSaveCustomer = async (data: {
    id?: string;
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) => {
    const now = new Date().toISOString();
    let nextCustomers: Customer[];
    let targetCustomer: Customer;

    if (data.id) {
      const existing = customers.find((c) => c.id === data.id);
      if (!existing) return;
      targetCustomer = {
        ...existing,
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        updatedAt: now,
      };
      nextCustomers = customers.map((c) => (c.id === data.id ? targetCustomer : c));
    } else {
      targetCustomer = {
        id: makeId('cust'),
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      };
      nextCustomers = [targetCustomer, ...customers];
    }

    await storageService.saveCustomer(targetCustomer, nextCustomers, entries);
    setCustomers(nextCustomers);
    if (!data.id) {
      setSelectedCustomerId(targetCustomer.id);
    }
  };

  const handleRequestDeleteCustomer = (customer: Customer) => {
    setConfirmState({
      open: true,
      title: t.confirmDeleteCustomerTitle,
      body: `${customer.name} (+91 ${customer.phone}) — ${t.confirmDeleteCustomerBody}`,
      destructive: true,
      onConfirm: async () => {
        const entryIdsToDelete = entries
          .filter((e) => e.customerId === customer.id)
          .map((e) => e.id);
        const remainingCustomers = customers.filter((c) => c.id !== customer.id);
        const remainingEntries = entries.filter((e) => e.customerId !== customer.id);

        await storageService.deleteCustomerAndEntries(
          customer.id,
          entryIdsToDelete,
          remainingCustomers,
          remainingEntries
        );
        setCustomers(remainingCustomers);
        setEntries(remainingEntries);
        setSelectedCustomerId(null);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleSaveEntry = async (data: {
    id?: string;
    type: EntryType;
    amount: number;
    date: string;
    note: string;
    screenshotDataUrl?: string;
  }) => {
    if (!selectedCustomerId) return;
    const now = new Date().toISOString();
    let targetEntry: LedgerEntry;
    let nextEntries: LedgerEntry[];

    if (data.id) {
      const existing = entries.find((e) => e.id === data.id);
      if (!existing) return;
      targetEntry = {
        ...existing,
        type: data.type,
        amount: data.amount,
        date: data.date,
        note: data.note,
        screenshotDataUrl: data.type === 'payment' ? data.screenshotDataUrl : undefined,
        updatedAt: now,
      };
      nextEntries = entries.map((e) => (e.id === data.id ? targetEntry : e));
    } else {
      targetEntry = {
        id: makeId('ent'),
        customerId: selectedCustomerId,
        type: data.type,
        amount: data.amount,
        date: data.date,
        note: data.note,
        screenshotDataUrl: data.type === 'payment' ? data.screenshotDataUrl : undefined,
        createdAt: now,
        updatedAt: now,
      };
      nextEntries = [targetEntry, ...entries];
    }

    await storageService.saveEntry(targetEntry, customers, nextEntries);
    setEntries(nextEntries);
  };

  const handleRequestDeleteEntry = (entry: LedgerEntry) => {
    setConfirmState({
      open: true,
      title: t.confirmDeleteEntryTitle,
      body: t.confirmDeleteEntryBody,
      destructive: true,
      onConfirm: async () => {
        const remainingEntries = entries.filter((e) => e.id !== entry.id);
        await storageService.deleteEntry(entry.id, customers, remainingEntries);
        setEntries(remainingEntries);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleImportConfirmed = async (
    result: ImportValidationResult,
    mergeDuplicates: boolean
  ) => {
    const now = new Date().toISOString();
    const nextCustomers = [...customers];
    const nextEntries = [...entries];

    for (const impCust of result.customers) {
      let targetCustomerId: string;

      if (impCust.isDuplicateInApp && impCust.existingCustomerId) {
        if (!mergeDuplicates) {
          continue; // Safely skip duplicate without overwriting existing data
        }
        targetCustomerId = impCust.existingCustomerId;
      } else {
        targetCustomerId = makeId('cust');
        nextCustomers.push({
          id: targetCustomerId,
          name: impCust.name,
          phone: impCust.phone,
          address: impCust.address,
          notes: impCust.notes,
          createdAt: now,
          updatedAt: now,
        });
      }

      for (const impEntry of impCust.entries) {
        // Avoid exact duplicate entry on merge
        const alreadyExists =
          impCust.isDuplicateInApp &&
          nextEntries.some(
            (e) =>
              e.customerId === targetCustomerId &&
              e.type === impEntry.type &&
              e.amount === impEntry.amount &&
              e.date === impEntry.date &&
              e.note === impEntry.note
          );
        if (alreadyExists) continue;

        nextEntries.push({
          id: makeId('ent'),
          customerId: targetCustomerId,
          type: impEntry.type,
          amount: impEntry.amount,
          date: impEntry.date,
          note: impEntry.note,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await storageService.replaceAllData(nextCustomers, nextEntries);
    setCustomers(nextCustomers);
    setEntries(nextEntries);
  };

  const handleLoadSampleData = async () => {
    const sample = createSampleDataset();
    // Merge sample records safely without overwriting user's added customers
    const existingPhones = new Set(customers.map((c) => c.phone));
    const addedCustomers = sample.customers.filter((c) => !existingPhones.has(c.phone));
    const addedIds = new Set(addedCustomers.map((c) => c.id));
    const addedEntries = sample.entries.filter((e) => addedIds.has(e.customerId));

    const nextCustomers = [...customers, ...addedCustomers];
    const nextEntries = [...entries, ...addedEntries];
    await storageService.replaceAllData(nextCustomers, nextEntries);
    setCustomers(nextCustomers);
    setEntries(nextEntries);
  };

  const handleRequestClearAll = () => {
    setConfirmState({
      open: true,
      title: t.confirmClearAllTitle,
      body: t.confirmClearAllBody,
      destructive: true,
      onConfirm: async () => {
        await storageService.replaceAllData([], []);
        setCustomers([]);
        setEntries([]);
        setSelectedCustomerId(null);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const navigateTab = (tab: ActiveTab) => {
    setSelectedCustomerId(null);
    setActiveTab(tab);
  };

  const handleOpenWhatsApp = (summary: CustomerSummary) => {
    setWhatsappTarget({
      customer: summary.customer,
      balance: summary.balance,
    });
  };

  const navItems: Array<{ key: ActiveTab; label: string; icon: typeof Home; badge?: number }> = [
    { key: 'home', label: t.navHome, icon: Home },
    { key: 'customers', label: t.navCustomers, icon: Users },
    {
      key: 'overdue',
      label: t.navOverdue,
      icon: Clock,
      badge: dashboardMetrics.overdueCustomersCount > 0 ? dashboardMetrics.overdueCustomersCount : undefined,
    },
    { key: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar: Compact 44px on mobile, clean 3-zone contract on desktop */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTab('home')}
            className="text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
          >
            {t.appName}
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Primary">
            {navItems.map((item) => {
              const isActive = !selectedCustomerId && activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTab(item.key)}
                  className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-700 text-blue-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined ? ` (${item.badge})` : ''}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Language Switcher on mobile / Primary CTA on desktop */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 md:hidden">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLanguageChange(code)}
                  className={`min-h-[30px] px-2 rounded-md text-[11px] font-semibold transition-colors ${
                    settings.language === code
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addCustomer}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:py-6">
        {storageWarning && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
            {storageWarning}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-200/70 animate-pulse" />
              ))}
            </div>
            <div className="h-12 rounded-xl bg-slate-200/70 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
          </div>
        ) : selectedSummary ? (
          <CustomerDetailView
            summary={selectedSummary}
            entries={selectedCustomerEntries}
            t={t}
            onBack={() => setSelectedCustomerId(null)}
            onEditCustomer={() => {
              setEditingCustomer(selectedSummary.customer);
              setCustomerModalOpen(true);
            }}
            onDeleteCustomer={() => handleRequestDeleteCustomer(selectedSummary.customer)}
            onAddEntry={(type) =>
              setEntryModalState({ open: true, type, editingEntry: null })
            }
            onEditEntry={(entry) =>
              setEntryModalState({ open: true, type: entry.type, editingEntry: entry })
            }
            onDeleteEntry={handleRequestDeleteEntry}
            onSendReminder={() => handleOpenWhatsApp(selectedSummary)}
            onExportCsv={() =>
              exportCustomerLedgerCsv(selectedSummary, selectedCustomerEntries)
            }
            onPreviewImage={(url) => setPreviewImageUrl(url)}
          />
        ) : activeTab === 'home' ? (
          <DashboardView
            metrics={dashboardMetrics}
            summaries={filteredSummaries}
            searchQuery={searchQuery}
            filter={customerFilter}
            t={t}
            onSearchChange={setSearchQuery}
            onFilterChange={setCustomerFilter}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setCustomerModalOpen(true);
            }}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            onSendReminder={handleOpenWhatsApp}
            onOpenOverdueTab={() => navigateTab('overdue')}
          />
        ) : activeTab === 'customers' ? (
          <CustomerListView
            summaries={filteredSummaries}
            searchQuery={searchQuery}
            filter={customerFilter}
            t={t}
            onSearchChange={setSearchQuery}
            onFilterChange={setCustomerFilter}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setCustomerModalOpen(true);
            }}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            onSendReminder={handleOpenWhatsApp}
            onExportAllCsv={() => exportAllCustomersCsv(allSummaries, entries)}
          />
        ) : activeTab === 'overdue' ? (
          <OverdueView
            summaries={allSummaries}
            t={t}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            onSendReminder={handleOpenWhatsApp}
          />
        ) : (
          <SettingsView
            settings={settings}
            customers={customers}
            entries={entries}
            summaries={allSummaries}
            t={t}
            onSaveSettings={handleSaveSettings}
            onImportConfirmed={handleImportConfirmed}
            onLoadSampleData={handleLoadSampleData}
            onClearAllData={handleRequestClearAll}
          />
        )}
      </main>

      {/* Mobile Floating Quick Add Button on Home & Customers list */}
      {!selectedSummary && (activeTab === 'home' || activeTab === 'customers') && (
        <button
          type="button"
          onClick={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
          className="md:hidden fixed bottom-18 right-4 z-30 w-13 h-13 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white shadow-lg shadow-blue-900/25 flex items-center justify-center transition-transform"
          aria-label={t.addCustomer}
          title={t.addCustomer}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Bottom Tab Navigation (56px height) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !selectedCustomerId && activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateTab(item.key)}
                className={`relative min-h-[44px] flex flex-col items-center justify-center px-1 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold font-num flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <CustomerModal
        open={customerModalOpen}
        editingCustomer={editingCustomer}
        existingCustomers={customers}
        t={t}
        onSave={handleSaveCustomer}
        onClose={() => setCustomerModalOpen(false)}
      />

      <LedgerEntryModal
        open={entryModalState.open}
        customerName={selectedSummary?.customer.name ?? ''}
        initialType={entryModalState.type}
        editingEntry={entryModalState.editingEntry}
        t={t}
        onSave={handleSaveEntry}
        onClose={() =>
          setEntryModalState((prev) => ({ ...prev, open: false, editingEntry: null }))
        }
        onPreviewImage={(url) => setPreviewImageUrl(url)}
      />

      <WhatsAppModal
        open={Boolean(whatsappTarget)}
        customer={whatsappTarget?.customer ?? null}
        outstandingBalance={whatsappTarget?.balance ?? 0}
        settings={settings}
        t={t}
        onClose={() => setWhatsappTarget(null)}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        body={confirmState.body}
        confirmLabel={confirmState.destructive ? t.delete : t.confirm}
        cancelLabel={t.cancel}
        destructive={confirmState.destructive}
        onConfirm={() => void confirmState.onConfirm()}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
      />

      <ScreenshotModal
        imageUrl={previewImageUrl}
        closeLabel={t.close}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
