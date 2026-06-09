import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import { FaMale, FaFemale, FaCar, FaHome, FaGraduationCap, FaInfoCircle, FaChevronDown, FaShieldAlt, FaCreditCard, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaMoneyBillWave, FaUserTie, FaChartBar, FaHistory, FaBolt, FaCreditCard as FaCard, FaPiggyBank, FaBriefcase, FaClock, FaPercent } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
import SEO from "../components/SEO";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/Toast";

const behaviorOptions = {
  ext1: [
    { label: "Always on time", score: 0.8, icon: FaCheckCircle, color: "green" },
    { label: "Sometimes late", score: 0.5, icon: FaClock, color: "yellow" },
    { label: "Often late", score: 0.2, icon: FaExclamationTriangle, color: "red" },
  ],
  ext2: [
    { label: "Regular savings", score: 0.8, icon: FaPiggyBank, color: "green" },
    { label: "Occasional", score: 0.5, icon: FaChartLine, color: "yellow" },
    { label: "No savings", score: 0.2, icon: FaMoneyBillWave, color: "red" },
  ],
  ext3: [
    { label: "Managed well", score: 0.8, icon: FaCheckCircle, color: "green" },
    { label: "No loans", score: 0.5, icon: FaBriefcase, color: "yellow" },
    { label: "Defaulted before", score: 0.2, icon: FaExclamationTriangle, color: "red" },
  ],
};

