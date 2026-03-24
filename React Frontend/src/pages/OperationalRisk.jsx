import { useState } from "react";
import { predictOperationalRisk } from "../services/api";

export default function OperationalRisk() {

  const [form, setForm] = useState({
    reassignment_count: 2,
    reopen_count: 1,
    sys_mod_count: 1,
    active: "No",
    made_sla: "No"
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await predictOperationalRisk(form);

      console.log("API Response:", res.data);

      // safety check
      if (!res.data || res.data.error) {
        throw new Error(res.data?.error || "Invalid response from server");
      }

      setResult(res.data);

    } catch (err) {
      console.error("Prediction Error:", err);
      setError("⚠️ Failed to fetch prediction. Check backend.");
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
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}>

        {/* LEFT: FORM */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>

          <h3 style={{ marginBottom: "15px" }}>
            Input Parameters
          </h3>

          {/* Inputs */}
          <div style={{ marginBottom: "12px" }}>
            <label>Reassignment Count</label>
            <input type="number" name="reassignment_count"
              value={form.reassignment_count}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Reopen Count</label>
            <input type="number" name="reopen_count"
              value={form.reopen_count}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>System Modification Count</label>
            <input type="number" name="sys_mod_count"
              value={form.sys_mod_count}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Active</label>
            <select name="active"
              value={form.active}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Made SLA</label>
            <select name="made_sla"
              value={form.made_sla}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading
                ? "#9ca3af"
                : "linear-gradient(to right, #2563eb, #1d4ed8)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "⏳ Predicting..." : "🔍 Predict Risk"}
          </button>

          {/* Error */}
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}

        </div>

        {/* RIGHT: RESULT */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>

          <h3>Risk Analysis</h3>

          {!result && !loading && (
            <p style={{ color: "#888" }}>
              Run prediction to see results
            </p>
          )}

          {result && (
            <>
              <h2 style={{
                color: result.prediction === 1 ? "red" : "green"
              }}>
                {result.risk_level || "Unknown"}
              </h2>

              <p>
                <b>Low:</b>{" "}
                {((result?.probabilities?.low ?? 0) * 100).toFixed(2)}%
              </p>

              <p>
                <b>Medium:</b>{" "}
                {((result?.probabilities?.medium ?? 0) * 100).toFixed(2)}%
              </p>

              <p>
                <b>High:</b>{" "}
                {((result?.probabilities?.high ?? 0) * 100).toFixed(2)}%
              </p>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
