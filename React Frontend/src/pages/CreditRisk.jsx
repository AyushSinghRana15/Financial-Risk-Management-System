import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaMale, FaFemale, FaCar, FaHome, FaGraduationCap, FaInfoCircle, FaChevronDown, FaShieldAlt, FaCreditCard, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaThumbsUp } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

export default function CreditRisk() {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === "range" || e.target.type === "number"
                ? Number(value)
                : value
        }));
    };

    const predictRisk = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                API_ENDPOINTS.RISK.CREDIT,
                formData
            );

            setResult(response.data);
            window.dispatchEvent(new Event("refreshDashboard"));

        } catch (error) {
            console.error("Prediction error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Loan vs Income Ratio
    const ratio = formData.income ? formData.credit / formData.income : 0;

    return (
        <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">

            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Credit Risk Prediction</h1>

            {/* INFO TOGGLE BUTTON */}
            <motion.button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <FaInfoCircle className="text-lg" />
                <span>Know about Credit Risk & Our Model</span>
                <motion.div
                    animate={{ rotate: showInfo ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaChevronDown className="text-lg" />
                </motion.div>
            </motion.button>

            {/* COLLAPSIBLE INFO SECTION */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 space-y-6">

                            {/* What is Credit Risk */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <FaCreditCard className="text-emerald-600 dark:text-emerald-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">What is Credit Risk?</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Credit Risk is the possibility that a borrower may fail to repay a loan or meet their financial obligations. 
                                    Lenders assess this risk to determine whether to approve a loan and at what interest rate.
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

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* How Our Model Works */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <FaChartLine className="text-blue-600 dark:text-blue-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">How Our Model Works</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    We use a sophisticated <span className="font-semibold text-blue-600 dark:text-blue-400">CatBoost Machine Learning model</span> trained on 
                                    over 300,000 loan applications to predict the likelihood of default.
                                </p>
                                <div className="mt-4 ml-11 space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">1</div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Financial Profile Analysis</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Income, loan amount, annuity, and financial ratios are evaluated</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">2</div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">External Credit Scores</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Payment behavior, savings habits, and past loan performance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">3</div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Risk Probability Calculation</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">ML model combines all factors to predict default probability</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Understanding the Probability Score */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Understanding the Probability Score</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    The probability score (0-100%) represents the likelihood that the applicant will default on their loan. 
                                    <span className="font-semibold text-purple-600 dark:text-purple-400"> Lower scores indicate better creditworthiness.</span>
                                </p>

                                {/* Example Box */}
                                <div className="mt-4 ml-11 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                    <div className="flex items-start gap-3">
                                        <FaExclamationTriangle className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                                                Example: 15% Default Probability
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                This means there is a <span className="font-bold text-purple-600 dark:text-purple-400">15% chance</span> that 
                                                the borrower may default on their loan obligations. Higher education or better external scores would lower this probability.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Tiers */}
                                <div className="mt-4 ml-11">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Risk Classification:</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                                                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-700 dark:text-green-300">Low Risk (Probability &lt; 35%)</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Auto Approved - Excellent creditworthiness</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                                                <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-yellow-700 dark:text-yellow-300">Medium Risk (Probability 35-65%)</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Manual Review - Additional verification may be needed</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                                                <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-red-700 dark:text-red-300">High Risk (Probability &gt; 65%)</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Reject / Verify Further - High default probability</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Key Factors That Affect Your Score */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <FaCreditCard className="text-amber-600 dark:text-amber-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Key Factors That Affect Your Score</h3>
                                </div>
                                <div className="ml-11 space-y-3">
                                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                            External Credit Score (EXT1)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your payment regularity and bill-paying behavior from credit bureaus. Always paying on time = Higher score.</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                            Savings Behavior (EXT2)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your savings habits and financial discipline. Regular savings = Better creditworthiness.</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                            Past Loan Experience (EXT3)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your history with previous loans. Well-managed loans = Lower risk.</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                            Income to Loan Ratio
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lower loan-to-income ratio = More manageable debt burden = Lower risk.</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                            Employment Duration
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Longer employment history indicates stable income, reducing default risk.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Tips to Improve Your Score */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <FaThumbsUp className="text-green-600 dark:text-green-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tips to Improve Your Credit Score</h3>
                                </div>
                                <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Pay all bills on time, every time</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Maintain a low loan-to-income ratio</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-300">Build a consistent savings habit</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Avoid multiple loan applications</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Keep credit utilization below 30%</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <FaCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Maintain stable employment</p>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Amount Safeguard Notice */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-3">
                                    <FaExclamationTriangle className="text-amber-500 dark:text-amber-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                                            Important: Loan Amount Safeguard
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            Loans exceeding <span className="font-bold text-amber-600 dark:text-amber-400">₹1,000,000 (10 Lakhs)</span> receive an additional 
                                            <span className="font-bold text-amber-600 dark:text-amber-400"> +5% risk penalty</span> to account for elevated default exposure. 
                                            Consider this when planning your loan amount.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 space-y-6">

                {/* BASIC INFO */}
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border dark:border-slate-600">
                    <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">Basic Financial Info</h2>

                    <div className="grid grid-cols-2 gap-4">

                        {/* Income */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Monthly Income (₹): {formData.income}
                            </label>
                            <input
                                type="range"
                                name="income"
                                min="50000"
                                max="1000000"
                                step="10000"
                                value={formData.income}
                                onChange={handleChange}
                                className="w-full mt-2"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Higher income → lower default risk
                            </p>
                        </div>

                        {/* 🔥 Loan Amount */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300">
                                Loan Amount Needed (₹)
                            </label>

                            <input
                                name="credit"
                                type="number"
                                value={formData.credit}
                                onChange={handleChange}
                                className="border dark:border-slate-600 p-2 rounded w-full mt-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                            />

                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                How much money do you want to borrow?
                            </p>

                            {/* Ratio Indicator */}
                            <p className={`text-xs mt-1 font-medium ${ratio > 5 ? "text-red-500 dark:text-red-400" :
                                    ratio > 2 ? "text-yellow-500 dark:text-yellow-400" :
                                        "text-green-500 dark:text-green-400"
                                }`}>
                                Loan vs Income: {ratio.toFixed(1)}x
                            </p>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Age: {formData.age}
                            </label>
                            <input
                                type="range"
                                name="age"
                                min="18"
                                max="70"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full mt-2"
                            />
                        </div>

                        {/* Employment */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300">
                                Employment Years
                            </label>
                            <input
                                name="employment_years"
                                type="number"
                                value={formData.employment_years}
                                onChange={handleChange}
                                className="border dark:border-slate-600 p-2 rounded w-full mt-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                            />
                        </div>

                    </div>
                </div>

                {/* FINANCIAL BEHAVIOR */}
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border dark:border-slate-600">
                    <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">Financial Behavior</h2>

                    <div className="grid grid-cols-2 gap-4">

                        {/* Payment */}
                        <div>
                            <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Bill Payment Regularity</p>
                            <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                                {["Always on time", "Sometimes late", "Often late"].map((val) => {
                                    const score =
                                        val === "Always on time" ? 0.8 :
                                            val === "Sometimes late" ? 0.5 : 0.2;

                                    return (
                                        <button
                                            key={val}
                                            onClick={() => setFormData(prev => ({ ...prev, ext1: score }))}
                                            className={`flex-1 py-2 text-sm transition ${formData.ext1 === score
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Savings */}
                        <div>
                            <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Monthly Savings Habit</p>
                            <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                                {["Regular savings", "Occasional", "No savings"].map((val) => {
                                    const score =
                                        val === "Regular savings" ? 0.8 :
                                            val === "Occasional" ? 0.5 : 0.2;

                                    return (
                                        <button
                                            key={val}
                                            onClick={() => setFormData(prev => ({ ...prev, ext2: score }))}
                                            className={`flex-1 py-2 text-sm transition ${formData.ext2 === score
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Loan Experience */}
                        <div>
                            <p className="text-sm mb-2 text-gray-700 dark:text-gray-200">Past Loan Experience</p>
                            <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                                {["No loans", "Managed loans well", "Defaulted before"].map((val) => {
                                    const score =
                                        val === "Managed loans well" ? 0.8 :
                                            val === "No loans" ? 0.5 : 0.2;

                                    return (
                                        <button
                                            key={val}
                                            onClick={() => setFormData(prev => ({ ...prev, ext3: score }))}
                                            className={`flex-1 py-2 text-sm transition ${formData.ext3 === score
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* PERSONAL INFO */}
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border dark:border-slate-600">
                    <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">Personal Info</h2>

                    <div className="grid grid-cols-3 gap-6">

                        {[
                            { key: "gender", values: ["Male", "Female"], icons: [<FaMale />, <FaFemale />] },
                            { key: "owns_car", values: ["Yes", "No"], icons: [<FaCar />, "❌"] },
                            { key: "owns_house", values: ["Yes", "No"], icons: [<FaHome />, "❌"] }
                        ].map(({ key, values, icons }) => (
                            <div key={key}>
                                <p className="text-sm mb-2 capitalize text-gray-700 dark:text-gray-200">{key.replace("_", " ")}</p>
                                <div className="flex bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                                    {values.map((val, i) => (
                                        <button
                                            key={val}
                                            onClick={() => setFormData(prev => ({ ...prev, [key]: val }))}
                                            className={`flex-1 py-2 flex items-center justify-center gap-2 ${formData[key] === val
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-200"
                                                }`}
                                        >
                                            {icons[i]} {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Education */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                            "Higher education",
                            "Incomplete higher",
                            "Secondary / secondary special",
                            "Lower secondary"
                        ].map((edu) => (
                            <button
                                key={edu}
                                onClick={() => setFormData(prev => ({ ...prev, education: edu }))}
                                className={`p-3 rounded-xl border flex items-center gap-2 ${formData.education === edu
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-slate-600 text-gray-600 dark:text-gray-200"
                                    }`}
                            >
                                <FaGraduationCap />
                                {edu}
                            </button>
                        ))}
                    </div>

                </div>

                {/* BUTTON */}
                <button
                    onClick={predictRisk}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl"
                >
                    {loading ? "Analyzing Risk..." : "Predict Default Risk"}
                </button>

                {/* RESULT */}
                {result && (
                    <div className="p-5 bg-white dark:bg-slate-700 rounded-xl shadow">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Prediction Result</h2>

                        <p className="font-bold text-blue-600 dark:text-blue-400">
                            {(result.default_probability * 100).toFixed(2)}%
                        </p>

                        <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-600 rounded-full">
                            <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${result.default_probability * 100}%` }}
                            />
                        </div>

                        <p className="mt-2 text-gray-700 dark:text-gray-200">{result.risk_level}</p>
                    </div>
                )}

                {/* Recent Predictions */}
                {history.length > 0 && (
                    <div className="mt-6 p-5 bg-gray-50 dark:bg-slate-700 rounded-xl">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Recent Predictions</h3>
                        <div className="space-y-2">
                            {history.map(h => (
                                <div key={h.id} className="flex justify-between items-center bg-white dark:bg-slate-600 p-3 rounded-lg shadow-sm">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{new Date(h.predicted_at).toLocaleDateString()}</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-100">{(h.risk_score * 100).toFixed(1)}%</span>
                                    <span className={`text-sm ${h.risk_label === 'High Risk' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                                        {h.risk_label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}