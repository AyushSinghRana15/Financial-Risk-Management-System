import { useState, useEffect } from "react";
import axios from "axios";
import { FaMale, FaFemale, FaCar, FaHome, FaGraduationCap } from "react-icons/fa";

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

    useEffect(() => {
        if (userEmail) {
            axios.get(`http://localhost:8000/credit_predictions?email=${encodeURIComponent(userEmail)}`)
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
                "http://127.0.0.1:8000/predict_credit_risk",
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

            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Credit Risk Prediction</h1>

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