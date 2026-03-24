import { useState } from "react";
import { predictOperationalRisk } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function OperationalRisk() {

  const [form, setForm] = useState({
    reassignment_count: 2,
    reopen_count: 1,
    system_modification: "No"
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    const data = {
      "Reassignment Count": Number(form.reassignment_count),
      "Reopen Count": Number(form.reopen_count),
      "System Modification": form.system_modification === "Yes" ? 1 : 0
    };

    try {
      setLoading(true);
      const res = await predictOperationalRisk(data);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Chart Data
  const chartData = result
    ? [
        { name: "High", value: result.probabilities.high },
        { name: "Medium", value: result.probabilities.medium },
        { name: "Low", value: result.probabilities.low }
      ]
    : [];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  return (
    <div style={{ padding: "30px" }}>

      <h2 style={{ marginBottom: "20px" }}>
        ⚙️ Operational Risk Analytics
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}>

        {/* LEFT: FORM */}
        <div style={cardStyle}>
          <h3>Input Parameters</h3>

          <input
            type="number"
            name="reassignment_count"
            value={form.reassignment_count}
            onChange={handleChange}
            placeholder="Reassignment Count"
            style={inputStyle}
          />

          <input
            type="number"
            name="reopen_count"
            value={form.reopen_count}
            onChange={handleChange}
            placeholder="Reopen Count"
            style={inputStyle}
          />

          <select
            name="system_modification"
            value={form.system_modification}
            onChange={handleChange}
            style={inputStyle}
          >
            <option>No</option>
            <option>Yes</option>
          </select>

          <button onClick={handlePredict} style={buttonStyle}>
            {loading ? "Predicting..." : "🔍 Predict Risk"}
          </button>
        </div>

        {/* RIGHT: RESULT */}
        <div style={cardStyle}>
          <h3>Risk Analysis</h3>

          {!result && <p style={{ color: "#999" }}>No prediction yet</p>}

          {result && (
            <>
              {/* Risk Badge */}
              <div style={{
                padding: "10px",
                textAlign: "center",
                borderRadius: "8px",
                marginBottom: "15px",
                fontWeight: "bold",
                background:
                  result.prediction === 1 ? "#ffe5e5" : "#e6ffe6",
                color:
                  result.prediction === 1 ? "red" : "green"
              }}>
                {result.risk_level}
              </div>

              {/* PIE CHART */}
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      outerRadius={80}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Values */}
              <div style={{ marginTop: "15px" }}>
                <p>🔴 High: {(result.probabilities.high * 100).toFixed(2)}%</p>
                <p>🟡 Medium: {(result.probabilities.medium * 100).toFixed(2)}%</p>
                <p>🟢 Low: {(result.probabilities.low * 100).toFixed(2)}%</p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* Styles */

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer"
};
