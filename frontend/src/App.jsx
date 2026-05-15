import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
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

import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Transactions from './components/Transactions';
import Insights from './components/Insights';
import SMSParser from './components/SMSParser';
import MerchantMap from './components/MerchantMap';

import { initializeAPI } from './lib/api.config';
import './styles/App.css';

export default function App() {
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // Initialize API connection on app load
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

  // FIX 1: Only apply 'light-mode' class when needed.
  // The :root CSS already defines dark theme by default,
  // so adding 'dark-mode' class does nothing and breaks rendering.
  const [darkMode, setDarkMode] = useState(true);

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
    // FIX 1: was `${darkMode ? 'dark-mode' : 'light-mode'}` — 'dark-mode' has no CSS
    // Now: only apply 'light-mode' when toggled; dark is the default :root theme
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
            {/* FIX 2: 'logo-icon' is correct in CSS */}
            <span className="logo-icon">💰</span>
            <div>
              <h2 className="logo-text">FinanceFlow</h2>
              {/* FIX 3: Added 'logo-subtitle' style in App.css below */}
              <p className="logo-subtitle">Smart Finance AI</p>
            </div>
          </div>

          {/* FIX 4: was 'mobile-close-btn' — CSS has 'sidebar-toggle-mobile' */}
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
                {/* FIX 5: Added 'nav-label' span — CSS targets this for text */}
                <span className="nav-label">{item.label}</span>
                {/* FIX 6: was 'active-indicator' — CSS has 'nav-indicator' */}
                <div className="nav-indicator"></div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">JD</div>
            {/* FIX 7: was 'user-details' — CSS has 'user-info' */}
            <div className="user-info">
              {/* FIX 8: was plain <h4> — CSS has 'user-name' and 'user-email' */}
              <p className="user-name">John Doe</p>
              <p className="user-email">john@example.com</p>
            </div>
          </div>

          <button className="logout-btn">
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
            {/* Sidebar toggle (hamburger) */}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>

            {/* FIX 9: was 'page-title' — CSS uses 'breadcrumb' pattern */}
            <div className="breadcrumb">
              <span className="breadcrumb-current">Finance Manager</span>
            </div>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
              />
            </div>

            <div className="header-divider"></div>

            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            {/* FIX 10: was standalone button — CSS wraps in 'notifications' div */}
            <div className="notifications">
              <button className="notification-btn">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
            </div>

            <div className="header-divider"></div>

            {/* Profile */}
            {/* FIX 11: was 'profile-mini'/'mini-avatar' — CSS uses 'user-menu'/'avatar-small' */}
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
            {navigation.map((item) => (
              <Route
                key={item.id}
                path={item.path}
                element={item.element}
              />
            ))}
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