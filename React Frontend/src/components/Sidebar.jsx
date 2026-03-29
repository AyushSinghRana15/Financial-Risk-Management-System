import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  Landmark,
  Droplets,
  Briefcase,
  Wallet,
  Activity,
  PieChart,
  BarChart2,
  Menu
} from "lucide-react";
import FinRiskLogo from "../assets/FinRisk.png";

const NAV_ITEMS = {
  main: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/market", label: "Market", icon: Globe },
  ],
  systematic: [
    { path: "/market-risk", label: "Market Risk", icon: TrendingUp, color: "blue" },
    { path: "/credit-risk", label: "Credit Risk", icon: Landmark, color: "purple" },
    { path: "/liquidity-risk", label: "Liquidity Risk", icon: Droplets, color: "cyan" },
  ],
  unsystematic: [
    { path: "/business-risk", label: "Business Risk", icon: Briefcase, color: "green" },
    { path: "/financial-risk", label: "Financial Risk", icon: Wallet, color: "orange" },
    { path: "/operational-risk", label: "Operational Risk", icon: Activity, color: "yellow" },
    { path: "/ecommerce-fraud", label: "E-Commerce Fraud", icon: BarChart2, color: "pink" },
  ],
  portfolio: [
    { path: "/portfolio", label: "Portfolio", icon: PieChart, color: "indigo" },
    { path: "/portfolio-analytics", label: "Analytics", icon: BarChart2, color: "violet" },
  ]
};

const COLOR_MAP = {
  blue: { bg: "bg-blue-500/20", border: "border-blue-500/50", glow: "shadow-blue-500/30", text: "text-blue-400", active: "from-blue-600 to-blue-700" },
  purple: { bg: "bg-purple-500/20", border: "border-purple-500/50", glow: "shadow-purple-500/30", text: "text-purple-400", active: "from-purple-600 to-purple-700" },
  cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500/50", glow: "shadow-cyan-500/30", text: "text-cyan-400", active: "from-cyan-600 to-cyan-700" },
  green: { bg: "bg-green-500/20", border: "border-green-500/50", glow: "shadow-green-500/30", text: "text-green-400", active: "from-green-600 to-green-700" },
  orange: { bg: "bg-orange-500/20", border: "border-orange-500/50", glow: "shadow-orange-500/30", text: "text-orange-400", active: "from-orange-600 to-orange-700" },
  yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", glow: "shadow-yellow-500/30", text: "text-yellow-400", active: "from-yellow-600 to-yellow-700" },
  pink: { bg: "bg-pink-500/20", border: "border-pink-500/50", glow: "shadow-pink-500/30", text: "text-pink-400", active: "from-pink-600 to-pink-700" },
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-500/50", glow: "shadow-indigo-500/30", text: "text-indigo-400", active: "from-indigo-600 to-indigo-700" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/50", glow: "shadow-violet-500/30", text: "text-violet-400", active: "from-violet-600 to-violet-700" },
};

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item }) => {
    const active = isActive(item.path);
    const color = item.color ? COLOR_MAP[item.color] : null;
    const Icon = item.icon;

    return (
      <Link to={item.path}>
        <div
          className={`
            group relative flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl mb-1
            transition-all duration-300 cursor-pointer
            ${active
              ? color
                ? `bg-gradient-to-r ${color.active} ${color.text} shadow-lg ${color.glow}`
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }
          `}
          onClick={() => setMobileOpen(false)}
        >
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/50" />
          )}
          <Icon size={18} className={`flex-shrink-0 ${active && color ? color.text : ""}`} strokeWidth={active ? 2.5 : 2} />
          {!collapsed && (
            <span className={`font-medium text-sm ${active ? "font-semibold" : ""}`}>
              {item.label}
            </span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
              {item.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
            </div>
          )}
        </div>
      </Link>
    );
  };

  const SectionLabel = ({ label }) => (
    !collapsed && (
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">
        {label}
      </p>
    )
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 text-white shadow-xl lg:hidden"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          h-screen
          flex flex-col
          bg-slate-900/95 backdrop-blur-2xl 
          border-r border-slate-700/50
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          shadow-2xl lg:shadow-none
        `}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} ${collapsed ? "px-2" : "px-4"} pt-4 pb-6 mb-6`}>
            <div className="flex items-center gap-2">
              {!collapsed && (
                <>
                  <div className="w-9 h-9 flex-shrink-0">
                    <img 
                      src={FinRiskLogo} 
                      alt="FinRisk Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                    FinRisk
                  </span>
                </>
              )}
              {collapsed && (
                <span className="text-lg font-bold text-white">FR</span>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all hidden lg:block"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
            <div>
              <SectionLabel label="Main" />
              <div className="space-y-1">
                {NAV_ITEMS.main.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>

            <div className="h-px bg-slate-700/50" />

            <div>
              <SectionLabel label="Systematic Risk" />
              <div className="space-y-1">
                {NAV_ITEMS.systematic.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>

            <div className="h-px bg-slate-700/50" />

            <div>
              <SectionLabel label="Unsystematic Risk" />
              <div className="space-y-1">
                {NAV_ITEMS.unsystematic.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>

            <div className="h-px bg-slate-700/50" />

            <div>
              <SectionLabel label="Portfolio" />
              <div className="space-y-1">
                {NAV_ITEMS.portfolio.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
