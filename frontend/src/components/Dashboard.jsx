import useNotificationUpdates from '../lib/useNotificationUpdates';
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Send, DollarSign } from 'lucide-react';
import { getTransactions, getCurrentUser } from '../lib/database';
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
  // STATE
  // ============================================
  const [stats, setStats] = useState({
    totalBalance: 15240.50,
    monthlyIncome: 8500.00,
    monthlyExpense: 3240.75,
    transactions: 127,
  });

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('inactive');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // ============================================
  // FETCH AND PROCESS TRANSACTIONS
  // ============================================
  const fetchAndProcessTransactions = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        console.warn('No user logged in');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch transactions
      const fetchedTransactions = await getTransactions();

      if (fetchedTransactions && fetchedTransactions.length > 0) {
        setTransactions(fetchedTransactions);

        // Calculate stats from real data
        const calculatedStats = calculateStats(fetchedTransactions);
        setStats(calculatedStats);
      } else {
        // Use demo data if no transactions
        setTransactions([]);
        // Keep default stats
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CALCULATE STATS FROM TRANSACTIONS
  // ============================================
  const calculateStats = (transactionList) => {
    if (!transactionList || transactionList.length === 0) {
      return {
        totalBalance: 15240.50,
        monthlyIncome: 8500.00,
        monthlyExpense: 3240.75,
        transactions: 127,
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    transactionList.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const txDate = new Date(tx.date || tx.created_at);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      // All time totals
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
      }

      // Current month totals
      if (txMonth === currentMonth && txYear === currentYear) {
        if (amount > 0) {
          monthlyIncome += amount;
        } else {
          monthlyExpense += Math.abs(amount);
        }
      }
    });

    const totalBalance = totalIncome - totalExpense;

    return {
      totalBalance: totalBalance,
      monthlyIncome: monthlyIncome,
      monthlyExpense: monthlyExpense,
      transactions: transactionList.length,
    };
  };

  // ============================================
  // NOTIFICATION CALLBACK
  // ============================================
  const handleNotificationUpdate = useCallback((newData) => {
    console.log('Dashboard received:', newData);

    if (newData?.transaction) {
      // Add to top of transactions list
      setTransactions((prevTransactions) => [newData.transaction, ...prevTransactions]);

      // Update notification message
      const merchant = newData.transaction.merchant || 'Unknown Merchant';
      const amount = newData.transaction.amount || 0;
      const type = amount > 0 ? 'Received' : 'Sent';
      setNotificationMessage(
        `${type} $${Math.abs(amount).toFixed(2)} to/from ${merchant}`
      );

      // Show notification banner
      setNotificationStatus('active');

      // Auto-hide after 3 seconds
      setTimeout(() => setNotificationStatus('inactive'), 3000);

      // Update stats with new transaction
      setStats((prevStats) => {
        const newStats = { ...prevStats };
        newStats.transactions = newStats.transactions + 1;

        if (amount > 0) {
          newStats.monthlyIncome += amount;
        } else {
          newStats.monthlyExpense += Math.abs(amount);
        }

        newStats.totalBalance = newStats.monthlyIncome - newStats.monthlyExpense;
        return newStats;
      });
    }
  }, []);

  // ============================================
  // NOTIFICATION HOOK
  // ============================================
  useNotificationUpdates(userId, handleNotificationUpdate);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  useEffect(() => {
    fetchAndProcessTransactions();
  }, [fetchAndProcessTransactions]);

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="dashboard-container">
      {/* ============================================
          NOTIFICATION BANNER
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
          <p className="dashboard-subtitle">
            {loading ? 'Loading your data...' : 'Monitor your wealth in real-time'}
          </p>
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
          RECENT TRANSACTIONS
          ============================================ */}
      {transactions.length > 0 && (
        <div className="recent-transactions">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="transactions-preview">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id || tx._id} className="transaction-preview-item">
                <div className="tx-icon">
                  {parseFloat(tx.amount) > 0 ? '📥' : '📤'}
                </div>
                <div className="tx-details">
                  <p className="tx-merchant">{tx.merchant || tx.description || 'Transaction'}</p>
                  <p className="tx-category">{tx.category || 'Uncategorized'}</p>
                </div>
                <div className={`tx-amount ${parseFloat(tx.amount) > 0 ? 'income' : 'expense'}`}>
                  {parseFloat(tx.amount) > 0 ? '+' : '-'}${Math.abs(parseFloat(tx.amount) || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          EMPTY STATE
          ============================================ */}
      {!loading && transactions.length === 0 && (
        <div className="recent-transactions">
          <h2 className="section-title">Recent Transactions</h2>
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#888',
              fontSize: '14px',
            }}
          >
            <p>No transactions yet.</p>
            <p style={{ marginTop: '10px', fontSize: '12px' }}>
              Add your first transaction to see it here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;