export default function CreditRisk() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";
  const infoRef = useRef(null);
  const [infoHeight, setInfoHeight] = useState(0);

  const [formData, setFormData] = useState({
    email: userEmail,
    income: 150000,
    credit: 300000,
    age: 35,
    employment_years: 5,
    ext1: 0.5,
    ext2: 0.5,
    ext3: 0.5,
    gender: "Male",
    owns_car: "Yes",
    owns_house: "Yes",
    education: "Higher education"
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    if (userEmail) {
      axios.get(`${API_ENDPOINTS.RISK.CREDIT_HISTORY}?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.predictions || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  useEffect(() => {
    if (infoRef.current) {
      setInfoHeight(infoRef.current.scrollHeight);
    }
  }, [showInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === "range" || e.target.type === "number" ? Number(value) : value
    }));
  };

  const predictRisk = async () => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.RISK.CREDIT, formData);
      setResult(response.data);
      addToast("Credit risk assessment complete");
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (error) {
      console.error("Prediction error:", error);
      addToast("Prediction failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const ratio = formData.income ? formData.credit / formData.income : 0;
  const prob = result ? (result.default_probability * 100) : 0;
  const riskColor = prob > 65 ? "#ef4444" : prob > 35 ? "#eab308" : "#22c55e";
  const riskLabel = prob > 65 ? "High Risk" : prob > 35 ? "Medium Risk" : "Low Risk";

  const chartData = result ? [
    { name: "Default Probability", value: +prob.toFixed(1), fill: riskColor }
  ] : [];

  const BehaviorToggle = ({ field, label }) => {
    const options = behaviorOptions[field];
    return (
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">{label}</p>
        <div className="flex flex-col gap-1.5">
          {options.map(({ label: optLabel, score, icon: Icon, color }) => {
            const isActive = formData[field] === score;
            const colorClasses = {
              green: { active: "bg-emerald-500 text-white border-emerald-500", inactive: "border-gray-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 text-gray-600 dark:text-gray-300" },
              yellow: { active: "bg-amber-500 text-white border-amber-500", inactive: "border-gray-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-700 text-gray-600 dark:text-gray-300" },
              red: { active: "bg-red-500 text-white border-red-500", inactive: "border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 text-gray-600 dark:text-gray-300" },
            };
            return (
              <button key={optLabel} onClick={() => setFormData(prev => ({ ...prev, [field]: score }))}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  isActive ? colorClasses[color].active : `bg-white dark:bg-slate-700 ${colorClasses[color].inactive}`
                }`}
              >
                <Icon className={`text-sm ${isActive ? "text-white" : `text-${color}-500`}`} />
                {optLabel}
                {isActive && <FaCheckCircle className="ml-auto text-xs" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SEO title="Credit Risk" description="Predict loan default probability with XGBoost and CatBoost ensemble ML models. Analyze income, employment, and payment history." path="/credit-risk" />
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Credit Risk Prediction</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ML-based Loan Default Risk Assessment</p>
        </div>
        {result && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            riskLabel === "Low Risk" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
            riskLabel === "Medium Risk" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
            "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}>{riskLabel}</span>
        )}
      </div>

      {/* INFO TOGGLE */}
      <motion.button
        onClick={() => setShowInfo(!showInfo)}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <FaInfoCircle className="text-lg" />
        <span>Know about Credit Risk & Our Model</span>
        <motion.div animate={{ rotate: showInfo ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FaChevronDown className="text-lg" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.div
            key="credit-info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: infoHeight }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div ref={infoRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 space-y-6">

              {/* What is Credit Risk */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FaCreditCard className="text-emerald-600 dark:text-emerald-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">What is Credit Risk?</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                  Credit Risk is the possibility that a borrower may fail to repay a loan or meet their financial obligations. 
                  Our ML model predicts this probability based on financial history, personal profile, and behavioral patterns.
                </p>
                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Default Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Borrower fails to repay entirely</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Delinquency Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payments delayed beyond grace period</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Exposure Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Potential loss amount if default occurs</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-slate-700" />

              {/* The Model */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FaChartBar className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Our ML Model: XGBoost + CatBoost Ensemble</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                  We use a hybrid ensemble of <span className="font-semibold text-blue-600 dark:text-blue-400">XGBoost</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">CatBoost</span> — 
                  two state-of-the-art gradient boosting algorithms. Each model independently predicts the default probability, 
                  and the final score is a weighted combination for maximum accuracy.
                </p>
                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-2">XGBoost</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Handles missing data automatically</li>
                      <li>• Great with numerical features (income, ratios)</li>
                      <li>• Built-in regularization prevents overfitting</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm mb-2">CatBoost</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Excellently handles categorical features (gender, education)</li>
                      <li>• Ordered boosting reduces target leakage</li>
                      <li>• Robust to noisy real-world financial data</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-slate-700" />

              {/* How Inputs Affect Risk */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">How Your Inputs Affect Risk</h3>
                </div>
                <div className="mt-4 ml-11 space-y-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                    <p className="font-semibold text-green-700 dark:text-green-300 text-sm mb-2">Reduces Risk ✓</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span>• Higher income → lower debt burden</span>
                      <span>• Longer employment → job stability</span>
                      <span>• Always on-time bill payments</span>
                      <span>• Regular savings habit</span>
                      <span>• Owns house → asset stability</span>
                      <span>• Higher education → earning potential</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                    <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-2">Increases Risk ✗</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span>• High loan-to-income ratio (&gt;5x)</span>
                      <span>• Short/no employment history</span>
                      <span>• History of late payments</span>
                      <span>• No savings or irregular savings</span>
                      <span>• Previous loan defaults</span>
                      <span>• Lower education level</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-slate-700" />

              {/* Interpreting Results */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Interpreting Your Results</h3>
                </div>
                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border ${prob <= 35 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <p className="font-semibold text-green-700 dark:text-green-300">Low Risk (&lt; 35%)</p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Borrower appears financially stable. High likelihood of on-time repayment. Standard lending terms apply.</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${prob > 35 && prob <= 65 ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 ring-2 ring-yellow-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <p className="font-semibold text-yellow-700 dark:text-yellow-300">Medium Risk (35-65%)</p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Some risk indicators present. Consider tighter terms, higher interest rates, or additional collateral.</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${prob > 65 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-2 ring-red-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <p className="font-semibold text-red-700 dark:text-red-300">High Risk (&gt; 65%)</p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Significant default risk. Recommend enhanced due diligence, secured lending, or declining the application.</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* FORM - 3 cols */}
        <div className="lg:col-span-3 space-y-6">

          {/* BASIC FINANCIAL */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaMoneyBillWave className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Financial Profile</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Income (₹): {formData.income.toLocaleString()}</label>
                <input type="range" name="income" min="50000" max="1000000" step="10000" value={formData.income} onChange={handleChange} className="w-full mt-2 accent-blue-600" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Higher income → lower default risk</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Loan Amount (₹)</label>
                <input name="credit" type="number" value={formData.credit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
                <p className={`text-xs mt-1 font-medium ${ratio > 5 ? "text-red-500" : ratio > 2 ? "text-yellow-500" : "text-green-500"}`}>Loan/Income: {ratio.toFixed(1)}x</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Age: {formData.age}</label>
                <input type="range" name="age" min="18" max="70" value={formData.age} onChange={handleChange} className="w-full mt-2 accent-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Employment Years</label>
                <input name="employment_years" type="number" value={formData.employment_years} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
            </div>
          </div>

          {/* FINANCIAL BEHAVIOR */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FaChartBar className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Financial Behavior</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BehaviorToggle field="ext1" label="Bill Payment" />
              <BehaviorToggle field="ext2" label="Savings Habit" />
              <BehaviorToggle field="ext3" label="Loan Experience" />
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaUserTie className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Personal Information</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { key: "gender", values: ["Male", "Female"], icons: [<FaMale />, <FaFemale />] },
                { key: "owns_car", values: ["Yes", "No"], icons: [<FaCar />, <FaCar className="opacity-50" />] },
                { key: "owns_house", values: ["Yes", "No"], icons: [<FaHome />, <FaHome className="opacity-50" />] }
              ].map(({ key, values, icons }) => (
                <div key={key}>
                  <p className="text-sm mb-2 capitalize text-gray-700 dark:text-gray-200">{key.replace("_", " ")}</p>
                  <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                    {values.map((val, i) => (
                      <button key={val} onClick={() => setFormData(prev => ({ ...prev, [key]: val }))}
                        className={`flex-1 py-2 flex items-center justify-center gap-1 text-sm ${formData[key] === val ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-200"}`}>
                        {icons[i]} {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Higher education", "Incomplete higher", "Secondary / secondary special", "Lower secondary"].map((edu) => (
                <button key={edu} onClick={() => setFormData(prev => ({ ...prev, education: edu }))}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm ${formData.education === edu ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:border-blue-300"}`}>
                  <FaGraduationCap /> {edu}
                </button>
              ))}
            </div>
          </div>

          <button onClick={predictRisk} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing Credit Risk...</>
            ) : (
              <><FaBolt className="text-lg" /> Predict Default Risk</>
            )}
          </button>
        </div>

        {/* RIGHT PANEL - 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* HISTORY */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaHistory className="text-gray-500" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Recent Predictions</h3>
            </div>
            {history.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.predicted_at).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{(h.risk_score * 100).toFixed(1)}%</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      h.risk_label === 'High Risk' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      h.risk_label === 'Medium Risk' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>{h.risk_label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaHistory className="text-3xl" />}
                title="No predictions yet"
                description="Fill the form and click Predict to see your credit risk assessment history here."
              />
            )}
          </div>

          {result ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Default Probability</p>
                    <h2 className="text-2xl font-bold" style={{ color: riskColor }}>{prob.toFixed(2)}%</h2>
                  </div>
                  <FaExclamationTriangle className="text-2xl opacity-60" style={{ color: riskColor }} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Risk Level</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{riskLabel}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Risk Assessment</h3>
                <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ width: "100%" }} />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(prob, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${Math.min(prob, 100)}%` }}
                  >
                    <div className="w-5 h-5 bg-white dark:bg-gray-200 border-2 border-gray-400 rounded-full shadow-md" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>0% Low</span><span>35%</span><span>65%</span><span>100% High</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-lg ${prob <= 35 ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-green-600 dark:text-green-400">Low Risk</span><p className="text-gray-400">&lt; 35%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${prob > 35 && prob <= 65 ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Medium</span><p className="text-gray-400">35-65%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${prob > 65 ? "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-red-600 dark:text-red-400">High Risk</span><p className="text-gray-400">&gt; 65%</p>
                  </div>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Probability Breakdown</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" width={100} />
                      <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow border border-gray-200 dark:border-slate-600 text-xs"><span className="font-medium" style={{ color: riskColor }}>{payload[0].value}%</span></div> : null} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                        <Cell fill={riskColor} />
                        <LabelList dataKey="value" position="right" fontSize={12} fontWeight={700} fill="#6b7280" formatter={(v) => `${v}%`} />
                      </Bar>
                      <ReferenceLine x={35} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />
                      <ReferenceLine x={65} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow text-center text-gray-400 dark:text-gray-500 h-full flex items-center justify-center">
              <div>
                <FaChartLine className="text-4xl mx-auto mb-3 opacity-40" />
                <p className="text-sm">Run prediction to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
