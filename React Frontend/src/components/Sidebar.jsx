import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChartLine, FaUniversity, FaPercentage, FaGlobe, FaBuilding, FaBars } from "react-icons/fa";
import { MdDashboard, MdBusiness } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";

export default function Sidebar() {

    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const linkClass = (path) =>
        `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-lg mb-1 transition-all duration-200 ${location.pathname === path
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`;

    return (
        <div
            className={`${collapsed ? "w-20" : "w-64"
                } bg-[#0f172a] text-white min-h-screen p-4 overflow-y-auto transition-all duration-300`}
        >
            {/* Toggle Button */}
            <div
                className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between"
                    }`}
            >
                {!collapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Risk System
                    </h1>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <FaBars />
                </button>

            </div>

            {/* Dashboard */}
            <div className="mb-4">
                <Link to="/" className={linkClass("/")}>
                    <MdDashboard size={18} />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                </Link>
            </div>

            <hr className="border-white/10 mb-4" />

            {/* Systematic Risk */}
            <div className="mb-4">

                {!collapsed && (
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-4">
                        Systematic Risk
                    </p>
                )}

                <Link to="/market-risk" className={linkClass("/market-risk")}>
                    <FaChartLine size={16} />
                    {!collapsed && <span className="font-medium">Market Risk</span>}
                </Link>

                <Link to="/credit-risk" className={linkClass("/credit-risk")}>
                    <FaUniversity size={16} />
                    {!collapsed && <span className="font-medium">Credit Risk</span>}
                </Link>
                <Link to="/liquidity-risk" className={linkClass("/liquidity-risk")}>
                    <FaGlobe size={16} />
                    {!collapsed && <span className="font-medium">Liquidity Risk</span>}
                </Link>
            </div>

            <hr className="border-white/10 mb-4" />

            {/* Unsystematic Risk */}
            <div className="mb-4">

                {!collapsed && (
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-4">
                        Unsystematic Risk
                    </p>
                )}

                <Link to="/business-risk" className={linkClass("/business-risk")}>
                    <MdBusiness size={16} />
                    {!collapsed && <span className="font-medium">Business Risk</span>}
                </Link>

                <Link to="/financial-risk" className={linkClass("/financial-risk")}>
                    <GiMoneyStack size={16} />
                    {!collapsed && <span className="font-medium">Financial Risk</span>}
                </Link>

                <Link to="/operational-risk" className={linkClass("/operational-risk")}>
                    <FaChartLine size={16} />
                    {!collapsed && <span className="font-medium">Operational Risk</span>}
                </Link>
                <Link to="/ecommerce-fraud" className={linkClass("/ecommerce-fraud")}>
                    <FaPercentage size={16} />
                    {!collapsed && <span className="font-medium">E-Commerce Fraud</span>}
                </Link>

            </div>

            <hr className="border-white/10 mb-4" />

            {/* Portfolio */}
            <div>

                {!collapsed && (
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-4">
                        Portfolio
                    </p>
                )}

                <Link to="/portfolio-analytics" className={linkClass("/portfolio-analytics")}>
                    <FaChartLine size={16} />
                    {!collapsed && <span className="font-medium">Portfolio Analytics</span>}
                </Link>

            </div>

        </div>
    );
}