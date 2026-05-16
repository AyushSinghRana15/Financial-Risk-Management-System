import {
  LayoutDashboard, Globe, TrendingUp, Landmark, Droplets,
  Briefcase, Wallet, Activity, BarChart2, PieChart, Info
} from "lucide-react";

export const NAVBAR_ITEMS = [
  { path: "/dashboard", label: "Home" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/market", label: "Market" },
  { path: "/about", label: "About" },
];

export const SIDEBAR_SECTIONS = [
  {
    label: "Main",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/market", label: "Market", icon: Globe },
    ],
  },
  {
    label: "Systematic Risk",
    items: [
      { path: "/market-risk", label: "Market Risk", icon: TrendingUp, color: "blue" },
      { path: "/credit-risk", label: "Credit Risk", icon: Landmark, color: "purple" },
      { path: "/liquidity-risk", label: "Liquidity Risk", icon: Droplets, color: "cyan" },
    ],
  },
  {
    label: "Unsystematic Risk",
    items: [
      { path: "/business-risk", label: "Business Risk", icon: Briefcase, color: "green" },
      { path: "/financial-risk", label: "Financial Risk", icon: Wallet, color: "orange" },
      { path: "/operational-risk", label: "Operational Risk", icon: Activity, color: "yellow" },
      { path: "/ecommerce-fraud", label: "E-Commerce Fraud", icon: BarChart2, color: "pink" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { path: "/portfolio", label: "Portfolio", icon: PieChart, color: "indigo" },
      { path: "/portfolio-analytics", label: "Analytics", icon: BarChart2, color: "violet" },
    ],
  },
  {
    label: "Other",
    items: [
      { path: "/about", label: "About", icon: Info, color: "blue" },
    ],
  },
];
