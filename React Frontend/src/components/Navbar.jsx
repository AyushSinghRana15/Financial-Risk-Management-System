import React, { useState, useEffect, useCallback } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
import { NAVBAR_ITEMS } from "../config/navigation";

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

    const linkClass = (path) =>
        `cursor-pointer text-sm font-medium transition-colors duration-200 ${location.pathname === path
            ? "text-blue-500 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
        }`;

    return (
        <div className="glass-panel border-t-0 border-x-0 border-b border-slate-200/20 dark:border-slate-700/30 relative z-50">
            <div className="flex items-center px-4 py-3 sm:px-6">
                <div className="flex-1" />

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
        </div>
    );
}

export default Navbar;
