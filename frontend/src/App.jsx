import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import TransactionList from './components/TransactionList'
import BudgetChart from './components/BudgetChart'
import Alerts from './components/Alerts'
import Insights from './components/Insights'
import axios from 'axios'

const BASE = 'http://localhost:5000/api'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const [insights, setInsights] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [income, setIncome] = useState(50000)
  const [form, setForm] = useState({ description: '', amount: '', date: '' })
  const [simulating, setSimulating] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [txRes, insRes, predRes] = await Promise.all([
        axios.get(`${BASE}/transactions`),
        axios.get(`${BASE}/insights?income=${income}`),
        axios.get(`${BASE}/predict`)
      ])
      setTransactions(txRes.data)
      setInsights(insRes.data)
      setPrediction(predRes.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [income])

  const handleAdd = async () => {
    if (!form.description || !form.amount) return alert('Fill description and amount')
    await axios.post(`${BASE}/transactions`, { ...form, amount: parseFloat(form.amount) })
    setForm({ description: '', amount: '', date: '' })
    fetchAll()
  }

  const handleSimulate = async () => {
    setSimulating(true)
    await axios.get(`${BASE}/simulate?months=3&count=20`)
    await fetchAll()
    setSimulating(false)
  }

  const tabs = ['dashboard', 'transactions', 'charts', 'insights', 'alerts']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>💹</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 18, letterSpacing: 1 }}>FinanceAI</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: 13, fontWeight: 600,
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#000' : 'var(--muted)', textTransform: 'capitalize', transition: 'all 0.2s'
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Income ₹</span>
            <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))}
              style={{ width: 90, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: 13 }} />
            <button onClick={handleSimulate} disabled={simulating} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent2)', color: '#fff', fontWeight: 600, fontSize: 13
            }}>{simulating ? '...' : '🎲 Simulate'}</button>
          </div>
        </div>
      </header>

      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '12px 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder="Description (e.g. Swiggy Order)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ flex: 2, minWidth: 180, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-main)', fontSize: 14 }} />
          <input type="number" placeholder="Amount ₹" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ flex: 1, minWidth: 100, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 14 }} />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={{ flex: 1, minWidth: 130, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-main)', fontSize: 14 }} />
          <button onClick={handleAdd} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 14 }}>+ Add</button>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Loading data...</div>
        ) : (
          <>
            {tab === 'dashboard' && <Dashboard insights={insights} prediction={prediction} transactions={transactions} />}
            {tab === 'transactions' && <TransactionList transactions={transactions} />}
            {tab === 'charts' && <BudgetChart insights={insights} />}
            {tab === 'insights' && <Insights insights={insights} prediction={prediction} />}
            {tab === 'alerts' && <Alerts insights={insights} />}
          </>
        )}
      </main>
    </div>
  )
}