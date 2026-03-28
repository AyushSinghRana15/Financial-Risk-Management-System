import { useState, useEffect } from "react";
import axios from "axios";

function FinancialRisk() {

  const userEmail = localStorage.getItem('user') || "";
  
  const [form, setForm] = useState({
    email: userEmail,
    ROA: 0.3,
    Leverage: 0.5,
    Asset_Turnover: 1.0,
    Gross_Profit_Liabilities: 0.3,
    Operating_Profit: 20
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (userEmail) {
      axios.get(`http://127.0.0.1:8000/financial/history?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: parseFloat(value) });
  };

  const predict = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/financial/predict",
        { ...form, email: userEmail }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("API Error ❌");
    }
  };

  const fields = [
    { key: "ROA", min: -0.05, max: 0.55 },
    { key: "Leverage", min: 0.02, max: 1.2 },
    { key: "Asset_Turnover", min: 0.6, max: 5.0 },
    { key: "Gross_Profit_Liabilities", min: -1.0, max: 50.0 },
    { key: "Operating_Profit", min: -1.0, max: 100.0 }
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>🏦 Financial Risk System</h1>
      <h3>Enter Financial Data</h3>

      {fields.map(({ key, min, max }) => (
        <div key={key} style={{ marginBottom: 15 }}>
          <label>
            {key} ({min} to {max})
          </label>

          <input
            type="range"
            min={min}
            max={max}
            step="0.01"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ width: "100%" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => handleChange(key, form[key] - 0.01)}>-</button>
            <span>{form[key].toFixed(2)}</span>
            <button onClick={() => handleChange(key, form[key] + 0.01)}>+</button>
          </div>
        </div>
      ))}

      <button
        onClick={predict}
        style={{
          padding: 10,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer"
        }}
      >
        🔍 Predict
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <p>📈 Probability: {Number(result.probability).toFixed(2)}</p>
          <p>🎯 Threshold: {result.threshold}</p>

          <div
            style={{
              padding: 15,
              borderRadius: 5,
              marginTop: 10,
              background:
                result.result === "Financially Strong Company"
                  ? "#d4edda"
                  : "#f8d7da",
              color:
                result.result === "Financially Strong Company"
                  ? "green"
                  : "red",
              fontWeight: "bold"
            }}
          >
            {result.result}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: "bold", marginBottom: 10 }}>Recent Predictions</h3>
          {history.map(h => (
            <div key={h.id} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              padding: "10px", 
              marginBottom: "5px", 
              background: "#f8f9fa",
              borderRadius: "5px"
            }}>
              <span style={{ fontSize: 12 }}>{new Date(h.recorded_at).toLocaleDateString()}</span>
              <span>{(h.risk_score * 100).toFixed(1)}%</span>
              <span>{h.risk_label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FinancialRisk;