import { useState } from "react";
import { API_ENDPOINTS } from "../config/api";

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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const res = await fetch(API_ENDPOINTS.RISK.BUSINESS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      window.dispatchEvent(new Event("refreshDashboard"));
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
    <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">Business Risk Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm m-0 mt-1">
            ML-based Business Risk Prediction
          </p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Threshold: 25%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Inputs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white m-0 mb-5">
            Business Indicators
          </h3>
          {FEATURES.map((feature) => (
            <div key={feature.key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {feature.label}
              </label>
              <input
                type="number"
                placeholder={feature.placeholder}
                value={values[feature.key] || ""}
                onChange={(e) => handleChange(feature.key, e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">{feature.hint}</span>
            </div>
          ))}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-3 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Predicting..." : "Run Prediction"}
          </button>
        </div>

        {/* Right - Result */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 flex flex-col items-center justify-start min-h-[300px]">
          {!result ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Run prediction to see results</p>
          ) : (
            <div className="w-full text-center">
              <div className="inline-block px-6 py-3 rounded-lg mb-8 border-l-4" style={{
                background: getRiskColor(result.risk_level) + "18",
                borderColor: getRiskColor(result.risk_level)
              }}>
                <div className="text-xl font-bold" style={{ color: getRiskColor(result.risk_level) }}>
                  {result.risk_level}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Probability</div>
                  <div className="text-2xl font-bold" style={{ color: getRiskColor(result.risk_level) }}>
                    {(result.risk_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prediction</div>
                  <div className="text-2xl font-bold" style={{ color: result.risk_prediction === 1 ? "#e53e3e" : "#38a169" }}>
                    {result.risk_prediction === 1 ? "At Risk" : "Safe"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 col-span-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Decision Threshold</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
