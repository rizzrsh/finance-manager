import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownLeft,
  Clock, CheckCircle, AlertCircle, LayoutList, LayoutGrid, RefreshCw,
} from 'lucide-react';

import { supabase }                        from '../lib/supabaseClient';
import { getTransactions, getCurrentUser } from '../lib/database';
import useNotificationUpdates              from '../lib/useNotificationUpdates';
import '../styles/Transactions.css';

// ─── DEMO DATA (fallback when no Supabase data exists) ────────────────────────
const DEMO_TRANSACTIONS = [
  {
    id: 1, _id: '001',
    description: 'Grocery Shopping',    merchant: 'Whole Foods Market',
    amount: 125.50,  category: 'Food',          date: '2024-05-13',
    timestamp: '2024-05-13T10:30:00',  status: 'completed', type: 'expense', source: 'notification',
  },
  {
    id: 2, _id: '002',
    description: 'Salary Deposit',      merchant: 'Company Payroll',
    amount: 3500.00, category: 'Income',        date: '2024-05-12',
    timestamp: '2024-05-12T09:00:00',  status: 'completed', type: 'income',  source: 'notification',
  },
  {
    id: 3, _id: '003',
    description: 'Electric Bill',       merchant: 'Power Company',
    amount: 89.99,   category: 'Utilities',     date: '2024-05-11',
    timestamp: '2024-05-11T14:20:00',  status: 'completed', type: 'expense', source: 'sms',
  },
  {
    id: 4, _id: '004',
    description: 'Coffee Shop',         merchant: 'Starbucks',
    amount: 15.30,   category: 'Food',          date: '2024-05-10',
    timestamp: '2024-05-10T08:45:00',  status: 'pending',   type: 'expense', source: 'manual',
  },
  {
    id: 5, _id: '005',
    description: 'Freelance Project',   merchant: 'Client Payment',
    amount: 450.00,  category: 'Income',        date: '2024-05-09',
    timestamp: '2024-05-09T16:15:00',  status: 'completed', type: 'income',  source: 'notification',
  },
  {
    id: 6, _id: '006',
    description: 'Netflix Subscription',merchant: 'Netflix Inc.',
    amount: 15.99,   category: 'Entertainment', date: '2024-05-08',
    timestamp: '2024-05-08T00:00:00',  status: 'completed', type: 'expense', source: 'sms',
  },
  {
    id: 7, _id: '007',
    description: 'Gas Station',         merchant: 'Shell Gas',
    amount: 45.00,   category: 'Transport',     date: '2024-05-07',
    timestamp: '2024-05-07T12:30:00',  status: 'failed',    type: 'expense', source: 'notification',
  },
  {
    id: 8, _id: '008',
    description: 'Restaurant Dinner',   merchant: 'Olive Garden',
    amount: 65.50,   category: 'Food',          date: '2024-05-06',
    timestamp: '2024-05-06T19:45:00',  status: 'completed', type: 'expense', source: 'manual',
  },
];

