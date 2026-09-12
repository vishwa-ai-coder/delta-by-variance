import React, { useEffect, useMemo, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, ReceiptText, Repeat2, CreditCard, WalletCards, Target,
  Files, ListChecks, Settings, Settings2, Upload, Plus, Search, ChevronDown, Trash2,
  Tag, RefreshCw, X, Check, AlertCircle, Menu, Save, HardDrive, CircleDollarSign, 
  ArrowRightLeft, Calculator, Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  Download, Edit3, FileSpreadsheet, LineChart, Landmark, Shield, Globe, BookOpen, Bookmark, CalendarDays, CheckCircle, Scale
} from "lucide-react";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import "./styles.css";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import PreTradeGuard from './PreTradeGuard';

const money = (n) => {
  const num = Number(n) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const today=()=>new Date().toISOString().slice(0,10);
const PERIODS=[["all-time","All time"],["this-month","This month"],["last-month","Last month"],["last-3-months","Last 3 months"],["last-6-months","Last 6 months"],["this-year","This year"]];

async function api(url,opts={}) {
  const r=await fetch(url,{headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Request failed");
  return data;
}

const NAV_PILLARS = [
  {
    title: "OVERVIEW",
    items: [
      ["Dashboard", LayoutDashboard],
      ["Net Worth", PieChartIcon],
      ["Cash Flow", ArrowRightLeft],
      ["Insights", TrendingUp]
    ]
  },
  {
    title: "MONEY",
    items: [
      ["Transactions", ReceiptText],
      ["Budgets", WalletCards],
      ["Recurring", Repeat2],
      ["Subscriptions", CreditCard],
      ["Calendar", CalendarDays]
    ]
  },
  {
    title: "WEALTH",
    items: [
      ["Investments", LineChart],
      ["Assets", Landmark],
      ["Liabilities", CreditCard],
      ["Goals", Target],
      ["Insurance", Shield]
    ]
  },
  {
    title: "MARKETS",
    items: [
      ["Markets", Globe]
    ]
  },
  {
    title: "TOOLS & LEARN",
    items: [
      ["Tools", Calculator],
      ["Academy", BookOpen],
      ["Glossary", Bookmark],
      ["Tax Centre", FileSpreadsheet],
      ["Documents", Files]
    ]
  },
  {
    title: "SYSTEM",
    items: [
      ["Rules", ListChecks],
      ["Settings", Settings]
    ]
  }
];

function PlaceholderPage({ title }) {
  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
      <div style={{ background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "50%", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto", boxShadow: "0 0 20px rgba(0, 240, 255, 0.1)" }}>
        <span style={{ fontSize: "2rem" }}>🚧</span>
      </div>
      <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "0 0 8px 0" }}>{title} Module</h2>
      <p style={{ maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
        This section is currently under construction. It will soon serve as a dedicated module in your financial command center.
      </p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState("expense");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    onSave(title.trim(), parseFloat(amount), category, type);
    setTitle("");
    setAmount("");
    setCategory("General");
    setType("expense");
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 8, 17, 0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="card glass-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "1.75rem",
          borderRadius: "14px",
          border: "1px solid rgba(0, 240, 255, 0.25)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
          background: "linear-gradient(145deg, #0b1120, #070a13)",
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--card-border)" }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#fff", fontWeight: "700" }}>Log Transaction Entry</h3>
          <button 
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.1rem", cursor: "pointer", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Income vs Expense Segmented Control */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "6px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Transaction Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setType("expense")}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  border: "1px solid var(--card-border)",
                  background: type === "expense" ? "rgba(255, 82, 82, 0.15)" : "transparent",
                  color: type === "expense" ? "#ff5252" : "var(--text-muted)"
                }}
              >
                Debit (Expense)
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  border: "1px solid var(--card-border)",
                  background: type === "income" ? "rgba(0, 230, 118, 0.15)" : "transparent",
                  color: type === "income" ? "#00e676" : "var(--text-muted)"
                }}
              >
                Credit (Income)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "4px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Swiggy, Tech Salary, Rent"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "#090e1a", color: "#fff", outline: "none", fontSize: "0.85rem", boxSizing: "border-box" }}
            />
          </div>

          {/* Amount & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "4px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount (₹)</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "#090e1a", color: "#fff", outline: "none", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "4px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "#090e1a", color: "#fff", outline: "none", fontSize: "0.85rem", boxSizing: "border-box" }}
              >
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Investment">Investment</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "0.82rem", fontWeight: "700" }}
            >
              Save Entry
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Empty({text,action,children}){return <div className="empty">{children||<CircleDollarSign size={28}/>}<strong>{text}</strong>{action}</div>}
function Button({children,primary=false,...p}){return <button className={`btn ${primary?"primary":""}`} {...p}>{children}</button>}
function Card({children,className=""}){return <section className={`card ${className}`}>{children}</section>}

function AddSubscriptionModal({ isOpen, onClose, onSave, categories = [] }) {
  if (!isOpen) return null;

  const defaultCategories = ["Food", "Housing", "Utilities", "Transport", "Entertainment", "Salary", "General", "Sport", "Shopping", "Health"];
  const categoryList = categories.length > 0 ? categories : defaultCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("subTitle");
    const amount = formData.get("subAmount");
    const category = formData.get("subCategory");
    const cycle = formData.get("subCycle");

    if (!title || !amount) return;
    onSave(title, parseFloat(amount), category, cycle);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#0f172a", padding: "2rem", borderRadius: "12px",
        width: "100%", maxWidth: "400px", border: "1px solid #334155", color: "#fff",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Add New Subscription</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Service Name</label>
            <input
              name="subTitle"
              type="text"
              required
              placeholder="e.g. Netflix, Spotify"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Amount (₹)</label>
            <input
              name="subAmount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Category</label>
              <select
                name="subCategory"
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Cycle</label>
              <select
                name="subCycle"
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "10px", backgroundColor: "#334155", color: "#fff", border: "none",
                borderRadius: "6px", fontWeight: "600", cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none",
                borderRadius: "6px", fontWeight: "600", cursor: "pointer"
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddBudgetModal({ isOpen, onClose, onSave, categories = [] }) {
  if (!isOpen) return null;

  const defaultCategories = ["Food", "Housing", "Utilities", "Transport", "Entertainment", "Salary", "General", "Sport", "Shopping", "Health"];
  const categoryList = categories.length > 0 ? categories : defaultCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = formData.get("budgetCategory");
    const limit = formData.get("budgetLimit");

    if (!category || !limit) return;
    onSave(category, parseFloat(limit));
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#0f172a", padding: "2rem", borderRadius: "12px",
        width: "100%", maxWidth: "400px", border: "1px solid #334155", color: "#fff",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Create Budget</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Category</label>
            <select
              name="budgetCategory"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}
            >
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Monthly limit (₹)</label>
            <input
              name="budgetLimit"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "10px", backgroundColor: "#334155", color: "#fff", border: "none",
                borderRadius: "6px", fontWeight: "600", cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none",
                borderRadius: "6px", fontWeight: "600", cursor: "pointer"
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddGoalModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSave(
      fd.get("title"),
      parseFloat(fd.get("target_amount")),
      fd.get("target_date") || null
    );
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div className="glass-card" style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid #334155", color: "#fff", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Create a Goal</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Goal Name</label>
            <input name="title" type="text" required placeholder="e.g. New Car, Vacation" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Target Amount (₹)</label>
              <input name="target_amount" type="number" step="0.01" required placeholder="0.00" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Target Date (Optional)</label>
              <input name="target_date" type="date" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Goals({ goals = [], updateGoal, deleteGoal, openGoalModal, setToast }) {
  const [fundingGoalId, setFundingGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState("");

  // Handle direct fund additions with backend persistence
  const handleAddFunds = async (goalId) => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) return;

    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedAmt = (parseFloat(targetGoal.current_amount) || 0) + amt;
    const isComplete = updatedAmt >= (parseFloat(targetGoal.target_amount) || 1);

    if (updateGoal) {
      await updateGoal(goalId, { current_amount: updatedAmt });
    }

    if (setToast) {
      setToast({
        type: "success",
        text: isComplete 
          ? `🎉 Goal "${targetGoal.title}" reached 100% completion!` 
          : `Added ${money(amt)} to "${targetGoal.title}".`
      });
    }

    setFundingGoalId(null);
    setFundAmount("");
  };

  const totalTarget = goals.reduce((acc, g) => acc + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (parseFloat(g.current_amount) || 0), 0);
  const aggregateProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Overview Metric Banner */}
      <div className="card glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "#fff" }}>Target Financial Horizons</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Accumulated: <span style={{ color: "#00e676", fontWeight: "700" }}>{money(totalSaved)}</span> of <span style={{ color: "#fff", fontWeight: "700" }}>{money(totalTarget)}</span> ({aggregateProgress}%)
          </p>
        </div>

        <button className="btn-primary" onClick={() => openGoalModal && openGoalModal()}>
          <Plus size={15} /> Create Horizon
        </button>
      </div>

      {/* Goal Cards Grid */}
      {goals.length > 0 ? (
        <div className="goal-card-grid">
          {goals.map(goal => {
            const current = parseFloat(goal.current_amount) || 0;
            const target = parseFloat(goal.target_amount) || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isFinished = pct >= 100;

            return (
              <div key={goal.id} className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "700" }}>{goal.title}</h3>
                    <span className={`goal-status-badge ${isFinished ? "goal-status-completed" : "goal-status-active"}`}>
                      {isFinished ? "Completed" : `${pct}%`}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Target Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Open Horizon"}
                  </p>

                  <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: "100%", 
                        background: isFinished ? "#00e676" : "linear-gradient(90deg, #00f0ff 0%, #a855f7 100%)", 
                        borderRadius: "4px",
                        transition: "width 0.4s ease"
                      }} 
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "#fff", fontWeight: "700" }}>{money(current)}</span>
                    <span style={{ color: "var(--text-muted)" }}>Target: {money(target)}</span>
                  </div>
                </div>

                {/* Direct Capital Funding or Delete Controls */}
                <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {fundingGoalId === goal.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input 
                        type="number" 
                        placeholder="Amount (₹)" 
                        value={fundAmount} 
                        onChange={e => setFundAmount(e.target.value)} 
                        style={{ background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "6px", padding: "6px 8px", color: "#fff", fontSize: "0.8rem", width: "100%", outline: "none" }}
                      />
                      <button className="btn-primary" style={{ padding: "6px 10px" }} onClick={() => handleAddFunds(goal.id)}>Deposit</button>
                      <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setFundingGoalId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button 
                        className="goal-fund-btn" 
                        onClick={() => { setFundingGoalId(goal.id); setFundAmount(""); }}
                      >
                        <Plus size={14} color="#00f0ff" /> Add Funds
                      </button>

                      <button 
                        onClick={() => deleteGoal && deleteGoal(goal.id)} 
                        style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                        title="Delete goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card glass-card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#fff" }}>No savings horizons configured</p>
          <span style={{ fontSize: "0.8rem" }}>Create your first target fund (e.g. Emergency Reserve, Real Estate down payment, SIP milestone).</span>
        </div>
      )}

    </div>
  );
}


