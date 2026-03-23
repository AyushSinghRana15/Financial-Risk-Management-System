import { useState } from "react";
import { predictFraudRisk } from "../services/api";

export default function ECommerceFraudRisk() {

  const [form, setForm] = useState({
    amount: 100,
    quantity: 1,
    paymentMethod: "Credit Card",
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    const data = {
      "Account Age Days": Number(form.accountAge),
      "Transaction Hour": Number(form.hour),
      "Transaction Amount": Number(form.amount),
      "Customer Location": 1,
      "Payment Method": 2,
      "Transaction_Month": Number(form.month),
      "Customer Age": Number(form.age),
      "Transaction_Day": Number(form.day),
      "Device Used": 1,
      "Quantity": Number(form.quantity)
    };

    const res = await predictFraudRisk(data);
    setResult(res.data);
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
        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px",
          backgroundColor: result.prediction === 1 ? "#ffe5e5" : "#e6ffe6" }}>

          <h3 style={{ color: result.prediction === 1 ? "red" : "green" }}>
            {result.label}
          </h3>

          <p>
            Fraud Probability:{" "}
            <strong>{(result.fraud_probability * 100).toFixed(2)}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}
