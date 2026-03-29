import { useState, useEffect } from "react";
import axios from "axios";

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

  useEffect(() => {
    if (userEmail) {
      axios.get(`http://127.0.0.1:8000/financial/history?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: parseFloat(value) });
  };

  const predict = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/financial/predict",
        { ...form, email: userEmail }
      );
      setResult(res.data);
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (err) {
      console.error(err);
      alert("API Error");
    }
  };

  const fields = [
    { key: "ROA", min: -0.05, max: 0.55 },
    { key: "Leverage", min: 0.02, max: 1.2 },
    { key: "Asset_Turnover", min: 0.6, max: 5.0 },
    { key: "Gross_Profit_Liabilities", min: -1.0, max: 50.0 },
    { key: "Operating_Profit", min: -1.0, max: 100.0 }
  ];

  return (
    <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Financial Risk System</h1>
          <h3 className="text-gray-600 dark:text-gray-400 mb-6">Enter Financial Data</h3>

          {fields.map(({ key, min, max }) => (
            <div key={key} className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key} ({min} to {max})
                </label>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{form[key].toFixed(2)}</span>
              </div>

              <input
                type="range"
                min={min}
                max={max}
                step="0.01"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full mb-2 accent-blue-600"
              />

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => handleChange(key, form[key] - 0.01)}
                  className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >-</button>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{form[key].toFixed(2)}</span>
                <button 
                  onClick={() => handleChange(key, form[key] + 0.01)}
                  className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >+</button>
              </div>
            </div>
          ))}

          <button
            onClick={predict}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors mt-4"
          >
            Predict
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
            <div className="flex justify-between mb-4 text-gray-700 dark:text-gray-200">
              <p className="font-medium">Probability: <span className="text-blue-600 dark:text-blue-400">{Number(result.probability).toFixed(2)}</span></p>
              <p className="font-medium">Threshold: <span className="text-purple-600 dark:text-purple-400">{result.threshold}</span></p>
            </div>

            <div className={`p-4 rounded-xl font-bold text-center ${
              result.result === "Financially Strong Company"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}>
              {result.result}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mt-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Recent Predictions</h3>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.recorded_at).toLocaleDateString()}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{(h.risk_score * 100).toFixed(1)}%</span>
                  <span className={`text-sm ${h.risk_label?.includes('Strong') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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

export default FinancialRisk;
