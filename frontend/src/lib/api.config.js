/**
 * API Configuration
 * Handles all backend communication and endpoints
 */

// Base URL configuration - adjust based on your environment
export const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  health: '/api/health',
  
  // Transactions
  transactions: '/api/transactions',
  transactionsLatest: '/api/transactions/latest',
  
  // SMS Parser
  smsParse: '/api/sms-parse',
  
  // Notifications
  notifications: '/api/notifications',
  
  // Insights
  insights: '/api/insights',
  
  // Merchants
  merchants: '/api/merchants',
};

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Call Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Health check endpoint
 */
export async function checkHealthStatus() {
  return apiCall(API_ENDPOINTS.health);
}

/**
 * Fetch all transactions
 */
export async function fetchTransactions(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const endpoint = params ? `${API_ENDPOINTS.transactions}?${params}` : API_ENDPOINTS.transactions;
  return apiCall(endpoint);
}

/**
 * Fetch latest transaction for a user
 */
export async function fetchLatestTransaction(userId) {
  const endpoint = `${API_ENDPOINTS.transactionsLatest}?userId=${userId}`;
  return apiCall(endpoint);
}

/**
 * Parse SMS messages
 */
export async function parseSMS(smsText) {
  return apiCall(API_ENDPOINTS.smsParse, {
    method: 'POST',
    body: JSON.stringify({ sms: smsText }),
  });
}

/**
 * Fetch AI insights
 */
export async function fetchInsights(userId) {
  const endpoint = `${API_ENDPOINTS.insights}?userId=${userId}`;
  return apiCall(endpoint);
}

/**
 * Fetch merchants data
 */
export async function fetchMerchants(userId) {
  const endpoint = `${API_ENDPOINTS.merchants}?userId=${userId}`;
  return apiCall(endpoint);
}

/**
 * Initialize API connection and verify backend is reachable
 */
export async function initializeAPI() {
  try {
    const result = await checkHealthStatus();
    if (result.success) {
      console.log('✓ Backend API connected');
      return true;
    } else {
      console.warn('⚠ Backend API unavailable:', result.error);
      return false;
    }
  } catch (error) {
    console.error('✗ Failed to connect to backend:', error);
    return false;
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiCall,
  checkHealthStatus,
  fetchTransactions,
  fetchLatestTransaction,
  parseSMS,
  fetchInsights,
  fetchMerchants,
  initializeAPI,
};