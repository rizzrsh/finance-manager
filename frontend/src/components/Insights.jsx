export default function Insights({ transactions, insights, prediction, income }) {
  const debits = transactions.filter((t) => t.amount > 0);
  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? ((income - totalSpent) / income * 100).toFixed(1) : 0;

  // Frequent merchants
  const merchantMap = {};
  debits.forEach((t) => {
    const key = t.description?.split(" ")[0] || "Other";
    if (!merchantMap[key]) merchantMap[key] = { count: 0, total: 0 };
    merchantMap[key].count++;
    merchantMap[key].total += t.amount;
  });
  const topMerchants = Object.entries(merchantMap).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">AI Insights</div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: "var(--text3)", background: "rgba(124,107,255,0.12)", padding: "4px 12px", borderRadius: 100 }}>
            ✦ Powered by ML
          </span>
        </div>
      </div>
      <div className="page">

        {/* Score Cards */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ "--accent-color": "#22d3a5" }}>
            <div className="stat-icon" style={{ background: "rgba(34,211,165,0.12)" }}>📊</div>
            <div className="stat-value">{savingsRate}%</div>
            <div className="stat-label">Savings Rate</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#7c6bff" }}>
            <div className="stat-icon" style={{ background: "rgba(124,107,255,0.12)" }}>🔮</div>
            <div className="stat-value">₹{prediction?.predicted_next_month?.toLocaleString("en-IN") || "—"}</div>
            <div className="stat-label">Next Month Prediction</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#ffb347" }}>
            <div className="stat-icon" style={{ background: "rgba(255,179,71,0.12)" }}>🎯</div>
            <div className="stat-value">{debits.length}</div>
            <div className="stat-label">Transactions This Month</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#38bdf8" }}>
            <div className="stat-icon" style={{ background: "rgba(56,189,248,0.12)" }}>💡</div>
            <div className="stat-value">{insights?.suggestions?.length || 0}</div>
            <div className="stat-label">Suggestions Available</div>
          </div>
        </div>

        <div className="grid-2">
          {/* AI Suggestions */}
          <div className="card">
            <div className="card-title">✦ Smart Suggestions</div>
            <div className="insight-list">
              {insights?.suggestions?.length > 0 ? insights.suggestions.map((s, i) => (
                <div className="insight-item" key={i}>
                  <div className="insight-icon">💡</div>
                  <div className="insight-text">{s}</div>
                </div>
              )) : (
                <div className="insight-item">
                  <div className="insight-icon">🌟</div>
                  <div className="insight-text">Add transactions and click <strong>Simulate</strong> to get personalized AI suggestions based on your spending.</div>
                </div>
              )}
            </div>
          </div>

          {/* Top Merchants */}
          <div className="card">
            <div className="card-title">Most Frequent Merchants</div>
            {topMerchants.length > 0 ? (
              <div className="txn-list">
                {topMerchants.map(([name, data]) => (
                  <div className="txn-item" key={name} style={{ cursor: "default" }}>
                    <div className="txn-icon">🏪</div>
                    <div>
                      <div className="txn-name">{name}</div>
                      <div className="txn-cat">{data.count} visits</div>
                    </div>
                    <div className="txn-amount debit">₹{data.total.toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: "20px 0" }}><p>No data yet</p></div>
            )}
          </div>
        </div>

        {/* Anomalies */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">⚠️ Anomaly Detection</div>
          <div className="insight-list">
            {insights?.anomalies?.length > 0 ? insights.anomalies.map((a, i) => (
              <div className="insight-item" key={i} style={{ borderLeft: "3px solid var(--red)" }}>
                <div className="insight-icon">⚠️</div>
                <div className="insight-text">{a}</div>
              </div>
            )) : (
              <div className="insight-item">
                <div className="insight-icon">✅</div>
                <div className="insight-text"><strong>No anomalies detected.</strong> Your spending patterns look normal this month.</div>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps placeholder */}
        <div className="card" style={{ marginTop: 20, borderStyle: "dashed" }}>
          <div className="card-title">📍 Spending Map <span className="card-tag">Phase 2</span></div>
          <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", height: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 32 }}>🗺️</div>
            <div style={{ color: "var(--text2)", fontSize: 14 }}>Google Maps integration coming soon</div>
            <div style={{ color: "var(--text3)", fontSize: 12 }}>Will show hotspots where you spend most via UPI</div>
          </div>
        </div>
      </div>
    </>
  );
}