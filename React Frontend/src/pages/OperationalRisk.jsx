import { useState } from "react";
import { predictOperationalRisk } from "../services/api";

export default function OperationalRisk() {

  const [form, setForm] = useState({
    reassignment_count: 2,
    reopen_count: 1,
    system_modification: "No"
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    const data = {
      "Reassignment Count": Number(form.reassignment_count),
      "Reopen Count": Number(form.reopen_count),
      "System Modification": form.system_modification === "Yes" ? 1 : 0
    };

    const res = await predictOperationalRisk(data);
    setResult(res.data);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        ⚙️ Operational Risk Prediction
      </h2>

      {/* Reassignment Count */}
      <div style={{ marginBottom: "15px" }}>
        <label><b>Reassignment Count</b></label>
        <input
          type="number"
          name="reassignment_count"
          value={form.reassignment_count}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* Reopen Count */}
      <div style={{ marginBottom: "15px" }}>
        <label><b>Reopen Count</b></label>
        <input
          type="number"
          name="reopen_count"
          value={form.reopen_count}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* System Modification */}
      <div style={{ marginBottom: "15px" }}>
        <label><b>System Modification</b></label>
        <select
          name="system_modification"
          value={form.system_modification}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        >
          <option>No</option>
          <option>Yes</option>
        </select>
      </div>

      {/* Button */}
      <button
        onClick={handlePredict}
        style={{
          width: "100%",
          padding: "10px",
          background: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}
      >
        🔍 Predict Risk
      </button>

      {/* Result */}
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
            Risk Probability:{" "}
            <strong>{(result.risk_probability * 100).toFixed(2)}%</strong>
          </p>
        </div>
      )}

    </div>
  );
}
