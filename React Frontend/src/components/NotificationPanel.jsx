import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Trash2, X } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

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
    const firstName = user?.name?.split(" ")[0] || "there";

    const getFallbackNotifications = React.useCallback(() => {
        const storageKey = `finrisk_notification_seed:${userEmail || "guest"}`;
        const storedSeed = Number(localStorage.getItem(storageKey));
        const seed = Number.isFinite(storedSeed)
            ? storedSeed
            : Array.from(userEmail || "guest").reduce((sum, char) => sum + char.charCodeAt(0), 0);

        if (!Number.isFinite(storedSeed)) {
            localStorage.setItem(storageKey, String(seed));
        }

        const profileMessages = [
            `${firstName}, add portfolio assets to unlock concentration and diversification alerts.`,
            `${firstName}, run a market risk prediction to start receiving VaR movement alerts.`,
            `${firstName}, complete your profile so FinRisk can tune alerts to your risk appetite.`
        ];

        const rotation = seed % profileMessages.length;
        return [
            {
                id: "fallback-profile",
                text: profileMessages[rotation],
                type: "info",
                timestamp: new Date().toISOString(),
                read: false
            },
            {
                id: "fallback-review",
                text: "No urgent risk alerts right now. Review portfolio weights after adding fresh market data.",
                type: "success",
                timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
                read: false
            }
        ];
    }, [firstName, userEmail]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const fetchNotifications = React.useCallback(async () => {
        if (!userEmail) {
            setNotifications(getFallbackNotifications());
            setLoading(false);
            return;
        }

        const clearedKey = `finrisk_cleared:${userEmail}`;
        const clearedAt = localStorage.getItem(clearedKey);
        if (clearedAt) {
            setNotifications([]);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}?email=${userEmail}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setNotifications(Array.isArray(data) && data.length > 0 ? data : getFallbackNotifications());
            setError(null);
        } catch (err) {
            console.error("Notifications error:", err);
            setNotifications(getFallbackNotifications());
            setError(null);
        } finally {
            setLoading(false);
        }
    }, [getFallbackNotifications, userEmail]);

    useEffect(() => {
        setLoading(true);
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleRefresh = () => {
            if (userEmail) {
                localStorage.removeItem(`finrisk_cleared:${userEmail}`);
            }
            setLoading(true);
            fetchNotifications();
        };
        window.addEventListener("refreshNotifications", handleRefresh);
        return () => window.removeEventListener("refreshNotifications", handleRefresh);
    }, [fetchNotifications, userEmail]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        window.dispatchEvent(new Event("refreshNotifications"));
    };

    const clearAll = () => {
        setNotifications([]);
        if (userEmail) {
            localStorage.setItem(`finrisk_cleared:${userEmail}`, Date.now().toString());
        }
        window.dispatchEvent(new Event("refreshNotifications"));
    };

    const getStyles = (type) => {
        switch (type) {
            case "warning":
                return {
                    iconWrap: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                    unread: "bg-yellow-50/70 dark:bg-yellow-900/10",
                    dot: "bg-yellow-500"
                };
            case "alert":
                return {
                    iconWrap: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                    unread: "bg-red-50/70 dark:bg-red-900/10",
                    dot: "bg-red-500"
                };
            case "success":
                return {
                    iconWrap: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    unread: "bg-green-50/70 dark:bg-green-900/10",
                    dot: "bg-green-500"
                };
            default:
                return {
                    iconWrap: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    unread: "bg-blue-50/70 dark:bg-blue-900/10",
                    dot: "bg-blue-500"
                };
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return <ShieldAlert className="w-4 h-4" />;
            case "alert":
                return <AlertTriangle className="w-4 h-4" />;
            case "success":
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[300] animate-scaleIn"
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
                    notifications.map((n) => {
                        const styles = getStyles(n.type);
                        return (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b dark:border-slate-700/50
                                ${n.read ? "bg-white dark:bg-slate-800" : styles.unread}
                                hover:bg-gray-100 dark:hover:bg-slate-700`}
                        >
                            <div className={`mt-0.5 rounded-full p-2 ${styles.iconWrap}`}>{getIcon(n.type)}</div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-relaxed ${n.read ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200 font-medium"}`}>
                                    {n.text}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {getRelativeTime(n.timestamp)}
                                </p>
                            </div>

                            {!n.read && (
                                <span className={`w-2 h-2 ${styles.dot} rounded-full mt-2 flex-shrink-0`}></span>
                            )}
                        </div>
                    )})
                )}
            </div>

            <div onClick={onClose} className="p-3 text-center text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-t dark:border-slate-700 rounded-b-2xl">
                Close
            </div>
        </div>
    );
}
