export default function Alerts({ insights }) {
  if (!insights) return null
  const { alerts, tips } = insights
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: 'var(--accent)' }}>// Alerts & Tips</h2>
      {alerts.length === 0 && <div style={{ color: 'var(--accent)', padding: '1rem', background: '#00d4aa11', borderRadius: 12, border: '1px solid var(--accent)' }}>✅ No overspending alerts!</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ background: a.severity === 'high' ? '#ff4f6d11' : '#ffb83011', border: `1px solid ${a.severity === 'high' ? 'var(--danger)' : 'var(--warn)'}`, borderRadius: 12, padding: '1rem 1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.message}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Actual: ₹{a.actual} · Budget: ₹{a.budget}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1rem', color: 'var(--muted)' }}>// AI Tips</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.5rem', fontSize: 15 }}>{tip}</div>
        ))}
      </div>
    </div>
  )
}