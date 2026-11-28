import type { Customer, EntryType, LedgerEntry } from '../types';
import {
  getTodayISO,
  isValidIndianPhone,
  isValidISODate,
  normalizeIndianPhone,
  roundCurrency,
} from './ledger';

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
  sourceFormat?: 'json' | 'csv';
  shopName?: string;
  upiId?: string;
  customers: ParsedImportCustomer[];
  totalValidEntries: number;
  duplicateCount: number;
  errors: string[];
  warnings: string[];
}

function normalizeDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(trimmed)) {
    const iso = trimmed.replace(/\//g, '-');
    if (isValidISODate(iso)) return iso;
  }
  const dmy = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
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

  const cleaned = rawJsonText.replace(/^\uFEFF/, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      valid: false,
      sourceFormat: 'json',
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['Invalid JSON syntax. Please provide valid JSON or CSV data.'],
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

  const rawUpi =
    typeof root.upiId === 'string'
      ? root.upiId.trim()
      : typeof root.upi === 'string'
        ? root.upi.trim()
        : undefined;

  return {
    valid: errors.length === 0 && customers.length > 0,
    sourceFormat: 'json',
    shopName: rawShop || undefined,
    upiId: rawUpi || undefined,
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

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r') {
      if (text[i + 1] === '\n') i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function parseAmountCell(raw: string): number {
  const cleaned = raw.replace(/[₹,\s]/g, '').replace(/^(rs\.?|inr)/i, '').trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function normalizeCsvEntryType(raw: string): 'credit' | 'payment' | 'placeholder' | 'summary' | null {
  const lower = raw.trim().toLowerCase();
  if (lower.includes('no entries') || lower === 'opening') return 'placeholder';
  if (lower === 'outstanding summary' || lower === 'overdue summary') return 'summary';
  if (
    lower === 'credit' ||
    lower === 'udhaar' ||
    lower === 'udhar' ||
    lower === 'given' ||
    lower === 'debit' ||
    lower === 'dr' ||
    lower === 'gave'
  ) {
    return 'credit';
  }
  if (
    lower === 'payment' ||
    lower === 'paid' ||
    lower === 'received' ||
    lower === 'got' ||
    lower === 'cr' ||
    lower === 'jama' ||
    lower === 'collection'
  ) {
    return 'payment';
  }
  return null;
}

export function parseShopCsv(
  rawCsvText: string,
  existingCustomers: Customer[]
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const cleaned = rawCsvText.replace(/^\uFEFF/, '').trim();
  const rows = splitCsvRows(cleaned);

  if (rows.length < 2) {
    return {
      valid: false,
      sourceFormat: 'csv',
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['CSV must contain a header row and at least one customer or entry row.'],
      warnings: [],
    };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ' '));
  const findCol = (aliases: string[]): number =>
    headers.findIndex((h) => aliases.includes(h));

  const nameIdx = findCol(['customer name', 'name', 'customer', 'party', 'party name']);
  const phoneIdx = findCol(['phone number', 'phone', 'mobile', 'mobile number', 'contact']);
  const typeIdx = findCol(['entry type', 'type', 'kind', 'txn type', 'transaction type']);
  const amountIdx = findCol(['amount', 'amount (₹)', 'rupees', 'inr', 'rs', 'value']);
  const dateIdx = findCol(['date', 'txn date', 'entry date']);
  const noteIdx = findCol(['note', 'notes', 'items', 'description', 'particulars', 'remarks']);
  const addressIdx = findCol(['address']);
  const shopIdx = findCol(['shop', 'shop name', 'shopname']);

  if (nameIdx === -1 || phoneIdx === -1) {
    return {
      valid: false,
      sourceFormat: 'csv',
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['CSV header must include "Customer Name" (or "Name") and "Phone Number" (or "Phone").'],
      warnings: [],
    };
  }

  const existingByPhone = new Map<string, Customer>();
  for (const c of existingCustomers) {
    existingByPhone.set(c.phone, c);
  }

  const customers: ParsedImportCustomer[] = [];
  const customerByPhone = new Map<string, ParsedImportCustomer>();
  let detectedShopName: string | undefined;

  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r];
    const rowLabel = `Row ${r + 1}`;
    const name = (row[nameIdx] ?? '').trim();
    const rawPhone = row[phoneIdx] ?? '';
    const phone = normalizeIndianPhone(rawPhone);

    if (!name) {
      errors.push(`${rowLabel}: Missing customer name.`);
      continue;
    }
    if (!isValidIndianPhone(phone)) {
      errors.push(`${rowLabel} ("${name}"): Phone number "${rawPhone}" must be 10 digits.`);
      continue;
    }

    if (!detectedShopName && shopIdx !== -1) {
      const candidateShop = (row[shopIdx] ?? '').trim();
      if (candidateShop) detectedShopName = candidateShop;
    }

    let targetCust = customerByPhone.get(phone);
    if (!targetCust) {
      const existing = existingByPhone.get(phone);
      targetCust = {
        sourceKey: phone,
        name,
        phone,
        address: addressIdx !== -1 ? (row[addressIdx] ?? '').trim() || undefined : undefined,
        entries: [],
        isDuplicateInApp: Boolean(existing),
        existingCustomerId: existing?.id,
        existingCustomerName: existing?.name,
      };
      customerByPhone.set(phone, targetCust);
      customers.push(targetCust);
    }

    const rawType = typeIdx !== -1 ? (row[typeIdx] ?? '').trim() : '';
    const rawAmount = amountIdx !== -1 ? (row[amountIdx] ?? '').trim() : '';
    const rawDate = dateIdx !== -1 ? (row[dateIdx] ?? '').trim() : '';
    const rawNote = noteIdx !== -1 ? (row[noteIdx] ?? '').trim() : '';

    // Allow customer-only CSV (no entry type / amount columns or empty entry fields)
    if (!rawType && !rawAmount) {
      if (rawNote && !targetCust.notes) targetCust.notes = rawNote;
      continue;
    }

    const kind = normalizeCsvEntryType(rawType || 'credit');
    if (!kind) {
      errors.push(`${rowLabel}: Entry type "${rawType}" must be Credit or Payment.`);
      continue;
    }

    const parsedAmount = parseAmountCell(rawAmount);
    if (kind === 'placeholder') {
      if (rawNote && !targetCust.notes) targetCust.notes = rawNote;
      continue;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      errors.push(`${rowLabel}: Amount "${rawAmount}" must be greater than 0.`);
      continue;
    }

    const resolvedDate =
      kind === 'summary' && (!rawDate || rawDate === '-' || /no payment/i.test(rawDate))
        ? getTodayISO()
        : rawDate
          ? normalizeDateInput(rawDate)
          : getTodayISO();

    if (!resolvedDate) {
      errors.push(`${rowLabel}: Invalid date "${rawDate}". Use DD-MM-YYYY or YYYY-MM-DD.`);
      continue;
    }

    targetCust.entries.push({
      type: kind === 'summary' ? 'credit' : kind,
      amount: roundCurrency(parsedAmount),
      date: resolvedDate,
      note: rawNote || (kind === 'summary' ? 'Opening balance' : ''),
    });
  }

  const totalValidEntries = customers.reduce((sum, c) => sum + c.entries.length, 0);
  const duplicateCount = customers.filter((c) => c.isDuplicateInApp).length;

  if (customers.length === 0 && errors.length === 0) {
    errors.push('No valid customers found in CSV.');
  }

  return {
    valid: errors.length === 0 && customers.length > 0,
    sourceFormat: 'csv',
    shopName: detectedShopName,
    customers,
    totalValidEntries,
    duplicateCount,
    errors,
    warnings,
  };
}

export function validateAndParseShopText(
  rawText: string,
  existingCustomers: Customer[]
): ImportValidationResult {
  const cleaned = rawText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return {
      valid: false,
      customers: [],
      totalValidEntries: 0,
      duplicateCount: 0,
      errors: ['Paste shop JSON or CSV text, or choose a file first.'],
      warnings: [],
    };
  }

  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    return validateAndParseImportJson(cleaned, existingCustomers);
  }

  return parseShopCsv(cleaned, existingCustomers);
}

export function buildExportBackupJson(
  customers: Customer[],
  entries: LedgerEntry[],
  shopName: string,
  upiId?: string
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
    ...(upiId ? { upiId } : {}),
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
