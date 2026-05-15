import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, X, CheckCircle, AlertCircle,
  Clock, Copy, RefreshCw
} from 'lucide-react';
import '../styles/SMSParser.css';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ─── DEMO DATA (shown when backend is offline) ─────────────────────────────────
const DEMO_SMS = [
  {
    id: 1,
    message: 'Your account has been debited with INR 1,250 for Grocery shopping at BigMart. Available balance: INR 24,750',
    sender: 'BigMart',
    timestamp: '2024-05-13 14:30',
    parsed: { amount: 1250, type: 'debit', category: 'Groceries', merchant: 'BigMart', balance: 24750 },
    status: 'processed',
    source: 'sms',
  },
  {
    id: 2,
    message: 'Credit of INR 5,000 received as freelance payment from TechCorp. Ref: TX123456',
    sender: 'TechCorp',
    timestamp: '2024-05-12 09:15',
    parsed: { amount: 5000, type: 'credit', category: 'Income', merchant: 'TechCorp' },
    status: 'processed',
    source: 'sms',
  },
  {
    id: 3,
    message: 'Your Netflix subscription of INR 499 has been charged successfully.',
    sender: 'Netflix',
    timestamp: '2024-05-10 00:00',
    parsed: { amount: 499, type: 'debit', category: 'Entertainment', merchant: 'Netflix' },
    status: 'processed',
    source: 'sms',
  },
  {
    id: 4,
    message: 'Low Balance Alert: Your account balance is INR 2,450. Please maintain minimum balance.',
    sender: 'Bank Alert',
    timestamp: '2024-05-13 10:45',
    parsed: { amount: 2450, type: 'alert', category: 'Balance' },
    status: 'alert',
    source: 'sms',
  },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/** Convert a Supabase transaction row → SMSParser card format */
const formatDbTransaction = (tx, idx) => ({
  id: `db-${tx.id || idx}`,
  message: `${tx.description} — ₹${Math.abs(tx.amount)} [${tx.category}]`,
  sender: tx.description || 'Unknown',
  timestamp: tx.date || (tx.created_at ? tx.created_at.split('T')[0] : ''),
  parsed: {
    amount:   Math.abs(tx.amount),
    type:     tx.amount < 0 ? 'credit' : 'debit',
    category: tx.category || 'Other',
    merchant: tx.description || 'Unknown',
  },
  status: 'processed',
  source: tx.source || 'email',
});

/** Detect debit / credit / alert from raw SMS text */
const detectType = (text) => {
  const t = text.toLowerCase();
  if (['debited', 'debit', 'charged', 'paid'].some(k => t.includes(k))) return 'debit';
  if (['credited', 'credit', 'received', 'refund'].some(k => t.includes(k))) return 'credit';
  if (['alert', 'low balance', 'otp'].some(k => t.includes(k)))              return 'alert';
  return 'debit';
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
const SMSParser = () => {
  const [smsList,      setSmsList]      = useState(DEMO_SMS);
  const [newMessage,   setNewMessage]   = useState('');
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [selectedSms,  setSelectedSms]  = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // connection / async states
  const [isConnected,  setIsConnected]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');

  // ── 1. CHECK BACKEND via /api/health ─────────────────────────────────────
  const checkConnection = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setIsConnected(data.status === 'ok');
    } catch {
      setIsConnected(false);
    }
  }, []);

  // ── 2. LOAD TRANSACTIONS FROM SUPABASE via /api/transactions ─────────────
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res  = await fetch(`${API_BASE}/transactions`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSmsList(data.map(formatDbTransaction));
      }
    } catch {
      setErrorMsg('Could not load transactions. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    loadTransactions();
  }, [checkConnection, loadTransactions]);

  // ── 3. CALL /api/sms-parse ────────────────────────────────────────────────
  const callSmsParseApi = async (message) => {
    const res = await fetch(`${API_BASE}/sms-parse`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sms: message }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data; // { merchant, amount, date, category, description }
  };

  // ── 4. SAVE PARSED TRANSACTION via /api/transactions POST ─────────────────
  const saveTransaction = async (parsed) => {
    await fetch(`${API_BASE}/transactions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        description: parsed.merchant || 'Unknown',
        amount:      parsed.amount,
        date:        parsed.date,
        source:      'sms',
      }),
    });
  };

  // ── 5. ADD NEW SMS ────────────────────────────────────────────────────────
  const handleAddSms = async () => {
    if (!newMessage.trim()) return;

    const newId  = Date.now();
    const newSms = {
      id:        newId,
      message:   newMessage,
      sender:    'Manual Entry',
      timestamp: new Date().toLocaleString(),
      parsed:    null,
      status:    'pending',
      source:    'sms',
    };

    setSmsList(prev => [newSms, ...prev]);
    setNewMessage('');
    setShowAddForm(false);

    // Auto-process immediately if backend is up
    if (isConnected) {
      await processSms(newId, newMessage);
    }
  };

  // ── 6. PROCESS A PENDING SMS ──────────────────────────────────────────────
  const processSms = async (id, messageOverride) => {
    // Capture message before any async gap
    const message = messageOverride
      || smsList.find(s => s.id === id)?.message;
    if (!message) return;

    setProcessingId(id);
    setErrorMsg('');

    try {
      const apiResult = await callSmsParseApi(message);

      const parsed = {
        amount:   apiResult.amount,
        merchant: apiResult.merchant,
        category: apiResult.category,
        date:     apiResult.date,
        type:     detectType(message),
      };

      setSmsList(prev => prev.map(s =>
        s.id === id
          ? { ...s, parsed, status: parsed.type === 'alert' ? 'alert' : 'processed' }
          : s
      ));

      if (parsed.amount) {
        await saveTransaction(parsed);
        showSuccess('✓ SMS parsed and saved to Supabase!');
      }

    } catch (err) {
      // Fallback: mark processed with unknown data so UI doesn't stay "pending"
      setSmsList(prev => prev.map(s =>
        s.id === id
          ? {
              ...s,
              parsed: { amount: 0, type: detectType(message), category: 'Other', merchant: 'Unknown' },
              status: 'processed',
            }
          : s
      ));
      setErrorMsg(`Could not parse: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deleteSms    = (id)  => setSmsList(prev => prev.filter(s => s.id !== id));
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle size={18} className="status-icon" style={{ color: '#00d9ff' }} />;
      case 'pending':   return <Clock       size={18} className="status-icon" style={{ color: '#ffbe0b' }} />;
      case 'alert':     return <AlertCircle size={18} className="status-icon" style={{ color: '#ff3333' }} />;
      default:          return null;
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="sms-parser-container">

      {/* ── HEADER ── */}
      <div className="parser-header">
        <div>
          <MessageSquare size={32} className="header-icon" />
          <div>
            <h2 className="parser-title">SMS Transaction Parser</h2>
            <p className="parser-subtitle">Auto-parse banking SMS for transactions</p>
          </div>
        </div>

        <div className="parser-header-actions">
          <button
            className="btn-refresh-sms"
            onClick={loadTransactions}
            disabled={isLoading}
            title="Reload from Supabase"
          >
            <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
          </button>

          <button
            className="btn-add"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={20} />
            Add SMS
          </button>
        </div>
      </div>

      {/* ── CONNECTION STATUS BANNER ── */}
      <div className={`sms-connection-banner ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className={`sms-status-dot ${isConnected ? 'active' : ''}`} />
        {isConnected
          ? <span>✓ Backend connected — real parsing active <span className="sms-port-label">(localhost:5000)</span></span>
          : <span>Backend offline — showing demo data. Run: <code className="sms-inline-code">python app.py</code></span>
        }
      </div>

      {/* ── ERROR / SUCCESS TOASTS ── */}
      {errorMsg && (
        <div className="sms-toast sms-toast-error">
          <span>{errorMsg}</span>
          <button className="sms-toast-close" onClick={() => setErrorMsg('')}><X size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="sms-toast sms-toast-success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── ADD FORM ── */}
      {showAddForm && (
        <div className="add-sms-form">
          <div className="form-wrapper">
            <label className="form-label">Paste SMS Message</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the SMS message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows="4"
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={handleAddSms}>
                {isConnected ? 'Parse & Save' : 'Add Message'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setShowAddForm(false); setNewMessage(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATISTICS ── */}
      <div className="sms-statistics">
        <div className="stat-box">
          <span className="stat-label">Total Messages</span>
          <span className="stat-value">{smsList.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Processed</span>
          <span className="stat-value">{smsList.filter(s => s.status === 'processed').length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{smsList.filter(s => s.status === 'pending').length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Alerts</span>
          <span className="stat-value">{smsList.filter(s => s.status === 'alert').length}</span>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="sms-loading-row">
          <RefreshCw size={15} className="spin-icon" />
          <span>Loading from Supabase…</span>
        </div>
      )}

      {/* ── SMS LIST ── */}
      <div className="sms-list">
        {smsList.map((sms) => (
          <div
            key={sms.id}
            className={`sms-card status-${sms.status}`}
            onClick={() => setSelectedSms(selectedSms?.id === sms.id ? null : sms)}
          >
            {/* Card header */}
            <div className="sms-card-header">
              <div className="sms-meta">
                <div className="sender-badge">
                  {String(sms.sender || '?').charAt(0).toUpperCase()}
                </div>
                <div className="meta-info">
                  <h4 className="sender-name">{sms.sender}</h4>
                  <p className="sms-time">{sms.timestamp}</p>
                </div>
              </div>

              <div className="sms-status">
                <span className={`sms-source-pill sms-source-${sms.source || 'sms'}`}>
                  {sms.source === 'email' ? '📧' : '💬'} {sms.source || 'sms'}
                </span>
                {getStatusIcon(sms.status)}
                <span className="status-text">{sms.status}</span>
              </div>
            </div>

            {/* Message text */}
            <div className="sms-content">
              <p className="sms-message">{sms.message}</p>
            </div>

            {/* Parsed data */}
            {sms.parsed && (
              <div className="sms-parsed">
                <div className="parsed-items">
                  {sms.parsed.amount > 0 && (
                    <div className="parsed-item">
                      <span className="parsed-label">Amount</span>
                      <span className={`parsed-value ${sms.parsed.type}`}>
                        {sms.parsed.type === 'credit' ? '+' : '-'} ₹{sms.parsed.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {sms.parsed.category && (
                    <div className="parsed-item">
                      <span className="parsed-label">Category</span>
                      <span className="parsed-value">{sms.parsed.category}</span>
                    </div>
                  )}
                  {sms.parsed.merchant && (
                    <div className="parsed-item">
                      <span className="parsed-label">Merchant</span>
                      <span className="parsed-value">{sms.parsed.merchant}</span>
                    </div>
                  )}
                  {sms.parsed.balance && (
                    <div className="parsed-item">
                      <span className="parsed-label">Balance</span>
                      <span className="parsed-value">₹{sms.parsed.balance.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {sms.parsed.date && (
                    <div className="parsed-item">
                      <span className="parsed-label">Date</span>
                      <span className="parsed-value">{sms.parsed.date}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="sms-actions">
              {sms.status === 'pending' && (
                <button
                  className="action-btn process"
                  onClick={(e) => { e.stopPropagation(); processSms(sms.id); }}
                  disabled={processingId === sms.id}
                >
                  {processingId === sms.id
                    ? <><RefreshCw size={14} className="spin-icon" /> Processing…</>
                    : 'Process'
                  }
                </button>
              )}
              <button
                className="action-btn copy"
                onClick={(e) => { e.stopPropagation(); copyToClipboard(sms.message); }}
              >
                <Copy size={16} /> Copy
              </button>
              <button
                className="action-btn delete"
                onClick={(e) => { e.stopPropagation(); deleteSms(sms.id); }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {smsList.length === 0 && !isLoading && (
        <div className="empty-state">
          <MessageSquare size={48} />
          <p>No SMS messages yet</p>
          <span>Add SMS messages to auto-parse transactions</span>
        </div>
      )}
    </div>
  );
};

export default SMSParser;