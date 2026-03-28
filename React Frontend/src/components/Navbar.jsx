import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "";
        return name.split(" ").map(w => w[0]).join("").toUpperCase();
    };

    const linkClass = (path) =>
        `cursor-pointer text-sm font-medium transition ${location.pathname === path
            ? "text-blue-600"
            : "text-gray-600 hover:text-black"
        }`;

    return (
        <div className="bg-white/80 backdrop-blur-md border-b 
            flex items-center px-6 py-4 sticky top-0 z-50">

            {/* LEFT: Logo */}
            <div
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 cursor-pointer"
            >
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow">
                    <BarChart3 size={18} />
                </div>

                <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
                    FinRisk
                </h1>
            </div>

            {/* SPACER */}
            <div className="flex-1"></div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-6">

                {/* Nav Links */}
                <div className="flex items-center gap-6">

                    <span onClick={() => navigate("/dashboard")} className={linkClass("/dashboard")}>
                        Home
                    </span>

                    <span onClick={() => navigate("/portfolio")} className={linkClass("/portfolio")}>
                        Portfolio
                    </span>

                    <span onClick={() => navigate("/market")} className={linkClass("/market")}>
                        Market
                    </span>

                    <span onClick={() => navigate("/about")} className={linkClass("/about")}>
                        About
                    </span>

                </div>

                {/* Notification */}
                <div className="relative">
                    <div
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative cursor-pointer"
                    >
                        <FaBell className="text-gray-600 hover:text-black transition" size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>

                    {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Auth Section */}
                {!user ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                ) : (
                    <div className="relative">

                        {/* Avatar */}
                        <div
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-9 h-9 rounded-full bg-blue-600 text-white 
                            flex items-center justify-center font-semibold 
                            cursor-pointer hover:scale-105 transition"
                        >
                            {getInitials(user.name)}
                        </div>

                        {/* Dropdown */}
                        {menuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border overflow-hidden">

                                <div className="p-4 border-b">
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>

                                <div className="py-2">

                                    <div
                                        onClick={() => {
                                            navigate("/profile");
                                            setMenuOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        Profile
                                    </div>

                                    <div
                                        onClick={() => {
                                            navigate("/settings");
                                            setMenuOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        Settings
                                    </div>

                                    <div
                                        onClick={logout}
                                        className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        Logout
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Navbar;