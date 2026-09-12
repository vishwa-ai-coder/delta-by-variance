import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Shield, ShieldAlert, CheckCircle2, AlertCircle, Calendar, Activity, Info } from "lucide-react";

export default function PreTradeGuard() {
  const [forecastData, setForecastData] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [investInput, setInvestInput] = useState(10000);
  const [balanceInput, setBalanceInput] = useState(69000);
  const [guardResult, setGuardResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

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
    <div className="card glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1rem" }}>
      
      {/* 1. Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Shield size={24} color="#00f0ff" style={{ filter: "drop-shadow(0 0 8px rgba(0,240,255,0.5))" }} />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1.25rem", fontWeight: "700", letterSpacing: "-0.5px" }}>
              Pre-Trade Obligation Guard
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={14} /> 60-Day Box-Muller Monte Carlo Liquidity Projection
          </p>
        </div>
        <div style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", color: "#00f0ff", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Integer Paise Engine</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2.5rem" }}>
        
        {/* LEFT COLUMN: Controls & Verdict */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Inputs */}
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>
                Available Cash Pool
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "12px", color: "var(--text-muted)", fontSize: "1.1rem" }}>₹</span>
                <input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(Number(e.target.value))}
                  style={{ width: "100%", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "10px 12px 10px 28px", color: "#fff", fontSize: "1.1rem", outline: "none", fontFamily: "monospace" }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "600" }}>Proposed Allocation</label>
                <b style={{ color: "#00f0ff", fontSize: "1rem" }}>{money(investInput)}</b>
              </div>
              <input
                type="range"
                min="1000"
                max={balanceInput > 1000 ? balanceInput : 100000}
                step="1000"
                value={investInput}
                onChange={(e) => setInvestInput(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#00f0ff", cursor: "pointer" }}
              />
            </div>
            
            <button
              onClick={handleCheckTrade}
              disabled={loading}
              style={{ background: loading ? "#1e293b" : "linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)", color: loading ? "var(--text-muted)" : "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s ease", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", boxShadow: loading ? "none" : "0 4px 12px rgba(0, 240, 255, 0.2)" }}
            >
              {loading ? <Activity size={18} className="spin" /> : <Shield size={18} />}
              {loading ? "Running Monte Carlo..." : "Evaluate Trade Safety"}
            </button>
          </div>

          {/* Dynamic Verdict Card */}
          {guardResult && (
            <div style={{ background: guardResult.approved ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)", border: `1px solid ${guardResult.approved ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, borderRadius: "12px", padding: "1.25rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: guardResult.approved ? "#10b981" : "#ef4444" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  {guardResult.approved ? <CheckCircle2 size={14} color="#10b981"/> : <AlertCircle size={14} color="#ef4444"/>}
                  Verification Status
                </span>
                <span style={{ color: guardResult.approved ? "#10b981" : "#ef4444", fontWeight: "800", fontSize: "0.85rem", background: guardResult.approved ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "6px" }}>
                  {guardResult.approved ? "PASSED (SOLVENT)" : "REJECTED (BREACH)"}
                </span>
              </div>
              
              <p style={{ margin: "8px 0", fontSize: "0.85rem", color: "#e2e8f0", lineHeight: "1.5" }}>
                {guardResult.reason}
              </p>
              
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Safe Solvency Ceiling</span>
                <strong style={{ color: "#fff", fontSize: "1.1rem" }}>{money(guardResult.safeMaxInvestINR)}</strong>
              </div>
            </div>
          )}

          {/* Obligations Schedule List */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} /> Locked Obligations
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {obligations.map((ob, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffab00" }} />
                    <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{ob.name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", background: "#090e1a", padding: "2px 6px", borderRadius: "4px" }}>D+{ob.dueDayOffset}</span>
                  </div>
                  <span style={{ color: "#ffab00", fontWeight: "700", fontSize: "0.9rem" }}>{money(ob.amountPaise / 100)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Forecast Chart */}
        <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.15)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={16} color="#a855f7" /> Liquidity Horizon (60 Days)
            </span>
            <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00f0ff" }}/> P90 (Opt)</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }}/> P50 (Med)</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }}/> P10 (Worst)</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} interval={9} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "0.8rem", boxShadow: "0 8px 16px rgba(0,0,0,0.4)" }}
                  itemStyle={{ fontSize: "0.85rem", fontWeight: "600" }}
                  formatter={(v, name) => [money(v), name.toUpperCase()]}
                  labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                <Area type="stepAfter" dataKey="p90" stroke="#00f0ff" fill="url(#p90Grad)" strokeWidth={2} name="p90" />
                <Area type="stepAfter" dataKey="p50" stroke="#38bdf8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="p50" />
                <Area type="stepAfter" dataKey="p10" stroke="#a855f7" fill="url(#p10Grad)" strokeWidth={2} name="p10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}