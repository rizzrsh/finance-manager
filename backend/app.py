@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

:root {
  --bg: #0a0a0f;
  --bg2: #111118;
  --bg3: #18181f;
  --bg4: #1f1f28;
  --border: rgba(255,255,255,0.07);
  --border-bright: rgba(255,255,255,0.13);
  --text: #f0eff5;
  --text2: #9898aa;
  --text3: #5a5a6e;
  --accent: #7c6bff;
  --accent2: #a78bfa;
  --green: #22d3a5;
  --green2: #0d9e7a;
  --red: #ff5e6d;
  --amber: #ffb347;
  --blue: #38bdf8;
  --radius: 16px;
  --radius-sm: 10px;
  --font-head: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 4px; }

/* Layout */
.layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.main { overflow-y: auto; }

/* Sidebar */
.sidebar {
  background: var(--bg2);
  border-right: 1px solid var(--border);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 36px;
  padding: 0 4px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--green));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.logo-text {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-section {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0 12px;
  margin-top: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  transition: all 0.15s;
}

.nav-item:hover { background: var(--bg3); color: var(--text); }
.nav-item.active { background: rgba(124, 107, 255, 0.15); color: var(--accent2); }
.nav-item.active .nav-icon { color: var(--accent); }

.nav-icon { font-size: 18px; width: 20px; flex-shrink: 0; }

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.income-widget {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.income-label { font-size: 12px; color: var(--text3); margin-bottom: 6px; }
.income-input {
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
  width: 100%;
  outline: none;
}

/* Top Bar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
}

.topbar-title {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.topbar-right { display: flex; align-items: center; gap: 12px; }

.btn {
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 7px;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}
.btn-primary:hover { background: #6b5ce7; transform: translateY(-1px); }

.btn-ghost {
  background: var(--bg3);
  color: var(--text2);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--bg4); color: var(--text); }

/* Page Content */
.page { padding: 32px; }

/* Stat Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent-color, var(--accent));
  border-radius: 2px 2px 0 0;
}

.stat-card:hover { border-color: var(--border-bright); transform: translateY(-2px); }

.stat-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  margin-bottom: 16px;
  background: rgba(124, 107, 255, 0.12);
}

.stat-value {
  font-family: var(--font-head);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label { font-size: 13px; color: var(--text2); }
.stat-change {
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-change.up { color: var(--green); }
.stat-change.down { color: var(--red); }

/* Grid Layouts */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }

/* Cards */
.card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.card-title {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 100px;
  background: rgba(124, 107, 255, 0.15);
  color: var(--accent2);
}

/* Transaction Input */
.add-transaction {
  display: grid;
  grid-template-columns: 1fr 140px 160px auto;
  gap: 10px;
  margin-bottom: 28px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.input {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--text3); }

/* Transaction List */
.txn-list { display: flex; flex-direction: column; gap: 2px; }

.txn-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
  cursor: pointer;
}
.txn-item:hover { background: var(--bg3); }

.txn-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: var(--bg4);
}

.txn-name { font-size: 14px; font-weight: 500; }
.txn-cat { font-size: 12px; color: var(--text2); }
.txn-date { font-size: 12px; color: var(--text3); margin-left: auto; }
.txn-amount { font-size: 15px; font-weight: 600; white-space: nowrap; }
.txn-amount.debit { color: var(--red); }
.txn-amount.credit { color: var(--green); }

/* Category Badge */
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 500;
}
.badge-food { background: rgba(255,179,71,0.15); color: var(--amber); }
.badge-shopping { background: rgba(124,107,255,0.15); color: var(--accent2); }
.badge-transport { background: rgba(56,189,248,0.15); color: var(--blue); }
.badge-utilities { background: rgba(34,211,165,0.15); color: var(--green); }
.badge-health { background: rgba(255,94,109,0.15); color: var(--red); }
.badge-other { background: rgba(152,152,170,0.15); color: var(--text2); }

/* Charts */
.chart-wrap { position: relative; height: 220px; }

/* Insight Cards */
.insight-list { display: flex; flex-direction: column; gap: 12px; }

.insight-item {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.insight-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.insight-text { font-size: 13px; line-height: 1.5; color: var(--text2); }
.insight-text strong { color: var(--text); }

/* Alert Banner */
.alert-bar {
  background: rgba(255, 94, 109, 0.08);
  border: 1px solid rgba(255, 94, 109, 0.2);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 20px;
}

/* Category breakdown bar */
.category-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.category-name { font-size: 13px; width: 90px; flex-shrink: 0; }
.category-bar-wrap { flex: 1; height: 6px; background: var(--bg4); border-radius: 3px; overflow: hidden; }
.category-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.category-pct { font-size: 13px; color: var(--text2); width: 40px; text-align: right; }

/* Empty state */
.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text3);
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-title { font-family: var(--font-head); font-size: 18px; color: var(--text2); margin-bottom: 8px; }

/* Responsive */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .add-transaction { grid-template-columns: 1fr 1fr; }
  .page { padding: 20px 16px; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .add-transaction { grid-template-columns: 1fr; }
}