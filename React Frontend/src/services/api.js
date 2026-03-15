import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000"
});

export const predictCreditRisk = (data) => {
    return API.post("/predict/credit", data);
};