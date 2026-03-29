import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import ProtectedRoute from "./components/ProtectedRoute";

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

function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="relative flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
            <AuroraBackground />
            
            <Sidebar />

            <main className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
                <Navbar />

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-6 lg:py-6">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Routes location={location}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/market" element={<Market />} />
                                <Route path="/about" element={<About />} />

                                <Route path="/credit-risk" element={<CreditRisk />} />
                                <Route path="/market-risk" element={<MarketRisk />} />
                                <Route path="/risk-analytics" element={<RiskAnalytics />} />
                                <Route path="/ecommerce-fraud" element={<ECommerceFraudRisk />} />

                                <Route path="/portfolio" element={<Portfolio />} />
                                <Route path="/portfolio-analytics" element={<PortfolioAnalytics />} />
                                <Route path="/liquidity-risk" element={<LiquidityRisk />} />

                                <Route path="/business-risk" element={<BusinessRisk />} />
                                <Route path="/financial-risk" element={<FinancialRisk />} />
                                <Route path="/operational-risk" element={<OperationalRisk />} />

                                <Route path="/profile" element={<ProfileSection />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </PageTransition>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
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
                <Route path="/login" element={<Login />} />

                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
