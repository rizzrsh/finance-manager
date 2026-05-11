import { useState } from "react";

const CAT_ICONS = { Food: "🍽️", Transport: "🚗", Shopping: "🛍️", Utilities: "⚡", Health: "💊", Entertainment: "🎬", Other: "📦", Income: "💰" };
const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Utilities", "Health", "Entertainment", "Other"];

export default function Transactions({ transactions }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("date");

  let filtered = transactions.filter((t) => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || t.category === cat;
    return matchSearch && matchCat;
  });

  if (sort === "amount") filtered = [...filtered].sort((a, b) => b.amount - a.amount);
  if (sort === "date") filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Transactions</div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{filtered.length} records · ₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div className="page">
        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 130 }}>
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
            </select>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button key={c} className={`btn ${cat === c ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="txn-list">
            {filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">No transactions found</div><p>Try a different search or filter</p></div>
            ) : filtered.map((t) => (
              <div className="txn-item" key={t.id}>
                <div className="txn-icon">{CAT_ICONS[t.category] || "📦"}</div>
                <div style={{ flex: 1 }}>
                  <div className="txn-name">{t.description}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                    <span className={`badge badge-${(t.category || "other").toLowerCase()}`}>{t.category || "Other"}</span>
                    <span className="txn-cat">{t.date}</span>
                  </div>
                </div>
                <div className={`txn-amount ${t.amount > 0 ? "debit" : "credit"}`}>
                  {t.amount > 0 ? "−" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}