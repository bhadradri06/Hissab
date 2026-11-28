import type { Customer, LedgerEntry } from '../types';
import type { ImportValidationResult } from '../utils/importJson';
import { computeAllSummaries } from '../utils/ledger';

const SHOPS_REGISTRY_LS_KEY = 'hisaab_shops_v1';

export interface ShopProfile {
  id: string;
  name: string;
  upiId: string;
  customers: Customer[];
  entries: LedgerEntry[];
  updatedAt: string;
}

export interface ShopRegistry {
  activeId: string;
  shops: ShopProfile[];
}

export function createShopId(prefix = 'shop'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function persistShopRegistry(registry: ShopRegistry): void {
  try {
    localStorage.setItem(SHOPS_REGISTRY_LS_KEY, JSON.stringify(registry));
  } catch {
    // Fallback if screenshots inside inactive shops exceed LocalStorage quota
    try {
      const compact: ShopRegistry = {
        activeId: registry.activeId,
        shops: registry.shops.map((s) => ({
          ...s,
          entries: s.entries.map(({ screenshotDataUrl: _drop, ...rest }) => rest),
        })),
      };
      localStorage.setItem(SHOPS_REGISTRY_LS_KEY, JSON.stringify(compact));
    } catch {
      // Ignore quota failure safely
    }
  }
}

export function loadOrInitShopRegistry(activeSnapshot: {
  name: string;
  upiId: string;
  customers: Customer[];
  entries: LedgerEntry[];
}): ShopRegistry {
  try {
    const raw = localStorage.getItem(SHOPS_REGISTRY_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ShopRegistry>;
      if (Array.isArray(parsed.shops) && parsed.shops.length > 0) {
        const validShops = parsed.shops.filter(
          (s): s is ShopProfile =>
            Boolean(s && typeof s.id === 'string' && typeof s.name === 'string')
        );
        if (validShops.length > 0) {
          const hasActive = validShops.some((s) => s.id === parsed.activeId);
          const activeId = hasActive ? (parsed.activeId as string) : validShops[0].id;
          const synced: ShopRegistry = {
            activeId,
            shops: validShops.map((s) =>
              s.id === activeId
                ? {
                    ...s,
                    name: activeSnapshot.name || s.name,
                    upiId: activeSnapshot.upiId ?? s.upiId,
                    customers: activeSnapshot.customers,
                    entries: activeSnapshot.entries,
                    updatedAt: new Date().toISOString(),
                  }
                : {
                    ...s,
                    upiId: typeof s.upiId === 'string' ? s.upiId : '',
                    customers: Array.isArray(s.customers) ? s.customers : [],
                    entries: Array.isArray(s.entries) ? s.entries : [],
                  }
            ),
          };
          persistShopRegistry(synced);
          return synced;
        }
      }
    }
  } catch {
    // Fall back to fresh registry built from active IndexedDB state
  }

  const initial: ShopRegistry = {
    activeId: 'shop_primary',
    shops: [
      {
        id: 'shop_primary',
        name: activeSnapshot.name || 'Lakshmi Provision Store (fictional)',
        upiId: activeSnapshot.upiId || '',
        customers: activeSnapshot.customers,
        entries: activeSnapshot.entries,
        updatedAt: new Date().toISOString(),
      },
    ],
  };
  persistShopRegistry(initial);
  return initial;
}

export function syncActiveShopSnapshot(
  registry: ShopRegistry,
  snapshot: {
    name: string;
    upiId: string;
    customers: Customer[];
    entries: LedgerEntry[];
  }
): ShopRegistry {
  const now = new Date().toISOString();
  const exists = registry.shops.some((s) => s.id === registry.activeId);
  const nextShops = exists
    ? registry.shops.map((s) =>
        s.id === registry.activeId
          ? {
              ...s,
              name: snapshot.name || s.name,
              upiId: snapshot.upiId,
              customers: snapshot.customers,
              entries: snapshot.entries,
              updatedAt: now,
            }
          : s
      )
    : [
        {
          id: registry.activeId || 'shop_primary',
          name: snapshot.name || 'My Shop',
          upiId: snapshot.upiId,
          customers: snapshot.customers,
          entries: snapshot.entries,
          updatedAt: now,
        },
        ...registry.shops,
      ];

  const nextRegistry: ShopRegistry = {
    activeId: registry.activeId || 'shop_primary',
    shops: nextShops,
  };
  persistShopRegistry(nextRegistry);
  return nextRegistry;
}

export function materializeParsedShop(
  result: ImportValidationResult,
  makeId: (prefix: string) => string
): { customers: Customer[]; entries: LedgerEntry[] } {
  const now = new Date().toISOString();
  const customers: Customer[] = [];
  const entries: LedgerEntry[] = [];

  for (const impCust of result.customers) {
    const custId = makeId('cust');
    customers.push({
      id: custId,
      name: impCust.name,
      phone: impCust.phone,
      address: impCust.address,
      notes: impCust.notes,
      createdAt: now,
      updatedAt: now,
    });

    for (const impEntry of impCust.entries) {
      entries.push({
        id: makeId('ent'),
        customerId: custId,
        type: impEntry.type,
        amount: impEntry.amount,
        date: impEntry.date,
        note: impEntry.note,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { customers, entries };
}

export function getShopQuickStats(shop: ShopProfile): {
  customerCount: number;
  totalOutstanding: number;
} {
  const summaries = computeAllSummaries(shop.customers, shop.entries, 7);
  const totalOutstanding = summaries.reduce(
    (sum, s) => (s.balance > 0 ? sum + s.balance : sum),
    0
  );
  return {
    customerCount: shop.customers.length,
    totalOutstanding,
  };
}
