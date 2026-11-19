import type { Customer, EntryType, LedgerEntry } from '../types';
import { isValidIndianPhone, isValidISODate, normalizeIndianPhone, roundCurrency } from './ledger';

export interface ParsedImportEntry {
  type: EntryType;
  amount: number;
  date: string;
  note: string;
}

export interface ParsedImportCustomer {
  sourceKey: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  entries: ParsedImportEntry[];
  isDuplicateInApp: boolean;
  existingCustomerId?: string;
  existingCustomerName?: string;
}

export interface ImportValidationResult {
  valid: boolean;
  shopName?: string;
  customers: ParsedImportCustomer[];
  totalValidEntries: number;
  duplicateCount: number;
  errors: string[];
  warnings: string[];
}

function normalizeDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && isValidISODate(trimmed)) {
    return trimmed;
  }
  const dmy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const iso = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    if (isValidISODate(iso)) return iso;
  }
  return null;
}

export function validateAndParseImportJson(
  rawJsonText: string,
  existingCustomers: Customer[]
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonText);
  } catch {
    return {
      valid: false,
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['Invalid JSON syntax. Please upload a valid .json file.'],
      warnings: [],
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['JSON root must be an object containing a "customers" array.'],
      warnings: [],
    };
  }

  const root = parsed as Record<string, unknown>;
  const rawCustomers = Array.isArray(root.customers) ? root.customers : null;
  if (!rawCustomers) {
    return {
      valid: false,
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['Missing "customers" array in JSON file.'],
      warnings: [],
    };
  }

  // Optional top-level ledgerEntries array (supports both nested entries and flat ledgerEntries linked by customerPhone or customerId)
  const rawTopEntries = Array.isArray(root.ledgerEntries)
    ? root.ledgerEntries
    : Array.isArray(root.entries)
      ? root.entries
      : [];

  const existingByPhone = new Map<string, Customer>();
  for (const c of existingCustomers) {
    existingByPhone.set(c.phone, c);
  }

  const seenPhonesInFile = new Set<string>();
  const customers: ParsedImportCustomer[] = [];
  const customerBySourceId = new Map<string, ParsedImportCustomer>();
  const customerByPhone = new Map<string, ParsedImportCustomer>();

  rawCustomers.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Customer #${index + 1}: Invalid customer object.`);
      return;
    }
    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    const phone = typeof obj.phone === 'string' || typeof obj.phone === 'number'
      ? normalizeIndianPhone(String(obj.phone))
      : '';

    if (!name) {
      errors.push(`Customer #${index + 1}: Missing customer name.`);
      return;
    }
    if (!isValidIndianPhone(phone)) {
      errors.push(`Customer "${name}": Phone number "${String(obj.phone ?? '')}" must be 10 digits.`);
      return;
    }
    if (seenPhonesInFile.has(phone)) {
      warnings.push(`Duplicate phone ${phone} found inside import file; skipped extra record for "${name}".`);
      return;
    }
    seenPhonesInFile.add(phone);

    const existing = existingByPhone.get(phone);
    const sourceKey = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : phone;

    const custEntries: ParsedImportEntry[] = [];
    const nestedEntries = Array.isArray(obj.entries)
      ? obj.entries
      : Array.isArray(obj.ledger)
        ? obj.ledger
        : [];

    nestedEntries.forEach((entryItem, eIdx) => {
      const validated = validateEntryItem(entryItem, `${name} entry #${eIdx + 1}`, errors);
      if (validated) custEntries.push(validated);
    });

    const parsedCust: ParsedImportCustomer = {
      sourceKey,
      name,
      phone,
      address: typeof obj.address === 'string' ? obj.address.trim() : undefined,
      notes: typeof obj.notes === 'string' ? obj.notes.trim() : undefined,
      entries: custEntries,
      isDuplicateInApp: Boolean(existing),
      existingCustomerId: existing?.id,
      existingCustomerName: existing?.name,
    };

    customers.push(parsedCust);
    customerBySourceId.set(sourceKey, parsedCust);
    customerByPhone.set(phone, parsedCust);
  });

  // Attach flat entries if provided
  rawTopEntries.forEach((entryItem, idx) => {
    if (!entryItem || typeof entryItem !== 'object') {
      errors.push(`Entry #${idx + 1}: Invalid entry object.`);
      return;
    }
    const obj = entryItem as Record<string, unknown>;
    const custId = typeof obj.customerId === 'string' ? obj.customerId.trim() : '';
    const custPhone =
      typeof obj.customerPhone === 'string' || typeof obj.customerPhone === 'number'
        ? normalizeIndianPhone(String(obj.customerPhone))
        : typeof obj.phone === 'string' || typeof obj.phone === 'number'
          ? normalizeIndianPhone(String(obj.phone))
          : '';

    const target =
      (custId ? customerBySourceId.get(custId) : undefined) ||
      (custPhone ? customerByPhone.get(custPhone) : undefined);

    if (!target) {
      errors.push(`Entry #${idx + 1}: Could not match entry to any customer in file.`);
      return;
    }

    const validated = validateEntryItem(entryItem, `Entry #${idx + 1} (${target.name})`, errors);
    if (validated) target.entries.push(validated);
  });

  const totalValidEntries = customers.reduce((sum, c) => sum + c.entries.length, 0);
  const duplicateCount = customers.filter((c) => c.isDuplicateInApp).length;

  if (customers.length === 0 && errors.length === 0) {
    errors.push('No valid customers found in the JSON file.');
  }

  const rawShop =
    typeof root.shopName === 'string'
      ? root.shopName.trim()
      : typeof root.shop === 'string'
        ? root.shop.trim()
        : undefined;

  return {
    valid: errors.length === 0 && customers.length > 0,
    shopName: rawShop || undefined,
    customers,
    totalValidEntries,
    duplicateCount,
    errors,
    warnings,
  };
}

