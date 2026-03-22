import { useState } from "react";
import { predictOperationalRisk } from "../services/api";

export default function OperationalRisk() {

    const [reassignment_count, setReassignment] = useState(0);
    const [reopen_count, setReopen] = useState(0);
    const [sys_mod_count, setSysMod] = useState(0);
    const [active, setActive] = useState("No");
    const [made_sla, setSla] = useState("Yes");

    const [result, setResult] = useState(null);

    const handlePredict = async () => {
        const data = {
            reassignment_count,
            reopen_count,
            sys_mod_count,
            active,
            made_sla
        };

        try {
            const res = await predictOperationalRisk(data);
            setResult(res.data);
        } catch (err) {
            console.error("API Error:", err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>

            <h2>Operational Risk Prediction</h2>

            {/* Inputs */}
            <div>

                <input
                    type="number"
                    placeholder="Reassignment Count"
                    onChange={(e) => setReassignment(Number(e.target.value))}
                />

                <input
                    type="number"
                    placeholder="Reopen Count"
                    onChange={(e) => setReopen(Number(e.target.value))}
                />

                <input
                    type="number"
                    placeholder="System Modification Count"
                    onChange={(e) => setSysMod(Number(e.target.value))}
                />

                <select onChange={(e) => setActive(e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                </select>

                <select onChange={(e) => setSla(e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                </select>

                <br /><br />

                <button onClick={handlePredict}>Predict</button>
            </div>

            {/* Output */}
            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Risk Level: {result.risk_level}</h3>
                    <p>Low: {result.probabilities.low}</p>
                    <p>Medium: {result.probabilities.medium}</p>
                    <p>High: {result.probabilities.high}</p>
                </div>
            )}

        </div>
    );
}