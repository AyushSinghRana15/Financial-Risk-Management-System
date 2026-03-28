import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert, TrendingUp, CheckCircle, Info, X, Trash2 } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

function getRelativeTime(timestamp) {
    if (!timestamp) return "Just now";
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
}

export default function NotificationPanel({ onClose }) {
    const panelRef = useRef();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = user?.email || "";

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userEmail) {
                setNotifications([
                    { id: 1, text: "Welcome to FinRisk! Start by adding assets to your portfolio.", type: "info", timestamp: new Date().toISOString(), read: false }
                ]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/notifications?email=${userEmail}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error("Notifications error:", err);
                setError("Unable to load notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userEmail]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getStyles = (type) => {
        switch (type) {
            case "warning":
                return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
            case "alert":
                return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
            case "success":
                return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
            default:
                return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
            case "alert":
                return <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />;
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            default:
                return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="absolute right-2 top-12 w-96 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 animate-scaleIn"
        >
            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
            `}</style>

            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <X size={18} />
                </button>
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-700/50">
                {notifications.length > 0 && (
                    <>
                        <span onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                            Mark all as read
                        </span>
                        <span onClick={clearAll} className="text-xs text-red-500 dark:text-red-400 cursor-pointer hover:underline flex items-center gap-1">
                            <Trash2 size={12} /> Clear all
                        </span>
                    </>
                )}
            </div>

            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500 dark:text-red-400 text-sm">
                        {error}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No notifications
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b dark:border-slate-700/50
                                ${n.read ? "bg-white dark:bg-slate-800" : "bg-blue-50/50 dark:bg-slate-700/30"}
                                hover:bg-gray-100 dark:hover:bg-slate-700`}
                        >
                            <div className="mt-0.5">{getIcon(n.type)}</div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-relaxed ${n.read ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200 font-medium"}`}>
                                    {n.text}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {getRelativeTime(n.timestamp)}
                                </p>
                            </div>

                            {!n.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div onClick={onClose} className="p-3 text-center text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-t dark:border-slate-700 rounded-b-2xl">
                Close
            </div>
        </div>
    );
}