function validateEntryItem(
  item: unknown,
  label: string,
  errors: string[]
): ParsedImportEntry | null {
  if (!item || typeof item !== 'object') {
    errors.push(`${label}: Invalid entry object.`);
    return null;
  }
  const obj = item as Record<string, unknown>;
  const rawType = typeof obj.type === 'string' ? obj.type.trim().toLowerCase() : '';
  if (rawType !== 'credit' && rawType !== 'payment') {
    errors.push(`${label}: Entry type must be "credit" or "payment".`);
    return null;
  }

  const amount = Number(obj.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push(`${label}: Amount must be a number greater than 0.`);
    return null;
  }

  const rawDate = typeof obj.date === 'string' ? obj.date : '';
  const isoDate = normalizeDateInput(rawDate);
  if (!isoDate) {
    errors.push(`${label}: Invalid date "${rawDate}". Use YYYY-MM-DD or DD-MM-YYYY.`);
    return null;
  }

  return {
    type: rawType,
    amount: roundCurrency(amount),
    date: isoDate,
    note: typeof obj.note === 'string' ? obj.note.trim() : '',
  };
}

export function buildExportBackupJson(
  customers: Customer[],
  entries: LedgerEntry[],
  shopName: string
): string {
  const entriesByCustomer = new Map<string, LedgerEntry[]>();
  for (const e of entries) {
    const list = entriesByCustomer.get(e.customerId) ?? [];
    list.push(e);
    entriesByCustomer.set(e.customerId, list);
  }

  const payload = {
    app: 'Hisaab',
    exportedAt: new Date().toISOString(),
    shopName,
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      notes: c.notes || '',
      entries: (entriesByCustomer.get(c.id) ?? []).map((e) => ({
        type: e.type,
        amount: e.amount,
        date: e.date,
        note: e.note,
      })),
    })),
  };

  return JSON.stringify(payload, null, 2);
}
