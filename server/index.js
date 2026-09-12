import express from "express";
import cors from "cors";
import multer from "multer";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Import FS-2603 Core Engines
import { generate60DayForecast, evaluatePreTradeGuard } from "./forecastEngine.js";
import { normalizeTransactionBatch, convertToPaise } from "./normalizationEngine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const UPLOADS = path.join(ROOT, "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });

const db = await open({
  filename: path.join(ROOT, "ledgerly.db"),
  driver: sqlite3.Database
});

await db.exec("PRAGMA journal_mode = WAL;");

await db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    merchant TEXT,
    amount REAL,
    amount_paise INTEGER,
    category TEXT,
    account TEXT,
    fingerprint TEXT UNIQUE,
    is_reversal INTEGER DEFAULT 0,
    matched_reversal_id TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT,
    path TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS obligations (
    id TEXT PRIMARY KEY,
    name TEXT,
    amount_paise INTEGER,
    due_day_offset INTEGER,
    category TEXT
  );
`);

// Safe column migrations for existing SQLite databases
const tableCols = (await db.all("PRAGMA table_info(transactions);")).map(c => c.name);

if (!tableCols.includes("amount_paise")) {
  await db.exec("ALTER TABLE transactions ADD COLUMN amount_paise INTEGER DEFAULT 0;");
}
if (!tableCols.includes("is_reversal")) {
  await db.exec("ALTER TABLE transactions ADD COLUMN is_reversal INTEGER DEFAULT 0;");
}
if (!tableCols.includes("matched_reversal_id")) {
  await db.exec("ALTER TABLE transactions ADD COLUMN matched_reversal_id TEXT;");
}

// Backfill amount_paise from existing amounts
await db.exec("UPDATE transactions SET amount_paise = CAST(ROUND(amount * 100) AS INTEGER) WHERE amount_paise IS NULL OR amount_paise = 0;");

async function getSetting(key, fallback) {
  const row = await db.get("SELECT value FROM settings WHERE key = ?", [key]);
  return row ? JSON.parse(row.value) : fallback;
}

async function setSetting(key, value) {
  await db.run(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, JSON.stringify(value)]
  );
}

const defaults = {
  categories: ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Income", "Other"],
  accounts: ["Main Checking", "Everyday Visa", "Savings"],
  tags: ["coffee", "work", "recurring"],
  budgets: [],
  goals: [],
  recurring: [],
  subscriptions: []
};

for (const [k, v] of Object.entries(defaults)) {
  const row = await db.get("SELECT 1 FROM settings WHERE key = ?", [k]);
  if (!row) await setSetting(k, v);
}

// Seed baseline obligations if empty (Rent, EMI, SIP commitments)
const existingObligations = await db.all("SELECT * FROM obligations");
if (existingObligations.length === 0) {
  await db.run("INSERT INTO obligations (id, name, amount_paise, due_day_offset, category) VALUES (?, ?, ?, ?, ?)", [
    crypto.randomUUID(), "Apartment Rent", 2500000, 5, "Housing" // ₹25,000 on Day 5
  ]);
  await db.run("INSERT INTO obligations (id, name, amount_paise, due_day_offset, category) VALUES (?, ?, ?, ?, ?)", [
    crypto.randomUUID(), "Index Fund SIP", 1500000, 10, "Investment" // ₹15,000 on Day 10
  ]);
  await db.run("INSERT INTO obligations (id, name, amount_paise, due_day_offset, category) VALUES (?, ?, ?, ?, ?)", [
    crypto.randomUUID(), "Car Loan EMI", 1200000, 20, "Utilities" // ₹12,000 on Day 20
  ]);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use("/uploads", express.static(UPLOADS));

const upload = multer({ dest: UPLOADS });

// Existing state endpoint + obligations
app.get("/api/state", async (req, res) => {
  const txs = await db.all("SELECT * FROM transactions ORDER BY date DESC");
  const docs = await db.all("SELECT * FROM documents ORDER BY created_at DESC");
  const obligations = await db.all("SELECT * FROM obligations ORDER BY due_day_offset ASC");
  const settings = {};
  for (const k of Object.keys(defaults)) {
    settings[k] = await getSetting(k, defaults[k]);
  }
  res.json({ transactions: txs, documents: docs, settings, obligations });
});

// Normalized Ingestion Endpoint (FS-2603 Requirement)
app.post("/api/ingest", async (req, res) => {
  const { rawTransactions = [], primaryUserId = "user_primary" } = req.body;
  try {
    const cleanedBatch = normalizeTransactionBatch(rawTransactions, primaryUserId);
    let insertedCount = 0;

    for (const t of cleanedBatch) {
      const fp = `${t.date}|${t.merchant.toLowerCase().trim()}|${t.amountPaise}|INR`;
      try {
        await db.run(
          `INSERT INTO transactions (id, date, merchant, amount, amount_paise, category, account, fingerprint, is_reversal, matched_reversal_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id || crypto.randomUUID(),
            t.date,
            t.merchant,
            t.amountPaise / 100,
            t.amountPaise,
            "Uncategorized",
            "Main Checking",
            fp,
            t.isReversal ? 1 : 0,
            t.matchedReversalId
          ]
        );
        insertedCount++;
      } catch (err) {
        // Skip duplicate fingerprints silently during batch ingestion
      }
    }

    res.json({
      success: true,
      rawCount: rawTransactions.length,
      cleanedCount: cleanedBatch.length,
      insertedCount,
      transactions: cleanedBatch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Probabilistic Cashflow Forecast (P10 / P50 / P90)
app.get("/api/forecast", async (req, res) => {
  try {
    const txs = await db.all("SELECT date, amount_paise as amount FROM transactions");
    const obligations = await db.all("SELECT amount_paise as amountPaise, due_day_offset as dueDayOffset, name FROM obligations");
    
    // Default current balance: ₹50,000 in paise (or calculated from ledger balance)
    const currentBalancePaise = Number(req.query.balancePaise) || 5000000;

    const forecast = generate60DayForecast({
      currentBalancePaise,
      historicalTransactions: txs,
      obligations
    });

    res.json({
      success: true,
      currentBalancePaise,
      obligations,
      forecast
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pre-Trade Obligation Guard
app.post("/api/pre-trade-check", async (req, res) => {
  try {
    const { proposedInvestINR = 0, balanceINR = 50000 } = req.body;
    const proposedInvestPaise = Math.round(Number(proposedInvestINR) * 100);
    const currentBalancePaise = Math.round(Number(balanceINR) * 100);

    const txs = await db.all("SELECT date, amount_paise as amount FROM transactions");
    const obligations = await db.all("SELECT amount_paise as amountPaise, due_day_offset as dueDayOffset FROM obligations");

    const forecast = generate60DayForecast({
      currentBalancePaise,
      historicalTransactions: txs,
      obligations
    });

    const guardResult = evaluatePreTradeGuard({
      proposedInvestPaise,
      currentBalancePaise,
      forecast,
      obligations
    });

    res.json({
      ...guardResult,
      proposedInvestINR: Number(proposedInvestINR),
      safeMaxInvestINR: guardResult.safeMaxInvestPaise / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  const t = req.body;
  const amountPaise = Math.round(Number(t.amount || 0) * 100);
  const fp = `${t.date}|${(t.merchant || "").toLowerCase().trim()}|${Number(t.amount).toFixed(2)}|${t.account}`;
  try {
    await db.run(
      "INSERT INTO transactions (id, date, merchant, amount, amount_paise, category, account, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [t.id || crypto.randomUUID(), t.date, t.merchant, t.amount, amountPaise, t.category, t.account, fp]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Duplicate transaction" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/preferences", async (req, res) => {
  for (const [k, v] of Object.entries(req.body)) {
    await setSetting(k, v);
  }
  res.json({ success: true });
});

app.post("/api/documents", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const doc = {
    id: crypto.randomUUID(),
    filename: req.file.originalname,
    path: req.file.filename,
    created_at: new Date().toISOString()
  };
  await db.run(
    "INSERT INTO documents (id, filename, path, created_at) VALUES (?, ?, ?, ?)",
    [doc.id, doc.filename, doc.path, doc.created_at]
  );
  res.json(doc);
});

app.post("/api/wipe", async (req, res) => {
  if (req.body.confirm !== "DELETE ALL LEDGERLY DATA") {
    return res.status(400).json({ error: "Invalid confirmation string" });
  }
  await db.exec("DELETE FROM transactions; DELETE FROM settings; DELETE FROM documents; DELETE FROM obligations;");
  for (const [k, v] of Object.entries(defaults)) {
    await setSetting(k, v);
  }
  res.json({ success: true });
});

app.get("/api/drive-sync", (req, res) => {
  res.json({ status: "idle", lastSync: new Date().toISOString() });
});

app.listen(3001, () => {
  console.log("Ledgerly API running at http://localhost:3001");
});