import React, { useState, useEffect, useCallback } from "react";
import { FaBell, FaChartLine, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
import { NAVBAR_ITEMS, SIDEBAR_SECTIONS } from "../config/navigation";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const closeNotifPanel = useCallback(() => setNotifOpen(false), []);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = user?.email || "";

    const fetchUnreadCount = useCallback(async () => {
        if (!userEmail) {
            setUnreadCount(0);
            return;
        }
        try {
            const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}?email=${userEmail}`);
            if (!res.ok) {
                setUnreadCount(0);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                const unread = data.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch {
            setUnreadCount(0);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount, notifOpen]);

    useEffect(() => {
        const handleRefresh = () => fetchUnreadCount();
        window.addEventListener("refreshNotifications", handleRefresh);
        return () => window.removeEventListener("refreshNotifications", handleRefresh);
    }, [fetchUnreadCount]);

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "";
        return name.split(" ").map(w => w[0]).join("").toUpperCase();
    };

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const linkClass = (path) =>
        `cursor-pointer text-sm font-medium transition-colors duration-200 ${location.pathname === path
            ? "text-blue-500 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
        }`;

    return (
        <div className="glass-panel border-t-0 border-x-0 border-b border-slate-200/20 dark:border-slate-700/30 relative z-50">
            <div className="flex items-center px-6 py-3">
                <div className="flex-1" />

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                    {mobileNavOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
                </button>

                <div className="flex items-center gap-5">
                    <nav className="hidden md:flex items-center gap-5">
                        {NAVBAR_ITEMS.map(item => (
                            <span 
                                key={item.path} 
                                onClick={() => navigate(item.path)} 
                                className={linkClass(item.path)}
                            >
                                {item.label}
                            </span>
                        ))}
                    </nav>

                    <div className="relative">
                        <div
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative cursor-pointer p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <FaBell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </div>

                        {notifOpen && <NotificationPanel onClose={closeNotifPanel} />}
                    </div>

                    {!user || !user.name ? (
                        <button
                            onClick={() => navigate("/login")}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    ) : (
                        <div className="relative flex items-center gap-3">
                            <span className="hidden lg:block text-sm font-medium text-slate-600 dark:text-slate-300">
                                {user.name?.split(" ")[0]}
                            </span>

                            <div
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white 
                                flex items-center justify-center font-semibold text-sm
                                cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 overflow-hidden"
                            >
                                {user.picture ? (
                                    <img 
                                        src={user.picture} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getInitials(user.name)
                                )}
                            </div>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-slate-200/20 dark:border-slate-700/50">
                                        <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <div
                                            onClick={() => {
                                                navigate("/profile");
                                                setMenuOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-sm text-slate-700 dark:text-slate-200 transition-colors"
                                        >
                                            Profile
                                        </div>

                                        <div
                                            onClick={() => {
                                                navigate("/settings");
                                                setMenuOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-sm text-slate-700 dark:text-slate-200 transition-colors"
                                        >
                                            Settings
                                        </div>

                                        <div
                                            onClick={logout}
                                            className="px-4 py-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-sm transition-colors"
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

            {/* Mobile full-screen nav overlay */}
            {mobileNavOpen && (
                <div className="md:hidden fixed inset-x-0 top-0 z-50 h-screen bg-slate-900/98 backdrop-blur-2xl overflow-y-auto pt-20">
                    <div className="px-4 py-4 space-y-5">
                        {SIDEBAR_SECTIONS.map((section, i) => (
                            <div key={section.label}>
                                {i > 0 && <div className="h-px bg-slate-700/30 mb-5" />}
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">
                                    {section.label}
                                </p>
                                <div className="space-y-0.5">
                                    {section.items.map(item => {
                                        const Icon = item.icon;
                                        const active = location.pathname === item.path;
                                        return (
                                            <div
                                                key={item.path}
                                                onClick={() => { navigate(item.path); setMobileNavOpen(false); }}
                                                className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                                                    active
                                                        ? "bg-blue-500/10 text-blue-400"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                }`}
                                            >
                                                {Icon && <Icon size={18} strokeWidth={active ? 2.5 : 2} />}
                                                <span className="text-sm font-medium">{item.label}</span>
                                                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Navbar;
