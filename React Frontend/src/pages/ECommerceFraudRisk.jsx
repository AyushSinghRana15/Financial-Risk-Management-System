import { useState, useEffect } from "react";
import axios from "axios";

export default function ECommerceFraudRisk() {

  const userEmail = localStorage.getItem('user') || "";
  
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
      axios.get(`http://localhost:8000/fraud_history?email=${encodeURIComponent(userEmail)}`)
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
      const res = await axios.post("http://localhost:8000/predict_fraud", data);
      setResult(res.data);
      window.dispatchEvent(new Event("refreshDashboard"));
    } catch (error) {
      console.error(error);
    }
  };

  // 🎨 Styles (Streamlit-like clean UI)
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  };

  const containerStyle = {
    maxWidth: "500px",
    margin: "auto",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  };

  return (
    <div style={containerStyle}>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🛒 E-Commerce Fraud Detection
      </h2>

      {/* NUMBER INPUTS */}
      {[
        ["Transaction Amount", "amount"],
        ["Quantity", "quantity"],
        ["Customer Age", "age"],
        ["Account Age (days)", "accountAge"],
        ["Transaction Hour", "hour"],
        ["Transaction Day", "day"],
        ["Transaction Month", "month"]
      ].map(([label, name]) => (
        <div key={name} style={{ marginBottom: "15px" }}>
          <label><b>{label}</b></label>
          <input
            type="number"
            name={name}
            value={form[name]}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      ))}

      {/* DROPDOWNS */}

      <div style={{ marginBottom: "15px" }}>
        <label><b>Payment Method</b></label>
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={inputStyle}>
          <option>Credit Card</option>
          <option>Debit Card</option>
          <option>PayPal</option>
          <option>Bank Transfer</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label><b>Product Category</b></label>
        <select name="productCategory" value={form.productCategory} onChange={handleChange} style={inputStyle}>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Home</option>
          <option>Beauty</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label><b>Customer Location</b></label>
        <select name="location" value={form.location} onChange={handleChange} style={inputStyle}>
          <option>USA</option>
          <option>UK</option>
          <option>India</option>
          <option>Germany</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label><b>Device Used</b></label>
        <select name="device" value={form.device} onChange={handleChange} style={inputStyle}>
          <option>Mobile</option>
          <option>Desktop</option>
          <option>Tablet</option>
        </select>
      </div>

      {/* BUTTON */}
      <button onClick={handlePredict} style={buttonStyle}>
        🔍 Predict Fraud
      </button>

      {/* RESULT */}
      {result && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          backgroundColor: result.prediction === 1 ? "#ffe5e5" : "#e6ffe6"
        }}>
          <h3 style={{ color: result.prediction === 1 ? "red" : "green" }}>
            {result.label}
          </h3>
          <p>
            Fraud Probability:{" "}
            <strong>
              {(result.fraud_probability * 100).toFixed(2)}%
            </strong>
          </p>
        </div>
      )}

      {/* Recent Predictions */}
      {history.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Recent Predictions</h3>
          {history.map(h => (
            <div key={h.id} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              padding: "10px", 
              marginBottom: "5px", 
              background: "#f8f9fa",
              borderRadius: "5px"
            }}>
              <span style={{ fontSize: 12 }}>{new Date(h.predicted_at).toLocaleDateString()}</span>
              <span>${h.amount}</span>
              <span>{h.label}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
