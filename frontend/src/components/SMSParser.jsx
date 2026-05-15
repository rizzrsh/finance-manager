import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, X, CheckCircle, AlertCircle,
  Clock, Copy, RefreshCw,
} from 'lucide-react';

import { supabase }                        from '../lib/supabaseClient';
import { getTransactions, getCurrentUser } from '../lib/database';
import useNotificationUpdates              from '../lib/useNotificationUpdates';
import '../styles/SMSParser.css';

// ─── DEMO DATA (shown when no real transactions exist) ─────────────────────────
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
  if (['debited', 'debit', 'charged', 'paid'].some(k => t.includes(k)))   return 'debit';
  if (['credited', 'credit', 'received', 'refund'].some(k => t.includes(k))) return 'credit';
  if (['alert', 'low balance', 'otp'].some(k => t.includes(k)))             return 'alert';
  return 'debit';
};

/** Client-side SMS parser using the Anthropic API (same pattern as Insights) */
const callAnthropicSmsParser = async (message) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Parse this banking SMS and return ONLY a JSON object with these fields:
{ "merchant": string, "amount": number, "date": string (YYYY-MM-DD), "category": string }

Categories: Groceries, Food, Entertainment, Transport, Utilities, Health, Shopping, Income, Alert, Other.
If a field is unknown, use null.

SMS: "${message}"`,
        },
      ],
    }),
  });
  const data = await response.json();
  const text = data.content?.map(c => c.text || '').join('') || '{}';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
const SMSParser = () => {
  const [smsList,      setSmsList]      = useState(DEMO_SMS);
  const [newMessage,   setNewMessage]   = useState('');
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [selectedSms,  setSelectedSms]  = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [userId,       setUserId]       = useState(null);

  // shared async states (mirrors Dashboard pattern)
  const [isLoading,  setIsLoading]  = useState(true);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── 1. LOAD TRANSACTIONS FROM SUPABASE (via shared db helper) ─────────────
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Get current user — same pattern as Dashboard
      const user = await getCurrentUser();
      if (!user) {
        console.warn('No user logged in');
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const fetched = await getTransactions();
      if (fetched && fetched.length > 0) {
        setSmsList(fetched.map(formatDbTransaction));
      }
      // else keep DEMO_SMS as fallback
    } catch (error) {
      console.error('Error loading transactions:', error);
      setErrorMsg('Could not load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // ── 2. REAL-TIME UPDATES (same hook as Dashboard) ─────────────────────────
  const handleNotificationUpdate = useCallback((newData) => {
    if (!newData?.transaction) return;
    const tx = newData.transaction;
    setSmsList(prev => [
      {
        id:        `rt-${tx.id || Date.now()}`,
        message:   `${tx.description || tx.merchant} — ₹${Math.abs(tx.amount)}`,
        sender:    tx.merchant || tx.description || 'Unknown',
        timestamp: new Date().toLocaleString(),
        parsed: {
          amount:   Math.abs(tx.amount),
          type:     tx.amount > 0 ? 'credit' : 'debit',
          category: tx.category || 'Other',
          merchant: tx.merchant || tx.description || 'Unknown',
        },
        status: 'processed',
        source: 'sms',
      },
      ...prev,
    ]);
    showSuccess(`New transaction received: ₹${Math.abs(tx.amount)} — ${tx.merchant || tx.description}`);
  }, []);

  useNotificationUpdates(userId, handleNotificationUpdate);

  // ── 3. PARSE SMS via Anthropic API ────────────────────────────────────────
  const processSms = async (id, messageOverride) => {
    const message = messageOverride || smsList.find(s => s.id === id)?.message;
    if (!message) return;

    setProcessingId(id);
    setErrorMsg('');

    try {
      const apiResult = await callAnthropicSmsParser(message);

      const parsed = {
        amount:   apiResult.amount   || 0,
        merchant: apiResult.merchant || 'Unknown',
        category: apiResult.category || 'Other',
        date:     apiResult.date     || new Date().toISOString().split('T')[0],
        type:     detectType(message),
      };

      setSmsList(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, parsed, status: parsed.type === 'alert' ? 'alert' : 'processed' }
            : s
        )
      );

      // Save to Supabase directly — mirrors Dashboard's Supabase usage
      if (parsed.amount) {
        const { error } = await supabase.from('transactions').insert([{
          description: parsed.merchant,
          amount:      parsed.type === 'debit' ? -Math.abs(parsed.amount) : Math.abs(parsed.amount),
          date:        parsed.date,
          category:    parsed.category,
          source:      'sms',
        }]);
        if (error) throw error;
        showSuccess('✓ SMS parsed and saved!');
      }

    } catch (err) {
      console.error('SMS parse error:', err);
      // Graceful fallback — don't leave card stuck in "pending"
      setSmsList(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                parsed: { amount: 0, type: detectType(message), category: 'Other', merchant: 'Unknown' },
                status: 'processed',
              }
            : s
        )
      );
      setErrorMsg(`Could not parse SMS: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── 4. ADD NEW SMS ────────────────────────────────────────────────────────
  const handleAddSms = async () => {
    if (!newMessage.trim()) return;

    const newId = Date.now();
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

    // Auto-process immediately
    await processSms(newId, newMessage);
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deleteSms       = (id)  => setSmsList(prev => prev.filter(s => s.id !== id));
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

      {/* ── ERROR / SUCCESS TOASTS ── */}
      {errorMsg && (
        <div className="sms-toast sms-toast-error">
          <span>{errorMsg}</span>
          <button className="sms-toast-close" onClick={() => setErrorMsg('')}>
            <X size={14} />
          </button>
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
                Parse &amp; Save
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