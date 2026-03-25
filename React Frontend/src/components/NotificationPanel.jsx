import React, { useEffect, useRef, useState } from "react";

export default function NotificationPanel({ onClose }) {
    const panelRef = useRef();

    const [notifications, setNotifications] = useState([
        { id: 1, text: "High crypto exposure detected", type: "warning", read: false },
        { id: 2, text: "Market volatility increasing", type: "alert", read: false },
        { id: 3, text: "Portfolio diversified", type: "success", read: true },
    ]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Mark single notification as read
    const markAsRead = (id) => {
        setNotifications((prev) => {
            const updated = prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            );
            return [...updated]; // force new reference
        });
    };

    // Mark all as read
    const markAllRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    const getStyles = (type) => {
        switch (type) {
            case "warning":
                return "text-yellow-600 bg-yellow-50";
            case "alert":
                return "text-blue-600 bg-blue-50";
            case "success":
                return "text-green-600 bg-green-50";
            default:
                return "text-gray-600";
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return "⚠️";
            case "alert":
                return "📉";
            case "success":
                return "✅";
            default:
                return "🔔";
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="absolute right-2 top-12 w-80 bg-white rounded-xl shadow-xl border z-50 animate-fadeIn"
        >

            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                >
                    ✕
                </button>
            </div>

            {/* Mark all read */}
            {notifications.length > 0 && (
                <div
                    onClick={markAllRead}
                    className="text-xs text-blue-600 px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                    Mark all as read
                </div>
            )}

            {/* List */}
            <div className="max-h-64 overflow-y-auto">

                {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                        No notifications
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3 text-sm cursor-pointer transition
                                ${n.read ? "bg-white" : "bg-gray-50"}
                                hover:bg-gray-100`}
                        >
                            <span className="text-lg">{getIcon(n.type)}</span>

                            <div className="flex-1">
                                <p className={`${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                                    {n.text}
                                </p>
                            </div>

                            {!n.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                            )}

                            <span
                                className={`text-xs px-2 py-1 rounded-md ${getStyles(n.type)}`}
                            >
                                {n.type}
                            </span>
                        </div>
                    ))
                )}

            </div>

            {/* Footer */}
            <div
                onClick={onClose}
                className="p-3 text-center text-sm text-blue-600 cursor-pointer hover:bg-gray-100 border-t"
            >
                Close
            </div>

            {/* Animation */}
            <style>
                {`
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                `}
            </style>
        </div>
    );
}