import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRocket, FaExternalLinkAlt, FaQuoteLeft, FaTimes, FaBookOpen, FaFlask, FaLayerGroup, FaGithub, FaStar, FaCodeBranch, FaEye } from "react-icons/fa";
import SEO from "../components/SEO";

const team = [
    {
        name: "Ayush Singh",
        role: "Project Lead & AI/ML Engineer",
        gradient: "from-blue-600 to-indigo-600",
        image: "Ayush_Singh.jpg",
        contributions: [
            "Credit Risk ML Model (CatBoost, XGBoost)",
            "Market Risk / VaR Prediction Model",
            "Frontend Architecture & Dashboard",
            "Backend API Development (FastAPI)",
            "AI Insights Engine Integration",
        ],
    },
    {
        name: "Aditya Singh",
        role: "ML Engineer & Database Architect",
        gradient: "from-emerald-500 to-teal-600",
        image: "Aditya_Singh.jpg",
        contributions: [
            "Liquidity Risk Prediction Model",
            "Business Risk Classification Model",
            "Database Schema & Migration Design",
            "PostgreSQL (Neon) Optimization",
            "Data Pipeline & Preprocessing",
        ],
    },
    {
        name: "Bipin Singh",
        role: "Risk Modeling Specialist",
        gradient: "from-purple-500 to-pink-600",
        image: "Bipin_Singh.jpeg",
        contributions: [
            "Financial Risk / Bankruptcy Model",
            "Operational Risk Classification",
            "Feature Engineering & Selection",
            "Model Threshold Tuning (Optuna)",
            "Backtesting & Validation Framework",
        ],
    },
    {
        name: "Abhishek Kumar",
        role: "Fraud Detection & Data Analyst",
        gradient: "from-orange-500 to-red-600",
        image: "Abhishek_Singh.jpeg",
        contributions: [
            "E-Commerce Fraud Detection (XGBoost)",
            "Transaction Pattern Analysis",
            "Fraud Feature Engineering",
            "Model Interpretability & Reporting",
            "Test Dataset Curation",
        ],
    },
];

const stats = [
    { label: "ML Models", value: "7" },
    { label: "Risk Types", value: "6" },
    { label: "Tech Stack", value: "10+" },
    { label: "Accuracy", value: "97%" },
];

const termDocs = {
    "ROC-AUC": {
        title: "ROC-AUC (Area Under the Curve)",
        category: "model",
        description: "Measures how well the model distinguishes between classes (e.g., default vs. no default). A score of 0.77 means the model correctly ranks a random positive case higher than a negative case 77% of the time.",
        formula: "AUC = ∫₀¹ TPR(FPR⁻¹(x)) dx",
        range: "0.5 (random) → 1.0 (perfect)",
    },
    "RMSE": {
        title: "RMSE (Root Mean Square Error)",
        category: "model",
        description: "The standard deviation of prediction errors — how far off the model's predictions are from actual values. Lower is better. An RMSE of 0.012 means typical prediction error is about 1.2%.",
        formula: "RMSE = √( (1/n) Σ(yᵢ - ŷᵢ)² )",
        range: "0 (perfect) → ∞",
    },
    "VaR": {
        title: "Value at Risk (VaR)",
        category: "model",
        description: "A statistical measure that estimates the maximum potential loss of a portfolio over a specific time period at a given confidence level. Our model uses a Hybrid ML VaR approach with XGBoost.",
        formula: "P(Loss ≤ VaR) = α (confidence level)",
        range: "Low (<2%), Moderate (2-5%), High (>5%)",
    },
    "XGBoost": {
        title: "XGBoost (Extreme Gradient Boosting)",
        category: "ml",
        description: "A powerful gradient-boosted decision tree algorithm that builds an ensemble of weak learners sequentially, each correcting errors from the previous one. Known for handling missing data, regularization, and fast training.",
        range: "State-of-the-art for tabular data",
    },
    "CatBoost": {
        title: "CatBoost (Categorical Boosting)",
        category: "ml",
        description: "A gradient boosting algorithm optimized for categorical features. Uses ordered boosting to reduce target leakage and handles categorical variables natively without manual encoding.",
        range: "Excels with mixed numeric/categorical data",
    },
    "Optuna": {
        title: "Optuna",
        category: "ml",
        description: "An automatic hyperparameter optimization framework. Uses Bayesian optimization with pruning to efficiently search for the best model parameters, reducing tuning time significantly.",
        range: "Finds optimal params faster than grid search",
    },
    "FastAPI": {
        title: "FastAPI",
        category: "tech",
        description: "A modern Python web framework for building APIs with automatic interactive documentation (Swagger UI), request validation via Pydantic, and asynchronous support. Powers all backend endpoints.",
    },
    "scikit-learn": {
        title: "scikit-learn",
        category: "ml",
        description: "A Python library for machine learning providing tools for classification, regression, clustering, dimensionality reduction, and model evaluation. Used for preprocessing, metrics, and baseline models.",
    },
    "OpenRouter": {
        title: "OpenRouter",
        category: "tech",
        description: "A unified API gateway providing access to multiple LLMs (GPT-4o-mini, Claude, Gemini, etc.). Used by FinRisk for AI-powered portfolio insights and the conversational chatbot assistant.",
    },
    "yfinance": {
        title: "yfinance",
        category: "tech",
        description: "A Python library that downloads historical market data from Yahoo Finance. Provides real-time and historical stock prices, indices, commodities, and cryptocurrency data for risk models.",
    },
    "PostgreSQL": {
        title: "PostgreSQL (via Neon)",
        category: "tech",
        description: "A powerful, open-source relational database. FinRisk uses Neon's serverless PostgreSQL for autoscaling, branching, and always-on availability with zero management overhead.",
    },
    "Google OAuth": {
        title: "Google OAuth",
        category: "tech",
        description: "An authentication protocol allowing users to sign in with their Google account. Provides secure, token-based authentication without sharing passwords.",
    },
};