// ─── HELPER: normalise a Supabase row → component shape ──────────────────────
const formatDbTransaction = (tx, idx) => ({
  id:          tx.id      || idx,
  _id:         String(tx.id || idx),
  description: tx.description || 'Transaction',
  merchant:    tx.description || 'Unknown',
  amount:      Math.abs(parseFloat(tx.amount) || 0),
  category:    tx.category    || 'Other',
  date:        tx.date        || (tx.created_at ? tx.created_at.split('T')[0] : ''),
  timestamp:   tx.created_at  || tx.date || new Date().toISOString(),
  status:      tx.status      || 'completed',
  type:        parseFloat(tx.amount) >= 0 ? 'income' : 'expense',
  source:      tx.source      || 'manual',
});

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
const Transactions = () => {
  // ── STATE ─────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState(DEMO_TRANSACTIONS);
  const [userId,       setUserId]       = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');

  // UI controls
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('all');
  const [sortBy,      setSortBy]      = useState('date');
  const [expandedId,  setExpandedId]  = useState(null);
  const [viewMode,    setViewMode]    = useState('list');

  // ── FETCH FROM SUPABASE (mirrors Dashboard pattern) ───────────────────────
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn('No user logged in');
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const fetched = await getTransactions();
      if (fetched && fetched.length > 0) {
        setTransactions(fetched.map(formatDbTransaction));
      }
      // else keep DEMO_TRANSACTIONS as fallback
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMsg('Could not load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── REAL-TIME UPDATES (same hook as Dashboard + SMSParser) ────────────────
  const handleNotificationUpdate = useCallback((newData) => {
    if (!newData?.transaction) return;
    const tx = newData.transaction;
    const formatted = formatDbTransaction(tx, Date.now());

    setTransactions(prev => [formatted, ...prev]);
    showSuccess(`New transaction: ${formatted.type === 'income' ? '+' : '-'}₹${formatted.amount.toFixed(2)} — ${formatted.merchant}`);
  }, []);

  useNotificationUpdates(userId, handleNotificationUpdate);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} className="status-icon completed" />;
      case 'pending':   return <Clock       size={18} className="status-icon pending"   />;
      case 'failed':    return <AlertCircle size={18} className="status-icon failed"    />;
      default:          return null;
    }
  };

  const getStatusBadge = (status) => (
    <span className={`status-badge status-${status}`}>
      {getStatusIcon(status)}
      <span className="status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );

  const getSourceBadge = (source) => {
    const cfg = {
      notification: { emoji: '📱', label: 'Notification' },
      sms:          { emoji: '💬', label: 'SMS'          },
      manual:       { emoji: '✏️', label: 'Manual'       },
    };
    const { emoji, label } = cfg[source] || cfg.manual;
    return (
      <span className={`source-badge source-${source}`}>
        {emoji} {label}
      </span>
    );
  };

  const formatDate      = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTableDate = (d) => new Date(d).toLocaleDateString();

  // ── FILTERED + SORTED LIST ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const q = search.toLowerCase();
        const matchesSearch =
          t.description.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q)    ||
          t.category.toLowerCase().includes(q);
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date')   return new Date(b.date) - new Date(a.date);
        if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
        return 0;
      });
  }, [search, filterType, sortBy, transactions]);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="transactions-container">

      {/* ── HEADER ── */}
      <div className="transactions-header">
        <div>
          <h2 className="transactions-title">Transactions History</h2>
          <p className="transactions-subtitle">View and manage all your transactions</p>
        </div>
        <button
          className="btn-refresh-sms"
          onClick={fetchTransactions}
          disabled={isLoading}
          title="Reload from Supabase"
        >
          <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
        </button>
      </div>

      {/* ── TOASTS ── */}
      {errorMsg && (
        <div className="sms-toast sms-toast-error">
          <span>{errorMsg}</span>
          <button className="sms-toast-close" onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="sms-toast sms-toast-success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── LOADING ── */}
      {isLoading && (
        <div className="sms-loading-row">
          <RefreshCw size={15} className="spin-icon" />
          <span>Loading from Supabase…</span>
        </div>
      )}

      {/* ── CONTROLS & FILTERS ── */}
      <div className="transactions-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by description, merchant, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="control-buttons">
          <div className="filter-group">
            <Filter size={20} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="sort-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <LayoutList size={20} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD (LIST) VIEW ── */}
      {viewMode === 'list' && (
        <div className="transactions-list">
          {filtered.length > 0 ? (
            filtered.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                <div
                  className="transaction-main"
                  onClick={() =>
                    setExpandedId(expandedId === transaction.id ? null : transaction.id)
                  }
                >
                  <div className="transaction-left">
                    <div className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === 'income'
                        ? <ArrowDownLeft size={20} />
                        : <ArrowUpRight  size={20} />
                      }
                    </div>
                    <div className="transaction-details">
                      <h4 className="transaction-description">{transaction.description}</h4>
                      <div className="transaction-meta">
                        <span className="category-badge">{transaction.category}</span>
                        <span className="merchant-text">{transaction.merchant}</span>
                        <span className="date-text">{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="transaction-right">
                    <span className={`amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <div className="source-wrapper">{getSourceBadge(transaction.source)}</div>
                    <div className="status-wrapper">{getStatusBadge(transaction.status)}</div>
                    <ChevronDown
                      size={20}
                      className={`expand-icon ${expandedId === transaction.id ? 'expanded' : ''}`}
                    />
                  </div>
                </div>

                {expandedId === transaction.id && (
                  <div className="transaction-expanded">
                    <div className="expanded-content">
                      <div className="expanded-item">
                        <span className="label">Transaction ID</span>
                        <span className="value">#{String(transaction.id).padStart(6, '0')}</span>
                      </div>
                      <div className="expanded-item">
                        <span className="label">Merchant</span>
                        <span className="value">{transaction.merchant}</span>
                      </div>
                      <div className="expanded-item">
                        <span className="label">Category</span>
                        <span className="value">{transaction.category}</span>
                      </div>
                      <div className="expanded-item">
                        <span className="label">Source</span>
                        <span className="value">{getSourceBadge(transaction.source)}</span>
                      </div>
                      <div className="expanded-item">
                        <span className="label">Status</span>
                        <span className="value">{getStatusBadge(transaction.status)}</span>
                      </div>
                      <div className="expanded-item full-width">
                        <button className="action-btn">View Details</button>
                        <button className="action-btn secondary">Download Receipt</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No transactions found</p>
              <span>Try adjusting your search or filters</span>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="transactions-table-wrapper">
          {filtered.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className={`row-${t.type}`}>
                    <td className="table-date">{formatTableDate(t.timestamp)}</td>
                    <td className="table-merchant">{t.merchant}</td>
                    <td className="table-amount">
                      <span className={`amount ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="table-source">{getSourceBadge(t.source)}</td>
                    <td className="table-category">
                      <span className="category-badge">{t.category}</span>
                    </td>
                    <td className="table-status">{getStatusBadge(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No transactions found</p>
              <span>Try adjusting your search or filters</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;