import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaExternalLinkAlt, FaQuoteLeft } from "react-icons/fa";
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

function About() {
    return (
        <div>
            <SEO title="About" description="Learn about FinRisk — an AI-powered financial risk management platform built with ML models for credit, market, and portfolio risk analysis." path="/about" />
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
                        {["ML-Powered", "Real-time Data", "7 Risk Models", "Open Source"].map((tag) => (
                            <span key={tag} className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 pb-24 space-y-20">

                {/* STATS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
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
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
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
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
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
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
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
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
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
                                                    whileInView={{ height: "auto", opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: idx * 0.1 + 0.4, duration: 0.4 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-1.5 pt-2 border-t border-white/20">
                                                        {member.contributions.map((c, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                viewport={{ once: true }}
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
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
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

                {/* WHAT WE BUILT */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Risk Models</h2>
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
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.acc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* TECH STACK */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Technology</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            "React", "Vite", "Tailwind", "FastAPI", "Python",
                            "PostgreSQL", "XGBoost", "CatBoost", "scikit-learn",
                            "OpenRouter", "Google OAuth", "yfinance",
                        ].map((tech) => (
                            <span
                                key={tech}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-default"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* GITHUB CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 shadow-xl"
                >
                    <FaGithub className="text-4xl text-white mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Open Source</h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        FinRisk is open source. Contribute, fork, or just explore the code.
                    </p>
                    <a
                        href="https://github.com/AyushSinghRana15/Financial-Risk-Management-System"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20"
                    >
                        View on GitHub <FaExternalLinkAlt className="text-xs" />
                    </a>
                </motion.div>

            </div>
        </div>
    );
}

export default About;
