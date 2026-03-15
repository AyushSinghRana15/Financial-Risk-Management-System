import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import CreditRisk from "./pages/CreditRisk";
import MarketRisk from "./pages/MarketRisk";
import RiskAnalytics from "./pages/RiskAnalytics";

import Portfolio from "./pages/Portfolio";
import PortfolioAnalytics from "./pages/PortfolioAnalytics";

import InterestRisk from "./pages/InterestRisk";
import InflationRisk from "./pages/InflationRisk";
import CurrencyRisk from "./pages/CurrencyRisk";
import PoliticalRisk from "./pages/PoliticalRisk";

import BusinessRisk from "./pages/BusinessRisk";
import FinancialRisk from "./pages/FinancialRisk";
import OperationalRisk from "./pages/OperationalRisk";
import ManagementRisk from "./pages/ManagementRisk";

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

            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio-analytics" element={<PortfolioAnalytics />} />

            <Route path="/interest-risk" element={<InterestRisk />} />
            <Route path="/inflation-risk" element={<InflationRisk />} />
            <Route path="/currency-risk" element={<CurrencyRisk />} />
            <Route path="/political-risk" element={<PoliticalRisk />} />

            <Route path="/business-risk" element={<BusinessRisk />} />
            <Route path="/financial-risk" element={<FinancialRisk />} />
            <Route path="/operational-risk" element={<OperationalRisk />} />
            <Route path="/management-risk" element={<ManagementRisk />} />

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