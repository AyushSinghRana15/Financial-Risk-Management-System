import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

export default API;

export const predictCreditRisk = (data) => {
    return API.post("/predict/credit", data);
};

export const predictOperationalRisk = (data) => {
    return API.post("/predict_operational_risk", data);
};

export const predictFraudRisk = (data) => {
    return API.post("/predict_fraud", data);
};