import Papa from "papaparse";
import { supabase } from "./supabaseClient";

/**
 * Normalizes headers, parses currency floats to integer paise, 
 * generates unique fingerprints, and writes directly to Supabase.
 * Compatible with Supabase schema expecting 'title' and 'amount'.
 */
export async function parseAndIngestBankCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawRows = results.data;
          const normalizedTransactions = [];

          for (const row of rawRows) {
            // Flexible column resolution for diverse bank CSV formats
            const date = row["Date"] || row["date"] || row["Txn Date"] || new Date().toISOString().split("T")[0];
            const merchant = row["Description"] || row["Merchant"] || row["Narration"] || row["Details"] || "Direct Outflow";
            
            // Resolve amount (handles debits/credits or unified amount fields)
            let rawAmount = 0;
            if (row["Amount"] !== undefined && row["Amount"] !== null && row["Amount"] !== "") {
              rawAmount = parseFloat(String(row["Amount"]).replace(/[^0-9.-]+/g, "")) || 0;
            } else if (row["amount"] !== undefined && row["amount"] !== null && row["amount"] !== "") {
              rawAmount = parseFloat(String(row["amount"]).replace(/[^0-9.-]+/g, "")) || 0;
            } else if (row["Debit"] || row["debit"]) {
              rawAmount = parseFloat(String(row["Debit"] || row["debit"]).replace(/[^0-9.-]+/g, "")) || 0;
            } else if (row["Credit"] || row["credit"]) {
              rawAmount = -(parseFloat(String(row["Credit"] || row["credit"]).replace(/[^0-9.-]+/g, "")) || 0);
            }

            if (rawAmount === 0 && !row["Amount"] && !row["amount"]) continue;

            const amountPaise = Math.round(Math.abs(rawAmount) * 100);
            const type = rawAmount < 0 ? "income" : "expense";
            const category = row["Category"] || row["category"] || "General";
            
            // FS-2603 deterministic fingerprint: date + merchant + amountPaise
            const cleanMerchant = merchant.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
            const fingerprint = `${date}_${cleanMerchant}_${amountPaise}`;

            normalizedTransactions.push({
              title: merchant, // Maps to existing 'title' column in Supabase
              merchant: merchant,
              amount: Math.abs(rawAmount),
              amount_paise: amountPaise,
              category,
              type,
              date,
              fingerprint
            });
          }

          if (normalizedTransactions.length === 0) {
            return resolve({ count: 0, message: "No valid transaction rows found." });
          }

          // Insert transactions into Supabase
          const { data, error } = await supabase
            .from("transactions")
            .upsert(normalizedTransactions, { onConflict: "fingerprint", ignoreDuplicates: true })
            .select();

          if (error) {
            // Fallback plain insert if unique constraint on fingerprint is absent in DB
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("transactions")
              .insert(normalizedTransactions)
              .select();

            if (fallbackError) throw fallbackError;
            return resolve({
              success: true,
              count: fallbackData ? fallbackData.length : normalizedTransactions.length,
              records: normalizedTransactions
            });
          }

          resolve({
            success: true,
            count: data ? data.length : normalizedTransactions.length,
            records: normalizedTransactions
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
}