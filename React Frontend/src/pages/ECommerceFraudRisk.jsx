import { useState } from "react";
import { predictFraudRisk } from "../services/api";

export default function ECommerceFraudRisk() {

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
    const data = {
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

    console.log("Sending data:", data); // 🔥 debug

    try {
      const res = await predictFraudRisk(data);
      console.log("Response:", res.data); // 🔥 debug
      setResult(res.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🛒 E-Commerce Fraud Detection
      </h2>

      {/* FORM */}
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
          <label style={{ fontWeight: "bold" }}>{label}</label>
          <input
            type="number"
            name={name}
            value={form[name]}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
        </div>
      ))}

      {/* BUTTON */}
      <button
        onClick={handlePredict}
        style={{
          width: "100%",
          padding: "10px",
          background: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
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
              {result.fraud_probability !== undefined
                ? (result.fraud_probability * 100).toFixed(2)
                : 0}%
            </strong>
          </p>

        </div>
      )}
    </div>
  );
}
