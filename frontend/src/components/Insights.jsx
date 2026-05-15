export default function Insights({ insights, prediction, merchants }) {
  if (!insights) return <div style={{ color: 'var(--muted)', padding: '4rem', textAlign: 'center' }}>No data. Click 🎲 Simulate first.</div>

  const { savings_rate, suggested_budget, category_breakdown, alerts, tips } = insights
  const pred = prediction?.next_month

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>// AI Financial Insights</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Savings Rate', value: `${savings_rate}%`, color: savings_rate >= 20 ? 'var(--accent)' : savings_rate >= 10 ? 'var(--warn)' : 'var(--danger)', sub: savings_rate >= 20 ? '✅ Excellent!' : savings_rate >= 10 ? '⚠️ Below 20% target' : '🚨 Critical — save more!' },
          { label: 'Predicted Next Month', value: pred ? `₹${pred.predicted_total?.toLocaleString()}` : '—', color: 'var(--warn)', sub: `Trend: ${pred?.trend || '—'} · ${pred?.confidence || '—'} confidence` },
          { label: 'Unique Merchants', value: merchants?.length || 0, color: 'var(--accent3)', sub: `Top: ${merchants?.[0]?.merchant || '—'}` }
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color, marginBottom: 4 }}>{value}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 12, color }}>{sub}</div>
          </div>
        ))}
      </div>

      {alerts?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--mono)', color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>// ⚠️ Overspending Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ background: a.severity === 'high' ? '#ff444411' : '#ffaa0011', border: `1px solid ${a.severity === 'high' ? '#ff444444' : '#ffaa0044'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.message}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Spent ₹{a.actual} · Budget ₹{a.budget}</div>
                </div>
                <span className="badge" style={{ background: a.severity === 'high' ? '#ff444422' : '#ffaa0022', color: a.severity === 'high' ? 'var(--danger)' : 'var(--warn)' }}>{a.severity?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', marginBottom: 16, fontSize: 13 }}>// 🤖 AI Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips?.map((tip, i) => (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 18px', fontSize: 14, borderLeft: '3px solid var(--accent)' }}>{tip}</div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', marginBottom: 16, fontSize: 13 }}>// Budget Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(suggested_budget || {}).map(([cat, budget]) => {
            const actual = category_breakdown[cat] || 0
            const pct = Math.min((actual / budget) * 100, 100)
            const over = actual > budget
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{cat}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: over ? 'var(--danger)' : 'var(--muted)' }}>₹{Math.round(actual)} / ₹{budget} {over && '⚠️'}</span>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: over ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--accent)', borderRadius: 6, transition: 'width 0.8s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}