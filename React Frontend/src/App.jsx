import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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

/* Dashboard Layout */
function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <div className="p-6 overflow-y-auto">
          <Routes>

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
        </div>

      </div>

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

        {/* Google Login Page */}
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