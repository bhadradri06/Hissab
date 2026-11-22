export type EntryType = 'credit' | 'payment';

export type LanguageCode = 'en' | 'hi' | 'te';

export interface Customer {
  id: string;
  name: string;
  phone: string; // 10 digits
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  type: EntryType;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  screenshotDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  language: LanguageCode;
  shopName: string;
  upiId: string;
  overdueThresholdDays: number;
}

export interface CustomerSummary {
  customer: Customer;
  totalCredit: number;
  totalPayments: number;
  balance: number; // totalCredit - totalPayments
  status: 'overdue' | 'due' | 'settled' | 'advance';
  lastPaymentDate: string | null; // YYYY-MM-DD
  earliestCreditDate: string | null; // YYYY-MM-DD
  referenceDate: string | null; // lastPaymentDate || earliestCreditDate
  daysSinceLastPayment: number | null; // only meaningful when balance > 0 and referenceDate exists
  entryCount: number;
}

export interface DashboardMetrics {
  totalOutstanding: number; // sum of positive balances only
  totalCustomers: number;
  customersWithBalance: number;
  todaysCollections: number; // sum of payment entries dated today
  overdueCustomersCount: number;
  collectedLast30Days: number;
  givenLast30Days: number;
  topDebtor: CustomerSummary | null;
  oldestDue: CustomerSummary | null;
}

export type ActiveTab = 'home' | 'customers' | 'overdue' | 'settings';
