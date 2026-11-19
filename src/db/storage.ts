import type { AppSettings, Customer, LedgerEntry } from '../types';

const DB_NAME = 'hisaab_ledger_db';
const DB_VERSION = 1;
const STORE_CUSTOMERS = 'customers';
const STORE_ENTRIES = 'entries';
const STORE_SETTINGS = 'settings';

const SETTINGS_LS_KEY = 'hisaab_settings_v1';
const SEEDED_LS_KEY = 'hisaab_seeded_v1';
const FALLBACK_DATA_LS_KEY = 'hisaab_fallback_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  shopName: 'Lakshmi Provision Store (fictional)',
  upiId: '',
  overdueThresholdDays: 7,
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CUSTOMERS)) {
        db.createObjectStore(STORE_CUSTOMERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        const entryStore = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
        entryStore.createIndex('customerId', 'customerId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });
}

async function idbGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error(`Failed reading ${storeName}`));
  });
}

async function idbPut<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error(`Failed writing ${storeName}`));
  });
}

async function idbDelete(db: IDBDatabase, storeName: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error(`Failed deleting from ${storeName}`));
  });
}

async function idbReplaceAll(
  db: IDBDatabase,
  customers: Customer[],
  entries: LedgerEntry[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_CUSTOMERS, STORE_ENTRIES], 'readwrite');
    const cStore = tx.objectStore(STORE_CUSTOMERS);
    const eStore = tx.objectStore(STORE_ENTRIES);
    cStore.clear();
    eStore.clear();
    for (const c of customers) cStore.put(c);
    for (const e of entries) eStore.put(e);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed replacing store data'));
  });
}

function readSettingsFromLocalStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      language: parsed.language === 'hi' || parsed.language === 'te' ? parsed.language : 'en',
      shopName: typeof parsed.shopName === 'string' ? parsed.shopName : DEFAULT_SETTINGS.shopName,
      upiId: typeof parsed.upiId === 'string' ? parsed.upiId : '',
      overdueThresholdDays:
        typeof parsed.overdueThresholdDays === 'number' && parsed.overdueThresholdDays > 0
          ? parsed.overdueThresholdDays
          : 7,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettingsToLocalStorage(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore LS quota error
  }
}

export interface LoadedState {
  customers: Customer[];
  entries: LedgerEntry[];
  settings: AppSettings;
  storageWarning: string | null;
}

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private usingFallback = false;

  private async getDb(): Promise<IDBDatabase | null> {
    if (this.usingFallback) return null;
    try {
      if (!this.dbPromise) {
        this.dbPromise = openDatabase();
      }
      return await this.dbPromise;
    } catch {
      this.usingFallback = true;
      return null;
    }
  }

  private readFallback(): { customers: Customer[]; entries: LedgerEntry[] } {
    try {
      const raw = localStorage.getItem(FALLBACK_DATA_LS_KEY);
      if (!raw) return { customers: [], entries: [] };
      const parsed = JSON.parse(raw) as { customers?: Customer[]; entries?: LedgerEntry[] };
      return {
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      };
    } catch {
      return { customers: [], entries: [] };
    }
  }

  private writeFallback(customers: Customer[], entries: LedgerEntry[]): void {
    try {
      localStorage.setItem(FALLBACK_DATA_LS_KEY, JSON.stringify({ customers, entries }));
    } catch {
      throw new Error('Browser storage is full. Please export a backup and remove old screenshots.');
    }
  }

  async loadState(): Promise<LoadedState> {
    const settings = readSettingsFromLocalStorage();
    const db = await this.getDb();

    if (!db) {
      const data = this.readFallback();
      return {
        customers: data.customers,
        entries: data.entries,
        settings,
        storageWarning: 'IndexedDB unavailable; using browser LocalStorage fallback.',
      };
    }

    try {
      const [customers, entries] = await Promise.all([
        idbGetAll<Customer>(db, STORE_CUSTOMERS),
        idbGetAll<LedgerEntry>(db, STORE_ENTRIES),
      ]);

      const settingsRows = await idbGetAll<{ key: string; value: AppSettings }>(
        db,
        STORE_SETTINGS
      );
      const storedSettings = settingsRows.find((r) => r.key === 'app_settings')?.value;
      const mergedSettings = storedSettings
        ? { ...DEFAULT_SETTINGS, ...storedSettings }
        : settings;

      return {
        customers,
        entries,
        settings: mergedSettings,
        storageWarning: null,
      };
    } catch {
      const data = this.readFallback();
      return {
        customers: data.customers,
        entries: data.entries,
        settings,
        storageWarning: 'Could not access IndexedDB cleanly; loaded fallback storage.',
      };
    }
  }

  async saveCustomer(customer: Customer, allCustomers: Customer[], allEntries: LedgerEntry[]): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      this.writeFallback(allCustomers, allEntries);
      return;
    }
    await idbPut(db, STORE_CUSTOMERS, customer);
  }

  async deleteCustomerAndEntries(
    customerId: string,
    entryIds: string[],
    remainingCustomers: Customer[],
    remainingEntries: LedgerEntry[]
  ): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      this.writeFallback(remainingCustomers, remainingEntries);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_CUSTOMERS, STORE_ENTRIES], 'readwrite');
      tx.objectStore(STORE_CUSTOMERS).delete(customerId);
      const eStore = tx.objectStore(STORE_ENTRIES);
      for (const eid of entryIds) {
        eStore.delete(eid);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed deleting customer'));
    });
  }

  async saveEntry(entry: LedgerEntry, allCustomers: Customer[], allEntries: LedgerEntry[]): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      this.writeFallback(allCustomers, allEntries);
      return;
    }
    await idbPut(db, STORE_ENTRIES, entry);
  }

  async deleteEntry(entryId: string, allCustomers: Customer[], remainingEntries: LedgerEntry[]): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      this.writeFallback(allCustomers, remainingEntries);
      return;
    }
    await idbDelete(db, STORE_ENTRIES, entryId);
  }

  async replaceAllData(customers: Customer[], entries: LedgerEntry[]): Promise<void> {
    try {
      localStorage.setItem(SEEDED_LS_KEY, '1');
    } catch {
      // ignore
    }
    const db = await this.getDb();
    if (!db) {
      this.writeFallback(customers, entries);
      return;
    }
    await idbReplaceAll(db, customers, entries);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    saveSettingsToLocalStorage(settings);
    const db = await this.getDb();
    if (!db) return;
    await idbPut(db, STORE_SETTINGS, { key: 'app_settings', value: settings });
  }
}

export const storageService = new StorageService();
