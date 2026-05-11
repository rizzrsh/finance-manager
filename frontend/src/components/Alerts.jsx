export default function Alerts({ transactions, insights, income }) {
  const debits = transactions.filter((t) => t.amount > 0);
  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const overBudget = totalSpent > income;

  const alerts = [
    ...(insights?.anomalies || []).map((a) => ({ type: "warning", icon: "⚠️", title: "Spending Anomaly", msg: a })),
    overBudget ? { type: "danger", icon: "🔴", title: "Over Budget!", msg: `You've spent ₹${(totalSpent - income).toLocaleString("en-IN")} more than your income this month.` } : null,
    totalSpent > income * 0.8 ? { type: "warning", icon: "🟡", title: "80% Budget Used", msg: "You've used over 80% of your monthly income. Be mindful of spending." } : null,
  ].filter(Boolean);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Alerts</div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: alerts.length > 0 ? "var(--red)" : "var(--green)" }}>
            {alerts.length > 0 ? `${alerts.length} active alerts` : "All clear ✓"}
          </span>
        </div>
      </div>
      <div className="page">
        {alerts.length === 0 ? (
          <div className="card">
            <div className="empty" style={{ padding: "60px 0" }}>
              <div className="empty-icon">✅</div>
              <div className="empty-title">No alerts right now</div>
              <p style={{ color: "var(--text3)" }}>Your finances look healthy. We'll notify you of any issues.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {alerts.map((a, i) => (
              <div key={i} className="card" style={{ borderLeft: `3px solid ${a.type === "danger" ? "var(--red)" : "var(--amber)"}` }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, marginBottom: 6 }}>{a.title}</div>
                    <div style={{ color: "var(--text2)", fontSize: 14 }}>{a.msg}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">🔔 Notification Settings <span className="card-tag">Phase 2</span></div>
          <div className="insight-list">
            {["Get notified when you visit a frequent UPI merchant", "Weekly spending summary on WhatsApp / Email", "Instant alert when a large transaction is detected", "Location-based nudge when near a high-spend zone"].map((s, i) => (
              <div className="insight-item" key={i}>
                <div className="insight-icon">🔔</div>
                <div className="insight-text">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}