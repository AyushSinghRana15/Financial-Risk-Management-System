import { useState } from "react";
import { predictOperationalRisk } from "../services/api";

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
      console.error("API Error:", err);
      alert("Error fetching prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h2 style={{ marginBottom: "20px" }}>
        ⚙️ Operational Risk Analytics
      </h2>

      <div style={{
        display: "flex",
        gap: "30px",
        flexWrap: "wrap"
      }}>

        {/* LEFT CARD */}
        <div style={{
          flex: 1,
          minWidth: "300px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>

          <h3 style={{ marginBottom: "15px" }}>
            Input Parameters
          </h3>

          {/* Reassignment */}
          <div style={{ marginBottom: "15px" }}>
            <label><b>🔁 Reassignment Count</b></label><br />
            <small style={{ color: "gray" }}>
              Number of times task was reassigned
            </small>
            <input
              type="number"
              name="reassignment_count"
              value={form.reassignment_count}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
            />
          </div>

          {/* Reopen */}
          <div style={{ marginBottom: "15px" }}>
            <label><b>🔄 Reopen Count</b></label><br />
            <small style={{ color: "gray" }}>
              Number of times task was reopened
            </small>
            <input
              type="number"
              name="reopen_count"
              value={form.reopen_count}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
            />
          </div>

          {/* System Modification */}
          <div style={{ marginBottom: "15px" }}>
            <label><b>⚙️ System Modification</b></label><br />
            <small style={{ color: "gray" }}>
              Whether system changes were made
            </small>
            <select
              name="system_modification"
              value={form.system_modification}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
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
              padding: "12px",
              background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            {loading ? "Predicting..." : "🔍 Predict Risk"}
          </button>

        </div>

        {/* RIGHT CARD */}
        <div style={{
          flex: 1,
          minWidth: "300px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>

          <h3>Risk Analysis</h3>

          {!result ? (
            <p style={{ color: "gray" }}>
              Run prediction to see results
            </p>
          ) : (

            <div>

              {/* Risk Label */}
              <div style={{
                padding: "10px",
                borderRadius: "6px",
                backgroundColor:
                  result.prediction === 1 ? "#ffe5e5" : "#e6ffe6",
                marginBottom: "15px"
              }}>
                <b style={{
                  color: result.prediction === 1 ? "red" : "green"
                }}>
                  {result.risk_level}
                </b>
              </div>

              {/* Probabilities */}
              <div>
                <p><b>📊 Risk Probabilities:</b></p>

                <p>
                  🔴 High: {(result.probabilities.high * 100).toFixed(2)}%
                </p>

                {result.probabilities.medium !== undefined && (
                  <p>
                    🟠 Medium: {(result.probabilities.medium * 100).toFixed(2)}%
                  </p>
                )}

                <p>
                  🟢 Low: {(result.probabilities.low * 100).toFixed(2)}%
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
