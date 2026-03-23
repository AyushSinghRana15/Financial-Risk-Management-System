import { BrowserRouter, Routes, Route } from "react-router-dom";
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

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

/* Dashboard Layout */
function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Navbar />

        <div style={{ padding: "30px", overflowY: "auto" }}>
          <Routes>

            <Route path="/" element={<Dashboard />} />
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


          </Routes>
        </div>

      </div>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Auth Pages (NO Sidebar/Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
