import { useState, useEffect } from 'react';
import { getTransactions } from '../lib/database';

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo insights data (fallback)
  const demoInsights = {
    savings_rate: 32,
    suggested_budget: {
      Groceries: 800,
      Entertainment: 400,
      Transport: 300,
      Utilities: 200,
      Others: 500,
    },
    category_breakdown: {
      Groceries: 750,
      Entertainment: 350,
      Transport: 280,
      Utilities: 180,
      Others: 450,
    },
    alerts: [
      {
        message: 'Entertainment spending is high',
        actual: 350,
        budget: 400,
        severity: 'low',
      },
      {
        message: 'Transport exceeded budget',
        actual: 280,
        budget: 300,
        severity: 'medium',
      },
    ],
    tips: [
      '💡 Your savings rate is excellent! Keep up the good financial discipline.',
      '💡 Consider setting aside your entertainment budget in a separate account.',
      '💡 You could save an extra $200/month by reducing dining out expenses.',
      '💡 Great job keeping utilities under control. Energy efficiency is paying off!',
    ],
  };

  const demoPrediction = {
    next_month: {
      predicted_total: 3500,
      trend: 'stable',
      confidence: '85%',
    },
  };

  // Fetch and process transactions
  useEffect(() => {
    const fetchAndProcessInsights = async () => {
      try {
        setLoading(true);

        const transactions = await getTransactions();

        if (transactions && transactions.length > 0) {
          // Calculate insights from real transactions
          const calculatedInsights = calculateInsights(transactions);
          const calculatedMerchants = extractMerchants(transactions);

          setInsights(calculatedInsights.insights);
          setPrediction(calculatedInsights.prediction);
          setMerchants(calculatedMerchants);
        } else {
          // Use demo data if no transactions
          setInsights(demoInsights);
          setPrediction(demoPrediction);
          setMerchants([
            { merchant: 'Grocery Store', count: 5 },
            { merchant: 'Coffee Shop', count: 3 },
            { merchant: 'Gas Station', count: 2 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Use demo data on error
        setInsights(demoInsights);
        setPrediction(demoPrediction);
        setMerchants([
          { merchant: 'Grocery Store', count: 5 },
          { merchant: 'Coffee Shop', count: 3 },
          { merchant: 'Gas Station', count: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessInsights();
  }, []);

  // Calculate insights from transactions
  const calculateInsights = (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};
    const suggestedBudget = {
      Groceries: 800,
      Entertainment: 400,
      Transport: 300,
      Utilities: 200,
      Others: 500,
    };

    // Process transactions
    transactions.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const category = tx.category || 'Others';

      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Math.abs(amount);
      }
    });

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // Generate alerts
    const alerts = [];
    Object.entries(categoryBreakdown).forEach(([category, spent]) => {
      const budget = suggestedBudget[category] || 500;
      if (spent > budget) {
        const overage = spent - budget;
        const severity = overage > budget * 0.3 ? 'high' : 'medium';
        alerts.push({
          message: `${category} spending is high`,
          actual: Math.round(spent),
          budget: Math.round(budget),
          severity,
        });
      }
    });

    // Generate tips
    const tips = generateTips(savingsRate, totalExpense, categoryBreakdown);

    // Predict next month
    const prediction = {
      next_month: {
        predicted_total: Math.round(totalExpense * 1.05), // 5% increase prediction
        trend: totalExpense > 0 ? 'stable' : 'unknown',
        confidence: '80%',
      },
    };

    return {
      insights: {
        savings_rate: savingsRate,
        suggested_budget: suggestedBudget,
        category_breakdown: categoryBreakdown,
        alerts,
        tips,
      },
      prediction,
    };
  };

  // Extract merchants from transactions
  const extractMerchants = (transactions) => {
    const merchantMap = {};

    transactions.forEach((tx) => {
      const merchant = tx.merchant || 'Unknown';
      merchantMap[merchant] = (merchantMap[merchant] || 0) + 1;
    });

    return Object.entries(merchantMap)
      .map(([merchant, count]) => ({ merchant, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 merchants
  };

  // Generate AI tips based on spending patterns
  const generateTips = (savingsRate, totalExpense, categoryBreakdown) => {
    const tips = [];

    if (savingsRate >= 30) {
      tips.push('💡 Your savings rate is excellent! Keep up the good financial discipline.');
    } else if (savingsRate >= 15) {
      tips.push('💡 Your savings rate is decent. Try to increase it by reducing discretionary spending.');
    } else {
      tips.push('🚨 Your savings rate is low. Focus on cutting non-essential expenses.');
    }

    // Entertainment tip
    if (categoryBreakdown['Entertainment'] > 500) {
      tips.push('💡 Consider setting aside your entertainment budget in a separate account.');
    }

    // Dining tip
    if (categoryBreakdown['Others'] > categoryBreakdown['Groceries']) {
      tips.push('💡 You could save money by cooking at home more often.');
    }

    // Transport tip
    if (categoryBreakdown['Transport'] > 300) {
      tips.push('💡 Consider carpooling or using public transport to reduce commute costs.');
    }

    // Utilities tip
    if (categoryBreakdown['Utilities'] < 250) {
      tips.push('💡 Great job keeping utilities under control. Energy efficiency is paying off!');
    }

    // General tip
    if (tips.length < 4) {
      tips.push('💡 Track your spending regularly to identify areas for improvement.');
    }

    return tips.slice(0, 4); // Return top 4 tips
  };

  if (loading) {
    return (
      <div style={{ color: 'var(--muted)', padding: '4rem', textAlign: 'center' }}>
        Loading insights...
      </div>
    );
  }

  if (!insights)
    return (
      <div style={{ color: 'var(--muted)', padding: '4rem', textAlign: 'center' }}>
        No data. Click 🎲 Simulate first.
      </div>
    );

  const { savings_rate, suggested_budget, category_breakdown, alerts, tips } = insights;
  const pred = prediction?.next_month;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
        // AI Financial Insights
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          {
            label: 'Savings Rate',
            value: `${savings_rate}%`,
            color:
              savings_rate >= 20
                ? 'var(--accent)'
                : savings_rate >= 10
                  ? 'var(--warn)'
                  : 'var(--danger)',
            sub:
              savings_rate >= 20
                ? '✅ Excellent!'
                : savings_rate >= 10
                  ? '⚠️ Below 20% target'
                  : '🚨 Critical — save more!',
          },
          {
            label: 'Predicted Next Month',
            value: pred ? `$${pred.predicted_total?.toLocaleString()}` : '—',
            color: 'var(--warn)',
            sub: `Trend: ${pred?.trend || '—'} · ${pred?.confidence || '—'} confidence`,
          },
          {
            label: 'Unique Merchants',
            value: merchants?.length || 0,
            color: 'var(--accent3)',
            sub: `Top: ${merchants?.[0]?.merchant || '—'}`,
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: 'var(--mono)',
                color,
                marginBottom: 4,
              }}
            >
              {value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color }}>{sub}</div>
          </div>
        ))}
      </div>

      {alerts?.length > 0 && (
        <div className="card">
          <h3
            style={{
              fontFamily: 'var(--mono)',
              color: 'var(--danger)',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            // ⚠️ Overspending Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a, i) => (
              <div
                key={i}
                style={{
                  background:
                    a.severity === 'high' ? '#ff444411' : '#ffaa0011',
                  border: `1px solid ${
                    a.severity === 'high' ? '#ff444444' : '#ffaa0044'
                  }`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {a.message}
                  </div>
                  <div
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Spent ${a.actual} · Budget ${a.budget}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background:
                      a.severity === 'high' ? '#ff444422' : '#ffaa0022',
                    color:
                      a.severity === 'high'
                        ? 'var(--danger)'
                        : 'var(--warn)',
                  }}
                >
                  {a.severity?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3
          style={{
            fontFamily: 'var(--mono)',
            color: 'var(--accent)',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          // 🤖 AI Recommendations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips?.map((tip, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface2)',
                borderRadius: 12,
                padding: '14px 18px',
                fontSize: 14,
                borderLeft: '3px solid var(--accent)',
              }}
            >
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3
          style={{
            fontFamily: 'var(--mono)',
            color: 'var(--accent)',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          // Budget Progress
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(suggested_budget || {}).map(([cat, budget]) => {
            const actual = category_breakdown[cat] || 0;
            const pct = Math.min((actual / budget) * 100, 100);
            const over = actual > budget;
            return (
              <div key={cat}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {cat}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      color: over ? 'var(--danger)' : 'var(--muted)',
                    }}
                  >
                    ${Math.round(actual)} / ${budget} {over && '⚠️'}
                  </span>
                </div>
                <div
                  style={{
                    background: 'var(--surface2)',
                    borderRadius: 6,
                    height: 8,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background:
                        over
                          ? 'var(--danger)'
                          : pct > 80
                            ? 'var(--warn)'
                            : 'var(--accent)',
                      borderRadius: 6,
                      transition: 'width 0.8s',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}