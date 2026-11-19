import type { CustomerSummary, LedgerEntry } from '../types';
import { formatIndianDate, getTodayISO, roundCurrency, sortEntriesNewestFirst } from './ledger';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatRupeeCsv(amount: number): string {
  const rounded = roundCurrency(amount);
  const hasDecimals = Math.round(Math.abs(rounded) * 100) % 100 !== 0;
  return `₹${rounded.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csvLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  // UTF-8 BOM ensures Microsoft Excel opens Rupee symbol and Hindi/Telugu text properly
  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const HEADERS = [
  'Customer Name',
  'Phone Number',
  'Entry Type',
  'Amount',
  'Date',
  'Note',
  'Outstanding Balance',
];

export function exportAllCustomersCsv(
  summaries: CustomerSummary[],
  entries: LedgerEntry[]
): void {
  const rows: Array<Array<string | number>> = [HEADERS];
  const entriesByCustomer = new Map<string, LedgerEntry[]>();

  for (const entry of entries) {
    const arr = entriesByCustomer.get(entry.customerId) ?? [];
    arr.push(entry);
    entriesByCustomer.set(entry.customerId, arr);
  }

  for (const summary of summaries) {
    const custEntries = sortEntriesNewestFirst(
      entriesByCustomer.get(summary.customer.id) ?? []
    );
    if (custEntries.length === 0) {
      rows.push([
        summary.customer.name,
        summary.customer.phone,
        'Opening / No Entries',
        formatRupeeCsv(0),
        '-',
        summary.customer.notes || '',
        formatRupeeCsv(summary.balance),
      ]);
    } else {
      for (const entry of custEntries) {
        rows.push([
          summary.customer.name,
          summary.customer.phone,
          entry.type === 'credit' ? 'Credit' : 'Payment',
          formatRupeeCsv(entry.amount),
          formatIndianDate(entry.date),
          entry.note || '',
          formatRupeeCsv(summary.balance),
        ]);
      }
    }
  }

  const today = getTodayISO();
  downloadCsv(`hisaab-all-customers-${today}.csv`, rows);
}

export function exportCustomerLedgerCsv(
  summary: CustomerSummary,
  customerEntries: LedgerEntry[]
): void {
  const rows: Array<Array<string | number>> = [HEADERS];
  const sorted = sortEntriesNewestFirst(customerEntries);

  if (sorted.length === 0) {
    rows.push([
      summary.customer.name,
      summary.customer.phone,
      'No Entries',
      formatRupeeCsv(0),
      '-',
      summary.customer.notes || '',
      formatRupeeCsv(summary.balance),
    ]);
  } else {
    for (const entry of sorted) {
      rows.push([
        summary.customer.name,
        summary.customer.phone,
        entry.type === 'credit' ? 'Credit' : 'Payment',
        formatRupeeCsv(entry.amount),
        formatIndianDate(entry.date),
        entry.note || '',
        formatRupeeCsv(summary.balance),
      ]);
    }
  }

  const slug = summary.customer.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'customer';
  downloadCsv(`hisaab-ledger-${slug}.csv`, rows);
}

export function exportOutstandingCustomersCsv(summaries: CustomerSummary[]): void {
  const rows: Array<Array<string | number>> = [HEADERS];
  const dueSummaries = summaries
    .filter((s) => s.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  for (const s of dueSummaries) {
    rows.push([
      s.customer.name,
      s.customer.phone,
      s.status === 'overdue' ? 'Overdue Summary' : 'Outstanding Summary',
      formatRupeeCsv(s.balance),
      s.lastPaymentDate ? formatIndianDate(s.lastPaymentDate) : 'No payment yet',
      s.daysSinceLastPayment !== null ? `${s.daysSinceLastPayment} days since last payment` : '',
      formatRupeeCsv(s.balance),
    ]);
  }

  const today = getTodayISO();
  downloadCsv(`hisaab-outstanding-${today}.csv`, rows);
}
