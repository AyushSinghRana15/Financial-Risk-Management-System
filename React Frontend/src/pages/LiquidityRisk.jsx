import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaTint, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaBolt, FaHistory, FaChartBar, FaInfoCircle, FaBuilding } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const LEVEL_COLORS = {
  "Very Low": { color: "#22c55e", bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
  "Low": { color: "#16a34a", bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
  "Medium": { color: "#eab308", bg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" },
  "High": { color: "#f97316", bg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
  "Very High": { color: "#ef4444", bg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
};

export default function LiquidityRisk() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";
  const [features, setFeatures] = useState([]);
  const [labels, setLabels] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(API_ENDPOINTS.RISK.LIQUIDITY_FEATURES)
      .then(res => {
        setFeatures(res.data.features);
        setLabels(res.data.labels);
        let init = {};
        res.data.features.forEach(f => init[f] = 0);
        setFormData(init);
      })
      .catch(() => alert("Backend not connected"));

    if (userEmail) {
      axios.get(`${API_ENDPOINTS.RISK.LIQUIDITY_HISTORY}?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail]);

  const handleChange = (feature, value) => {
    setFormData(prev => ({ ...prev, [feature]: Number(value) }));
  };

  const predict = async () => {
    try {
      setLoading(true);
      setResult(null);
      const res = await axios.post(API_ENDPOINTS.RISK.LIQUIDITY, { ...formData, email: userEmail });
      setResult(res.data);
      window.dispatchEvent(new Event("refreshDashboard"));
      if (userEmail) {
        axios.get(`${API_ENDPOINTS.RISK.LIQUIDITY_HISTORY}?email=${encodeURIComponent(userEmail)}`)
          .then(res => setHistory(res.data.history || []))
          .catch(console.error);
      }
    } catch (err) {
      console.error("Prediction Error:", err);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const lc = result ? (LEVEL_COLORS[result.risk_level] || { color: "#666", bg: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400" }) : { color: "#666", bg: "" };
  const riskScore = result ? (result.prediction / 4 * 100) : 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Liquidity Risk Prediction</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Multi-class Liquidity Risk Assessment</p>
        </div>
        {result && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${lc.bg}`}>{result.risk_level}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* FORM - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaTint className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Liquidity Metrics</h2>
            </div>

            {features.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading features from backend...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <div key={f}>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
                      {labels[i] || f.replace(/_/g, ' ')}
                    </label>
                    <input type="number" value={formData[f] ?? ""}
                      onChange={(e) => handleChange(f, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={predict} disabled={loading || features.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing...</>
            ) : (
              <><FaBolt className="text-lg" /> Predict Liquidity Risk</>
            )}
          </button>
        </div>

        {/* RESULTS (only shown when result exists) */}
        {result && (
        <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Risk Level</p>
                  <p className="text-xl font-bold" style={{ color: lc.color }}>{result.risk_level}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Class</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{result.prediction}/4</p>
                </div>
              </div>

              {/* RISK GAUGE */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Liquidity Risk Level</h3>
                <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ width: "100%" }} />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(riskScore, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${Math.min(riskScore, 100)}%` }}
                  >
                    <div className="w-5 h-5 bg-white dark:bg-gray-200 border-2 border-gray-400 rounded-full shadow-md" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Very Low</span>
                  <span>Medium</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* LEVEL BREAKDOWN */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Risk Classification Tiers</h3>
                <div className="space-y-2">
                  {Object.entries(LEVEL_COLORS).map(([level, style]) => (
                    <div key={level} className={`flex justify-between items-center p-3 rounded-lg ${
                      result.risk_level === level ? style.bg + " border border-current" : "bg-gray-50 dark:bg-slate-700"
                    }`}>
                      <span className={`text-sm font-medium ${result.risk_level === level ? "" : "text-gray-600 dark:text-gray-300"}`} style={result.risk_level === level ? { color: style.color } : {}}>
                        {result.risk_level === level && <FaCheckCircle className="inline mr-1.5" style={{ color: style.color }} />}
                        {level}
                      </span>
                      {result.risk_level === level && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: style.color + "20", color: style.color }}>
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-xl border-2 flex items-center gap-3 ${
                result.risk_level === "Very High" || result.risk_level === "High"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : result.risk_level === "Medium"
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              }`}>
                {result.risk_level === "Very High" || result.risk_level === "High" ? (
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-xl flex-shrink-0" />
                ) : (
                  <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl flex-shrink-0" />
                )}
                <div>
                  <p className={`font-bold ${result.risk_level === "Very High" || result.risk_level === "High" ? "text-red-700 dark:text-red-300" : result.risk_level === "Medium" ? "text-yellow-700 dark:text-yellow-300" : "text-green-700 dark:text-green-300"}`}>
                    {result.risk_level === "Very High" || result.risk_level === "High" ? "Elevated Liquidity Risk" : result.risk_level === "Medium" ? "Moderate Liquidity Risk" : "Low Liquidity Risk"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {result.risk_level === "Very High" || result.risk_level === "High"
                      ? "The institution may face difficulty meeting short-term obligations."
                      : result.risk_level === "Medium"
                      ? "Liquidity position is adequate but monitor closely."
                      : "Strong liquidity position with ample buffer."}
                  </p>
                </div>
              </div>
          {/* HISTORY */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaHistory className="text-gray-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Recent Predictions</h3>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map(h => {
                  const hc = LEVEL_COLORS[h.risk_label] || { color: "#666", bg: "bg-gray-100 dark:bg-slate-700 text-gray-600" };
                  return (
                    <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">Class {h.liquidity_score}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hc.bg}`}>{h.risk_label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
