export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
    AUTH: {
        GOOGLE: `${API_BASE_URL}/auth/google`,
        SIGNUP: `${API_BASE_URL}/auth/signup`,
        LOGIN: `${API_BASE_URL}/auth/login`,
    },
    DASHBOARD: {
        STATS: `${API_BASE_URL}/dashboard/stats`,
    },
    PORTFOLIO: {
        GET: (email) => `${API_BASE_URL}/portfolio/get/${encodeURIComponent(email)}`,
        ADD: `${API_BASE_URL}/portfolio/add`,
    },
    PROFILE: `${API_BASE_URL}/profile`,
    RISK: {
        CREDIT: `${API_BASE_URL}/predict_credit_risk`,
        CREDIT_HISTORY: `${API_BASE_URL}/credit_predictions`,
        MARKET: `${API_BASE_URL}/predict_market_risk`,
        MARKET_FEATURES: `${API_BASE_URL}/market_features`,
        FRAUD: `${API_BASE_URL}/predict_fraud`,
        FRAUD_HISTORY: `${API_BASE_URL}/fraud_history`,
        OPERATIONAL: `${API_BASE_URL}/predict_operational_risk`,
        FINANCIAL: `${API_BASE_URL}/financial/predict`,
        FINANCIAL_HISTORY: `${API_BASE_URL}/financial/history`,
        LIQUIDITY: `${API_BASE_URL}/liquidity/predict`,
        LIQUIDITY_FEATURES: `${API_BASE_URL}/liquidity/features`,
        LIQUIDITY_HISTORY: `${API_BASE_URL}/liquidity/history`,
        BUSINESS: `${API_BASE_URL}/predict_business_risk`,
    },
    AI: {
        ALERTS: `${API_BASE_URL}/ai-risk-alerts`,
    },
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
    MARKET: {
        SEARCH: `${API_BASE_URL}/market/search`,
        STOCK: (symbol) => `${API_BASE_URL}/market/stock/${symbol}`,
        DATA: `${API_BASE_URL}/market-data`,
    },
};

export default API_BASE_URL;
