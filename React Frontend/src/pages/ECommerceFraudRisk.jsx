import { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    if (userEmail) {
      axios.get(`${API_ENDPOINTS.RISK.FRAUD}/history?email=${encodeURIComponent(userEmail)}`)
        .then(res => setHistory(res.data.history || []))
        .catch(console.error);
    }
  }, [userEmail, result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
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
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      <div className="max-w-xl mx-auto">
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
            E-Commerce Fraud Detection
          </h2>

          {/* NUMBER INPUTS */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              ["Transaction Amount", "amount"],
              ["Quantity", "quantity"],
              ["Customer Age", "age"],
              ["Account Age (days)", "accountAge"],
              ["Transaction Hour", "hour"],
              ["Transaction Day", "day"],
              ["Transaction Month", "month"]
            ].map(([label, name]) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"><b>{label}</b></label>
                <input
                  type="number"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* DROPDOWNS */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"><b>Payment Method</b></label>
              <select 
                name="paymentMethod" 
                value={form.paymentMethod} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>PayPal</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"><b>Product Category</b></label>
              <select 
                name="productCategory" 
                value={form.productCategory} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home</option>
                <option>Beauty</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"><b>Customer Location</b></label>
              <select 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>USA</option>
                <option>UK</option>
                <option>India</option>
                <option>Germany</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"><b>Device Used</b></label>
              <select 
                name="device" 
                value={form.device} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Mobile</option>
                <option>Desktop</option>
                <option>Tablet</option>
              </select>
            </div>
          </div>

          {/* BUTTON */}
          <button 
            onClick={handlePredict} 
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors mt-6"
          >
            Predict Fraud
          </button>

          {/* RESULT */}
          {result && (
            <div className={`mt-6 p-5 rounded-xl ${
              result.prediction === 1 
                ? "bg-red-100 dark:bg-red-900/30" 
                : "bg-green-100 dark:bg-green-900/30"
            }`}>
              <h3 className={`text-lg font-bold ${
                result.prediction === 1 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-green-600 dark:text-green-400"
              }`}>
                {result.label}
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mt-2">
                Fraud Probability: <strong>{(result.fraud_probability * 100).toFixed(2)}%</strong>
              </p>
            </div>
          )}

          {/* Recent Predictions */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">Recent Predictions</h3>
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(h.predicted_at).toLocaleDateString()}</span>
                    <span className="text-gray-800 dark:text-gray-200">${h.amount}</span>
                    <span className={`text-sm ${h.label?.includes('Fraud') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                      {h.label}
                    </span>
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
