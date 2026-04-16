import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ECommerceFraudRisk from "./pages/ECommerceFraudRisk";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import CreditRisk from "./pages/CreditRisk";
import MarketRisk from "./pages/MarketRisk";
import RiskAnalytics from "./pages/RiskAnalytics";

import Portfolio from "./pages/Portfolio";
import PortfolioAnalytics from "./pages/PortfolioAnalytics";
import LiquidityRisk from "./pages/LiquidityRisk";

import BusinessRisk from "./pages/BusinessRisk";
import FinancialRisk from "./pages/FinancialRisk";
import OperationalRisk from "./pages/OperationalRisk";

import ProfileSection from "./components/ProfileSection";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

import Market from "./pages/Market";
import About from "./pages/About";

function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

function AuroraBackground() {
    return (
        <div className="aurora-container">
            <div className="aurora-blob aurora-blob-1" />
            <div className="aurora-blob aurora-blob-2" />
            <div className="aurora-blob aurora-blob-3" />
        </div>
    );
}

function AppLayout({ children }) {
    return (
        <div className="relative flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
            <AuroraBackground />
            <Sidebar />
            <main className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
                <Navbar />
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-6 lg:py-6">
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function ProtectedPage({ children }) {
    const user = localStorage.getItem("user");
    if (!user) {
        return <Navigate to="/login" />;
    }
    return <PageTransition>{children}</PageTransition>;
}

function PublicPage({ children }) {
    return <PageTransition>{children}</PageTransition>;
}

function App() {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Login page */}
                <Route path="/login" element={<Login />} />

                {/* Public pages with dashboard layout */}
                <Route
                    path="/"
                    element={<AppLayout><PublicPage><Dashboard /></PublicPage></AppLayout>}
                />
                <Route
                    path="/dashboard"
                    element={<AppLayout><PublicPage><Dashboard /></PublicPage></AppLayout>}
                />
                <Route
                    path="/market"
                    element={<AppLayout><PublicPage><Market /></PublicPage></AppLayout>}
                />
                <Route
                    path="/about"
                    element={<AppLayout><PublicPage><About /></PublicPage></AppLayout>}
                />

                {/* Protected pages */}
                <Route
                    path="/credit-risk"
                    element={<ProtectedPage><AppLayout><CreditRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/market-risk"
                    element={<ProtectedPage><AppLayout><MarketRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/risk-analytics"
                    element={<ProtectedPage><AppLayout><RiskAnalytics /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/ecommerce-fraud"
                    element={<ProtectedPage><AppLayout><ECommerceFraudRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/portfolio"
                    element={<ProtectedPage><AppLayout><Portfolio /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/portfolio-analytics"
                    element={<ProtectedPage><AppLayout><PortfolioAnalytics /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/liquidity-risk"
                    element={<ProtectedPage><AppLayout><LiquidityRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/business-risk"
                    element={<ProtectedPage><AppLayout><BusinessRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/financial-risk"
                    element={<ProtectedPage><AppLayout><FinancialRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/operational-risk"
                    element={<ProtectedPage><AppLayout><OperationalRisk /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/profile"
                    element={<ProtectedPage><AppLayout><ProfileSection /></AppLayout></ProtectedPage>}
                />
                <Route
                    path="/settings"
                    element={<ProtectedPage><AppLayout><Settings /></AppLayout></ProtectedPage>}
                />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
