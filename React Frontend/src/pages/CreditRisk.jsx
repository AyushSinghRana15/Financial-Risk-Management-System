import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import { FaMale, FaFemale, FaCar, FaHome, FaGraduationCap, FaInfoCircle, FaChevronDown, FaShieldAlt, FaCreditCard, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaThumbsUp, FaMoneyBillWave, FaUserTie, FaChartBar, FaHistory, FaSync, FaBolt, FaUsers, FaChild, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

export default function CreditRisk() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || "";
  const infoRef = useRef(null);
  const [infoHeight, setInfoHeight] = useState(0);

  const [formData, setFormData] = useState({
    email: userEmail,
    income: 150000,
    credit: 300000,
    annuity: 20000,
    goods_price: 250000,
    children: 0,
    age: 35,
    employment_years: 5,
    ext1: 0.5,
    ext2: 0.5,
    ext3: 0.5,
    family_members: 2,
    bureau_year: 0,
    bureau_week: 0,
    bureau_month: 0,
    def30: 0,
    def60: 0,
    gender: "Male",
    owns_car: "Yes",
    owns_house: "Yes",
    education: "Higher education"
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (error) {
      console.error("Prediction error:", error);
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6">

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
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FaCreditCard className="text-emerald-600 dark:text-emerald-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">What is Credit Risk?</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                  Credit Risk is the possibility that a borrower may fail to repay a loan or meet their financial obligations. Lenders assess this risk to determine whether to approve a loan and at what interest rate.
                </p>
                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Default Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Borrower fails to repay</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Late Payment Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delays in repayment</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Recovery Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty in recovering funds</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-slate-700" />
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FaChartLine className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">How Our Model Works</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                  We use a sophisticated <span className="font-semibold text-blue-600 dark:text-blue-400">CatBoost Machine Learning model</span> trained on over 300,000 loan applications to predict the likelihood of default.
                </p>
                <div className="mt-4 ml-11 space-y-3">
                  {[
                    ["Financial Profile Analysis", "Income, loan amount, annuity, and financial ratios are evaluated"],
                    ["External Credit Scores", "Payment behavior, savings habits, and past loan performance"],
                    ["Risk Probability Calculation", "ML model combines all factors to predict default probability"]
                  ].map(([title, desc], i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">{i + 1}</div>
                      <div><p className="font-medium text-gray-800 dark:text-gray-200">{title}</p><p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-slate-700" />
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Understanding the Probability Score</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">The probability score (0-100%) represents the likelihood that the applicant will default on their loan. <span className="font-semibold text-purple-600 dark:text-purple-400">Lower scores indicate better creditworthiness.</span></p>
                <div className="mt-4 ml-11 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <div><p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Example: 15% Default Probability</p><p className="text-sm text-gray-600 dark:text-gray-300 mt-1">This means there is a <span className="font-bold text-purple-600 dark:text-purple-400">15% chance</span> that the borrower may default on their loan obligations.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* FORM - 3 columns */}
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
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Loan Annuity (₹)</label>
                <input name="annuity" type="number" value={formData.annuity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Goods Price (₹)</label>
                <input name="goods_price" type="number" value={formData.goods_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Age: {formData.age}</label>
                <input type="range" name="age" min="18" max="70" value={formData.age} onChange={handleChange} className="w-full mt-2 accent-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Employment Years</label>
                <input name="employment_years" type="number" value={formData.employment_years} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <FaChild className="text-xs" /> Children: {formData.children}
                </label>
                <input type="range" name="children" min="0" max="10" value={formData.children} onChange={handleChange} className="w-full mt-2 accent-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <FaUsers className="text-xs" /> Family Members: {formData.family_members}
                </label>
                <input type="range" name="family_members" min="1" max="10" value={formData.family_members} onChange={handleChange} className="w-full mt-2 accent-blue-600" />
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
              <div>
                <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Bill Payment</p>
                <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                  {["Always on time", "Sometimes late", "Often late"].map((val) => {
                    const score = val === "Always on time" ? 0.8 : val === "Sometimes late" ? 0.5 : 0.2;
                    return (
                      <button key={val} onClick={() => setFormData(prev => ({ ...prev, ext1: score }))}
                        className={`flex-1 py-2 text-sm transition ${formData.ext1 === score ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"}`}>{val}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Savings Habit</p>
                <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                  {["Regular savings", "Occasional", "No savings"].map((val) => {
                    const score = val === "Regular savings" ? 0.8 : val === "Occasional" ? 0.5 : 0.2;
                    return (
                      <button key={val} onClick={() => setFormData(prev => ({ ...prev, ext2: score }))}
                        className={`flex-1 py-2 text-sm transition ${formData.ext2 === score ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"}`}>{val}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Loan Experience</p>
                <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                  {["Managed loans well", "No loans", "Defaulted before"].map((val) => {
                    const score = val === "Managed loans well" ? 0.8 : val === "No loans" ? 0.5 : 0.2;
                    return (
                      <button key={val} onClick={() => setFormData(prev => ({ ...prev, ext3: score }))}
                        className={`flex-1 py-2 text-sm transition ${formData.ext3 === score ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"}`}>{val}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* BUREAU & CREDIT HISTORY */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FaExclamationCircle className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">Bureau & Credit History</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Days Since Last Bureau Inquiry</label>
                <input name="bureau_year" type="number" value={formData.bureau_year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Week Since Last Inquiry</label>
                <input name="bureau_week" type="number" value={formData.bureau_week} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Month Since Last Inquiry</label>
                <input name="bureau_month" type="number" value={formData.bureau_month} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Days Overdue &lt; 30</label>
                <input name="def30" type="number" value={formData.def30} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Days Overdue &gt; 60</label>
                <input name="def60" type="number" value={formData.def60} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" />
              </div>
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

        {/* RESULTS - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow text-center text-gray-400 dark:text-gray-500 h-full flex items-center justify-center">
              <div><FaChartLine className="text-4xl mx-auto mb-3 opacity-50" /><p>Run prediction to see results</p></div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
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

              {/* RISK GAUGE */}
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
                  <span>0% Low</span>
                  <span>35%</span>
                  <span>65%</span>
                  <span>100% High</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-lg ${prob <= 35 ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-green-600 dark:text-green-400">Low Risk</span>
                    <p className="text-gray-400">&lt; 35%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${prob > 35 && prob <= 65 ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Medium</span>
                    <p className="text-gray-400">35-65%</p>
                  </div>
                  <div className={`p-2 rounded-lg ${prob > 65 ? "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-slate-700/50"}`}>
                    <span className="font-semibold text-red-600 dark:text-red-400">High Risk</span>
                    <p className="text-gray-400">&gt; 65%</p>
                  </div>
                </div>
              </div>

              {/* BAR CHART */}
              {chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Probability Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
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
          )}

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
                    <span className="font-medium text-gray-800 dark:text-gray-100">{(h.risk_score * 100).toFixed(1)}%</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      h.risk_label === 'High Risk' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      h.risk_label === 'Medium Risk' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>{h.risk_label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
