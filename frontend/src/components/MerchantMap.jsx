import React, { useState } from 'react';
import { MapPin, Zap, TrendingUp, Filter, MapPinOff } from 'lucide-react';
import '../styles/MerchantMap.css';

const MerchantMap = () => {
  const [merchants, setMerchants] = useState([
    { id: 1, name: 'BigMart Supermarket', location: 'Downtown', spent: 1250, visits: 8, category: 'Groceries', icon: '🛒', lat: 51.5074, lng: -0.1278 },
    { id: 2, name: 'Starbucks Coffee', location: 'Main Street', spent: 385, visits: 24, category: 'Cafe', icon: '☕', lat: 51.5078, lng: -0.1251 },
    { id: 3, name: 'FitLife Gym', location: 'Central Park', spent: 450, visits: 12, category: 'Fitness', icon: '💪', lat: 51.5081, lng: -0.1261 },
    { id: 4, name: 'Italian Restaurant', location: 'Arts District', spent: 520, visits: 6, category: 'Dining', icon: '🍝', lat: 51.5090, lng: -0.1271 },
    { id: 5, name: 'Cinema Plus', location: 'Entertainment Hub', spent: 280, visits: 4, category: 'Entertainment', icon: '🎬', lat: 51.5095, lng: -0.1290 },
    { id: 6, name: 'Tech Store Pro', location: 'Innovation Park', spent: 1840, visits: 3, category: 'Electronics', icon: '💻', lat: 51.5100, lng: -0.1300 },
  ]);

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('spent');

  const categories = ['all', ...new Set(merchants.map(m => m.category))];

  const filtered = merchants
    .filter(m => filterCategory === 'all' || m.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'spent') return b.spent - a.spent;
      if (sortBy === 'visits') return b.visits - a.visits;
      return 0;
    });

  const totalSpent = filtered.reduce((acc, m) => acc + m.spent, 0);
  const totalVisits = filtered.reduce((acc, m) => acc + m.visits, 0);

  return (
    <div className="merchant-map-container">
      <div className="merchant-header">
        <div className="header-content">
          <MapPin size={32} className="header-icon" />
          <div>
            <h2 className="merchant-title">Merchant Map</h2>
            <p className="merchant-subtitle">Track your spending locations</p>
          </div>
        </div>
      </div>

      <div className="merchant-controls">
        <div className="control-group">
          <label className="control-label">Category Filter</label>
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="spent">Total Spent</option>
            <option value="visits">Visit Count</option>
          </select>
        </div>
      </div>

      <div className="merchant-stats">
        <div className="stat-card">
          <Zap size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Locations</span>
            <span className="stat-value">{filtered.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">₹{totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <MapPin size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Visits</span>
            <span className="stat-value">{totalVisits}</span>
          </div>
        </div>
      </div>

      <div className="merchant-content">
        {/* Map Visualization */}
        <div className="merchant-map-visual">
          <svg viewBox="0 0 1000 600" className="map-svg">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1a1a2e" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="1000" height="600" fill="url(#grid)" />

            {/* Merchant points */}
            {filtered.map((merchant, idx) => {
              const x = merchant.lat * 5000;
              const y = merchant.lng * 5000;
              const isSelected = selectedMerchant?.id === merchant.id;
              const radius = 30 + (merchant.spent / 100);

              return (
                <g key={merchant.id}>
                  {/* Glow effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 15}
                    fill={isSelected ? '#00D9FF' : '#8338EC'}
                    opacity="0.15"
                  />
                  {/* Point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={isSelected ? '#00D9FF' : '#8338EC'}
                    className="merchant-point"
                    onClick={() => setSelectedMerchant(isSelected ? null : merchant)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Label */}
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="point-label"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    {merchant.icon}
                  </text>
                </g>
              );
            })}
          </svg>

          {selectedMerchant && (
            <div className="merchant-tooltip">
              <h4>{selectedMerchant.name}</h4>
              <p>{selectedMerchant.location}</p>
              <div className="tooltip-stats">
                <span>₹{selectedMerchant.spent}</span>
                <span>•</span>
                <span>{selectedMerchant.visits} visits</span>
              </div>
            </div>
          )}
        </div>

        {/* Merchants List */}
        <div className="merchants-list">
          <h3 className="list-title">Merchants ({filtered.length})</h3>

          {filtered.length > 0 ? (
            <div className="merchant-items">
              {filtered.map((merchant) => (
                <div
                  key={merchant.id}
                  className={`merchant-item ${selectedMerchant?.id === merchant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMerchant(selectedMerchant?.id === merchant.id ? null : merchant)}
                >
                  <div className="merchant-item-header">
                    <div className="merchant-icon-badge">
                      {merchant.icon}
                    </div>
                    <div className="merchant-item-info">
                      <h4 className="merchant-name">{merchant.name}</h4>
                      <p className="merchant-location">📍 {merchant.location}</p>
                    </div>
                    <div className="merchant-badge">{merchant.category}</div>
                  </div>

                  <div className="merchant-item-stats">
                    <div className="stat">
                      <span className="label">Spent</span>
                      <span className="value">₹{merchant.spent}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Visits</span>
                      <span className="value">{merchant.visits}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Avg Visit</span>
                      <span className="value">₹{(merchant.spent / merchant.visits).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="merchant-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(merchant.spent / totalSpent) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-label">{((merchant.spent / totalSpent) * 100).toFixed(1)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MapPinOff size={48} />
              <p>No merchants found</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants Summary */}
      <div className="top-merchants-summary">
        <h3 className="summary-title">Top Spending Locations</h3>
        <div className="summary-list">
          {filtered.slice(0, 3).map((merchant, idx) => (
            <div key={merchant.id} className="summary-item">
              <span className="rank">#{idx + 1}</span>
              <div className="summary-info">
                <p className="name">{merchant.name}</p>
                <p className="amount">₹{merchant.spent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MerchantMap;