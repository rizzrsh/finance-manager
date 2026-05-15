import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── Keyframe animations injected once ───────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(99,102,241,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(1deg); }
    66%       { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .auth-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #0d0f14;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* ── Background grid ── */
  .auth-root::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* ── Ambient glows ── */
  .glow-purple {
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
    border-radius: 50%;
    top: -100px; left: -100px;
    pointer-events: none;
  }
  .glow-teal {
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%);
    border-radius: 50%;
    bottom: -80px; right: -80px;
    pointer-events: none;
  }

  /* ── Floating orbs ── */
  .orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .orb-1 {
    width: 6px; height: 6px;
    background: rgba(99,102,241,0.5);
    top: 20%; left: 15%;
    animation: float 6s ease-in-out infinite;
  }
  .orb-2 {
    width: 4px; height: 4px;
    background: rgba(20,184,166,0.5);
    top: 60%; right: 20%;
    animation: float 8s ease-in-out infinite 2s;
  }
  .orb-3 {
    width: 8px; height: 8px;
    background: rgba(168,85,247,0.3);
    bottom: 25%; left: 25%;
    animation: float 7s ease-in-out infinite 1s;
  }

  /* ── Card ── */
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: #13151c;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px 36px;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s ease both;
  }

  /* ── Logo ── */
  .logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
    animation: fadeUp 0.5s ease 0.05s both;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #14b8a6, #6366f1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    animation: pulse-ring 3s ease-in-out infinite;
  }
  .logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #ffffff;
    letter-spacing: -0.3px;
  }
  .logo-text span { color: #6366f1; }

  /* ── Headings ── */
  .auth-heading {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 26px;
    color: #ffffff;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .auth-sub {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 28px;
    animation: fadeUp 0.5s ease 0.15s both;
  }

  /* ── Tab switcher ── */
  .tab-switcher {
    display: flex;
    background: #0d0f14;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 24px;
    animation: fadeUp 0.5s ease 0.2s both;
  }
  .tab-btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-radius: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    color: #6b7280;
  }
  .tab-btn.active {
    background: #1e2130;
    color: #ffffff;
    border: 1px solid rgba(99,102,241,0.3);
  }

  /* ── Form fields ── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }
  .field-wrap {
    position: relative;
    animation: fadeUp 0.5s ease both;
  }
  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #9ca3af;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .field-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .field-icon {
    position: absolute;
    left: 14px;
    color: #4b5563;
    font-size: 16px;
    pointer-events: none;
    transition: color 0.2s;
  }
  .field-input {
    width: 100%;
    background: #0d0f14;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 12px 14px 12px 40px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #ffffff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field-input::placeholder { color: #374151; }
  .field-input:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .field-input:focus + .field-icon,
  .field-input-wrap:focus-within .field-icon { color: #6366f1; }
  .field-input-wrap .field-icon { left: 14px; }

  /* Eye toggle for password */
  .eye-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #4b5563;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .eye-btn:hover { color: #9ca3af; }

  /* ── Error / success banners ── */
  .banner {
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeUp 0.3s ease both;
  }
  .banner.error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
  }
  .banner.success {
    background: rgba(20,184,166,0.1);
    border: 1px solid rgba(20,184,166,0.2);
    color: #2dd4bf;
  }

  /* ── Submit button ── */
  .submit-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #ffffff;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
    letter-spacing: 0.2px;
  }
  .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .submit-btn .shimmer-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
  }
  .btn-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }

  /* ── Divider ── */
  .divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
    color: #374151;
    font-size: 12px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  /* ── Google / OAuth button ── */
  .oauth-btn {
    width: 100%;
    padding: 12px;
    background: #1a1d27;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #d1d5db;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.2s, border-color 0.2s;
    margin-bottom: 24px;
  }
  .oauth-btn:hover {
    background: #1e2130;
    border-color: rgba(255,255,255,0.14);
  }

  /* ── Bottom switch ── */
  .bottom-switch {
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    animation: fadeUp 0.5s ease 0.35s both;
  }
  .bottom-switch button {
    background: none; border: none;
    color: #818cf8;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .bottom-switch button:hover { color: #a5b4fc; }

  /* ── Spinner ── */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin-slow 0.7s linear infinite;
  }

  /* ── Stats footer ── */
  .stats-row {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 28px;
    animation: fadeUp 0.5s ease 0.4s both;
  }
  .stat-item { text-align: center; }
  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }
  .stat-label { font-size: 11px; color: #4b5563; margin-top: 2px; }
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconEye = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconFinance = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear messages when switching modes
  useEffect(() => {
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
  }, [mode]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    if (!email.trim()) return setError("Please enter your email address.");
    if (!password) return setError("Please enter your password.");
    if (mode === "signup" && password.length < 8)
      return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        // On success, App.jsx onAuthStateChange fires → redirects automatically
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) setError(error.message);
        else setSuccess("Account created! Check your email to confirm, then log in.");
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const isLogin = mode === "login";

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-root">
        {/* Background decoration */}
        <div className="glow-purple" />
        <div className="glow-teal" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="auth-card">
          {/* Logo */}
          <div className="logo-row">
            <div className="logo-icon"><IconFinance /></div>
            <span className="logo-text">Finance<span>AI</span></span>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="auth-sub">
            {isLogin
              ? "Sign in to your personal finance dashboard"
              : "Start tracking your finances smarter with AI"}
          </p>

          {/* Tab Switcher */}
          <div className="tab-switcher">
            <button className={`tab-btn ${isLogin ? "active" : ""}`} onClick={() => setMode("login")}>
              Sign In
            </button>
            <button className={`tab-btn ${!isLogin ? "active" : ""}`} onClick={() => setMode("signup")}>
              Sign Up
            </button>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="banner error">
              <IconAlert /> {error}
            </div>
          )}
          {success && (
            <div className="banner success">
              <IconCheck /> {success}
            </div>
          )}

          {/* Form fields */}
          <div className="field-group">
            {!isLogin && (
              <div className="field-wrap" style={{ animationDelay: "0.22s" }}>
                <label className="field-label">Full Name</label>
                <div className="field-input-wrap">
                  <span className="field-icon"><IconUser /></span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="field-wrap" style={{ animationDelay: "0.25s" }}>
              <label className="field-label">Email Address</label>
              <div className="field-input-wrap">
                <span className="field-icon"><IconMail /></span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-wrap" style={{ animationDelay: "0.28s" }}>
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <span className="field-icon"><IconLock /></span>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  placeholder={isLogin ? "Your password" : "Min. 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  style={{ paddingRight: 40 }}
                />
                <button
                  className="eye-btn"
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <IconEye open={showPass} />
                </button>
              </div>
            </div>
          </div>

          {/* Forgot password link */}
          {isLogin && (
            <div style={{ textAlign: "right", marginBottom: 20, marginTop: -8 }}>
              <button
                onClick={() => alert("Password reset: coming soon!")}
                style={{
                  background: "none", border: "none", color: "#6b7280",
                  fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            <span className="shimmer-overlay" />
            <span className="btn-inner">
              {loading ? (
                <><div className="spinner" /> {isLogin ? "Signing in..." : "Creating account..."}</>
              ) : (
                isLogin ? "Sign In →" : "Create Account →"
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="divider">or continue with</div>

          {/* Google OAuth */}
          <button className="oauth-btn" onClick={handleGoogle}>
            <IconGoogle />
            Continue with Google
          </button>

          {/* Switch mode */}
          <div className="bottom-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(isLogin ? "signup" : "login")}>
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </div>

          {/* Stats footer */}
          <div className="stats-row">
            {[
              { num: "₹0", label: "Always free" },
              { num: "100%", label: "Private data" },
              { num: "AI", label: "Powered insights" },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}