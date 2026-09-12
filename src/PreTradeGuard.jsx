import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PreTradeGuard() {
  const [forecastData, setForecastData] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [investInput, setInvestInput] = useState(10000);
  const [balanceInput, setBalanceInput] = useState(50000);
  const [guardResult, setGuardResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  // 1. Fetch initial 60-day forecast projection
  useEffect(() => {
    fetch(`/api/forecast?balancePaise=${balanceInput * 100}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const chartPoints = data.forecast.map((f) => ({
            day: `D+${f.day}`,
            p10: f.p10Paise / 100,
            p50: f.p50Paise / 100,
            p90: f.p90Paise / 100
          }));
          setForecastData(chartPoints);
          setObligations(data.obligations || []);
        }
      })
      .catch((err) => console.error("Failed to load forecast:", err));
  }, [balanceInput]);

  // 2. Evaluate trade against Pre-Trade Guard
  const handleCheckTrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pre-trade-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedInvestINR: Number(investInput),
          balanceINR: Number(balanceInput)
        })
      });
      const data = await res.json();
      setGuardResult(data);
    } catch (err) {
      console.error("Guard check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🛡️</span>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1.15rem" }}>Pre-Trade Obligation Guard & 60-Day Horizon</h3>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Deterministic Box-Muller Monte Carlo simulation protecting fixed obligations against capital lockup.
          </p>
        </div>
        <span style={{ background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
          Integer Paise Engine
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "1.5rem" }}>
        {/* Left: Input & Guard Verdict */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div className="calc-input-group">
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Available Cash Pool (₹)</label>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(Number(e.target.value))}
              className="inline-edit-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "1rem" }}
            />
          </div>

          <div className="calc-input-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Proposed Trade Allocation</label>
              <b style={{ color: "#00f0ff" }}>{money(investInput)}</b>
            </div>
            <input
              type="range"
              min="1000"
              max={balanceInput > 1000 ? balanceInput : 100000}
              step="1000"
              value={investInput}
              onChange={(e) => setInvestInput(Number(e.target.value))}
              className="calc-slider-input"
            />
          </div>

          <button
            onClick={handleCheckTrade}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #00f0ff, #0070f3)",
              border: "none",
              color: "#050811",
              fontWeight: "700",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "opacity 0.2s ease"
            }}
          >
            {loading ? "Running Monte Carlo..." : "Run Pre-Trade Evaluation"}
          </button>

          {/* Verdict Banner */}
          {guardResult && (
            <div
              style={{
                background: guardResult.approved ? "rgba(0, 230, 118, 0.08)" : "rgba(255, 23, 68, 0.08)",
                border: `1px solid ${guardResult.approved ? "#00e676" : "#ff1744"}`,
                borderRadius: "8px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>
                  Guard Status
                </span>
                <span
                  style={{
                    color: guardResult.approved ? "#00e676" : "#ff1744",
                    fontWeight: "800",
                    fontSize: "0.85rem"
                  }}
                >
                  {guardResult.approved ? "PASSED (SOLVENT)" : "REJECTED (BREACH)"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#fff" }}>{guardResult.reason}</p>
              <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Max Solvency Ceiling: <strong style={{ color: "#00f0ff" }}>{money(guardResult.safeMaxInvestINR)}</strong>
              </div>
            </div>
          )}

          {/* Obligations Schedule */}
          <div style={{ background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "10px 12px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Active Hard Obligations (60 Days)
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {obligations.map((ob, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "#fff" }}>{ob.name} (Day +{ob.dueDayOffset})</span>
                  <span style={{ color: "#ffab00", fontWeight: "600" }}>{money(ob.amountPaise / 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 60-Day P10 / P50 / P90 Cone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Probabilistic Liquidity Bounds (P10 Worst-Case / P50 Median / P90 Optimistic)
            </span>
          </div>

          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} interval={9} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#090e1a", borderColor: "var(--card-border)", borderRadius: "8px", fontSize: "0.8rem" }}
                  formatter={(v, name) => [money(v), name.toUpperCase()]}
                />
                <Area type="monotone" dataKey="p90" stroke="#00f0ff" fill="url(#p90Grad)" strokeWidth={1.5} name="p90" />
                <Area type="monotone" dataKey="p50" stroke="#38bdf8" fill="transparent" strokeWidth={2} strokeDasharray="4 4" name="p50" />
                <Area type="monotone" dataKey="p10" stroke="#a855f7" fill="url(#p10Grad)" strokeWidth={1.5} name="p10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}