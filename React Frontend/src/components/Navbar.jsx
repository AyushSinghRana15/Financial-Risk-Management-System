import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Generate initials
    const getInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        return words.map(word => word[0]).join("").toUpperCase();
    };

    const navbarStyle = {
        height: "60px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100
    };

    const rightSection = {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    };

    return (

        <div style={navbarStyle}>

            {/* Logo */}

            <div className="flex items-center gap-3">

                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <BarChart3 size={20} />
                </div>

                <h1 className="text-xl font-semibold text-gray-800">
                    FinRisk Dashboard
                </h1>

            </div>

            {/* Right Section */}

            <div style={rightSection}>

                <FaBell size={18} style={{ cursor: "pointer" }} />

                {!user ? (

                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Login
                    </button>

                ) : (

                    <div style={{ position: "relative" }}>

                        {/* Initials Avatar */}

                        <div
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer"
                        >
                            {getInitials(user.name)}
                        </div>

                        {menuOpen && (

                            <div
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "45px",
                                    background: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                                    width: "200px",
                                    overflow: "hidden"
                                }}
                            >

                                <div className="p-3 border-b text-sm text-gray-600">
                                    <div className="font-semibold">{user.name}</div>
                                    <div>{user.email}</div>
                                </div>

                                <div className="p-3 hover:bg-gray-100 cursor-pointer">
                                    Profile
                                </div>

                                <div className="p-3 hover:bg-gray-100 cursor-pointer">
                                    Settings
                                </div>

                                <div
                                    onClick={logout}
                                    className="p-3 text-red-500 hover:bg-gray-100 cursor-pointer"
                                >
                                    Logout
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