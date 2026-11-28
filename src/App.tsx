import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Home,
  MessageCircle,
  Moon,
  Plus,
  RotateCcw,
  Settings,
  Sun,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  ActiveTab,
  AppSettings,
  Customer,
  CustomerSummary,
  EntryType,
  LanguageCode,
  LedgerEntry,
} from './types';
import { DEFAULT_SETTINGS, storageService } from './db/storage';
import {
  createShopId,
  loadOrInitShopRegistry,
  materializeParsedShop,
  persistShopRegistry,
  syncActiveShopSnapshot,
  type ShopRegistry,
} from './db/shops';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './i18n/translations';
import {
  computeAllSummaries,
  computeDashboardMetrics,
  formatINR,
  getTodayISO,
  sortEntriesNewestFirst,
} from './utils/ledger';
import { exportAllCustomersCsv, exportCustomerLedgerCsv } from './utils/csv';
import {
  validateAndParseImportJson,
  type ImportValidationResult,
} from './utils/importJson';
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
import { TodaysCollectionsModal } from './components/TodaysCollectionsModal';
import { AccountStatementModal } from './components/AccountStatementModal';

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mergeImportIntoState(
  baseCustomers: Customer[],
  baseEntries: LedgerEntry[],
  result: ImportValidationResult,
  mergeDuplicates: boolean
): { nextCustomers: Customer[]; nextEntries: LedgerEntry[] } {
  const now = new Date().toISOString();
  const nextCustomers = [...baseCustomers];
  const nextEntries = [...baseEntries];

  for (const impCust of result.customers) {
    let targetCustomerId: string;

    if (impCust.isDuplicateInApp && impCust.existingCustomerId) {
      if (!mergeDuplicates) {
        continue;
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

  return { nextCustomers, nextEntries };
}

const ATTACHED_SAMPLE_FLAG = 'hisaab_expected_dataset_v2';
const ATTACHED_SAMPLE_URL = '/assets/aistudio/sample-data_633eb33f.json';

interface UndoToastState {
  message: string;
  onUndo?: () => Promise<void> | void;
  receiptCustomerId?: string;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [shopRegistry, setShopRegistry] = useState<ShopRegistry>({
    activeId: 'shop_primary',
    shops: [],
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('hisaab_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

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
    customerId: string | null;
    amount: number | null;
    note: string;
    editingEntry: LedgerEntry | null;
  }>({
    open: false,
    type: 'credit',
    customerId: null,
    amount: null,
    note: '',
    editingEntry: null,
  });

  const [whatsappTarget, setWhatsappTarget] = useState<{
    customer: Customer;
    balance: number;
  } | null>(null);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [todaysCollectionsOpen, setTodaysCollectionsOpen] = useState(false);
  const [statementCustomerId, setStatementCustomerId] = useState<string | null>(null);

  const [toast, setToast] = useState<UndoToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

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
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('hisaab_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const showToast = (nextToast: UndoToastState) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 6500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const loaded = await storageService.loadState();
        if (!mounted) return;

        let finalCustomers = loaded.customers;
        let finalEntries = loaded.entries;
        let finalSettings = loaded.settings;

        let alreadySynced = false;
        try {
          alreadySynced = localStorage.getItem(ATTACHED_SAMPLE_FLAG) === '1';
        } catch {
          alreadySynced = false;
        }

        if (!alreadySynced) {
          finalCustomers = finalCustomers.filter((c) => !c.id.startsWith('cust_sample_'));
          finalEntries = finalEntries.filter((e) => !e.id.startsWith('ent_sample_'));

          try {
            const resp = await fetch(ATTACHED_SAMPLE_URL);
            if (resp.ok) {
              const rawText = await resp.text();
              const parsed = validateAndParseImportJson(rawText, finalCustomers);
              if (parsed.valid) {
                const merged = mergeImportIntoState(finalCustomers, finalEntries, parsed, false);
                finalCustomers = merged.nextCustomers;
                finalEntries = merged.nextEntries;
                await storageService.replaceAllData(finalCustomers, finalEntries);
                if (
                  parsed.shopName &&
                  (finalSettings.shopName === 'Sri Sai Kirana Store' ||
                    finalSettings.shopName === DEFAULT_SETTINGS.shopName)
                ) {
                  finalSettings = { ...finalSettings, shopName: parsed.shopName };
                  await storageService.saveSettings(finalSettings);
                }
                try {
                  localStorage.setItem(ATTACHED_SAMPLE_FLAG, '1');
                } catch {
                  // ignore
                }
              }
            }
          } catch {
            // Non-fatal if attachment fetch fails offline
          }
        }

        if (!mounted) return;
        const initialRegistry = loadOrInitShopRegistry({
          name: finalSettings.shopName,
          upiId: finalSettings.upiId,
          customers: finalCustomers,
          entries: finalEntries,
        });
        setShopRegistry(initialRegistry);
        setCustomers(finalCustomers);
        setEntries(finalEntries);
        setSettings(finalSettings);
        setStorageWarning(loaded.storageWarning);
        setLoading(false);
      } catch {
        if (!mounted) return;
        setStorageWarning('Storage error occurred. Data may not persist.');
        setLoading(false);
      }
    }

    void init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    setShopRegistry((prev) =>
      syncActiveShopSnapshot(prev, {
        name: settings.shopName,
        upiId: settings.upiId,
        customers,
        entries,
      })
    );
  }, [loading, customers, entries, settings.shopName, settings.upiId]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

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
    customerId?: string;
    type: EntryType;
    amount: number;
    date: string;
    note: string;
    screenshotDataUrl?: string;
  }) => {
    const targetCustId = data.customerId || selectedCustomerId;
    if (!targetCustId) return;
    const now = new Date().toISOString();
    let targetEntry: LedgerEntry;
    let nextEntries: LedgerEntry[];
    const previousEntries = entries;

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
        customerId: targetCustId,
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

    const cust = customers.find((c) => c.id === targetCustId);
    showToast({
      message: `${t.savedEntryToast}: ${cust?.name ?? ''} · ${formatINR(targetEntry.amount)}`,
      receiptCustomerId: targetEntry.type === 'payment' ? targetCustId : undefined,
      onUndo: async () => {
        await storageService.replaceAllData(customers, previousEntries);
        setEntries(previousEntries);
        setToast(null);
      },
    });
  };

  const handleQuickSaveEntry = async (data: {
    customerId: string;
    type: EntryType;
    amount: number;
    note: string;
  }) => {
    await handleSaveEntry({
      customerId: data.customerId,
      type: data.type,
      amount: data.amount,
      date: getTodayISO(),
      note: data.note,
    });
  };

  const handleRequestDeleteEntry = (entry: LedgerEntry) => {
    setConfirmState({
      open: true,
      title: t.confirmDeleteEntryTitle,
      body: t.confirmDeleteEntryBody,
      destructive: true,
      onConfirm: async () => {
        const previousEntries = entries;
        const remainingEntries = entries.filter((e) => e.id !== entry.id);
        await storageService.deleteEntry(entry.id, customers, remainingEntries);
        setEntries(remainingEntries);
        setConfirmState((prev) => ({ ...prev, open: false }));

        showToast({
          message: `${t.deletedEntryToast} · ${formatINR(entry.amount)}`,
          onUndo: async () => {
            await storageService.replaceAllData(customers, previousEntries);
            setEntries(previousEntries);
            setToast(null);
          },
        });
      },
    });
  };

  const handleImportConfirmed = async (
    result: ImportValidationResult,
    mergeDuplicates: boolean
  ) => {
    const { nextCustomers, nextEntries } = mergeImportIntoState(
      customers,
      entries,
      result,
      mergeDuplicates
    );

    await storageService.replaceAllData(nextCustomers, nextEntries);
    setCustomers(nextCustomers);
    setEntries(nextEntries);
  };

  const handleLoadSampleData = async () => {
    try {
      const resp = await fetch(ATTACHED_SAMPLE_URL);
      if (!resp.ok) return;
      const rawText = await resp.text();
      const parsed = validateAndParseImportJson(rawText, customers);
      if (!parsed.valid) return;
      const { nextCustomers, nextEntries } = mergeImportIntoState(
        customers,
        entries,
        parsed,
        false
      );
      await storageService.replaceAllData(nextCustomers, nextEntries);
      setCustomers(nextCustomers);
      setEntries(nextEntries);
    } catch {
      setStorageWarning('Could not load sample dataset.');
    }
  };

  const applyReplaceCurrentShop = async (
    result: ImportValidationResult,
    onDone?: () => void
  ) => {
    const { customers: nextCustomers, entries: nextEntries } = materializeParsedShop(
      result,
      makeId
    );
    const nextSettings: AppSettings = {
      ...settings,
      shopName: result.shopName || settings.shopName,
      upiId: result.upiId !== undefined ? result.upiId : settings.upiId,
    };

    await storageService.replaceAllData(nextCustomers, nextEntries);
    await storageService.saveSettings(nextSettings);
    setCustomers(nextCustomers);
    setEntries(nextEntries);
    setSettings(nextSettings);
    setSelectedCustomerId(null);
    onDone?.();
    showToast({ message: `${t.shopReplacedToast}: ${nextSettings.shopName}` });
  };

  const handleRequestReplaceShop = (
    result: ImportValidationResult,
    onDone?: () => void
  ) => {
    if (customers.length === 0 && entries.length === 0) {
      void applyReplaceCurrentShop(result, onDone);
      return;
    }
    setConfirmState({
      open: true,
      title: t.confirmLoadShopTitle,
      body: t.confirmLoadShopBody,
      destructive: true,
      onConfirm: async () => {
        await applyReplaceCurrentShop(result, onDone);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleImportAsNewShop = async (result: ImportValidationResult) => {
    const syncedPrev = syncActiveShopSnapshot(shopRegistry, {
      name: settings.shopName,
      upiId: settings.upiId,
      customers,
      entries,
    });

    const { customers: nextCustomers, entries: nextEntries } = materializeParsedShop(
      result,
      makeId
    );
    const newShopId = createShopId('shop');
    const newShopName =
      result.shopName || `Shop ${syncedPrev.shops.length + 1}`;
    const newShopUpi = result.upiId || '';
    const nextSettings: AppSettings = {
      ...settings,
      shopName: newShopName,
      upiId: newShopUpi,
    };

    const nextRegistry: ShopRegistry = {
      activeId: newShopId,
      shops: [
        ...syncedPrev.shops,
        {
          id: newShopId,
          name: newShopName,
          upiId: newShopUpi,
          customers: nextCustomers,
          entries: nextEntries,
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    persistShopRegistry(nextRegistry);
    await storageService.replaceAllData(nextCustomers, nextEntries);
    await storageService.saveSettings(nextSettings);

    setShopRegistry(nextRegistry);
    setCustomers(nextCustomers);
    setEntries(nextEntries);
    setSettings(nextSettings);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setCustomerFilter('all');
    showToast({ message: `${t.shopImportedNewToast}: ${newShopName}` });
  };

  const handleSwitchShop = async (shopId: string) => {
    if (shopId === shopRegistry.activeId) return;
    const syncedPrev = syncActiveShopSnapshot(shopRegistry, {
      name: settings.shopName,
      upiId: settings.upiId,
      customers,
      entries,
    });
    const target = syncedPrev.shops.find((s) => s.id === shopId);
    if (!target) return;

    const nextSettings: AppSettings = {
      ...settings,
      shopName: target.name,
      upiId: target.upiId || '',
    };
    const nextRegistry: ShopRegistry = {
      ...syncedPrev,
      activeId: target.id,
    };
    persistShopRegistry(nextRegistry);
    await storageService.replaceAllData(target.customers, target.entries);
    await storageService.saveSettings(nextSettings);

    setShopRegistry(nextRegistry);
    setCustomers(target.customers);
    setEntries(target.entries);
    setSettings(nextSettings);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setCustomerFilter('all');
    showToast({ message: `${t.shopSwitchedToast}: ${target.name}` });
  };

  const handleAddNewShop = async (newShopName: string) => {
    const syncedPrev = syncActiveShopSnapshot(shopRegistry, {
      name: settings.shopName,
      upiId: settings.upiId,
      customers,
      entries,
    });
    const newId = createShopId('shop');
    const cleanName = newShopName.trim();
    if (!cleanName) return;

    const nextSettings: AppSettings = {
      ...settings,
      shopName: cleanName,
      upiId: '',
    };
    const nextRegistry: ShopRegistry = {
      activeId: newId,
      shops: [
        ...syncedPrev.shops,
        {
          id: newId,
          name: cleanName,
          upiId: '',
          customers: [],
          entries: [],
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    persistShopRegistry(nextRegistry);
    await storageService.replaceAllData([], []);
    await storageService.saveSettings(nextSettings);

    setShopRegistry(nextRegistry);
    setCustomers([]);
    setEntries([]);
    setSettings(nextSettings);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setCustomerFilter('all');
    showToast({ message: `${t.shopAddedToast}: ${cleanName}` });
  };

  const handleRemoveShop = (shopId: string) => {
    const target = shopRegistry.shops.find((s) => s.id === shopId);
    if (!target || shopId === shopRegistry.activeId) return;
    setConfirmState({
      open: true,
      title: t.confirmRemoveShopTitle,
      body: `${target.name} — ${t.confirmRemoveShopBody}`,
      destructive: true,
      onConfirm: () => {
        setShopRegistry((prev) => {
          const nextRegistry: ShopRegistry = {
            ...prev,
            shops: prev.shops.filter((s) => s.id !== shopId),
          };
          persistShopRegistry(nextRegistry);
          return nextRegistry;
        });
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
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

  const openGlobalRecordModal = (prefill?: {
    customerId?: string | null;
    type?: EntryType;
    amount?: number | null;
    note?: string;
  }) => {
    if (customers.length === 0) {
      setEditingCustomer(null);
      setCustomerModalOpen(true);
      return;
    }
    setEntryModalState({
      open: true,
      type: prefill?.type ?? 'credit',
      customerId: prefill?.customerId ?? customers[0].id,
      amount: prefill?.amount ?? null,
      note: prefill?.note ?? '',
      editingEntry: null,
    });
  };

  const navItems: Array<{ key: ActiveTab; label: string; icon: typeof Home; badge?: number }> = [
    { key: 'home', label: t.navHome, icon: Home },
    {
      key: 'customers',
      label: t.navCustomers,
      icon: Users,
      badge: customers.length > 0 ? customers.length : undefined,
    },
    {
      key: 'overdue',
      label: t.navOverdue,
      icon: Clock,
      badge:
        dashboardMetrics.overdueCustomersCount > 0
          ? dashboardMetrics.overdueCustomersCount
          : undefined,
    },
    { key: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#0B1411] text-stone-900 dark:text-stone-100">
      <div className="app-shell-content flex-1 flex flex-col">
      {/* Sticky Header Preserving Exact Brand Logo & Caption Rules */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#13201B]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-emerald-950 rounded-b-2xl md:rounded-none shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[52px] md:h-16 py-1.5 md:py-0 flex items-center justify-between gap-3 md:gap-8">
          {/* Zone 1: Green Poppins Bold 700 Logo + Poppins Regular 400 Caption */}
          <button
            type="button"
            onClick={() => navigateTab('home')}
            className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg"
          >
            <span className="block font-brand text-base md:text-xl font-bold leading-tight tracking-tight text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              {t.appName}
            </span>
            <span className="block font-brand text-[10px] sm:text-xs font-normal leading-tight text-stone-500 dark:text-stone-400 truncate">
              {t.tagline}
            </span>
          </button>

          {/* Zone 2: Desktop Horizontal Links (visible md to lg, sidebar takes over on lg+) */}
          <nav className="hidden md:flex lg:hidden items-center gap-6 text-sm font-medium" aria-label="Primary">
            {navItems.map((item) => {
              const isActive = !selectedCustomerId && activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTab(item.key)}
                  className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    isActive
                      ? 'border-emerald-700 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined ? ` (${item.badge})` : ''}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Dropdown, Theme & Primary Record CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                aria-label={t.languageLabel}
                className="min-h-[38px] md:min-h-[40px] max-w-[110px] sm:max-w-[136px] appearance-none rounded-xl border border-stone-200 dark:border-emerald-900 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 pl-2.5 pr-7 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-100 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="min-h-[38px] min-w-[38px] md:min-h-[40px] md:min-w-[40px] rounded-xl border border-stone-200 dark:border-emerald-900 bg-white dark:bg-[#0B1411] hover:bg-stone-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-200 flex items-center justify-center transition-colors"
              aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
              title={theme === 'dark' ? t.switchToLight : t.switchToDark}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => openGlobalRecordModal()}
              className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.recordEntryCta}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Rail + Main Workspace */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex">
        {/* Desktop Sidebar Rail (lg+) */}
        <aside className="hidden lg:flex lg:w-60 shrink-0 flex-col justify-between border-r border-stone-200/80 dark:border-emerald-950 px-3 py-5">
          <div className="space-y-6">
            <nav className="space-y-1" aria-label="Sidebar navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !selectedCustomerId && activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTab(item.key)}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-700/10 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/60 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs font-num font-bold ${
                          item.key === 'overdue'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-stone-200/80 dark:border-emerald-950 space-y-2">
              <button
                type="button"
                onClick={() => openGlobalRecordModal()}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t.recordEntryCta}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomer(null);
                  setCustomerModalOpen(true);
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13201B] hover:bg-stone-50 dark:hover:bg-emerald-950 text-sm font-semibold text-stone-700 dark:text-stone-200 inline-flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.addCustomer}</span>
              </button>
            </div>
          </div>

          <p className="px-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
            {t.localStorageNoticeBody}
          </p>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 pt-4 pb-24 md:py-6">
          {storageWarning && (
            <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
              {storageWarning}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-44 rounded-3xl bg-stone-200/80 dark:bg-emerald-950/50 animate-pulse" />
              <div className="h-14 rounded-2xl bg-stone-200/80 dark:bg-emerald-950/50 animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-stone-200/80 dark:bg-emerald-950/50 animate-pulse" />
                ))}
              </div>
            </div>
          ) : selectedSummary ? (
            <CustomerDetailView
              summary={selectedSummary}
              entries={selectedCustomerEntries}
              settings={settings}
              t={t}
              onBack={() => setSelectedCustomerId(null)}
              onEditCustomer={() => {
                setEditingCustomer(selectedSummary.customer);
                setCustomerModalOpen(true);
              }}
              onDeleteCustomer={() => handleRequestDeleteCustomer(selectedSummary.customer)}
              onAddEntry={(type) =>
                setEntryModalState({
                  open: true,
                  type,
                  customerId: selectedSummary.customer.id,
                  amount: null,
                  note: '',
                  editingEntry: null,
                })
              }
              onEditEntry={(entry) =>
                setEntryModalState({
                  open: true,
                  type: entry.type,
                  customerId: entry.customerId,
                  amount: entry.amount,
                  note: entry.note,
                  editingEntry: entry,
                })
              }
              onDeleteEntry={handleRequestDeleteEntry}
              onSendReminder={() => handleOpenWhatsApp(selectedSummary)}
              onSaveUpiId={(upiId) => handleSaveSettings({ ...settings, upiId })}
              onExportCsv={() =>
                exportCustomerLedgerCsv(selectedSummary, selectedCustomerEntries)
              }
              onOpenStatement={() => setStatementCustomerId(selectedSummary.customer.id)}
              onPreviewImage={(url) => setPreviewImageUrl(url)}
            />
          ) : activeTab === 'home' ? (
            <DashboardView
              shopName={settings.shopName}
              language={settings.language}
              metrics={dashboardMetrics}
              customers={customers}
              entries={entries}
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
              onOpenRecordEntry={openGlobalRecordModal}
              onQuickSaveEntry={handleQuickSaveEntry}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onSendReminder={handleOpenWhatsApp}
              onOpenCustomersTab={(nextFilter = 'all') => {
                setCustomerFilter(nextFilter);
                setSearchQuery('');
                navigateTab('customers');
              }}
              onOpenTodaysCollections={() => setTodaysCollectionsOpen(true)}
              onOpenOverdueTab={() => navigateTab('overdue')}
              onExportAllCsv={() => exportAllCustomersCsv(allSummaries, entries)}
            />
          ) : activeTab === 'customers' ? (
            <CustomerListView
              summaries={filteredSummaries}
              language={settings.language}
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
              language={settings.language}
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
              shops={shopRegistry.shops}
              activeShopId={shopRegistry.activeId}
              t={t}
              onSaveSettings={handleSaveSettings}
              onImportConfirmed={handleImportConfirmed}
              onRequestReplaceShop={handleRequestReplaceShop}
              onImportAsNewShop={handleImportAsNewShop}
              onSwitchShop={handleSwitchShop}
              onAddNewShop={handleAddNewShop}
              onRemoveShop={handleRemoveShop}
              onLoadSampleData={handleLoadSampleData}
              onClearAllData={handleRequestClearAll}
            />
          )}
        </main>
      </div>

      {/* Mobile Floating Quick Record Entry Button */}
      {!selectedSummary && (activeTab === 'home' || activeTab === 'customers') && (
        <button
          type="button"
          onClick={() => openGlobalRecordModal()}
          className="md:hidden fixed bottom-18 right-4 z-30 w-12 h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white shadow-lg shadow-emerald-950/30 flex items-center justify-center transition-transform"
          aria-label={t.recordEntryCta}
          title={t.recordEntryCta}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Bottom Tab Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#13201B]/95 backdrop-blur-md border-t border-stone-200 dark:border-emerald-950 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-safe"
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
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center transition-transform ${
                    isActive
                      ? 'w-9 h-9 -mt-3 rounded-full bg-emerald-700 text-white shadow-md ring-4 ring-white dark:ring-[#13201B]'
                      : ''
                  }`}
                >
                  <Icon className={isActive ? 'w-4 h-4' : 'w-5 h-5'} />
                  {item.badge !== undefined && item.key === 'overdue' && (
                    <span
                      className={`absolute min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold font-num flex items-center justify-center ${
                        isActive ? '-top-1 -right-1.5' : '-top-1.5 -right-2.5'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 truncate max-w-full ${
                    isActive ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Undo / Receipt Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-stone-900 dark:bg-emerald-950 border border-stone-700 dark:border-emerald-700 text-white px-4 py-3 shadow-xl flex items-center justify-between gap-3"
        >
          <span className="text-xs sm:text-sm font-medium truncate">{toast.message}</span>
          <div className="flex items-center gap-2 shrink-0">
            {toast.receiptCustomerId && (
              <button
                type="button"
                onClick={() => {
                  const summary = allSummaries.find(
                    (s) => s.customer.id === toast.receiptCustomerId
                  );
                  if (summary) handleOpenWhatsApp(summary);
                }}
                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t.sendReceiptLink}</span>
              </button>
            )}
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => void toast.onUndo?.()}
                className="text-xs font-bold text-[#F7C870] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.undoAction}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 text-stone-400 hover:text-white"
              aria-label={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>

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
        customerName={
          entryModalState.editingEntry
            ? customers.find((c) => c.id === entryModalState.editingEntry?.customerId)?.name
            : selectedSummary?.customer.name
        }
        customers={
          !selectedSummary && !entryModalState.editingEntry ? customers : undefined
        }
        summaries={allSummaries}
        settings={settings}
        initialCustomerId={entryModalState.customerId}
        initialType={entryModalState.type}
        initialAmount={entryModalState.amount}
        initialNote={entryModalState.note}
        editingEntry={entryModalState.editingEntry}
        t={t}
        onSave={handleSaveEntry}
        onSaveUpiId={(upiId) => handleSaveSettings({ ...settings, upiId })}
        onSendReminder={handleOpenWhatsApp}
        onSelectCustomerForStatement={(id) => {
          setSelectedCustomerId(id);
          setStatementCustomerId(id);
        }}
        onClose={() =>
          setEntryModalState((prev) => ({
            ...prev,
            open: false,
            editingEntry: null,
            amount: null,
            note: '',
          }))
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

      <TodaysCollectionsModal
        open={todaysCollectionsOpen}
        language={settings.language}
        customers={customers}
        entries={entries}
        t={t}
        onSelectCustomer={(id) => setSelectedCustomerId(id)}
        onViewCustomers={() => {
          setCustomerFilter('all');
          setSearchQuery('');
          navigateTab('customers');
        }}
        onClose={() => setTodaysCollectionsOpen(false)}
      />

      <AccountStatementModal
        open={Boolean(statementCustomerId)}
        summary={
          statementCustomerId
            ? allSummaries.find((s) => s.customer.id === statementCustomerId) ?? null
            : null
        }
        entries={
          statementCustomerId
            ? entries.filter((e) => e.customerId === statementCustomerId)
            : []
        }
        settings={settings}
        t={t}
        onSaveUpiId={(upiId) => handleSaveSettings({ ...settings, upiId })}
        onClose={() => setStatementCustomerId(null)}
      />
    </div>
  );
}
