import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#7c6bff", "#22d3a5", "#ffb347", "#38bdf8", "#ff5e6d", "#a78bfa"];
const CAT_ICONS = { Food: "🍽️", Transport: "🚗", Shopping: "🛍️", Utilities: "⚡", Health: "💊", Entertainment: "🎬", Other: "📦", Income: "💰" };

export default function Dashboard({ transactions, insights, income, onAdd, onSimulate, loading, setPage }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const debits = transactions.filter((t) => t.amount > 0);
  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const balance = income - totalSpent;
  const savingsRate = income > 0 ? Math.max(0, ((balance / income) * 100)).toFixed(0) : 0;

  const catData = insights?.category_breakdown
    ? Object.entries(insights.category_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  // Build spending trend from transactions
  const trendData = buildTrend(transactions);

  const handleAdd = () => {
    if (!desc || !amount) return;
    onAdd({ description: desc, amount: Number(amount), date });
    setDesc(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: "var(--text2)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <button className="btn btn-primary" onClick={onSimulate} disabled={loading}>
            {loading ? "⟳ Loading…" : "⚡ Simulate"}
          </button>
        </div>
      </div>

      <div className="page">
        {/* Alerts */}
        {insights?.anomalies?.length > 0 && (
          <div className="alert-bar">
            <span>⚠️</span>
            <span>{insights.anomalies[0]}</span>
            <button className="btn btn-ghost" style={{ marginLeft: "auto", padding: "5px 12px", fontSize: 12 }} onClick={() => setPage("alerts")}>
              View all
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="stats-grid">
          <StatCard icon="💸" label="Total Spent" value={`₹${totalSpent.toLocaleString("en-IN")}`} change={`${debits.length} transactions`} color="var(--red)" />
          <StatCard icon="💰" label="Balance" value={`₹${Math.abs(balance).toLocaleString("en-IN")}`} change={balance >= 0 ? "On track" : "Over budget"} up={balance >= 0} color="var(--green)" />
          <StatCard icon="📈" label="Savings Rate" value={`${savingsRate}%`} change={savingsRate > 20 ? "Great job!" : "Try to save more"} up={savingsRate > 20} color="var(--accent)" />
          <StatCard icon="🏆" label="Top Category" value={insights?.top_category || "—"} change="Highest spending" color="var(--amber)" />
        </div>

        {/* Add Transaction */}
        <div className="add-transaction">
          <input className="input" placeholder="Description (e.g. Swiggy Order)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input className="input" placeholder="Amount ₹" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-primary" onClick={handleAdd}>+ Add</button>
        </div>

        {/* Charts + Recent */}
        <div className="grid-3">
          {/* Spending Trend */}
          <div className="card">
            <div className="card-title">Spending Trend <span className="card-tag">This Month</span></div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c6bff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c6bff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#5a5a6e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#5a5a6e", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#f0eff5" }} formatter={(v) => [`₹${v}`, "Spent"]} />
                  <Area type="monotone" dataKey="amount" stroke="#7c6bff" strokeWidth={2} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <div className="card-title">By Category</div>
            {catData.length > 0 ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#f0eff5" }} formatter={(v) => [`₹${v}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty"><div className="empty-icon">◎</div><div className="empty-title">No data yet</div><p>Click Simulate to load data</p></div>
            )}
          </div>
        </div>

        {/* Category Bars + Recent Transactions */}
        <div className="grid-2">
          <div className="card">
            <div className="card-title">Category Breakdown</div>
            {catData.length > 0 ? catData.sort((a, b) => b.value - a.value).map((c, i) => {
              const max = catData[0]?.value || 1;
              return (
                <div className="category-row" key={c.name}>
                  <span className="category-name" style={{ fontSize: 13 }}>{CAT_ICONS[c.name] || "📦"} {c.name}</span>
                  <div className="category-bar-wrap">
                    <div className="category-bar" style={{ width: `${(c.value / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="category-pct">₹{c.value.toLocaleString("en-IN")}</span>
                </div>
              );
            }) : <div className="empty" style={{ padding: "20px 0" }}><p>No category data</p></div>}
          </div>

          <div className="card">
            <div className="card-title">Recent Transactions <span className="card-tag">{debits.length} total</span></div>
            <div className="txn-list">
              {transactions.slice(0, 8).map((t) => (
                <div className="txn-item" key={t.id}>
                  <div className="txn-icon">{CAT_ICONS[t.category] || "📦"}</div>
                  <div>
                    <div className="txn-name">{t.description}</div>
                    <span className={`badge badge-${(t.category || "other").toLowerCase()}`}>{t.category || "Other"}</span>
                  </div>
                  <div className="txn-date">{t.date}</div>
                  <div className={`txn-amount ${t.amount > 0 ? "debit" : "credit"}`}>
                    {t.amount > 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">No transactions yet</div><p>Add one above or click Simulate</p></div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights?.suggestions?.length > 0 && (
          <div className="card">
            <div className="card-title">✦ AI Insights</div>
            <div className="insight-list">
              {insights.suggestions.map((s, i) => (
                <div className="insight-item" key={i}>
                  <div className="insight-icon">💡</div>
                  <div className="insight-text">{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value, change, up, color }) {
  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div className="stat-icon" style={{ background: `${color}18` }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${up === true ? "up" : up === false ? "down" : ""}`}>{up === true ? "↑" : up === false ? "↓" : ""} {change}</div>}
    </div>
  );
}

function buildTrend(transactions) {
  const map = {};
  transactions.filter((t) => t.amount > 0).forEach((t) => {
    const d = t.date?.slice(8, 10) || "?";
    map[d] = (map[d] || 0) + t.amount;
  });
  return Object.entries(map).sort((a, b) => a[0] - b[0]).map(([day, amount]) => ({ day, amount }));
}