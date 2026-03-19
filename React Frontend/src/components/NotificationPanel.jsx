import React from "react";

export default function NotificationPanel({ onClose }) {

    const notifications = [
        { id: 1, text: "⚠️ High crypto exposure detected", type: "warning" },
        { id: 2, text: "📉 Market volatility increasing", type: "alert" },
        { id: 3, text: "✅ Portfolio diversified", type: "success" },
    ];

    return (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border z-50">

            {/* Header */}
            <div className="p-4 border-b font-semibold text-gray-800">
                Notifications
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">

                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                        {n.text}
                    </div>
                ))}

            </div>

            {/* Footer */}
            <div
                onClick={onClose}
                className="p-3 text-center text-sm text-blue-600 cursor-pointer hover:bg-gray-100"
            >
                Close
            </div>

        </div>
    );
}