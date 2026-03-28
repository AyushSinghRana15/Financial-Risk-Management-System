import { useNavigate } from "react-router-dom";

function RiskCard({ title, description, route }) {

    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(route)}
            className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >

            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400">
                {description}
            </p>

        </div>
    );
}

export default RiskCard;
