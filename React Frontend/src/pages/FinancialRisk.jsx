import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import { FaChartLine, FaExclamationTriangle, FaCheckCircle, FaBolt, FaHistory, FaChartBar, FaBalanceScale, FaDollarSign, FaCogs, FaMoneyBillWave } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

function FinancialRisk() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      axios.get(`${API_ENDPOINTS.RISK.FINANCIAL_HISTORY}?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: parseFloat(value) });
  };

  const predict = async () => {
    try {
      setLoading(true);
      setResult(null);
      const res = await axios.post(API_ENDPOINTS.RISK.FINANCIAL, { ...form, email: userEmail });
      setResult(res.data);
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "ROA", min: -0.05, max: 0.55, icon: FaDollarSign, color: "blue", desc: "Return on Assets" },
    { key: "Leverage", min: 0.02, max: 1.2, icon: FaBalanceScale, color: "amber", desc: "Financial Leverage Ratio" },
    { key: "Asset_Turnover", min: 0.6, max: 5.0, icon: FaCogs, color: "green", desc: "Asset Utilization Efficiency" },
    { key: "Gross_Profit_Liabilities", min: -1.0, max: 50.0, icon: FaMoneyBillWave, color: "violet", desc: "Gross Profit / Liabilities" },
    { key: "Operating_Profit", min: -1.0, max: 100.0, icon: FaChartLine, color: "rose", desc: "Operating Profit Margin" },
  ];

  const colorMap = {
    blue: { accent: "accent-blue-600", border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-900/10", text: "text-blue-600 dark:text-blue-400" },
    amber: { accent: "accent-amber-600", border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-900/10", text: "text-amber-600 dark:text-amber-400" },
    green: { accent: "accent-green-600", border: "border-green-200 dark:border-green-800", bg: "bg-green-50 dark:bg-green-900/10", text: "text-green-600 dark:text-green-400" },
    violet: { accent: "accent-violet-600", border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-900/10", text: "text-violet-600 dark:text-violet-400" },
    rose: { accent: "accent-rose-600", border: "border-rose-200 dark:border-rose-800", bg: "bg-rose-50 dark:bg-rose-900/10", text: "text-rose-600 dark:text-rose-400" },
  };

  const isStrong = result?.result === "Financially Strong Company";
  const prob = result ? parseFloat(result.probability) : 0;

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Financial Risk System</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Financial Distress & Bankruptcy Prediction</p>
        </div>
        {result && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isStrong ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}>{isStrong ? "Strong" : "Distressed"}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* FORM - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FaChartBar className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Financial Indicators</h2>
            </div>

            <div className="space-y-5">
              {fields.map(({ key, min, max, icon: Icon, color, desc }) => {
                const cc = colorMap[color];
                return (
                  <div key={key} className={`p-4 rounded-xl border ${cc.border} ${cc.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cc.text} />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{key.replace(/_/g, ' ')}</label>
                      </div>
                      <span className={`text-sm font-bold ${cc.text}`}>{form[key].toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{desc} ({min} to {max})</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleChange(key, Math.max(min, form[key] - 0.05))}
                        className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors">-</button>
                      <input type="range" min={min} max={max} step="0.01" value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)} className="flex-1" />
                      <button onClick={() => handleChange(key, Math.min(max, form[key] + 0.05))}
                        className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={predict} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing...</>
            ) : (
              <><FaBolt className="text-lg" /> Predict Financial Risk</>
            )}
          </button>
        </div>

        {/* RESULTS - 2 cols (only shown when result exists) */}
        {result && (
        <div className="lg:col-span-2 space-y-6">
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Probability</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{prob.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Threshold</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.threshold}</p>
                </div>
              </div>

              {/* RISK GAUGE */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Financial Health Score</h3>
                <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: "100%" }} />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(prob * 100, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${Math.min(prob * 100, 100)}%` }}
                  >
                    <div className="w-5 h-5 bg-white dark:bg-gray-200 border-2 border-gray-400 rounded-full shadow-md" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Distressed</span>
                  <span>Threshold: {result.threshold}</span>
                  <span>Strong</span>
                </div>
              </div>

              {/* STATUS CARD */}
              <div className={`p-6 rounded-xl border-2 flex items-center gap-4 ${
                isStrong ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}>
                {isStrong ? (
                  <FaCheckCircle className="text-green-500 dark:text-green-400 text-2xl flex-shrink-0" />
                ) : (
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-2xl flex-shrink-0" />
                )}
                <div>
                  <p className={`text-lg font-bold ${isStrong ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                    {result.result}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isStrong
                      ? "The company shows strong financial fundamentals with low risk of distress."
                      : "Financial indicators suggest potential distress. Consider improving leverage and profitability."}
                  </p>
                </div>
              </div>

              {/* BAR CHART */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Probability vs Threshold</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: "Probability", value: +prob.toFixed(2), fill: "#3b82f6" },
                    { name: "Threshold", value: +parseFloat(result.threshold).toFixed(2), fill: "#8b5cf6" },
                  ]} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" width={90} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow border border-gray-200 dark:border-slate-600 text-xs"><span className="font-medium">{payload[0].value}</span></div> : null} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={35}>
                      {[{ name: "Probability", value: prob, fill: "#3b82f6" }, { name: "Threshold", value: parseFloat(result.threshold), fill: "#8b5cf6" }].map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="value" position="right" fontSize={12} fontWeight={700} fill="#6b7280" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

          {/* HISTORY */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaHistory className="text-gray-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Recent Predictions</h3>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{(h.risk_score * 100).toFixed(1)}%</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      h.risk_label?.includes('Strong') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>{h.risk_label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
        </div>
        )}
      </div>
    </div>
  );
}

export default FinancialRisk;
