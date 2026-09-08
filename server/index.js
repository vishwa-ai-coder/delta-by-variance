import express from "express";
import cors from "cors";
import multer from "multer";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

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
    category TEXT,
    account TEXT,
    fingerprint TEXT UNIQUE
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
`);

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

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use("/uploads", express.static(UPLOADS));

const upload = multer({ dest: UPLOADS });

app.get("/api/state", async (req, res) => {
  const txs = await db.all("SELECT * FROM transactions ORDER BY date DESC");
  const docs = await db.all("SELECT * FROM documents ORDER BY created_at DESC");
  const settings = {};
  for (const k of Object.keys(defaults)) {
    settings[k] = await getSetting(k, defaults[k]);
  }
  res.json({ transactions: txs, documents: docs, settings });
});

app.post("/api/transactions", async (req, res) => {
  const t = req.body;
  const fp = `${t.date}|${t.merchant.toLowerCase().trim()}|${Number(t.amount).toFixed(2)}|${t.account}`;
  try {
    await db.run(
      "INSERT INTO transactions (id, date, merchant, amount, category, account, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [t.id || crypto.randomUUID(), t.date, t.merchant, t.amount, t.category, t.account, fp]
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
  await db.exec("DELETE FROM transactions; DELETE FROM settings; DELETE FROM documents;");
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