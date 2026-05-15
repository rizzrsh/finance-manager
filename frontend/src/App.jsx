import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';

import {
  Home,
  BarChart3,
  Send,
  Brain,
  MessageSquare,
  MapPin,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';

import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import { supabase } from './lib/supabaseClient';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Transactions from './components/Transactions';
import Insights from './components/Insights';
import SMSParser from './components/SMSParser';
import MerchantMap from './components/MerchantMap';

import { initializeAPI } from './lib/api.config';
import './styles/App.css';

// ── Redirects already-logged-in users away from /auth ────────────────────────
function PublicRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;       // still loading
  if (session) return <Navigate to="/" replace />; // already logged in
  return children;                              // not logged in → show Auth
}

export default function App() {
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isReady = await initializeAPI();
        setApiReady(isReady);
        if (!isReady) {
          setApiError('Backend service is unavailable. Some features may not work.');
        }
      } catch (error) {
        console.error('API initialization failed:', error);
        setApiError('Failed to initialize backend connection');
      }
    };

    init();
  }, []);

  return (
    <Router>
      <AppContent apiReady={apiReady} apiError={apiError} />
    </Router>
  );
}

function AppContent({ apiReady, apiError }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const navigation = [
    {
      id: 'dashboard',
      path: '/',
      label: 'Dashboard',
      icon: Home,
      element: <Dashboard />,
    },
    {
      id: 'charts',
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      element: <Charts />,
    },
    {
      id: 'transactions',
      path: '/transactions',
      label: 'Transactions',
      icon: Send,
      element: <Transactions />,
    },
    {
      id: 'insights',
      path: '/insights',
      label: 'AI Insights',
      icon: Brain,
      element: <Insights />,
    },
    {
      id: 'sms',
      path: '/sms-parser',
      label: 'SMS Parser',
      icon: MessageSquare,
      element: <SMSParser />,
    },
    {
      id: 'merchant',
      path: '/merchant-map',
      label: 'Merchant Map',
      icon: MapPin,
      element: <MerchantMap />,
    },
  ];

  return (
    <div className={`app-container ${!darkMode ? 'light-mode' : ''}`}>

      {/* ============================================
          API STATUS BANNER
          ============================================ */}
      {apiError && (
        <div className="api-error-banner">
          <span>⚠️ {apiError}</span>
          <button
            onClick={() => window.location.reload()}
            className="banner-action"
          >
            Retry
          </button>
        </div>
      )}

      {apiReady && !apiError && (
        <div className="api-ready-banner">
          <span>✓ Backend connected</span>
        </div>
      )}

      {/* ============================================
          SIDEBAR
          ============================================ */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="app-logo">
            <span className="logo-icon">💰</span>
            <div>
              <h2 className="logo-text">FinanceFlow</h2>
              <p className="logo-subtitle">Smart Finance AI</p>
            </div>
          </div>

          <button
            className="sidebar-toggle-mobile"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                <div className="nav-indicator"></div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <UserProfile />

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <main className="main-content">

        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-current">Finance Manager</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
              />
            </div>

            <div className="header-divider"></div>

            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="notifications">
              <button className="notification-btn">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
            </div>

            <div className="header-divider"></div>

            <div className="user-menu">
              <button className="user-menu-trigger">
                <div className="avatar-small">JD</div>
                <span className="username">John</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Routes */}
        <section className="page-content">
          <Routes>
            {/* Auth Route - Public (redirects away if already logged in) */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Routes>
                    {navigation.map((item) => (
                      <Route
                        key={item.id}
                        path={item.path}
                        element={item.element}
                      />
                    ))}
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <p>© 2024 FinanceFlow. All rights reserved.</p>
          <div className="footer-links">
            <a href="/">Privacy</a>
            <a href="/">Terms</a>
            <a href="/">Support</a>
          </div>
        </footer>
      </main>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}