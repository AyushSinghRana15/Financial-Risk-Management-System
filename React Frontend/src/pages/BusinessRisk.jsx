import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const FEATURES = [
  { key: "feature_32", label: "Current Ratio", placeholder: "e.g. 1.5", hint: "Current Assets / Current Liabilities" },
  { key: "feature_33", label: "Quick Ratio", placeholder: "e.g. 1.2", hint: "Liquid Assets / Current Liabilities" },
  { key: "feature_36", label: "Debt Ratio %", placeholder: "e.g. 0.45", hint: "Total Debt / Total Assets" },
  { key: "feature_37", label: "Net Worth / Assets", placeholder: "e.g. 0.55", hint: "Equity / Total Assets" },
  { key: "feature_3", label: "Operating Gross Margin", placeholder: "e.g. 0.30", hint: "Gross Profit / Revenue" },
  { key: "feature_5", label: "Operating Profit Rate", placeholder: "e.g. 0.15", hint: "Operating Profit / Revenue" },
  { key: "feature_44", label: "Total Asset Turnover", placeholder: "e.g. 0.8", hint: "Revenue / Total Assets" },
  { key: "feature_68", label: "Total Income / Total Expense", placeholder: "e.g. 1.2", hint: "Revenue / Expenses ratio" },
  { key: "feature_67", label: "Retained Earnings to Total Assets", placeholder: "e.g. 0.25", hint: "Retained Earnings / Total Assets" },
  { key: "feature_38", label: "Long-term Fund Suitability Ratio", placeholder: "e.g. 1.1", hint: "Long-term funds vs fixed assets" },
];

export default function BusinessRisk() {
  const userEmail = localStorage.getItem('user') || "";
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      axios.get(`${API}/business_risk_history?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    const payload = { email: userEmail };
    FEATURES.forEach((f) => {
      payload[f.key] = parseFloat(values[f.key]) || 0;
    });
    try {
      const res = await fetch(`${API}/predict_business_risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    document.querySelector('[style*="overflow"]')?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRiskColor = (level) => {
    if (!level) return "#666";
    if (level.includes("High")) return "#e53e3e";
    if (level.includes("Moderate")) return "#d69e2e";
    return "#38a169";
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "white", borderRadius: "12px", padding: "24px",
        marginBottom: "24px", display: "flex", justifyContent: "space-between",
        alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Business Risk Dashboard</h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "14px" }}>
            ML-based Business Risk Prediction
          </p>
        </div>
        <span style={{ fontSize: "13px", color: "#666", fontWeight: 500 }}>Threshold: 25%</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left - Inputs */}
        <div style={{
          background: "white", borderRadius: "12px", padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600 }}>
            Business Indicators
          </h3>
          {FEATURES.map((feature) => (
            <div key={feature.key} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500,
                color: "#374151", marginBottom: "4px" }}>
                {feature.label}
              </label>
              <input
                type="number"
                placeholder={feature.placeholder}
                value={values[feature.key] || ""}
                onChange={(e) => handleChange(feature.key, e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                  borderRadius: "8px", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>{feature.hint}</span>
            </div>
          ))}
          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              width: "100%", marginTop: "12px", padding: "12px",
              background: loading ? "#a0aec0" : "#3b82f6",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Predicting..." : "Run Prediction"}
          </button>
        </div>

        {/* Right - Result */}
        <div style={{
          background: "white", borderRadius: "12px", padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", justifyContent: "flex-start",
          alignItems: "center", minHeight: "300px"
        }}>
          {!result ? (
            <p style={{ color: "#9ca3af", fontSize: "15px" }}>Run prediction to see results</p>
          ) : (
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{
                display: "inline-block", padding: "10px 28px",
                background: getRiskColor(result.risk_level) + "18",
                borderLeft: `4px solid ${getRiskColor(result.risk_level)}`,
                borderRadius: "8px", marginBottom: "32px"
              }}>
                <div style={{ fontSize: "20px", fontWeight: 700,
                  color: getRiskColor(result.risk_level) }}>
                  {result.risk_level}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "18px" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Risk Probability</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: getRiskColor(result.risk_level) }}>
                    {(result.risk_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "18px" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Prediction</div>
                  <div style={{ fontSize: "26px", fontWeight: 700,
                    color: result.risk_prediction === 1 ? "#e53e3e" : "#38a169" }}>
                    {result.risk_prediction === 1 ? "At Risk" : "Safe"}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "18px", gridColumn: "span 2" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Decision Threshold</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#3b82f6" }}>
                    {(result.threshold * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}