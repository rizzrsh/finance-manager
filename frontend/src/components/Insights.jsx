export default function Insights({ insights, prediction }) {
  if (!insights) return null
  const { savings_rate, suggested_budget, category_breakdown } = insights
  const pred = prediction?.next_month
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: 'var(--accent)' }}>// AI Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>Spending Prediction</h3>
          {pred && <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--warn)' }}>₹{pred.predicted_total?.toLocaleString()}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Trend: {pred.trend} · Confidence: {pred.confidence}</div>
          </>}
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>Savings Health</h3>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: savings_rate >= 20 ? 'var(--accent)' : savings_rate >= 10 ? 'var(--warn)' : 'var(--danger)' }}>{savings_rate}%</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{savings_rate >= 20 ? '✅ Excellent!' : savings_rate >= 10 ? '⚠️ Below 20% target' : '🚨 Critical'}</div>
        </div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1rem', color: 'var(--muted)' }}>// Suggested Budget</h3>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {Object.entries(suggested_budget).map(([cat, budget], i, arr) => {
          const actual = category_breakdown[cat] || 0
          const pct = Math.min((actual / budget) * 100, 100)
          const over = actual > budget
          return (
            <div key={cat} style={{ padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: over ? 'var(--danger)' : 'var(--muted)' }}>₹{actual} / ₹{budget}</span>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: over ? 'var(--danger)' : 'var(--accent)', borderRadius: 4 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}