import { useState } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaCalculator, FaBalanceScale, FaExclamationTriangle, FaCheckCircle, FaBolt, FaHistory, FaChartBar, FaBuilding } from "react-icons/fa";
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

const groups = [
  { name: "Liquidity Ratios", color: "blue", features: ["feature_32", "feature_33", "feature_36", "feature_37"] },
  { name: "Profitability Ratios", color: "green", features: ["feature_3", "feature_5", "feature_44"] },
  { name: "Solvency Ratios", color: "violet", features: ["feature_68", "feature_67", "feature_38"] },
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
    FEATURES.forEach((f) => { payload[f.key] = parseFloat(values[f.key]) || 0; });
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
  };

  const getRiskColor = (level) => {
    if (!level) return "#666";
    if (level.includes("High")) return "#ef4444";
    if (level.includes("Moderate")) return "#eab308";
    return "#22c55e";
  };

  const riskColor = result ? getRiskColor(result.risk_level) : "#666";
  const riskPct = result ? (result.risk_probability * 100) : 0;

  const colorMap = { blue: { border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-900/10", icon: "text-blue-600 dark:text-blue-400", input: "focus:ring-blue-500" }, green: { border: "border-green-200 dark:border-green-800", bg: "bg-green-50 dark:bg-green-900/10", icon: "text-green-600 dark:text-green-400", input: "focus:ring-green-500" }, violet: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-900/10", icon: "text-violet-600 dark:text-violet-400", input: "focus:ring-violet-500" } };

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Business Risk Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ML-based Business Risk Prediction</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Threshold: 25%</span>
          {result && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              result.risk_level?.includes('High') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              result.risk_level?.includes('Moderate') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>{result.risk_level}</span>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${result ? "lg:grid-cols-5" : ""}`}>

        {/* INPUTS - 3 cols (full width when no result) */}
        <div className={`${result ? "lg:col-span-3" : "lg:col-span-5 lg:max-w-4xl lg:mx-auto"} space-y-6`}>
          {groups.map((group) => {
            const cc = colorMap[group.color];
            const groupFeatures = FEATURES.filter(f => group.features.includes(f.key));
            return (
              <div key={group.name} className={`rounded-xl border ${cc.border} ${cc.bg} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine className={cc.icon} />
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-white">{group.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400`}>{groupFeatures.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupFeatures.map((feature) => (
                    <div key={feature.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{feature.label}</label>
                      <input type="number" placeholder={feature.placeholder} value={values[feature.key] || ""}
                        onChange={(e) => handleChange(feature.key, e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${cc.input}`} />
                      <span className="text-xs text-gray-400 dark:text-gray-500">{feature.hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button onClick={handlePredict} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Predicting...</>
            ) : (
              <><FaBolt className="text-lg" /> Run Prediction</>
            )}
          </button>
        </div>

        {/* RESULTS - 2 cols (only shown when result exists) */}
        {result && (
        <div className="lg:col-span-2 space-y-6">
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Risk Probability</p>
                  <h2 className="text-2xl font-bold" style={{ color: riskColor }}>{riskPct.toFixed(1)}%</h2>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Prediction</p>
                  <p className="text-lg font-bold" style={{ color: result.risk_prediction === 1 ? "#ef4444" : "#22c55e" }}>
                    {result.risk_prediction === 1 ? "At Risk" : "Safe"}
                  </p>
                </div>
              </div>

              {/* RISK GAUGE */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Risk Assessment</h3>
                <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ width: "100%" }} />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(riskPct, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${Math.min(riskPct, 100)}%` }}
                  >
                    <div className="w-5 h-5 bg-white dark:bg-gray-200 border-2 border-gray-400 rounded-full shadow-md" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>0% Safe</span>
                  <span>25% Threshold</span>
                  <span>100% At Risk</span>
                </div>
              </div>

              {/* DETAILED METRICS */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Decision Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Decision Threshold</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{(result.threshold * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Risk Probability</span>
                    <span className="font-bold" style={{ color: riskColor }}>{riskPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Risk Level</span>
                    <span className="font-bold" style={{ color: riskColor }}>{result.risk_level}</span>
                  </div>
                </div>
              </div>

              {/* RISK INDICATOR */}
              <div className={`p-5 rounded-xl border-2 flex items-center gap-3 ${
                result.risk_prediction === 1 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              }`}>
                {result.risk_prediction === 1 ? (
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-xl flex-shrink-0" />
                ) : (
                  <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl flex-shrink-0" />
                )}
                <div>
                  <p className={`font-bold ${result.risk_prediction === 1 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                    {result.risk_prediction === 1 ? "Business is at Risk" : "Business is Safe"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {result.risk_prediction === 1
                      ? "Financial indicators suggest potential business distress. Consider improving liquidity and profitability ratios."
                      : "Financial health appears stable. Continue monitoring key ratios."}
                  </p>
                </div>
              </div>
        </div>
        )}
      </div>
    </div>
  );
}