function CommandPalette({ isOpen, onClose, setPage, openModal }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = useMemo(() => [
    { id: "dash", label: "Go to Dashboard", icon: LayoutDashboard, type: "Navigation", run: () => setPage("Dashboard") },
    { id: "tx", label: "Go to Transactions", icon: ReceiptText, type: "Navigation", run: () => setPage("Transactions") },
    { id: "sub", label: "Go to Subscriptions", icon: CreditCard, type: "Navigation", run: () => setPage("Subscriptions") },
    { id: "bud", label: "Go to Budgets", icon: WalletCards, type: "Navigation", run: () => setPage("Budgets") },
    { id: "rec", label: "Go to Recurring Bills", icon: Repeat2, type: "Navigation", run: () => setPage("Recurring") },
    { id: "goal", label: "Go to Goals", icon: Target, type: "Navigation", run: () => setPage("Goals") },
    { id: "tool", label: "Go to Financial Tools & Calculators", icon: Calculator, type: "Navigation", run: () => setPage("Tools") },
    { id: "doc", label: "Go to Documents Vault", icon: Files, type: "Navigation", run: () => setPage("Documents") },
    { id: "rules", label: "Go to Categorization Rules", icon: ListChecks, type: "Navigation", run: () => setPage("Rules") },
    { id: "add-tx", label: "Quick Action: Add Transaction", icon: Plus, type: "Action", run: () => openModal("tx") },
    { id: "add-sub", label: "Quick Action: Add Subscription", icon: Plus, type: "Action", run: () => openModal("sub") },
    { id: "add-bud", label: "Quick Action: Set Budget", icon: Plus, type: "Action", run: () => openModal("bud") },
    { id: "add-rec", label: "Quick Action: Add Recurring Bill", icon: Plus, type: "Action", run: () => openModal("rec") },
    { id: "add-goal", label: "Quick Action: Add Financial Goal", icon: Plus, type: "Action", run: () => openModal("goal") },
  ], [setPage, openModal]);

  const filtered = useMemo(() => {
    return actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
  }, [actions, query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].run();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={onClose}>
      <div className="cmd-palette-box" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrapper">
          <Search size={18} color="#00f0ff" />
          <input
            type="text"
            className="cmd-input"
            placeholder="Type a command or page... (ESC to close)"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            autoFocus
          />
        </div>
        <div className="cmd-list">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${idx === selectedIndex ? "selected" : ""}`}
                  onClick={() => { item.run(); onClose(); }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <span className="cmd-badge">{item.type}</span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No commands matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function generateRealisticSeedData(userId) {
  const now = new Date();
  const subDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return [
    // --- Income Stream ---
    { user_id: userId, title: "SaaS Retainer - Apex Digital", amount: 145000, type: "income", category: "Client Retainer", date: subDays(3) },
    { user_id: userId, title: "Angel Dividend Payout", amount: 22000, type: "income", category: "Dividends", date: subDays(18) },
    { user_id: userId, title: "SaaS Retainer - Apex Digital", amount: 145000, type: "income", category: "Client Retainer", date: subDays(33) },
    { user_id: userId, title: "Consulting - UX Audit", amount: 35000, type: "income", category: "Freelance", date: subDays(45) },
    { user_id: userId, title: "SaaS Retainer - Apex Digital", amount: 145000, type: "income", category: "Client Retainer", date: subDays(63) },

    // --- Systematic Investments (SIP & Wealth) ---
    { user_id: userId, title: "Zerodha - Nifty 50 Index Fund", amount: 25000, type: "expense", category: "Investments", date: subDays(5) },
    { user_id: userId, title: "Parag Parikh Flexi Cap SIP", amount: 15000, type: "expense", category: "Investments", date: subDays(5) },
    { user_id: userId, title: "Sovereign Gold Bond Tranche", amount: 12000, type: "expense", category: "Investments", date: subDays(22) },
    { user_id: userId, title: "Zerodha - Nifty 50 Index Fund", amount: 25000, type: "expense", category: "Investments", date: subDays(35) },
    { user_id: userId, title: "Parag Parikh Flexi Cap SIP", amount: 15000, type: "expense", category: "Investments", date: subDays(35) },

    // --- SaaS Infrastructure & Subscriptions ---
    { user_id: userId, title: "AWS Cloud Infrastructure", amount: 6420, type: "expense", category: "Software", date: subDays(2) },
    { user_id: userId, title: "GitHub Enterprise & Copilot", amount: 1850, type: "expense", category: "Software", date: subDays(12) },
    { user_id: userId, title: "Apple One Premier Subscription", amount: 365, type: "expense", category: "Entertainment", date: subDays(8) },
    { user_id: userId, title: "OpenAI API Usage", amount: 3200, type: "expense", category: "Software", date: subDays(14) },
    { user_id: userId, title: "Figma Professional Seat", amount: 1200, type: "expense", category: "Software", date: subDays(24) },

    // --- Living, Dining & Logistics ---
    { user_id: userId, title: "Blue Tokai Coffee Roasters", amount: 740, type: "expense", category: "Dining", date: subDays(1) },
    { user_id: userId, title: "Swiggy Gourmet Order", amount: 1250, type: "expense", category: "Dining", date: subDays(4) },
    { user_id: userId, title: "Nature's Basket Organic Groceries", amount: 4850, type: "expense", category: "Groceries", date: subDays(7) },
    { user_id: userId, title: "Uber Premier Travel", amount: 980, type: "expense", category: "Transit", date: subDays(9) },
    { user_id: userId, title: "Fuel - Shell V-Power", amount: 3500, type: "expense", category: "Transit", date: subDays(16) },
    { user_id: userId, title: "Airtel Xstream Fiber Gigabit", amount: 1769, type: "expense", category: "Utilities", date: subDays(20) },
    { user_id: userId, title: "Swiggy Instamart Supplies", amount: 1420, type: "expense", category: "Groceries", date: subDays(25) }
  ];
}

function NetWorth() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // 1. Persistent Balance Sheet State
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("delta_assets");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "HDFC Savings", category: "Bank", amount: 45000 },
      { id: 2, name: "Zerodha Equity", category: "Stocks", amount: 210000 },
      { id: 3, name: "EPF Balance", category: "Retirement", amount: 340000 }
    ];
  });

  const [liabilities, setLiabilities] = useState(() => {
    const saved = localStorage.getItem("delta_liabilities");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "SBI Auto Loan", category: "Loan", amount: 125000 },
      { id: 2, name: "HDFC Credit Card", category: "Credit Card", amount: 18400 }
    ];
  });

  const [timeframe, setTimeframe] = useState("6M"); // "6M" | "1Y" | "ALL"
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: "asset", name: "", category: "Bank", amount: "" });

  useEffect(() => {
    localStorage.setItem("delta_assets", JSON.stringify(assets));
    localStorage.setItem("delta_liabilities", JSON.stringify(liabilities));
  }, [assets, liabilities]);

  // 2. Core Net Worth Calculations
  const totalAssets = useMemo(() => assets.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  // Solvency Metrics
  const debtToAssetRatio = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;
  const solvencyStatus = debtToAssetRatio <= 30 
    ? { label: "Strong Solvency", color: "#00e676" } 
    : debtToAssetRatio <= 60 
    ? { label: "Moderate Leverage", color: "#ffab00" } 
    : { label: "High Leverage", color: "#ff5252" };

  // 3. Asset Composition Donut Data
  const assetCategoryData = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const cat = a.category || "Other";
      map[cat] = (map[cat] || 0) + (parseFloat(a.amount) || 0);
    });
    const data = Object.entries(map).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: "No Assets", value: 1 }];
  }, [assets]);

  const COLORS = ["#00f0ff", "#a855f7", "#00e676", "#ffab00", "#ec4899", "#3b82f6", "#14b8a6"];

  // 4. Timeframe-Based Trajectory Simulation
  const trendData = useMemo(() => {
    const points = timeframe === "6M" ? 6 : timeframe === "1Y" ? 12 : 24;
    const data = [];
    let startNW = netWorth * (timeframe === "6M" ? 0.75 : timeframe === "1Y" ? 0.55 : 0.35);
    const growthPerStep = (netWorth - startNW) / (points - 1 || 1);

    for (let i = points - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      data.push({
        month: d.toLocaleDateString("en-IN", { month: "short", year: points > 12 ? "2-digit" : undefined }),
        value: Math.round(startNW)
      });
      startNW += growthPerStep;
    }
    if (data.length > 0) data[data.length - 1].value = netWorth;
    return data;
  }, [netWorth, timeframe]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.amount) return;

    const entry = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      amount: parseFloat(newItem.amount)
    };

    if (newItem.type === "asset") {
      setAssets([entry, ...assets]);
    } else {
      setLiabilities([entry, ...liabilities]);
    }

    setNewItem({ type: "asset", name: "", category: "Bank", amount: "" });
    setShowModal(false);
  };

  const removeItem = (type, id) => {
    if (type === "asset") setAssets(assets.filter(a => a.id !== id));
    else setLiabilities(liabilities.filter(l => l.id !== id));
  };

  const assetCategories = ["Bank", "Stocks", "Mutual Funds", "FD/RD", "Retirement", "Property", "Gold", "Crypto"];
  const liabilityCategories = ["Credit Card", "Personal Loan", "Home Loan", "Auto Loan", "Education Loan"];

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Header Balance & Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.5rem" }}>
        
        {/* Net Worth Summary Card */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", padding: "1.5rem" }}>
          <div style={{ position: "absolute", top: "-40%", right: "-20%", width: "260px", height: "260px", background: "radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)", zIndex: 0 }} />
          
          <div style={{ zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Total Net Worth</span>
              <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", fontWeight: "700" }}>
                SOLVENCY: {debtToAssetRatio}%
              </span>
            </div>
            
            <h1 style={{ fontSize: "2.6rem", fontWeight: "800", color: "#fff", margin: "8px 0 12px 0", letterSpacing: "-1px" }}>
              {money(netWorth)}
            </h1>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: solvencyStatus.color }} />
              <span style={{ fontSize: "0.8rem", color: solvencyStatus.color, fontWeight: "600" }}>{solvencyStatus.label}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>• {totalLiabilities > 0 ? "Debt obligations active" : "Zero liabilities"}</span>
            </div>
          </div>

          <div style={{ zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0.9rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Total Assets</span>
              <span style={{ color: "#00e676", fontWeight: "700", fontSize: "1.05rem" }}>+{money(totalAssets)}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Total Debt</span>
              <span style={{ color: "#ff5252", fontWeight: "700", fontSize: "1.05rem" }}>-{money(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Wealth Trajectory Chart */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>Wealth Trajectory</h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Portfolio compounding history</span>
            </div>

            <div className="period-pill-group">
              {["6M", "1Y", "ALL"].map(t => (
                <button
                  key={t}
                  className={`period-pill-btn ${timeframe === t ? "active" : ""}`}
                  onClick={() => setTimeframe(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", height: "190px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={45} />
                <Tooltip contentStyle={{ background: "#090e1a", borderColor: "var(--card-border)", borderRadius: "8px", fontSize: "0.82rem" }} formatter={v => [money(v), "Net Worth"]} />
                <Area type="natural" dataKey="value" stroke="#00f0ff" fill="url(#nwGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 2. Asset Allocation Breakdown Bar */}
      <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "65px", height: "65px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetCategoryData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={3} dataKey="value">
                  {assetCategoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#fff" }}>Asset Allocation Profile</h4>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {assetCategoryData.map((c, i) => (
                <span key={i} style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                  {c.name}: <b style={{ color: "#fff" }}>{money(c.value)}</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Add Asset / Liability
        </button>
      </div>

      {/* 3. Assets vs Liabilities Ledger Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* Assets Column */}
        <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--card-border)", background: "rgba(0, 230, 118, 0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#00e676" }}>Assets Ledger</h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{assets.length} active holdings</span>
            </div>
            <b style={{ color: "#00e676", fontSize: "1.1rem" }}>+{money(totalAssets)}</b>
          </div>

          <div style={{ padding: "0.5rem" }}>
            {assets.length > 0 ? assets.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#fff", fontSize: "0.9rem" }}>{a.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{a.category}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: "700", color: "#00e676", fontSize: "0.95rem" }}>+{money(a.amount)}</span>
                  <button onClick={() => removeItem("asset", a.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No assets logged yet.</div>
            )}
          </div>
        </div>

        {/* Liabilities Column */}
        <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--card-border)", background: "rgba(255, 82, 82, 0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ff5252" }}>Liabilities Ledger</h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{liabilities.length} active obligations</span>
            </div>
            <b style={{ color: "#ff5252", fontSize: "1.1rem" }}>-{money(totalLiabilities)}</b>
          </div>

          <div style={{ padding: "0.5rem" }}>
            {liabilities.length > 0 ? liabilities.map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#fff", fontSize: "0.9rem" }}>{l.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{l.category}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: "700", color: "#ff5252", fontSize: "0.95rem" }}>-{money(l.amount)}</span>
                  <button onClick={() => removeItem("liability", l.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No debt obligations.</div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Add Asset / Liability Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(5, 8, 17, 0.8)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card glass-card" style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", border: "1px solid #00f0ff" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>Add Balance Sheet Entry</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20}/></button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Entry Type</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: "asset", category: "Bank" })}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", border: "1px solid var(--card-border)", background: newItem.type === "asset" ? "rgba(0, 230, 118, 0.15)" : "transparent", color: newItem.type === "asset" ? "#00e676" : "var(--text-muted)" }}
                  >
                    + Asset
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: "liability", category: "Credit Card" })}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", border: "1px solid var(--card-border)", background: newItem.type === "liability" ? "rgba(255, 82, 82, 0.15)" : "transparent", color: newItem.type === "liability" ? "#ff5252" : "var(--text-muted)" }}
                  >
                    - Liability
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Name / Entity</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Zerodha Portfolio, SBI Car Loan" className="inline-edit-input" style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }} />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Category</label>
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="inline-edit-input" style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }}>
                  {(newItem.type === "asset" ? assetCategories : liabilityCategories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Total Value (₹)</label>
                <input required type="number" step="0.01" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})} placeholder="0.00" className="inline-edit-input" style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 18px" }}>Save Entry</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function CashFlow({ transactions = [], budgets = [], subscriptions = [], recurring = [] }) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [timeframe, setTimeframe] = useState("1M");

  // 1. Timeframe Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (timeframe === "7D") cutoff.setDate(now.getDate() - 7);
    else if (timeframe === "1M") cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === "3M") cutoff.setMonth(now.getMonth() - 3);
    else if (timeframe === "6M") cutoff.setMonth(now.getMonth() - 6);
    else if (timeframe === "1Y") cutoff.setFullYear(now.getFullYear() - 1);
    else if (timeframe === "ALL") cutoff.setTime(0);

    return transactions.filter(t => new Date(t.created_at || t.date || new Date()) >= cutoff);
  }, [transactions, timeframe]);

  // 2. Core Flow Math
  const metrics = useMemo(() => {
    let income = 0;
    let burn = 0;
    let invested = 0;

    filteredTransactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      const cat = (t.category || "").toLowerCase();
      const title = (t.title || "").toLowerCase();

      if (t.type === "income") {
        income += amt;
      } else {
        if (cat.includes("invest") || title.includes("sip")) {
          invested += amt;
        } else {
          burn += amt;
        }
      }
    });

    const retained = income - (burn + invested);
    const expectedBurn = budgets.reduce((sum, b) => sum + (parseFloat(b.monthly_limit) || 0), 0);
    const expectedSavings = income > 0 ? income * 0.2 : 0; // Standard 20% savings target

    // Fixed obligations
    const totalFixed = subscriptions.reduce((s, sub) => s + (parseFloat(sub.amount) || 0), 0) +
                       recurring.reduce((s, rec) => s + (parseFloat(rec.amount) || 0), 0);
    const fixedRatio = income > 0 ? Math.round((totalFixed / income) * 100) : 0;

    return { income, burn, invested, retained, expectedBurn, expectedSavings, totalFixed, fixedRatio };
  }, [filteredTransactions, budgets, subscriptions, recurring]);

  // 3. Category Breakdown for Flow Distribution
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredTransactions.filter(t => t.type === "expense").forEach(t => {
      const cat = t.category || "General";
      map[cat] = (map[cat] || 0) + (parseFloat(t.amount) || 0);
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pct: metrics.burn > 0 ? Math.round((amount / metrics.burn) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, metrics.burn]);

  const burnVariance = metrics.expectedBurn > 0 ? metrics.burn - metrics.expectedBurn : 0;
  const savingsVariance = metrics.retained + metrics.invested - metrics.expectedSavings;

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Header Toolbar & Controls */}
      <div className="dashboard-toolbar">
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>
            Visualizing how capital enters, circulates, and accumulates
          </span>
        </div>

        <div className="period-pill-group">
          {["7D", "1M", "3M", "6M", "1Y", "ALL"].map(p => (
            <button
              key={p}
              className={`period-pill-btn ${timeframe === p ? "active" : ""}`}
              onClick={() => setTimeframe(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Waterfall Pipeline */}
      <div className="card glass-card" style={{ padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        
        {/* Level 1: Gross Income Node */}
        <div style={{ background: "rgba(0, 230, 118, 0.08)", border: "1px solid rgba(0, 230, 118, 0.4)", borderRadius: "12px", padding: "1.25rem 2.5rem", width: "100%", maxWidth: "420px", textAlign: "center", zIndex: 2, boxShadow: "0 0 25px rgba(0, 230, 118, 0.1)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Gross Income Inflow</span>
          <h2 style={{ margin: "6px 0 0 0", fontSize: "2.2rem", color: "#00e676", fontWeight: "800" }}>+{money(metrics.income)}</h2>
        </div>

        {/* Stem Connector */}
        <div style={{ width: "2px", height: "36px", background: "linear-gradient(to bottom, rgba(0, 230, 118, 0.6), rgba(255, 255, 255, 0.2))" }} />

        {/* Horizontal Divider Line */}
        <div style={{ width: "100%", maxWidth: "860px", height: "2px", background: "rgba(255, 255, 255, 0.15)", position: "relative" }}>
          <div style={{ position: "absolute", left: "16%", top: "0", width: "2px", height: "36px", background: "rgba(255, 255, 255, 0.15)" }} />
          <div style={{ position: "absolute", left: "50%", top: "0", width: "2px", height: "36px", background: "rgba(255, 255, 255, 0.15)", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", right: "16%", top: "0", width: "2px", height: "36px", background: "rgba(255, 255, 255, 0.15)" }} />
        </div>

        <div style={{ height: "36px" }} />

        {/* Level 2: Target Allocation Nodes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", width: "100%", maxWidth: "1020px", zIndex: 2 }}>
          
          {/* Operational Burn */}
          <div className="card glass-card" style={{ background: "rgba(255, 82, 82, 0.04)", border: "1px solid rgba(255, 82, 82, 0.25)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Operational Burn</span>
            <h3 style={{ margin: "6px 0", fontSize: "1.5rem", color: "#ff5252", fontWeight: "800" }}>-{money(metrics.burn)}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(255, 82, 82, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
              {metrics.income > 0 ? Math.round((metrics.burn / metrics.income) * 100) : 0}% of Inflow
            </span>
          </div>

          {/* Capital Deployed */}
          <div className="card glass-card" style={{ background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Capital Deployed</span>
            <h3 style={{ margin: "6px 0", fontSize: "1.5rem", color: "#a855f7", fontWeight: "800" }}>{money(metrics.invested)}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(168, 85, 247, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
              {metrics.income > 0 ? Math.round((metrics.invested / metrics.income) * 100) : 0}% of Inflow
            </span>
          </div>

          {/* Net Retained Cash */}
          <div className="card glass-card" style={{ background: "rgba(0, 240, 255, 0.04)", border: "1px solid rgba(0, 240, 255, 0.25)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Net Retained Cash</span>
            <h3 style={{ margin: "6px 0", fontSize: "1.5rem", color: metrics.retained >= 0 ? "#00f0ff" : "#ff5252", fontWeight: "800" }}>
              {money(metrics.retained)}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(0, 240, 255, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
              {metrics.income > 0 ? Math.round((metrics.retained / metrics.income) * 100) : 0}% of Inflow
            </span>
          </div>

        </div>
      </div>

      {/* 3. Variance Engine */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1.15rem" }}>Variance Engine Telemetry</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
          
          {/* Monthly Spending Variance */}
          <div className="card glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>Discretionary Spending</span>
              <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", background: burnVariance > 0 ? "rgba(255, 82, 82, 0.15)" : "rgba(0, 230, 118, 0.15)", color: burnVariance > 0 ? "#ff5252" : "#00e676" }}>
                {burnVariance > 0 ? "OVER BUDGET" : "UNDER BUDGET"}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Budgeted Baseline:</span> <span>{money(metrics.expectedBurn)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Actual Operational Burn:</span> <span style={{ color: "#fff" }}>{money(metrics.burn)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--card-border)", paddingTop: "8px", marginTop: "2px" }}>
                <span style={{ color: "#00f0ff", fontWeight: "700" }}>Variance Delta:</span> 
                <span style={{ color: burnVariance > 0 ? "#ff5252" : "#00e676", fontWeight: "800", fontSize: "1.05rem" }}>
                  {burnVariance > 0 ? "+" : ""}{money(burnVariance)}
                </span>
              </div>
            </div>
          </div>

          {/* Wealth Accumulation Variance */}
          <div className="card glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>Wealth Accumulation</span>
              <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", background: savingsVariance >= 0 ? "rgba(0, 230, 118, 0.15)" : "rgba(255, 171, 0, 0.15)", color: savingsVariance >= 0 ? "#00e676" : "#ffab00" }}>
                {savingsVariance >= 0 ? "AHEAD OF TARGET" : "BEHIND TARGET"}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Target Retention (20%):</span> <span>{money(metrics.expectedSavings)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Actual Retained + Invested:</span> <span style={{ color: "#fff" }}>{money(metrics.retained + metrics.invested)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--card-border)", paddingTop: "8px", marginTop: "2px" }}>
                <span style={{ color: "#00f0ff", fontWeight: "700" }}>Variance Delta:</span> 
                <span style={{ color: savingsVariance >= 0 ? "#00e676" : "#ffab00", fontWeight: "800", fontSize: "1.05rem" }}>
                  {savingsVariance >= 0 ? "+" : ""}{money(savingsVariance)}
                </span>
              </div>
            </div>
          </div>

          {/* Fixed Cost Load */}
          <div className="card glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>Fixed Obligation Load</span>
              <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", background: metrics.fixedRatio > 35 ? "rgba(255, 82, 82, 0.15)" : "rgba(0, 240, 255, 0.15)", color: metrics.fixedRatio > 35 ? "#ff5252" : "#00f0ff" }}>
                {metrics.fixedRatio}% OF INCOME
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Committed Subscriptions:</span> <span>{money(subscriptions.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Recurring Monthly Dues:</span> <span>{money(recurring.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--card-border)", paddingTop: "8px", marginTop: "2px" }}>
                <span style={{ color: "#00f0ff", fontWeight: "700" }}>Total Committed / Mo:</span> 
                <span style={{ color: "#fff", fontWeight: "800", fontSize: "1.05rem" }}>
                  {money(metrics.totalFixed)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Burn Stream Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card glass-card" style={{ padding: "1.25rem" }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "0.95rem" }}>Operational Outflow Channels</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {categoryBreakdown.map(cat => (
              <div key={cat.name} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--card-border)", padding: "10px 12px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                  <span style={{ color: "#fff", fontWeight: "600" }}>{cat.name}</span>
                  <span style={{ color: "var(--text-muted)" }}>{money(cat.amount)} ({cat.pct}%)</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "2px" }}>
                  <div style={{ width: `${cat.pct}%`, height: "100%", background: "#00f0ff", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function InsightsPage({ transactions = [], budgets = [], recurring = [], subscriptions = [], goals = [], setPage }) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [activeFilter, setActiveFilter] = useState("all");
  const [dismissedIds, setDismissedIds] = useState([]);

  // 1. Algorithmic Financial Intelligence Engine
  const analysis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, daysInCurrentMonth - currentDay);

    // Split Transactions: This Month vs Last Month vs History
    const thisMonthTx = [];
    const lastMonthTx = [];
    const priorHistoryTx = [];

    transactions.forEach(t => {
      const d = new Date(t.created_at || t.date || Date.now());
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        thisMonthTx.push(t);
      } else if (
        (d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1) ||
        (currentMonth === 0 && d.getFullYear() === currentYear - 1 && d.getMonth() === 11)
      ) {
        lastMonthTx.push(t);
      } else {
        priorHistoryTx.push(t);
      }
    });

    const getMetrics = (list) => {
      const income = list.filter(t => t.type === "income").reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const burn = list.filter(t => t.type === "expense" && !(t.category || "").toLowerCase().includes("invest")).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const invest = list.filter(t => (t.category || "").toLowerCase().includes("invest") || (t.title || "").toLowerCase().includes("sip")).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const savings = income - (burn + invest);
      const rate = income > 0 ? Math.round(((income - burn) / income) * 100) : 0;
      return { income, burn, invest, savings, rate };
    };

    const currentM = getMetrics(thisMonthTx.length > 0 ? thisMonthTx : transactions);
    const lastM = getMetrics(lastMonthTx);

    // Period Shifts
    const deltaSpending = lastM.burn > 0 ? Math.round(((currentM.burn - lastM.burn) / lastM.burn) * 100) : 0;
    const deltaSavings = lastM.savings > 0 ? Math.round(((currentM.savings - lastM.savings) / lastM.savings) * 100) : 0;
    const deltaInvest = lastM.invest > 0 ? Math.round(((currentM.invest - lastM.invest) / lastM.invest) * 100) : 0;

    const cards = [];

    // --- 1. Spending Spikes & Surges ---
    const catMap = {};
    const catHistoryMap = {};

    thisMonthTx.filter(t => t.type === "expense").forEach(t => {
      const c = t.category || "General";
      catMap[c] = (catMap[c] || 0) + (parseFloat(t.amount) || 0);
    });

    [...lastMonthTx, ...priorHistoryTx].filter(t => t.type === "expense").forEach(t => {
      const c = t.category || "General";
      catHistoryMap[c] = (catHistoryMap[c] || 0) + (parseFloat(t.amount) || 0);
    });

    Object.entries(catMap).forEach(([cat, amt]) => {
      const avgPrior = (catHistoryMap[cat] || 0) / 2 || amt * 0.75;
      if (avgPrior > 0 && amt > avgPrior * 1.25 && !cat.toLowerCase().includes("invest")) {
        const pctUp = Math.round(((amt - avgPrior) / avgPrior) * 100);
        cards.push({
          id: `spike-${cat}`,
          category: "spikes",
          badge: "Spending Spike",
          badgeColor: "#ff5252",
          title: `${cat} Outflow Surge`,
          metricDisplay: `+${pctUp}% vs Baseline`,
          amount: amt,
          context: `Accelerated purchase velocity detected in ${cat} (${money(amt)} total).`,
          impact: `${currentM.income > 0 ? Math.round((amt / currentM.income) * 100) : 0}% of monthly income`,
          targetPage: "Budgets"
        });
      }
    });

    // --- 2. Budget Proactive Forecast ---
    budgets.forEach(b => {
      const spent = thisMonthTx
        .filter(t => t.type === "expense" && t.category === b.category)
        .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      const limit = parseFloat(b.monthly_limit) || 1;
      const pct = Math.round((spent / limit) * 100);

      const dailyRunRate = currentDay > 0 ? spent / currentDay : 0;
      const projectedMonthEnd = Math.round(spent + (dailyRunRate * daysRemaining));

      if (projectedMonthEnd > limit && pct < 100) {
        cards.push({
          id: `budget-forecast-${b.id}`,
          category: "spikes",
          badge: "Budget Risk",
          badgeColor: "#ffab00",
          title: `${b.category} Ceiling at Risk`,
          metricDisplay: `${pct}% Allocated`,
          amount: spent,
          context: `${daysRemaining} days left in cycle. Projected month-end burn: ${money(projectedMonthEnd)}.`,
          impact: `Current pace: ${money(dailyRunRate)}/day`,
          targetPage: "Budgets"
        });
      } else if (pct >= 100) {
        cards.push({
          id: `budget-breached-${b.id}`,
          category: "spikes",
          badge: "Limit Breached",
          badgeColor: "#ff5252",
          title: `${b.category} Budget Overrun`,
          metricDisplay: `+${money(spent - limit)} Over`,
          amount: spent,
          context: `Ceiling of ${money(limit)} exceeded (${pct}% allocated).`,
          impact: `Directly draining net surplus`,
          targetPage: "Budgets"
        });
      }
    });

    // --- 3. Savings Velocity ---
    if (currentM.income > 0) {
      if (currentM.rate >= 20) {
        cards.push({
          id: "savings-velocity-pos",
          category: "velocity",
          badge: "Savings Velocity",
          badgeColor: "#00e676",
          title: "High Capital Retention",
          metricDisplay: `${currentM.rate}% Net Margin`,
          amount: currentM.savings,
          context: `Preserving ${money(currentM.savings)} surplus after operational burn.`,
          impact: `Beats 20% institutional benchmark`,
          targetPage: "Goals"
        });
      } else if (currentM.rate < 15 && currentM.rate > 0) {
        cards.push({
          id: "savings-velocity-low",
          category: "risk",
          badge: "Savings Buffer",
          badgeColor: "#ffab00",
          title: "Compressed Savings Margin",
          metricDisplay: `${currentM.rate}% Retained`,
          amount: currentM.savings,
          context: `Operational burn consumes ${100 - currentM.rate}% of gross earnings.`,
          impact: `Leaves minimal buffer for volatility`,
          targetPage: "Cash Flow"
        });
      }
    }

    // --- 4. Recurring Commitments & Fixed Load ---
    const totalRecurring = recurring.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const totalSubs = subscriptions.reduce((s, sub) => s + (parseFloat(sub.amount) || 0), 0);
    const fixedObligations = totalRecurring + totalSubs;

    if (currentM.income > 0 && fixedObligations > 0) {
      const fixedRatio = Math.round((fixedObligations / currentM.income) * 100);
      cards.push({
        id: "fixed-commitments",
        category: fixedRatio > 35 ? "risk" : "velocity",
        badge: "Fixed Cost Load",
        badgeColor: fixedRatio > 35 ? "#ffab00" : "#00f0ff",
        title: fixedRatio > 35 ? "Heavy Recurring Burden" : "Committed Baseline",
        metricDisplay: `${fixedRatio}% of Income`,
        amount: fixedObligations,
        context: `${money(fixedObligations)}/month locked across ${recurring.length + subscriptions.length} commitments.`,
        impact: `${money(fixedObligations * 12)} / year annualized`,
        targetPage: "Subscriptions"
      });
    }

    // --- 5. Runway Buffer ---
    const monthlyBurn = currentM.burn > 0 ? currentM.burn : (fixedObligations || 1);
    const liquidBalance = Math.max(0, currentM.income - currentM.burn);
    const runwayMonths = (liquidBalance / monthlyBurn).toFixed(1);

    cards.push({
      id: "runway-buffer",
      category: "risk",
      badge: "Financial Runway",
      badgeColor: parseFloat(runwayMonths) >= 3 ? "#00e676" : "#ffab00",
      title: parseFloat(runwayMonths) >= 3 ? "Solid Liquid Runway" : "Limited Emergency Cushion",
      metricDisplay: `${runwayMonths} Months`,
      amount: liquidBalance,
      context: `Based on active monthly baseline burn of ${money(monthlyBurn)}.`,
      impact: parseFloat(runwayMonths) >= 6 ? "Meets 6-month safety standard" : "Vulnerable to income disruption",
      targetPage: "Net Worth"
    });

    return { cards, currentM, lastM, deltaSpending, deltaSavings, deltaInvest };
  }, [transactions, budgets, recurring, subscriptions, goals]);

  const filteredCards = analysis.cards
    .filter(c => !dismissedIds.includes(c.id))
    .filter(c => activeFilter === "all" || c.category === activeFilter);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Signature Module: WHAT CHANGED? ⭐ */}
      <div className="card glass-card" style={{ padding: "1.25rem 1.5rem", border: "1px solid rgba(0, 240, 255, 0.25)", background: "linear-gradient(145deg, rgba(9, 14, 26, 0.9), rgba(15, 23, 42, 0.75))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#00f0ff", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
              Period-Over-Period Variance
            </span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.2rem", color: "#fff", fontWeight: "800" }}>WHAT CHANGED?</h3>
          </div>
          <span style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", color: "#00f0ff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
            Current Month vs Previous
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Operational Burn</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>{money(analysis.currentM.burn)}</h4>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: analysis.deltaSpending <= 0 ? "#00e676" : "#ff5252" }}>
                {analysis.deltaSpending > 0 ? `+${analysis.deltaSpending}%` : `${analysis.deltaSpending}%`}
              </span>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Retained Savings</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#00e676" }}>{money(analysis.currentM.savings)}</h4>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: analysis.deltaSavings >= 0 ? "#00e676" : "#ffab00" }}>
                {analysis.deltaSavings >= 0 ? `+${analysis.deltaSavings}%` : `${analysis.deltaSavings}%`}
              </span>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Capital Deployed (SIP)</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#a855f7" }}>{money(analysis.currentM.invest)}</h4>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: analysis.deltaInvest >= 0 ? "#00e676" : "#a855f7" }}>
                {analysis.deltaInvest >= 0 ? `+${analysis.deltaInvest}%` : `${analysis.deltaInvest}%`}
              </span>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Net Margin Ratio</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#00f0ff" }}>{analysis.currentM.rate}%</h4>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>of revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Intelligence Filter Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff" }}>Active Insights & Audit Signals</h3>
        
        <div className="period-pill-group">
          {[
            { id: "all", label: "All Signals" },
            { id: "spikes", label: "⚠️ Surges & Budgets" },
            { id: "velocity", label: "✨ Velocity" },
            { id: "risk", label: "🛡️ Runway & Load" }
          ].map(f => (
            <button
              key={f.id}
              className={`period-pill-btn ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Streamlined Scannable Flashcard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.25rem" }}>
        {filteredCards.map((item) => (
          <div 
            key={item.id} 
            className="card glass-card hover-lift" 
            onClick={() => setPage && setPage(item.targetPage)}
            style={{ 
              borderLeft: `4px solid ${item.badgeColor}`, 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              padding: "1.25rem",
              gap: "1rem",
              cursor: "pointer"
            }}
          >
            <div>
              {/* Card Header: Badge & Highlight Metric */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ 
                  background: `${item.badgeColor}15`, 
                  color: item.badgeColor, 
                  padding: "3px 8px", 
                  borderRadius: "4px", 
                  fontSize: "0.7rem", 
                  fontWeight: "800", 
                  letterSpacing: "0.5px", 
                  textTransform: "uppercase" 
                }}>
                  {item.badge}
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#fff" }}>
                  {item.metricDisplay}
                </span>
              </div>

              {/* Title & Concise Summary */}
              <h4 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", color: "#fff" }}>{item.title}</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                {item.context}
              </p>

              {/* Impact Chip */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--card-border)", borderRadius: "6px", padding: "6px 10px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Significance: <b style={{ color: "#fff" }}>{item.impact}</b>
              </div>
            </div>

            {/* Clean Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.75rem", color: item.badgeColor, fontWeight: "600" }}>
                ● Action Recommended
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedIds([...dismissedIds, item.id]);
                }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--card-border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer", padding: "3px 8px" }}
              >
                Dismiss
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

function EconomicCalendar() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const MARKET_EVENTS_2026 = [
    // 2026 Key Market Holidays & Economic Milestones (NSE / BSE / RBI / Tax)
    { date: "2026-01-26", title: "Republic Day", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-02-01", title: "Union Budget Announcement", category: "Fiscal Event", market: "Special Trading Session", impact: "High" },
    { date: "2026-02-06", title: "RBI MPC Policy Decision", category: "Monetary Policy", market: "Repo Rate Update", impact: "High" },
    { date: "2026-03-03", title: "Holi", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-03-15", title: "Q4 Advance Tax Deadline", category: "Tax Compliance", market: "Advance Tax Filing", impact: "Medium" },
    { date: "2026-03-27", title: "Ramzan Id (Id-Ul-Fitr)", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-03-31", title: "Financial Year End (FY 25-26)", category: "Fiscal Event", market: "Annual Book Closure", impact: "High" },
    { date: "2026-04-03", title: "Good Friday", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-04-09", title: "RBI MPC Policy Meeting", category: "Monetary Policy", market: "Repo Rate Decision", impact: "High" },
    { date: "2026-04-14", title: "Dr. B.R. Ambedkar Jayanti", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-05-01", title: "Maharashtra Day", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-06-05", title: "RBI MPC Policy Meeting", category: "Monetary Policy", market: "Rate Trajectory Update", impact: "High" },
    { date: "2026-06-15", title: "Q1 Advance Tax Deadline", category: "Tax Compliance", market: "Advance Tax Filing", impact: "Medium" },
    { date: "2026-07-31", title: "ITR Filing Deadline (Non-Audit)", category: "Tax Compliance", market: "Income Tax Department", impact: "High" },
    { date: "2026-08-15", title: "Independence Day", category: "Market Holiday", market: "National Holiday", impact: "High" },
    { date: "2026-09-15", title: "Q2 Advance Tax Deadline", category: "Tax Compliance", market: "Advance Tax Filing", impact: "Medium" },
    { date: "2026-10-02", title: "Mahatma Gandhi Jayanti", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-10-20", title: "Dussehra", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-11-08", title: "Diwali Laxmi Pujan (Muhurat Trading)", category: "Special Session", market: "Muhurat Session (1 Hr)", impact: "High" },
    { date: "2026-11-10", title: "Diwali Balipratipada", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-11-24", title: "Gurunanak Jayanti", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" },
    { date: "2026-12-15", title: "Q3 Advance Tax Deadline", category: "Tax Compliance", market: "Advance Tax Filing", impact: "Medium" },
    { date: "2026-12-25", title: "Christmas", category: "Market Holiday", market: "NSE / BSE Closed", impact: "High" }
  ];

  const filteredEvents = useMemo(() => {
    return MARKET_EVENTS_2026.filter(e => {
      return selectedCategory === "all" || e.category === selectedCategory;
    });
  }, [selectedCategory]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Header Card */}
      <div className="card glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", margin: "0 0 4px 0", color: "#fff" }}>
            2026 Indian Economic & Market Calendar
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            NSE/BSE trading holidays, RBI policy meetings, and tax compliance milestones for calendar year 2026.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Category Filter */}
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="inline-edit-input"
            style={{ padding: "8px 12px", background: "#090e1a", color: "#00f0ff" }}
          >
            <option value="all">All 2026 Events</option>
            <option value="Market Holiday">Market Holidays (NSE/BSE)</option>
            <option value="Monetary Policy">RBI Policy Meets</option>
            <option value="Tax Compliance">Tax Compliance & Advance Tax</option>
            <option value="Fiscal Event">Fiscal & Budget Events</option>
          </select>
        </div>
      </div>

      {/* 12-Month Grid Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.25rem" }}>
        {months.map((monthName, mIdx) => {
          const monthEvents = filteredEvents.filter(e => new Date(e.date).getMonth() === mIdx);

          return (
            <div key={monthName} className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px" }}>
                <b style={{ fontSize: "1rem", color: "#fff" }}>{monthName} 2026</b>
                <span style={{ fontSize: "0.75rem", color: monthEvents.length > 0 ? "#00f0ff" : "var(--text-muted)", fontWeight: "700" }}>
                  {monthEvents.length} Event{monthEvents.length === 1 ? "" : "s"}
                </span>
              </div>

              {monthEvents.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {monthEvents.map((evt, idx) => {
                    const isHoliday = evt.category === "Market Holiday";
                    const isRBI = evt.category === "Monetary Policy";
                    const isTax = evt.category === "Tax Compliance";

                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "8px 10px", 
                          background: isHoliday ? "rgba(255, 82, 82, 0.05)" : isRBI ? "rgba(0, 240, 255, 0.05)" : isTax ? "rgba(255, 171, 0, 0.05)" : "rgba(168, 85, 247, 0.05)",
                          borderLeft: `3px solid ${isHoliday ? "#ff5252" : isRBI ? "#00f0ff" : isTax ? "#ffab00" : "#a855f7"}`,
                          borderRadius: "6px"
                        }}
                      >
                        <div>
                          <b style={{ display: "block", fontSize: "0.85rem", color: "#fff" }}>{evt.title}</b>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{evt.market}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: isHoliday ? "#ff5252" : "#00f0ff" }}>
                            {new Date(evt.date).getDate()} {monthName.slice(0, 3)}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{evt.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Standard Trading Month (No scheduled closures)
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

function InvestmentsPage() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem("variance_holdings");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Nifty 50 Index Fund", assetType: "Mutual Funds", invested: 75000, current: 89400, returns: 19.2 },
      { id: 2, name: "Parag Parikh Flexi Cap", assetType: "Mutual Funds", invested: 45000, current: 53200, returns: 18.2 },
      { id: 3, name: "Sovereign Gold Bonds (SGB)", assetType: "Gold & SGB", invested: 36000, current: 44100, returns: 22.5 },
      { id: 4, name: "Reliance Industries", assetType: "Direct Equity", invested: 28000, current: 31200, returns: 11.4 },
      { id: 5, name: "EPF / Employee Provident", assetType: "EPF / PPF", invested: 120000, current: 131500, returns: 8.25 }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", assetType: "Mutual Funds", invested: "", current: "" });

  useEffect(() => {
    localStorage.setItem("variance_holdings", JSON.stringify(holdings));
  }, [holdings]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalInvested = holdings.reduce((s, h) => s + (parseFloat(h.invested) || 0), 0);
    const totalCurrent = holdings.reduce((s, h) => s + (parseFloat(h.current) || 0), 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : "0.00";

    // Allocation by asset class for chart
    const allocMap = {};
    holdings.forEach(h => {
      const t = h.assetType || "Other";
      allocMap[t] = (allocMap[t] || 0) + (parseFloat(h.current) || 0);
    });

    const allocData = Object.entries(allocMap).map(([name, value]) => ({ name, value }));

    return { totalInvested, totalCurrent, totalPnl, totalPnlPct, allocData };
  }, [holdings]);

  const COLORS = ["#00f0ff", "#a855f7", "#00e676", "#ffab00", "#ec4899", "#3b82f6"];

  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!form.name || !form.invested || !form.current) return;
    const inv = parseFloat(form.invested);
    const cur = parseFloat(form.current);
    const ret = inv > 0 ? parseFloat((((cur - inv) / inv) * 100).toFixed(2)) : 0;

    const newEntry = {
      id: Date.now(),
      name: form.name,
      assetType: form.assetType,
      invested: inv,
      current: cur,
      returns: ret
    };

    setHoldings([newEntry, ...holdings]);
    setForm({ name: "", assetType: "Mutual Funds", invested: "", current: "" });
    setShowAddModal(false);
  };

  const removeHolding = (id) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const assetTypes = ["Mutual Funds", "Direct Equity", "Gold & SGB", "EPF / PPF", "FD / Bonds", "Crypto", "Real Estate"];

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Overview Cards & Portfolio Allocation */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left: Net Portfolio Valuation Banner */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Portfolio Valuation
            </span>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#fff", margin: "6px 0" }}>
              {money(summary.totalCurrent)}
            </h1>
            
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: summary.totalPnl >= 0 ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.1)", border: `1px solid ${summary.totalPnl >= 0 ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 82, 82, 0.3)"}`, padding: "4px 10px", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: summary.totalPnl >= 0 ? "#00e676" : "#ff5252" }}>
                {summary.totalPnl >= 0 ? "+" : ""}{money(summary.totalPnl)} ({summary.totalPnlPct}%)
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>All-Time Gain</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Capital Invested</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.2rem", color: "#fff" }}>{money(summary.totalInvested)}</h3>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Instruments</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.2rem", color: "#00f0ff" }}>{holdings.length} Assets</h3>
            </div>
          </div>
        </div>

        {/* Right: Asset Allocation Donut */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <b style={{ fontSize: "0.95rem", color: "#fff" }}>Asset Class Distribution</b>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" }}>
            <div style={{ width: "130px", height: "130px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.allocData.length > 0 ? summary.allocData : [{ name: "None", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {summary.allocData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
              {summary.allocData.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>{money(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Holdings Table & Add Action */}
      <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem", color: "#fff" }}>Portfolio Holdings</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Tracked mutual funds, equities, fixed instruments, and bullion</span>
          </div>

          <button className="btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
            {showAddModal ? "✕ Close Form" : "+ Add Investment"}
          </button>
        </div>

        {/* Inline Add Form */}
        {showAddModal && (
          <form onSubmit={handleAddHolding} style={{ padding: "1.25rem", background: "rgba(0, 240, 255, 0.03)", borderBottom: "1px solid var(--card-border)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Instrument / Fund Name</label>
              <input required type="text" placeholder="e.g. Mirae Asset Large Cap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1.5, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Asset Class</label>
              <select value={form.assetType} onChange={e => setForm({ ...form, assetType: e.target.value })} className="inline-edit-input" style={{ width: "100%" }}>
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Invested (₹)</label>
              <input required type="number" step="0.01" placeholder="0.00" value={form.invested} onChange={e => setForm({ ...form, invested: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Current Value (₹)</label>
              <input required type="number" step="0.01" placeholder="0.00" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "8px 16px", height: "35px" }}>Save Asset</button>
          </form>
        )}

        {/* Table */}
        <div className="table-responsive-wrapper" style={{ margin: 0, border: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#090e1a", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Instrument</th>
                <th style={{ padding: "14px 18px" }}>Asset Class</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Invested Amount</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Current Value</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Profit / Loss</th>
                <th style={{ padding: "14px 18px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const inv = parseFloat(h.invested) || 0;
                const cur = parseFloat(h.current) || 0;
                const pnl = cur - inv;
                const pct = inv > 0 ? ((pnl / inv) * 100).toFixed(1) : "0.0";

                return (
                  <tr key={h.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "600", color: "#fff" }}>{h.name}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem" }}>
                        {h.assetType}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", color: "var(--text-muted)" }}>{money(inv)}</td>
                    <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "700", color: "#fff" }}>{money(cur)}</td>
                    <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "700", color: pnl >= 0 ? "#00e676" : "#ff5252" }}>
                      {pnl >= 0 ? `+${money(pnl)}` : `-${money(Math.abs(pnl))}`} ({pct}%)
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <button onClick={() => removeHolding(h.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function AssetsPage() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("delta_assets");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "HDFC Salary Account", category: "Bank & Cash", amount: 45000, institution: "HDFC Bank", returnRate: "3.5% P.A." },
      { id: 2, name: "Zerodha Equity Portfolio", category: "Stocks & MFs", amount: 210000, institution: "Zerodha Broking", returnRate: "14.2% CAGR" },
      { id: 3, name: "EPF Accumulated Balance", category: "Retirement (EPF/PPF)", amount: 340000, institution: "EPFO India", returnRate: "8.25% P.A." },
      { id: 4, name: "Sovereign Gold Bonds 2023 Tranche", category: "Gold & Bullion", amount: 65000, institution: "RBI / SGB", returnRate: "2.5% + Apprec." }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    name: "",
    category: "Bank & Cash",
    amount: "",
    institution: "",
    returnRate: ""
  });

  useEffect(() => {
    localStorage.setItem("delta_assets", JSON.stringify(assets));
  }, [assets]);

  const categories = [
    "Bank & Cash",
    "Stocks & MFs",
    "Retirement (EPF/PPF)",
    "Fixed Deposits (FD/RD)",
    "Gold & Bullion",
    "Real Estate",
    "Vehicles & Hardware",
    "Crypto & Digital"
  ];

  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [assets]);

  // Asset Class Allocation Donut Chart Data
  const allocationData = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const cat = a.category || "General";
      map[cat] = (map[cat] || 0) + (parseFloat(a.amount) || 0);
    });
    const result = Object.entries(map).map(([name, value]) => ({ name, value }));
    return result.length > 0 ? result : [{ name: "No Assets", value: 1 }];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => filterCategory === "all" || a.category === filterCategory);
  }, [assets, filterCategory]);

  const COLORS = ["#00f0ff", "#00e676", "#a855f7", "#ffab00", "#ec4899", "#3b82f6", "#14b8a6", "#f43f5e"];

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;

    const newEntry = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      amount: parseFloat(form.amount),
      institution: form.institution || "Self Held",
      returnRate: form.returnRate || "N/A"
    };

    setAssets([newEntry, ...assets]);
    setForm({ name: "", category: "Bank & Cash", amount: "", institution: "", returnRate: "" });
    setShowAddModal(false);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner: Total Valuation & Allocation Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left: Total Assets Valuation Banner */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Asset Valuation
            </span>
            <h1 style={{ fontSize: "2.6rem", fontWeight: "800", color: "#00e676", margin: "6px 0", letterSpacing: "-1px" }}>
              +{money(totalAssetValue)}
            </h1>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Across {assets.length} tracked wealth instruments & holdings
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Liquid / Bank Cash</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#00f0ff" }}>
                {money(assets.filter(a => a.category === "Bank & Cash" || a.category.includes("FD")).reduce((s, a) => s + (parseFloat(a.amount) || 0), 0))}
              </h3>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Invested & Locked</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#a855f7" }}>
                {money(assets.filter(a => a.category !== "Bank & Cash" && !a.category.includes("FD")).reduce((s, a) => s + (parseFloat(a.amount) || 0), 0))}
              </h3>
            </div>
          </div>
        </div>

        {/* Right: Asset Allocation Donut */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <b style={{ fontSize: "0.95rem", color: "#fff" }}>Asset Class Distribution</b>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" }}>
            <div style={{ width: "130px", height: "130px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
              {allocationData.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>{money(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Asset Register Table & Controls */}
      <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem", color: "#fff" }}>Asset Ledger</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Detailed inventory of liquid accounts, property, bullion, and equity holdings
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="inline-edit-input"
              style={{ padding: "8px 12px", background: "#090e1a", color: "#00f0ff" }}
            >
              <option value="all">All Asset Classes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button className="btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
              {showAddModal ? "✕ Close Form" : "+ Add New Asset"}
            </button>
          </div>
        </div>

        {/* Inline Add Asset Form */}
        {showAddModal && (
          <form onSubmit={handleAddAsset} style={{ padding: "1.25rem", background: "rgba(0, 230, 118, 0.03)", borderBottom: "1px solid var(--card-border)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Asset Name</label>
              <input required type="text" placeholder="e.g. SBI Fixed Deposit" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1.5, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="inline-edit-input" style={{ width: "100%" }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: 1.5, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Institution / Broker</label>
              <input type="text" placeholder="e.g. ICICI Bank" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Yield / Return</label>
              <input type="text" placeholder="e.g. 7.1% P.A." value={form.returnRate} onChange={e => setForm({ ...form, returnRate: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Current Valuation (₹)</label>
              <input required type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "8px 16px", height: "35px" }}>Save Asset</button>
          </form>
        )}

        {/* Assets Table */}
        <div className="table-responsive-wrapper" style={{ margin: 0, border: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#090e1a", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Asset Name</th>
                <th style={{ padding: "14px 18px" }}>Class</th>
                <th style={{ padding: "14px 18px" }}>Custodian / Institution</th>
                <th style={{ padding: "14px 18px" }}>Yield / Return Rate</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Current Value</th>
                <th style={{ padding: "14px 18px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "600", color: "#fff" }}>{a.name}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "rgba(0, 230, 118, 0.08)", border: "1px solid rgba(0, 230, 118, 0.2)", color: "#00e676", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                        {a.category}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {a.institution || "Self Held"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#00f0ff", fontSize: "0.85rem", fontWeight: "600" }}>
                      {a.returnRate || "N/A"}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "700", color: "#00e676", fontSize: "0.95rem" }}>
                      +{money(a.amount)}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <button onClick={() => removeAsset(a.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                    No assets recorded under this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

function LiabilitiesPage() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  const [liabilities, setLiabilities] = useState(() => {
    try {
      const saved = localStorage.getItem("delta_liabilities");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Backwards compatibility migration for older records
        return parsed.map(l => ({
          ...l,
          lender: l.lender || (l.name.includes("SBI") ? "SBI Bank" : l.name.includes("HDFC") ? "HDFC Bank" : "Direct Lender"),
          interestRate: l.interestRate && l.interestRate !== "N/A" ? l.interestRate : (l.category === "Credit Card" ? "3.5% / mo" : "8.75% P.A."),
          monthlyEmi: parseFloat(l.monthlyEmi) || (l.category === "Credit Card" ? parseFloat(l.amount) : Math.round((parseFloat(l.amount) || 0) * 0.035))
        }));
      }
    } catch {}
    return [
      { id: 1, name: "SBI Auto Loan", category: "Auto Loan", amount: 125000, lender: "State Bank of India", interestRate: "8.75% P.A.", monthlyEmi: 4200 },
      { id: 2, name: "HDFC Millennia Credit Card", category: "Credit Card", amount: 18400, lender: "HDFC Bank", interestRate: "3.5% / mo", monthlyEmi: 18400 }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    name: "",
    category: "Credit Card",
    amount: "",
    lender: "",
    interestRate: "",
    monthlyEmi: ""
  });

  useEffect(() => {
    localStorage.setItem("delta_liabilities", JSON.stringify(liabilities));
  }, [liabilities]);

  const categories = [
    "Credit Card",
    "Home Loan",
    "Auto Loan",
    "Personal Loan",
    "Education Loan",
    "Gold Loan / LAP",
    "BNPL / Pay Later",
    "Other Debt"
  ];

  const totalDebt = useMemo(() => {
    return liabilities.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [liabilities]);

  const totalMonthlyEmi = useMemo(() => {
    return liabilities.reduce((sum, item) => sum + (parseFloat(item.monthlyEmi) || 0), 0);
  }, [liabilities]);

  const allocationData = useMemo(() => {
    const map = {};
    liabilities.forEach(l => {
      const cat = l.category || "Other";
      map[cat] = (map[cat] || 0) + (parseFloat(l.amount) || 0);
    });
    const result = Object.entries(map).map(([name, value]) => ({ name, value }));
    return result.length > 0 ? result : [{ name: "Debt Free", value: 1 }];
  }, [liabilities]);

  const filteredLiabilities = useMemo(() => {
    return liabilities.filter(l => filterCategory === "all" || l.category === filterCategory);
  }, [liabilities, filterCategory]);

  const COLORS = ["#ff5252", "#ffab00", "#ec4899", "#a855f7", "#3b82f6", "#00f0ff", "#00e676"];

  const handleAddLiability = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;

    const newEntry = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      amount: parseFloat(form.amount),
      lender: form.lender || "Direct Lender",
      interestRate: form.interestRate || "Standard",
      monthlyEmi: parseFloat(form.monthlyEmi) || 0
    };

    setLiabilities([newEntry, ...liabilities]);
    setForm({ name: "", category: "Credit Card", amount: "", lender: "", interestRate: "", monthlyEmi: "" });
    setShowAddModal(false);
  };

  const removeLiability = (id) => {
    setLiabilities(liabilities.filter(l => l.id !== id));
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner: Total Debt & Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left: Debt Summary */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Outstanding Liabilities
            </span>
            <h1 style={{ fontSize: "2.6rem", fontWeight: "800", color: "#ff5252", margin: "6px 0", letterSpacing: "-1px" }}>
              -{money(totalDebt)}
            </h1>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Across {liabilities.length} active credit & debt facilities
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Monthly EMI Burden</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#ffab00" }}>
                {money(totalMonthlyEmi)}/mo
              </h3>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Annualized Debt Servicing</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#fff" }}>
                {money(totalMonthlyEmi * 12)}/yr
              </h3>
            </div>
          </div>
        </div>

        {/* Right: Debt Distribution Donut */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <b style={{ fontSize: "0.95rem", color: "#fff" }}>Debt Structure by Category</b>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" }}>
            <div style={{ width: "130px", height: "130px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
              {allocationData.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>{money(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Liabilities Ledger */}
      <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem", color: "#fff" }}>Liabilities Ledger</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Detailed inventory of credit cards, personal loans, mortgages, and obligations
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="inline-edit-input"
              style={{ padding: "8px 12px", background: "#090e1a", color: "#ff5252" }}
            >
              <option value="all">All Debt Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button className="btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
              {showAddModal ? "✕ Close Form" : "+ Add Liability"}
            </button>
          </div>
        </div>

        {/* Inline Add Liability Form */}
        {showAddModal && (
          <form onSubmit={handleAddLiability} style={{ padding: "1.25rem", background: "rgba(255, 82, 82, 0.03)", borderBottom: "1px solid var(--card-border)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Facility / Loan Name</label>
              <input required type="text" placeholder="e.g. HDFC Millennia Card" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1.5, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="inline-edit-input" style={{ width: "100%" }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: 1.5, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Lender / Bank</label>
              <input type="text" placeholder="e.g. HDFC Bank, SBI" value={form.lender} onChange={e => setForm({ ...form, lender: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "110px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Interest Rate</label>
              <input type="text" placeholder="e.g. 8.5% P.A." value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "110px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Monthly EMI (₹)</label>
              <input type="number" step="0.01" placeholder="0.00" value={form.monthlyEmi} onChange={e => setForm({ ...form, monthlyEmi: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Outstanding (₹)</label>
              <input required type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "8px 16px", height: "35px" }}>Save Liability</button>
          </form>
        )}

        {/* Table */}
        <div className="table-responsive-wrapper" style={{ margin: 0, border: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#090e1a", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Liability Name</th>
                <th style={{ padding: "14px 18px" }}>Category</th>
                <th style={{ padding: "14px 18px" }}>Lender</th>
                <th style={{ padding: "14px 18px" }}>Interest Rate</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Monthly EMI</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Outstanding Balance</th>
                <th style={{ padding: "14px 18px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLiabilities.length > 0 ? (
                filteredLiabilities.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "600", color: "#fff" }}>{l.name}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "rgba(255, 82, 82, 0.08)", border: "1px solid rgba(255, 82, 82, 0.2)", color: "#ff5252", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                        {l.category}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {l.lender}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#ffab00", fontSize: "0.85rem", fontWeight: "600" }}>
                      {l.interestRate}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {l.monthlyEmi > 0 ? money(l.monthlyEmi) : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "700", color: "#ff5252", fontSize: "0.95rem" }}>
                      -{money(l.amount)}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <button onClick={() => removeLiability(l.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                    No liabilities recorded under this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

function InsurancePage() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  const [policies, setPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem("variance_insurance_policies");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        name: "HDFC ERGO Optima Secure",
        type: "Health Insurance",
        insurer: "HDFC ERGO",
        policyNumber: "POL-982314-H",
        sumInsured: 2500000,
        annualPremium: 18450,
        renewalDate: "2026-11-14",
        taxSection: "80D"
      },
      {
        id: 2,
        name: "Max Life Smart Secure Plus",
        type: "Term Life (Pure Protection)",
        insurer: "Max Life",
        policyNumber: "ML-441209-T",
        sumInsured: 15000000,
        annualPremium: 14200,
        renewalDate: "2026-10-05",
        taxSection: "80C"
      },
      {
        id: 3,
        name: "Acko Comprehensive Auto Cover",
        type: "Motor / Vehicle",
        insurer: "Acko General",
        policyNumber: "ACK-881290-V",
        sumInsured: 850000,
        annualPremium: 9800,
        renewalDate: "2026-09-12",
        taxSection: "None"
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({
    name: "",
    type: "Health Insurance",
    insurer: "",
    policyNumber: "",
    sumInsured: "",
    annualPremium: "",
    renewalDate: "",
    taxSection: "80D"
  });

  useEffect(() => {
    localStorage.setItem("variance_insurance_policies", JSON.stringify(policies));
  }, [policies]);

  const policyTypes = [
    "Health Insurance",
    "Term Life (Pure Protection)",
    "Critical Illness",
    "Motor / Vehicle",
    "Home & Asset",
    "Personal Accident",
    "Travel Insurance"
  ];

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalCover = policies.reduce((s, p) => s + (parseFloat(p.sumInsured) || 0), 0);
    const totalPremium = policies.reduce((s, p) => s + (parseFloat(p.annualPremium) || 0), 0);
    const taxDeductible80D = policies.filter(p => p.taxSection === "80D").reduce((s, p) => s + (parseFloat(p.annualPremium) || 0), 0);

    // Distribution by Type for Chart
    const typeMap = {};
    policies.forEach(p => {
      const t = p.type || "Other";
      typeMap[t] = (typeMap[t] || 0) + (parseFloat(p.sumInsured) || 0);
    });
    const chartData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    return { totalCover, totalPremium, taxDeductible80D, chartData };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => filterType === "all" || p.type === filterType);
  }, [policies, filterType]);

  const COLORS = ["#00e676", "#00f0ff", "#a855f7", "#ffab00", "#ec4899", "#3b82f6"];

  const handleAddPolicy = (e) => {
    e.preventDefault();
    if (!form.name || !form.sumInsured || !form.annualPremium) return;

    const newPolicy = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      insurer: form.insurer || "Direct",
      policyNumber: form.policyNumber || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      sumInsured: parseFloat(form.sumInsured),
      annualPremium: parseFloat(form.annualPremium),
      renewalDate: form.renewalDate || "2026-12-31",
      taxSection: form.taxSection || "None"
    };

    setPolicies([newPolicy, ...policies]);
    setForm({ name: "", type: "Health Insurance", insurer: "", policyNumber: "", sumInsured: "", annualPremium: "", renewalDate: "", taxSection: "80D" });
    setShowAddModal(false);
  };

  const removePolicy = (id) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner: Total Protection & Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left: Total Cover Banner */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Sum Insured / Protection Blanket
            </span>
            <h1 style={{ fontSize: "2.6rem", fontWeight: "800", color: "#00e676", margin: "6px 0", letterSpacing: "-1px" }}>
              {money(summary.totalCover)}
            </h1>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Guarding your wealth against medical, life, and asset catastrophe
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Annual Premium</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#00f0ff" }}>
                {money(summary.totalPremium)}/yr
              </h3>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sec 80D Health Exemption</span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", color: "#a855f7" }}>
                {money(summary.taxDeductible80D)}
              </h3>
            </div>
          </div>
        </div>

        {/* Right: Coverage Distribution Donut */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <b style={{ fontSize: "0.95rem", color: "#fff" }}>Protection Coverage by Asset Type</b>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" }}>
            <div style={{ width: "130px", height: "130px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.chartData.length > 0 ? summary.chartData : [{ name: "None", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {summary.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
              {summary.chartData.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>{money(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Insurance Policies Ledger */}
      <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem", color: "#fff" }}>Active Insurance Policies</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Vault of medical, life, term, and casualty policies with renewal trackers
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="inline-edit-input"
              style={{ padding: "8px 12px", background: "#090e1a", color: "#00e676" }}
            >
              <option value="all">All Policy Types</option>
              {policyTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button className="btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
              {showAddModal ? "✕ Close Form" : "+ Add Policy"}
            </button>
          </div>
        </div>

        {/* Inline Add Policy Form */}
        {showAddModal && (
          <form onSubmit={handleAddPolicy} style={{ padding: "1.25rem", background: "rgba(0, 230, 118, 0.03)", borderBottom: "1px solid var(--card-border)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Plan / Policy Name</label>
              <input required type="text" placeholder="e.g. Star Health Young Star" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1.5, minWidth: "160px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Policy Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="inline-edit-input" style={{ width: "100%" }}>
                {policyTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ flex: 1.5, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Insurer Provider</label>
              <input type="text" placeholder="e.g. HDFC ERGO, LIC" value={form.insurer} onChange={e => setForm({ ...form, insurer: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Sum Insured (₹)</label>
              <input required type="number" step="1000" placeholder="0.00" value={form.sumInsured} onChange={e => setForm({ ...form, sumInsured: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Annual Premium (₹)</label>
              <input required type="number" step="1" placeholder="0.00" value={form.annualPremium} onChange={e => setForm({ ...form, annualPremium: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Renewal Due</label>
              <input type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} className="inline-edit-input" style={{ width: "100%" }} />
            </div>

            <div style={{ flex: 1, minWidth: "100px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Tax Section</label>
              <select value={form.taxSection} onChange={e => setForm({ ...form, taxSection: e.target.value })} className="inline-edit-input" style={{ width: "100%" }}>
                <option value="80D">80D (Health)</option>
                <option value="80C">80C (Life)</option>
                <option value="None">None</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "8px 16px", height: "35px" }}>Save Policy</button>
          </form>
        )}

        {/* Table */}
        <div className="table-responsive-wrapper" style={{ margin: 0, border: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#090e1a", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Policy & Insurer</th>
                <th style={{ padding: "14px 18px" }}>Protection Class</th>
                <th style={{ padding: "14px 18px" }}>Tax Benefit</th>
                <th style={{ padding: "14px 18px" }}>Next Renewal</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Annual Premium</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Sum Insured Cover</th>
                <th style={{ padding: "14px 18px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <b style={{ display: "block", color: "#fff", fontSize: "0.92rem" }}>{p.name}</b>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{p.insurer} • {p.policyNumber}</span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "rgba(0, 230, 118, 0.08)", border: "1px solid rgba(0, 230, 118, 0.2)", color: "#00e676", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                        {p.type}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", color: "#00f0ff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
                        Sec {p.taxSection}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {p.renewalDate ? new Date(p.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", color: "#ffab00", fontWeight: "600", fontSize: "0.9rem" }}>
                      {money(p.annualPremium)}/yr
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "800", color: "#00e676", fontSize: "0.95rem" }}>
                      {money(p.sumInsured)}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <button onClick={() => removePolicy(p.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                    No insurance policies recorded under this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

function MarketsPage() {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const usd = (v) => "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 1. Perfectly Accurate EOD Baseline Data (August 25, 2026)
  const [indices] = useState([
    { id: "nifty", name: "NIFTY 50", symbol: "NIFTY", price: 24334.55, change: 115.50, pct: 0.48, spark: [24150, 24170, 24210, 24260, 24300, 24334.55] },
    { id: "sensex", name: "BSE SENSEX", symbol: "SENSEX", price: 77656.09, change: 286.98, pct: 0.37, spark: [77200, 77250, 77300, 77450, 77550, 77656.09] },
    { id: "banknifty", name: "BANK NIFTY", symbol: "BANKNIFTY", price: 57514.20, change: -11.75, pct: -0.02, spark: [57800, 57650, 57500, 57600, 57550, 57514.20] },
    { id: "niftyit", name: "NIFTY IT", symbol: "NIFTYIT", price: 30352.60, change: -244.30, pct: -0.80, spark: [30600, 30550, 30400, 30500, 30450, 30352.60] },
    { id: "spx", name: "S&P 500", symbol: "SPX", price: 7652.86, change: -21.51, pct: -0.28, spark: [7670, 7680, 7660, 7655, 7665, 7652.86] },
    { id: "ndx", name: "NASDAQ 100", symbol: "NDX", price: 29023.18, change: -133.00, pct: -0.46, spark: [29200, 29150, 29100, 29050, 29080, 29023.18] }
  ]);

  const [commodities] = useState([
    { id: "usd", name: "USD / INR", category: "Forex", price: 95.70, change: -0.03, pct: -0.03, isCurrency: true },
    { id: "gold", name: "Gold (24K / 10g)", category: "Precious Metals", price: 162085, change: -1352.00, pct: -0.82, isInr: true },
    { id: "silver", name: "Silver (1 Kg)", category: "Precious Metals", price: 84200, change: -450.00, pct: -0.53, isInr: true },
    { id: "brent", name: "Brent Crude Oil", category: "Energy", price: 77.40, change: -1.12, pct: -1.43, isUsd: true, suffix: " / bbl" },
    { id: "yield", name: "India 10Y Bond Yield", category: "Bonds & Yields", price: 6.86, change: -0.02, pct: -0.29, isPct: true }
  ]);

  const SECTOR_HEATMAP = [
    { name: "Information Tech", perf: "-0.80%", positive: false, weight: "High" },
    { name: "Pharma & Healthcare", perf: "+0.92%", positive: true, weight: "Medium" },
    { name: "Automobiles", perf: "+0.74%", positive: true, weight: "Medium" },
    { name: "FMCG / Staples", perf: "+0.35%", positive: true, weight: "Medium" },
    { name: "Oil & Gas / Energy", perf: "+0.18%", positive: true, weight: "High" },
    { name: "Banking & Financials", perf: "-0.02%", positive: false, weight: "Heavy" },
    { name: "Metals & Mining", perf: "-0.64%", positive: false, weight: "Medium" },
    { name: "Real Estate & Infra", perf: "-1.05%", positive: false, weight: "Low" }
  ];

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner: Market Status */}
      <div className="card glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderLeft: "4px solid #00f0ff" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 10px #00f0ff" }} />
            <h2 style={{ fontSize: "1.3rem", margin: 0, color: "#fff" }}>Market Intelligence Terminal</h2>
            <span style={{ background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", border: "1px solid rgba(0, 240, 255, 0.4)" }}>
              MARKETS CLOSED • EOD SETTLED
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Institutional macro overview, key equity benchmarks, and sector rotation.
          </p>
        </div>

        {/* Sentiment Gauge Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.03)", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Market Breadth</span>
            <b style={{ color: "#00e676", fontSize: "0.95rem" }}>Bullish Bias (61)</b>
          </div>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", border: "2px solid #00e676", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e676", fontWeight: "800", fontSize: "0.85rem" }}>
            61
          </div>
        </div>
      </div>

      {/* Benchmark Indices Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {indices.map((idx) => {
          const isPositive = idx.change >= 0;

          return (
            <div 
              key={idx.id} 
              className="card glass-card" 
              style={{ 
                padding: "1.15rem", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between",
                background: "var(--card-bg)" 
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>{idx.symbol}</span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", color: "#fff" }}>{idx.name}</h3>
                </div>
                <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", background: isPositive ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.1)", color: isPositive ? "#00e676" : "#ff5252" }}>
                  {isPositive ? "+" : ""}{idx.pct.toFixed(2)}%
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "1rem" }}>
                <div>
                  <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "#fff" }}>
                    {Number(idx.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span style={{ display: "block", fontSize: "0.75rem", color: isPositive ? "#00e676" : "#ff5252", marginTop: "2px" }}>
                    {isPositive ? "+" : ""}{idx.change.toFixed(2)} pts
                  </span>
                </div>

                <div style={{ width: "80px", height: "28px" }}>
                  <svg width="100%" height="100%" viewBox="0 0 80 28" fill="none">
                    <path
                      d={isPositive ? "M0 24 L16 20 L32 12 L48 16 L64 6 L80 2" : "M0 4 L16 8 L32 14 L48 22 L64 16 L80 26"}
                      stroke={isPositive ? "#00e676" : "#ff5252"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Macro & Commodities vs Sector Heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem" }}>
        
        {/* Commodities & Macroeconomics */}
        <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.15rem 1.25rem", borderBottom: "1px solid var(--card-border)" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>Macro Indicators & Commodities</h3>
          </div>

          <div style={{ padding: "0.5rem 1rem" }}>
            {commodities.map((item, idx) => {
              const isPositive = item.change >= 0;
              
              let displayPrice = item.price.toFixed(2);
              if (item.isInr) displayPrice = money(item.price);
              if (item.isUsd) displayPrice = usd(item.price);
              if (item.isCurrency) displayPrice = `₹${item.price.toFixed(4)}`;
              if (item.isPct) displayPrice = `${item.price.toFixed(3)}%`;

              return (
                <div 
                  key={item.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 8px", 
                    borderBottom: idx !== commodities.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderRadius: "6px"
                  }}
                >
                  <div>
                    <b style={{ display: "block", fontSize: "0.88rem", color: "#fff" }}>{item.name}</b>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.category}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b style={{ display: "block", fontSize: "0.95rem", color: "#fff" }}>
                      {displayPrice}{item.suffix || ""}
                    </b>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isPositive ? "#00e676" : "#ff5252" }}>
                      {isPositive ? "+" : ""}{item.change.toFixed(2)} ({isPositive ? "+" : ""}{item.pct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Heatmap Breakdown */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: "0", fontSize: "1.05rem", color: "#fff" }}>Sectoral Rotation Heatmap</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>EOD Settlement</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {SECTOR_HEATMAP.map((sec, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: "10px 12px", 
                  background: sec.positive ? "rgba(0, 230, 118, 0.05)" : "rgba(255, 82, 82, 0.05)", 
                  border: `1px solid ${sec.positive ? "rgba(0, 230, 118, 0.2)" : "rgba(255, 82, 82, 0.2)"}`,
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "#fff", fontWeight: "600" }}>{sec.name}</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Weight: {sec.weight}</span>
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: "800", color: sec.positive ? "#00e676" : "#ff5252" }}>
                  {sec.perf}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function AcademyPage() {
  const [activeView, setActiveView] = useState("dashboard"); 
  const [selectedLesson, setSelectedLesson] = useState(null);

  const CURRICULUM = [
    {
      id: "path-1",
      school: "Money Fundamentals",
      progress: 100,
      icon: "💰",
      lessons: [
        { id: "l1", title: "What is Money & Purchasing Power?", level: "🟢 Beginner", time: "4 min", completed: true },
        { id: "l2", title: "Income, Expenses & Cash Flow", level: "🟢 Beginner", time: "6 min", completed: true },
      ]
    },
    {
      id: "path-2",
      school: "Personal Finance & Budgeting",
      progress: 60,
      icon: "🧾",
      lessons: [
        { id: "l3", title: "The 50/30/20 Rule", level: "🟢 Beginner", time: "5 min", completed: true },
        { id: "l4", title: "Building an Emergency Fund", level: "🟢 Beginner", time: "8 min", completed: false, isCurrent: true },
        { id: "l5", title: "Good Debt vs Bad Debt", level: "🟡 Intermediate", time: "7 min", completed: false }
      ]
    },
    {
      id: "path-3",
      school: "Investing & Wealth",
      progress: 0,
      icon: "📈",
      lessons: [
        { id: "l6", title: "The Power of Compounding", level: "🟢 Beginner", time: "5 min", completed: false },
        { id: "l7", title: "Asset Allocation Basics", level: "🟡 Intermediate", time: "10 min", completed: false },
        { id: "l8", title: "Sequence of Returns Risk", level: "🔴 Advanced", time: "12 min", completed: false }
      ]
    },
    {
      id: "path-4",
      school: "Indian Stock Market",
      progress: 0,
      icon: "📊",
      lessons: [
        { id: "l9", title: "What are NIFTY & SENSEX?", level: "🟢 Beginner", time: "6 min", completed: false },
        { id: "l10", title: "Mutual Funds vs ETFs", level: "🟡 Intermediate", time: "9 min", completed: false },
        { id: "l11", title: "Understanding Options Greeks", level: "🔴 Advanced", time: "15 min", completed: false }
      ]
    }
  ];

  // The Dynamic Lesson Content Database
  const LESSON_DB = {
    "l3": {
      learn: "The 50/30/20 rule is a simple budgeting framework that splits your after-tax income into three categories: 50% for Needs (rent, groceries, utilities), 30% for Wants (dining out, hobbies, travel), and 20% for Savings and Investing.",
      exampleTitle: "The ₹50,000/month Budget",
      example: "Priya takes home ₹50,000 a month. Following the rule, she caps her rent, groceries, and bills at ₹25,000 (50%). She allows herself ₹15,000 (30%) for eating out and shopping, and strictly routes the remaining ₹10,000 (20%) into her Mutual Fund SIPs and emergency savings.",
      quizQ: "Under the strict 50/30/20 rule, where should a Netflix subscription go?",
      quizOpts: [
        { text: "A) Needs (50%)", isCorrect: false },
        { text: "B) Wants (30%)", isCorrect: true },
        { text: "C) Savings (20%)", isCorrect: false }
      ],
      applyTitle: "BUILD YOUR BUDGET",
      applyDesc: "Allocate your exact income using the Variance Budget tool.",
      applyBtn: "Open Budget Planner"
    },
    "l4": {
      learn: "An emergency fund is a financial safety net designed to cover unexpected expenses like medical emergencies, sudden job loss, or urgent home repairs. Without it, a single crisis can force you into high-interest credit card debt, destroying years of compounding wealth.",
      exampleTitle: "Real-World Indian Example",
      example: "Rahul earns ₹60,000/month. His absolute survival expenses (rent, groceries, utilities, EMIs) are ₹35,000/month. The standard rule is to save 3 to 6 months of survival expenses. Rahul needs: ₹35,000 × 6 = ₹2,10,000 parked in a highly liquid Savings Account or Liquid Mutual Fund.",
      quizQ: "Where is the worst place to keep your Emergency Fund?",
      quizOpts: [
        { text: "A) Savings Bank Account", isCorrect: false },
        { text: "B) Liquid Debt Mutual Fund", isCorrect: false },
        { text: "C) Small-Cap Equity Stocks", isCorrect: true }
      ],
      applyTitle: "APPLY TO YOUR LIFE",
      applyDesc: "Calculate your exact required runway based on your Variance cash flow data.",
      applyBtn: "Open Runway Calculator"
    }
  };

  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setActiveView("lesson");
  };

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  if (activeView === "lesson" && selectedLesson) {
    const content = LESSON_DB[selectedLesson.id];

    return (
      <div className="page" style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "3rem" }}>
        <button onClick={() => { setActiveView("dashboard"); setSelectedAnswer(null); }} style={{ background: "transparent", border: "none", color: "#00f0ff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", width: "fit-content", padding: 0 }}>
          ← Back to Academy
        </button>

        <div className="card glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ background: selectedLesson.level.includes("🟢") ? "rgba(0, 230, 118, 0.1)" : selectedLesson.level.includes("🟡") ? "rgba(255, 171, 0, 0.1)" : "rgba(255, 82, 82, 0.1)", color: selectedLesson.level.includes("🟢") ? "#00e676" : selectedLesson.level.includes("🟡") ? "#ffab00" : "#ff5252", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
              {selectedLesson.level}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedLesson.time} read</span>
          </div>

          <h1 style={{ fontSize: "2rem", color: "#fff", margin: "0 0 1.5rem 0" }}>{selectedLesson.title}</h1>

          {content ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              
              {/* LEARN */}
              <div>
                <h3 style={{ color: "#00f0ff", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  <BookOpen size={18} /> LEARN
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6", fontSize: "0.95rem", margin: 0 }}>
                  {content.learn}
                </p>
              </div>

              {/* EXAMPLE */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "8px", borderLeft: "3px solid #a855f7" }}>
                <h3 style={{ color: "#a855f7", fontSize: "1rem", margin: "0 0 10px 0" }}>{content.exampleTitle}</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6", fontSize: "0.9rem", margin: 0 }}>
                  {content.example}
                </p>
              </div>

              {/* QUIZ */}
              <div style={{ border: "1px solid var(--card-border)", padding: "1.5rem", borderRadius: "8px" }}>
                <h3 style={{ color: "#fff", fontSize: "1rem", margin: "0 0 15px 0" }}>Quick Knowledge Check</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "15px" }}>{content.quizQ}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {content.quizOpts.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isWrong = isSelected && !opt.isCorrect;
                    const isRight = isSelected && opt.isCorrect;
                    
                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedAnswer(i)}
                        style={{ 
                          textAlign: "left", 
                          padding: "12px", 
                          cursor: "pointer", 
                          width: "100%",
                          borderRadius: "6px",
                          border: isRight ? "1px solid #00e676" : isWrong ? "1px solid #ff5252" : "1px solid var(--card-border)",
                          background: isRight ? "rgba(0, 230, 118, 0.1)" : isWrong ? "rgba(255, 82, 82, 0.1)" : "rgba(255,255,255,0.02)",
                          color: isRight ? "#00e676" : isWrong ? "#ff5252" : "#fff",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {opt.text} {isRight && "✅"} {isWrong && "❌"}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* APPLY */}
              <div style={{ background: "rgba(0, 230, 118, 0.05)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(0, 230, 118, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ color: "#00e676", fontSize: "1rem", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Target size={18} /> {content.applyTitle}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                    {content.applyDesc}
                  </p>
                </div>
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "#00e676", color: "#090e1a" }}>
                  <Calculator size={16} /> {content.applyBtn}
                </button>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
              <GraduationCap size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: "1rem" }} />
              <p>This lesson module is currently being drafted by the Variance curriculum team.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard rendering remains exactly the same as before
  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* 1. Welcome & Gamification Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* Knowledge Score */}
        <div className="card glass-card" style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", margin: "0 0 8px 0", color: "#fff" }}>👋 Welcome to Academy</h2>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Learn money. Understand markets. Build wealth.</p>
            
            <div style={{ marginTop: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)" }}>Current Level</span>
              <h3 style={{ fontSize: "1.2rem", color: "#00f0ff", margin: "2px 0 0 0" }}>Level 1: Beginner</h3>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", background: "conic-gradient(#00f0ff 32%, rgba(255,255,255,0.05) 0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "#090e1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fff" }}>32</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "-2px" }}>/ 100</span>
              </div>
            </div>
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "12px", fontWeight: "600" }}>FINANCE SCORE</span>
          </div>
        </div>

        {/* Continue Learning Action Card */}
        <div className="card glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "4px solid #00e676" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "10px" }}>Jump Back In</span>
          <h2 style={{ fontSize: "1.4rem", margin: "0 0 6px 0", color: "#fff" }}>Building an Emergency Fund</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", flex: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "#00e676" }}></div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>3/5 Lessons</span>
          </div>
          <button className="btn-primary" onClick={() => openLesson(CURRICULUM[1].lessons[1])} style={{ background: "#00e676", color: "#090e1a", border: "none", width: "fit-content", padding: "10px 20px" }}>
            Continue Learning →
          </button>
        </div>
      </div>

      {/* 2. The Curriculum Map */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", paddingBottom: "10px", borderBottom: "1px solid var(--card-border)" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 4px 0", color: "#fff" }}>Academy Learning Paths</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Mastering the A-Z of Indian personal finance and capital markets.</span>
          </div>
          <div style={{ display: "flex", gap: "15px", fontSize: "0.8rem", fontWeight: "600" }}>
            <span style={{ color: "#00e676" }}>🟢 Beginner</span>
            <span style={{ color: "#ffab00" }}>🟡 Intermediate</span>
            <span style={{ color: "#ff5252" }}>🔴 Advanced</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {CURRICULUM.map((path) => (
            <div key={path.id} className="card glass-card" style={{ padding: "0", overflow: "hidden" }}>
              
              {/* Path Header */}
              <div style={{ padding: "1.25rem", background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>{path.icon}</span>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>{path.school}</h4>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: path.progress === 100 ? "#00e676" : "var(--text-muted)" }}>
                  {path.progress}%
                </span>
              </div>

              {/* Lessons List */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {path.lessons.map((lesson, idx) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => openLesson(lesson)}
                    style={{ 
                      padding: "1rem 1.25rem", 
                      borderBottom: idx !== path.lessons.length - 1 ? "1px solid rgba(255, 255, 255, 0.03)" : "none",
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      cursor: "pointer",
                      background: lesson.isCurrent ? "rgba(0, 240, 255, 0.05)" : "transparent",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = lesson.isCurrent ? "rgba(0, 240, 255, 0.05)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {lesson.completed ? (
                        <CheckCircle size={16} color="#00e676" />
                      ) : (
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid var(--text-muted)" }} />
                      )}
                      <div>
                        <b style={{ display: "block", fontSize: "0.9rem", color: lesson.completed ? "var(--text-muted)" : "#fff" }}>
                          {lesson.title}
                        </b>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{lesson.time}</span>
                      </div>
                    </div>
                    
                    <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                      {lesson.level.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


function GlossaryPage({ setPage }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [activeTerm, setActiveTerm] = useState(null); // For the Deep-Dive Drawer

  // The Starter Seed Database (~150+ terms baseline structure)
  const GLOSSARY_TERMS = [
    {
      term: "Asset",
      full_name: "Asset",
      category: "Personal Finance",
      level: "Beginner",
      definition: "Something that has economic value and is owned or controlled by a person or entity.",
      simple_explanation: "Something you own that has monetary value and helps build wealth.",
      example: "Bank balances, equity mutual funds, gold, and residential real estate are all personal assets.",
      common_mistake: "Counting your primary residence as an income-generating asset when it primarily acts as a consumption liability due to ongoing maintenance and mortgage costs.",
      why_it_matters: "Growing your assets faster than your liabilities is the core mechanical definition of building net worth.",
      related_terms: ["Liability", "Net Worth", "Equity"],
      tool_link: null,
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "Liability",
      full_name: "Liability",
      category: "Personal Finance",
      level: "Beginner",
      definition: "A financial obligation or amount owed by a person or entity to an external party.",
      simple_explanation: "Money that you owe to someone else that drains cash flow over time.",
      example: "A home loan, car loan, credit card outstanding bill, or personal loan.",
      common_mistake: "Treating all debt as inherently bad. Low-interest productive debt (like a leveraged business loan or education loan) differs fundamentally from high-interest consumer credit card debt.",
      why_it_matters: "High liabilities choke monthly cash flow and drag down your overall net worth.",
      related_terms: ["Asset", "Debt", "Net Worth"],
      tool_link: null,
      academy_link: "Academy",
      source: "RBI Financial Literacy",
      reviewed: "August 2026"
    },
    {
      term: "Net Worth",
      full_name: "Net Worth",
      category: "Personal Finance",
      level: "Beginner",
      definition: "The total economic value of all assets minus total outstanding liabilities.",
      simple_explanation: "What you actually own minus what you owe. Your absolute financial scorecard.",
      example: "If your total assets equal ₹15,00,000 and your total loans equal ₹5,00,000, your net worth is ₹10,00,000.",
      common_mistake: "Looking only at monthly income rather than cumulative net worth to measure true financial health.",
      why_it_matters: "Net worth tracking reveals whether your long-term wealth is actually compounding or stagnating.",
      related_terms: ["Asset", "Liability", "Cash Flow"],
      tool_link: "Net Worth",
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "Cash Flow",
      full_name: "Cash Flow",
      category: "Personal Finance",
      level: "Beginner",
      definition: "The net amount of cash and cash equivalents moving into and out of a financial profile over a specific period.",
      simple_explanation: "The physical movement of money in (income) versus out (expenses).",
      example: "If ₹75,000 enters your salary account and ₹50,000 leaves for rent, food, and bills, your net monthly cash flow is +₹25,000.",
      common_mistake: "Confusing high income with positive cash flow. High-earning individuals with bloated lifestyles often experience negative monthly cash flow.",
      why_it_matters: "Positive cash flow provides the raw fuel required for emergency savings and investment compounding.",
      related_terms: ["Income", "Expense", "Savings Rate"],
      tool_link: "Cash Flow",
      academy_link: "Academy",
      source: "RBI Financial Literacy",
      reviewed: "August 2026"
    },
    {
      term: "Budget",
      full_name: "Budget",
      category: "Personal Finance",
      level: "Beginner",
      definition: "A tactical quantitative plan for allocating expected income among spending, saving, and investing priorities.",
      simple_explanation: "A proactive blueprint for where every rupee of your income should go before you spend it.",
      example: "Allocating 50% to needs, 30% to wants, and 20% to savings (the 50/30/20 rule).",
      common_mistake: "Treating a budget as an unbearable restriction rather than a spending permission slip aligned with your values.",
      why_it_matters: "Without a structured budget, lifestyle inflation silently devours cash flow before it can be invested.",
      related_terms: ["Expense", "Cash Flow", "Savings Rate"],
      tool_link: "Budgets",
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "Inflation",
      full_name: "Inflation",
      category: "Economics",
      level: "Beginner",
      definition: "A sustained quantitative increase in the general price level of goods and services over an economic cycle.",
      simple_explanation: "The silent tax that causes the purchasing power of your money to shrink year after year.",
      example: "If inflation averages 6% per year, an item costing ₹100 today will cost approximately ₹106 next year.",
      common_mistake: "Leaving long-term wealth sitting entirely in low-yield savings accounts that pay 3% while inflation runs at 6%, guaranteeing a loss of real purchasing power.",
      why_it_matters: "Beating inflation through equity and asset growth is mandatory for long-term financial independence.",
      related_terms: ["Purchasing Power", "CPI", "Real Return"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "Reserve Bank of India (RBI)",
      reviewed: "August 2026"
    },
    {
      term: "Compound Interest",
      full_name: "Compound Interest",
      category: "Investing",
      level: "Beginner",
      definition: "The mathematical process where interest or returns accrue not only on the initial principal but also on accumulated interest from prior periods.",
      simple_explanation: "Snowball effect for money—your investment returns start generating their own returns.",
      example: "Investing ₹10,000 at 12% annual compounding turns into ₹31,058 over 10 years without adding another rupee.",
      common_mistake: "Underestimating the incredible acceleration curve of compounding in the later decades while ignoring it in the early years.",
      why_it_matters: "Albert Einstein famously called compounding the eighth wonder of the world; it is the absolute engine of wealth creation.",
      related_terms: ["Compounding", "CAGR", "Time Value of Money"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "SIP",
      full_name: "Systematic Investment Plan",
      category: "Mutual Funds",
      level: "Beginner",
      definition: "A disciplined methodology offered by mutual funds to invest a fixed amount of money at regular intervals in a scheme.",
      simple_explanation: "Automated recurring investing (e.g., ₹5,000 every month) that removes emotion from market timing.",
      example: "Setting an auto-debit of ₹5,000 on the 5th of every month into an Index Fund.",
      common_mistake: "Pausing or stopping your SIPs during a short-term market correction when units are actually available at a cheaper discount (Rupee Cost Averaging).",
      why_it_matters: "SIP enforces financial discipline and harnesses rupee-cost averaging for retail investors.",
      related_terms: ["Mutual Fund", "NAV", "XIRR", "Lump Sum"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "AMFI India",
      reviewed: "August 2026"
    },
    {
      term: "NAV",
      full_name: "Net Asset Value",
      category: "Mutual Funds",
      level: "Beginner",
      definition: "The per-unit market value of a mutual fund scheme calculated daily after accounting for portfolio assets and liabilities.",
      simple_explanation: "The 'price' or valuation of a single unit of a mutual fund scheme.",
      example: "If a mutual fund's net portfolio assets total ₹100 crore and there are 5 crore units outstanding, the NAV is ₹20.",
      common_mistake: "Believing that a lower NAV (e.g., ₹15) means a fund is 'cheaper' or a higher NAV (e.g., ₹500) makes a fund 'expensive'. NAV is just a reflection of per-unit value.",
      why_it_matters: "NAV tracks your holdings' valuation changes, but portfolio quality and underlying earnings drive actual returns.",
      related_terms: ["Mutual Fund", "AUM", "Expense Ratio"],
      tool_link: null,
      academy_link: "Academy",
      source: "AMFI India",
      reviewed: "August 2026"
    },
    {
      term: "Expense Ratio",
      full_name: "Total Expense Ratio",
      category: "Mutual Funds",
      level: "Intermediate",
      definition: "The annual percentage fee charged by a mutual fund asset management company (AMC) to manage your money.",
      simple_explanation: "The operational management fee deducted directly from your fund's returns every single year.",
      example: "A 1% expense ratio means ₹1,000 is deducted annually on a ₹1,00,000 investment portfolio.",
      common_mistake: "Ignoring a 0.5% difference in expense ratios; over a 20-year horizon, higher fees can eat away lakhs of compounding returns.",
      why_it_matters: "Lower expense ratios (like in direct index funds) leave more money inside your compounding engine.",
      related_terms: ["NAV", "AMC", "Direct Plan"],
      tool_link: null,
      academy_link: "Academy",
      source: "AMFI India",
      reviewed: "August 2026"
    },
    {
      term: "Market Capitalization",
      full_name: "Market Capitalization",
      category: "Stocks",
      level: "Beginner",
      definition: "The aggregate market valuation of a publicly traded company calculated by multiplying share price by total outstanding shares.",
      simple_explanation: "How massive the stock market collectively judges a corporation to be.",
      example: "A company with 10 crore shares trading at ₹400 each has a market capitalization of ₹4,000 crore (Small Cap / Mid Cap classification).",
      common_mistake: "Equating high absolute share price with high company size. A ₹3,000 stock can have a lower market cap than a ₹300 stock.",
      why_it_matters: "Market cap dictates whether a stock is classified as Large-Cap (stable), Mid-Cap (growth), or Small-Cap (high potential/high volatility).",
      related_terms: ["Large Cap", "Mid Cap", "Small Cap", "Share"],
      tool_link: "Markets",
      academy_link: "Academy",
      source: "SEBI / NSE",
      reviewed: "August 2026"
    },
    {
      term: "P/E Ratio",
      full_name: "Price-to-Earnings Ratio",
      category: "Stocks",
      level: "Intermediate",
      definition: "A fundamental valuation metric comparing a company's current share price to its annual earnings per share (EPS).",
      simple_explanation: "How many rupees investors are willing to pay for every ₹1 of annual earnings the company generates.",
      example: "If a stock trades at ₹500 and earns ₹25 per share over the year, its P/E ratio is 20x.",
      common_mistake: "Comparing P/E ratios blindly across completely different industries. A software company naturally commands a higher P/E than a traditional manufacturing utility.",
      why_it_matters: "P/E helps determine whether a stock is overvalued or attractively priced relative to its earnings power.",
      related_terms: ["EPS", "P/B Ratio", "Valuation"],
      tool_link: "Markets",
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "CAGR",
      full_name: "Compound Annual Growth Rate",
      category: "Investing",
      level: "Intermediate",
      definition: "The geometric annual growth rate that assumes an investment grew at a steady rate over a multi-year period, smoothing out volatility.",
      simple_explanation: "The smoothed annual return percentage of an investment from start to finish.",
      example: "Turning ₹1,00,000 into ₹2,00,000 over 5 years yields a CAGR of approximately 14.87%.",
      common_mistake: "Using CAGR for irregular cash flow portfolios like SIPs (where multiple investments occur on different dates). XIRR must be used for SIPs instead.",
      why_it_matters: "CAGR allows accurate head-to-head performance comparisons between different asset classes.",
      related_terms: ["XIRR", "Compound Interest", "Return"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "SEBI Investor Education",
      reviewed: "August 2026"
    },
    {
      term: "XIRR",
      full_name: "Extended Internal Rate of Return",
      category: "Investing",
      level: "Intermediate",
      definition: "An advanced annualized return metric that accounts for exact cash flow dates and amounts, making it ideal for periodic investments.",
      simple_explanation: "The true annualized return of a portfolio where you add or withdraw money at irregular intervals.",
      example: "Calculating the exact return of your mutual fund portfolio where you added ₹5k in Jan, skipped Feb, and added ₹10k in March.",
      common_mistake: "Using simple average return or standard CAGR to measure SIP portfolios, which leads to wildly distorted return figures.",
      why_it_matters: "XIRR is the gold standard metric used by institutional investors in India to evaluate real SIP and multi-transaction performance.",
      related_terms: ["CAGR", "SIP", "IRR"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "AMFI India",
      reviewed: "August 2026"
    },
    {
      term: "EMI",
      full_name: "Equated Monthly Instalment",
      category: "Debt & Credit",
      level: "Beginner",
      definition: "A fixed periodic payment made by a borrower to a lender on a specified date each month to clear principal and interest dues.",
      simple_explanation: "The fixed monthly cheque or auto-debit you pay to service a loan.",
      example: "Paying ₹22,000 every month for a car loan consisting of both interest charges and principal paydown.",
      common_mistake: "Failing to look at amortization schedules early in a loan lifecycle, where almost 80% of early EMIs go purely toward bank interest rather than principal reduction.",
      why_it_matters: "Managing your EMI-to-income ratio prevents debt traps and maintains healthy cash flow.",
      related_terms: ["Principal", "Interest", "Tenure", "Amortization"],
      tool_link: "Tools",
      academy_link: "Academy",
      source: "RBI Financial Literacy",
      reviewed: "August 2026"
    },
    {
      term: "Capital Gain",
      full_name: "Capital Gain",
      category: "Tax",
      level: "Intermediate",
      definition: "The financial profit earned when a capital asset (such as stocks, mutual funds, or real estate) is sold for a price higher than its purchase cost.",
      simple_explanation: "The profit you make when selling an investment asset, subject to government taxation.",
      example: "Buying mutual fund units for ₹1,00,000 and selling them later for ₹1,50,000 generates a capital gain of ₹50,000.",
      common_mistake: "Confusing unbooked notional gains (paper profits) with realized capital gains. Tax is triggered only upon sale/transfer.",
      why_it_matters: "Understanding Short-Term (STCG) vs Long-Term (LTCG) tax rules optimizes your after-tax investment returns.",
      related_terms: ["STCG", "LTCG", "Capital Loss"],
      tool_link: "Tax Centre",
      academy_link: "Academy",
      source: "Income Tax Department of India",
      reviewed: "August 2026"
    },
    {
      term: "TDS",
      full_name: "Tax Deducted at Source",
      category: "Tax",
      level: "Beginner",
      definition: "A statutory mechanism where the entity making specified payments (salary, interest, rent) deducts income tax upfront before releasing net funds.",
      simple_explanation: "Tax collected at the exact point of payment before the money even hits your bank account.",
      example: "Your bank deducting 10% TDS on fixed deposit interest payouts exceeding statutory limits.",
      common_mistake: "Assuming TDS is your final full tax liability without filing an annual income tax return (ITR) to claim applicable refunds or compute total slab adjustments.",
      why_it_matters: "Tracking TDS via Form 26AS ensures you don't overpay taxes or miss government credits.",
      related_terms: ["Income Tax", "Taxable Income", "Assessment Year"],
      tool_link: "Tax Centre",
      academy_link: "Academy",
      source: "Income Tax Department of India",
      reviewed: "August 2026"
    }
  ];

  // Alphabet Index Array
  const ALPHABET = ["All", ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")];
  const CATEGORIES = ["All", "Personal Finance", "Investing", "Mutual Funds", "Stocks", "Debt & Credit", "Tax", "Economics"];
  const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filter Logic
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesSearch = 
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.simple_explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || item.level === selectedLevel;
      const matchesLetter = selectedLetter === "All" || item.term.toUpperCase().startsWith(selectedLetter);

      return matchesSearch && matchesCat && matchesLevel && matchesLetter;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedLetter]);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem" }}>
      
      {/* 1. Header Banner */}
      <div className="card glass-card" style={{ padding: "2rem", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <BookOpen size={20} color="#00f0ff" />
            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#fff" }}>Financial Glossary</h2>
            <span style={{ background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700" }}>
              SEBI & AMFI ALIGNED
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Master financial terminology with simple explanations, practical examples, and direct ties to your Variance tools.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "10px 16px", minWidth: "300px" }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search 150+ financial terms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", outline: "none", fontSize: "0.9rem", width: "100%" }}
          />
        </div>
      </div>

      {/* 2. Interactive A-Z Bar */}
      <div className="card glass-card" style={{ padding: "1rem 1.25rem", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", minWidth: "max-content" }}>
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              style={{
                background: selectedLetter === letter ? "#00f0ff" : "rgba(255, 255, 255, 0.03)",
                color: selectedLetter === letter ? "#090e1a" : "#fff",
                border: selectedLetter === letter ? "none" : "1px solid var(--card-border)",
                borderRadius: "6px",
                width: "32px",
                height: "32px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category & Level Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Categories */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? "rgba(0, 240, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: selectedCategory === cat ? "#00f0ff" : "var(--text-muted)",
                border: selectedCategory === cat ? "1px solid rgba(0, 240, 255, 0.4)" : "1px solid var(--card-border)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Levels */}
        <div style={{ display: "flex", gap: "8px" }}>
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              style={{
                background: selectedLevel === lvl ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: selectedLevel === lvl ? "#a855f7" : "var(--text-muted)",
                border: selectedLevel === lvl ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid var(--card-border)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

      </div>

      {/* 4. Terms Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item, idx) => (
            <div 
              key={idx}
              className="card glass-card"
              onClick={() => setActiveTerm(item)}
              style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", transition: "transform 0.2s ease, border-color 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#00f0ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>{item.term}</h3>
                  <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: item.level === "Beginner" ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 171, 0, 0.1)", color: item.level === "Beginner" ? "#00e676" : "#ffab00", fontWeight: "700" }}>
                    {item.level}
                  </span>
                </div>

                <span style={{ display: "inline-block", fontSize: "0.75rem", color: "#00f0ff", marginBottom: "12px", fontWeight: "600" }}>
                  {item.category}
                </span>

                <p style={{ margin: "0 0 1rem 0", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  {item.simple_explanation}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--card-border)", paddingTop: "12px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Source: {item.source}</span>
                <span style={{ fontSize: "0.8rem", color: "#00f0ff", fontWeight: "600" }}>Read Deep Dive →</span>
              </div>
            </div>
          ))
        ) : (
          <div className="card glass-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", color: "#fff", margin: "0 0 8px 0" }}>No financial terms found matching your query.</p>
            <span>Try searching for terms like "SIP", "CAGR", "Inflation", or "Net Worth".</span>
          </div>
        )}
      </div>

      {/* 5. Deep-Dive Modal / Drawer */}
      {activeTerm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card glass-card" style={{ width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", border: "1px solid #00f0ff" }}>
            
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#00f0ff", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{activeTerm.category} • {activeTerm.level}</span>
                <h2 style={{ fontSize: "1.8rem", color: "#fff", margin: "4px 0 0 0" }}>{activeTerm.full_name || activeTerm.term}</h2>
              </div>
              <button onClick={() => setActiveTerm(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "6px" }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Simple Definition */}
              <div style={{ background: "rgba(0, 240, 255, 0.05)", padding: "1.25rem", borderRadius: "8px", borderLeft: "3px solid #00f0ff" }}>
                <h4 style={{ color: "#00f0ff", margin: "0 0 6px 0", fontSize: "0.9rem" }}>🧒 IN SIMPLE WORDS</h4>
                <p style={{ color: "#fff", margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>{activeTerm.simple_explanation}</p>
              </div>

              {/* Technical Definition */}
              <div>
                <h4 style={{ color: "var(--text-muted)", margin: "0 0 6px 0", fontSize: "0.85rem", textTransform: "uppercase" }}>Technical Definition</h4>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}>{activeTerm.definition}</p>
              </div>

              {/* Real World Example */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                <h4 style={{ color: "#a855f7", margin: "0 0 6px 0", fontSize: "0.9rem" }}>💡 PRACTICAL EXAMPLE</h4>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>{activeTerm.example}</p>
              </div>

              {/* Common Mistake */}
              {activeTerm.common_mistake && (
                <div style={{ background: "rgba(255, 82, 82, 0.05)", padding: "1.25rem", borderRadius: "8px", border: "1px solid rgba(255, 82, 82, 0.2)" }}>
                  <h4 style={{ color: "#ff5252", margin: "0 0 6px 0", fontSize: "0.9rem" }}>❌ COMMON MISCONCEPTION</h4>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>{activeTerm.common_mistake}</p>
                </div>
              )}

              {/* Why it Matters */}
              {activeTerm.why_it_matters && (
                <div>
                  <h4 style={{ color: "#00e676", margin: "0 0 6px 0", fontSize: "0.9rem" }}>🎯 WHY IT MATTERS</h4>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>{activeTerm.why_it_matters}</p>
                </div>
              )}

              {/* Related Tools / Academy Link */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Source: <b>{activeTerm.source}</b> (Reviewed: {activeTerm.reviewed})
                </span>

                {activeTerm.tool_link && (
                  <button 
                    onClick={() => {
                      setPage(activeTerm.tool_link);
                      setActiveTerm(null);
                    }}
                    className="btn-primary"
                    style={{ background: "#00f0ff", color: "#090e1a", padding: "8px 16px", fontSize: "0.85rem", border: "none" }}
                  >
                    Open Related Tool →
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function TaxCentrePage() {
  // 1. Regime Comparison State
  const [salaryIncome, setSalaryIncome] = useState(1500000);
  const [otherIncome, setOtherIncome] = useState(50000);
  const [deduction80C, setDeduction80C] = useState(150000);
  const [deduction80D, setDeduction80D] = useState(25000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);

  // 2. Capital Gains State
  const [cgType, setCgType] = useState("equity"); // equity, property
  const [buyPrice, setBuyPrice] = useState(200000);
  const [sellPrice, setSellPrice] = useState(500000);
  const [holdingMonths, setHoldingMonths] = useState(14);

  // --- CALCULATE OLD REGIME TAX ---
  const calculateOldTax = () => {
    const gross = Number(salaryIncome) + Number(otherIncome);
    const standardDeduction = 50000;
    const totalDeductions = Math.min(Number(deduction80C), 150000) + Math.min(Number(deduction80D), 25000) + Math.min(Number(homeLoanInterest), 200000);
    const taxableIncome = Math.max(0, gross - standardDeduction - totalDeductions);

    let tax = 0;
    if (taxableIncome > 250000 && taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome > 500000 && taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.20;
    } else if (taxableIncome > 1000000) {
      tax = 112500 + (taxableIncome - 1000000) * 0.30;
    }

    // Rebate 87A for old regime if taxable income <= 500k
    if (taxableIncome <= 500000) tax = 0;

    const cess = tax * 0.04;
    return Math.round(tax + cess);
  };

  // --- CALCULATE NEW REGIME TAX (FY 2026-27 Slabs) ---
  const calculateNewTax = () => {
    const gross = Number(salaryIncome) + Number(otherIncome);
    const standardDeduction = 75000; // Updated FY 2026-27 standard deduction
    const taxableIncome = Math.max(0, gross - standardDeduction);

    let tax = 0;
    // New Slabs: 0-4L Nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, above 24L 30%
    if (taxableIncome > 400000 && taxableIncome <= 800000) {
      tax = (taxableIncome - 400000) * 0.05;
    } else if (taxableIncome > 800000 && taxableIncome <= 1200000) {
      tax = 20000 + (taxableIncome - 800000) * 0.10;
    } else if (taxableIncome > 1200000 && taxableIncome <= 1600000) {
      tax = 60000 + (taxableIncome - 1200000) * 0.15;
    } else if (taxableIncome > 1600000 && taxableIncome <= 2000000) {
      tax = 120000 + (taxableIncome - 1600000) * 0.20;
    } else if (taxableIncome > 2000000 && taxableIncome <= 2400000) {
      tax = 200000 + (taxableIncome - 2000000) * 0.25;
    } else if (taxableIncome > 2400000) {
      tax = 300000 + (taxableIncome - 2400000) * 0.30;
    }

    // Section 87A Rebate for New Regime (Taxable income up to ₹12 Lakh is zero tax)
    if (taxableIncome <= 1200000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return Math.round(tax + cess);
  };

  const oldTax = calculateOldTax();
  const newTax = calculateNewTax();
  const savingsDifference = Math.abs(oldTax - newTax);
  const winningRegime = newTax <= oldTax ? "New Tax Regime" : "Old Tax Regime";

  // --- CAPITAL GAINS CALCULATOR LOGIC ---
  const gain = Math.max(0, Number(sellPrice) - Number(buyPrice));
  let cgTax = 0;
  const isLongTerm = cgType === "equity" ? holdingMonths > 12 : holdingMonths > 24;

  if (cgType === "equity") {
    if (isLongTerm) {
      const taxableGain = Math.max(0, gain - 125000); // ₹1.25L annual exemption
      cgTax = taxableGain * 0.125; // 12.5% LTCG
    } else {
      cgTax = gain * 0.20; // 20% STCG
    }
  } else {
    // Property / Other Assets
    if (isLongTerm) {
      cgTax = gain * 0.125; // 12.5% without indexation
    } else {
      cgTax = gain * 0.30; // Added to slab roughly
    }
  }

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4px" }}>
      
      {/* 1. Header Banner */}
      <div className="card glass-card" style={{ padding: "2rem", background: "linear-gradient(135deg, rgba(0, 230, 118, 0.05) 0%, rgba(0, 240, 255, 0.05) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Scale size={20} color="#00e676" />
            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#fff" }}>Institutional Tax Centre</h2>
            <span style={{ background: "rgba(0, 230, 118, 0.1)", color: "#00e676", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700" }}>
              FY 2026-27 COMPLIANT
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Advanced tax regime comparison, capital gains modeling, and compliance schedule for Indian taxpayers.
          </p>
        </div>
      </div>

      {/* 2. REGIME WARFARE: Old vs New Regime Simulator */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        
        {/* Controls Card */}
        <div className="card glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
            Income & Deductions Simulator
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>Annual Salary (₹)</label>
              <input 
                type="number" 
                value={salaryIncome} 
                onChange={(e) => setSalaryIncome(e.target.value)}
                className="inline-edit-input" 
                style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>Other Income (₹)</label>
              <input 
                type="number" 
                value={otherIncome} 
                onChange={(e) => setOtherIncome(e.target.value)}
                className="inline-edit-input" 
                style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>80C (Max 1.5L)</label>
              <input 
                type="number" 
                value={deduction80C} 
                onChange={(e) => setDeduction80C(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>80D (Health)</label>
              <input 
                type="number" 
                value={deduction80D} 
                onChange={(e) => setDeduction80D(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>Home Loan Sec 24</label>
              <input 
                type="number" 
                value={homeLoanInterest} 
                onChange={(e) => setHomeLoanInterest(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff", fontSize: "0.85rem" }}
              />
            </div>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>*Note: Deductions only apply to the Old Tax Regime. New Regime includes the flat ₹75,000 standard deduction.</span>
        </div>

        {/* Results Comparison Card */}
        <div className="card glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,240,255,0.03) 100%)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fff" }}>Regime Liability Face-Off</h3>
              <span style={{ background: "rgba(0, 230, 118, 0.15)", color: "#00e676", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                WINNER: {winningRegime.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Old Regime Tax</span>
                <b style={{ fontSize: "1.3rem", color: "#fff", display: "block", marginTop: "4px" }}>{money(oldTax)}</b>
              </div>
              <div style={{ padding: "1rem", background: "rgba(0, 240, 255, 0.05)", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.3)" }}>
                <span style={{ display: "block", fontSize: "0.72rem", color: "#00f0ff", textTransform: "uppercase" }}>New Regime Tax</span>
                <b style={{ fontSize: "1.3rem", color: "#00f0ff", display: "block", marginTop: "4px" }}>{money(newTax)}</b>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(0, 230, 118, 0.05)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(0, 230, 118, 0.2)" }}>
            <span style={{ fontSize: "0.8rem", color: "#00e676", fontWeight: "700", display: "block", marginBottom: "2px" }}>
              💰 Optimal Savings Potential
            </span>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              By choosing the <b style={{ color: "#fff" }}>{winningRegime}</b>, you preserve an extra <b style={{ color: "#00e676" }}>{money(savingsDifference)}</b> in your annual cash flow.
            </p>
          </div>
        </div>

      </div>

      {/* 3. Capital Gains Tax Estimator */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        
        <div className="card glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
            Capital Gains Tax Estimator
          </h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setCgType("equity")}
              style={{ flex: 1, padding: "10px", background: cgType === "equity" ? "rgba(0,240,255,0.15)" : "transparent", color: cgType === "equity" ? "#00f0ff" : "var(--text-muted)", border: "1px solid var(--card-border)", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              Equity / Mutual Funds
            </button>
            <button 
              onClick={() => setCgType("property")}
              style={{ flex: 1, padding: "10px", background: cgType === "property" ? "rgba(0,240,255,0.15)" : "transparent", color: cgType === "property" ? "#00f0ff" : "var(--text-muted)", border: "1px solid var(--card-border)", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              Real Estate / Gold
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>Purchase Price (₹)</label>
              <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>Sale Price (₹)</label>
              <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>Holding Period (Months)</label>
            <input type="number" value={holdingMonths} onChange={(e) => setHoldingMonths(e.target.value)} style={{ width: "100%", padding: "10px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", color: "#fff" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              Classification: <b style={{ color: "#fff" }}>{isLongTerm ? "Long-Term (LTCG)" : "Short-Term (STCG)"}</b>
            </span>
          </div>
        </div>

        {/* Capital Gains Output */}
        <div className="card glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.05rem", color: "#fff" }}>Tax Breakdown & Slabs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Capital Gain</span>
                <b style={{ color: "#fff" }}>{money(gain)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Applicable Tax Rate</span>
                <b style={{ color: "#00f0ff" }}>{isLongTerm ? "12.5% (LTCG)" : "20% (STCG)"}</b>
              </div>
            </div>
          </div>

          <div style={{ padding: "1.25rem", background: "rgba(168, 85, 247, 0.05)", borderRadius: "8px", border: "1px solid rgba(168, 85, 247, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#a855f7", textTransform: "uppercase", fontWeight: "700" }}>Estimated Capital Gains Tax</span>
              <h2 style={{ margin: "4px 0 0 0", color: "#fff", fontSize: "1.6rem" }}>{money(cgTax)}</h2>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>Includes ₹1.25L equity <br/>exemption where applicable</span>
          </div>
        </div>

      </div>

      {/* 4. Advance Tax Calendar & Compliance Schedule */}
      <div className="card glass-card" style={{ padding: "1.75rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#fff" }}>Advance Tax Compliance Schedule (FY 2026-27)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          
          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>1st Installment</span>
            <b style={{ display: "block", fontSize: "1rem", color: "#fff", margin: "4px 0" }}>June 15</b>
            <span style={{ fontSize: "0.8rem", color: "#00f0ff" }}>15% of total tax liability</span>
          </div>

          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>2nd Installment</span>
            <b style={{ display: "block", fontSize: "1rem", color: "#fff", margin: "4px 0" }}>September 15</b>
            <span style={{ fontSize: "0.8rem", color: "#00f0ff" }}>45% cumulative liability</span>
          </div>

          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>3rd Installment</span>
            <b style={{ display: "block", fontSize: "1rem", color: "#fff", margin: "4px 0" }}>December 15</b>
            <span style={{ fontSize: "0.8rem", color: "#00f0ff" }}>75% cumulative liability</span>
          </div>

          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>4th Installment</span>
            <b style={{ display: "block", fontSize: "1rem", color: "#fff", margin: "4px 0" }}>March 15</b>
            <span style={{ fontSize: "0.8rem", color: "#00f0ff" }}>100% full tax settlement</span>
          </div>

        </div>
      </div>

    </div>
  );
}



function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurring, setRecurring] = useState([]); 
  const [goals, setGoals] = useState([]); 
  const [rules, setRules] = useState([]);
  // --- THEME & STEALTH STATE ---
  const [theme, setTheme] = useState(() => localStorage.getItem("delta_theme") || "dark");
  const [isStealth, setIsStealth] = useState(false);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("delta_theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setIsStealth((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const toggleStealth = () => setIsStealth((prev) => !prev);
  // -----------------------------
  
  const [page, setPage] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCmd, setShowCmd] = useState(false);

  const updateGoal = async (id, updatedFields) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updatedFields } : g)));

    try {
      if (supabase && session?.user?.id) {
        const { error } = await supabase
          .from("goals")
          .update(updatedFields)
          .eq("id", id);

        if (error) throw error;
      } else {
        const saved = JSON.parse(localStorage.getItem("delta_goals") || "[]");
        const updated = saved.map(g => (g.id === id ? { ...g, ...updatedFields } : g));
        localStorage.setItem("delta_goals", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Failed to persist goal update:", err);
      if (setToast) setToast({ type: "error", text: "Failed to save goal deposit." });
    }
  };
  const updateTransaction = async (id, updatedFields) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));

    try {
      if (supabase && session?.user?.id) {
        const { error } = await supabase
          .from("transactions")
          .update(updatedFields)
          .eq("id", id);

        if (error) throw error;
      }
      if (setToast) setToast({ type: "success", text: "Transaction updated successfully." });
    } catch (err) {
      console.error("Failed to update transaction:", err);
      if (setToast) setToast({ type: "error", text: "Failed to persist transaction update." });
    }
  };

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("delta_vault_docs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addDocument = (doc) => {
    setDocuments(prev => {
      const updated = [doc, ...prev];
      localStorage.setItem("delta_vault_docs", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteDocument = (id) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem("delta_vault_docs", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmd(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false); 
  const [showGoalModal, setShowGoalModal] = useState(false); 
  const [showRuleModal, setShowRuleModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchTransactions = async () => {
    if (!session) return;
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    setTransactions(data || []);
  };

  const fetchSubscriptions = async () => {
    if (!session) return;
    const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    setSubscriptions(data || []);
  };

  const fetchBudgets = async () => {
    if (!session) return;
    const { data } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    setBudgets(data || []);
  };

  const fetchRecurring = async () => {
    if (!session) return;
    const { data } = await supabase.from('recurring').select('*').order('created_at', { ascending: false });
    setRecurring(data || []);
  };

  const fetchGoals = async () => {
    if (!session) return;
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    setGoals(data || []);
  };

  const fetchRules = async () => {
    if (!session) return;
    const { data } = await supabase.from('rules').select('*').order('created_at', { ascending: false });
    setRules(data || []);
  };

  const addTransaction = async (title, amount, category = "General", type = "expense") => {
    if (!session) return;
    const { error } = await supabase.from('transactions').insert([{ user_id: session.user.id, title, amount: parseFloat(amount), category, type }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Saved to cloud!" }); fetchTransactions(); }
  };

  const addSubscription = async (title, amount, category = "General", billing_cycle = "monthly") => {
    if (!session) return;
    const { error } = await supabase.from('subscriptions').insert([{ user_id: session.user.id, title, amount: parseFloat(amount), category, billing_cycle }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Subscription saved!" }); fetchSubscriptions(); }
  };

  const addBudget = async (category, monthly_limit) => {
    if (!session) return;
    const { error } = await supabase.from('budgets').insert([{ user_id: session.user.id, category, monthly_limit: parseFloat(monthly_limit) }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Budget saved!" }); fetchBudgets(); }
  };

  const addRecurring = async (title, amount, category, cadence, next_date) => {
    if (!session) return;
    const { error } = await supabase.from('recurring').insert([{ user_id: session.user.id, title, amount: parseFloat(amount), category, cadence, next_date }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Recurring bill saved!" }); fetchRecurring(); }
  };

  const addGoal = async (title, target_amount, target_date) => {
    if (!session) return;
    const { error } = await supabase.from('goals').insert([{ user_id: session.user.id, title, target_amount: parseFloat(target_amount), current_amount: 0, target_date }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Goal saved!" }); fetchGoals(); }
  };

  const addRule = async (merchant_keyword, category) => {
    if (!session) return;
    const { error } = await supabase.from('rules').insert([{ user_id: session.user.id, merchant_keyword, category }]);
    if (error) setToast({ type: "error", text: error.message });
    else { setToast({ type: "success", text: "Rule created!" }); fetchRules(); }
  };

  const deleteTransaction = async (id) => {
    if (!session) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { 
      setToast({ type: "error", text: "Database error: " + error.message }); 
    } else { 
      setToast({ type: "success", text: "Transaction deleted!" }); 
      fetchTransactions(); 
    }
  };

  const deleteRecurring = async (id) => {
    if (!session) return;
    const { error } = await supabase.from('recurring').delete().eq('id', id);
    if (!error) { setToast({ type: "success", text: "Bill deleted!" }); fetchRecurring(); }
  };

  const deleteGoal = async (id) => {
    if (!session) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) { setToast({ type: "success", text: "Goal deleted!" }); fetchGoals(); }
  };

  const deleteRule = async (id) => {
    if (!session) return;
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (!error) { setToast({ type: "success", text: "Rule deleted!" }); fetchRules(); }
  };

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchTransactions(),
        fetchSubscriptions(),
        fetchBudgets(),
        fetchRecurring(),
        fetchGoals(),
        fetchRules()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchTransactions(),
        fetchSubscriptions(),
        fetchBudgets(),
        fetchRecurring(),
        fetchGoals(),
        fetchRules()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) return <div className="loading">Loading Variance…</div>;
  if (!session) return <Auth />;

  const safeTransactions = (transactions || []).map(t => ({
    ...t, date: t.date || t.created_at || new Date().toISOString()
  }));

  const defaultCategories = ["Food", "Housing", "Utilities", "Transport", "Entertainment", "Salary", "General", "Sport", "Shopping", "Health"];
  const defaultAccounts = ["Main Account"];

  const state = {
    transactions: safeTransactions,
    recurring: recurring,
    subscriptions: subscriptions,
    budgets: budgets,
    categories: defaultCategories,
    accounts: defaultAccounts,
    tags: [],
    settings: { currency: "₹", theme: "dark", monthlyBudget: 0 }
  };

  const props = {
    state,
    transactions: safeTransactions,
    subscriptions,
    budgets,
    recurring,
    goals,
    rules,
    fetchTransactions,
    fetchSubscriptions,
    fetchBudgets,
    fetchRecurring,
    fetchGoals,
    fetchRules,
    addTransaction,
    addSubscription,
    addBudget,
    deleteTransaction,
    deleteRecurring,
    deleteGoal,
    deleteRule,
    onDelete: deleteTransaction,
    setToast,
    setPage,
    openAddSubModal: () => setShowSubModal(true),
    openAddBudgetModal: () => setShowBudgetModal(true),
    openAddRecurringModal: () => setShowRecurringModal(true),
    openAddGoalModal: () => setShowGoalModal(true),
    openAddRuleModal: () => setShowRuleModal(true)
  };

  return (
    <div className="app">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <img src="/logo.png" alt="Variance" className="logo-img" />
          <div><b>Variance</b><span>Personal finance</span></div>
        </div>
        
        <nav>
          {NAV_PILLARS.map((pillar, pIdx) => (
            <div key={pIdx} style={{ marginBottom: "0.5rem" }}>
              <div className="sidebar-category">{pillar.title}</div>
              {pillar.items.map(([n, I]) => (
                <button 
                  key={n} 
                  className={page === n ? "active" : ""} 
                  onClick={() => { setPage(n); setMenu(false); }}
                >
                  <I size={18} />{n}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 4px 4px 4px", borderTop: "1px solid var(--card-border)", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flex: 1 }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #00f0ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060913", fontWeight: "700", fontSize: "0.95rem", flexShrink: 0, boxShadow: "0 0 10px rgba(0, 240, 255, 0.2)" }}>
              {session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U"}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Account</span>
              <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-main)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.email ? session.user.email.split('@')[0] : "User"}
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to exit / sign out?")) {
                supabase.auth.signOut();
              }
            }}
            className="icon-btn"
            style={{ padding: "7px", borderRadius: "8px", color: "#ff5252", borderColor: "rgba(255, 82, 82, 0.2)", background: "rgba(255, 82, 82, 0.05)", cursor: "pointer", flexShrink: 0 }}
            title="Sign Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {menu && <div className="mobile-overlay" onClick={() => setMenu(false)} />}

      <main>
        <header className="topbar">
  <button className="icon-btn mobile-menu" onClick={() => setMenu(!menu)}><Menu /></button>
  <div>
    <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#fff" }}>{page}</h1>
  </div>

  <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {page === "Transactions" ? (
      <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Transaction</button>
    ) : page === "Subscriptions" ? (
      <button className="btn-primary" onClick={() => setShowSubModal(true)}><Plus size={16} /> Add Subscription</button>
    ) : page === "Budgets" ? (
      <button className="btn-primary" onClick={() => setShowBudgetModal(true)}><Plus size={16} /> Set Budget</button>
    ) : page === "Recurring" ? (
      <button className="btn-primary" onClick={() => setShowRecurringModal(true)}><Plus size={16} /> Add Bill</button>
    ) : page === "Goals" ? (
      <button className="btn-primary" onClick={() => setShowGoalModal(true)}><Plus size={16} /> Add Goal</button>
    ) : page === "Rules" ? (
      <button className="btn-primary" onClick={() => setShowRuleModal(true)}><Plus size={16} /> Add Rule</button>
    ) : null}
  </div>
</header>

        <div className="content">
          {page === "Dashboard" && <Dashboard {...props} />}
          {page === "Net Worth" && <NetWorth />}
          {page === "Cash Flow" && <CashFlow transactions={safeTransactions} budgets={budgets} />}
          {page === "Insights" && (
            <InsightsPage 
              transactions={safeTransactions} 
              budgets={budgets} 
              recurring={recurring} 
              subscriptions={subscriptions} 
              goals={goals} 
            />
          )}
          {page === "Transactions" && (
            <Transactions 
              {...props} 
              updateTransaction={updateTransaction}
              openTransactionModal={() => setShowAddModal(true)} 
              setToast={setToast} 
            />
          )}
          {page === "Recurring" && <Recurring {...props} openRecurringModal={() => setShowRecurringModal(true)} />}
          {page === "Calendar" && <EconomicCalendar />}
          {page === "Subscriptions" && <Subscriptions {...props} />}
          {page === "Investments" && <InvestmentsPage />}
          {page === "Assets" && <AssetsPage />}
          {page === "Liabilities" && <LiabilitiesPage />}
          {page === "Insurance" && <InsurancePage />}
          {page === "Markets" && <MarketsPage />}
          {page === "Academy" && <AcademyPage />}
          {page === "Glossary" && <GlossaryPage setPage={setPage} />}
          {page === "Tax Centre" && <TaxCentrePage />}
          {page === "Budgets" && <Budgets {...props} />}
          {page === "Goals" && (
            <Goals 
              {...props} 
              goals={goals}
              updateGoal={updateGoal} 
              deleteGoal={deleteGoal}
              openGoalModal={() => setShowGoalModal(true)} 
              setToast={setToast} 
            />
          )}
          {page === "Tools" && <FinancialTools setToast={setToast} />}
          {page === "Documents" && (
            <Documents 
              documents={documents} 
              addDocument={addDocument} 
              deleteDocument={deleteDocument} 
              setToast={setToast} 
            />
          )}
          {page === "Rules" && (
            <Rules 
              {...props} 
              setTransactions={setTransactions} 
              openRuleModal={() => setShowRuleModal(true)} 
              setToast={setToast} 
            />
          )}
          {page === "Settings" && <SettingsPage session={session} setToast={setToast} />}

          {!["Dashboard", "Net Worth","Cash Flow","Insights","Transactions", "Recurring", "Subscriptions", "Budgets", "Goals", "Tools", "Documents", "Rules", "Settings","Calendar","Investments","Assets", "Liabilities","Insurance","Markets","Academy" ,"Glossary","Tax Centre"].includes(page) && (
            <PlaceholderPage title={page} />
          )}
        </div>
      </main>

      <AddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={addTransaction} />
      <AddSubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} onSave={addSubscription} categories={defaultCategories} />
      <AddBudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} onSave={addBudget} categories={defaultCategories} />
      <AddRecurringModal isOpen={showRecurringModal} onClose={() => setShowRecurringModal(false)} onSave={addRecurring} categories={defaultCategories} />
      <AddGoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} onSave={addGoal} />
      <AddRuleModal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} onSave={addRule} categories={defaultCategories} />
      <CommandPalette
        isOpen={showCmd}
        onClose={() => setShowCmd(false)}
        setPage={setPage}
        openModal={(type) => {
          if (type === "tx") setShowAddModal(true);
          if (type === "sub") setShowSubModal(true);
          if (type === "bud") setShowBudgetModal(true);
          if (type === "rec") setShowRecurringModal(true);
          if (type === "goal") setShowGoalModal(true);
        }}
      />

      {toast && <div className={`toast ${toast.type}`}><AlertCircle size={17} />{toast.text}</div>}
      
      <div className="bottom-nav">
        {[
          ["Dashboard", LayoutDashboard], 
          ["Transactions", ReceiptText], 
          ["Investments", LineChart], 
          ["Tools", Calculator], 
          ["Settings", Settings]
        ].map(([n, I]) => (
          <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>
            <I size={17} /><span>{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function inPeriod(date, period) {
  if (!date) return true;
  const d = new Date(), x = new Date(date);
  if (period === "all-time") return true;
  
  // Last 7 Days
  if (period === "last-7-days") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(d.getDate() - 7);
    return x >= sevenDaysAgo;
  }
  
  const startThisMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  if (period === "this-month") return x >= startThisMonth;
  if (period === "last-month") return x >= new Date(d.getFullYear(), d.getMonth() - 1, 1) && x < startThisMonth;
  if (period === "last-3-months") return x >= new Date(d.getFullYear(), d.getMonth() - 2, 1);
  if (period === "last-6-months") return x >= new Date(d.getFullYear(), d.getMonth() - 5, 1);
  if (period === "this-year") return x >= new Date(d.getFullYear(), 0, 1);
  return true;
}

function Period({ value, onChange }) {
  return (
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      style={{
        background: "#0b0f19",
        color: "var(--accent-cyan)",
        border: "1px solid var(--card-border)",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "0.85rem",
        fontWeight: "600",
        cursor: "pointer",
        outline: "none"
      }}
    >
      <option value="last-7-days">Last 7 Days</option>
      <option value="this-month">This Month</option>
      <option value="last-month">Last Month</option>
      <option value="last-3-months">Last 3 Months</option>
      <option value="last-6-months">Last 6 Months</option>
      <option value="this-year">This Year</option>
      <option value="all-time">All Time</option>
    </select>
  );
}


function SmartInsights() {
  return null;
}

function FinancialScoreCard({ transactions = [], budgets = [], recurring = [] }) {
  const { score, status, runwayMonths, subScores } = useMemo(() => {
    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const fixedCosts = recurring.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const balance = income - expense;

    // 1. Savings Rate Score (Max 35 pts)
    let savingsScore = 0;
    if (income > 0) {
      const rate = ((income - expense) / income) * 100;
      if (rate >= 30) savingsScore = 35;
      else if (rate >= 20) savingsScore = 28;
      else if (rate >= 10) savingsScore = 18;
      else if (rate > 0) savingsScore = 10;
    }

    // 2. Budget Discipline Score (Max 25 pts)
    let budgetScore = 25;
    if (budgets.length > 0) {
      budgets.forEach(b => {
        const spent = transactions
          .filter(t => t.type === "expense" && t.category === b.category)
          .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        if (spent > (parseFloat(b.monthly_limit) || 1)) {
          budgetScore = Math.max(0, budgetScore - 8);
        }
      });
    }

    // 3. Fixed Commitment Burden (Max 20 pts)
    let fixedScore = 20;
    if (income > 0) {
      const fixedRatio = (fixedCosts / income) * 100;
      if (fixedRatio > 50) fixedScore = 8;
      else if (fixedRatio > 35) fixedScore = 14;
    }

    // 4. Emergency Runway (Max 20 pts)
    let runwayScore = 10;
    const monthlyBurn = expense > 0 ? expense : (fixedCosts || 1);
    const months = monthlyBurn > 0 ? (Math.max(0, balance) / monthlyBurn).toFixed(1) : "0.0";
    if (parseFloat(months) >= 6) runwayScore = 20;
    else if (parseFloat(months) >= 3) runwayScore = 15;
    else if (parseFloat(months) >= 1) runwayScore = 10;
    else runwayScore = 4;

    const total = Math.min(100, Math.round(savingsScore + budgetScore + fixedScore + runwayScore));

    let stat = { label: "Prime Fitness", class: "score-excellent" };
    if (total < 50) stat = { label: "Needs Restructuring", class: "score-poor" };
    else if (total < 70) stat = { label: "Fair Stability", class: "score-fair" };
    else if (total < 85) stat = { label: "Strong Health", class: "score-good" };

    return {
      score: total,
      status: stat,
      runwayMonths: months,
      subScores: { savingsScore, budgetScore, fixedScore, runwayScore }
    };
  }, [transactions, budgets, recurring]);

  return (
    <div className="score-badge-container glass-card">
      <div className={`score-circle ${status.class}`}>
        {score}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "1rem", color: "#fff", fontWeight: "700" }}>
              Financial Vitality Index
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Rating: <b style={{ color: "#fff" }}>{status.label}</b>
            </span>
          </div>

          <div className="runway-pill">
            <Calculator size={14} color="#a855f7" />
            <span>Runway: <b>{runwayMonths} Mo.</b></span>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.72rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
          <span>Savings Velocity: <b style={{ color: "#00f0ff" }}>{subScores.savingsScore}/35</b></span>
          <span>Budget Adherence: <b style={{ color: "#a855f7" }}>{subScores.budgetScore}/25</b></span>
          <span>Fixed Cost Safety: <b style={{ color: "#00e676" }}>{subScores.fixedScore}/20</b></span>
          <span>Runway Liquidity: <b style={{ color: "#ffab00" }}>{subScores.runwayScore}/20</b></span>
        </div>
      </div>
    </div>
  );
}



function Dashboard({ transactions = [], budgets = [], subscriptions = [], recurring = [], goals = [], setPage }) {
  // Helper for money formatting
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const COLORS = ["#00f0ff", "#a855f7", "#00e676", "#ff5252", "#ffab00", "#ec4899", "#3b82f6"];
  const [timeframe, setTimeframe] = useState("1M"); // "7D" | "1M" | "3M" | "6M" | "1Y" | "ALL"

  // 1. Core Period Metrics
  const periodMetrics = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (timeframe === "7D") cutoff.setDate(now.getDate() - 7);
    else if (timeframe === "1M") cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === "3M") cutoff.setMonth(now.getMonth() - 3);
    else if (timeframe === "6M") cutoff.setMonth(now.getMonth() - 6);
    else if (timeframe === "1Y") cutoff.setFullYear(now.getFullYear() - 1);
    else if (timeframe === "ALL") cutoff.setTime(0);

    const filtered = transactions.filter(t => {
      const entryDate = t.created_at || t.date;
      if (!entryDate) return true;
      return new Date(entryDate) >= cutoff;
    });

    const grossInflow = filtered.filter(t => t.type === "income").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalBurn = filtered.filter(t => t.type === "expense" && !(t.category || "").toLowerCase().includes("invest")).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const capitalAllocated = filtered.filter(t => (t.category || "").toLowerCase().includes("invest") || (t.title || "").toLowerCase().includes("sip")).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const retainedCashflow = grossInflow - (totalBurn + capitalAllocated);
    const savingsRate = grossInflow > 0 ? Math.round(((grossInflow - totalBurn) / grossInflow) * 100) : 0;

    return { grossInflow, totalBurn, capitalAllocated, retainedCashflow, savingsRate, count: filtered.length };
  }, [transactions, timeframe]);

  // 2. Real Financial Vitality Math Engine
  const vitalityStats = useMemo(() => {
    // A. Savings Score (Max 35) - Target > 20%
    const savingsScore = Math.min(35, Math.max(0, (periodMetrics.savingsRate / 20) * 35));
    
    // B. Budget Adherence (Max 25)
    const totalBudget = budgets.reduce((acc, b) => acc + (parseFloat(b.monthly_limit) || 0), 0);
    const budgetSpent = transactions.filter(t => t.type === "expense" && budgets.some(b => b.category === t.category)).reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const budgetRatio = totalBudget > 0 ? (budgetSpent / totalBudget) : 0.5; // default if no budgets
    const budgetScore = Math.min(25, Math.max(0, (1 - budgetRatio) * 25));

    // C. Fixed Cost Safety (Max 20)
    const fixedCosts = subscriptions.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0) + recurring.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const fixedRatio = periodMetrics.grossInflow > 0 ? (fixedCosts / periodMetrics.grossInflow) : 0.2;
    const fixedScore = Math.min(20, Math.max(0, (1 - (fixedRatio * 2)) * 20));

    // D. Runway Calculation (Max 20)
    const monthlyBurn = periodMetrics.totalBurn > 0 ? periodMetrics.totalBurn : 20000; // Default burn to avoid infinity
    const cumulativeBalance = transactions.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0) - transactions.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    const runwayMonths = Math.max(0, cumulativeBalance / monthlyBurn);
    const runwayScore = Math.min(20, Math.max(0, (runwayMonths / 6) * 20)); // Target 6 months runway

    const totalScore = Math.round(savingsScore + budgetScore + fixedScore + runwayScore) || 45; // Default 45 if empty
    let rating = "Critical";
    let color = "#ff5252";
    if (totalScore >= 80) { rating = "Strong Health"; color = "#00e676"; }
    else if (totalScore >= 60) { rating = "Stable"; color = "#00f0ff"; }
    else if (totalScore >= 40) { rating = "Needs Attention"; color = "#ffab00"; }

    return { totalScore, rating, color, details: { savings: Math.round(savingsScore), budget: Math.round(budgetScore), fixed: Math.round(fixedScore), runwayScore: Math.round(runwayScore), runwayMonths: runwayMonths.toFixed(1) } };
  }, [periodMetrics, transactions, budgets, subscriptions, recurring]);

  // 3. Chronologically Sorted Chart Data
  const cashflowTrendData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (timeframe === "7D") cutoff.setDate(now.getDate() - 7);
    else if (timeframe === "1M") cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === "3M") cutoff.setMonth(now.getMonth() - 3);
    else if (timeframe === "6M") cutoff.setMonth(now.getMonth() - 6);
    else if (timeframe === "1Y") cutoff.setFullYear(now.getFullYear() - 1);
    else if (timeframe === "ALL") cutoff.setTime(0);

    const filtered = transactions.filter(t => new Date(t.created_at || t.date || new Date()) >= cutoff);
    const dateMap = {};

    filtered.forEach(t => {
      const rawDate = new Date(t.created_at || t.date || new Date());
      const formattedDate = rawDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (!dateMap[formattedDate]) dateMap[formattedDate] = { date: formattedDate, raw: rawDate, inflow: 0, burn: 0 };
      
      const amt = parseFloat(t.amount) || 0;
      if (t.type === "income") dateMap[formattedDate].inflow += amt;
      else dateMap[formattedDate].burn += amt;
    });

    // Chronological Sort (Oldest to Newest)
    const sorted = Object.values(dateMap).sort((a, b) => a.raw - b.raw);
    return sorted.length > 0 ? sorted : [{ date: "Today", inflow: periodMetrics.grossInflow, burn: periodMetrics.totalBurn }];
  }, [transactions, timeframe, periodMetrics]);

  const categoryData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      const cat = t.category || "General";
      map[cat] = (map[cat] || 0) + (parseFloat(t.amount) || 0);
    });
    const data = Object.entries(map).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: "No Data", value: 1 }];
  }, [transactions]);

  // Mock calculation for cumulative total
  const cumulativeNetBalance = transactions.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0) - transactions.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. True Vitality Engine Card */}
      <div className="card glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", background: `conic-gradient(${vitalityStats.color} ${vitalityStats.totalScore}%, rgba(255,255,255,0.05) 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "66px", height: "66px", borderRadius: "50%", background: "#090e1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "800", color: "#fff" }}>
            {vitalityStats.totalScore}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: "0 0 4px 0", color: "#fff" }}>Financial Vitality Index</h2>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Rating: <b style={{ color: vitalityStats.color }}>{vitalityStats.rating}</b></span>
            </div>
            <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarDays size={14} color="#a855f7" />
              <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: "600" }}>Runway: {vitalityStats.details.runwayMonths} Months</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(0, 230, 118, 0.08)", border: "1px solid rgba(0, 230, 118, 0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "0.72rem" }}>
              Savings Velocity: <b style={{ color: "#00e676" }}>{vitalityStats.details.savings}/35</b>
            </div>
            <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "0.72rem" }}>
              Budget Adherence: <b style={{ color: "#a855f7" }}>{vitalityStats.details.budget}/25</b>
            </div>
            <div style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "0.72rem" }}>
              Fixed Cost Safety: <b style={{ color: "#00f0ff" }}>{vitalityStats.details.fixed}/20</b>
            </div>
            <div style={{ background: "rgba(255, 171, 0, 0.08)", border: "1px solid rgba(255, 171, 0, 0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "0.72rem" }}>
              Runway Liquidity: <b style={{ color: "#ffab00" }}>{vitalityStats.details.runwayScore}/20</b>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pipeline Toolbar & Metrics */}
      <div className="dashboard-toolbar">
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Cashflow Pipeline</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Showing {periodMetrics.count} ledger entries in selected timeframe</span>
        </div>
        <div className="period-pill-group">
          {["7D", "1M", "3M", "6M", "1Y", "ALL"].map(p => (
            <button key={p} className={`period-pill-btn ${timeframe === p ? "active" : ""}`} onClick={() => setTimeframe(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="cashflow-pipeline-grid">
        <div className="cashflow-stat-card inflow">
          <span className="sub-label">Gross Inflows</span>
          <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#00e676", fontWeight: "800" }}>+{money(periodMetrics.grossInflow)}</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Earned & credited</span>
        </div>
        <div className="cashflow-stat-card burn">
          <span className="sub-label">Operational Burn</span>
          <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#ff5252", fontWeight: "800" }}>-{money(periodMetrics.totalBurn)}</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Living expenses & bills</span>
        </div>
        <div className="cashflow-stat-card invest">
          <span className="sub-label">Investments / SIP</span>
          <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#a855f7", fontWeight: "800" }}>{money(periodMetrics.capitalAllocated)}</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Wealth accumulation</span>
        </div>
        <div className="cashflow-stat-card retained">
          <span className="sub-label">Net Retained Cash</span>
          <h3 style={{ margin: 0, fontSize: "1.4rem", color: periodMetrics.retainedCashflow >= 0 ? "#00f0ff" : "#ff5252", fontWeight: "800" }}>{money(periodMetrics.retainedCashflow)}</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{periodMetrics.savingsRate}% capital retained</span>
        </div>
      </div>

      {/* 3. Middle Tier: Chart & Intelligence Widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.25rem" }}>
        
        {/* Chronological Chart */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>Cashflow Velocity & Net Spread</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Chronological real-time inflow vs. burn tracking</span>
          </div>
          <div style={{ width: "100%", height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowTrendData}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e676" stopOpacity={0.35}/><stop offset="95%" stopColor="#00e676" stopOpacity={0}/></linearGradient>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff5252" stopOpacity={0.35}/><stop offset="95%" stopColor="#ff5252" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#090e1a", borderColor: "var(--card-border)", borderRadius: "8px", fontSize: "0.82rem" }} formatter={(val, name) => [money(val), name === "inflow" ? "Gross Inflow" : "Burn Rate"]} />
                <Area type="monotone" dataKey="inflow" name="inflow" stroke="#00e676" fill="url(#inflowGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="burn" name="burn" stroke="#ff5252" fill="url(#burnGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Markets Mini-Terminal */}
          <div className="card glass-card hover-lift" onClick={() => setPage && setPage("Markets")} style={{ padding: "1.25rem", cursor: "pointer", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}><LineChart size={16} color="#00f0ff"/> Market Intelligence</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Live</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>NIFTY 50</span>
              <div style={{ textAlign: "right" }}>
                <b style={{ color: "#fff", fontSize: "0.95rem", display: "block" }}>24,334.55</b>
                <span style={{ color: "#00e676", fontSize: "0.75rem" }}>+116.50 (0.48%)</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>USD / INR</span>
              <div style={{ textAlign: "right" }}>
                <b style={{ color: "#fff", fontSize: "0.95rem", display: "block" }}>₹83.42</b>
                <span style={{ color: "#ff5252", fontSize: "0.75rem" }}>-0.12 (0.15%)</span>
              </div>
            </div>
          </div>

          {/* Upcoming Commitments Alert */}
          <div className="card glass-card hover-lift" onClick={() => setPage && setPage("Subscriptions")} style={{ padding: "1.25rem", cursor: "pointer", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}><CalendarDays size={16} color="#ffab00"/> Upcoming Dues</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "6px" }}>
                <div>
                  <span style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Netflix Premium</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Due in 3 Days</span>
                </div>
                <b style={{ color: "#ff5252", fontSize: "0.85rem" }}>-₹649</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "6px" }}>
                <div>
                  <span style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>HDFC Credit Card</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Due in 7 Days</span>
                </div>
                <b style={{ color: "#ff5252", fontSize: "0.85rem" }}>-₹18,400</b>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 4. Bottom Executive Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "1.25rem" }}>
        
        {/* Cumulative Net Balance Summary */}
        <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Cumulative Net Balance</span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{money(cumulativeNetBalance)}</h2>
            </div>
            <div style={{ background: "rgba(0, 240, 255, 0.1)", borderRadius: "8px", padding: "10px" }}><Wallet size={20} color="#00f0ff" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border)" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><TrendingUp size={12} color="#00e676" /> Inflow</span>
              <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "#00e676" }}>+{money(periodMetrics.grossInflow)}</span>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><TrendingDown size={12} color="#ff5252" /> Outflow</span>
              <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ff5252" }}>-{money(periodMetrics.totalBurn + periodMetrics.capitalAllocated)}</span>
            </div>
          </div>
        </div>

        {/* Expense Distribution Donut */}
        <div className="card glass-card" style={{ padding: "1.25rem" }}>
          <b style={{ fontSize: "0.95rem", color: "#fff", display: "block" }}>Expense Distribution</b>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Where capital is allocated</span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
            <div style={{ width: "100px", height: "100px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={4} dataKey="value">{categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "100px", overflowY: "auto" }}>
              {categoryData.slice(0, 4).map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />{item.name}</span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>{money(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Discipline Card */}
        <div className="card glass-card hover-lift" onClick={() => setPage && setPage("Budgets")} style={{ cursor: "pointer", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <b style={{ fontSize: "0.95rem", color: "#fff" }}>Budget Discipline</b>
            <span style={{ fontSize: "0.75rem", color: "#00f0ff" }}>Manage →</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {budgets.length > 0 ? budgets.slice(0, 3).map((b) => {
              const spent = transactions.filter(t => t.type === "expense" && t.category === b.category).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
              const percent = Math.min(100, Math.round((spent / (parseFloat(b.monthly_limit) || 1)) * 100));
              return (
                <div key={b.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "4px" }}>
                    <span style={{ color: "#fff", fontWeight: "600" }}>{b.category}</span>
                    <span style={{ color: percent > 90 ? "#ff5252" : "#00f0ff" }}>{money(spent)} / {money(b.monthly_limit)}</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "3px" }}>
                    <div style={{ width: `${percent}%`, height: "100%", background: percent > 90 ? "#ff5252" : "linear-gradient(90deg, #00f0ff, #a855f7)", borderRadius: "3px" }} />
                  </div>
                </div>
              );
            }) : <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No budgets active.</p>}
          </div>
        </div>

      </div>

      {/* 5. FS-2603 Pre-Trade Guard & 60-Day Horizon */}
      <PreTradeGuard />

    </div>
  );
}

function Transactions({ 
  transactions = [], 
  deleteTransaction, 
  updateTransaction, 
  openTransactionModal, 
  setToast 
}) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", amount: "", category: "", type: "expense" });

  // Filtered dataset
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = (t.title || t.description || "").toLowerCase().includes(search.toLowerCase()) ||
                          (t.category || "").toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  // Dynamic ledger summary metrics for current view
  const ledgerMetrics = useMemo(() => {
    const inflow = filtered.filter(t => t.type === "income").reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const outflow = filtered.filter(t => t.type === "expense").reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    return { inflow, outflow, net: inflow - outflow, count: filtered.length };
  }, [filtered]);

  const exportCSV = () => {
    if (transactions.length === 0) {
      if (setToast) setToast({ type: "info", text: "No ledger records available to export." });
      return;
    }

    const headers = ["ID", "Description", "Amount", "Type", "Category", "Date"];
    const rows = transactions.map(t => [
      t.id,
      `"${(t.title || t.description || "").replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category || "General"}"`,
      t.created_at || t.date || new Date().toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `variance_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (setToast) setToast({ type: "success", text: "Ledger export downloaded." });
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditForm({
      title: t.title || t.description || "",
      amount: t.amount,
      category: t.category || "General",
      type: t.type || "expense"
    });
  };

  const saveEdit = async (id) => {
    if (!editForm.title.trim() || !editForm.amount) return;
    if (updateTransaction) {
      await updateTransaction(id, {
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        type: editForm.type
      });
    }
    setEditingId(null);
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Dynamic Summary Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filtered Inflow</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: "#00e676", fontWeight: "800" }}>+{money(ledgerMetrics.inflow)}</h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0, 230, 118, 0.1)", color: "#00e676", fontWeight: "700" }}>
            CREDIT
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filtered Outflow</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: "#ff5252", fontWeight: "800" }}>-{money(ledgerMetrics.outflow)}</h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(255, 82, 82, 0.1)", color: "#ff5252", fontWeight: "700" }}>
            DEBIT
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Net Ledger Delta</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: ledgerMetrics.net >= 0 ? "#00f0ff" : "#ff5252", fontWeight: "800" }}>
              {money(ledgerMetrics.net)}
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", fontWeight: "700" }}>
            {ledgerMetrics.count} ENTRIES
          </span>
        </div>
      </div>

      {/* 2. Control Toolbar (Cleaned & De-duplicated) */}
      <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "6px 12px", minWidth: "260px" }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search description or category..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", outline: "none", fontSize: "0.82rem", width: "100%" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, fontSize: "0.75rem" }}>✕</button>
          )}
        </div>

        {/* Filter Pills & Export */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="period-pill-group">
            {["all", "income", "expense"].map(t => (
              <button 
                key={t}
                className={`period-pill-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => setTypeFilter(t)}
                style={{ textTransform: "capitalize", padding: "5px 12px", fontSize: "0.78rem" }}
              >
                {t}
              </button>
            ))}
          </div>

          <button 
            onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--card-border)", color: "#fff", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
            title="Download CSV report"
          >
            <Download size={13} color="#00f0ff" /> Export
          </button>
        </div>
      </div>

      {/* 3. Transaction Ledger Table */}
      <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length > 0 ? (
          <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "12px 16px" }}>Description</th>
                  <th style={{ padding: "12px 16px" }}>Category</th>
                  <th style={{ padding: "12px 16px" }}>Type</th>
                  <th style={{ padding: "12px 16px" }}>Date</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", width: "90px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const isEditing = editingId === t.id;

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)", transition: "background 0.15s ease" }}>
                      
                      {/* Description */}
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#fff" }}>
                        {isEditing ? (
                          <input 
                            className="inline-edit-input"
                            value={editForm.title}
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                            style={{ width: "100%", padding: "4px 8px" }}
                          />
                        ) : (
                          t.title || t.description || "Entry"
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: "12px 16px" }}>
                        {isEditing ? (
                          <input 
                            className="inline-edit-input"
                            value={editForm.category}
                            onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                            style={{ width: "110px", padding: "4px 8px" }}
                          />
                        ) : (
                          <span style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "600" }}>
                            {t.category || "General"}
                          </span>
                        )}
                      </td>

                      {/* Type */}
                      <td style={{ padding: "12px 16px" }}>
                        {isEditing ? (
                          <select 
                            className="inline-edit-input"
                            value={editForm.type}
                            onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                            style={{ padding: "4px 8px" }}
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: t.type === "income" ? "#00e676" : "#ff5252", textTransform: "capitalize", fontWeight: "700" }}>
                            {t.type}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {t.created_at || t.date ? new Date(t.created_at || t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: t.type === "income" ? "#00e676" : "#ff5252" }}>
                        {isEditing ? (
                          <input 
                            type="number"
                            className="inline-edit-input"
                            value={editForm.amount}
                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                            style={{ width: "90px", textAlign: "right", padding: "4px 8px" }}
                          />
                        ) : (
                          `${t.type === "income" ? "+" : "-"}${money(t.amount)}`
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button 
                              onClick={() => saveEdit(t.id)} 
                              style={{ background: "#00e676", color: "#000", border: "none", borderRadius: "4px", padding: "3px 7px", fontSize: "0.72rem", fontWeight: "700", cursor: "pointer" }}
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => setEditingId(null)} 
                              style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "none", borderRadius: "4px", padding: "3px 7px", fontSize: "0.72rem", cursor: "pointer" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button 
                              onClick={() => startEdit(t)} 
                              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "3px" }}
                              title="Edit transaction"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => deleteTransaction && deleteTransaction(t.id)} 
                              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "3px" }}
                              title="Delete transaction"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#fff" }}>No transactions matching criteria</p>
            <span style={{ fontSize: "0.78rem" }}>Try clearing your search query or logging a new ledger entry.</span>
          </div>
        )}
      </div>

    </div>
  );
}


