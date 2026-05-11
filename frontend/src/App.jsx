import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import BudgetChart from "./components/BudgetChart";
import Alerts from "./components/Alerts";
import Sidebar from "./components/Sidebar";

const API = "http://localhost:5000";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [income, setIncome] = useState(50000);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [txRes, insRes, predRes] = await Promise.all([
        fetch(`${API}/transactions`),
        fetch(`${API}/insights`),
        fetch(`${API}/predict`),
      ]);
      if (txRes.ok) setTransactions(await txRes.json());
      if (insRes.ok) setInsights(await insRes.json());
      if (predRes.ok) setPrediction(await predRes.json());
    } catch (e) {
      console.log("Backend not reachable, using demo data");
      setTransactions(demoTransactions);
      setInsights(demoInsights);
    }
  };

  const simulate = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/simulate`, { method: "POST" });
      await fetchData();
    } catch {
      setTransactions(demoTransactions);
      setInsights(demoInsights);
    }
    setLoading(false);
  };

  const addTransaction = async (txn) => {
    try {
      const res = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txn),
      });
      if (res.ok) await fetchData();
    } catch {
      setTransactions((prev) => [{ ...txn, id: Date.now(), category: categorize(txn.description) }, ...prev]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pages = { dashboard: Dashboard, transactions: Transactions, insights: Insights, charts: BudgetChart, alerts: Alerts };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} income={income} setIncome={setIncome} />
      <div className="main">
        <PageComponent
          transactions={transactions}
          insights={insights}
          prediction={prediction}
          income={income}
          onAdd={addTransaction}
          onSimulate={simulate}
          loading={loading}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

function categorize(desc) {
  const d = desc.toLowerCase();
  if (/swiggy|zomato|food|restaurant|cafe|hotel/.test(d)) return "Food";
  if (/uber|ola|metro|bus|petrol|fuel/.test(d)) return "Transport";
  if (/amazon|flipkart|myntra|shopping|store/.test(d)) return "Shopping";
  if (/electricity|water|internet|broadband|recharge/.test(d)) return "Utilities";
  if (/hospital|doctor|pharmacy|med|health/.test(d)) return "Health";
  return "Other";
}

const demoTransactions = [
  { id: 1, description: "Swiggy Order", amount: 380, date: "2025-05-10", category: "Food" },
  { id: 2, description: "Uber Ride", amount: 145, date: "2025-05-10", category: "Transport" },
  { id: 3, description: "Amazon Shopping", amount: 1299, date: "2025-05-09", category: "Shopping" },
  { id: 4, description: "Zomato Lunch", amount: 250, date: "2025-05-09", category: "Food" },
  { id: 5, description: "Electricity Bill", amount: 1850, date: "2025-05-08", category: "Utilities" },
  { id: 6, description: "Salary Credit", amount: -50000, date: "2025-05-01", category: "Income" },
  { id: 7, description: "Netflix Subscription", amount: 649, date: "2025-05-07", category: "Entertainment" },
  { id: 8, description: "Apollo Pharmacy", amount: 430, date: "2025-05-06", category: "Health" },
  { id: 9, description: "Petrol Fill", amount: 2000, date: "2025-05-05", category: "Transport" },
  { id: 10, description: "Flipkart Order", amount: 899, date: "2025-05-04", category: "Shopping" },
];

const demoInsights = {
  total_spent: 9902,
  top_category: "Shopping",
  category_breakdown: { Food: 630, Transport: 2145, Shopping: 2198, Utilities: 1850, Entertainment: 649, Health: 430 },
  anomalies: ["Electricity bill ₹1850 is 22% higher than last month"],
  suggestions: ["You spend ₹630 on Food delivery. Cooking at home 3 days/week saves ~₹200/month.", "Transport costs are high. Consider monthly metro pass to save ₹400/month."],
};