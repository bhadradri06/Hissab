import type { Customer, CustomerSummary, DashboardMetrics, LedgerEntry } from '../types';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function formatIndianDate(isoDate: string | null | undefined): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '—';
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(abs);
  return safe < 0 ? `-${formatted}` : formatted;
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  if (!isValidISODate(fromISO) || !isValidISODate(toISO)) return 0;
  const [fy, fm, fd] = fromISO.split('-').map(Number);
  const [ty, tm, td] = toISO.split('-').map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  const diff = Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sortEntriesNewestFirst(entries: LedgerEntry[]): LedgerEntry[] {
  return [...entries].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function computeCustomerSummary(
  customer: Customer,
  customerEntries: LedgerEntry[],
  overdueThresholdDays = 7,
  todayISO = getTodayISO()
): CustomerSummary {
  let totalCredit = 0;
  let totalPayments = 0;
  let lastPaymentDate: string | null = null;
  let earliestCreditDate: string | null = null;

  for (const entry of customerEntries) {
    if (entry.type === 'credit') {
      totalCredit += entry.amount;
      if (!earliestCreditDate || entry.date < earliestCreditDate) {
        earliestCreditDate = entry.date;
      }
    } else if (entry.type === 'payment') {
      totalPayments += entry.amount;
      if (!lastPaymentDate || entry.date > lastPaymentDate) {
        lastPaymentDate = entry.date;
      }
    }
  }

  totalCredit = roundCurrency(totalCredit);
  totalPayments = roundCurrency(totalPayments);
  const balance = roundCurrency(totalCredit - totalPayments);

  const referenceDate = lastPaymentDate ?? earliestCreditDate;
  let daysSinceLastPayment: number | null = null;

  if (balance > 0 && referenceDate) {
    daysSinceLastPayment = daysBetweenISO(referenceDate, todayISO);
  } else if (lastPaymentDate) {
    daysSinceLastPayment = daysBetweenISO(lastPaymentDate, todayISO);
  }

  let status: CustomerSummary['status'];
  if (balance < 0) {
    status = 'advance';
  } else if (balance === 0) {
    status = 'settled';
  } else if (daysSinceLastPayment !== null && daysSinceLastPayment >= overdueThresholdDays) {
    status = 'overdue';
  } else {
    status = 'due';
  }

  return {
    customer,
    totalCredit,
    totalPayments,
    balance,
    status,
    lastPaymentDate,
    earliestCreditDate,
    referenceDate,
    daysSinceLastPayment,
    entryCount: customerEntries.length,
  };
}

export function computeAllSummaries(
  customers: Customer[],
  entries: LedgerEntry[],
  overdueThresholdDays = 7
): CustomerSummary[] {
  const todayISO = getTodayISO();
  const entriesByCustomer = new Map<string, LedgerEntry[]>();

  for (const entry of entries) {
    const list = entriesByCustomer.get(entry.customerId);
    if (list) {
      list.push(entry);
    } else {
      entriesByCustomer.set(entry.customerId, [entry]);
    }
  }

  return customers.map((customer) =>
    computeCustomerSummary(
      customer,
      entriesByCustomer.get(customer.id) ?? [],
      overdueThresholdDays,
      todayISO
    )
  );
}

export function computeDashboardMetrics(
  summaries: CustomerSummary[],
  entries: LedgerEntry[],
  todayISO = getTodayISO()
): DashboardMetrics {
  let totalOutstanding = 0;
  let overdueCustomersCount = 0;

  for (const s of summaries) {
    if (s.balance > 0) {
      totalOutstanding += s.balance;
    }
    if (s.status === 'overdue') {
      overdueCustomersCount += 1;
    }
  }

  let todaysCollections = 0;
  for (const e of entries) {
    if (e.type === 'payment' && e.date === todayISO) {
      todaysCollections += e.amount;
    }
  }

  return {
    totalOutstanding: roundCurrency(totalOutstanding),
    totalCustomers: summaries.length,
    todaysCollections: roundCurrency(todaysCollections),
    overdueCustomersCount,
  };
}
