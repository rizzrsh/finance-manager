export default function Sidebar({ page, setPage, income, setIncome }) {
  const nav = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "transactions", icon: "↕", label: "Transactions" },
    { id: "charts", icon: "◑", label: "Charts" },
    { id: "insights", icon: "✦", label: "AI Insights" },
    { id: "alerts", icon: "◎", label: "Alerts" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">💹</div>
        <span className="logo-text">FinanceAI</span>
      </div>

      <span className="nav-section">Main</span>
      {nav.map((n) => (
        <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
          <span className="nav-icon">{n.icon}</span>
          {n.label}
        </button>
      ))}

      <span className="nav-section">Settings</span>
      <button className="nav-item" onClick={() => alert("UPI Linking — coming in Phase 2!")}>
        <span className="nav-icon">⊕</span>
        Link UPI App
      </button>
      <button className="nav-item" onClick={() => alert("Notifications — coming soon!")}>
        <span className="nav-icon">◈</span>
        Notifications
      </button>

      <div className="sidebar-footer">
        <div className="income-widget">
          <div className="income-label">Monthly Income (₹)</div>
          <input
            className="income-input"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </div>
      </div>
    </aside>
  );
}