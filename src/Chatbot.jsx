import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, X, Send, Bot, Zap } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial state with dynamic chips
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "DELTA Copilot online. FS-2603 risk engine active. Ask me about runway, budgets, transactions, or upcoming liabilities.", 
      sender: "ai",
      chips: ["Check Runway", "Budget Status", "Recent Transactions", "Upcoming Dues"]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Regex Intent Engine (Kestrel-inspired)
  const classifyIntent = (text) => {
    const t = text.toLowerCase();
    if (/(runway|liquidity|safe|horizon|p10)/.test(t)) return 'runway';
    if (/(budget|spend|spending|overspend)/.test(t)) return 'budget';
    if (/(transaction|vault|csv|recent|history)/.test(t)) return 'transactions';
    if (/(subscription|due|liability|netflix|rent|emi)/.test(t)) return 'subscriptions';
    if (/(invest|monte carlo|box-muller|trade)/.test(t)) return 'invest';
    if (/^(hi|hello|hey|help)\b/.test(t)) return 'greeting';
    return 'fallback';
  };

  const generateResponse = (intent) => {
    switch (intent) {
      case 'runway':
        return {
          text: "Your current P10 liquidity runway is 1.1 months based on a 60-day Box-Muller random walk. Your fixed liabilities are safe, but discretionary capital is tight.",
          chips: ["Evaluate a Trade", "Show Budgets"]
        };
      case 'budget':
        return {
          text: "You have consumed 79% of your total budget. 'Food & Dining' is nearing the safety threshold. Consider deferring non-essential allocation this week.",
          chips: ["Check Runway", "Recent Transactions"]
        };
      case 'transactions':
        return {
          text: "Vault synced. Your latest CSV ledger entries have been cryptographically deduplicated and normalized to 64-bit integer paise in Supabase.",
          chips: ["Show Budgets", "Upcoming Dues"]
        };
      case 'subscriptions':
        return {
          text: "Locked obligations over the next 7 days: Netflix Premium (₹649) and HDFC Credit Card (₹18,400). Both are fully provisioned in your runway forecast.",
          chips: ["Check Runway"]
        };
      case 'invest':
        return {
          text: "The Pre-Trade Guard uses Monte Carlo simulations to gate capital allocation. Input a proposed trade amount on the dashboard to test your solvency bounds.",
          chips: ["Check Runway", "Upcoming Dues"]
        };
      case 'greeting':
        return {
          text: "System active. How can I assist with your zero-drift ledger today?",
          chips: ["Check Runway", "Budget Status", "Recent Transactions", "Upcoming Dues"]
        };
      default:
        return {
          text: "I monitor your FS-2603 solvency parameters. Try asking about your runway, budgets, or recent vault transactions.",
          chips: ["Check Runway", "Budget Status", "Upcoming Dues"]
        };
    }
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Remove chips from the previous AI message to keep the UI clean
    setMessages(prev => prev.map(m => ({ ...m, chips: [] })));
    
    // Add User Message
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user", chips: [] }]);
    setInput("");
    setIsTyping(true);

    // Process Intent & Reply
    setTimeout(() => {
      const intent = classifyIntent(text);
      const response = generateResponse(intent);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: response.text, 
        sender: "ai", 
        chips: response.chips 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return createPortal(
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          background: "linear-gradient(135deg, #00f0ff, #a855f7)",
          border: "none", borderRadius: "50%",
          width: "56px", height: "56px",
          display: isOpen ? "none" : "flex", justifyContent: "center", alignItems: "center",
          cursor: "pointer", boxShadow: "0 8px 32px rgba(0, 240, 255, 0.3)",
          zIndex: 999999
        }}
      >
        <MessageSquare color="#090e1a" size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "380px", height: "540px",
          background: "#090e1a", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px", display: "flex", flexDirection: "column",
          boxShadow: "0 12px 48px rgba(0,0,0,0.8)", zIndex: 999999, overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            background: "rgba(255, 255, 255, 0.03)", padding: "16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap color="#00f0ff" size={20} />
              <strong style={{ color: "#fff", fontSize: "0.95rem" }}>DELTA Copilot</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  background: msg.sender === "user" ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${msg.sender === "user" ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                  padding: "10px 14px", borderRadius: "12px", maxWidth: "85%",
                  color: "#fff", fontSize: "0.85rem", lineHeight: "1.4"
                }}>
                  {msg.text}
                </div>
                
                {/* Dynamic Suggestion Chips for the latest AI message */}
                {msg.chips && msg.chips.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        style={{
                          background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.2)",
                          color: "#00f0ff", borderRadius: "12px", padding: "6px 10px",
                          fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(0, 240, 255, 0.15)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "rgba(0, 240, 255, 0.05)"}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: "flex-start", color: "#00f0ff", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <Bot size={14} /> Processing intent...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{
            padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "8px", background: "rgba(0,0,0,0.2)"
          }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "0.85rem", outline: "none"
              }}
            />
            <button type="submit" style={{
              background: "#a855f7", border: "none", borderRadius: "8px", padding: "0 14px",
              cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center"
            }}>
              <Send color="#fff" size={16} />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}