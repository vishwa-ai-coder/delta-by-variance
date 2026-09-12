# DELTA by VARIANCE (FS-2603)
> Institutional liquidity engine and obligation-safe automated investing platform.

## 3-Command Run
```bash
npm install
node server/index.js &
npm run dev
```
*Access the live dashboard locally at `http://localhost:5173`.*

---

## Live Deployment & Verification
- **Live Production URL:** [https://delta-by-variance.vercel.app](https://delta-by-variance.vercel.app)
- **Problem Statement ID:** FS-2603 (Wealth & Planning)
- **Core Architecture:** Deterministic 64-bit integer paise ledger, client-edge Box-Muller Monte Carlo simulation (1,000 runs, 60-day horizon), and context-aware pre-trade solvency guard.

---

## Observability & Diagnostic Endpoints
- `/healthz` — System health and uptime verification
- `/metrics` — Real-time telemetry: active obligations, Monte Carlo batch iterations, and zero-drift ledger variance