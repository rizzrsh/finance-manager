import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#7c6bff", "#22d3a5", "#ffb347", "#38bdf8", "#ff5e6d", "#a78bfa"];

export default function BudgetChart({ transactions, income }) {
  const catMap = {};
  transactions.filter((t) => t.amount > 0).forEach((t) => {
    catMap[t.category || "Other"] = (catMap[t.category || "Other"] || 0) + t.amount;
  });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const totalSpent = catData.reduce((s, c) => s + c.value, 0);
  const remaining = Math.max(0, income - totalSpent);

  const budgetData = [
    { name: "Spent", value: totalSpent },
    { name: "Remaining", value: remaining },
  ];

  // Monthly comparison (demo)
  const monthlyData = [
    { month: "Jan", amount: 32000 },
    { month: "Feb", amount: 28000 },
    { month: "Mar", amount: 35000 },
    { month: "Apr", amount: 29000 },
    { month: "May", amount: totalSpent || 22000 },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Charts & Analytics</div>
      </div>
      <div className="page">
        <div className="grid-2">
          {/* Category Bar Chart */}
          <div className="card">
            <div className="card-title">Spending by Category</div>
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#5a5a6e", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#f0eff5" }} formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Pie */}
          <div className="card">
            <div className="card-title">Budget Overview</div>
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                    <Cell fill="#ff5e6d" />
                    <Cell fill="#22d3a5" />
                  </Pie>
                  <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#f0eff5" }} formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                  <Legend wrapperStyle={{ color: "#9898aa", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span style={{ color: "var(--text2)", fontSize: 13 }}>
                ₹{totalSpent.toLocaleString("en-IN")} spent of ₹{income.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="card-title">Monthly Spending History</div>
          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6bff" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c6bff" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#5a5a6e", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a5a6e", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#f0eff5" }} formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]} />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}