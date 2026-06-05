import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import { FaShoppingCart, FaMoneyBillWave, FaMobileAlt, FaGlobeAmericas, FaCreditCard, FaExclamationTriangle, FaCheckCircle, FaBolt, FaHistory, FaChartBar, FaUserAlt, FaCalendarAlt, FaShieldAlt, FaCogs, FaArrowRight, FaBrain, FaLock } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

const features = [
  { name: "Transaction Amount", importance: 0.28, icon: FaMoneyBillWave, color: "blue", desc: "Larger amounts tend to have higher fraud risk, especially overnight" },
  { name: "Account Age", importance: 0.21, icon: FaHistory, color: "indigo", desc: "Newly created accounts are significantly more likely to be fraudulent" },
  { name: "Customer Age", importance: 0.16, icon: FaUserAlt, color: "purple", desc: "Certain age demographics show higher fraud susceptibility" },
  { name: "Payment Method", importance: 0.13, icon: FaCreditCard, color: "pink", desc: "Credit cards and bank transfers show distinct fraud patterns" },
  { name: "Location", importance: 0.09, icon: FaGlobeAmericas, color: "orange", desc: "Transactions from high-risk regions trigger additional scrutiny" },
  { name: "Device Used", importance: 0.07, icon: FaMobileAlt, color: "teal", desc: "Mobile devices correlate with higher fraud rates than desktop" },
  { name: "Product Category", importance: 0.04, icon: FaShoppingCart, color: "cyan", desc: "Electronics and luxury goods are common fraud targets" },
  { name: "Transaction Time", importance: 0.02, icon: FaCalendarAlt, color: "rose", desc: "Late-night transactions show elevated fraud probability" },
];

const colorMap = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", bar: "from-blue-500 to-blue-400", icon: "text-blue-600 dark:text-blue-400" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", bar: "from-indigo-500 to-indigo-400", icon: "text-indigo-600 dark:text-indigo-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", bar: "from-purple-500 to-purple-400", icon: "text-purple-600 dark:text-purple-400" },
  pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", badge: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400", bar: "from-pink-500 to-pink-400", icon: "text-pink-600 dark:text-pink-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400", bar: "from-orange-500 to-orange-400", icon: "text-orange-600 dark:text-orange-400" },
  teal: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400", bar: "from-teal-500 to-teal-400", icon: "text-teal-600 dark:text-teal-400" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", badge: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", bar: "from-cyan-500 to-cyan-400", icon: "text-cyan-600 dark:text-cyan-400" },
  rose: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400", bar: "from-rose-500 to-rose-400", icon: "text-rose-600 dark:text-rose-400" },
};

const preventionTips = [
  { icon: FaShieldAlt, title: "Enable 2FA", desc: "Two-factor authentication reduces account takeover risk by 99%" },
  { icon: FaLock, title: "Use Strong Passwords", desc: "Unique passwords for each platform prevent credential stuffing" },
  { icon: FaHistory, title: "Monitor Transactions", desc: "Review account activity regularly for unauthorized charges" },
  { icon: FaGlobeAmericas, title: "Verify Vendors", desc: "Only purchase from reputable websites with SSL certificates" },
  { icon: FaCreditCard, title: "Virtual Cards", desc: "Use single-use virtual card numbers for online purchases" },
];

const tabClasses = (active) =>
  `relative px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
    active
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
  }`;

export default function ECommerceFraudRisk() {
  const [activeTab, setActiveTab] = useState("predictor");
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

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">E-Commerce Fraud Detection</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ML-based Transaction Fraud Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {result && activeTab === "predictor" && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isFraud ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            }`}>{result.label}</span>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("predictor")} className={tabClasses(activeTab === "predictor")}>
          <FaBolt className="inline mr-1.5 -mt-0.5" /> Predictor
        </button>
        <button onClick={() => setActiveTab("know-more")} className={tabClasses(activeTab === "know-more")}>
          <FaBrain className="inline mr-1.5 -mt-0.5" /> Know More
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "predictor" ? (
          <motion.div key="predictor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <PredictorTab form={form} setForm={setForm} handleChange={handleChange} handlePredict={handlePredict} loading={loading} result={result} isFraud={isFraud} fraudPct={fraudPct} history={history} />
          </motion.div>
        ) : (
          <motion.div key="know-more" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <KnowMoreTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PredictorTab({ form, setForm, handleChange, handlePredict, loading, result, isFraud, fraudPct, history }) {
  const userEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email || "";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* FORM - 3 cols */}
      <div className="lg:col-span-3 space-y-6">
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

      {/* RESULTS - 2 cols */}
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
  );
}

function KnowMoreTab() {
  const [expandedFeature, setExpandedFeature] = useState(null);
  const maxImportance = Math.max(...features.map(f => f.importance));

  return (
    <div className="space-y-8">

      {/* HOW IT WORKS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-8 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/20">
              <FaBrain className="text-blue-400 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How Fraud Detection Works</h2>
              <p className="text-blue-300 text-sm">Powered by XGBoost — a gradient boosting ensemble algorithm</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Data Collection", desc: "Your transaction inputs are normalized and encoded into numerical features that the model understands." },
              { step: "02", title: "Pattern Analysis", desc: "XGBoost evaluates hundreds of decision trees across 8+ risk dimensions to detect anomaly patterns." },
              { step: "03", title: "Risk Scoring", desc: "Each tree votes on fraud likelihood. The ensemble averages them into a final 0-100% fraud probability score." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="text-4xl font-black bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent opacity-30 group-hover:opacity-50 transition-opacity">{step}</span>
                <h3 className="text-white font-semibold mt-1 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* FEATURE IMPORTANCE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FaChartBar className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">Feature Importance</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Which factors matter most in fraud detection</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-1">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <div key={f.name}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => setExpandedFeature(expandedFeature === f.name ? null : f.name)}
                  >
                    <div className="flex items-center gap-3 py-2">
                      <div className={`p-1.5 rounded-lg ${c.bg} flex-shrink-0`}>
                        <f.icon className={`${c.icon} text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{f.name}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                            {(f.importance * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(f.importance / maxImportance) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 + 0.2, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
                          />
                        </div>
                      </div>
                      <motion.div animate={{ rotate: expandedFeature === f.name ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <FaArrowRight className="text-gray-300 dark:text-gray-600 text-xs" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <AnimatePresence>
                    {expandedFeature === f.name && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <p className="text-xs text-gray-500 dark:text-gray-400 pb-2 pl-10 leading-relaxed">{f.desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* PREVENTION TIPS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FaShieldAlt className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">Fraud Prevention Tips</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Best practices to keep your transactions secure</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {preventionTips.map((tip, i) => (
              <motion.div key={tip.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-300 cursor-default border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <tip.icon className="text-emerald-500 dark:text-emerald-400 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{tip.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* MODEL INFO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <FaCogs className="text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Model Architecture</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">XGBoost Classifier with engineered transaction features</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Algorithm:</span>
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">XGBoost</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Features:</span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">8</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Task:</span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Binary Classification</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
