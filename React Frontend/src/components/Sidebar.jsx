import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChartLine, FaUniversity, FaPercentage, FaGlobe, FaBuilding, FaBars } from "react-icons/fa";
import { MdDashboard, MdBusiness } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";

export default function Sidebar() {

    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const linkClass = (path) =>
        `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-2 rounded-lg mb-1 transition ${location.pathname === path
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`;

    return (
        <div
            className={`${collapsed ? "w-20" : "w-64"
                } bg-gray-900 text-white min-h-screen p-4 overflow-y-auto transition-all duration-300`}
        >

            {/* Toggle Button */}
            <div className="flex items-center justify-between mb-8">

                {!collapsed && (
                    <h1 className="text-xl font-bold">
                        Risk System
                    </h1>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-gray-300 hover:text-white"
                >
                    <FaBars />
                </button>

            </div>

            {/* Dashboard */}
            <div className="mb-6">
                <Link to="/" className={linkClass("/")}>
                    <MdDashboard size={20} />
                    {!collapsed && "Dashboard"}
                </Link>
            </div>

            <hr className="border-gray-700 mb-6" />

            {/* Systematic Risk */}
            <div className="mb-6">

                {!collapsed && (
                    <p className="text-gray-400 text-sm mb-2">
                        Systematic Risk
                    </p>
                )}

                <Link to="/market-risk" className={linkClass("/market-risk")}>
                    <FaChartLine />
                    {!collapsed && "Market Risk"}
                </Link>

                <Link to="/credit-risk" className={linkClass("/credit-risk")}>
                    <FaUniversity />
                    {!collapsed && "Credit Risk"}
                </Link>
                <Link to="/liquidity-risk" className={linkClass("/liquidity-risk")}>
                    <FaGlobe />
                    {!collapsed && "Liquidity Risk"}
                </Link>
            </div>

            <hr className="border-gray-700 mb-6" />

            {/* Unsystematic Risk */}
            <div className="mb-6">

                {!collapsed && (
                    <p className="text-gray-400 text-sm mb-2">
                        Unsystematic Risk
                    </p>
                )}

                <Link to="/business-risk" className={linkClass("/business-risk")}>
                    <MdBusiness />
                    {!collapsed && "Business Risk"}
                </Link>

                <Link to="/financial-risk" className={linkClass("/financial-risk")}>
                    <GiMoneyStack />
                    {!collapsed && "Financial Risk"}
                </Link>

                <Link to="/operational-risk" className={linkClass("/operational-risk")}>
                    <FaChartLine />
                    {!collapsed && "Operational Risk"}
                </Link>
                <Link to="/ecommerce-fraud" className={linkClass("/ecommerce-fraud")}>
                    <FaPercentage />
                    {!collapsed && "E-Commerce Fraud"}
                </Link>

            </div>

            <hr className="border-gray-700 mb-6" />

            {/* Portfolio */}
            <div>

                {!collapsed && (
                    <p className="text-gray-400 text-sm mb-2">
                        Portfolio
                    </p>
                )}

                <Link to="/portfolio-analytics" className={linkClass("/portfolio-analytics")}>
                    <FaChartLine />
                    {!collapsed && "Portfolio Analytics"}
                </Link>

            </div>

        </div>
    );
}
