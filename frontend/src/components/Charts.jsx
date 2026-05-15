import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import '../styles/Charts.css';

const Charts = () => {
  const [chartType, setChartType] = useState('line');
  const [period, setPeriod] = useState('6m');

  const lineData = [
    { month: 'Jan', income: 4000, expense: 2400, profit: 1600 },
    { month: 'Feb', income: 5200, expense: 2800, profit: 2400 },
    { month: 'Mar', income: 4800, expense: 2200, profit: 2600 },
    { month: 'Apr', income: 6100, expense: 2900, profit: 3200 },
    { month: 'May', income: 5900, expense: 2500, profit: 3400 },
    { month: 'Jun', income: 8500, expense: 3240, profit: 5260 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 1200, percentage: 28 },
    { name: 'Entertainment', value: 800, percentage: 18 },
    { name: 'Transport', value: 640, percentage: 15 },
    { name: 'Utilities', value: 520, percentage: 12 },
    { name: 'Others', value: 1080, percentage: 27 },
  ];

  const COLORS = ['#00D9FF', '#FF006E', '#8338EC', '#FFBE0B', '#FB5607'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-container">
      <div className="charts-header">
        <div>
          <h2 className="charts-title">
            <TrendingUp className="title-icon" />
            Financial Analytics
          </h2>
          <p className="charts-subtitle">Track your income and expenses over time</p>
        </div>
        <div className="charts-controls">
          <div className="control-group">
            <button
              className={`control-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Trend
            </button>
            <button
              className={`control-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Comparison
            </button>
            <button
              className={`control-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
            >
              Distribution
            </button>
          </div>
          <div className="period-selector">
            <Calendar size={18} />
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8338EC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8338EC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#00D9FF"
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#8338EC"
                fillOpacity={1}
                fill="url(#colorProfit)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="income" fill="#00D9FF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#FF006E" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="#8338EC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'pie' && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {chartType === 'pie' && (
        <div className="category-breakdown">
          <h3 className="breakdown-title">Expense Categories</h3>
          <div className="category-list">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="category-item">
                <div className="category-info">
                  <div className="category-color" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="category-name">{cat.name}</span>
                </div>
                <div className="category-stats">
                  <span className="category-value">${cat.value}</span>
                  <span className="category-percent">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;