import type { AppSettings, Customer } from '../types';
import { formatINR } from './ledger';

export function buildUpiPaymentLink(
  upiId: string,
  shopName: string,
  amount: number
): string | null {
  const cleanUpi = upiId.trim();
  if (!cleanUpi || !cleanUpi.includes('@') || amount <= 0) {
    return null;
  }
  const cleanShop = shopName.trim() || 'Our Shop';
  const params = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanShop,
    am: amount.toFixed(2).replace(/\.00$/, ''),
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
}

export function buildReminderMessage(
  customer: Customer,
  outstandingBalance: number,
  settings: AppSettings
): { message: string; upiLink: string | null } {
  const shopLabel = settings.shopName.trim() || 'our shop';
  const formattedAmount = formatINR(Math.max(0, outstandingBalance));
  const upiLink = buildUpiPaymentLink(
    settings.upiId,
    settings.shopName,
    Math.max(0, outstandingBalance)
  );

  const lines = [
    `Hello ${customer.name},`,
    '',
    `This is a friendly reminder that your outstanding balance at ${shopLabel} is ${formattedAmount}.`,
  ];

  if (upiLink) {
    lines.push('', `Pay easily via UPI: ${upiLink}`);
  }

  lines.push(
    '',
    'Kindly clear the pending amount at your convenience.',
    '',
    'Thank you!'
  );

  return {
    message: lines.join('\n'),
    upiLink,
  };
}

export function buildWhatsAppUrl(phone10Digits: string, message: string): string {
  const cleanPhone = phone10Digits.replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}
