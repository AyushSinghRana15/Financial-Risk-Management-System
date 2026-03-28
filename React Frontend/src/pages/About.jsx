import { useState, useEffect } from "react";

const features = [
    {
        icon: "📊",
        title: "Risk Analytics Dashboard",
        desc: "Comprehensive portfolio visualization with credit risk, market volatility, and liquidity exposure metrics.",
        color: "blue"
    },
    {
        icon: "🤖",
        title: "AI Insights Engine",
        desc: "ML-powered analysis uncovering hidden risks, pattern detection, and actionable recommendations.",
        color: "purple"
    },
    {
        icon: "📈",
        title: "Market Monitoring",
        desc: "Real-time tracking of stocks, indices, crypto, and commodities via live data feeds.",
        color: "green"
    },
    {
        icon: "💼",
        title: "Portfolio Management",
        desc: "Dynamic allocation insights, performance tracking, and risk-adjusted analysis.",
        color: "yellow"
    }
];

const techStack = [
    { name: "React", color: "blue", glow: "#3b82f6" },
    { name: "Vite", color: "purple", glow: "#8b5cf6" },
    { name: "Tailwind", color: "cyan", glow: "#06b6d4" },
    { name: "FastAPI", color: "green", glow: "#22c55e" },
    { name: "Python", color: "yellow", glow: "#eab308" },
    { name: "PostgreSQL", color: "blue", glow: "#3b82f6" },
    { name: "XGBoost", color: "orange", glow: "#f97316" },
    { name: "OpenRouter", color: "pink", glow: "#ec4899" },
    { name: "Google OAuth", color: "red", glow: "#ef4444" },
    { name: "yfinance", color: "yellow", glow: "#eab308" }
];

const flowSteps = [
    { icon: "👤", label: "User", color: "bg-blue-100 border-blue-300" },
    { icon: "⚛️", label: "React UI", color: "bg-cyan-100 border-cyan-300" },
    { icon: "🔌", label: "API Layer", color: "bg-green-100 border-green-300" },
    { icon: "⚡", label: "FastAPI", color: "bg-emerald-100 border-emerald-300" },
    { icon: "🧠", label: "AI Engine", color: "bg-purple-100 border-purple-300" },
    { icon: "📊", label: "Market Data", color: "bg-yellow-100 border-yellow-300" },
    { icon: "🗄️", label: "Database", color: "bg-indigo-100 border-indigo-300" },
    { icon: "📈", label: "Dashboard", color: "bg-pink-100 border-pink-300" }
];

function About() {
    const [activeFeature, setActiveFeature] = useState(null);
    const [flowStep, setFlowStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hoveredTech, setHoveredTech] = useState(null);

    const playFlow = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setFlowStep(0);
    };

    useEffect(() => {
        if (!isPlaying || flowStep >= flowSteps.length) {
            if (flowStep >= flowSteps.length) {
                setTimeout(() => {
                    setFlowStep(-1);
                    setIsPlaying(false);
                }, 1500);
            }
            return;
        }

        const timer = setTimeout(() => {
            setFlowStep(prev => prev + 1);
        }, 600);

        return () => clearTimeout(timer);
    }, [flowStep, isPlaying]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

            {/* Hero Section - Edge to Edge */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-b-[3rem] shadow-xl -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-10">
                {/* Dot pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                
                {/* Floating Glow orbs */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }}></div>
                
                {/* Shining diagonal animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none"></div>
                </div>
                
                <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium">Powered by AI & Machine Learning</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                        FinRisk
                    </h1>
                    
                    <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        AI-Powered Financial Risk Management System that transforms complex analytics 
                        into actionable insights for smarter investment decisions.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8 pb-12 space-y-16">

                {/* Mission */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🎯</span>
                        Our Mission
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Making financial risk analysis accessible, intelligent, and actionable through 
                        machine learning, real-time market data, and intuitive visualizations.
                    </p>
                </div>

                {/* Key Features - Interactive Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">✨</span>
                        Key Features
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveFeature(activeFeature === idx ? null : idx)}
                                onMouseEnter={() => setActiveFeature(idx)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`
                                    relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer
                                    ${activeFeature === idx 
                                        ? 'border-blue-500 shadow-xl scale-[1.02]' 
                                        : 'border-transparent opacity-80 hover:opacity-100'}
                                `}
                            >
                                <div className={`text-4xl mb-4 transition-transform duration-300 ${activeFeature === idx ? 'scale-110' : ''}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                                <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${activeFeature === idx ? '' : 'line-clamp-2'}`}>
                                    {feature.desc}
                                </p>
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-${feature.color}-500 transition-opacity ${activeFeature === idx ? 'opacity-100' : 'opacity-0'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack - Glowing Badges */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🛠️</span>
                        Technology Stack
                    </h2>
                    
                    <div className="flex flex-wrap gap-3">
                        {techStack.map((tech) => (
                            <div
                                key={tech.name}
                                onMouseEnter={() => setHoveredTech(tech.name)}
                                onMouseLeave={() => setHoveredTech(null)}
                                className={`
                                    px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 cursor-default
                                    ${hoveredTech === tech.name 
                                        ? 'scale-110 shadow-lg' 
                                        : ''}
                                `}
                                style={{
                                    background: hoveredTech === tech.name 
                                        ? `linear-gradient(135deg, ${tech.glow}40, ${tech.glow}20)` 
                                        : 'rgba(255,255,255,0.1)',
                                    border: `1px solid ${hoveredTech === tech.name ? tech.glow : 'transparent'}`,
                                    boxShadow: hoveredTech === tech.name ? `0 0 20px ${tech.glow}40` : 'none'
                                }}
                            >
                                <span className="text-white">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Animated Architecture Flow */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🔄</span>
                            Architecture Flow
                        </h2>
                        <button
                            onClick={playFlow}
                            disabled={isPlaying}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                                ${isPlaying 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'}`}
                        >
                            {isPlaying ? 'Playing...' : '▶ Play Flow'}
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {flowSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div
                                    className={`
                                        px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-500
                                        ${flowStep >= idx 
                                            ? `${step.color} border-current shadow-lg scale-110` 
                                            : 'bg-gray-100 border-gray-200 text-gray-400'}
                                    `}
                                >
                                    <span className="mr-2">{step.icon}</span>
                                    {step.label}
                                </div>
                                {idx < flowSteps.length - 1 && (
                                    <span className={`text-gray-400 transition-all ${flowStep > idx ? 'opacity-100 scale-110' : 'opacity-30'}`}>→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why FinRisk */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative">
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                            <span className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">💡</span>
                            Why FinRisk?
                        </h2>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                            Bridging the gap between complex financial analytics and intelligent decision-making. 
                            Combine real-time market data, AI-driven insights, and intuitive visualizations 
                            to proactively manage risk and optimize portfolio performance.
                        </p>
                    </div>
                </div>

                {/* GitHub CTA */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Explore the Source</h2>
                            <p className="text-gray-400">
                                Full-stack application with React, FastAPI, ML models, and AI integration
                            </p>
                        </div>
                        <a
                            href="https://github.com/AyushSinghRana15/Financial-Risk-Management-System"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            View on GitHub
                            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default About;
