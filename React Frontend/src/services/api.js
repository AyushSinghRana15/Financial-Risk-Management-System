import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000"
});

// ✅ EXPORT DEFAULT
export default API;

// existing functions
export const predictCreditRisk = (data) => {
    return API.post("/predict/credit", data);
};

export const predictOperationalRisk = (data) => {
    return API.post("/predict_operational_risk", data);
};

export const predictFraudRisk = (data) => {
    return API.post("/predict_fraud", data);
};