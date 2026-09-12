/**
 * FS-2603 Data Ingestion & Normalization Layer
 * Directly integrates Delta's multi-currency conversion logic from FinancialTools.
 * Normalizes messy merchant strings, removes duplicates, pairs delayed reversals,
 * isolates joint accounts, and converts all currencies to integer paise.
 */

// Base rates matching Delta by Variance FinancialTools
export const DEFAULT_FX_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.2,
  AUD: 1.51,
  CAD: 1.37,
  SGD: 1.35,
  CHF: 0.91
};

/**
 * Converts any currency amount to Integer Paise (INR)
 * Reuses the Delta by Variance inUSD -> targetCurrency conversion logic.
 */
export function convertToPaise(amount, fromCurrency = 'INR', rates = DEFAULT_FX_RATES) {
  const amt = parseFloat(amount) || 0;
  const from = fromCurrency.toUpperCase();
  if (from === 'INR') {
    return Math.round(amt * 100);
  }

  const rateFrom = rates[from] || 1;
  const rateINR = rates['INR'] || 83.5;

  // Delta FinancialTools formula:
  // Convert from source currency to USD base, then USD to INR
  const inUSD = amt / rateFrom;
  const inINR = inUSD * rateINR;

  return Math.round(inINR * 100);
}

// Canonical merchant matcher for messy banking feeds
const MERCHANT_PATTERNS = [
  { regex: /swiggy/i, canonical: 'Swiggy' },
  { regex: /zomato/i, canonical: 'Zomato' },
  { regex: /uber/i, canonical: 'Uber' },
  { regex: /ola/i, canonical: 'Ola' },
  { regex: /amazon|amzn/i, canonical: 'Amazon' },
  { regex: /flipkart/i, canonical: 'Flipkart' },
  { regex: /netflix/i, canonical: 'Netflix' },
  { regex: /spotify/i, canonical: 'Spotify' },
  { regex: /rent|landlord|housing/i, canonical: 'House Rent' },
  { regex: /salary|payroll|direct\s*dep/i, canonical: 'Salary Credit' },
  { regex: /emi|loan|bajaj|hdfc\s*emi/i, canonical: 'Loan EMI' }
];

export function normalizeMerchantString(rawString = '') {
  for (const pattern of MERCHANT_PATTERNS) {
    if (pattern.regex.test(rawString)) {
      return pattern.canonical;
    }
  }
  return rawString
    .replace(/^upi[/-]/i, '')
    .replace(/[/-]\d+.*$/, '')
    .trim() || 'Unknown Merchant';
}

/**
 * Normalizes raw transaction batches:
 * 1. Joint-Account Isolation (drops secondary holder's transactions)
 * 2. Deduplication (idempotency key tracking)
 * 3. Reversal Matching (links refunds to original debits)
 * 4. Multi-Currency Conversion (stores everything as integer paise)
 */
export function normalizeTransactionBatch(rawTransactions = [], primaryUserId = 'user_primary', customRates = DEFAULT_FX_RATES) {
  const seenTx = new Set();
  const normalized = [];
  const debitRegistry = new Map();

  for (const raw of rawTransactions) {
    // 1. Joint account check: Ignore non-primary co-holder spending
    if (raw.holderId && raw.holderId !== primaryUserId) {
      continue;
    }

    // 2. Duplicate suppression
    const txKey = raw.txId || `${raw.date}_${raw.rawDescription}_${raw.amount}`;
    if (seenTx.has(txKey)) {
      continue;
    }
    seenTx.add(txKey);

    const currency = (raw.currency || 'INR').toUpperCase();
    const amountPaise = convertToPaise(raw.amount, currency, customRates);
    const merchant = normalizeMerchantString(raw.rawDescription || raw.description);
    const isReversal = /reversal|refund/i.test(raw.rawDescription || '') || raw.isReversal === true;

    const entry = {
      id: txKey,
      date: raw.date ? new Date(raw.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      rawDescription: raw.rawDescription,
      merchant,
      currency: 'INR',
      amountPaise,
      isReversal,
      matchedReversalId: null
    };

    // 3. Match delayed reversal / refund to previous debit
    const matchKey = `${merchant}_${Math.abs(amountPaise)}`;
    if (isReversal) {
      if (debitRegistry.has(matchKey)) {
        const originalDebit = debitRegistry.get(matchKey);
        entry.matchedReversalId = originalDebit.id;
        originalDebit.matchedReversalId = entry.id;
      }
    } else {
      debitRegistry.set(matchKey, entry);
    }

    normalized.push(entry);
  }

  return normalized;
}