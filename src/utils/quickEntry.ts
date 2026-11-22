import type { Customer, EntryType } from '../types';
import { roundCurrency } from './ledger';

export interface ParsedQuickEntry {
  rawText: string;
  amount: number | null;
  type: EntryType;
  note: string;
  matchedCustomers: Customer[];
  selectedCustomer: Customer | null;
}

const PAYMENT_KEYWORDS = new Set([
  'paid',
  'pay',
  'payment',
  'got',
  'received',
  'receive',
  'cash',
  'upi',
  'gpay',
  'phonepe',
  'paytm',
  'bhim',
  'jama',
  'vasool',
  'settled',
  'clear',
  'cleared',
  'जमा',
  'भुगतान',
  'मिला',
  'दिए',
  'चेक',
  'చెల్లింపు',
  'ఇచ్చారు',
  'వచ్చింది',
]);

const CREDIT_KEYWORDS = new Set([
  'udhaar',
  'udhar',
  'credit',
  'gave',
  'give',
  'given',
  'due',
  'baaki',
  'baki',
  'bill',
  'khata',
  'ration',
  'उधार',
  'दिया',
  'बाकी',
  'బాకీ',
  'అప్పు',
]);

export function parseQuickEntry(rawInput: string, customers: Customer[]): ParsedQuickEntry {
  const rawText = rawInput.trim();
  if (!rawText) {
    return {
      rawText: '',
      amount: null,
      type: 'credit',
      note: '',
      matchedCustomers: [],
      selectedCustomer: null,
    };
  }

  // Extract phone match first if 10-digit token exists
  const phoneTokens: string[] = rawText.match(/\b\d{10}\b/g) ?? [];
  let phoneMatchedCustomer: Customer | null = null;
  for (const phone of phoneTokens) {
    const found = customers.find((c) => c.phone === phone);
    if (found) {
      phoneMatchedCustomer = found;
      break;
    }
  }

  // Strip currency signs and commas inside numbers before tokenizing amounts
  const cleanedForNumbers = rawText.replace(/₹/g, ' ').replace(/(\d),(\d)/g, '$1$2');
  const amountMatches: string[] = cleanedForNumbers.match(/\b\d{1,7}(?:\.\d{1,2})?\b/g) ?? [];

  let amount: number | null = null;
  for (const candidate of amountMatches) {
    // Skip 10-digit phone numbers (already excluded by {1,7}) and ensure > 0
    const val = Number(candidate);
    if (Number.isFinite(val) && val > 0 && val <= 10_000_000) {
      amount = roundCurrency(val);
      break;
    }
  }

  const tokens = rawText
    .replace(/₹/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let detectedType: EntryType = 'credit';
  let sawPayment = false;
  let sawCredit = false;

  const nonMetaTokens: string[] = [];

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/[.,!?;:]+$/g, '');
    if (PAYMENT_KEYWORDS.has(lower)) {
      sawPayment = true;
      continue;
    }
    if (CREDIT_KEYWORDS.has(lower)) {
      sawCredit = true;
      continue;
    }
    // Skip exact matched amount string
    const numericCandidate = Number(lower.replace(/,/g, ''));
    if (amount !== null && Number.isFinite(numericCandidate) && numericCandidate === amount) {
      continue;
    }
    if (phoneTokens.includes(lower)) {
      continue;
    }
    nonMetaTokens.push(token);
  }

  if (sawPayment && !sawCredit) {
    detectedType = 'payment';
  } else if (sawCredit) {
    detectedType = 'credit';
  }

  // Match customer names against remaining tokens
  let matchedCustomers: Customer[] = [];
  const usedForName = new Set<number>();

  if (phoneMatchedCustomer) {
    matchedCustomers = [phoneMatchedCustomer];
  } else if (nonMetaTokens.length > 0) {
    // Score each customer by how many tokens match their name words
    const scored = customers
      .map((customer) => {
        const custLower = customer.name.toLowerCase();
        const custWords = custLower.split(/\s+/).filter(Boolean);
        let score = 0;
        const matchedIdx: number[] = [];

        nonMetaTokens.forEach((tok, idx) => {
          const tLower = tok.toLowerCase().replace(/[.,!?;:]+$/g, '');
          if (tLower.length < 2) return;
          if (custWords.some((w) => w === tLower)) {
            score += 3;
            matchedIdx.push(idx);
          } else if (custWords.some((w) => w.startsWith(tLower)) || custLower.includes(tLower)) {
            score += 2;
            matchedIdx.push(idx);
          }
        });

        return { customer, score, matchedIdx };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const topScore = scored[0].score;
      matchedCustomers = scored.filter((s) => s.score >= topScore - 1).map((s) => s.customer);
      if (matchedCustomers.length === 1) {
        for (const idx of scored[0].matchedIdx) {
          usedForName.add(idx);
        }
      } else {
        // Still strip the common leading matched token if all candidates share it
        for (const idx of scored[0].matchedIdx) {
          usedForName.add(idx);
        }
      }
    }
  }

  const noteTokens = nonMetaTokens.filter((_, idx) => !usedForName.has(idx));
  const note = noteTokens.join(' ').trim();

  return {
    rawText,
    amount,
    type: detectedType,
    note,
    matchedCustomers,
    selectedCustomer: matchedCustomers.length === 1 ? matchedCustomers[0] : null,
  };
}