function GlossaryModal({ term, onClose }) {
    const doc = term ? termDocs[term] : null;
    if (!doc) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <FaTimes />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FaBookOpen className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                doc.category === "model" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                                doc.category === "ml" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}>
                                {doc.category === "model" ? "Model Metric" : doc.category === "ml" ? "ML Algorithm" : "Technology"}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{doc.description}</p>
                    {doc.formula && (
                        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Formula</p>
                            <code className="text-sm font-mono text-slate-800 dark:text-slate-200">{doc.formula}</code>
                        </div>
                    )}
                    {doc.range && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Interpretation Range</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{doc.range}</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function DocBadge({ term, onClick }) {
    return (
        <button
            onClick={() => onClick(term)}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
        >
            <FaBookOpen className="text-[9px]" />
            {term}
        </button>
    );
}

function About() {
    const [activeTab, setActiveTab] = useState("overview");
    const [glossaryTerm, setGlossaryTerm] = useState(null);
    const tabs = [
        { key: "overview", label: "Overview", icon: FaRocket },
        { key: "models", label: "Models & Tech", icon: FaFlask },
        { key: "glossary", label: "Glossary", icon: FaBookOpen },
        { key: "opensource", label: "Open Source", icon: FaGithub },
    ];

    return (
        <div>
            <SEO title="About" description="Learn about FinRisk — an AI-powered financial risk management platform built with ML models for credit, market, and portfolio risk analysis." path="/about" />

            {glossaryTerm && <GlossaryModal term={glossaryTerm} onClose={() => setGlossaryTerm(null)} />}

            {/* HERO */}
            <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-700/5 dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-purple-700/10" />
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                            FinRisk
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            We build AI-powered risk tools <br className="hidden sm:block" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">that actually work.</span>
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-3 mt-8"
                    >
                        {["ML-Powered", "Real-time Data", "7 Risk Models", "Live at finrisk.online"].map((tag) => (
                            <span key={tag} className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 pb-24 space-y-20">

                {/* TAB BAR */}
                <div className="flex justify-center -mb-12">
                    <div className="inline-flex bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === tab.key
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                            >
                                <tab.icon className="text-xs" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "overview" && (
                    <>

                {/* STATS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-sm">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* MISSION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        Making financial risk analysis accessible, intelligent, and actionable through
                        machine learning, real-time market data, and intuitive visualizations.
                    </p>
                </motion.div>

                {/* TEAM */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Meet the Team</h2>
                        <p className="text-slate-500 dark:text-slate-400">The people behind FinRisk</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {team.map((member, idx) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                {member.image ? (
                                    /* IMAGE BACKGROUND CARD */
                                    <div className="relative overflow-hidden min-h-[360px]">
                                        <img
                                            src={new URL(`../assets/dev/${member.image}`, import.meta.url).href}
                                            alt={member.name}
                                            className="absolute inset-0 w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20 transition-opacity duration-500" />
                                        <div className="relative min-h-[360px] flex flex-col justify-end p-6">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 + 0.2 }}
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0`}>
                                                        {member.name.split(" ").map(w => w[0]).join("")}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-lg text-white">{member.name}</h3>
                                                        <p className="text-sm text-slate-300">{member.role}</p>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    transition={{ delay: idx * 0.1 + 0.4, duration: 0.4 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-1.5 pt-2 border-t border-white/20">
                                                        {member.contributions.map((c, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 + 0.5 + i * 0.08, duration: 0.3 }}
                                                                className="flex items-start gap-2 text-sm text-slate-200"
                                                            >
                                                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-gradient-to-r ${member.gradient}`} />
                                                                {c}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        </div>
                                    </div>
                                ) : (
                                    /* DEFAULT GRADIENT CARD (for other members) */
                                    <div className="relative h-full min-h-[340px] bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
                                                {member.name.split(" ").map(w => w[0]).join("")}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{member.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-1.5">
                                            {member.contributions.map((c, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.08, duration: 0.3 }}
                                                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                                                >
                                                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-gradient-to-r ${member.gradient}`} />
                                                    {c}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                    </>
                )}

                {activeTab === "models" && (
                    <>

                {/* RISK MODELS */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Risk Models</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Click a metric badge to learn how it measures model performance.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { label: "Credit Risk", acc: "ROC-AUC 0.77", icon: "📊", color: "blue" },
                                { label: "Market Risk (VaR)", acc: "RMSE 0.012", icon: "📈", color: "indigo" },
                                { label: "Business Risk", acc: "96.1% Accuracy", icon: "🏢", color: "emerald" },
                                { label: "Liquidity Risk", acc: "88.9% Accuracy", icon: "💧", color: "cyan" },
                                { label: "Financial Risk", acc: "97.3% Accuracy", icon: "💰", color: "purple" },
                                { label: "E-Commerce Fraud", acc: "XGBoost", icon: "🛡️", color: "rose" },
                            ].map((m) => (
                                <div key={m.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                                    <span className="text-xl mb-2 block">{m.icon}</span>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{m.label}</p>
                                    <div className="mt-1.5">
                                        <DocBadge term={m.acc} onClick={setGlossaryTerm} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* ML ALGORITHMS */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">ML Algorithms</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The machine learning techniques powering our risk models.</p>
                        <div className="flex flex-wrap gap-3">
                            {["XGBoost", "CatBoost", "Optuna", "scikit-learn"].map((algo) => (
                                <button
                                    key={algo}
                                    onClick={() => setGlossaryTerm(algo)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <FaFlask className="text-xs" />
                                    {algo}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* TECH STACK */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Technology</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Click a technology to learn more.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["FastAPI", "PostgreSQL", "OpenRouter", "Google OAuth", "yfinance"].map((tech) => (
                            <button
                                key={tech}
                                onClick={() => setGlossaryTerm(tech)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
                            >
                                <FaLayerGroup className="text-xs text-blue-500" />
                                {tech}
                            </button>
                        ))}
                        {["React", "Vite", "Tailwind", "Python"].map((tech) => (
                            <span
                                key={tech}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-400 dark:text-slate-500 shadow-sm cursor-default"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.section>

                    </>
                )}

                {activeTab === "glossary" && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Glossary</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">All technical terms used across FinRisk, explained.</p>
                            <div className="space-y-1">
                                {Object.entries(termDocs).map(([key, doc]) => (
                                    <button
                                        key={key}
                                        onClick={() => setGlossaryTerm(key)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                                    >
                                        <div className={`p-1.5 rounded-lg ${
                                            doc.category === "model" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                                            doc.category === "ml" ? "bg-purple-100 dark:bg-purple-900/30" :
                                            "bg-blue-100 dark:bg-blue-900/30"
                                        }`}>
                                            <FaBookOpen className={`text-xs ${
                                                doc.category === "model" ? "text-emerald-600 dark:text-emerald-400" :
                                                doc.category === "ml" ? "text-purple-600 dark:text-purple-400" :
                                                "text-blue-600 dark:text-blue-400"
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.description}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                            doc.category === "model" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                                            doc.category === "ml" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        }`}>
                                            {doc.category === "model" ? "Metric" : doc.category === "ml" ? "ML" : "Tech"}
                                        </span>
                                        <FaExternalLinkAlt className="text-xs text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}

                {activeTab === "opensource" && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-sm text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl mb-6">
                                <FaGithub className="text-3xl text-slate-700 dark:text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Open Source</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8">
                                FinRisk is fully open source. Explore the codebase, contribute, report issues, or star the repo on GitHub.
                            </p>
                            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                                    <FaStar className="text-lg text-yellow-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Star</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                                    <FaCodeBranch className="text-lg text-slate-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fork</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                                    <FaEye className="text-lg text-slate-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Watch</p>
                                </div>
                            </div>
                            <a
                                href="https://github.com/AyushSinghRana15/Financial-Risk-Management-System"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg"
                            >
                                <FaGithub className="text-lg" />
                                View on GitHub
                                <FaExternalLinkAlt className="text-xs" />
                            </a>
                        </div>
                    </motion.section>
                )}

                {/* TRY IT CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-10 shadow-xl"
                >
                    <FaRocket className="text-4xl text-white mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Try FinRisk</h2>
                    <p className="text-blue-100 mb-6 max-w-md mx-auto">
                        Explore the live platform — run risk predictions, track your portfolio, and get AI-powered insights.
                    </p>
                    <a
                        href="https://finrisk.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold transition-all hover:bg-blue-50 shadow-lg"
                    >
                        Go to Dashboard <FaExternalLinkAlt className="text-xs" />
                    </a>
                </motion.div>

            </div>
        </div>
    );
}

export default About;
