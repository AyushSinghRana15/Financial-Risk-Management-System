import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import { FaShoppingCart, FaMoneyBillWave, FaMobileAlt, FaGlobeAmericas, FaCreditCard, FaExclamationTriangle, FaCheckCircle, FaBolt, FaHistory, FaChartBar, FaUserAlt, FaCalendarAlt } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

export default function ECommerceFraudRisk() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";

  const [form, setForm] = useState({
    amount: 100,
    quantity: 1,
    paymentMethod: "Credit Card",
    productCategory: "Electronics",
    location: "USA",
    device: "Mobile",
    age: 30,
    accountAge: 200,
    hour: 12,
    day: 15,
    month: 6
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      axios.get(`${API_ENDPOINTS.RISK.FRAUD_HISTORY}?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
    setLoading(true);
    const data = {
      email: userEmail,
      amount: Number(form.amount),
      quantity: Number(form.quantity),
      payment_method: form.paymentMethod,
      product_category: form.productCategory,
      customer_location: form.location,
      device_used: form.device,
      customer_age: Number(form.age),
      account_age_days: Number(form.accountAge),
      transaction_hour: Number(form.hour),
      transaction_day: Number(form.day),
      transaction_month: Number(form.month)
    };
    try {
      const res = await axios.post(API_ENDPOINTS.RISK.FRAUD, data);
      setResult(res.data);
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFraud = result?.prediction === 1;
  const fraudPct = result ? (result.fraud_probability * 100) : 0;

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">E-Commerce Fraud Detection</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ML-based Transaction Fraud Analysis</p>
        </div>
        {result && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isFraud ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          }`}>{result.label}</span>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${result ? "lg:grid-cols-5" : ""}`}>

        {/* FORM - 3 cols (full width when no result) */}
        <div className={`${result ? "lg:col-span-3" : "lg:col-span-5 lg:max-w-4xl lg:mx-auto"} space-y-6`}>
          {/* TRANSACTION DETAILS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaShoppingCart className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Transaction Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Transaction Amount ($)", "amount", FaMoneyBillWave],
                ["Quantity", "quantity", FaShoppingCart],
                ["Customer Age", "age", FaUserAlt],
                ["Account Age (days)", "accountAge", FaHistory],
                ["Transaction Hour", "hour", FaCalendarAlt],
                ["Transaction Day", "day", FaCalendarAlt],
                ["Transaction Month", "month", FaCalendarAlt],
              ].map(([label, name, Icon]) => (
                <div key={name}>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
                    <Icon className="text-gray-400 text-xs" /> {label}
                  </label>
                  <input type="number" name={name} value={form[name]} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORICAL FIELDS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaGlobeAmericas className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Transaction Metadata</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
                  <FaCreditCard className="text-gray-400 text-xs" /> Payment Method
                </label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Credit Card</option><option>Debit Card</option><option>PayPal</option><option>Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
                  <FaShoppingCart className="text-gray-400 text-xs" /> Product Category
                </label>
                <select name="productCategory" value={form.productCategory} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Electronics</option><option>Clothing</option><option>Home</option><option>Beauty</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
                  <FaGlobeAmericas className="text-gray-400 text-xs" /> Customer Location
                </label>
                <select name="location" value={form.location} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>USA</option><option>UK</option><option>India</option><option>Germany</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
                  <FaMobileAlt className="text-gray-400 text-xs" /> Device Used
                </label>
                <select name="device" value={form.device} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Mobile</option><option>Desktop</option><option>Tablet</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={handlePredict} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing Transaction...</>
            ) : (
              <><FaBolt className="text-lg" /> Predict Fraud</>
            )}
          </button>
        </div>

        {/* RESULTS - 2 cols (only shown when result exists) */}
        {result && (
        <div className="lg:col-span-2 space-y-6">
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Fraud Probability</p>
                  <h2 className="text-2xl font-bold" style={{ color: isFraud ? "#ef4444" : "#22c55e" }}>{fraudPct.toFixed(2)}%</h2>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Verdict</p>
                  <p className="text-lg font-bold" style={{ color: isFraud ? "#ef4444" : "#22c55e" }}>{result.label}</p>
                </div>
              </div>

              {/* RISK GAUGE */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Fraud Risk Assessment</h3>
                <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ width: "100%" }} />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(fraudPct, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${Math.min(fraudPct, 100)}%` }}
                  >
                    <div className="w-5 h-5 bg-white dark:bg-gray-200 border-2 border-gray-400 rounded-full shadow-md" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Safe</span>
                  <span>50%</span>
                  <span>Fraud</span>
                </div>
              </div>

              {/* BAR CHART */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Fraud Probability</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={[{ name: "Fraud Probability", value: +fraudPct.toFixed(1), fill: isFraud ? "#ef4444" : "#22c55e" }]} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" width={110} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow border border-gray-200 dark:border-slate-600 text-xs"><span className="font-medium" style={{ color: isFraud ? "#ef4444" : "#22c55e" }}>{payload[0].value}%</span></div> : null} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      <Cell fill={isFraud ? "#ef4444" : "#22c55e"} />
                      <LabelList dataKey="value" position="right" fontSize={12} fontWeight={700} fill="#6b7280" formatter={(v) => `${v}%`} />
                    </Bar>
                    <ReferenceLine x={50} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* STATUS */}
              <div className={`p-5 rounded-xl border-2 flex items-center gap-3 ${
                isFraud ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              }`}>
                {isFraud ? (
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-xl flex-shrink-0" />
                ) : (
                  <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl flex-shrink-0" />
                )}
                <div>
                  <p className={`font-bold ${isFraud ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                    {isFraud ? "Fraudulent Transaction Detected" : "Legitimate Transaction"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isFraud
                      ? "This transaction shows strong indicators of fraud. Recommend manual review."
                      : "Transaction appears normal with low fraud indicators."}
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
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.predicted_at).toLocaleDateString()}</span>
                    <span className="text-sm text-gray-800 dark:text-gray-200">${h.amount}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      h.label?.includes('Fraud') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>{h.label}</span>
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
