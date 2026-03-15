import { useState } from "react";
import axios from "axios";

export default function CreditRisk() {

    const [formData, setFormData] = useState({
        income: 150000,
        credit: 300000,
        annuity: 20000,
        goods_price: 250000,
        children: 0,
        age: 35,
        employment_years: 5,
        ext1: 0.5,
        ext2: 0.5,
        ext3: 0.5,
        family_members: 2,
        bureau_year: 0,
        bureau_week: 0,
        bureau_month: 0,
        def30: 0,
        def60: 0,
        gender: "Male",
        owns_car: "Yes",
        owns_house: "Yes",
        education: "Higher education"
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const predictRisk = async () => {

        try {

            setLoading(true);

            const response = await axios.post(
                "http://127.0.0.1:8000/predict_credit_risk",
                formData
            );

            setResult(response.data);

        } catch (error) {

            console.error("Prediction error:", error);

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            <h1 className="text-3xl font-bold mb-6">
                Credit Risk Prediction
            </h1>

            <div className="bg-white shadow-md rounded-xl p-6">

                {/* BASIC INPUTS */}

                <div className="grid grid-cols-2 gap-4">

                    <input name="income" type="number" placeholder="Income"
                        value={formData.income} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="credit" type="number" placeholder="Credit Amount"
                        value={formData.credit} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="annuity" type="number" placeholder="Loan Annuity"
                        value={formData.annuity} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="goods_price" type="number" placeholder="Goods Price"
                        value={formData.goods_price} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="children" type="number" placeholder="Children"
                        value={formData.children} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="age" type="number" placeholder="Age"
                        value={formData.age} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="employment_years" type="number" placeholder="Employment Years"
                        value={formData.employment_years} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="family_members" type="number" placeholder="Family Members"
                        value={formData.family_members} onChange={handleChange}
                        className="border p-2 rounded" />

                </div>

                {/* EXTERNAL SCORES */}

                <h2 className="text-xl font-semibold mt-6 mb-2">
                    External Risk Scores
                </h2>

                <div className="grid grid-cols-3 gap-4">

                    <input name="ext1" type="number" step="0.01"
                        value={formData.ext1} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="ext2" type="number" step="0.01"
                        value={formData.ext2} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="ext3" type="number" step="0.01"
                        value={formData.ext3} onChange={handleChange}
                        className="border p-2 rounded" />

                </div>

                {/* CREDIT BUREAU */}

                <h2 className="text-xl font-semibold mt-6 mb-2">
                    Credit Bureau Information
                </h2>

                <div className="grid grid-cols-3 gap-4">

                    <input name="bureau_year" type="number"
                        value={formData.bureau_year} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="bureau_week" type="number"
                        value={formData.bureau_week} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="bureau_month" type="number"
                        value={formData.bureau_month} onChange={handleChange}
                        className="border p-2 rounded" />

                </div>

                {/* SOCIAL DEFAULTS */}

                <h2 className="text-xl font-semibold mt-6 mb-2">
                    Social Defaults
                </h2>

                <div className="grid grid-cols-2 gap-4">

                    <input name="def30" type="number"
                        value={formData.def30} onChange={handleChange}
                        className="border p-2 rounded" />

                    <input name="def60" type="number"
                        value={formData.def60} onChange={handleChange}
                        className="border p-2 rounded" />

                </div>

                {/* CATEGORICAL INPUTS */}

                <h2 className="text-xl font-semibold mt-6 mb-2">
                    Personal Information
                </h2>

                <div className="grid grid-cols-3 gap-4">

                    <select name="gender" value={formData.gender}
                        onChange={handleChange} className="border p-2 rounded">

                        <option>Male</option>
                        <option>Female</option>

                    </select>

                    <select name="owns_car" value={formData.owns_car}
                        onChange={handleChange} className="border p-2 rounded">

                        <option>Yes</option>
                        <option>No</option>

                    </select>

                    <select name="owns_house" value={formData.owns_house}
                        onChange={handleChange} className="border p-2 rounded">

                        <option>Yes</option>
                        <option>No</option>

                    </select>

                    <select name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="border p-2 rounded">

                        <option>Higher education</option>
                        <option>Incomplete higher</option>
                        <option>Lower secondary</option>
                        <option>Secondary / secondary special</option>

                    </select>

                </div>

                {/* PREDICT BUTTON */}

                <button
                    onClick={predictRisk}
                    className="bg-blue-600 text-white px-6 py-2 rounded mt-6"
                >
                    {loading ? "Predicting..." : "Predict Default Risk"}
                </button>

                {/* RESULT */}

                {result && (

                    <div className="mt-6 p-4 bg-gray-50 rounded">

                        <h2 className="text-xl font-semibold">
                            Prediction Result
                        </h2>

                        <p>
                            Default Probability:
                            <strong> {(result.default_probability * 100).toFixed(2)}%</strong>
                        </p>

                        <p>
                            Risk Level:
                            <strong> {result.risk_level}</strong>
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}