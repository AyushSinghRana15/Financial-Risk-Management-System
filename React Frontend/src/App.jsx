import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreditRisk = lazy(() => import("./pages/CreditRisk"));
const MarketRisk = lazy(() => import("./pages/MarketRisk"));
const RiskAnalytics = lazy(() => import("./pages/RiskAnalytics"));
const ECommerceFraudRisk = lazy(() => import("./pages/ECommerceFraudRisk"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioAnalytics = lazy(() => import("./pages/PortfolioAnalytics"));
const LiquidityRisk = lazy(() => import("./pages/LiquidityRisk"));
const BusinessRisk = lazy(() => import("./pages/BusinessRisk"));
const FinancialRisk = lazy(() => import("./pages/FinancialRisk"));
const OperationalRisk = lazy(() => import("./pages/OperationalRisk"));
const ProfileSection = lazy(() => import("./components/ProfileSection"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));
const Market = lazy(() => import("./pages/Market"));
const About = lazy(() => import("./pages/About"));

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

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
        </div>
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
            <main className="relative flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
                <Navbar />
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-6 lg:py-6">
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </div>
            </main>
            <ChatBot />
        </div>
    );
}

function ProtectedPage({ children }) {
    const user = localStorage.getItem("user");
    if (!user) {
        return <Navigate to="/login" />;
    }
    return <Suspense fallback={<PageLoader />}><PageTransition>{children}</PageTransition></Suspense>;
}

function PublicPage({ children }) {
    return <Suspense fallback={<PageLoader />}><PageTransition>{children}</PageTransition></Suspense>;
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
                <Route path="/" element={<AppLayout><PublicPage><Dashboard /></PublicPage></AppLayout>} />
                <Route path="/dashboard" element={<AppLayout><PublicPage><Dashboard /></PublicPage></AppLayout>} />
                <Route path="/market" element={<AppLayout><PublicPage><Market /></PublicPage></AppLayout>} />
                <Route path="/about" element={<AppLayout><PublicPage><About /></PublicPage></AppLayout>} />
                <Route path="/credit-risk" element={<ProtectedPage><AppLayout><CreditRisk /></AppLayout></ProtectedPage>} />
                <Route path="/market-risk" element={<ProtectedPage><AppLayout><MarketRisk /></AppLayout></ProtectedPage>} />
                <Route path="/risk-analytics" element={<ProtectedPage><AppLayout><RiskAnalytics /></AppLayout></ProtectedPage>} />
                <Route path="/ecommerce-fraud" element={<ProtectedPage><AppLayout><ECommerceFraudRisk /></AppLayout></ProtectedPage>} />
                <Route path="/portfolio" element={<ProtectedPage><AppLayout><Portfolio /></AppLayout></ProtectedPage>} />
                <Route path="/portfolio-analytics" element={<ProtectedPage><AppLayout><PortfolioAnalytics /></AppLayout></ProtectedPage>} />
                <Route path="/liquidity-risk" element={<ProtectedPage><AppLayout><LiquidityRisk /></AppLayout></ProtectedPage>} />
                <Route path="/business-risk" element={<ProtectedPage><AppLayout><BusinessRisk /></AppLayout></ProtectedPage>} />
                <Route path="/financial-risk" element={<ProtectedPage><AppLayout><FinancialRisk /></AppLayout></ProtectedPage>} />
                <Route path="/operational-risk" element={<ProtectedPage><AppLayout><OperationalRisk /></AppLayout></ProtectedPage>} />
                <Route path="/profile" element={<ProtectedPage><AppLayout><ProfileSection /></AppLayout></ProtectedPage>} />
                <Route path="/settings" element={<ProtectedPage><AppLayout><Settings /></AppLayout></ProtectedPage>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