function AddRecurringModal({ isOpen, onClose, onSave, categories = [] }) {
  if (!isOpen) return null;
  const defaultCategories = ["Housing", "Utilities", "Transport", "Health", "General"];
  const categoryList = categories.length > 0 ? categories : defaultCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave(
      formData.get("recTitle"),
      parseFloat(formData.get("recAmount")),
      formData.get("recCategory"),
      formData.get("recCadence"),
      formData.get("recDate")
    );
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div className="glass-card" style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid #334155", color: "#fff", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Add Recurring Bill</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Bill Name</label>
            <input name="recTitle" type="text" required placeholder="e.g. Rent, Car Insurance" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Amount (₹)</label>
              <input name="recAmount" type="number" step="0.01" required placeholder="0.00" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Next Date</label>
              <input name="recDate" type="date" required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Category</label>
              <select name="recCategory" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}>
                {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Cadence</label>
              <select name="recCadence" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Recurring({ recurring = [], subscriptions = [], deleteRecurring, openRecurringModal }) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [view, setView] = useState("calendar"); // "calendar" | "list"

  // 1. Auto-Advance: Automatically jump to September 2026 (or next month if near month end)
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const daysInThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() >= daysInThisMonth - 1) {
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    return today;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // 2. Verified 2026 Indian Economic, Tax & NSE Calendar Dataset
  const economicCalendar2026 = useMemo(() => [
    // Jan
    { date: "2026-01-26", title: "Republic Day", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // Feb
    { date: "2026-02-01", title: "Union Budget Announcement", category: "Fiscal Event", tag: "BUDGET", type: "fiscal" },
    { date: "2026-02-06", title: "RBI MPC Policy Decision", category: "Monetary Policy", tag: "RBI MPC", type: "monetary" },
    // Mar
    { date: "2026-03-03", title: "Holi", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-03-15", title: "Q4 Advance Tax Deadline", category: "Tax Compliance", tag: "TAX DUES", type: "tax" },
    { date: "2026-03-27", title: "Ramzan Id (Id-Ul-Fitr)", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-03-31", title: "Financial Year End (FY 25-26)", category: "Fiscal Event", tag: "FY END", type: "fiscal" },
    // Apr
    { date: "2026-04-03", title: "Good Friday", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-04-09", title: "RBI MPC Policy Meeting", category: "Monetary Policy", tag: "RBI MPC", type: "monetary" },
    { date: "2026-04-14", title: "Dr. B.R. Ambedkar Jayanti", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // May
    { date: "2026-05-01", title: "Maharashtra Day", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // Jun
    { date: "2026-06-05", title: "RBI MPC Policy Meeting", category: "Monetary Policy", tag: "RBI MPC", type: "monetary" },
    { date: "2026-06-15", title: "Q1 Advance Tax Deadline", category: "Tax Compliance", tag: "TAX DUES", type: "tax" },
    // Jul
    { date: "2026-07-31", title: "ITR Filing Deadline (Non-Audit)", category: "Tax Compliance", tag: "ITR FILING", type: "tax" },
    // Aug
    { date: "2026-08-15", title: "Independence Day", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // Sep
    { date: "2026-09-04", title: "Janmashtami", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-09-14", title: "Ganesh Chaturthi", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-09-15", title: "Q2 Advance Tax Deadline", category: "Tax Compliance", tag: "TAX DUES", type: "tax" },
    // Oct
    { date: "2026-10-02", title: "Mahatma Gandhi Jayanti", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-10-20", title: "Dussehra", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // Nov
    { date: "2026-11-08", title: "Diwali Laxmi Pujan (Muhurat)", category: "Special Session", tag: "MUHURAT", type: "special" },
    { date: "2026-11-10", title: "Diwali Balipratipada", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    { date: "2026-11-24", title: "Gurunanak Jayanti", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" },
    // Dec
    { date: "2026-12-15", title: "Q3 Advance Tax Deadline", category: "Tax Compliance", tag: "TAX DUES", type: "tax" },
    { date: "2026-12-25", title: "Christmas", category: "Market Holiday", tag: "NSE CLSD", type: "holiday" }
  ], []);

  // 3. Merge User Subscriptions & Bills
  const userDues = useMemo(() => {
    const list = [];
    recurring.forEach(r => {
      list.push({
        id: `rec-${r.id}`,
        title: r.title,
        amount: parseFloat(r.amount) || 0,
        category: r.category || "General",
        cadence: r.cadence || "Monthly",
        date: r.next_date,
        type: "bill"
      });
    });

    subscriptions.forEach(s => {
      const renewalDay = s.billing_cycle_day || (s.next_billing ? new Date(s.next_billing).getDate() : 1);
      const subDate = new Date(year, month, renewalDay).toISOString();
      list.push({
        id: `sub-${s.id}`,
        title: s.name || s.title || "Subscription",
        amount: parseFloat(s.amount || s.cost) || 0,
        category: "Subscription",
        cadence: "Monthly",
        date: subDate,
        type: "subscription"
      });
    });
    return list;
  }, [recurring, subscriptions, year, month]);

  const totalMonthlyCommitment = userDues.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper to fetch details for a specific day
  const getDayDetails = (day) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const economicEvents = economicCalendar2026.filter(h => h.date === targetDateStr);
    const dues = userDues.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
    return { economicEvents, dues };
  };

  const getEventTagStyle = (type) => {
    switch (type) {
      case "tax": return { bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.35)", color: "#facc15" };
      case "monetary": return { bg: "rgba(0, 240, 255, 0.12)", border: "rgba(0, 240, 255, 0.35)", color: "#00f0ff" };
      case "fiscal": return { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.35)", color: "#c084fc" };
      case "holiday": return { bg: "rgba(255, 82, 82, 0.12)", border: "rgba(255, 82, 82, 0.35)", color: "#ff8080" };
      default: return { bg: "rgba(255, 255, 255, 0.08)", border: "var(--card-border)", color: "#fff" };
    }
  };

  // Next Upcoming Chronological Dues & Deadlines
  const upcomingAgenda = useMemo(() => {
    const now = new Date();
    const combined = [
      ...userDues.map(d => ({ ...d, isUserDue: true })),
      ...economicCalendar2026.map(e => ({ ...e, isUserDue: false }))
    ];
    return combined
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [userDues, economicCalendar2026]);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Header Toolbar */}
      <div className="card glass-card" style={{ padding: "0.9rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Month Navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#090e1a", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", padding: "2px 6px" }}
          >
            ◀
          </button>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", minWidth: "140px", textAlign: "center", color: "#fff" }}>
            {monthName} {year}
          </span>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", padding: "2px 6px" }}
          >
            ▶
          </button>
        </div>

        {/* View Switcher */}
        <div className="period-pill-group">
          <button 
            className={`period-pill-btn ${view === "calendar" ? "active" : ""}`}
            onClick={() => setView("calendar")}
            style={{ padding: "5px 12px", fontSize: "0.78rem" }}
          >
            Calendar View
          </button>
          <button 
            className={`period-pill-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            style={{ padding: "5px 12px", fontSize: "0.78rem" }}
          >
            List View
          </button>
        </div>
      </div>

      {/* 2. Main Calendar View */}
      {view === "calendar" ? (
        <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "1.25rem" }}>
          
          {/* Month Calendar Grid */}
          <div className="card glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "8px", textAlign: "center" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {/* Offset empty days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: "92px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.03)" }} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const now = new Date();
                const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                const { economicEvents, dues } = getDayDetails(day);

                return (
                  <div 
                    key={day} 
                    onClick={() => openRecurringModal && openRecurringModal()}
                    style={{ 
                      minHeight: "92px", 
                      padding: "6px", 
                      background: isToday ? "rgba(0, 240, 255, 0.04)" : "rgba(255, 255, 255, 0.02)", 
                      border: isToday ? "1px solid rgba(0, 240, 255, 0.4)" : "1px solid var(--card-border)", 
                      borderRadius: "8px", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "4px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: isToday ? "800" : "600", color: isToday ? "#00f0ff" : "var(--text-muted)" }}>
                        {day}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      
                      {/* Economic & Tax Events */}
                      {economicEvents.map((ev, idx) => {
                        const style = getEventTagStyle(ev.type);
                        return (
                          <div 
                            key={`eco-${idx}`} 
                            style={{ 
                              background: style.bg, 
                              border: `1px solid ${style.border}`, 
                              color: style.color, 
                              borderRadius: "4px", 
                              padding: "2px 4px", 
                              fontSize: "0.64rem", 
                              fontWeight: "700", 
                              whiteSpace: "nowrap", 
                              overflow: "hidden", 
                              textOverflow: "ellipsis" 
                            }}
                            title={ev.title}
                          >
                            {ev.type === "holiday" ? "🏦 " : ev.type === "tax" ? "⚖️ " : "📈 "}{ev.title}
                          </div>
                        );
                      })}

                      {/* User Dues & Subscriptions */}
                      {dues.map(b => (
                        <div 
                          key={b.id} 
                          style={{ 
                            background: b.type === "subscription" ? "rgba(168, 85, 247, 0.12)" : "rgba(255, 82, 82, 0.12)", 
                            border: `1px solid ${b.type === "subscription" ? "rgba(168, 85, 247, 0.4)" : "rgba(255, 82, 82, 0.4)"}`, 
                            color: b.type === "subscription" ? "#d8b4fe" : "#ff8080", 
                            borderRadius: "4px", 
                            padding: "2px 5px", 
                            fontSize: "0.66rem", 
                            fontWeight: "700", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {b.title}
                          </span>
                          <span style={{ fontSize: "0.65rem", flexShrink: 0 }}>
                            {money(b.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Agenda Sidebar */}
          <div className="card glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Repeat2 size={15} color="#00f0ff" /> Next Milestone & Dues
            </h4>

            {upcomingAgenda.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {upcomingAgenda.map((item, idx) => {
                  const isUser = item.isUserDue;
                  const itemStyle = !isUser ? getEventTagStyle(item.type) : null;

                  return (
                    <div 
                      key={item.id || `up-${idx}`} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        padding: "8px 10px", 
                        background: "rgba(255, 255, 255, 0.02)", 
                        borderRadius: "8px", 
                        border: "1px solid var(--card-border)" 
                      }}
                    >
                      <div style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "6px", padding: "4px 6px", textAlign: "center", minWidth: "40px" }}>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>
                          {new Date(item.date).toLocaleString("default", { month: "short" })}
                        </span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "#00f0ff" }}>
                          {new Date(item.date).getDate()}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px 0", fontSize: "0.82rem", fontWeight: "600", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </p>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {isUser ? `${item.category} • ${item.cadence || "Monthly"}` : item.category}
                        </span>
                      </div>

                      <div style={{ textAlign: "right", fontWeight: "700", fontSize: "0.8rem", color: isUser ? "#ff5252" : itemStyle.color }}>
                        {isUser ? `-${money(item.amount)}` : item.tag}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", margin: "auto 0" }}>
                No scheduled milestones.
              </p>
            )}

            <button 
              className="btn-primary" 
              onClick={() => openRecurringModal && openRecurringModal()}
              style={{ width: "100%", marginTop: "auto", padding: "8px", fontSize: "0.8rem", fontWeight: "700" }}
            >
              <Plus size={14} /> Schedule Bill / Dues
            </button>
          </div>

        </div>
      ) : (
        /* List View */
        <div className="card glass-card" style={{ padding: 0, overflow: "hidden" }}>
          {userDues.length > 0 ? (
            <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "12px 16px" }}>Event / Bill</th>
                    <th style={{ padding: "12px 16px" }}>Category</th>
                    <th style={{ padding: "12px 16px" }}>Cadence</th>
                    <th style={{ padding: "12px 16px" }}>Target Date</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", width: "70px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userDues.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#fff" }}>{b.title}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "rgba(255, 255, 255, 0.04)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem" }}>
                          {b.category}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", textTransform: "capitalize", fontSize: "0.78rem" }}>
                        {b.cadence}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#00f0ff", fontSize: "0.78rem" }}>
                        {b.date ? new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: "#ff5252" }}>
                        -{money(b.amount)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button 
                          onClick={() => deleteRecurring && deleteRecurring(b.id.replace('rec-', ''))} 
                          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#fff" }}>No recurring events recorded</p>
              <span style={{ fontSize: "0.78rem" }}>Schedule recurring bills to forecast monthly commitments.</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function Subscriptions({ subscriptions = [], deleteSubscription, openSubscriptionModal, fetchSubscriptions }) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Calculate Monthly & Annualized Impact
  const metrics = useMemo(() => {
    let monthly = 0;
    subscriptions.forEach(s => {
      const amt = parseFloat(s.amount || s.cost) || 0;
      const cadence = (s.cadence || s.billing_period || "monthly").toLowerCase();
      if (cadence === "yearly" || cadence === "annually") {
        monthly += amt / 12;
      } else if (cadence === "weekly") {
        monthly += amt * 4.33;
      } else if (cadence === "quarterly") {
        monthly += amt / 3;
      } else {
        monthly += amt;
      }
    });

    const yearly = monthly * 12;
    return { monthly, yearly, count: subscriptions.length };
  }, [subscriptions]);

  const handleDelete = async (id) => {
    if (deleteSubscription) {
      await deleteSubscription(id);
    } else {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (!error && fetchSubscriptions) fetchSubscriptions();
    }
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Metric Telemetry Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        
        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Fixed Burn</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.35rem", color: "#ff5252", fontWeight: "800" }}>
              {money(metrics.monthly)}
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(255, 82, 82, 0.1)", color: "#ff5252", fontWeight: "700" }}>
            {metrics.count} ACTIVE
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Annual Commitment</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.35rem", color: "#a855f7", fontWeight: "800" }}>
              {money(metrics.yearly)}
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", fontWeight: "700" }}>
            YEARLY DRAIN
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cost Optimisation</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.05rem", color: "#00e676", fontWeight: "700" }}>
              Audited
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0, 230, 118, 0.1)", color: "#00e676", fontWeight: "700" }}>
            HEALTHY
          </span>
        </div>

      </div>

      {/* 2. Control Toolbar */}
      <div className="card glass-card" style={{ padding: "0.9rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Tracking {metrics.count} recurring SaaS & media services
          </span>
        </div>

        {openSubscriptionModal && (
          <button 
            onClick={openSubscriptionModal}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", fontSize: "0.8rem", fontWeight: "700", borderRadius: "8px" }}
          >
            <Plus size={14} /> Add Subscription
          </button>
        )}
      </div>

      {/* 3. Subscriptions Ledger */}
      <div className="card glass-card" style={{ padding: "1.25rem" }}>
        {subscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#fff" }}>No active subscriptions recorded</p>
            <span style={{ fontSize: "0.78rem" }}>Add recurring digital services to accurately project cash flow drains.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {subscriptions.map(sub => {
              const amt = parseFloat(sub.amount || sub.cost) || 0;
              const cadence = sub.cadence || sub.billing_period || "Monthly";

              return (
                <div 
                  key={sub.id} 
                  className="hover-lift"
                  style={{ 
                    padding: "1rem 1.25rem", 
                    backgroundColor: "rgba(255, 255, 255, 0.02)", 
                    borderRadius: "10px", 
                    border: "1px solid var(--card-border)", 
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d8b4fe", fontWeight: "800", fontSize: "0.9rem" }}>
                      {(sub.name || sub.title || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <b style={{ color: "#fff", fontSize: "0.95rem", display: "block" }}>{sub.name || sub.title}</b>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {sub.category || "Entertainment"} • <span style={{ textTransform: "capitalize" }}>{cadence}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#ff5252", fontWeight: "800", fontSize: "1rem" }}>
                        -{money(amt)}
                      </span>
                      <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        per cycle
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDelete(sub.id)} 
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                      title="Remove subscription"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function Budgets({ budgets = [], transactions = [], openAddBudgetModal, fetchBudgets }) {
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // 1. Calculate Live Category Spend from Transactions
  const budgetAnalytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Sum expenses by category for the active month
    const spendMap = {};
    transactions.forEach(t => {
      const d = new Date(t.created_at || t.date || Date.now());
      if (t.type === "expense" && d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const cat = (t.category || "General").trim().toLowerCase();
        spendMap[cat] = (spendMap[cat] || 0) + (parseFloat(t.amount) || 0);
      }
    });

    let totalAllocated = 0;
    let totalSpent = 0;

    const items = budgets.map(b => {
      const limit = parseFloat(b.monthly_limit) || 0;
      const catKey = (b.category || "").trim().toLowerCase();
      const spent = spendMap[catKey] || 0;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const remaining = limit - spent;

      totalAllocated += limit;
      totalSpent += spent;

      let statusColor = "#00e676";
      let statusLabel = "On Track";
      if (pct >= 100) {
        statusColor = "#ff5252";
        statusLabel = "Over Budget";
      } else if (pct >= 75) {
        statusColor = "#ffab00";
        statusLabel = "High Utilization";
      }

      return {
        ...b,
        limit,
        spent,
        pct: Math.min(pct, 100),
        rawPct: pct,
        remaining,
        statusColor,
        statusLabel
      };
    });

    const netRemaining = totalAllocated - totalSpent;
    const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    return { items, totalAllocated, totalSpent, netRemaining, overallPct };
  }, [budgets, transactions]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error && fetchBudgets) fetchBudgets();
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Aggregate Telemetry Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Budget Pool</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: "#fff", fontWeight: "800" }}>{money(budgetAnalytics.totalAllocated)}</h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", fontWeight: "700" }}>
            {budgetAnalytics.items.length} LIMITS
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Burn</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: budgetAnalytics.overallPct > 90 ? "#ff5252" : "#ffab00", fontWeight: "800" }}>
              {money(budgetAnalytics.totalSpent)}
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(255, 171, 0, 0.1)", color: "#ffab00", fontWeight: "700" }}>
            {budgetAnalytics.overallPct}% USED
          </span>
        </div>

        <div className="card glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remaining Buffer</span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: budgetAnalytics.netRemaining >= 0 ? "#00e676" : "#ff5252", fontWeight: "800" }}>
              {money(budgetAnalytics.netRemaining)}
            </h3>
          </div>
          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "4px", background: budgetAnalytics.netRemaining >= 0 ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.1)", color: budgetAnalytics.netRemaining >= 0 ? "#00e676" : "#ff5252", fontWeight: "700" }}>
            {budgetAnalytics.netRemaining >= 0 ? "SAFE" : "DEFICIT"}
          </span>
        </div>
      </div>

      {/* 2. Budget Utilization List */}
      <div className="card glass-card" style={{ padding: "1.25rem" }}>
        {budgetAnalytics.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#fff" }}>No category budgets set</p>
            <span style={{ fontSize: "0.78rem" }}>Create monthly caps above to regulate spending velocity.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {budgetAnalytics.items.map(x => (
              <div 
                key={x.id} 
                className="hover-lift"
                style={{ 
                  padding: "1.1rem 1.25rem", 
                  backgroundColor: "rgba(255, 255, 255, 0.02)", 
                  borderRadius: "10px", 
                  border: "1px solid var(--card-border)", 
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}
              >
                {/* Item Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <b style={{ color: "#fff", fontSize: "1rem" }}>{x.category}</b>
                    <span style={{ 
                      fontSize: "0.68rem", 
                      fontWeight: "700", 
                      padding: "2px 8px", 
                      borderRadius: "4px", 
                      background: `${x.statusColor}15`, 
                      color: x.statusColor,
                      letterSpacing: "0.5px"
                    }}>
                      {x.statusLabel}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "700" }}>
                        {money(x.spent)} <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>/ {money(x.limit)}</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDelete(x.id)} 
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                      title="Delete Budget"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div>
                  <div style={{ height: "6px", width: "100%", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${x.pct}%`, 
                        background: x.statusColor, 
                        borderRadius: "3px",
                        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" 
                      }} 
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <span>{x.rawPct}% of limit reached</span>
                    <span>
                      {x.remaining >= 0 ? `${money(x.remaining)} remaining` : `${money(Math.abs(x.remaining))} over budget`}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function FinancialTools({ setToast }) {
  const [activeTab, setActiveTab] = useState("sip");

  // Helper for money formatting
  const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

  // 1. Currency Converter (Default: 1 USD -> INR)
  const [convAmount, setConvAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [rates, setRates] = useState({ USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 155.2, AUD: 1.51, CAD: 1.37, SGD: 1.35, CHF: 0.91 });
  const currencies = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "CHF"];

  // 2. Step-Up SIP
  const [monthlySip, setMonthlySip] = useState(15000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUpPercent, setStepUpPercent] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);

  // 3. Loan EMI
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState(20);

  // 4. ClearTax Style GST State
  const [gstAmount, setGstAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState("exclusive");

  // 5. Tax Optimizer State
  const [grossSalary, setGrossSalary] = useState(1200000);
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [hra, setHra] = useState(100000);

  // Fetch live exchange rates
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) setRates(data.rates);
      })
      .catch(() => {});
  }, []);

  const convertedValue = useMemo(() => {
    const amt = parseFloat(convAmount) || 0;
    if (!rates[fromCurrency] || !rates[toCurrency]) return "0.00";
    const inUSD = amt / rates[fromCurrency];
    return (inUSD * rates[toCurrency]).toFixed(2);
  }, [convAmount, fromCurrency, toCurrency, rates]);

  // SIP Math & Chart Data
  const sipProjections = useMemo(() => {
    let totalInvested = 0;
    let corpus = 0;
    let currentMonthly = monthlySip;
    const monthlyRate = expectedReturn / 12 / 100;
    const data = [];

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentMonthly;
        corpus = (corpus + currentMonthly) * (1 + monthlyRate);
      }
      const realValue = corpus / Math.pow(1 + inflationRate / 100, y);

      data.push({
        year: `Yr ${y}`,
        invested: Math.round(totalInvested),
        corpus: Math.round(corpus),
        wealthGain: Math.round(corpus - totalInvested),
        realValue: Math.round(realValue)
      });

      currentMonthly += (currentMonthly * stepUpPercent) / 100;
    }

    const finalPoint = data[data.length - 1] || { invested: 0, corpus: 0, wealthGain: 0, realValue: 0 };
    return { data, finalPoint };
  }, [monthlySip, expectedReturn, years, stepUpPercent, inflationRate]);

  // Loan EMI Math & Donut Chart Data
  const emiMetrics = useMemo(() => {
    const p = parseFloat(loanAmount) || 0;
    const r = (parseFloat(loanRate) || 0) / 12 / 100;
    const n = (parseFloat(loanTenureYears) || 0) * 12;

    if (p <= 0 || r <= 0 || n <= 0) return { emi: 0, totalPayment: 0, totalInterest: 0, chartData: [] };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    const chartData = [
      { name: "Principal Amount", value: Math.round(p), color: "#00f0ff" },
      { name: "Total Interest", value: Math.round(totalInterest), color: "#a855f7" }
    ];

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      chartData
    };
  }, [loanAmount, loanRate, loanTenureYears]);

  // ClearTax GST Computations
  const gstCalculations = useMemo(() => {
    const amount = parseFloat(gstAmount) || 0;
    const rate = parseFloat(gstRate) || 0;

    let netPrice = 0;
    let totalTax = 0;
    let grossPrice = 0;

    if (gstType === "exclusive") {
      netPrice = amount;
      totalTax = (amount * rate) / 100;
      grossPrice = amount + totalTax;
    } else {
      grossPrice = amount;
      netPrice = (amount * 100) / (100 + rate);
      totalTax = amount - netPrice;
    }

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    return {
      netPrice: Math.round(netPrice),
      totalTax: Math.round(totalTax),
      grossPrice: Math.round(grossPrice),
      cgst: Math.round(cgst),
      sgst: Math.round(sgst)
    };
  }, [gstAmount, gstRate, gstType]);

  // Tax Optimizer Computations
  const taxCalculations = useMemo(() => {
    const salary = parseFloat(grossSalary) || 0;
    const ded80C = Math.min(parseFloat(sec80C) || 0, 150000);
    const ded80D = Math.min(parseFloat(sec80D) || 0, 50000);
    const dedHRA = parseFloat(hra) || 0;
    const stdDedOld = 50000;
    const stdDedNew = 75000;

    // 1. New Regime
    const taxableNew = Math.max(0, salary - stdDedNew);
    let taxNew = 0;
    if (taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.30 + 150000;
    else if (taxableNew > 1200000) taxNew += (taxableNew - 1200000) * 0.20 + 90000;
    else if (taxableNew > 1000000) taxNew += (taxableNew - 1000000) * 0.15 + 60000;
    else if (taxableNew > 700000) taxNew += (taxableNew - 700000) * 0.10 + 30000;
    else if (taxableNew > 300000) taxNew += (taxableNew - 300000) * 0.05;

    if (taxableNew <= 700000) taxNew = 0; // Sec 87A rebate
    const cessNew = taxNew * 0.04;
    const finalTaxNew = Math.round(taxNew + cessNew);

    // 2. Old Regime
    const totalOldDeductions = ded80C + ded80D + dedHRA + stdDedOld;
    const taxableOld = Math.max(0, salary - totalOldDeductions);
    let taxOld = 0;
    if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.30 + 112500;
    else if (taxableOld > 500000) taxOld += (taxableOld - 500000) * 0.20 + 12500;
    else if (taxableOld > 250000) taxOld += (taxableOld - 250000) * 0.05;

    if (taxableOld <= 500000) taxOld = 0; // Sec 87A rebate
    const cessOld = taxOld * 0.04;
    const finalTaxOld = Math.round(taxOld + cessOld);

    const isNewBetter = finalTaxNew <= finalTaxOld;
    const savings = Math.abs(finalTaxNew - finalTaxOld);

    return {
      taxableNew,
      finalTaxNew,
      totalOldDeductions,
      taxableOld,
      finalTaxOld,
      isNewBetter,
      savings
    };
  }, [grossSalary, sec80C, sec80D, hra]);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Centered Gradient Header */}
      <div className="tools-header-container">
        <h1 className="gradient-heading">Financial Tools & Calculators</h1>
        <p className="tools-subtitle">Intelligent simulations for currency exchange, loan EMIs, compound wealth, and tax calculations.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="calc-nav-tabs">
        <button className={`calc-tab-btn ${activeTab === "sip" ? "active" : ""}`} onClick={() => setActiveTab("sip")}>
          📈 Step-Up SIP Forecaster
        </button>
        <button className={`calc-tab-btn ${activeTab === "emi" ? "active" : ""}`} onClick={() => setActiveTab("emi")}>
          🏦 Loan EMI & Amortization
        </button>
        <button className={`calc-tab-btn ${activeTab === "gst" ? "active" : ""}`} onClick={() => setActiveTab("gst")}>
          🧾 GST Calculator (ClearTax Style)
        </button>
        <button className={`calc-tab-btn ${activeTab === "converter" ? "active" : ""}`} onClick={() => setActiveTab("converter")}>
          💱 Currency Converter
        </button>
        <button className={`calc-tab-btn ${activeTab === "tax" ? "active" : ""}`} onClick={() => setActiveTab("tax")}>
          ⚖️ Tax Optimizer (Old vs New)
        </button>
      </div>

      {/* 1. Step-Up SIP Forecaster */}
      {activeTab === "sip" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "1.5rem" }}>
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", color: "#fff" }}>SIP Parameters</h3>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Initial Monthly SIP</label>
                <b style={{ color: "#00f0ff" }}>{money(monthlySip)}</b>
              </div>
              <input type="range" min="1000" max="200000" step="1000" value={monthlySip} onChange={e => setMonthlySip(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Expected Return (% P.A.)</label>
                <b style={{ color: "#00f0ff" }}>{expectedReturn}%</b>
              </div>
              <input type="range" min="6" max="25" step="0.5" value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Horizon Duration</label>
                <b style={{ color: "#00f0ff" }}>{years} Years</b>
              </div>
              <input type="range" min="1" max="30" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Annual Step-Up Increment</label>
                <b style={{ color: "#a855f7" }}>+{stepUpPercent}% / Yr</b>
              </div>
              <input type="range" min="0" max="25" step="1" value={stepUpPercent} onChange={e => setStepUpPercent(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Inflation Adjustment</label>
                <b style={{ color: "#ffab00" }}>{inflationRate}%</b>
              </div>
              <input type="range" min="0" max="10" step="0.5" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="calc-slider-input" />
            </div>
          </div>

          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Invested</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "1.2rem", color: "#fff" }}>{money(sipProjections.finalPoint.invested)}</h3>
              </div>
              <div style={{ background: "rgba(0, 240, 255, 0.05)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Future Value</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "1.2rem", color: "#00f0ff" }}>{money(sipProjections.finalPoint.corpus)}</h3>
              </div>
              <div style={{ background: "rgba(0, 230, 118, 0.05)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0, 230, 118, 0.2)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Inflation-Adjusted</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "1.2rem", color: "#00e676" }}>{money(sipProjections.finalPoint.realValue)}</h3>
              </div>
            </div>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sipProjections.data}>
                  <defs>
                    <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={{ background: "#090e1a", borderColor: "var(--card-border)", borderRadius: "8px", fontSize: "0.85rem" }} formatter={v => [money(v), ""]} />
                  <Area type="monotone" dataKey="corpus" name="Total Corpus" stroke="#00f0ff" fillOpacity={1} fill="url(#colorCorpus)" strokeWidth={2} />
                  <Area type="monotone" dataKey="invested" name="Capital Invested" stroke="#a855f7" fillOpacity={1} fill="url(#colorInvested)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. Loan EMI Calculator with Donut Chart */}
      {activeTab === "emi" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "1.5rem" }}>
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", color: "#fff" }}>Loan Parameters</h3>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Loan Amount</label>
                <b style={{ color: "#00f0ff" }}>{money(loanAmount)}</b>
              </div>
              <input type="range" min="100000" max="20000000" step="50000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Interest Rate (% P.A.)</label>
                <b style={{ color: "#00f0ff" }}>{loanRate}%</b>
              </div>
              <input type="range" min="5" max="20" step="0.1" value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div className="calc-input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Tenure (Years)</label>
                <b style={{ color: "#00f0ff" }}>{loanTenureYears} Years</b>
              </div>
              <input type="range" min="1" max="30" step="1" value={loanTenureYears} onChange={e => setLoanTenureYears(Number(e.target.value))} className="calc-slider-input" />
            </div>

            <div style={{ background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Monthly EMI</span>
              <h2 style={{ fontSize: "1.8rem", color: "#00f0ff", margin: "4px 0", fontWeight: "800" }}>{money(emiMetrics.emi)}</h2>
            </div>
          </div>

          <div className="card glass-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ width: "100%", height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emiMetrics.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {emiMetrics.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#090e1a", borderColor: "var(--card-border)", borderRadius: "8px", fontSize: "0.85rem" }} 
                    formatter={v => [money(v), ""]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "rgba(0, 240, 255, 0.05)", padding: "12px 14px", borderRadius: "8px", borderLeft: "4px solid #00f0ff" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Principal Amount</span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", color: "#fff" }}>{money(loanAmount)}</h4>
              </div>

              <div style={{ background: "rgba(168, 85, 247, 0.05)", padding: "12px 14px", borderRadius: "8px", borderLeft: "4px solid #a855f7" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Interest Payable</span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", color: "#a855f7" }}>{money(emiMetrics.totalInterest)}</h4>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Obligation (Principal + Interest)</span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", color: "#fff" }}>{money(emiMetrics.totalPayment)}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Authentic ClearTax Style GST Calculator */}
      {activeTab === "gst" && (
        <div style={{ maxWidth: "780px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div style={{ display: "flex", gap: "8px", background: "#090e1a", padding: "4px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <button 
                className={`table-filter-btn ${gstType === "exclusive" ? "active" : ""}`} 
                onClick={() => setGstType("exclusive")}
                style={{ flex: 1, padding: "8px" }}
              >
                GST Exclusive (Add GST)
              </button>
              <button 
                className={`table-filter-btn ${gstType === "inclusive" ? "active" : ""}`} 
                onClick={() => setGstType("inclusive")}
                style={{ flex: 1, padding: "8px" }}
              >
                GST Inclusive (Remove GST)
              </button>
            </div>

            <div className="calc-input-group">
              <label>{gstType === "exclusive" ? "Initial Amount (₹)" : "Total Amount with Tax (₹)"}</label>
              <input 
                type="number" 
                value={gstAmount} 
                onChange={e => setGstAmount(e.target.value)} 
                className="inline-edit-input" 
                style={{ width: "100%", padding: "10px 14px", fontSize: "1.1rem" }} 
              />
            </div>

            <div className="calc-input-group">
              <label>GST Rate Slab</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[5, 12, 18, 28].map(slab => (
                  <button 
                    key={slab} 
                    className={`calc-tab-btn ${gstRate === slab ? "active" : ""}`} 
                    onClick={() => setGstRate(slab)} 
                    style={{ flex: 1 }}
                  >
                    {slab}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", marginTop: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Actual / Net Amount</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "#fff" }}>{money(gstCalculations.netPrice)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>CGST ({gstRate / 2}%)</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "#00f0ff" }}>{money(gstCalculations.cgst)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>SGST ({gstRate / 2}%)</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "#00f0ff" }}>{money(gstCalculations.sgst)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0, 240, 255, 0.03)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#00f0ff" }}>Total GST Tax Amount</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: "#00f0ff" }}>{money(gstCalculations.totalTax)}</td>
                  </tr>
                  <tr style={{ background: "rgba(0, 230, 118, 0.06)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "800", color: "#fff", fontSize: "1rem" }}>Total Gross Amount</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: "800", color: "#00e676", fontSize: "1.15rem" }}>{money(gstCalculations.grossPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 4. Global Currency Converter */}
      {activeTab === "converter" && (
        <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ margin: "0", fontSize: "1.05rem", color: "#fff" }}>Live FX Currency Exchange</h3>

            <div className="calc-input-group">
              <label>Amount to Convert</label>
              <input 
                type="number" 
                value={convAmount} 
                onChange={e => setConvAmount(e.target.value)} 
                className="inline-edit-input" 
                style={{ width: "100%", padding: "10px", fontSize: "1.1rem" }} 
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>From</label>
                <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="inline-edit-input" style={{ width: "100%", padding: "8px" }}>
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <span style={{ color: "#00f0ff", fontSize: "1.2rem", marginTop: "16px" }}>➔</span>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>To</label>
                <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="inline-edit-input" style={{ width: "100%", padding: "8px" }}>
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "8px", padding: "1.25rem", textAlign: "center", marginTop: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Converted Output</span>
              <h2 style={{ fontSize: "2rem", color: "#00f0ff", margin: "6px 0", fontWeight: "800" }}>
                {toCurrency === "INR" ? `₹${Number(convertedValue).toLocaleString("en-IN")}` : `${convertedValue} ${toCurrency}`}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tax Optimizer (Old vs New Regime) */}
      {activeTab === "tax" && (
        <div style={{ maxWidth: "850px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "#fff" }}>Income Tax Regime Comparison</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Simulate tax liability between Old and New regimes with automated deduction optimization.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div className="calc-input-group">
                <label>Gross Salary (₹)</label>
                <input 
                  type="number" 
                  className="inline-edit-input" 
                  value={grossSalary} 
                  onChange={e => setGrossSalary(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px" }} 
                />
              </div>
              <div className="calc-input-group">
                <label>Sec 80C (PPF/ELSS)</label>
                <input 
                  type="number" 
                  className="inline-edit-input" 
                  value={sec80C} 
                  onChange={e => setSec80C(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px" }} 
                />
              </div>
              <div className="calc-input-group">
                <label>Sec 80D (Health Ins)</label>
                <input 
                  type="number" 
                  className="inline-edit-input" 
                  value={sec80D} 
                  onChange={e => setSec80D(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px" }} 
                />
              </div>
              <div className="calc-input-group">
                <label>HRA Exemption</label>
                <input 
                  type="number" 
                  className="inline-edit-input" 
                  value={hra} 
                  onChange={e => setHra(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px" }} 
                />
              </div>
            </div>

            <div className="tax-card-grid">
              {/* New Regime */}
              <div className={`regime-box ${taxCalculations.isNewBetter ? "winner" : ""}`}>
                {taxCalculations.isNewBetter && <span className="regime-tag-recommend">Recommended</span>}
                <h4 style={{ margin: 0, color: "#00f0ff" }}>New Tax Regime</h4>
                <div className="tax-breakdown-row"><span>Gross Income:</span><span>{money(grossSalary)}</span></div>
                <div className="tax-breakdown-row"><span>Standard Deduction:</span><span>-₹75,000</span></div>
                <div className="tax-breakdown-row"><span>Taxable Base:</span><span>{money(taxCalculations.taxableNew)}</span></div>
                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: "#fff" }}>Tax Payable (+ 4% Cess):</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: "800", color: taxCalculations.isNewBetter ? "#00f0ff" : "#fff" }}>
                    {money(taxCalculations.finalTaxNew)}
                  </span>
                </div>
              </div>

              {/* Old Regime */}
              <div className={`regime-box ${!taxCalculations.isNewBetter ? "winner" : ""}`}>
                {!taxCalculations.isNewBetter && <span className="regime-tag-recommend">Recommended</span>}
                <h4 style={{ margin: 0, color: "#a855f7" }}>Old Tax Regime</h4>
                <div className="tax-breakdown-row"><span>Gross Income:</span><span>{money(grossSalary)}</span></div>
                <div className="tax-breakdown-row"><span>Total Deductions:</span><span>-{money(taxCalculations.totalOldDeductions)}</span></div>
                <div className="tax-breakdown-row"><span>Taxable Base:</span><span>{money(taxCalculations.taxableOld)}</span></div>
                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: "#fff" }}>Tax Payable (+ 4% Cess):</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: "800", color: !taxCalculations.isNewBetter ? "#a855f7" : "#fff" }}>
                    {money(taxCalculations.finalTaxOld)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#fff" }}>
                Switching to the <strong>{taxCalculations.isNewBetter ? "New Regime" : "Old Regime"}</strong> saves you:
              </span>
              <span style={{ color: "#00f0ff", fontWeight: "800", fontSize: "1.1rem" }}>
                {money(taxCalculations.savings)}/yr
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}  

function Documents({ documents = [], addDocument, deleteDocument, setToast }) {
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const fileInputRef = useRef(null);

  // File Upload Handler (Simulated Client File Storage)
  // File Upload Handler with Format & Size Restrictions
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    // 1. Check Supported File Types
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      if (setToast) {
        setToast({ type: "error", text: "Unsupported format. Please upload PDF, PNG, JPG, CSV, or Excel files only." });
      } else {
        alert("Unsupported format. Please upload PDF, PNG, JPG, CSV, or Excel files only.");
      }
      return;
    }

    // 2. Enforce 5MB Maximum Size Limit
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      if (setToast) {
        setToast({ type: "error", text: `File is too large (${fileSizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.` });
      } else {
        alert(`File is too large (${fileSizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      }
      return;
    }
    
    // Create local object URL for preview/download
    const fileUrl = URL.createObjectURL(file);
    const newDoc = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type || "application/octet-stream",
      category: file.name.toLowerCase().includes("tax") ? "Tax" : file.name.toLowerCase().includes("bill") ? "Bills" : "Receipts",
      date: new Date().toISOString(),
      url: fileUrl
    };

    if (addDocument) {
      addDocument(newDoc);
    }
    if (setToast) {
      setToast({ type: "success", text: `Uploaded "${file.name}" successfully.` });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Filter Documents
  const filteredDocs = useMemo(() => {
    return (documents || []).filter(doc => {
      const matchSearch = (doc.name || "").toLowerCase().includes(search.toLowerCase());
      const matchTag = selectedTag === "all" || doc.category === selectedTag;
      return matchSearch && matchTag;
    });
  }, [documents, search, selectedTag]);

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header & Controls */}
      <div className="card glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "#fff" }}>Receipt & Statement Vault</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>Securely archive invoices, tax slips, and proofs of purchase.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#090e1a", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "6px 12px" }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", color: "#fff", outline: "none", fontSize: "0.85rem", width: "160px" }}
            />
          </div>

          {/* Filter */}
          <select 
            value={selectedTag} 
            onChange={e => setSelectedTag(e.target.value)}
            style={{ background: "#090e1a", color: "#fff", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "7px 12px", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Tags</option>
            <option value="Receipts">Receipts</option>
            <option value="Bills">Bills</option>
            <option value="Tax">Tax Slips</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        className={`dropzone-container ${dragActive ? "dragover" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          style={{ display: "none" }} 
          onChange={e => handleFiles(e.target.files)} 
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
        />
        <div style={{ background: "rgba(0, 240, 255, 0.1)", borderRadius: "50%", padding: "14px", display: "inline-flex" }}>
          <Upload size={24} color="#00f0ff" />
        </div>
        <div>
          <b style={{ color: "#fff", fontSize: "0.95rem" }}>Click to upload or drag & drop files here</b>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>Supports PDF invoices, tax statements, receipts, and spreadsheets (up to 5MB)</p>
        </div>
      </div>

      {/* Grid of Uploaded Documents */}
      {filteredDocs.length > 0 ? (
        <div className="doc-grid">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="doc-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "8px", padding: "10px" }}>
                  <Files size={20} color="#a855f7" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "0.88rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.name}
                  </h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {doc.size || "Unknown size"} • {new Date(doc.date || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--card-border)", paddingTop: "10px" }}>
                <span style={{ background: "rgba(255, 255, 255, 0.05)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", color: "#00f0ff" }}>
                  {doc.category || "General"}
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      download={doc.name}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                      title="Download document"
                    >
                      <Download size={16} />
                    </a>
                  )}
                  <button 
                    onClick={() => deleteDocument && deleteDocument(doc.id)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card glass-card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#fff" }}>No documents in your vault</p>
          <span style={{ fontSize: "0.8rem" }}>Drop your first invoice or receipt above to keep your tax proofs organized.</span>
        </div>
      )}

    </div>
  );
}

function AddRuleModal({ isOpen, onClose, onSave, categories = [] }) {
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSave(fd.get("keyword"), fd.get("category"));
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div className="glass-card" style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid #334155", color: "#fff", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Create Automation Rule</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>If merchant name contains:</label>
            <input name="keyword" type="text" required placeholder="e.g. Uber, Amazon, Netflix" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "#94a3b8" }}>Automatically categorize as:</label>
            <select name="category" required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff" }}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Save Rule</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Rules({ rules = [], addRule, deleteRule, transactions = [], setTransactions, openRuleModal, setToast }) {
  // Manual trigger to evaluate and apply all rules across the live ledger
  const runRulesEngine = () => {
    if (rules.length === 0 || transactions.length === 0) {
      if (setToast) setToast({ type: "info", text: "No rules or transactions available to process." });
      return;
    }

    let modifiedCount = 0;

    const updatedTransactions = transactions.map(t => {
      const titleLower = (t.title || t.description || "").toLowerCase();
      let matchedCategory = null;

      for (const rule of rules) {
        const keyword = (rule.keyword || rule.pattern || "").toLowerCase();
        if (keyword && titleLower.includes(keyword)) {
          matchedCategory = rule.category;
          break;
        }
      }

      if (matchedCategory && matchedCategory !== t.category) {
        modifiedCount++;
        return { ...t, category: matchedCategory };
      }
      return t;
    });

    if (modifiedCount > 0) {
      setTransactions(updatedTransactions);
      if (setToast) {
        setToast({ 
          type: "success", 
          text: `⚡ Engine applied! Auto-categorized ${modifiedCount} transaction(s).` 
        });
      }
    } else {
      if (setToast) {
        setToast({ 
          type: "info", 
          text: "All existing transactions already match active automation rules." 
        });
      }
    }
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Rules Engine Header Banner */}
      <div className="card glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "#fff" }}>Smart Categorization Rules</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Automatically classify bank imports and transactions based on keyword triggers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            onClick={runRulesEngine}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              background: "rgba(0, 240, 255, 0.1)", 
              color: "#00f0ff", 
              border: "1px solid rgba(0, 240, 255, 0.3)", 
              borderRadius: "8px", 
              padding: "8px 14px", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer" 
            }}
          >
            <RefreshCw size={15} /> Run Rules Engine
          </button>

          <button className="btn-primary" onClick={() => openRuleModal && openRuleModal()}>
            <Plus size={15} /> New Rule
          </button>
        </div>
      </div>

      {/* Rules List View */}
      {rules.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rules.map(rule => (
            <div key={rule.id} className="rule-card">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.2)", borderRadius: "6px", padding: "8px" }}>
                  <Tag size={16} color="#00f0ff" />
                </div>
                
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>If entry title contains</span>
                <span className="rule-chip">"{rule.keyword || rule.pattern}"</span>
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>➔ Assign category</span>
                <span className="rule-target-chip">{rule.category}</span>
              </div>

              <button 
                onClick={() => deleteRule && deleteRule(rule.id)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                title="Delete rule"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card glass-card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#fff" }}>No automation rules configured</p>
          <span style={{ fontSize: "0.8rem" }}>Create your first rule (e.g. "Swiggy" ➔ Food, "Amazon" ➔ Shopping) to automate transaction categorization.</span>
        </div>
      )}

    </div>
  );
}

function SettingsPage({ session, setToast }) {
  const [activeSection, setActiveSection] = useState("general");
  const [currency, setCurrency] = useState("₹");
  const [budget, setBudget] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("April");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session) return;
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setCurrency(data.currency || "₹");
        setBudget(data.monthly_budget || "");
      }
    };
    fetchSettings();
  }, [session]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("user_settings").upsert({
      user_id: session.user.id,
      currency: currency,
      monthly_budget: parseFloat(budget) || 0,
      updated_at: new Date()
    });

    setLoading(false);
    if (error) {
      setToast({ type: "error", text: error.message });
    } else {
      setToast({ type: "success", text: "Preferences synced to cloud." });
    }
  };

  // Full Database JSON Backup Export
  const handleExportFullBackup = async () => {
    try {
      const { data: txs } = await supabase.from("transactions").select("*");
      const { data: subs } = await supabase.from("subscriptions").select("*");
      const { data: buds } = await supabase.from("budgets").select("*");
      const { data: recs } = await supabase.from("recurring").select("*");
      const { data: gls } = await supabase.from("goals").select("*");

      const fullBackup = {
        app: "Variance Personal Finance",
        version: "1.0",
        export_date: new Date().toISOString(),
        user_email: session?.user?.email,
        data: {
          transactions: txs || [],
          subscriptions: subs || [],
          budgets: buds || [],
          recurring: recs || [],
          goals: gls || []
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `variance_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      if (setToast) setToast({ type: "success", text: "Complete data backup exported." });
    } catch {
      if (setToast) setToast({ type: "error", text: "Failed to compile backup archive." });
    }
  };

  // Password reset email trigger
  const handlePasswordReset = async () => {
    if (!session?.user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email);
    if (error) {
      setToast({ type: "error", text: error.message });
    } else {
      setToast({ type: "success", text: "Security reset link sent to your email." });
    }
  };

  return (
    <div className="page" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", margin: "0 0 4px 0", color: "#fff", fontWeight: "700" }}>Command Center & Preferences</h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Control room for global currency engines, account security, data backups, and parameters.
        </p>
      </div>

      <div className="settings-grid">
        
        {/* Navigation Sidebar */}
        <div className="card glass-card settings-nav" style={{ padding: "12px" }}>
          <button 
            className={`settings-nav-item ${activeSection === "general" ? "active" : ""}`}
            onClick={() => setActiveSection("general")}
          >
            <Settings2 size={16} /> Preferences
          </button>
          <button 
            className={`settings-nav-item ${activeSection === "account" ? "active" : ""}`}
            onClick={() => setActiveSection("account")}
          >
            <CircleDollarSign size={16} /> Account & Identity
          </button>
          <button 
            className={`settings-nav-item ${activeSection === "data" ? "active" : ""}`}
            onClick={() => setActiveSection("data")}
          >
            <HardDrive size={16} /> Vault & Backups
          </button>
          <button 
            className={`settings-nav-item ${activeSection === "security" ? "active" : ""}`}
            onClick={() => setActiveSection("security")}
          >
            <Check size={16} /> Security & Session
          </button>
        </div>

        {/* Dynamic Panels */}
        <div>
          
          {/* Panel 1: General Financial Preferences */}
          {activeSection === "general" && (
            <div className="card glass-card settings-panel">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", color: "#fff" }}>Financial Parameters</h3>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Primary Currency Symbol</h4>
                  <p>Applied to ledger totals, exports, and automated analytics.</p>
                </div>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  className="inline-edit-input"
                  style={{ width: "130px", padding: "8px 12px" }}
                >
                  <option value="₹">INR (₹)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="A$">AUD (A$)</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Fiscal Year Origin</h4>
                  <p>Tax calendar cycle used to group annual statements.</p>
                </div>
                <select 
                  value={fiscalYearStart} 
                  onChange={(e) => setFiscalYearStart(e.target.value)} 
                  className="inline-edit-input"
                  style={{ width: "130px", padding: "8px 12px" }}
                >
                  <option value="April">April (IN Standard)</option>
                  <option value="January">January (Calendar)</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Monthly Burn Ceiling</h4>
                  <p>Target threshold for dashboard danger alerts.</p>
                </div>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  placeholder="e.g. 50000" 
                  className="inline-edit-input"
                  style={{ width: "130px", padding: "8px 12px" }}
                />
              </div>

              <div className="settings-action-bar">
                <button 
                  className="btn-primary" 
                  onClick={handleSave} 
                  disabled={loading}
                  type="button"
                >
                  <Save size={15} /> {loading ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* Panel 2: Account & Identity */}
          {activeSection === "account" && (
            <div className="card glass-card settings-panel">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", color: "#fff" }}>Profile Identity</h3>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "linear-gradient(135deg, #00f0ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060913", fontWeight: "800", fontSize: "1.3rem" }}>
                  {session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "#fff", fontSize: "1rem" }}>{session?.user?.email?.split("@")[0]}</h4>
                  <span style={{ background: "rgba(0, 240, 255, 0.1)", border: "1px solid rgba(0, 240, 255, 0.3)", color: "#00f0ff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                    PRO PLAN • ENCRYPTED
                  </span>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Registered Email</h4>
                  <p>Primary handle associated with your cloud repository.</p>
                </div>
                <input 
                  type="text" 
                  disabled 
                  value={session?.user?.email || ""} 
                  className="inline-edit-input"
                  style={{ width: "220px", color: "var(--text-muted)", cursor: "not-allowed" }}
                />
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>User UUID</h4>
                  <p>Unique backend identifier assigned in Supabase Auth.</p>
                </div>
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px" }}>
                  {session?.user?.id ? session.user.id.slice(0, 18) + "..." : "Local"}
                </span>
              </div>
            </div>
          )}

          {/* Panel 3: Data Management & Backups */}
          {activeSection === "data" && (
            <div className="card glass-card settings-panel">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", color: "#fff" }}>Vault & Portability</h3>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Full JSON Data Archive</h4>
                  <p>Download a complete snapshot of all transactions, recurring bills, goals, and budgets.</p>
                </div>
                <button 
                  onClick={handleExportFullBackup}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0, 240, 255, 0.1)", border: "1px solid rgba(0, 240, 255, 0.3)", color: "#00f0ff", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                >
                  <Download size={15} /> Export JSON
                </button>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Clear Client Workspace Cache</h4>
                  <p>Purges temporary local offline caches without touching your cloud database.</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("delta_vault_docs");
                    localStorage.removeItem("delta_goals");
                    if (setToast) setToast({ type: "info", text: "Local browser cache wiped." });
                  }}
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--card-border)", color: "#fff", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {/* Panel 4: Security & Session */}
          {activeSection === "security" && (
            <div className="card glass-card settings-panel">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", color: "#fff" }}>Security & Access</h3>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Security Password Reset</h4>
                  <p>Send a secure one-time password recovery link to your registered email.</p>
                </div>
                <button 
                  onClick={handlePasswordReset}
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--card-border)", color: "#fff", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer" }}
                >
                  Send Reset Link
                </button>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Terminate Active Session</h4>
                  <p>Safely log out from this browser session.</p>
                </div>
                <button 
                  onClick={() => window.confirm("Terminate active session?") && supabase.auth.signOut()}
                  style={{ background: "rgba(255, 82, 82, 0.1)", border: "1px solid rgba(255, 82, 82, 0.3)", color: "#ff5252", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);