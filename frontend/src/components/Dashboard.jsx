const Card = ({ label, value, color = 'var(--accent)', sub }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', flex: 1, minWidth: 160 }}>
    <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-mono)', marginTop: 8 }}>{value}</div>
    {sub && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>{sub}</div>}
  </div>
)

export default function Dashboard({ insights, prediction, transactions }) {
  if (!insights) return <div style={{ color: 'var(--muted)', padding: '2rem', fontFamily: 'var(--font-mono)' }}>No data. Click 🎲 Simulate to generate sample data.</div>
  const { total_spent, savings, savings_rate, monthly_income } = insights
  const pred = prediction?.next_month
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 36, fontWeight: 700, margin: 0 }}>Finance AI</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--font-main)' }}>by rizzrsh</p>
      </div>
      <h2 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: 'var(--accent)' }}>// Overview</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Card label="Monthly Income" value={`₹${monthly_income?.toLocaleString()}`} color="var(--accent)" />
        <Card label="Total Spent" value={`₹${total_spent?.toLocaleString()}`} color="var(--accent2)" />
        <Card label="Savings" value={`₹${savings?.toLocaleString()}`} color={savings >= 0 ? 'var(--accent)' : 'var(--danger)'} sub={`${savings_rate}% savings rate`} />
        <Card label="Predicted Next Month" value={pred ? `₹${pred.predicted_total?.toLocaleString()}` : 'N/A'} color="var(--warn)" sub={pred ? `Trend: ${pred.trend}` : ''} />
        <Card label="Transactions" value={transactions.length} color="var(--muted)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1rem', color: 'var(--muted)' }}>// Recent Transactions</h3>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {transactions.slice(0, 8).map((tx, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.description}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>{tx.date} · {tx.category}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--danger)' }}>-₹{tx.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}