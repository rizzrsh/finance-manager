import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
const COLORS = ['#00d4aa','#4f8fff','#ffb830','#ff4f6d','#ab47bc','#ff7043','#26c6da','#66bb6a']
export default function BudgetChart({ insights }) {
  if (!insights) return null
  const { category_breakdown, suggested_budget } = insights
  const pieData = Object.entries(category_breakdown).map(([name, value]) => ({ name, value }))
  const barData = Object.keys(suggested_budget).map(cat => ({ cat, actual: category_breakdown[cat] || 0, budget: suggested_budget[cat] }))
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: 'var(--accent)' }}>// Spending Charts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>Actual vs Budget</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="cat" tick={{ fill: 'var(--muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="actual" fill="#ff4f6d" name="Actual" radius={[4,4,0,0]} />
              <Bar dataKey="budget" fill="#00d4aa" name="Budget" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}