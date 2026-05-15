import useNotificationUpdates from '../lib/useNotificationUpdates';
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Send, DollarSign } from 'lucide-react';
import Charts from './Charts';
import '../styles/Dashboard.css';

// ============================================
// STAT CARD COMPONENT
// FIX: moved outside Dashboard to prevent recreation on every render
// ============================================
const StatCard = ({ icon: Icon, label, value, change, trend }) => (
  <div className="stat-card group">
    <div className="stat-card-blur"></div>
    <div className="stat-card-content">
      <div className="stat-header">
        <div className="stat-icon-wrapper">
          <Icon className="stat-icon" size={24} />
        </div>
        <div className={`stat-badge ${trend}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}%
        </div>
      </div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">
        $
        {typeof value === 'number'
          ? value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : value}
      </h3>
    </div>
  </div>
);

const Dashboard = () => {
  // ============================================
  // EXISTING STATE
  // ============================================
  const [stats, setStats] = useState({
    totalBalance: 15240.50,
    monthlyIncome: 8500.00,
    monthlyExpense: 3240.75,
    transactions: 127,
  });

  const [loading, setLoading] = useState(true);

  // ============================================
  // NEW: NOTIFICATION STATES
  // ============================================
  const [transactions, setTransactions] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('inactive');
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Get userId from your auth system (localStorage, context, or Redux)
  const userId = localStorage.getItem('userId') || 'YOUR_USER_ID';

  // ============================================
  // NOTIFICATION CALLBACK
  // ============================================
  const handleNotificationUpdate = useCallback((newData) => {
    console.log('Dashboard received:', newData);
    
    if (newData?.transaction) {
      // Add to top of transactions list
      setTransactions(prevTransactions => [newData.transaction, ...prevTransactions]);
      
      // Update notification message
      const merchant = newData.transaction.merchant || 'Unknown Merchant';
      const amount = newData.transaction.amount || 0;
      const type = newData.transaction.type === 'income' ? 'Received' : 'Sent';
      setNotificationMessage(`${type} ₹${amount.toFixed(2)} to/from ${merchant}`);
      
      // Show notification banner
      setNotificationStatus('active');
      
      // Auto-hide after 3 seconds
      setTimeout(() => setNotificationStatus('inactive'), 3000);

      // Update transaction count
      setStats(prevStats => ({
        ...prevStats,
        transactions: prevStats.transactions + 1,
      }));
    }
  }, []);

  // ============================================
  // NOTIFICATION HOOK
  // ============================================
  useNotificationUpdates(userId, handleNotificationUpdate);

  // ============================================
  // EXISTING USEEFFECT FOR LOADING
  // ============================================
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="dashboard-container">
      {/* ============================================
          NOTIFICATION BANNER (NEW)
          ============================================ */}
      {notificationStatus === 'active' && (
        <div className="notification-banner">
          <span className="notification-icon">✓</span>
          <span className="notification-text">
            New transaction: {notificationMessage}
          </span>
          <button
            className="notification-close"
            onClick={() => setNotificationStatus('inactive')}
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================
          DASHBOARD HEADER
          ============================================ */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Financial Dashboard</h1>
          <p className="dashboard-subtitle">Monitor your wealth in real-time</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Send size={18} />
            Send Money
          </button>
        </div>
      </div>

      {/* ============================================
          STATISTICS GRID
          ============================================ */}
      <div className="stats-grid">
        <StatCard
          icon={Wallet}
          label="Total Balance"
          value={stats.totalBalance}
          change="12.5"
          trend="up"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Income"
          value={stats.monthlyIncome}
          change="8.2"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Expense"
          value={stats.monthlyExpense}
          change="3.1"
          trend="down"
        />
        <StatCard
          icon={Send}
          label="Total Transactions"
          value={stats.transactions}
          change="15.3"
          trend="up"
        />
      </div>

      {/* ============================================
          CHARTS SECTION
          ============================================ */}
      <div className="charts-section">
        <Charts />
      </div>

      {/* ============================================
          QUICK ACTIONS
          ============================================ */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {[
            { icon: '💳', label: 'Add Card', color: 'gradient-blue' },
            { icon: '📊', label: 'View Report', color: 'gradient-purple' },
            { icon: '⚙️', label: 'Settings', color: 'gradient-cyan' },
            { icon: '🔔', label: 'Notifications', color: 'gradient-pink' },
          ].map((action, idx) => (
            <button key={idx} className={`action-btn ${action.color}`}>
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================
          RECENT TRANSACTIONS (from notifications)
          ============================================ */}
      {transactions.length > 0 && (
        <div className="recent-transactions">
          <h2 className="section-title">Recent Notifications</h2>
          <div className="transactions-preview">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx._id} className="transaction-preview-item">
                <div className="tx-icon">
                  {tx.type === 'income' ? '📥' : '📤'}
                </div>
                <div className="tx-details">
                  <p className="tx-merchant">{tx.merchant}</p>
                  <p className="tx-category">{tx.category}</p>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;