import { useState } from "react";
import { predictFraudRisk } from "../services/api";

export default function ECommerceFraudRisk() {

  const [amount, setAmount] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [productCategory, setProductCategory] = useState("Electronics");
  const [location, setLocation] = useState("USA");
  const [device, setDevice] = useState("Mobile");
  const [age, setAge] = useState(30);
  const [accountAge, setAccountAge] = useState(200);
  const [hour, setHour] = useState(12);
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(6);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

const handlePredict = async () => {
  const data = {
    "Account Age Days": accountAge,
    "Transaction Hour": hour,
    "Transaction Amount": amount,
    "Customer Location": mapLocation(location),
    "Payment Method": mapPayment(paymentMethod),
    "Transaction_Month": month,
    "Customer Age": age,
    "Transaction_Day": day,
    "Device Used": mapDevice(device),
    "Quantity": quantity
  };

  try {
    setLoading(true);
    const res = await predictFraudRisk(data);
    setResult(res.data);
  } catch (err) {
    console.error("API Error:", err);
  } finally {
    setLoading(false);
  }
};
  

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>🛒 E-Commerce Fraud Detection</h2>

      {/* Inputs */}
      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Transaction Amount" /><br /><br />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="Quantity" /><br /><br />

      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option>Credit Card</option>
        <option>Debit Card</option>
        <option>PayPal</option>
        <option>Bank Transfer</option>
      </select><br /><br />

      <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
        <option>Electronics</option>
        <option>Clothing</option>
        <option>Home</option>
        <option>Beauty</option>
      </select><br /><br />

      <select value={location} onChange={(e) => setLocation(e.target.value)}>
        <option>USA</option>
        <option>UK</option>
        <option>India</option>
        <option>Germany</option>
      </select><br /><br />

      <select value={device} onChange={(e) => setDevice(e.target.value)}>
        <option>Mobile</option>
        <option>Desktop</option>
        <option>Tablet</option>
      </select><br /><br />

      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} placeholder="Customer Age" /><br /><br />
      <input type="number" value={accountAge} onChange={(e) => setAccountAge(Number(e.target.value))} placeholder="Account Age (days)" /><br /><br />

      <input type="number" value={hour} onChange={(e) => setHour(Number(e.target.value))} placeholder="Transaction Hour" /><br /><br />
      <input type="number" value={day} onChange={(e) => setDay(Number(e.target.value))} placeholder="Transaction Day" /><br /><br />
      <input type="number" value={month} onChange={(e) => setMonth(Number(e.target.value))} placeholder="Transaction Month" /><br /><br />

      {/* Button */}
      <button onClick={handlePredict} style={{ width: "100%", padding: "10px", fontSize: "16px" }}>
        {loading ? "Predicting..." : "🔍 Predict Fraud"}
      </button>

      {/* Output */}
      {result && (
        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px",
          backgroundColor: result.prediction === 1 ? "#ffe5e5" : "#e6ffe6" }}>

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
    </div>
  );
}
