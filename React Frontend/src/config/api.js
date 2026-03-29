const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
    RISK: {
        CREDIT: `${API_BASE_URL}/predict/credit`,
        MARKET: `${API_BASE_URL}/predict/market`,
        FRAUD: `${API_BASE_URL}/predict/fraud`,
        OPERATIONAL: `${API_BASE_URL}/predict/operational_risk`,
        FINANCIAL: `${API_BASE_URL}/financial/predict`,
        LIQUIDITY: `${API_BASE_URL}/liquidity`,
        BUSINESS: `${API_BASE_URL}/business/predict`,
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
