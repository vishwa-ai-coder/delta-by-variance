import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

// Make sure to import your Sidebar and Pages here!
// import Sidebar from './Sidebar'
// import Dashboard from './Dashboard'
// ... etc

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Variance Navigation State
  const [page, setPage] = useState("Dashboard");

  // Variance Data State (Keep your data arrays here)
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#050811', color: '#00f0ff' }}>
        Loading Variance Engine...
      </div>
    )
  }

  // If no user is logged in, show Auth Screen
  if (!session) {
    return <Auth />
  }

  // FULL VARIANCE APP (No Visible/Light Buttons)
  return (
    <div className="app-container">
      
      {/* We pass the email down so the Sidebar can display who is logged in */}
      <Sidebar 
        page={page} 
        setPage={setPage} 
        userEmail={session.user.email} 
        onLogout={() => supabase.auth.signOut()} 
      />

      <div className="content">
        {/* Notice: No top header with "Visible" or "Light" buttons here! */}

        {page === "Dashboard" && (
          <Dashboard 
            transactions={transactions}
            budgets={budgets}
            subscriptions={subscriptions}
            recurring={recurring}
            goals={goals}
            setPage={setPage} 
          />
        )}
        
        {/* Your other routes */}
        {/* {page === "Net Worth" && <NetWorth />} */}
        {/* {page === "Cash Flow" && <CashFlow />} */}
        {/* ... */}
        
      </div>
    </div>
  )
}