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

      if (!res.data || res.data.error) {
        throw new Error(res.data?.error || "Invalid response from server");
      }

      setResult(res.data);

    } catch (err) {
      console.error("Prediction Error:", err);
      setError("Failed to fetch prediction. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Operational Risk Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: FORM */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Input Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">Reassignment Count</label>
              <input 
                type="number" 
                name="reassignment_count"
                value={form.reassignment_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">Reopen Count</label>
              <input 
                type="number" 
                name="reopen_count"
                value={form.reopen_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">System Modification Count</label>
              <input 
                type="number" 
                name="sys_mod_count"
                value={form.sys_mod_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">Active</label>
              <select 
                name="active"
                value={form.active}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">Made SLA</label>
              <select 
                name="made_sla"
                value={form.made_sla}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Predicting..." : "Predict Risk"}
          </button>

          {error && (
            <p className="text-red-500 dark:text-red-400 mt-3 text-sm">
              {error}
            </p>
          )}
        </div>

        {/* RIGHT: RESULT */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Risk Analysis
          </h3>

          {!result && !loading && (
            <p className="text-gray-400 dark:text-gray-500">
              Run prediction to see results
            </p>
          )}

          {result && (
            <div className="space-y-4">
              <h2 className={`text-2xl font-bold ${
                result.prediction === 1 ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"
              }`}>
                {result.risk_level || "Unknown"}
              </h2>

              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <b>Low:</b>{" "}
                  {((result?.probabilities?.low ?? 0) * 100).toFixed(2)}%
                </p>

                <p className="text-gray-700 dark:text-gray-300">
                  <b>Medium:</b>{" "}
                  {((result?.probabilities?.medium ?? 0) * 100).toFixed(2)}%
                </p>

                <p className="text-gray-700 dark:text-gray-300">
                  <b>High:</b>{" "}
                  {((result?.probabilities?.high ?? 0) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
