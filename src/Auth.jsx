import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let error;
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
      if (!error) setMessage('Account created! Please log in.');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    }

    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#05070e',
      backgroundImage: `
        radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Solid Static Frosted Glass Panel */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(11, 16, 29, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.05)',
        boxSizing: 'border-box'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo.png"
            alt="Variance Logo"
            style={{
              width: '60px',
              height: '60px',
              maxWidth: '60px',
              maxHeight: '60px',
              objectFit: 'contain',
              borderRadius: '14px',
              marginBottom: '1rem',
              backgroundColor: '#0e1526',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
              display: 'inline-block'
            }}
          />
          <h2 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #ffffff 50%, #00f0ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            DELTA
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            color: '#94a3b8',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            BY VARIANCE
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {message && (
            <div style={{
              color: message.includes('created') ? '#00e676' : '#ff5252',
              fontSize: '0.85rem',
              textAlign: 'center',
              backgroundColor: message.includes('created') ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${message.includes('created') ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)'}`
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: '#070a13',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: '#070a13',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
              color: '#05070e',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.25)'
            }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        {/* Mode Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            style={{ color: '#00f0ff', cursor: 'pointer', fontWeight: 700, marginLeft: '6px' }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
}