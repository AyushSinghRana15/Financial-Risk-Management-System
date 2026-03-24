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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    const data = {
      reassignment_count: Number(form.reassignment_count),
      reopen_count: Number(form.reopen_count),
      sys_mod_count: Number(form.sys_mod_count),
      active: form.active,
      made_sla: form.made_sla
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

      <h2>⚙️ Operational Risk Analytics</h2>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>

        {/* LEFT */}
        <div style={{
          flex: 1,
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>

          <h3>Input Parameters</h3>

          <label>🔁 Reassignment Count</label>
          <input type="number" name="reassignment_count" value={form.reassignment_count} onChange={handleChange} />

          <label>🔄 Reopen Count</label>
          <input type="number" name="reopen_count" value={form.reopen_count} onChange={handleChange} />

          <label>🛠️ System Modification Count</label>
          <input type="number" name="sys_mod_count" value={form.sys_mod_count} onChange={handleChange} />

          <label>🟢 Active</label>
          <select name="active" value={form.active} onChange={handleChange}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <label>⏱️ Made SLA</label>
          <select name="made_sla" value={form.made_sla} onChange={handleChange}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <button onClick={handlePredict}>
            {loading ? "Predicting..." : "🔍 Predict Risk"}
          </button>

        </div>

        {/* RIGHT */}
        <div style={{
          flex: 1,
          background: "#fff",
          padding: "20px",
          borderRadius: "10px"
        }}>

          <h3>Risk Analysis</h3>

          {!result ? (
            <p>Run prediction to see results</p>
          ) : (
            <>
              <h3 style={{
                color: result.prediction === 1 ? "red" : "green"
              }}>
                {result.risk_level}
              </h3>

              <p>Low: {(result.probabilities.low * 100).toFixed(2)}%</p>
              <p>High: {(result.probabilities.high * 100).toFixed(2)}%</p>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
